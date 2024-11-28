import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const applications = [
  {
    title: 'Customer Service',
    description: 'Build intelligent customer service agents that handle inquiries 24/7',
    details: 'Automate customer support with AI agents that understand context and provide accurate responses.',
  },
  {
    title: 'Data Analysis',
    description: 'Create agents that process and analyze large datasets automatically',
    details: 'Transform raw data into actionable insights with AI-powered analysis agents.',
  },
  {
    title: 'Process Automation',
    description: 'Automate complex business processes with intelligent agents',
    details: 'Streamline workflows and reduce manual tasks with AI process automation.',
  },
  {
    title: 'Knowledge Management',
    description: 'Deploy agents that organize and retrieve information efficiently',
    details: 'Build intelligent knowledge bases that learn and adapt to your organization.',
  }
]

export function ApplicationsSection() {
  return (
    <section className="py-24 bg-background">
      <Container>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Applications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the endless possibilities with Agent Forge
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {applications.map((app, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{app.title}</CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{app.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
