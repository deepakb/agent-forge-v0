import { Container } from '@/components/ui/container'

const features = [
  {
    title: 'TypeScript-First Architecture',
    description: 'Built from the ground up with TypeScript, offering full type safety, IDE support, and enterprise-grade code quality.',
    techDetail: 'End-to-end type safety',
    benefits: ['Full IDE Support', 'Type Safety', 'Code Quality'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'Enterprise Security',
    description: 'Production-ready security features including message encryption, audit logging, and role-based access control.',
    techDetail: 'SOC2 compliant',
    benefits: ['Message Encryption', 'Audit Logging', 'Access Control'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: 'Distributed Memory',
    description: 'High-performance distributed state management using Redis, handling millions of concurrent agent operations.',
    techDetail: '10M+ ops/second',
    benefits: ['High Performance', 'Distributed State', 'Scalable'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: 'Multi-Provider Support',
    description: 'Enterprise-ready integrations with OpenAI, Anthropic, Azure, and custom LLM deployments with type-safe interfaces.',
    techDetail: 'Provider-agnostic',
    benefits: ['OpenAI Support', 'Anthropic Ready', 'Azure Integration'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Enterprise Observability',
    description: 'Production-grade monitoring with OpenTelemetry integration, distributed tracing, and real-time metrics.',
    techDetail: 'Full observability',
    benefits: ['Real-time Metrics', 'Distributed Tracing', 'Error Tracking'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Production Workflows',
    description: 'Enterprise workflow engine with distributed execution, error handling, and state persistence built-in.',
    techDetail: 'Battle-tested',
    benefits: ['Error Recovery', 'State Persistence', 'Distributed Tasks'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50" id="features">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Enterprise-Ready Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Production-grade TypeScript components for building secure, scalable AI systems. 
            Built for enterprise teams with battle-tested reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-8 border border-gray-100 hover:border-blue-500/20 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mt-1 inline-block">
                    {feature.techDetail}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>

              <div className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center text-sm text-gray-500"
                  >
                    <svg className="w-4 h-4 mr-2 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
