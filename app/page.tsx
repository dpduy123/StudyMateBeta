'use client'

import { HeroSection } from '@/components/landing/HeroSection'
import { StorySection } from '@/components/landing/StorySection'
import { FeatureSimulation } from '@/components/landing/FeatureSimulation'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {



  return (
    <div className="min-h-screen">
      <Header />
      <main >
        <HeroSection />
        <StorySection />
        <FeatureSimulation />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        {/* <TestimonialsSection /> */}
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}