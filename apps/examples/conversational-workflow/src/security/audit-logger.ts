import { Message } from '../agents/base-agent';

export interface AuditLogEntry {
  timestamp: number;
  eventType: string;
  agentId?: string;
  workflowId?: string;
  messageType?: string;
  details: any;
  severity: 'info' | 'warning' | 'error';
}

export class AuditLogger {
  private static instance: AuditLogger;
  private auditLog: AuditLogEntry[] = [];
  private readonly maxLogSize: number = 1000;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public async logMessageEvent(
    eventType: string,
    message: Message,
    details?: any,
    severity: 'info' | 'warning' | 'error' = 'info'
  ) {
    const entry: AuditLogEntry = {
      timestamp: Date.now(),
      eventType,
      agentId: message.metadata.source,
      workflowId: message.metadata.workflowId,
      messageType: message.type,
      details: {
        target: message.metadata.target,
        ...details
      },
      severity
    };

    await this.addLogEntry(entry);
  }

  public async logSecurityEvent(
    eventType: string,
    details: any,
    severity: 'info' | 'warning' | 'error' = 'info'
  ) {
    const entry: AuditLogEntry = {
      timestamp: Date.now(),
      eventType,
      details,
      severity
    };

    await this.addLogEntry(entry);
  }

  private async addLogEntry(entry: AuditLogEntry) {
    // Add entry to the log
    this.auditLog.push(entry);

    // Maintain max log size
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize);
    }

    // Log to console based on severity
    const logMessage = `[${entry.severity.toUpperCase()}] ${entry.eventType}: ${JSON.stringify(entry.details)}`;
    switch (entry.severity) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warning':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  public getAuditLog(
    filters?: {
      severity?: 'info' | 'warning' | 'error';
      eventType?: string;
      agentId?: string;
      workflowId?: string;
      startTime?: number;
      endTime?: number;
    }
  ): AuditLogEntry[] {
    let filteredLog = [...this.auditLog];

    if (filters) {
      if (filters.severity) {
        filteredLog = filteredLog.filter(entry => entry.severity === filters.severity);
      }
      if (filters.eventType) {
        filteredLog = filteredLog.filter(entry => entry.eventType === filters.eventType);
      }
      if (filters.agentId) {
        filteredLog = filteredLog.filter(entry => entry.agentId === filters.agentId);
      }
      if (filters.workflowId) {
        filteredLog = filteredLog.filter(entry => entry.workflowId === filters.workflowId);
      }
      if (filters.startTime) {
        filteredLog = filteredLog.filter(entry => entry.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filteredLog = filteredLog.filter(entry => entry.timestamp <= filters.endTime!);
      }
    }

    return filteredLog;
  }

  public clearAuditLog() {
    this.auditLog = [];
  }
}
