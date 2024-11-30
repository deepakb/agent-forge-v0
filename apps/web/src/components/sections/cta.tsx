import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96">
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="relative">
          {/* Enterprise badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-blue-100">Enterprise-Ready Platform</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Building Production-Grade<br />AI Systems Today
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join industry leaders using Agent Forge to build secure, scalable AI systems 
              with enterprise-grade components and TypeScript-first development.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 max-w-xl mx-auto">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold w-full sm:w-auto px-8 h-14 text-base rounded-xl transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View Code Examples
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 font-semibold border border-white/20 backdrop-blur-sm w-full sm:w-auto px-8 h-14 text-base rounded-xl transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Read Documentation
              </Button>
            </div>

            {/* Enterprise metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/20">
              {[
                { 
                  label: 'Enterprise Users',
                  value: '500+',
                  description: 'Global companies trust us'
                },
                {
                  label: 'System Uptime',
                  value: '99.99%',
                  description: 'Enterprise-grade reliability'
                },
                {
                  label: 'Security Score',
                  value: 'A+',
                  description: 'SOC2 compliant platform'
                }
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-lg font-medium text-blue-100 mb-1">{metric.label}</div>
                  <div className="text-sm text-blue-200">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
