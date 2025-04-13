#!/usr/bin/env bun
// scripts/dev.ts
// This script runs the development server from all workspaces using Bun's native APIs

import {existsSync, type PathLike} from "fs";
import {readdir} from "fs/promises";

console.log("Starting development servers from workspaces...");

const processes: any[] = [];

async function startDevServers(dirPath: PathLike, checkPackageJson = false) {
    if (!existsSync(dirPath)) {
        console.log(`Directory '${dirPath}' not found. Skipping.`);
        return;
    }

    try {
        const entries = await readdir(dirPath, {withFileTypes: true});

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const fullPath = `${dirPath}/${entry.name}`;

            if (checkPackageJson) {
                try {
                    const pkgJson = await Bun.file(`${fullPath}/package.json`).json();
                    if (!pkgJson.scripts?.dev) {
                        console.log(`Skipping dev for ${fullPath} (no dev script found).`);
                        continue;
                    }
                } catch (error) {
                    console.error(`Error reading package.json in ${fullPath}: ${error}`);
                    continue;
                }
            }

            console.log(`Starting dev for ${fullPath}...`);
            const proc = Bun.spawn(["bun", "run", "dev"], {
                cwd: fullPath,
                stdio: ["inherit", "inherit", "inherit"], // [stdin, stdout, stderr]
                env: {
                    ...process.env,
                    FORCE_COLOR: "1",
                    BUN_SHELL: "1" // Add Bun-specific environment variables
                }
            });
            processes.push(proc.exited);
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}: ${error}`);
        process.exit(1);
    }
}

// Start apps and packages
await startDevServers("apps");
await startDevServers("packages", true);

// Keep the script alive until all processes exits
await Promise.all(processes);
