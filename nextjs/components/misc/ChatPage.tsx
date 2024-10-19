import { User } from "@supabase/supabase-js";
import { Navbar } from "../landing/Navbar";
import SecurityAdvisor from "./SecurityAdvisor";

export default function ChatPage({ user }: { user: User }) {
  return (
    <>
      <Navbar user={user} />
      <SecurityAdvisor />
    </>
  )
}