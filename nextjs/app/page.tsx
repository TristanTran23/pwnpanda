'use client';

import { About } from '@/components/landing/About';
import { Cta } from '@/components/landing/Cta';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Navbar } from '@/components/landing/Navbar';
import { Newsletter } from '@/components/landing/Newsletter';
import { Pricing } from '@/components/landing/Pricing';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { Services } from '@/components/landing/Services';
import { Sponsors } from '@/components/landing/Sponsors';
import { Team } from '@/components/landing/Team';
import { Testimonials } from '@/components/landing/Testimonials';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { use, useEffect, useState } from 'react';
4

export default async function LandingPage() {
  const supabase = createClient();
  const [supabaseUser, setSupabaseUser] = useState<User | null>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
      console.log(user);
    };

    fetchUser();
  }, []);

  return (
    <>
      <Navbar user={supabaseUser as any} />
      <Hero user={supabaseUser as any}/>
      {/* <Sponsors /> */}
      {/* <About /> */}
      {/* <HowItWorks /> */}
      {/* <Features /> */}
      {/* <Services /> */}
      <Cta />
      {/* <Testimonials /> */}
      {/* <Team /> */}
      {/* <Pricing user={user} /> */}
      {/* <Newsletter /> */}
      {/* <FAQ /> */}
      {/* <Footer /> */}
      {/* <ScrollToTop /> */}
    </>
  );
}
