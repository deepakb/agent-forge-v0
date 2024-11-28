import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function CTASection() {
  return (
    <section className="py-24 bg-primary">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Build Your AI Agents?
          </h2>
          <p className="text-xl text-primary-foreground/90">
            Get started with Agent Forge today and transform your enterprise with intelligent AI agents.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-semibold"
            >
              <Link href="/docs">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-semibold text-white border-white/20 hover:bg-white/10"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
