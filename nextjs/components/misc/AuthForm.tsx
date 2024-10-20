'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { createApiClient } from '@/utils/supabase/api';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '../ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export function AuthForm() {
  const { toast } = useToast();
  const api = createApiClient(createClient());
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Trigger sign-in 20 times with a small delay between attempts
      for (let i = 0; i < 20; i++) {
        await api.oauthSignin('google');
        await delay(50); // 50ms delay between attempts
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

  return (
    <Card className="mx-auto w-96 mx-4">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In / Sign Up</CardTitle>
        <CardDescription>Use your Google account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <SiGoogle className="h-4 w-4 mr-2" /> Continue with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}