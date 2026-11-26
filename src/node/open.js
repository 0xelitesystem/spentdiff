// Open the finished report in the default browser (DESIGN 8.1, 8.8).
//
// Runs in the LAUNCHER only, after the sandboxed scanner has exited: the scanner has no
// child-process permission. The file is handed to the operating system's default handler; no
// shell parses the path, and nothing waits on the browser.
//   Windows: %SystemRoot%\explorer.exe <file>   macOS: open <file>   Linux and others: xdg-open <file>
// Windows gets an absolute path: a bare 'explorer.exe' is looked up in the current folder before PATH,
// so a planted explorer.exe in the folder spentdiff was started from would run instead.

import { spawn } from 'node:child_process';
import path from 'node:path';

/**
 * @param {string} file absolute path
 * @param {string} [platform]
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ command: string, args: string[] }}
 */
export function openCommand(file, platform = process.platform, env = process.env) {
  if (platform === 'win32') {
    const root = env.SystemRoot && path.win32.isAbsolute(env.SystemRoot) ? env.SystemRoot : 'C:\\Windows';
    return { command: path.win32.join(root, 'explorer.exe'), args: [file] };
  }
  if (platform === 'darwin') return { command: 'open', args: [file] };
  return { command: 'xdg-open', args: [file] };
}

/**
 * Fire and forget. Resolves true when the opener process started, false when it could not be
 * started (no desktop, no xdg-open); the caller then prints the path to open by hand.
 * explorer.exe exits with code 1 even on success, so exit codes are ignored.
 * @param {string} file
 * @param {{ platform?: string, spawnImpl?: typeof spawn }} [o]
 * @returns {Promise<boolean>}
 */
export function openFile(file, o = {}) {
  const { command, args } = openCommand(file, o.platform);
  const spawnImpl = o.spawnImpl ?? spawn;
  return new Promise((resolve) => {
    let child;
    try {
      child = spawnImpl(command, args, { stdio: 'ignore', detached: true, windowsHide: false, shell: false });
    } catch {
      resolve(false);
      return;
    }
    child.once('error', () => resolve(false));
    child.once('spawn', () => {
      child.unref();
      resolve(true);
    });
  });
}
