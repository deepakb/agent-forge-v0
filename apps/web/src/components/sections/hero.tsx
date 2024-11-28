import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"

export function HeroSection() {
  return (
    <section className="bg-[#2563EB] pt-32 pb-16">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="flex items-center gap-2 text-white/90">
              <div className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium">npm install @agent-forge/core</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Production-Ready AI Agents for Enterprise Applications
            </h1>
            <p className="text-lg text-white/90">
              Accelerate your AI development with battle-tested, modular agent components. Built for enterprise scale, security, and reliability.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>TypeScript-First</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Production-Ready</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-white text-[#2563EB] hover:bg-white/90 shadow-lg font-semibold"
              >
                View Code Examples
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 font-semibold border-0"
              >
                Read Documentation
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <div className="relative w-full aspect-[4/3] bg-gray-900/50 rounded-lg overflow-hidden">
                <pre className="absolute inset-0 p-4 text-sm font-mono text-white/90 overflow-hidden">
                  <code>{`import { AgentForge, LLMProvider } from '@agent-forge/core';

// Initialize your AI agent with enterprise configs
const agent = new AgentForge({
  provider: new LLMProvider({
    model: 'gpt-4',
    security: {
      encryption: true,
      audit: true
    }
  }),
  memory: {
    type: 'distributed',
    storage: 'redis'
  }
});

// Start processing with built-in workflows
await agent.start();`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
