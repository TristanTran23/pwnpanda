import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { createApiClient } from '@/utils/supabase/api';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '../ui/use-toast';

export function AuthForm() {
  const { toast } = useToast();
  const api = createApiClient(createClient());
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Trigger sign-in multiple times with a small delay between attempts
      for (let i = 0; i < 8; i++) {
        await api.oauthSignin('google');
        await delay(50); // 50ms delay between attempts
      }

      // After sign-in attempts, check for session
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session is set, redirect or update UI
          router.push('/chat'); // Replace with your desired route
        } else {
          // If session isn't set yet, check again after a short delay
          setTimeout(checkSession, 500);
        }
      };

      checkSession();
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: 'Auth Error',
          description: e.message,
          variant: 'destructive'
        });
      }
      setLoading(false);
    }
  };

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
  }, [searchParams, toast]);

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