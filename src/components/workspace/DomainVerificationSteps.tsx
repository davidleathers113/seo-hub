'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useEmailDomains } from '@/hooks/data/useEmailDomains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Circle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { VerificationStatus } from '@/types/supabase';

interface DomainVerificationStepsProps {
  workspaceId: string;
  domainId: string;
  domainName: string;
  onVerificationComplete?: () => void;
}

export function DomainVerificationSteps({
  workspaceId,
  domainId,
  domainName,
  onVerificationComplete
}: DomainVerificationStepsProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<VerificationStatus>({
    mx_verified: false,
    spf_verified: false,
    dkim_verified: false,
    all_verified: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const { verifyEmailDomain, getDNSRecords } = useEmailDomains(workspaceId);

  const steps = [
    {
      title: t('domain.verification.mx_records'),
      description: t('domain.verification.mx_description'),
      verified: status.mx_verified,
      type: 'MX',
    },
    {
      title: t('domain.verification.spf_records'),
      description: t('domain.verification.spf_description'),
      verified: status.spf_verified,
      type: 'SPF',
    },
    {
      title: t('domain.verification.dkim_records'),
      description: t('domain.verification.dkim_description'),
      verified: status.dkim_verified,
      type: 'DKIM',
    },
  ];

  const verificationProgress = Math.round(
    ((status.mx_verified ? 1 : 0) +
     (status.spf_verified ? 1 : 0) +
     (status.dkim_verified ? 1 : 0)) / 3 * 100
  );

  const checkVerification = async () => {
    try {
      setIsLoading(true);
      const verificationStatus = await verifyEmailDomain(domainId);
      setStatus(verificationStatus);

      if (verificationStatus.all_verified) {
        toast({
          title: t('success.domain_verified'),
          description: t('success.domain_verified_description'),
        });
        onVerificationComplete?.();
      }
    } catch (error) {
      toast({
        title: t('errors.verification_check_failed'),
        description: t('errors.try_again_later'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    checkVerification();
  }, [domainId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('domain.verification.title')}</CardTitle>
        <CardDescription>
          {t('domain.verification.description', { domain: domainName })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('domain.verification.progress', { progress: verificationProgress })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={checkVerification}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t('actions.check_status')}
              </Button>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="mt-1">
                  {step.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isInitialLoad ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : status.all_verified === false ? (
                    <Circle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="text-sm font-medium">
                    {t('domain.verification.status')}:{' '}
                    <span
                      className={
                        step.verified
                          ? 'text-green-500'
                          : 'text-yellow-500'
                      }
                    >
                      {step.verified ? t('status.verified') : t('status.pending')}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {status.all_verified && (
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('domain.verification.success_message')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
