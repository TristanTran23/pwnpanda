'use client';
import { Button } from '@/components/ui/button';

export const Cta = () => {
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Fill out our 
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {' '}
              Google Form
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            We would appreciate it if you fill out this google form to give us feedback and report bugs!
          </p>
        </div>
        <div className="space-y-4 lg:col-start-2">
          <Button asChild size="lg">
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScMph1USbQP0_gTf_1mLBnlM2mXXO8MPJs3zUVWNK8HCMnbhw/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">
              Go to Google Form
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};