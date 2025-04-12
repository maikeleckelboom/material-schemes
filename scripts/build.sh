#!/usr/bin/env bash
# scripts/build.sh
# This script builds every workspace that defines a "build" script.
# It runs sequentially so that any error will stop the process.

set -e

echo "Building all workspaces..."

# Combine apps and packages directories in one loop:
for dir in apps/* packages/*; do
  if [ -d "$dir" ]; then
    # Check if a build script exists in package.json
    if grep -q "\"build\":" "$dir/package.json"; then
      echo "Building $dir ..."
      (cd "$dir" && bun run build)
    else
      echo "Skipping build for $dir (no build script found)."
    fi
  fi
done

echo "Build completed."
