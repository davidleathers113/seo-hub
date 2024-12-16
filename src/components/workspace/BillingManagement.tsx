'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';

interface BillingManagementProps {
  stripePublicKey: string;
}

export function BillingManagement({ stripePublicKey }: BillingManagementProps) {
  const {
    workspace,
    getSubscriptionPlans,
    getCurrentSubscription,
    subscribeToPlan,
    cancelSubscription,
    updatePaymentMethod,
  } = useWorkspace();

  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, [workspace]);

  const loadBillingData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription()
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await subscribeToPlan(planId, isYearly);
      await loadBillingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (atPeriodEnd: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelSubscription(atPeriodEnd);
      await loadBillingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stripe = await loadStripe(stripePublicKey);
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: stripeError } = await stripe.redirectToCheckout({
        mode: 'setup',
        customerId: currentSubscription?.stripe_customer_id,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      if (stripeError) throw stripeError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <Tabs defaultValue="plans" className="w-full">
      <TabsList>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="subscription">Current Subscription</TabsTrigger>
        <TabsTrigger value="payment">Payment Method</TabsTrigger>
      </TabsList>

      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
            <div className="flex items-center space-x-2">
              <span>Monthly</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
              >
                {isYearly ? 'Switch to Monthly' : 'Switch to Yearly'}
              </Button>
              <span>Yearly (Save 20%)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-2xl font-bold">
                      ${isYearly ? plan.price_yearly / 12 : plan.price_monthly}/mo
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Object.entries(plan.features).map(([feature, value]) => (
                        <li key={feature} className="flex items-center space-x-2">
                          <span>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading || plan.id === currentSubscription?.plan_id}
                    >
                      {plan.id === currentSubscription?.plan_id
                        ? 'Current Plan'
                        : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Manage your current subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {plans.find(p => p.id === currentSubscription.plan_id)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.status === 'active' ? (
                        <>
                          Next billing date:{' '}
                          {format(
                            new Date(currentSubscription.current_period_end),
                            'MMMM d, yyyy'
                          )}
                        </>
                      ) : (
                        `Status: ${currentSubscription.status}`
                      )}
                    </p>
                  </div>
                  <Badge variant={currentSubscription.status === 'active' ? 'default' : 'destructive'}>
                    {currentSubscription.status}
                  </Badge>
                </div>

                {currentSubscription.status === 'active' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelSubscription(true)}
                    disabled={isLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No active subscription</AlertTitle>
                <AlertDescription>
                  Choose a plan to get started with our premium features.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSubscription?.stripe_customer_id ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Current payment method on file</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleUpdatePaymentMethod}
                  disabled={isLoading}
                >
                  Update Payment Method
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No payment method</AlertTitle>
                <AlertDescription>
                  Add a payment method to subscribe to a plan.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Tabs>
  );
}