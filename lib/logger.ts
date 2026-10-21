/**
 * Minimal structured logging.
 *
 * One job: emit consistent, machine-parseable lines so Vercel's log drain (or
 * any future Sentry/Logtail hook) can filter by level, route, and error
 * without regexing free-form console output. No dependencies — a logging
 * library is a lot of weight for an app this size, and console output is
 * already captured by the host.
 *
 * - Production: single-line JSON (`{"level":"error",...}`), which log drains
 *   parse natively.
 * - Development: readable `HH:MM:SS LEVEL message {context}`.
 *
 * Client-safe: only touches `console`, so app/error.tsx can import it too.
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function threshold(): number {
  const raw = process.env.LOG_LEVEL as Level | undefined;
  return raw && raw in LEVEL_ORDER ? LEVEL_ORDER[raw] : LEVEL_ORDER.info;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }
  return { errorMessage: String(error) };
}

function emit(level: Level, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < threshold()) return;

  const isProd = process.env.NODE_ENV === "production";
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ?? {}),
  };

  const line = isProd
    ? JSON.stringify(payload)
    : `${payload.timestamp.slice(11, 19)} ${level.toUpperCase().padEnd(5)} ${message}${
        context ? ` ${JSON.stringify(context)}` : ""
      }`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  /** `context.error` is unwrapped into its own fields automatically. */
  error: (message: string, context?: Record<string, unknown>) =>
    emit(
      "error",
      message,
      context && "error" in context
        ? { ...context, ...serializeError(context.error) }
        : context,
    ),
};
