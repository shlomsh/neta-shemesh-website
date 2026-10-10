#!/usr/bin/env bash
#
# vercel-ignore-build.sh — gate production on lint, types and the unit suite.
#
# Wired up as `ignoreCommand` in vercel.json, so Vercel runs this before
# building. Exists because Vercel's Git integration builds whatever lands on
# `main` without waiting for GitHub Actions: a red CI run does not stop a
# deploy. This is the only thing standing between a broken commit and
# production.
#
# Three checks run, all of them, so one log shows every failure:
#
#   eslint --max-warnings 0   (same as `npm run lint`)
#   tsc --noEmit              (same as `npm run typecheck`)
#   vitest run                (same as `npm run test:unit`)
#
# `next build` would catch a type error too, but only after Vercel has spent the
# build minutes; and it never runs eslint. Playwright stays out of the gate: it
# needs a built server and a browser, which is the slow part.
#
# EXIT CODES ARE INVERTED, and this trips everyone up:
#
#   exit 1  ->  build PROCEEDS   (every check passed)
#   exit 0  ->  build is SKIPPED (a check failed)
#
# Verified against Vercel's docs and by deliberately breaking a test and
# watching the deployment get skipped.
#
# Fail-open on infrastructure problems, fail-closed on check failures.
# A check that runs and fails is a real signal, so it blocks the deploy. But if
# the checks cannot run at all (no deps, missing runner), blocking would silently
# freeze the site at its last good deploy — the same invisible-no-deploy failure
# that the old deploy-hook setup caused. Loud shipping beats silent stalling;
# CI in GitHub Actions is the backstop.

set -uo pipefail

log() { echo "[test-gate] $*"; }

BIN=node_modules/.bin

# Vercel does not guarantee dependencies are installed before the Ignored Build
# Step runs, and all three runners are devDependencies. Install only if one is
# missing.
runners_present() {
  [ -x "$BIN/eslint" ] && [ -x "$BIN/tsc" ] && [ -x "$BIN/vitest" ]
}

if ! runners_present; then
  log "eslint, tsc or vitest not present — installing dependencies"
  if ! npm ci --no-audit --no-fund >/dev/null 2>&1; then
    log "WARNING: dependency install failed. Cannot run the gate."
    log "Allowing the build so the site does not silently stop deploying."
    exit 1
  fi
fi

if ! runners_present; then
  log "WARNING: eslint, tsc or vitest still not found after install. Allowing the build."
  exit 1
fi

failed=()

run_check() {
  local name="$1"
  shift
  log "running $name"
  if "$@"; then
    log "$name: ok"
  else
    log "$name: FAILED"
    failed+=("$name")
  fi
}

run_check lint "$BIN/eslint" --max-warnings 0
run_check typecheck "$BIN/tsc" --noEmit
run_check unit "$BIN/vitest" run

if [ "${#failed[@]}" -eq 0 ]; then
  log "PASS — proceeding with the build"
  exit 1
fi

log "FAIL (${failed[*]}) — skipping this build. Production keeps serving the previous deploy."
exit 0
