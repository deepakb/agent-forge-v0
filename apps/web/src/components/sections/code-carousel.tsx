import { useEffect, useState } from 'react'

const codeExamples = [
  {
    title: 'Create an AI Agent',
    language: 'typescript',
    code: `import { Agent } from '@agent-forge/core'
import { OpenAI } from '@agent-forge/providers'

// Initialize the AI agent with OpenAI
const agent = new Agent({
  provider: new OpenAI({
    model: 'gpt-4-turbo',
    temperature: 0.7,
  }),
  memory: {
    type: 'redis',
    url: process.env.REDIS_URL,
  },
})

// Add capabilities to your agent
await agent.addCapability('web-search')
await agent.addCapability('code-analysis')

// Execute tasks with enterprise-grade reliability
const result = await agent.execute({
  task: 'Analyze the security of this codebase',
  context: { repository: './src' },
})`
  },
  {
    title: 'Distributed Workflow',
    language: 'typescript',
    code: `import { Workflow } from '@agent-forge/core'
import { SecurityAgent, CodeAgent } from './agents'

// Create a distributed workflow
const workflow = new Workflow({
  name: 'security-audit',
  agents: [SecurityAgent, CodeAgent],
  distributed: true,
})

// Add enterprise monitoring
workflow.addMonitoring({
  metrics: true,
  tracing: true,
  logging: 'debug',
})

// Execute with error handling
try {
  const audit = await workflow.start({
    input: { 
      repository: './src',
      compliance: ['SOC2', 'GDPR']
    }
  })
  console.log(audit.findings)
} catch (error) {
  workflow.rollback()
}`
  },
  {
    title: 'Multi-Agent System',
    language: 'typescript',
    code: `import { AgentSystem } from '@agent-forge/core'
import { 
  AnalysisAgent,
  PlanningAgent,
  ExecutionAgent 
} from './agents'

// Create a multi-agent system
const system = new AgentSystem({
  name: 'enterprise-automation',
  agents: {
    analyzer: AnalysisAgent,
    planner: PlanningAgent,
    executor: ExecutionAgent,
  },
})

// Configure enterprise features
system.configure({
  security: {
    encryption: true,
    audit: true,
    rbac: true,
  },
  scaling: {
    auto: true,
    maxAgents: 100,
  },
})

// Start the system with monitoring
const metrics = await system.start({
  task: 'Optimize application performance',
  monitoring: true,
})`
  },
  {
    title: 'Enterprise Integration',
    language: 'typescript',
    code: `import { Integration } from '@agent-forge/core'
import { 
  Slack, 
  Jira, 
  GitHub 
} from '@agent-forge/integrations'

// Set up enterprise integrations
const integration = new Integration({
  name: 'devops-automation',
  services: {
    slack: new Slack({
      token: process.env.SLACK_TOKEN,
      channel: 'dev-ops',
    }),
    jira: new Jira({
      host: process.env.JIRA_HOST,
      auth: process.env.JIRA_AUTH,
    }),
    github: new GitHub({
      token: process.env.GITHUB_TOKEN,
      repo: 'organization/repo',
    }),
  },
})

// Enable secure event handling
integration.handleEvents({
  'github.pull_request': async (event) => {
    const analysis = await agent.analyze(event)
    await integration.services.slack.notify({
      message: analysis.summary,
      thread: event.id,
    })
  },
})`
  }
]

export function CodeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((current) => 
          current === codeExamples.length - 1 ? 0 : current + 1
        )
        setIsTransitioning(false)
      }, 500)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full">
      {/* VSCode-like window */}
      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden shadow-2xl border border-gray-800">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-2 text-sm text-gray-400 font-mono">
              {codeExamples[currentIndex].title}.ts
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xs">TypeScript</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Code content */}
        <div className="relative overflow-hidden">
          <pre className={`p-6 text-sm font-mono leading-relaxed transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <code className="text-gray-300">
              {codeExamples[currentIndex].code}
            </code>
          </pre>

          {/* Line numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-end pr-2 pt-6 pb-6 text-sm font-mono text-gray-600 bg-[#1e1e1e] border-r border-gray-800">
            {codeExamples[currentIndex].code.split('\n').map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1 bg-[#007acc] text-white text-xs">
          <div className="flex items-center gap-4">
            <span>TypeScript</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln {codeExamples[currentIndex].code.split('\n').length}</span>
            <span>Enterprise Example</span>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {codeExamples.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-brand-500 w-4' 
                : 'bg-gray-400/30 hover:bg-gray-400/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
