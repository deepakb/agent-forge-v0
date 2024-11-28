import Image from 'next/image'
import { Container } from '@/components/ui/container'

const tools = [
  {
    name: 'Python',
    icon: '/logos/python.svg',
  },
  {
    name: 'GitHub',
    icon: '/logos/github.svg',
  },
  {
    name: 'AWS',
    icon: '/logos/aws.svg',
  },
  {
    name: 'Kubernetes',
    icon: '/logos/kubernetes.svg',
  }
]

export function IntegrationsSection() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Seamless Integration
          </h2>
          <p className="text-gray-600">
            Compatible with Your Favorite Tools
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-8">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src={tool.icon}
                      alt={tool.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center">
            <code className="text-green-400 text-sm">
              npm install agent-forge
            </code>
          </div>
        </div>
      </Container>
    </section>
  )
}
