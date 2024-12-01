'use client'

import { Header } from '@/components/sections/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesSection } from '@/components/sections/features'
import { ApplicationsSection } from '@/components/sections/applications'
import { IntegrationsSection } from '@/components/sections/integrations'
import { CaseStudiesSection } from '@/components/sections/case-studies'
import { CTASection } from '@/components/sections/cta'
import { ResourcesSection } from '@/components/sections/resources'
import { Footer } from '@/components/sections/footer'

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
