import { Convo } from '@/types/convo.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { supabase } from '../supabase';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .order('created', { ascending: false })
    .limit(1)
    .maybeSingle();
  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });
  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

export const createConversation = cache(async (supabase: SupabaseClient, convo: Omit<Convo, 'id'>) => {
  const { data, error } = await supabase
    .from('conversation')
    .insert([
      {
        userId: convo.userId,
        content: convo.content,
        title: convo.title || "Untitled",
      }
    ])
    .select('*')
    .single();
  if (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
  return { data, error };
});

export const getConversations = cache(async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('conversation')
    .select('*')
    .eq('userId', userId)
    // .order('createdAt', { ascending: false });
    
  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }

  return { data, error };
});

export const updateConversation = cache(async (supabase: SupabaseClient, conversationId: string, newContent: string) => {
  const { data, error } = await supabase
    .from('conversation')
    .update({ content: newContent })
    .eq('id', conversationId)
    .select('*')
    .single();

  if (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
  return { data, error };
});