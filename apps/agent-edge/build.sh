#!/bin/bash

# Build script for EdgeNetIQ Edge Agent

set -e

echo "Building EdgeNetIQ Edge Agent..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Build for current platform
echo "Building agent binary..."
CGO_ENABLED=1 go build -o agent ./cmd/agent

echo "Build completed successfully!"
echo "Binary location: ./agent"
echo ""
echo "To run the agent:"
echo "  ./agent -config config.yaml"