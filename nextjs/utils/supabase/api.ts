import { Database } from '@/types_db';
import {
  Provider,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SupabaseClient,
  User
} from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { userExistsById } from './queries';

export const createApiClient = (supabase: SupabaseClient<Database>) => {
  const passwordSignup = async (creds: SignUpWithPasswordCredentials) => {
    const res = await supabase.auth.signUp(creds);
    if (res.error) throw res.error;
    return res.data;
  };

  const passwordSignin = async (creds: SignInWithPasswordCredentials) => {
    const res = await supabase.auth.signInWithPassword(creds);
    if (res.error) throw res.error;
    return res.data;
  };

  const passwordReset = async (email: string) => {
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getURL('/api/reset_password')
    });
    console.log(res);
    if (res.error) throw res.error;
    return res.data;
  };

  const passwordUpdate = async (password: string) => {
    const res = await supabase.auth.updateUser({ password });
    if (res.error) throw res.error;
    return res.data;
  };

  const oauthSignin = async (provider: Provider) => {
    const res = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getURL('/api/auth_callback')
      }
    });
    if (res.error) throw res.error;
    return res.data;
  };

  const signOut = async () => {
    const res = await supabase.auth.signOut();
    if (res.error) throw res.error;
    return res;
  };

  return {
    passwordSignin,
    passwordSignup,
    passwordReset,
    passwordUpdate,
    oauthSignin,
    signOut,
  };
};

export const insertNewUser = async (user: User) => {
  alert(`Attempting to insert new user: ${JSON.stringify(user)}`);
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          username: user.email,
          email: user.email,
        }
      ])
      .select('*')
      .single();

    if (error) {
      alert(`Error inserting new user: ${JSON.stringify(error)}`);
      return { data: null, error };
    }

    alert(`Successfully inserted new user: ${JSON.stringify(data)}`);
    return { data, error: null };
  } catch (err) {
    alert(`Unexpected error in insertNewUser: ${JSON.stringify(err)}`);
    return { data: null, error: err as Error };
  }
};

export const updateUser = async (session: User) => {
  const { data, error } = await supabase
    .from("users")
    .update({
      email: session.email,
      name: session.user_metadata.full_name,
    })
    .eq("id", session.id)
    .select("*");

  return { user: data, error };
};

export const signInUserWithToken = async (token: string) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: token,
  });

  return { data, error };
};