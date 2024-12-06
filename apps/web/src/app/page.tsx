'use client'

import { ApplicationsSection } from '@/components/sections/applications'
import { CaseStudiesSection } from '@/components/sections/case-studies'
import { CTASection } from '@/components/sections/cta'
import { FeaturesSection } from '@/components/sections/features'
import { Footer } from '@/components/sections/footer'
import { Header } from '@/components/sections/header'
import { HeroSection } from '@/components/sections/hero'
import { IntegrationsSection } from '@/components/sections/integrations'
import { ResourcesSection } from '@/components/sections/resources'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ApplicationsSection />
      <IntegrationsSection />
      <CaseStudiesSection />
      <ResourcesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
