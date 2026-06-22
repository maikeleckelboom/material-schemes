#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

type CommitResponse = {
  sha?: string;
};

const owner = 'material-foundation';
const repo = 'material-color-utilities';
const ref = readOption('--ref') ?? process.env.MATERIAL_COLOR_UTILITIES_REF ?? 'main';
const ensure = process.argv.includes('--ensure');
const force = process.argv.includes('--force');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const vendorRoot = resolve(repoRoot, 'vendor', 'material-color-utilities');
const vendorSourceRoot = join(vendorRoot, 'src');
const vendorDistRoot = join(vendorRoot, 'dist');
const metadataPath = join(vendorRoot, 'VENDORED_SOURCE.json');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const sha = await resolveRef(ref);

  if (ensure && !force && isCurrentVendor(sha)) {
    console.log(`Material Color Utilities vendor is current at ${sha}.`);
    return;
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'material-color-utilities-'));

  try {
    const archivePath = join(tempRoot, 'source.tar.gz');
    await download(`https://codeload.github.com/${owner}/${repo}/tar.gz/${sha}`, archivePath);

    extractTarball(archivePath, tempRoot);

    const sourceRoot = findTypescriptSourceRoot(tempRoot);
    const vendorParent = dirname(vendorRoot);
    rmSync(vendorRoot, { recursive: true, force: true });
    mkdirSync(vendorParent, { recursive: true });
    cpSync(sourceRoot, vendorSourceRoot, {
      recursive: true,
      filter: shouldCopyVendorPath,
    });

    writeVendorTsconfig();
    compileVendor();
    writeMetadata(sha);

    console.log(
      `Vendored official Material Color Utilities ${sha} into ${relativeToRepo(vendorRoot)}.`,
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function resolveRef(refName: string): Promise<string> {
  if (/^[0-9a-f]{40}$/i.test(refName)) return refName;

  const response = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(refName)}`,
  );
  const body = (await response.json()) as CommitResponse;
  if (!body.sha || !/^[0-9a-f]{40}$/i.test(body.sha)) {
    throw new Error(`Could not resolve official Material Color Utilities ref: ${refName}`);
  }
  return body.sha;
}

async function download(url: string, outputPath: string): Promise<void> {
  const response = await githubFetch(url);
  const bytes = new Uint8Array(await response.arrayBuffer());
  writeFileSync(outputPath, bytes);
}

async function githubFetch(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'material-schemes-vendor-script',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${url}`);
  }

  return response;
}

function extractTarball(archivePath: string, destination: string): void {
  const tar = process.platform === 'win32' ? 'tar.exe' : 'tar';
  const result = spawnSync(tar, ['-xzf', archivePath, '-C', destination], {
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        'Failed to extract official source archive.',
        (result.stdout ?? '').trim(),
        (result.stderr ?? '').trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
}

function findTypescriptSourceRoot(extractedRoot: string): string {
  for (const entry of readdirSync(extractedRoot)) {
    const candidate = join(extractedRoot, entry, 'typescript');
    if (existsSync(join(candidate, 'index.ts'))) return candidate;
  }

  throw new Error('Official source archive did not contain typescript/index.ts.');
}

function shouldCopyVendorPath(source: string): boolean {
  const parts = source.split(sep);
  const name = parts[parts.length - 1] ?? '';

  if (parts.some((part) => ['node_modules', '.wireit'].includes(part))) return false;
  if (name.endsWith('_test.ts')) return false;
  if (name === 'test_utils.ts') return false;
  if (name === '.tsbuildinfo') return false;

  return true;
}

function writeVendorTsconfig(): void {
  writeFileSync(
    join(vendorRoot, 'tsconfig.material-schemes.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          rootDir: 'src',
          outDir: 'dist',
          declaration: true,
          declarationMap: false,
          sourceMap: true,
          inlineSources: true,
          strict: true,
          strictNullChecks: false,
          skipLibCheck: true,
          noEmitOnError: true,
          types: [],
        },
        include: ['src/**/*.ts'],
        exclude: ['src/**/*_test.ts', 'src/**/test_utils.ts'],
      },
      null,
      2,
    )}\n`,
  );
}

function compileVendor(): void {
  const invocation = createInvocation(pnpm, [
    'exec',
    'tsc',
    '--project',
    join(vendorRoot, 'tsconfig.material-schemes.json'),
  ]);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        'Failed to compile official Material Color Utilities vendor source.',
        (result.stdout ?? '').trim(),
        (result.stderr ?? '').trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
}

function writeMetadata(sha: string): void {
  writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        repository: `${owner}/${repo}`,
        ref,
        sha,
        sourcePath: 'typescript',
        fetchedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

function isCurrentVendor(sha: string): boolean {
  if (!existsSync(metadataPath) || !existsSync(join(vendorDistRoot, 'index.js'))) return false;

  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as { sha?: string };
    return metadata.sha === sha;
  } catch {
    return false;
  }
}

function readOption(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

type Invocation = {
  command: string;
  args: string[];
};

function createInvocation(command: string, args: string[]): Invocation {
  if (process.platform !== 'win32') return { command, args };

  return {
    command: process.env.ComSpec ?? 'cmd.exe',
    args: ['/d', '/s', '/c', formatCommand(command, args)],
  };
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args.map(quoteArgument)].join(' ');
}

function quoteArgument(argument: string): string {
  return /\s/.test(argument) ? `"${argument.replace(/"/g, '\\"')}"` : argument;
}

function relativeToRepo(path: string): string {
  return relative(repoRoot, path).replace(/\\/g, '/');
}
