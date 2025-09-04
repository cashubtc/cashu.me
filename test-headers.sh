#!/bin/bash

# Test script to verify cross-origin isolation headers are set

echo "Testing development server headers..."
echo "====================================="

# Test dev server (assuming it's running on port 8081 based on the terminal output)
echo "Testing https://localhost:8081/"
curl -I -k https://localhost:8081/ | grep -E "(Cross-Origin-Opener-Policy|Cross-Origin-Embedder-Policy)"

echo ""
echo "Testing production server headers..."
echo "==================================="

# Test production server (assuming it's running on port 3000)
echo "Testing http://localhost:3000/"
curl -I http://localhost:3000/ | grep -E "(Cross-Origin-Opener-Policy|Cross-Origin-Embedder-Policy)"

echo ""
echo "Header verification complete!"
