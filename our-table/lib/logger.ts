/**
 * OurTable — Development Logger
 *
 * Outputs structured, colour-coded logs to the Metro / PowerShell console.
 * All logging is a no-op in production builds (__DEV__ === false).
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *
 *   logger.info('auth', 'User signed in', { userId: '123' });
 *   logger.error('db', 'Insert failed', error);
 *   logger.debug('couple', 'Invite code generated', { code });
 *
 * Or create a scoped logger for a module:
 *   const log = logger.scope('couple');
 *   log.info('Table created', { coupleId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Scope = string;

interface LogEntry {
  level: LogLevel;
  scope: Scope;
  message: string;
  data?: unknown;
  timestamp: string;
}

// ── Visual config ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<LogLevel, { label: string }> = {
  debug: { label: 'DEBUG' },
  info: { label: 'INFO ' },
  warn: { label: 'WARN ' },
  error: { label: 'ERROR' },
};

// ── Core log function ─────────────────────────────────────────────────────────

function log(level: LogLevel, scope: Scope, message: string, data?: unknown): void {
  if (!__DEV__) return;

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

  const { label } = LEVEL_CONFIG[level];
  const prefix = `${label} [${time}] [${scope.toUpperCase()}]`;
  const line = `${prefix}  ${message}`;

  const entry: LogEntry = { level, scope, message, data, timestamp: time };

  switch (level) {
    case 'debug':
      data !== undefined ? console.debug(line, data) : console.debug(line);
      break;
    case 'info':
      data !== undefined ? console.log(line, data) : console.log(line);
      break;
    case 'warn':
      data !== undefined ? console.warn(line, data) : console.warn(line);
      break;
    case 'error':
      data !== undefined ? console.error(line, data) : console.error(line);
      break;
  }
}

// ── Scoped logger factory ─────────────────────────────────────────────────────

function createScopedLogger(scope: Scope) {
  return {
    debug: (message: string, data?: unknown) => log('debug', scope, message, data),
    info: (message: string, data?: unknown) => log('info', scope, message, data),
    warn: (message: string, data?: unknown) => log('warn', scope, message, data),
    error: (message: string, data?: unknown) => log('error', scope, message, data),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {
  /** Log at debug level — for fine-grained tracing */
  debug: (scope: Scope, message: string, data?: unknown) => log('debug', scope, message, data),

  /** Log at info level — for normal significant events */
  info: (scope: Scope, message: string, data?: unknown) => log('info', scope, message, data),

  /** Log at warn level — for unexpected but recoverable situations */
  warn: (scope: Scope, message: string, data?: unknown) => log('warn', scope, message, data),

  /** Log at error level — for failures that need attention */
  error: (scope: Scope, message: string, data?: unknown) => log('error', scope, message, data),

  /**
   * Create a pre-scoped logger for a specific module.
   * Removes the need to pass a scope on every call.
   *
   * @example
   *   const log = logger.scope('auth');
   *   log.info('Signed in', { userId });
   */
  scope: createScopedLogger,
};

// ── Pre-built scoped loggers for common modules ───────────────────────────────

export const authLog = logger.scope('auth');
export const dbLog = logger.scope('db');
export const coupleLog = logger.scope('couple');
export const layoutLog = logger.scope('layout');
