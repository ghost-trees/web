/**
 * @file child-process-browser.ts
 * @description
 * Browser-safe shim for Node's `child_process` module.
 *
 * This module is aliased in `vite.config.ts` for both `child_process` and
 * `node:child_process` so browser bundles do not attempt to include Node-only
 * process utilities from transitive dependencies.
 */
type SpawnLike = (..._args: unknown[]) => never;

/**
 * Throws whenever code tries to spawn a child process in a browser context.
 */
const unsupported = (): never => {
  throw new Error('child_process is not available in browser builds.');
};

/**
 * Browser replacement for `child_process.spawn`.
 */
export const spawn: SpawnLike = unsupported;

const childProcess = {
  spawn,
};

export default childProcess;
