'use client';

import { useState, useEffect } from 'react';
import { useEmailDomains } from '@/hooks/data/useEmailDomains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface ForwardingRule {
  id: string;
  source: string;
  destination: string;
  created_at: string;
  is_active: boolean;
}

interface ForwardingRulesListProps {
  workspaceId: string;
  domainId: string;
  domainName: string;
}

export function ForwardingRulesList({ workspaceId, domainId, domainName }: ForwardingRulesListProps) {
  const { t } = useTranslation();
  const [rules, setRules] = useState<ForwardingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getForwardingRules, deleteForwardingRule, toggleForwardingRule } = useEmailDomains(workspaceId);

  const loadRules = async () => {
    try {
      setIsLoading(true);
      const rulesData = await getForwardingRules(domainId);
      setRules(rulesData);
    } catch (error) {
      toast({
        title: t('errors.load_rules_failed'),
        description: t('errors.try_again_later'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      setIsLoading(true);
      await deleteForwardingRule(domainId, ruleId);
      toast({
        title: t('success.rule_deleted'),
        description: t('success.rule_deleted_description'),
      });
      await loadRules();
    } catch (error) {
      toast({
        title: t('errors.delete_rule_failed'),
        description: t('errors.try_again_later'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      await toggleForwardingRule(domainId, ruleId, !currentStatus);
      toast({
        title: t(currentStatus ? 'success.rule_disabled' : 'success.rule_enabled'),
        description: t(currentStatus ? 'success.rule_disabled_description' : 'success.rule_enabled_description'),
      });
      await loadRules();
    } catch (error) {
      toast({
        title: t('errors.update_rule_failed'),
        description: t('errors.try_again_later'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [domainId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('domain.forwarding_rules.title')}</CardTitle>
        <CardDescription>
          {t('domain.forwarding_rules.description', { domain: domainName })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('domain.forwarding_rules.empty')}</p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {rule.source}@{domainName} → {rule.destination}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('domain.forwarding_rules.created_on', {
                      date: new Date(rule.created_at).toLocaleDateString()
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRule(rule.id, rule.is_active)}
                    disabled={isLoading}
                  >
                    {rule.is_active ? t('actions.disable') : t('actions.enable')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('domain.forwarding_rules.delete_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('domain.forwarding_rules.delete_description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          {t('actions.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}