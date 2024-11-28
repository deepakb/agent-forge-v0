import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"

const enterpriseFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Enterprise Security',
    detail: 'SOC2 Compliant'
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    label: 'TypeScript-First',
    detail: '100% Type Safe'
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Production-Ready',
    detail: '99.9% Uptime'
  }
]

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 pt-32 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-800/50 to-transparent" />
      
      <Container className="relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                npm install @agent-forge/core
                <span className="ml-2 text-white/60">v2.0.0</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                Production-Ready<br />
                <span className="text-blue-200">AI Agents</span> for<br />
                Enterprise Apps
              </h1>
              <p className="text-xl text-blue-100/90 leading-relaxed max-w-xl">
                Accelerate your AI development with battle-tested, modular agent components. Built for enterprise scale, security, and reliability.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              {enterpriseFeatures.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                  <div className="text-blue-200">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{feature.label}</div>
                    <div className="text-xs text-blue-200">{feature.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold px-8 rounded-lg"
              >
                View Examples
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-blue-500/20 backdrop-blur-sm text-white hover:bg-blue-500/30 font-semibold border border-white/10 rounded-lg px-8"
              >
                Documentation
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="relative w-full aspect-[4/3] bg-gray-900/70 rounded-lg overflow-hidden font-mono">
                <pre className="absolute inset-0 p-6 text-sm text-blue-100/90 overflow-hidden">
                  <code className="leading-relaxed">{`import { AgentForge, LLMProvider } from '@agent-forge/core';

// Initialize your AI agent with enterprise configs
const agent = new AgentForge({
  provider: new LLMProvider({
    model: 'gpt-4',
    security: {
      encryption: true,
      audit: true,
      rbac: true
    }
  }),
  memory: {
    type: 'distributed',
    storage: 'redis',
    backup: true
  },
  observability: {
    metrics: true,
    tracing: true,
    logging: 'debug'
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
