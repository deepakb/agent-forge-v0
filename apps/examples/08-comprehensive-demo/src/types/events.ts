import { Content, ContentAnalysis, ContentRequest, PublishingTarget } from './content';

export interface SystemMetrics {
  agentMetrics: Map<string, AgentMetrics>;
  systemLoad: {
    cpu: number;
    memory: number;
    pendingTasks: number;
  };
  timestamp: Date;
}

export interface AgentMetrics {
  status: 'IDLE' | 'BUSY' | 'ERROR';
  taskCount: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  lastActive: Date;
}

export interface Alert {
  id: string;
  type: 'PERFORMANCE' | 'ERROR' | 'CAPACITY' | 'QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  context: any;
  timestamp: Date;
}

export interface EventTypes {
  // Content Events
  'content:requested': {
    request: ContentRequest;
  };
  'content:created': {
    content: Content;
  };
  'content:updated': {
    content: Content;
    changes: string[];
  };
  'content:analyzed': {
    content: Content;
    analysis: ContentAnalysis;
  };
  'content:approved': {
    content: Content;
    approver: string;
  };
  'content:published': {
    content: Content;
    target: PublishingTarget;
  };
  'content:failed': {
    content: Content;
    error: string;
  };

  // System Events
  'system:metrics': SystemMetrics;
  'system:alert': Alert;
  'agent:status': {
    agentId: string;
    status: AgentMetrics;
  };

  // Workflow Events
  'workflow:started': {
    workflowId: string;
    type: string;
    context: any;
  };
  'workflow:completed': {
    workflowId: string;
    result: any;
  };
  'workflow:failed': {
    workflowId: string;
    error: string;
  };

  // LLM Events
  'llm:request': {
    provider: string;
    type: string;
    tokens: number;
  };
  'llm:response': {
    provider: string;
    type: string;
    tokens: number;
    latency: number;
  };
  'llm:error': {
    provider: string;
    error: string;
  };
}
