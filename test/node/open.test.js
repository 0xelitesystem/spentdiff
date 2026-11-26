// Report opener: the Windows opener is an absolute path, never a bare name looked up in the current folder.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { openCommand } from '../../src/node/open.js';

test('openCommand: Windows uses %SystemRoot%\\explorer.exe, an absolute path', () => {
  const c = openCommand('C:\\r\\report.html', 'win32', { SystemRoot: 'D:\\Win' });
  assert.equal(c.command, 'D:\\Win\\explorer.exe');
  assert.ok(path.win32.isAbsolute(c.command));
  assert.deepEqual(c.args, ['C:\\r\\report.html']);
});

test('openCommand: Windows falls back to C:\\Windows when SystemRoot is unset', () => {
  const c = openCommand('C:\\r\\report.html', 'win32', {});
  assert.equal(c.command, 'C:\\Windows\\explorer.exe');
});

test('openCommand: a relative or drive-relative SystemRoot falls back to C:\\Windows', () => {
  assert.equal(openCommand('C:\\r\\report.html', 'win32', { SystemRoot: 'Win' }).command, 'C:\\Windows\\explorer.exe');
  assert.equal(openCommand('C:\\r\\report.html', 'win32', { SystemRoot: 'C:Windows' }).command, 'C:\\Windows\\explorer.exe');
});

test('openCommand: macOS and Linux keep the PATH openers', () => {
  assert.equal(openCommand('/r/report.html', 'darwin', {}).command, 'open');
  assert.equal(openCommand('/r/report.html', 'linux', {}).command, 'xdg-open');
});
