type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  severity: ErrorSeverity;
  component?: string;
  stack?: string;
  data?: unknown;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogEntry[] = [];
  private readonly MAX_LOGS = 100;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(severity: ErrorSeverity, message: string, component?: string, data?: unknown): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message,
      severity,
      component,
      data,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }

    if (severity === 'critical') {
      console.error('Critical Error:', entry);
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = ErrorLogger.getInstance();
