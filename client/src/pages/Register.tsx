import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

interface RegistrationFormData {
  email: string;
  password: string;
}

export const Register: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<RegistrationFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: RegistrationFormData) => {
    if (!data.email || !data.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email and password are required"
      });
      return;
    }

    console.log('Registration form submitted with data:', data);
    setSubmitting(true);
    try {
      console.log('Sending registration request to server...');
      await registerAuth(data.email, data.password);
      console.log('Registration successful');

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Account created successfully',
      });
      console.log('Navigating to niche selection...');
      navigate('/niche-selection');
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 && error.response.data.error === 'User with this email already exists') {
          setError('email', {
            type: 'manual',
            message: 'An account with this email already exists. Please use a different email or try logging in.'
          });
          // Reset the form when email already exists
          reset({ email: '', password: '' });
        } else {
          console.error('Registration failed', error.response.data);
          setError('root', {
            type: 'manual',
            message: error.response.data.error || 'Registration failed. Please try again.'
          });
        }
      } else {
        console.error('Unexpected error', error);
        setError('root', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again later.'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                })}
                type="email"
                placeholder="Enter your email"
                disabled={submitting}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long"
                  }
                })}
                type="password"
                placeholder="Choose a password"
                disabled={submitting}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate('/login')}
              disabled={submitting}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const RegisterPage: React.FC = () => (
  <ErrorBoundary>
    <Register />
  </ErrorBoundary>
);

export default RegisterPage;
