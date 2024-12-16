'use client';

import { useState } from 'react';
import { useEmailDomains } from '@/hooks/data/useEmailDomains';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { EmailDomainWithVerifications } from '@/types/supabase';

interface EmailDomainSettingsProps {
  workspaceId: string;
}

export function EmailDomainSettings({ workspaceId }: EmailDomainSettingsProps) {
  const [newDomain, setNewDomain] = useState('');
  const [domains, setDomains] = useState<EmailDomainWithVerifications[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    addEmailDomain,
    getEmailDomains,
    verifyEmailDomain,
    deleteEmailDomain,
    configureEmailServer,
    getDNSRecords
  } = useEmailDomains(workspaceId);

  const handleAddDomain = async () => {
    try {
      setIsLoading(true);
      const domain = await addEmailDomain(newDomain);
      const records = await getDNSRecords(domain.id);
      toast({
        title: 'Domain added successfully',
        description: 'Please configure your DNS records to verify the domain.',
      });
      setNewDomain('');
      refreshDomains();
    } catch (error) {
      toast({
        title: 'Error adding domain',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setIsLoading(true);
      const status = await verifyEmailDomain(domainId);
      if (status.all_verified) {
        toast({
          title: 'Domain verified successfully',
          description: 'Your domain is now ready to use.',
        });
      } else {
        toast({
          title: 'Domain verification failed',
          description: 'Please check your DNS records and try again.',
          variant: 'destructive',
        });
      }
      refreshDomains();
    } catch (error) {
      toast({
        title: 'Error verifying domain',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      setIsLoading(true);
      await deleteEmailDomain(domainId);
      toast({
        title: 'Domain deleted successfully',
        description: 'The domain has been removed from your workspace.',
      });
      refreshDomains();
    } catch (error) {
      toast({
        title: 'Error deleting domain',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDomains = async () => {
    try {
      const domains = await getEmailDomains();
      setDomains(domains);
    } catch (error) {
      toast({
        title: 'Error loading domains',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Domain Settings</CardTitle>
          <CardDescription>
            Manage custom email domains for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="domain">Add New Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddDomain}
                disabled={isLoading || !newDomain}
              >
                Add Domain
              </Button>
            </div>

            <div className="space-y-4">
              {domains.map((domain) => (
                <Card key={domain.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{domain.domain_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {domain.verified ? 'Verified' : 'Pending verification'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={isLoading || domain.verified}
                        >
                          Verify
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isLoading}>
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this domain? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDomain(domain.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
