export const SHARED_TYPES = {
  Logger: Symbol.for('Logger'),
  Encryption: Symbol.for('Encryption'),
  Security: Symbol.for('Security'),
  ErrorHandler: Symbol.for('ErrorHandler'),
  ConfigManager: Symbol.for('ConfigManager'),
} as const;
