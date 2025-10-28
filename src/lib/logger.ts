import { isDev } from "./is-dev";

export const logger = {
  error(...args: unknown[]) {
    if (isDev()) {
      console.error(...args);
    }
  },
  warn(...args: unknown[]) {
    if (isDev()) {
      console.warn(...args);
    }
  },
  info(...args: unknown[]) {
    if (isDev()) {
      console.info(...args);
    }
  },
  debug(...args: unknown[]) {
    if (isDev()) {
      console.debug(...args);
    }
  },
};
