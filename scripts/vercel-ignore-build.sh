#!/usr/bin/env bash
#
# vercel-ignore-build.sh — gate production on the unit suite.
#
# Wired up as `ignoreCommand` in vercel.json, so Vercel runs this before
# building. Exists because Vercel's Git integration builds whatever lands on
# `main` without waiting for GitHub Actions: a red Playwright run does not stop
# a deploy. This is the only thing standing between a broken commit and
# production.
#
# EXIT CODES ARE INVERTED, and this trips everyone up:
#
#   exit 1  ->  build PROCEEDS   (tests passed)
#   exit 0  ->  build is SKIPPED (tests failed)
#
# Verified against Vercel's docs and by deliberately breaking a test and
# watching the deployment get skipped.
#
# Fail-open on infrastructure problems, fail-closed on test failures.
# A test that runs and fails is a real signal, so it blocks the deploy. But if
# the suite cannot run at all (no deps, missing runner), blocking would silently
# freeze the site at its last good deploy — the same invisible-no-deploy failure
# that the old deploy-hook setup caused. Loud shipping beats silent stalling;
# Playwright in GitHub Actions is the backstop.

set -uo pipefail

log() { echo "[test-gate] $*"; }

# Vercel does not guarantee dependencies are installed before the Ignored Build
# Step runs, and vitest is a devDependency. Install only if it is missing.
if [ ! -x node_modules/.bin/vitest ]; then
  log "vitest not present — installing dependencies"
  if ! npm ci --no-audit --no-fund >/dev/null 2>&1; then
    log "WARNING: dependency install failed. Cannot run the gate."
    log "Allowing the build so the site does not silently stop deploying."
    exit 1
  fi
fi

if [ ! -x node_modules/.bin/vitest ]; then
  log "WARNING: vitest still not found after install. Allowing the build."
  exit 1
fi

log "running unit suite"
if node_modules/.bin/vitest run; then
  log "PASS — proceeding with the build"
  exit 1
fi

log "FAIL — skipping this build. Production keeps serving the previous deploy."
exit 0
