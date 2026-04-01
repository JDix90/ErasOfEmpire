#!/usr/bin/env bash
# Smoke test: public /health through nginx (same-origin Docker) or direct API URL.
# Usage: ./scripts/smoke-production.sh [BASE_URL]
# Examples:
#   ./scripts/smoke-production.sh http://localhost
#   ./scripts/smoke-production.sh https://play.example.com
set -euo pipefail
BASE="${1:-http://localhost}"
BASE="${BASE%/}"
echo "GET ${BASE}/health"
curl -sfS "${BASE}/health" | head -c 400 || {
  echo "FAILED: ${BASE}/health" >&2
  exit 1
}
echo
echo "OK"
