import { Container } from '@/components/ui/container'
import Link from 'next/link'

const applications = [
  {
    title: 'Customer Support Automation',
    description: 'Intelligent agents that handle customer inquiries, route tickets, and provide 24/7 support with human-like understanding.',
    techStack: ['Message Routing', 'State Management', 'LLM Integration'],
    href: '/examples/customer-support',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    title: 'Document Processing',
    description: 'Automated document analysis, data extraction, and processing workflow with multi-agent coordination.',
    techStack: ['Workflow Orchestration', 'Task Management', 'State Persistence'],
    href: '/examples/document-processing',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'Research Assistant',
    description: 'Collaborative research agents that gather, analyze, and synthesize information from multiple sources.',
    techStack: ['Agent Communication', 'Task Distribution', 'Data Synthesis'],
    href: '/examples/research-assistant',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    title: 'Code Review Assistant',
    description: 'AI-powered code review system with multiple specialized agents for different aspects of code analysis.',
    techStack: ['Parallel Processing', 'Message Serialization', 'Workflow Management'],
    href: '/examples/code-review',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'Sales Pipeline Automation',
    description: 'Intelligent sales process automation with lead qualification, follow-ups, and pipeline management.',
    techStack: ['Event Management', 'State Tracking', 'Multi-Agent Coordination'],
    href: '/examples/sales-automation',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Content Generation',
    description: 'Distributed content creation system with specialized agents for research, writing, and editing.',
    techStack: ['Workflow Orchestration', 'Agent Collaboration', 'Content Management'],
    href: '/examples/content-generation',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  }
]

export function ApplicationsSection() {
  return (
    <section className="py-16 bg-gray-50" id="applications">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Real-World Applications
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how Agent Forge powers sophisticated AI solutions across different industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Link
              key={app.title}
              href={app.href}
              className="block p-6 bg-white rounded-lg border border-gray-100 hover:border-blue-500/20 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/5 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                {app.icon}
              </div>
              <h3 className="font-semibold mb-2">{app.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{app.description}</p>
              <div className="flex flex-wrap gap-2">
                {app.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
