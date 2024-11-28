import { Container } from '@/components/ui/container'

const communityLinks = [
  {
    title: 'GitHub Discussions',
    description: 'Ask questions, share ideas, and connect with other developers',
    href: 'https://github.com/agent-forge/discussions'
  },
  {
    title: 'Discord Community',
    description: 'Join our Discord server for real-time discussions and support',
    href: 'https://discord.gg/agent-forge'
  },
  {
    title: 'Twitter',
    description: 'Follow us for the latest updates and announcements',
    href: 'https://twitter.com/agent_forge'
  }
]

const contributionGuides = [
  {
    title: 'Code Contributions',
    description: 'Learn how to contribute code to Agent Forge',
    href: '/docs/contributing'
  },
  {
    title: 'Documentation',
    description: 'Help improve our documentation',
    href: '/docs/contributing/documentation'
  },
  {
    title: 'Bug Reports',
    description: 'Report bugs and request features',
    href: 'https://github.com/agent-forge/issues'
  }
]

export default function CommunityPage() {
  return (
    <main>
      <Container>
        <div className="py-20">
          <h1 className="text-4xl font-bold mb-8">Community</h1>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Join the Conversation</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {communityLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500/20 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Contribute</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contributionGuides.map((guide) => (
                <a
                  key={guide.title}
                  href={guide.href}
                  className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500/20 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{guide.title}</h3>
                  <p className="text-sm text-gray-600">{guide.description}</p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Events</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 mb-4">
                Stay tuned for upcoming community events, workshops, and meetups. Follow us on Twitter
                or join our Discord server to get notified about new events.
              </p>
              <p className="text-sm text-gray-500">
                Want to organize a community event? Contact us on Discord!
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
