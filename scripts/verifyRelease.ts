#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
} from 'node:fs';
import { EOL, tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

type Invocation = {
  command: string;
  args: string[];
  display: string;
};

type RunOptions = {
  cwd: string;
  env?: Record<string, string | undefined>;
  printOutput?: boolean;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const pnpm = 'pnpm';
const verificationRoot = mkVerificationRoot();
const workspaceRoot = join(verificationRoot, 'workspace');
const smokeRoot = join(verificationRoot, 'runner~1');
let failed = false;

try {
  run('git', ['diff', '--check'], { cwd: repoRoot });
  run('git', ['diff', '--cached', '--check'], { cwd: repoRoot });

  mkdirSync(workspaceRoot, { recursive: true });
  copyWorkingTree(workspaceRoot);

  run(pnpm, ['install', '--frozen-lockfile'], { cwd: workspaceRoot });
  run(pnpm, ['release:check'], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      MATERIAL_SCHEMES_SMOKE_ROOT: smokeRoot,
    },
  });
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`Verification temp directory retained for inspection: ${verificationRoot}`);
  writeRetainedDirectory(verificationRoot);
  process.exitCode = 1;
} finally {
  if (!failed) {
    rmSync(verificationRoot, { recursive: true, force: true });
  }
}

function mkVerificationRoot(): string {
  return mkdtempSync(join(tmpdir(), 'material-schemes-verify-'));
}

function copyWorkingTree(destinationRoot: string): void {
  const files = runCapture(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {
      cwd: repoRoot,
      printOutput: false,
    },
  )
    .split('\0')
    .filter(Boolean);

  for (const relativePath of files) {
    if (!shouldCopy(relativePath)) continue;

    const sourcePath = resolve(repoRoot, relativePath);
    const destinationPath = resolve(destinationRoot, relativePath);

    if (!isInside(repoRoot, sourcePath) || !isInside(destinationRoot, destinationPath)) {
      throw new Error(`Refusing to copy unsafe path: ${relativePath}`);
    }

    if (!existsSync(sourcePath)) continue;

    const sourceStat = statSync(sourcePath);
    if (!sourceStat.isFile()) continue;

    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}

function shouldCopy(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  const parts = normalized.split('/');

  if (normalized.startsWith('/') || normalized.includes('\0')) return false;

  return !parts.some((part) => ['.git', '.idea', '.vscode', 'node_modules', 'dist'].includes(part));
}

function runCapture(command: string, args: string[], options: RunOptions): string {
  const result = run(command, args, options);
  return result.stdout ?? '';
}

function run(
  command: string,
  args: string[],
  options: RunOptions,
): { stdout: string | null; stderr: string | null } {
  const invocation = createInvocation(command, args);
  console.log(`> ${invocation.display}`);

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env ?? process.env,
    shell: false,
  });

  if (result.error) {
    throw new Error(`Failed to start command: ${invocation.display}\n${result.error}`);
  }

  if (result.status !== 0) {
    const message = [
      `Command failed with exit code ${result.status}: ${invocation.display}`,
      `Working directory: ${options.cwd}`,
      formatOutput('stdout', result.stdout),
      formatOutput('stderr', result.stderr),
    ]
      .filter(Boolean)
      .join('\n\n');

    throw new Error(message);
  }

  if (options.printOutput !== false) {
    printOutput(result.stdout, console.log);
    printOutput(result.stderr, console.error);
  }

  return { stdout: result.stdout, stderr: result.stderr };
}

function createInvocation(command: string, args: string[]): Invocation {
  const display = formatCommand(command, args);

  if (process.platform === 'win32' && command === pnpm) {
    return {
      command: process.env.ComSpec ?? 'cmd.exe',
      args: ['/d', '/s', '/c', display],
      display,
    };
  }

  return { command, args, display };
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args.map(quoteArgument)].join(' ');
}

function quoteArgument(argument: string): string {
  return /\s/.test(argument) ? `"${argument.replace(/"/g, '\\"')}"` : argument;
}

function formatOutput(label: string, output: string | null): string {
  const trimmed = output?.trim();
  return trimmed ? `${label}:\n${trimmed}` : '';
}

function printOutput(output: string | null, write: (message: string) => void): void {
  const trimmed = output?.trim();
  if (trimmed) write(trimmed);
}

function isInside(root: string, candidate: string): boolean {
  const rootWithSeparator = ensureTrailingSeparator(resolve(root));
  const resolvedCandidate = resolve(candidate);

  return resolvedCandidate === resolve(root) || resolvedCandidate.startsWith(rootWithSeparator);
}

function ensureTrailingSeparator(path: string): string {
  return path.endsWith(sep) ? path : `${path}${sep}`;
}

function writeRetainedDirectory(directory: string): void {
  const githubEnv = process.env.GITHUB_ENV;
  if (!githubEnv) return;

  appendFileSync(githubEnv, `VERIFY_RELEASE_RETAINED_DIR=${directory}${EOL}`);
}
