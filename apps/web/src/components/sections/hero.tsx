import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"

export function HeroSection() {
  return (
    <section className="bg-primary relative overflow-hidden">
      <Container className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Build Scalable AI Agent Systems with Ease
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl">
              Enterprise-grade development platform for building and deploying AI agents at scale
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
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
                <Link 
                  href="https://github.com/yourusername/agent-forge" 
                  target="_blank"
                >
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative w-full aspect-[4/3] max-w-[600px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent rounded-2xl" />
              <Image
                src="/hero-illustration.svg"
                alt="AI Agent System Illustration"
                fill
                className="object-contain p-8"
                priority
              />
            </div>
          </div>
        </div>
      </Container>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 to-transparent" />
    </section>
  )
}
