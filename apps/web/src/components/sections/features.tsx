import { CodeBracketIcon, CpuChipIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    title: 'Easy Integration',
    description: 'Simple APIs and SDKs for seamless integration with your existing systems',
    icon: CodeBracketIcon,
  },
  {
    title: 'Enterprise Security',
    description: 'Built-in security features and compliance with enterprise standards',
    icon: ShieldCheckIcon,
  },
  {
    title: 'AI-First Architecture',
    description: 'Designed from the ground up for AI agent development and deployment',
    icon: CpuChipIcon,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/50">
      <Container>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose Agent Forge?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade platform for building and deploying AI agents
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg p-2.5 mb-6">
                  <feature.icon className="w-full h-full text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
