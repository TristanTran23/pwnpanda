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
import { createClient } from '@/utils/supabase/server';4
import { GoogleOAuthProvider } from "@react-oauth/google"

export default async function LandingPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <>
      <GoogleOAuthProvider clientId='752130935159-gdrugak3jlpsujl2cqhiu13n3frd6t0u.apps.googleusercontent.com'>
        <Navbar user={user} />
        <Hero />
        <Sponsors />
        <About />
        <HowItWorks />
        <Features />
        <Services />
        <Cta />
        <Testimonials />
        <Team />
        <Pricing user={user} />
        <Newsletter />
        <FAQ />
        <Footer />
        <ScrollToTop />
      </GoogleOAuthProvider>
    </>
  );
}
