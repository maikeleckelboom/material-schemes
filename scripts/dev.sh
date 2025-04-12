#!/usr/bin/env bash
# scripts/dev.sh
# This script runs the development server for all workspaces.
# It assumes that each workspace (in apps and packages) has a "dev" script defined in its package.json.

set -e

echo "Starting development servers for workspaces..."

# Loop through apps/ directory
for dir in apps/*; do
  if [ -d "$dir" ]; then
    echo "Starting dev for $dir ..."
    # Run in background so that multiple dev servers can run concurrently.
    (cd "$dir" && bun run dev) &
  fi
done

# Loop through packages/ directory
for dir in packages/*; do
  if [ -d "$dir" ]; then
    # Not all packages may provide a dev script.
    if grep -q "\"dev\":" "$dir/package.json"; then
      echo "Starting dev for $dir ..."
      (cd "$dir" && bun run dev) &
    else
      echo "Skipping dev for $dir (no dev script found)."
    fi
  fi
done

# Wait for background processes if you want the script to hold
wait
