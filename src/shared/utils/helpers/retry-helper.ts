/**
 * Retry handler utility for API calls with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
}

export class RetryHandler {
  private static defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: unknown) => {
      // Default: retry on network errors and 5xx server errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        const status = axiosError.response?.status;
        return !status || status >= 500 || status === 408 || status === 429;
      }
      return true; // Retry on network errors
    },
    onRetry: () => {},
  };

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: unknown;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        return {
          success: true,
          data: result,
          attempts: attempt + 1,
        };
      } catch (error) {
        lastError = error;

        // Don't retry if this is the last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (!config.retryCondition(error)) {
          break;
        }

        // Call retry callback
        config.onRetry(attempt + 1, error);

        // Wait before retrying
        await this.delay(delay);

        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: config.maxRetries + 1,
    };
  }

  /**
   * Delay execution for specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for authentication-related errors
   */
  static createAuthRetryCondition(excludeAuthErrors = false) {
    return (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        const status = axiosError.response?.status;

        // Don't retry auth errors if excluded
        if (excludeAuthErrors && (status === 401 || status === 403)) {
          return false;
        }

        // Retry on server errors, timeouts, and rate limits
        return !status || status >= 500 || status === 408 || status === 429;
      }
      return true;
    };
  }
}
