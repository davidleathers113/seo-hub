'use client';

import { useState } from 'react';
import { useEmailDomains } from '@/hooks/data/useEmailDomains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface EmailForwardingProps {
  workspaceId: string;
  domainId: string;
  domainName: string;
}

export function EmailForwarding({ workspaceId, domainId, domainName }: EmailForwardingProps) {
  const [sourceAddress, setSourceAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { createEmailForwarding } = useEmailDomains(workspaceId);

  const handleCreateForwarding = async () => {
    try {
      setIsLoading(true);
      await createEmailForwarding(domainId, sourceAddress, destinationAddress);
      toast({
        title: 'Email forwarding created',
        description: 'The forwarding rule has been set up successfully.',
      });
      setSourceAddress('');
      setDestinationAddress('');
    } catch (error) {
      toast({
        title: 'Error creating forwarding rule',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidSourceAddress = (address: string) => {
    const [localPart] = address.split('@');
    return localPart && localPart.length > 0;
  };

  const getFullSourceAddress = () => {
    return sourceAddress ? `${sourceAddress}@${domainName}` : '';
  };

  const canCreateForwarding = () => {
    return (
      isValidSourceAddress(sourceAddress) &&
      isValidEmail(destinationAddress) &&
      !isLoading
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Forwarding</CardTitle>
        <CardDescription>
          Set up email forwarding rules for your domain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceAddress">Forward From</Label>
            <div className="flex items-center gap-2">
              <Input
                id="sourceAddress"
                placeholder="sales"
                value={sourceAddress}
                onChange={(e) => setSourceAddress(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">@{domainName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the local part of the email address (before @)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationAddress">Forward To</Label>
            <Input
              id="destinationAddress"
              type="email"
              placeholder="destination@example.com"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleCreateForwarding}
              disabled={!canCreateForwarding()}
              className="w-full"
            >
              Create Forwarding Rule
            </Button>
          </div>

          {sourceAddress && destinationAddress && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm text-muted-foreground">
                Emails sent to <span className="font-mono">{getFullSourceAddress()}</span>{' '}
                will be forwarded to <span className="font-mono">{destinationAddress}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}