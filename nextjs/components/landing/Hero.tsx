'use client';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { HeroCards } from './HeroCards';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image'
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Hero = ({ user }: { user: User | null }) => {
  const router = useRouter();

  const handleClick = () => {
    if (user) {
      router.push('/chat');
    } else {
      router.push('/auth');
    }
  }

  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-10 gap-10">
      <Image
        src="/full-body-light.png"
        alt="PwnPanda Logo"
        width={600}
        height={600}
      />
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            Your{' '}
            <span className="inline bg-gradient-to-r from-[#4ecc5d] to-[#1EA92F] text-transparent bg-clip-text">
              Personal
            </span>
          </h1>{' '}
          <br />
          <h2 className="inline">
            Security Agent
          </h2>
        </main>
        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Pwn Panda helps you with your online security needs      
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-1/3 bg-[#1EA92F] hover:bg-[#2c9639]" onClick={handleClick}>
            Get Started
          </Button>
          <Link
            href="https://github.com/TristanTran23/pwnpanda"
            target="_blank"
            rel="noreferrer noopener"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: 'outline'
            })}`}
          >
            Github Repository
          </Link>
        </div>
      </div>
      
      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};