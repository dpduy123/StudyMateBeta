'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'
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
import { PageLoading } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return <PageLoading />
  }

  // Redirect in progress
  if (user) {
    return <PageLoading />
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main >
        <HeroSection />
        {/* <StorySection /> */}
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