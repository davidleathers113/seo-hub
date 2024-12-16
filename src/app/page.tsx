'use client';

import {
  Hero,
  Features,
  Pricing,
  Guides,
  Testimonials,
  CallToAction,
  Footer
} from '@/components/landing';

export const metadata = {
  title: 'ContentForge - AI-Powered Content Creation Platform',
  description: 'Create high-quality, SEO-optimized content at scale with our AI-powered platform.'
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Guides />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  );
}