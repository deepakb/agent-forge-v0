import { Header } from '@/components/sections/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesSection } from '@/components/sections/features'
import { ApplicationsSection } from '@/components/sections/applications'
import { IntegrationsSection } from '@/components/sections/integrations'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { CTASection } from '@/components/sections/cta'
import { GetStartedSection } from '@/components/sections/get-started'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ApplicationsSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <GetStartedSection />
      <CTASection />
      <Footer />
    </main>
  )
}
