
const isDev = import.meta.env.MODE === "development";

export type MiamiLogger = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

export const createMiamiLogger = (prefix?: string): MiamiLogger => {
  return {
    log: (...args: unknown[]) => {
      // Only log in development
      if (isDev) {
        console.log(`LOG: ${prefix ? '[' + prefix + ']' : ''}`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Always log errors
      console.error(`ERROR: ${prefix ? '[' + prefix + ']' : ''}`, ...args);
    },
    warn: (...args: unknown[]) => {
      // Always log warnings
      console.warn(`WARN: ${prefix ? '[' + prefix + ']' : ''}`, ...args);
    },
  }
}