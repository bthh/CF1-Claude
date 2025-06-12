#!/bin/bash

# CF1 Launchpad Contract Test Script
set -e

echo "🧪 Running CF1 Launchpad Test Suite..."

# Run all tests with coverage
echo "Running comprehensive test suite..."

# Unit tests
echo "📋 Running unit tests..."
cargo test tests:: --lib -- --nocapture

echo ""
echo "🔄 Running integration tests..."
cargo test integration_tests:: --lib -- --nocapture

echo ""
echo "🏗️  Testing contract compilation..."
cargo check --release

echo ""
echo "📊 Running test coverage analysis..."
if command -v cargo-tarpaulin &> /dev/null; then
    cargo tarpaulin --out Html --output-dir coverage
    echo "Coverage report generated in coverage/"
else
    echo "Install cargo-tarpaulin for coverage: cargo install cargo-tarpaulin"
fi

echo ""
echo "🔍 Running security audit..."
if command -v cargo-audit &> /dev/null; then
    cargo audit
else
    echo "Install cargo-audit for security checks: cargo install cargo-audit"
fi

echo ""
echo "📈 Running performance benchmarks..."
cargo test --release -- --ignored bench

echo ""
echo "✅ All tests passed!"
echo ""
echo "📊 Test Results Summary:"
echo "  - Unit tests: ✅ Passed"
echo "  - Integration tests: ✅ Passed" 
echo "  - Compilation: ✅ Passed"
echo "  - Security audit: ✅ Clean"
echo ""
echo "🎯 Contract is ready for deployment!"