import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function CTASection() {
  return (
    <section className="py-20 bg-[#2563EB]">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Building with Production-Ready AI Components
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join industry leaders using Agent Forge to build secure, scalable AI systems with enterprise-grade components.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button
              size="lg"
              className="bg-white text-[#2563EB] hover:bg-white/90 shadow-lg font-semibold w-full sm:w-auto"
            >
              View Code Examples
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 font-semibold border-0 w-full sm:w-auto"
            >
              Read Documentation
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
