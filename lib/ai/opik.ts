import { Opik } from 'opik';

// Initialize Opik client singleton
let opikInstance: Opik | null = null;

export function getOpikClient(): Opik | null {
  if (!process.env.OPIK_API_KEY) {
    console.warn('⚠️ OPIK_API_KEY not set - Opik tracing disabled');
    return null;
  }

  if (!opikInstance) {
    opikInstance = new Opik({
      apiKey: process.env.OPIK_API_KEY,
      projectName: process.env.OPIK_PROJECT_NAME || 'studymate-ai',
    });
    console.log('✅ Opik client initialized for project:', process.env.OPIK_PROJECT_NAME || 'studymate-ai');
  }

  return opikInstance;
}

// Export singleton instance (lazy initialization)
export const opik = {
  get client() {
    return getOpikClient();
  }
};

/**
 * Trace metadata for AI calls
 */
export interface TraceMetadata {
  latencyMs: number;
  status: 'success' | 'error';
  error?: string;
  tokenCount?: number;
  model?: string;
  [key: string]: unknown;
}

/**
 * Generic trace wrapper for AI calls
 * Automatically traces LLM calls with Opik for observability
 */
export async function traceAICall<T>(
  name: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const client = getOpikClient();
  const startTime = Date.now();

  // If Opik is not configured, just run the function
  if (!client) {
    return fn();
  }

  // Create a trace for this AI call
  const trace = client.trace({
    name,
    input,
    metadata: {
      environment: process.env.OPIK_ENVIRONMENT || process.env.NODE_ENV || 'development',
      ...metadata,
    },
  });

  try {
    const result = await fn();

    const latencyMs = Date.now() - startTime;

    // End the trace with success
    trace.end({
      output: { result },
      metadata: {
        latencyMs,
        status: 'success',
      },
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // End the trace with error
    trace.end({
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      metadata: {
        latencyMs,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Create a span within an existing trace for nested operations
 */
export async function traceSpan<T>(
  parentTrace: ReturnType<Opik['trace']>,
  name: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  const span = parentTrace.span({
    name,
    input,
  });

  try {
    const result = await fn();

    span.end({
      output: { result },
      metadata: {
        latencyMs: Date.now() - startTime,
        status: 'success',
      },
    });

    return result;
  } catch (error) {
    span.end({
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      metadata: {
        latencyMs: Date.now() - startTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Log feedback for a trace (e.g., match outcome, user rating)
 */
export async function logFeedback(
  traceId: string,
  score: number,
  category: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const client = getOpikClient();

  if (!client) {
    console.warn('⚠️ Opik not configured - feedback not logged');
    return;
  }

  try {
    await client.logFeedbackScore({
      id: traceId,
      name: category,
      value: score,
      reason: metadata?.reason as string,
    });
  } catch (error) {
    console.error('❌ Failed to log feedback to Opik:', error);
  }
}

/**
 * Flush all pending traces (call before process exit)
 */
export async function flushTraces(): Promise<void> {
  const client = getOpikClient();

  if (client) {
    try {
      await client.flush();
      console.log('✅ Opik traces flushed successfully');
    } catch (error) {
      console.error('❌ Failed to flush Opik traces:', error);
    }
  }
}
