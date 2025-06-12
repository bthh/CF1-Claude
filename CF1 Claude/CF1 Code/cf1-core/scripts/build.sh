#!/bin/bash

# CF1 Launchpad Contract Build Script
set -e

echo "🏗️  Building CF1 Launchpad Smart Contract..."

# Clean previous build
echo "Cleaning previous builds..."
cargo clean

# Check formatting
echo "Checking code formatting..."
cargo fmt --check

# Run clippy for linting
echo "Running clippy lints..."
cargo clippy --all-targets --all-features -- -D warnings

# Run tests
echo "Running unit tests..."
cargo test --lib

echo "Running integration tests..."
cargo test integration_tests

# Generate schema
echo "Generating JSON schema..."
cargo run --example schema

# Build optimized wasm
echo "Building optimized WASM..."

# Check if gas-optimized profile should be used
if [ "$GAS_OPTIMIZED" = "true" ]; then
    echo "⚡ Using gas-optimized build profile..."
    RUSTFLAGS='-C link-arg=-s' cargo build --profile gas-optimized --target wasm32-unknown-unknown
else
    RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown
fi

# Check wasm size
echo "Checking WASM size..."
ls -lh target/wasm32-unknown-unknown/release/cf1_core.wasm

# Optional: Use cosmwasm/optimizer if available
if command -v docker &> /dev/null; then
    echo "Running cosmwasm optimizer..."
    docker run --rm -v "$(pwd)":/code \
        --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
        --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
        cosmwasm/optimizer:0.15.0
    
    echo "Optimized WASM size:"
    ls -lh artifacts/cf1_core.wasm
else
    echo "Docker not available, skipping optimization"
fi

echo "✅ Build completed successfully!"
echo ""
echo "📁 Generated files:"
echo "  - WASM binary: target/wasm32-unknown-unknown/release/cf1_core.wasm"
echo "  - Schema files: schema/"
if [ -f "artifacts/cf1_core.wasm" ]; then
    echo "  - Optimized WASM: artifacts/cf1_core.wasm"
fi
echo ""
echo "🚀 Contract is ready for deployment to Neutron testnet!"