import "server-only";
import { StackServerApp } from "@stackframe/stack";

let _app: StackServerApp | undefined;

function getApp(): StackServerApp {
  if (!_app) {
    _app = new StackServerApp({ tokenStore: "nextjs-cookie" });
  }
  return _app;
}

// Proxy defers StackServerApp construction to request time, not module load time.
// This prevents build failures when env vars aren't set during the build step.
export const stackServerApp = new Proxy({} as StackServerApp, {
  get(_, prop: string | symbol) {
    const app = getApp();
    const value = (app as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(app) : value;
  },
});
