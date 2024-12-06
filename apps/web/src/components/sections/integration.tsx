import Image from 'next/image'

import { Container } from '@/components/ui/container'

const integrations = [
  { name: 'OpenAI', logo: '/integrations/openai.svg' },
  { name: 'Anthropic', logo: '/integrations/anthropic.svg' },
  { name: 'Hugging Face', logo: '/integrations/huggingface.svg' },
]

export function IntegrationSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <Container>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Seamless Integration
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Works with your favorite AI platforms and tools
          </p>
        </div>

        <div className="flex justify-center items-center gap-12 mb-12">
          {integrations.map((integration, index) => (
            <div key={index} className="relative w-24 h-24 grayscale hover:grayscale-0 transition-all">
              <Image
                src={integration.logo}
                alt={integration.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-card rounded-lg border p-6">
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            <code>{`import { AgentForge } from 'agent-forge';

const agent = new AgentForge({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

await agent.execute({
  task: 'Analyze customer feedback',
  data: customerData,
});`}</code>
          </pre>
        </div>
      </Container>
    </section>
  )
}
