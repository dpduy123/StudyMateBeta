'use client'

import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  // Note: User redirect logic is handled by middleware
  // If user is authenticated and lands here after email verification,
  // middleware will check profileCompleted and redirect accordingly

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}