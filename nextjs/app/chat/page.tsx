import ChatPage from '@/components/misc/ChatPage';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';

export default async function Chat() {
  const supabase = createClient();
  const [user] = await Promise.all([
    getUser(supabase),
  ]);

  if (!user) {
    return redirect('/auth/signin');
  }

  return <ChatPage user={user} supabase={supabase}/>;
}
