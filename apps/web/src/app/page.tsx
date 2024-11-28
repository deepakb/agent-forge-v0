import { Header } from '@/components/sections/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesSection } from '@/components/sections/features'
import { ApplicationsSection } from '@/components/sections/applications'
import { IntegrationSection } from '@/components/sections/integration'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { CTASection } from '@/components/sections/cta'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <ApplicationsSection />
        <IntegrationSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
