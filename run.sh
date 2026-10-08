#!/bin/bash

set -u

# ==============================
# Project configuration
# ==============================
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="5173"
HOST="127.0.0.1"

echo "======================================"
echo "  حين عبرت مصر - Local Server"
echo "======================================"
echo "Project: $PROJECT_DIR"
echo "Port:    $PORT"
echo ""

cd "$PROJECT_DIR" || {
    echo "❌ Cannot access project directory"
    exit 1
}

# ==============================
# Check Node / npm
# ==============================
echo "[1/4] Checking Node..."

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "Node: $(node --version)"

if command -v npm >/dev/null 2>&1; then
    echo "npm:  $(npm --version)"
else
    echo "❌ npm is not installed"
    exit 1
fi

# ==============================
# Install dependencies
# ==============================
echo ""
echo "[2/4] Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "node_modules not found."
    echo "Installing dependencies..."
    npm install
else
    echo "✓ node_modules exists"
fi

# ==============================
# Fix Android esbuild if needed
# ==============================
echo ""
echo "[3/4] Checking esbuild..."

if [ -d "node_modules/@esbuild/android-arm64/bin" ]; then
    ESBUILD="node_modules/@esbuild/android-arm64/bin/esbuild"

    if [ -f "$ESBUILD" ]; then
        chmod +x "$ESBUILD" 2>/dev/null || true

        if "$ESBUILD" --version >/dev/null 2>&1; then
            echo "✓ Android esbuild works"
        else
            echo "⚠ Android esbuild exists but does not run"
        fi
    fi
else
    echo "Android esbuild not found."
    echo "Installing..."

    npm install --no-save --no-audit --no-fund --force \
        --os=android \
        --cpu=arm64 \
        @esbuild/android-arm64@0.27.7

    if [ -f "node_modules/@esbuild/android-arm64/bin/esbuild" ]; then
        chmod +x node_modules/@esbuild/android-arm64/bin/esbuild
    fi
fi

# ==============================
# Start Vite
# ==============================
echo ""
echo "[4/4] Starting Vite..."
echo ""

# Kill only Vite processes belonging to this project/port
pkill -f "vite.*--port $PORT" >/dev/null 2>&1 || true

sleep 1

echo "======================================"
echo "  PROJECT READY"
echo "======================================"
echo ""
echo "Local URL:"
echo "http://$HOST:$PORT/"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev -- --host "$HOST" --port "$PORT"
