import { User } from "@supabase/supabase-js";
import { Navbar } from "../landing/Navbar";

export default function ChatPage({ user }: { user: User }) {
  return (
    <>
      <Navbar user={user} />
      <div>chat page</div>
    </>
  )
}