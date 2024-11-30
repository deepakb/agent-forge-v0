'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Container } from '@/components/ui/container'

import { ApplicationModal } from './application-modal'

type Application = {
  title: string
  price: string
  shortDescription: string
  description: string
  metrics: Record<string, string>
  features: string[]
  includes: string[]
  packageName: string
  demoUrl: string
  docsUrl: string
  status: string
  icon: JSX.Element
}

const applications: Application[] = [
  {
    title: 'Enterprise Support Hub',
    price: '$499',
    shortDescription: 'Production-ready support automation system with enterprise security.',
    description: 'Production-ready support automation system with enterprise security and compliance built-in.',
    metrics: {
      uptime: '99.99%',
      response: '< 100ms',
      scale: '10M+ msgs'
    },
    features: [
      'SOC2 compliant architecture',
      'Role-based access control',
      'Audit logging system',
      'Encrypted data storage',
      'Multi-tenant support',
      'Performance monitoring'
    ],
    includes: [
      'Full TypeScript source code',
      'Docker deployment files',
      'CI/CD pipeline configs',
      'Security documentation',
      'Integration guides'
    ],
    packageName: 'enterprise-support',
    demoUrl: '/demos/enterprise-support',
    docsUrl: '/docs/enterprise-support',
    status: 'Production Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    title: 'Document Intelligence',
    price: '$699',
    shortDescription: 'Enterprise-grade document processing system with advanced security.',
    description: 'Enterprise-grade document processing system with advanced security and compliance features.',
    metrics: {
      processing: '1M+ docs',
      accuracy: '99.9%',
      latency: '< 50ms'
    },
    features: [
      'Zero-trust architecture',
      'Data encryption at rest',
      'Access control matrix',
      'Compliance reporting',
      'Distributed processing',
      'Real-time monitoring'
    ],
    includes: [
      'Full TypeScript source code',
      'Kubernetes manifests',
      'AWS/Azure templates',
      'Security playbooks',
      'Deployment guides'
    ],
    packageName: 'document-platform',
    demoUrl: '/demos/document-platform',
    docsUrl: '/docs/document-platform',
    status: 'Enterprise Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'Knowledge Graph Engine',
    price: '$799',
    shortDescription: 'Production-ready knowledge management system with distributed architecture.',
    description: 'Production-ready knowledge management system with enterprise security and distributed architecture.',
    metrics: {
      nodes: '100M+',
      queries: '10K/s',
      storage: 'Petabyte'
    },
    features: [
      'Distributed architecture',
      'End-to-end encryption',
      'Identity management',
      'Compliance controls',
      'Performance metrics',
      'Scalability features'
    ],
    includes: [
      'Full TypeScript source code',
      'Infrastructure as code',
      'Monitoring setup',
      'Security protocols',
      'Scaling playbooks'
    ],
    packageName: 'knowledge-engine',
    demoUrl: '/demos/knowledge-engine',
    docsUrl: '/docs/knowledge-engine',
    status: 'Production Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    title: 'Code Analysis Platform',
    price: '$599',
    shortDescription: 'Enterprise code review system with secure multi-agent coordination.',
    description: 'Enterprise code review system with TypeScript implementation, featuring secure multi-agent coordination and compliance tracking.',
    metrics: {
      analysis: '1M+ lines',
      accuracy: '99.9%',
      latency: '< 50ms'
    },
    features: [
      'Static code analysis',
      'Security scanning',
      'Compliance tracking',
      'Multi-agent coordination',
      'Review automation',
      'Integration APIs'
    ],
    includes: [
      'Full TypeScript source code',
      'CI integration templates',
      'Security rules engine',
      'API documentation',
      'Extension framework'
    ],
    packageName: 'code-analysis',
    demoUrl: '/demos/code-analysis',
    docsUrl: '/docs/code-analysis',
    status: 'Production Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'Enterprise Sales Engine',
    price: '$899',
    shortDescription: 'Production-ready sales automation with enterprise integrations.',
    description: 'Production-ready sales automation with TypeScript implementation, featuring secure data handling and enterprise integrations.',
    metrics: {
      sales: '1M+ deals',
      accuracy: '99.9%',
      latency: '< 50ms'
    },
    features: [
      'CRM integration',
      'Sales pipeline automation',
      'Lead scoring system',
      'Analytics dashboard',
      'Security controls',
      'API gateway'
    ],
    includes: [
      'Full TypeScript source code',
      'Integration connectors',
      'Analytics setup',
      'Security configs',
      'API documentation'
    ],
    packageName: 'sales-engine',
    demoUrl: '/demos/sales-engine',
    docsUrl: '/docs/sales-engine',
    status: 'Production Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Content Operations Hub',
    price: '$699',
    shortDescription: 'Enterprise content management system with secure workflows.',
    description: 'Enterprise content management system with TypeScript implementation, featuring secure workflows and compliance controls.',
    metrics: {
      content: '1M+ assets',
      accuracy: '99.9%',
      latency: '< 50ms'
    },
    features: [
      'Workflow engine',
      'Access control',
      'Content versioning',
      'Audit trails',
      'Compliance tools',
      'API integration'
    ],
    includes: [
      'Full TypeScript source code',
      'Workflow templates',
      'Security configs',
      'API documentation',
      'Integration guides'
    ],
    packageName: 'content-ops',
    demoUrl: '/demos/content-ops',
    docsUrl: '/docs/content-ops',
    status: 'Production Ready',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  }
]

export function ApplicationsSection() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAppClick = (app: Application) => {
    setSelectedApp(app)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedApp(null)
  }

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white" id="solutions">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100/50 bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent,white)]" />
      
      <Container>
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Enterprise Solutions
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Production-Ready Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade boilerplates with complete TypeScript implementations, security controls, 
            and deployment configurations. Start building production systems today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {applications.map((app) => (
            <div
              key={app.title}
              className="group bg-white rounded-xl border border-gray-100 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300 cursor-pointer relative flex flex-col"
              onClick={() => handleAppClick(app)}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              
              <div className="relative p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{app.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          {app.status}
                        </div>
                        <div className="text-lg font-bold text-gray-900">{app.price}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{app.shortDescription}</p>

                <div className="grid grid-cols-3 gap-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-50/30 p-4 rounded-xl">
                  {Object.entries(app.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-blue-600 font-semibold bg-white px-2 py-1 rounded-lg shadow-sm mb-1">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  {app.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                  {app.features.length > 3 && (
                    <div className="text-sm text-blue-600 font-medium pl-8">
                      +{app.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>

              <div className="relative border-t border-gray-100 p-6 bg-gradient-to-b from-gray-50/50 to-white rounded-b-xl mt-auto">
                <div className="flex gap-4">
                  <Link
                    href={app.demoUrl}
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    View Demo
                  </Link>
                  <Link
                    href={app.docsUrl}
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    Documentation
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-2xl">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Metrics</h3>
            <p className="text-sm text-gray-600">Proven performance at scale</p>
          </div>
          {[
            { label: 'Uptime SLA', value: '99.99%' },
            { label: 'Response Time', value: '< 50ms' },
            { label: 'Security Score', value: 'A+' }
          ].map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      </Container>

      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={handleCloseModal}
          isOpen={isModalOpen}
        />
      )}
    </section>
  )
}
