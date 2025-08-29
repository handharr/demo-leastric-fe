class Logger {
  private static env =
    typeof process !== "undefined"
      ? process.env.NEXT_NODE_ENV || process.env.NODE_ENV
      : undefined;

  private static shouldLog(): boolean {
    // Only log if not production
    return Logger.env !== "production";
  }

  static debug(identifier: string, ...args: unknown[]) {
    if (Logger.shouldLog()) console.debug(`[Logger][${identifier}]`, ...args);
  }

  static info(identifier: string, ...args: unknown[]) {
    if (Logger.shouldLog()) console.info(`[Logger][${identifier}]`, ...args);
  }

  static warn(identifier: string, ...args: unknown[]) {
    if (Logger.shouldLog()) console.warn(`[Logger][${identifier}]`, ...args);
  }

  static error(identifier: string, ...args: unknown[]) {
    if (Logger.shouldLog()) console.error(`[Logger][${identifier}]`, ...args);
  }
}

export { Logger };
