#!/bin/bash
# filepath: /home/nikola/Documents/vscode/sunday-heroes/vercel-build.sh
set -e  # Exit immediately if a command exits with non-zero status

echo "======================================"
echo "Starting build process for Vercel deployment"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "======================================"

# 1. Build logger package
echo "Building @repo/logger package..."
cd packages/logger
npm ci
npm run build
echo "@repo/logger build completed"

# 2. Create node_modules structure in dist
echo "Setting up @repo/logger in dist/node_modules..."
mkdir -p ../../dist/node_modules/@repo/logger
cp -r ./dist ../../dist/node_modules/@repo/logger/
cd ../..
echo "Logger package prepared for consumption"

# 3. Build server
echo "Building server application..."
cd apps/server
npm ci
npm run build:vercel
cd ../..
echo "Server build completed"

# 4. Build client
echo "Building client application..."
cd apps/client
npm ci
VITE_MODE=production npm run build:vercel
cd ../..
echo "Client build completed"

echo "======================================"
echo "Build process completed successfully!"
echo "Final dist directory structure:"
find ./dist -type d | sort
echo "======================================"