
const isDev = import.meta.env.MODE === "development";

export type MiamiLogger = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export const createMiamiLogger = (prefix: string): MiamiLogger => {
  return {
    log: (...args: unknown[]) => {
      // Only log in development
      if (isDev) {
        console.log(`${prefix}`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Always log errors
      console.error(`${prefix}`, ...args);
    }
  }
}