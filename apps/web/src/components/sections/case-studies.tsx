import { Container } from '@/components/ui/container'

const caseStudies = [
  {
    title: 'Enterprise Knowledge Hub',
    description: 'Build secure knowledge management systems that automatically process, index, and maintain enterprise documentation with built-in access controls.',
    possibilities: [
      'Automated document processing',
      'Secure knowledge graphs',
      'Role-based access',
    ],
    metrics: {
      documents: '1M+',
      processing: '99.9%',
      uptime: '99.99%'
    },
    techHighlight: '@agent-forge/core + TypeScript',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'Compliance Assistant',
    description: 'Create AI-powered compliance systems that monitor, alert, and generate reports for regulatory requirements in real-time.',
    possibilities: [
      'Real-time monitoring',
      'Automated reporting',
      'Audit trails',
    ],
    metrics: {
      accuracy: '99.9%',
      alerts: '< 1s',
      coverage: '100%'
    },
    techHighlight: '@agent-forge/compliance + TypeScript',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Support Operations',
    description: 'Deploy intelligent support systems that handle inquiries, route tickets, and maintain context across conversations.',
    possibilities: [
      'Intelligent routing',
      'Context management',
      'Multi-channel support',
    ],
    metrics: {
      resolution: '< 2min',
      satisfaction: '98%',
      automation: '85%'
    },
    techHighlight: '@agent-forge/support + TypeScript',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }
]

export function CaseStudiesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="case-studies">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            What You Can Build
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the possibilities of enterprise AI development with our TypeScript-first components
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <div
              key={study.title}
              className="bg-white rounded-xl border border-gray-100 p-8 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                  {study.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{study.title}</h3>
                  <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mt-1 inline-block">
                    {study.techHighlight}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{study.description}</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(study.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-blue-600 font-semibold">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {study.possibilities.map((item) => (
                    <div key={item} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
