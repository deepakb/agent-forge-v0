'use client'

import Image from 'next/image'

import { Container } from '@/components/ui/container'

const packages = [
  {
    name: '@agent-forge/core',
    description: 'Modular agent framework with built-in state management and workflow orchestration',
    features: [
      'Agent Architecture',
      'Communication Protocols',
      'State Management',
      'Workflow Engine'
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    )
  },
  {
    name: '@agent-forge/llm-provider',
    description: 'Unified interface for multiple LLM providers with enterprise features',
    features: [
      'OpenAI Integration',
      'Anthropic Support',
      'Streaming Support',
      'Context Management'
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    name: '@agent-forge/utils',
    description: 'Essential utilities for enterprise-grade agent systems',
    features: [
      'Logging System',
      'Error Handling',
      'Encryption Tools',
      'Type Definitions'
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
]

const enterpriseIntegrations = [
  {
    category: 'Enterprise LLM Solutions',
    description: 'Secure integration with enterprise-grade language models',
    items: [
      { name: 'Azure OpenAI', icon: '/logos/azure.svg', status: 'available' },
      { name: 'Anthropic Claude', icon: '/logos/anthropic.svg', status: 'coming-soon' },
      { name: 'AWS Bedrock', icon: '/logos/aws.svg', status: 'planned' }
    ]
  },
  {
    category: 'Identity & Security',
    description: 'Enterprise-grade authentication and security controls',
    items: [
      { name: 'Azure AD', icon: '/logos/azure-ad.svg', status: 'planned' },
      { name: 'Okta', icon: '/logos/okta.svg', status: 'planned' },
      { name: 'Auth0', icon: '/logos/auth0.svg', status: 'planned' }
    ]
  },
  {
    category: 'Observability',
    description: 'Comprehensive monitoring and logging solutions',
    items: [
      { name: 'Datadog', icon: '/logos/datadog.svg', status: 'planned' },
      { name: 'New Relic', icon: '/logos/newrelic.svg', status: 'planned' },
      { name: 'Grafana', icon: '/logos/grafana.svg', status: 'planned' }
    ]
  },
  {
    category: 'Vector Databases',
    description: 'Enterprise-ready vector storage solutions',
    items: [
      { name: 'Pinecone', icon: '/logos/pinecone.svg', status: 'planned' },
      { name: 'Weaviate', icon: '/logos/weaviate.svg', status: 'planned' },
      { name: 'Milvus', icon: '/logos/milvus.svg', status: 'planned' }
    ]
  },
  {
    category: 'Knowledge Management',
    description: 'Integration with enterprise document systems',
    items: [
      { name: 'SharePoint', icon: '/logos/sharepoint.svg', status: 'planned' },
      { name: 'Confluence', icon: '/logos/confluence.svg', status: 'planned' },
      { name: 'Notion', icon: '/logos/notion.svg', status: 'planned' }
    ]
  },
  {
    category: 'Deployment & DevOps',
    description: 'Enterprise deployment and orchestration',
    items: [
      { name: 'Kubernetes', icon: '/logos/kubernetes.svg', status: 'available' },
      { name: 'Docker', icon: '/logos/docker.svg', status: 'available' },
      { name: 'Terraform', icon: '/logos/terraform.svg', status: 'planned' }
    ]
  }
]

export function IntegrationsSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white" id="packages">
      <Container>
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Enterprise Integration Suite
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Enterprise-Grade Integration
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive suite of TypeScript-first packages designed for building secure, 
            scalable, and maintainable AI agent systems with enterprise-level reliability.
          </p>
        </div>

        {/* Core Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div 
              key={pkg.name}
              className="group bg-white rounded-xl p-8 border border-gray-100 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {pkg.icon}
                </div>
                <div className="inline-flex items-center space-x-2 mb-4">
                  <h3 className="font-mono text-sm text-blue-600">{pkg.name}</h3>
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">Stable</span>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{pkg.description}</p>
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-500">
                      <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Installation */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Quick Start Installation</h3>
                <p className="text-gray-400 text-sm">Get started with our enterprise-ready packages in minutes</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  TypeScript-first
                </span>
                <span className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Zero Config
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <code className="text-green-400 text-sm font-mono">
                  npm install @agent-forge/core @agent-forge/llm-provider @agent-forge/utils
                </code>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <code className="text-gray-400 text-sm font-mono mb-2 block">
                  # or use our CLI for a complete project setup
                </code>
                <code className="text-green-400 text-sm font-mono">
                  npx create-agent-forge-app my-enterprise-app
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Integrations */}
        <div>
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Enterprise Platform Support
            </h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              Comprehensive integration support for enterprise systems and services, 
              ensuring seamless adoption within your existing infrastructure.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Available
              </span>
              <span className="flex items-center text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Coming Soon
              </span>
              <span className="flex items-center text-gray-400">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Planned
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseIntegrations.map((category) => (
              <div 
                key={category.category} 
                className="group bg-white rounded-xl p-8 border border-gray-100 hover:border-blue-500/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{category.category}</h4>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md bg-white p-1.5 shadow-sm">
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.status === 'available' 
                          ? 'bg-green-50 text-green-600'
                          : item.status === 'coming-soon'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status === 'available' 
                          ? 'Available' 
                          : item.status === 'coming-soon'
                          ? 'Coming Soon'
                          : 'Planned'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
