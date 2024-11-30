import { Container } from '@/components/ui/container'

export default function DocsPage() {
  return (
    <main>
      <Container>
        <div className="py-20">
          <h1 className="text-4xl font-bold mb-8">Documentation</h1>
          
          <div className="prose prose-blue max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-6">
              Welcome to Agent Forge! This documentation will help you get started with building
              enterprise-grade AI agent systems.
            </p>

            <h3 className="text-xl font-semibold mb-4">Quick Start</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <pre className="text-sm">
                <code>
                  npm install @agent-forge/core{'\n'}
                  npm install @agent-forge/ui
                </code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold mb-4">Core Concepts</h3>
            <ul className="list-disc pl-6 mb-6">
              <li>Agents and Agent Systems</li>
              <li>Message Passing</li>
              <li>State Management</li>
              <li>System Architecture</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">API Reference</h3>
            <p className="mb-6">
              Comprehensive API documentation is coming soon. For now, please refer to our GitHub
              repository for the latest updates and examples.
            </p>

            <h3 className="text-xl font-semibold mb-4">Examples</h3>
            <p className="mb-6">
              Check out our example projects to see Agent Forge in action:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Basic Agent System</li>
              <li>Multi-Agent Communication</li>
              <li>Enterprise Integration</li>
              <li>Custom Agent Behaviors</li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  )
}
