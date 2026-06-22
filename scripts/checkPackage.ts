#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type PackageJson = {
  dependencies?: Record<string, string>;
  files?: string[];
  publishConfig?: {
    provenance?: boolean;
  };
};

type PackEntry = {
  files: Array<{ path: string }>;
};

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = readJson<PackageJson>('package.json');
const notice = readFileSync(join(repoRoot, 'NOTICE.md'), 'utf8');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

assert(
  packageJson.publishConfig?.provenance === true,
  'package.json must publish with provenance.',
);
assert(
  packageJson.dependencies === undefined || Object.keys(packageJson.dependencies).length === 0,
  'The published package must have zero runtime dependencies.',
);
assert(
  packageJson.files?.includes('NOTICE.md') === true,
  'NOTICE.md must be included in package files.',
);
assert(
  notice.includes('material-foundation/material-color-utilities') &&
    notice.includes('Apache License, Version 2.0'),
  'NOTICE.md must identify the bundled official provider and Apache-2.0 license.',
);

const pack = runPnpmPackJson();
const packedFiles = new Set(pack[0]?.files.map((file) => file.path) ?? []);

for (const requiredFile of [
  'LICENSE',
  'NOTICE.md',
  'README.md',
  'dist/index.cjs',
  'dist/index.d.cts',
  'dist/index.d.ts',
  'dist/index.js',
  'package.json',
]) {
  assert(packedFiles.has(requiredFile), `Packed package must include ${requiredFile}.`);
}

assert(!packedFiles.has('docs/review.md'), 'Review documents must not be packed.');
assert(
  [...packedFiles].every((file) => !file.startsWith('vendor/')),
  'Generated vendor sources must not be packed directly.',
);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(repoRoot, path), 'utf8')) as T;
}

function runPnpmPackJson(): PackEntry[] {
  const invocation = createInvocation(pnpm, ['pack', '--dry-run', '--json']);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        'pnpm pack --dry-run --json failed.',
        (result.stdout ?? '').trim(),
        (result.stderr ?? '').trim(),
        result.error?.message ?? '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return JSON.parse(extractPackJson(result.stdout)) as PackEntry[];
}

function extractPackJson(output: string): string {
  const start = output.indexOf('{');
  if (start === -1) throw new Error('pnpm pack did not emit JSON output.');
  return `[${output.slice(start).trim()}]`;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type Invocation = {
  command: string;
  args: string[];
};

function createInvocation(command: string, args: string[]): Invocation {
  if (process.platform !== 'win32') return { command, args };

  return {
    command: process.env.ComSpec ?? 'cmd.exe',
    args: ['/d', '/s', '/c', [command, ...args].join(' ')],
  };
}
