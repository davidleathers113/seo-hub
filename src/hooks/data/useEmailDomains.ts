import { useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { EmailDomain, EmailDomainVerification, EmailDomainWithVerifications, EmailDomainSetupStatus } from '@/types/email-domain';

export function useEmailDomains(workspaceId: string) {
  const supabase = useSupabaseClient();

  const addEmailDomain = useCallback(async (domainName: string) => {
    // Generate DKIM keypair
    const { data: keys, error: keyError } = await supabase
      .rpc('generate_dkim_keypair');

    if (keyError) throw keyError;

    // Add email domain
    const { data: domain, error } = await supabase
      .from('email_domains')
      .insert({
        workspace_id: workspaceId,
        domain_name: domainName,
        dkim_selector: 'mail',
        dkim_private_key: keys.private_key,
        dkim_public_key: keys.public_key,
        mx_record: `10 mx.${domainName}`,
        spf_record: 'v=spf1 include:_spf.yourdomain.com ~all'
      })
      .select()
      .single();

    if (error) throw error;

    // Add verification records
    const verifications = [
      {
        verification_type: 'MX',
        verification_value: `10 mx.${domainName}`,
      },
      {
        verification_type: 'SPF',
        verification_value: 'v=spf1 include:_spf.yourdomain.com ~all',
      },
      {
        verification_type: 'DKIM',
        verification_value: keys.public_key,
      },
    ];

    const { error: verificationError } = await supabase
      .from('email_domain_verifications')
      .insert(
        verifications.map(v => ({
          email_domain_id: domain.id,
          ...v
        }))
      );

    if (verificationError) throw verificationError;

    return domain;
  }, [supabase, workspaceId]);

  const getEmailDomains = useCallback(async () => {
    const { data, error } = await supabase
      .from('email_domains')
      .select(`
        *,
        verifications:email_domain_verifications(*)
      `)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (error) throw error;
    return data as EmailDomainWithVerifications[];
  }, [supabase, workspaceId]);

  const verifyEmailDomain = useCallback(async (domainId: string) => {
    const { data, error } = await supabase
      .rpc('check_domain_dns_records', { domain_id: domainId });

    if (error) throw error;
    return data as EmailDomainSetupStatus;
  }, [supabase]);

  const deleteEmailDomain = useCallback(async (domainId: string) => {
    const { error } = await supabase
      .from('email_domains')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', domainId);

    if (error) throw error;
  }, [supabase]);

  const configureEmailServer = useCallback(async (domainId: string) => {
    const { data, error } = await supabase
      .rpc('configure_email_server', { domain_id: domainId });

    if (error) throw error;
    return data;
  }, [supabase]);

  const createEmailForwarding = useCallback(async (
    domainId: string,
    sourceAddress: string,
    destinationAddress: string
  ) => {
    const { data, error } = await supabase
      .rpc('create_email_forwarding_rule', {
        domain_id: domainId,
        source_address: sourceAddress,
        destination_address: destinationAddress
      });

    if (error) throw error;
    return data;
  }, [supabase]);

  const getDNSRecords = useCallback(async (domainId: string) => {
    const { data: domain, error } = await supabase
      .from('email_domains')
      .select(`
        *,
        verifications:email_domain_verifications(*)
      `)
      .eq('id', domainId)
      .single();

    if (error) throw error;

    return {
      mx: {
        type: 'MX',
        host: '@',
        value: domain.mx_record,
        priority: 10
      },
      spf: {
        type: 'TXT',
        host: '@',
        value: domain.spf_record
      },
      dkim: {
        type: 'TXT',
        host: `${domain.dkim_selector}._domainkey`,
        value: domain.dkim_public_key
      }
    };
  }, [supabase]);

  return {
    addEmailDomain,
    getEmailDomains,
    verifyEmailDomain,
    deleteEmailDomain,
    configureEmailServer,
    createEmailForwarding,
    getDNSRecords
  };
}