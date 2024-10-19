'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { use, useEffect, useState } from 'react';
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons';
import { createApiClient, insertNewUser, signInUserWithToken, updateUser } from '@/utils/supabase/api';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '../ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthState, StateInfo } from '@/utils/types';
import { userExistsById } from '@/utils/supabase/queries';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export function AuthForm({ state }: { state: AuthState }) {
  const [ auth, setAuth ] = useState(false);   
  const { toast } = useToast();
  const api = createApiClient(createClient());
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authState, setAuthState] = useState(state);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const stateInfo: Record<AuthState, StateInfo> = {
    signup: {
      title: 'Sign Up',
      submitText: 'Sign Up',
      hasEmailField: true,
      hasPasswordField: true,
      hasOAuth: false,
      onSubmit: async () => {
        setLoading(true);
        try {
          const { user } = await api.passwordSignup({ email, password });
          await api.passwordSignin({ email, password });
          if (user) {
            await checkAndUpdateUser(user.user_metadata.session);
          }
          router.refresh();
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    },
    signin: {
      title: 'Sign In',
      submitText: 'Sign In',
      hasEmailField: true,
      hasPasswordField: true,
      hasOAuth: true,
      onSubmit: async () => {
        setLoading(true);
        try {
          const { user } = await api.passwordSignin({ email, password });
          if (user) {
            await checkAndUpdateUser(user);
          }
          router.refresh();
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    },
    forgot_password: {
      title: 'Reset Password',
      submitText: 'Send Email',
      hasEmailField: true,
      hasPasswordField: false,
      hasOAuth: false,
      onSubmit: async () => {
        setLoading(true);
        try {
          await api.passwordReset(email);
          toast({
            title: 'Email Sent!',
            description: 'Check your email to reset your password'
          });
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    },
    update_password: {
      title: 'Update Password',
      submitText: 'Update Password',
      hasEmailField: false,
      hasPasswordField: true,
      hasOAuth: false,
      onSubmit: async () => {
        setLoading(true);
        try {
          await api.passwordUpdate(password);
          toast({
            title: 'Password Updated',
            description: 'Redirecting to the home page...'
          });
          setTimeout(() => router.replace('/'), 3000);
          router.replace('/');
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    }
  };

  // add toast if error
  useEffect(() => {
    type ToastVariant = 'destructive' | 'default' | undefined | null;
    const title = searchParams.get('toast_title') || undefined;
    const description = searchParams.get('toast_description') || undefined;
    const variant = searchParams.get('toast_variant') as ToastVariant;
    if (title || description) {
      setTimeout(
        () =>
          toast({
            title,
            description,
            variant
          }),
        100
      );
    }
  }, []);

// Existing checkAndUpdateUser function (already using alerts)
const checkAndUpdateUser = async (session: User | null) => {
  if (!session) {
    alert("No user found in session");
    return;
  }
  
  try {
    alert(`Checking if user exists: ${session.id}`);
    const { user, error } = await userExistsById(session.id);

    if (error) {
      alert(`Error checking user: ${error.message}`);
      return;
    }

    if (!user) {
      alert("User not found, inserting new user...");
      const { data, error: insertError } = await insertNewUser(session);

      if (insertError) {
        alert(`Error adding user: ${insertError.message}`);
        return;
      }

      alert(`Inserted new user: ${JSON.stringify(data)}`);
    } else {
      alert("User found, updating user...");
      const { user: updatedUser, error: updateError } = await updateUser(session);

      if (updateError) {
        alert(`Error updating user: ${updateError.message}`);
        return;
      }

      alert(`Updated user: ${JSON.stringify(updatedUser)}`);
    }
  } catch (error) {
    alert(`Unexpected error in checkAndUpdateUser: ${JSON.stringify(error)}`);
  }
};

// Modified handleGoogleSignIn function with alerts instead of console.log
const handleGoogleSignIn = async () => {
  alert("Starting Google Sign-In process"); // Added alert at the beginning
  try {
    const { data, error } = await api.oauthSignin('google');
    if (error) {
      alert(`Error during Google sign-in: ${error}`);
      return;
    }

    alert("Google Sign-In successful, fetching user data"); // Added alert after successful sign-in

    // Wait for the user data to be available
    let userData;
    let attempts = 0;
    const maxAttempts = 5;
    do {
      attempts++;
      const { data: userDataResult, error: userError } = await supabase.auth.getUser();
      if (userError) {
        alert(`Error fetching user data: ${userError.message}`);
        return;
      }
      userData = userDataResult;
      if (!userData || !userData.user) {
        alert(`Attempt ${attempts}: User data not available yet`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }
    } while ((!userData || !userData.user) && attempts < maxAttempts);

    if (!userData || !userData.user) {
      alert("Failed to fetch user data after multiple attempts");
      return;
    }

    alert(`User data fetched successfully: ${JSON.stringify(userData.user)}`); // Added alert after fetching user data

    // Now that we have the user data, call checkAndUpdateUser
    await checkAndUpdateUser(userData.user);

    // Refresh the page or update the UI as needed
    alert("Sign-in process completed, refreshing page");
    router.refresh();
  } catch (error) {
    alert(`Unexpected error in handleGoogleSignIn: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};

  const currState = stateInfo[authState];
  return (
    <Card className="mx-auto w-96 mx-4">
      <CardHeader>
        <CardTitle className="text-2xl">{currState.title}</CardTitle>
        {currState.description && (
          <CardDescription>{currState.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {currState.hasEmailField && (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}
          {currState.hasPasswordField && (
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {authState === 'signin' && (
                  <Link
                    href="#"
                    onClick={() => setAuthState(AuthState.ForgotPassword)}
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                disabled={loading}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            onClick={currState.onSubmit}
            disabled={loading}
          >
            {currState.submitText}
          </Button>
          {authState === 'signin' && (
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="#"
                className="underline"
                onClick={() => setAuthState(AuthState.Signup)}
              >
                Sign up
              </Link>
            </div>
          )}
          {authState === 'signup' && (
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link
                href="#"
                className="underline"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                Sign in
              </Link>
            </div>
          )}
          {authState === 'forgot_password' && (
            <div className="text-center text-sm">
              Know your password?{' '}
              <Link
                href="#"
                className="underline"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                Sign in
              </Link>
            </div>
          )}
          {currState.hasOAuth && (
            <>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGoogleSignIn()}
              >
                <SiGoogle className="h-4 w-4 mr-2" /> Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => api.oauthSignin('github')}
              >
                <SiGithub className="h-4 w-4 mr-2" /> Github
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
