import { EventEmitter } from 'events';
import { Message } from '../agents/base-agent';
import { SecurityManager } from '../security/security-manager';
import { AuditLogger } from '../security/audit-logger';

export class CommunicationHub extends EventEmitter {
  private static instance: CommunicationHub;
  private agents: Map<string, EventEmitter>;
  private securityManager: SecurityManager;
  private auditLogger: AuditLogger;

  private constructor() {
    super();
    this.agents = new Map();
    this.securityManager = SecurityManager.getInstance();
    this.auditLogger = AuditLogger.getInstance();
  }

  public static getInstance(): CommunicationHub {
    if (!CommunicationHub.instance) {
      CommunicationHub.instance = new CommunicationHub();
    }
    return CommunicationHub.instance;
  }

  public registerAgent(agentId: string, agent: EventEmitter): void {
    console.log(`Registering agent: ${agentId}`);
    this.agents.set(agentId.toLowerCase(), agent);
  }

  public async broadcast(message: Message): Promise<void> {
    try {
      const secureMessage = await this.securityManager.processMessage(message, 'communication_hub');

      if (secureMessage.metadata.target) {
        const targetAgent = this.agents.get(secureMessage.metadata.target.toLowerCase());
        if (targetAgent) {
          console.log(`Broadcasting to target agent: ${secureMessage.metadata.target}`);
          targetAgent.emit('message', secureMessage);
        } else {
          throw new Error(`Target agent not found: ${secureMessage.metadata.target}`);
        }
      } else {
        // Broadcast to all agents
        console.log(`Broadcasting to all agents: ${this.agents.size} agents`);
        for (const [agentId, agent] of this.agents.entries()) {
          console.log(`Broadcasting to agent: ${agentId}`);
          agent.emit('message', secureMessage);
        }
      }

      await this.auditLogger.logSecurityEvent(
        'MESSAGE_BROADCAST',
        { message: secureMessage },
        'info'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.handleError(new Error(errorMessage), message);
    }
  }

  private async handleError(error: Error, context?: Message): Promise<void> {
    await this.auditLogger.logSecurityEvent(
      'COMMUNICATION_ERROR',
      { error: error.message, context },
      'error'
    );

    this.emit('error', { error, context });
  }

  public async shutdown(): Promise<void> {
    try {
      this.agents.clear();
      this.removeAllListeners();

      await this.auditLogger.logSecurityEvent(
        'COMMUNICATION_HUB_SHUTDOWN',
        { timestamp: Date.now() },
        'info'
      );
    } catch (error) {
      await this.handleError(new Error('Shutdown error'));
    }
  }
}
