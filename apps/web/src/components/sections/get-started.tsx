import Link from 'next/link'
import { Container } from '@/components/ui/container'

const resources = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides and API references',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: '/docs'
  },
  {
    title: 'GitHub',
    description: 'Explore our open-source repositories',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    href: 'https://github.com/agent-forge'
  },
  {
    title: 'Community',
    description: 'Join our thriving developer community',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/community'
  }
]

export function GetStartedSection() {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Get Started Today
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 hover:border-[#2563EB]/20 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-[#2563EB]/5 rounded-lg flex items-center justify-center mb-4 text-[#2563EB]">
                {resource.icon}
              </div>
              <h3 className="font-semibold mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600">{resource.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
