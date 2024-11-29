import { Container } from '@/components/ui/container'

const features = [
  {
    title: 'Event-Driven Architecture',
    description: 'Built on a robust event system with EventEmitter3, enabling real-time state updates and reactive agent behaviors.',
    techDetail: 'Real-time Events',
    benefits: ['State Updates', 'Message Routing', 'Event Handlers'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'State Management',
    description: 'Enterprise-grade Redis-backed state store with distributed task management and workflow orchestration.',
    techDetail: 'Redis-powered',
    benefits: ['Distributed State', 'Task Tracking', 'Workflow States'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: 'Agent Lifecycle',
    description: 'Complete agent lifecycle management with initialization, heartbeat monitoring, and graceful termination.',
    techDetail: 'Full Lifecycle',
    benefits: ['Health Monitoring', 'Auto Recovery', 'Graceful Shutdown'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    title: 'Workflow Orchestration',
    description: 'Sophisticated workflow engine with dependency resolution, parallel execution, and comprehensive error handling.',
    techDetail: 'Enterprise-grade',
    benefits: ['Parallel Tasks', 'Error Recovery', 'Step Management'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    title: 'Message Broker',
    description: 'Reliable message routing system with pub/sub capabilities, message acknowledgment, and error handling.',
    techDetail: 'High Throughput',
    benefits: ['Pub/Sub System', 'Message Routing', 'Error Handling'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    title: 'LLM Integration',
    description: 'Seamless OpenAI integration with type-safe interfaces and extensible provider architecture.',
    techDetail: 'OpenAI Ready',
    benefits: ['Type Safety', 'Provider System', 'Easy Extension'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50" id="features">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-display-lg font-display font-bold text-neutral-900 mb-4">
            Enterprise-Ready Features
          </h2>
          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
            Production-grade TypeScript components for building secure, scalable AI systems. 
            Built for enterprise teams with battle-tested reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg p-6 border border-neutral-200 hover:border-brand-500/20 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-500/5 rounded-lg flex items-center justify-center text-brand-600 group-hover:bg-brand-500/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-display text-display-xs font-semibold text-neutral-900">{feature.title}</h3>
                  <div className="text-ui-sm font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block">
                    {feature.techDetail}
                  </div>
                </div>
              </div>
              <p className="text-body-sm text-neutral-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-ui-sm text-neutral-700">
                    <svg className="w-4 h-4 mr-2 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
