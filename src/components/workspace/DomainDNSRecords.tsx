'use client';

import { useEffect, useState } from 'react';
import { useEmailDomains } from '@/hooks/data/useEmailDomains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';

interface DomainDNSRecordsProps {
  workspaceId: string;
  domainId: string;
}

interface DNSRecord {
  type: string;
  host: string;
  value: string;
  priority?: number;
}

export function DomainDNSRecords({ workspaceId, domainId }: DomainDNSRecordsProps) {
  const [dnsRecords, setDNSRecords] = useState<Record<string, DNSRecord>>();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    mx_verified: false,
    spf_verified: false,
    dkim_verified: false,
    all_verified: false
  });
  const { toast } = useToast();
  const { getDNSRecords, verifyEmailDomain } = useEmailDomains(workspaceId);

  useEffect(() => {
    loadDNSRecords();
    checkVerification();
  }, [domainId]);

  const loadDNSRecords = async () => {
    try {
      const records = await getDNSRecords(domainId);
      setDNSRecords(records);
    } catch (error) {
      toast({
        title: 'Error loading DNS records',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const checkVerification = async () => {
    try {
      setIsLoading(true);
      const status = await verifyEmailDomain(domainId);
      setVerificationStatus(status);
    } catch (error) {
      toast({
        title: 'Error checking verification',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'DNS record has been copied.',
    });
  };

  const renderVerificationStatus = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (!dnsRecords) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DNS Records</CardTitle>
        <CardDescription>
          Configure these DNS records with your domain provider to enable email functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={checkVerification}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Verify Records
            </Button>
          </div>

          {Object.entries(dnsRecords).map(([key, record]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium capitalize">{key} Record</h3>
                {key === 'mx' && renderVerificationStatus(verificationStatus.mx_verified)}
                {key === 'spf' && renderVerificationStatus(verificationStatus.spf_verified)}
                {key === 'dkim' && renderVerificationStatus(verificationStatus.dkim_verified)}
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p>{record.type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Host:</span>
                        <p>{record.host}</p>
                      </div>
                      {record.priority && (
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <p>{record.priority}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <code className="flex-1 rounded bg-muted px-2 py-1">
                        {record.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(record.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}