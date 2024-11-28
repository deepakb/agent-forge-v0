'use client'

import { Container } from '@/components/ui/container'
import Link from 'next/link'

const resources = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides, API references, and enterprise integration tutorials.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    metrics: {
      guides: '100+',
      examples: '50+',
      tutorials: '30+'
    },
    features: [
      'Enterprise Integration Guides',
      'API Documentation',
      'Security Best Practices',
      'Performance Optimization',
      'Deployment Guides',
      'TypeScript Examples'
    ],
    cta: {
      text: 'View Documentation',
      href: '/docs'
    }
  },
  {
    title: 'GitHub',
    description: 'Explore our enterprise-ready open-source repositories and contribute to the ecosystem.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    metrics: {
      stars: '1000+',
      forks: '200+',
      contributors: '50+'
    },
    features: [
      'TypeScript Source Code',
      'Enterprise Examples',
      'Security Templates',
      'CI/CD Pipelines',
      'Testing Framework',
      'Docker Configs'
    ],
    cta: {
      text: 'View on GitHub',
      href: 'https://github.com/agent-forge'
    }
  },
  {
    title: 'Community',
    description: 'Join our thriving developer community and connect with enterprise users.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    metrics: {
      members: '5000+',
      channels: '20+',
      events: '10+'
    },
    features: [
      'Enterprise Support',
      'Technical Discussions',
      'Best Practices',
      'Office Hours',
      'Community Events',
      'Success Stories'
    ],
    cta: {
      text: 'Join Community',
      href: '/community'
    }
  }
]

export function ResourcesSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100/50 bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent,white)]" />
      
      <Container>
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Developer Resources
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Get Started Today
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to build enterprise-grade AI systems with comprehensive
            documentation, examples, and community support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="group bg-white rounded-xl border border-gray-100 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              
              <div className="relative p-8 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    {resource.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{resource.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-50/30 p-4 rounded-xl">
                  {Object.entries(resource.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-blue-600 font-semibold bg-white px-2 py-1 rounded-lg shadow-sm mb-1">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {resource.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                  {resource.features.length > 3 && (
                    <div className="text-sm text-blue-600 font-medium pl-8">
                      +{resource.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>

              <div className="relative border-t border-gray-100 p-6 bg-gradient-to-b from-gray-50/50 to-white rounded-b-xl mt-auto">
                <Link
                  href={resource.cta.href}
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {resource.cta.text}
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise support banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 md:p-12">
          <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:16px_16px]" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Need Enterprise Support?</h3>
              <p className="text-blue-100 max-w-2xl">
                Get priority support, custom integrations, and dedicated resources for your enterprise needs.
              </p>
            </div>
            <Link
              href="/enterprise"
              className="flex items-center whitespace-nowrap px-8 py-4 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors shadow-lg"
            >
              Contact Enterprise Sales
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
