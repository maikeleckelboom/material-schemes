#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type PackageJson = {
  devDependencies?: Record<string, string>;
};

type RunOptions = {
  cwd: string;
  policyHint?: boolean;
};

type Invocation = {
  command: string;
  args: string[];
  display: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const pnpm = 'pnpm';
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as PackageJson;
const smokeRoot = process.env.MATERIAL_SCHEMES_SMOKE_ROOT ?? tmpdir();
if (process.env.MATERIAL_SCHEMES_SMOKE_ROOT) {
  mkdirSync(smokeRoot, { recursive: true });
}
const tempRoot = mkdtempSync(join(smokeRoot, 'material-schemes-smoke-'));
const keepTemp = process.env.MATERIAL_SCHEMES_KEEP_SMOKE === '1';
let failed = false;

try {
  const packDir = join(tempRoot, 'pack');
  const consumerDir = join(tempRoot, 'consumer');
  mkdirSync(packDir);
  mkdirSync(consumerDir);

  const tarballPath = packPackage(packDir);
  writeConsumer(consumerDir, tarballPath);

  run(pnpm, ['install'], { cwd: consumerDir, policyHint: true });
  run('node', ['smoke-esm.mjs'], { cwd: consumerDir });
  run('node', ['smoke-cjs.cjs'], { cwd: consumerDir });
  run(pnpm, ['exec', 'tsc', '--project', 'tsconfig.json', '--noEmit'], { cwd: consumerDir });

  console.log(`Consumer smoke test passed for ${basename(tarballPath)}.`);
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`Smoke temp directory retained for inspection: ${tempRoot}`);
  process.exitCode = 1;
} finally {
  if (!failed && !keepTemp) {
    rmSync(tempRoot, { recursive: true, force: true });
  } else if (!failed) {
    console.log(`Smoke temp directory retained: ${tempRoot}`);
  }
}

function packPackage(packDir: string): string {
  const before = new Set(listTarballs(packDir));
  run(pnpm, ['pack', '--pack-destination', packDir], { cwd: repoRoot });

  const producedTarballs = listTarballs(packDir).filter((fileName) => !before.has(fileName));
  if (producedTarballs.length !== 1) {
    throw new Error(
      `Expected pnpm pack to produce exactly one tarball in ${packDir}; found ${producedTarballs.length}.`,
    );
  }

  return join(packDir, producedTarballs[0] as string);
}

function writeConsumer(consumerDir: string, tarballPath: string): void {
  const typescriptVersion = packageJson.devDependencies?.typescript ?? '^6.0.0';

  writeJson(join(consumerDir, 'package.json'), {
    private: true,
    type: 'module',
    dependencies: {
      'material-schemes': toFileDependency(consumerDir, tarballPath),
    },
    devDependencies: {
      typescript: typescriptVersion,
    },
  });

  writeFileSync(
    join(consumerDir, 'smoke-esm.mjs'),
    `import assert from 'node:assert/strict';
import { createColorScheme, createCssVariables, createTheme } from 'material-schemes';

const theme = createTheme('#6750a4');
const scheme = createColorScheme(theme);
const css = createCssVariables(scheme, ':root');

assert.equal(typeof theme.source, 'number');
assert.equal(typeof scheme.primary, 'number');
assert.ok(css.includes('--primary:'), 'CSS variables include primary role');
`,
  );

  writeFileSync(
    join(consumerDir, 'smoke-cjs.cjs'),
    `const assert = require('node:assert/strict');
const { createColorScheme, createCssVariables, createTheme } = require('material-schemes');

const theme = createTheme('#6750a4');
const scheme = createColorScheme(theme);
const css = createCssVariables(scheme, ':root');

assert.equal(typeof theme.source, 'number');
assert.equal(typeof scheme.primary, 'number');
assert.ok(css.includes('--primary:'), 'CSS variables include primary role');
`,
  );

  writeFileSync(
    join(consumerDir, 'smoke-types.ts'),
    `import {
  createColorScheme,
  createCssVariables,
  createTheme,
  type ColorScheme,
} from 'material-schemes';

const theme = createTheme('#6750a4');
const scheme: ColorScheme = createColorScheme(theme);
const css: string = createCssVariables(scheme, { selector: ':root' });
const primary: string | number = scheme.primary;

void css;
void primary;
`,
  );

  writeJson(join(consumerDir, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022'],
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      skipLibCheck: false,
    },
    include: ['smoke-types.ts'],
  });
}

function run(command: string, args: string[], options: RunOptions): void {
  const invocation = createInvocation(command, args);
  console.log(`> ${invocation.display}`);

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: options.cwd,
    encoding: 'utf8',
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
      options.policyHint
        ? 'If this is a pnpm build-approval or supply-chain policy failure, do not approve all builds or weaken policy files without review.'
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    throw new Error(message);
  }

  printOutput(result.stdout, console.log);
  printOutput(result.stderr, console.error);
}

function listTarballs(directory: string): string[] {
  return readdirSync(directory).filter((fileName) => fileName.endsWith('.tgz'));
}

function toFileDependency(fromDirectory: string, filePath: string): string {
  return `file:${relative(fromDirectory, filePath).replace(/\\/g, '/')}`;
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
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
