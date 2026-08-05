#!/usr/bin/env bash
#
# compare-deploys.sh — diff two deployments of this site.
#
# Exists because the site is deployed to both Vercel and Azure Static Web Apps
# while a cutover is being evaluated. The two hosts derive their config from
# different sources (next.config.ts vs staticwebapp.config.json), so they can
# drift silently. This makes "are they equivalent?" a command instead of an
# opinion.
#
#   ./scripts/compare-deploys.sh [AZURE_URL] [VERCEL_URL] [--fast]
#
# Exit code is non-zero if any FAIL is reported. NOTE lines are known,
# accepted differences and never fail the run.

set -uo pipefail

# Separate flags from positional URLs so `npm run compare:deploys -- --fast`
# does not get parsed as a hostname.
FAST=0
POS=()
for arg in "$@"; do
  case "$arg" in
    --fast) FAST=1 ;;
    -*)     printf "unknown flag: %s\n" "$arg" >&2; exit 2 ;;
    *)      POS+=("$arg") ;;
  esac
done

AZ="${POS[0]:-https://yellow-tree-0d5623803.7.azurestaticapps.net}"
VC="${POS[1]:-https://www.netashemesh.co.il}"

# Strip trailing slashes so URL joins never double up.
AZ="${AZ%/}"; VC="${VC%/}"

FAILS=0
ACCEPT="image/avif,image/webp,image/*,*/*;q=0.8"

# This script fires ~70 requests per host. Both CDNs will occasionally drop one
# under that burst, which shows up as an empty header or a 000 status and looks
# exactly like a real difference. Retry so the report means something.
CURL=(curl -sS --max-time 20 --retry 3 --retry-delay 1 --retry-connrefused)
curl --help all 2>/dev/null | grep -q -- '--retry-all-errors' && CURL+=(--retry-all-errors)

c_pass=$'\033[32m'; c_fail=$'\033[31m'; c_note=$'\033[33m'; c_off=$'\033[0m'
[ -t 1 ] || { c_pass=""; c_fail=""; c_note=""; c_off=""; }

pass() { printf "  ${c_pass}PASS${c_off}  %s\n" "$1"; }
note() { printf "  ${c_note}NOTE${c_off}  %s\n" "$1"; }
fail() { printf "  ${c_fail}FAIL${c_off}  %s\n" "$1"; FAILS=$((FAILS+1)); }
head_of() { printf "\n\033[1m%s\033[0m\n" "$1"; }

# hdr <url> <header-name> -> lowercased value, empty if absent
hdr() {
  "${CURL[@]}" -I "$1" 2>/dev/null \
    | tr -d '\r' \
    | awk -v h="$(printf '%s' "$2" | tr 'A-Z' 'a-z')" \
        'BEGIN{IGNORECASE=1} tolower($0) ~ "^" h ":" { sub(/^[^:]*:[ ]*/, ""); print; exit }'
}

status_of() {
  "${CURL[@]}" -o /dev/null -w '%{http_code}' "$1" 2>/dev/null
}

# Compare one header across both hosts. Third arg "soft" downgrades a
# mismatch from FAIL to NOTE.
cmp_header() {
  local path="$1" name="$2" mode="${3:-hard}"
  local a b
  a="$(hdr "$AZ$path" "$name")"
  b="$(hdr "$VC$path" "$name")"
  if [ "$a" = "$b" ]; then
    if [ -z "$a" ]; then
      note "$name on $path — absent on both"
    else
      pass "$name on $path"
    fi
  elif [ "$mode" = "soft" ]; then
    note "$name on $path differs (accepted)
          azure : ${a:-<absent>}
          vercel: ${b:-<absent>}"
  else
    fail "$name on $path differs
          azure : ${a:-<absent>}
          vercel: ${b:-<absent>}"
  fi
}

printf "\033[1mComparing deployments\033[0m\n"
printf "  azure : %s\n" "$AZ"
printf "  vercel: %s\n" "$VC"

# Preflight. Without this, a rate-limited or unreachable host returns empty
# headers for every check and the script confidently reports a screenful of
# differences that do not exist. A harness that lies is worse than no harness.
for target in "azure|$AZ" "vercel|$VC"; do
  name="${target%%|*}"; url="${target#*|}"
  code="$(status_of "$url/")"
  if [ "$code" != "200" ]; then
    printf "\n${c_fail}Preflight failed:${c_off} %s returned %s for / — aborting.\n" "$name" "$code"
    printf "  If this is 000 or 429, you are likely rate limited; wait a minute and retry.\n"
    exit 2
  fi
done

# ---------------------------------------------------------------------------
head_of "Security headers (must match — these are the cutover risk)"
# ---------------------------------------------------------------------------
for h in \
  "Content-Security-Policy" \
  "Strict-Transport-Security" \
  "X-Content-Type-Options" \
  "Referrer-Policy" \
  "Permissions-Policy"
do
  cmp_header "/" "$h"
done

# Headers present on one host only. Not a correctness problem, but it means
# the two configs disagree, which is worth surfacing.
head_of "Extra headers (config drift detector)"
for h in "X-XSS-Protection" "X-DNS-Prefetch-Control" "X-Frame-Options"; do
  a="$(hdr "$AZ/" "$h")"; b="$(hdr "$VC/" "$h")"
  if [ -z "$a" ] && [ -z "$b" ]; then
    pass "$h absent from both"
  elif [ "$a" = "$b" ]; then
    pass "$h matches"
  else
    note "$h set on only one host — configs disagree
          azure : ${a:-<absent>}
          vercel: ${b:-<absent>}"
  fi
done

# ---------------------------------------------------------------------------
head_of "Content types (a wrong one here breaks link previews / indexing)"
# ---------------------------------------------------------------------------
# The OG image path is build-dependent (Next has emitted it both as
# /opengraph-image and /opengraph-image.png across builds), and the extension
# is exactly what decides whether the host infers the right MIME type. So
# resolve it from each page's own markup rather than hardcoding a path — a
# hardcoded one silently checks a 404 after the path changes.
og_url_of() {
  "${CURL[@]}" "$1/" 2>/dev/null \
    | grep -oE '<meta property="og:image" content="[^"]*"' | head -1 \
    | sed 's/.*content="//; s/"$//'
}
og_az="$(og_url_of "$AZ")"; og_vc="$(og_url_of "$VC")"
if [ -z "$og_az" ] || [ -z "$og_vc" ]; then
  fail "could not resolve og:image from markup (azure:'${og_az:-none}' vercel:'${og_vc:-none}')"
else
  ct_az="$(hdr "$og_az" "Content-Type")"; ct_vc="$(hdr "$og_vc" "Content-Type")"
  st_az="$(status_of "$og_az")"
  if [ "$st_az" != "200" ]; then
    fail "og:image is unreachable on azure -> $st_az
          $og_az"
  elif [ "$ct_az" = "$ct_vc" ]; then
    pass "og:image Content-Type ($ct_az)"
  else
    fail "og:image Content-Type differs — link previews may not render
          azure : ${ct_az:-<absent>}  ($og_az)
          vercel: ${ct_vc:-<absent>}  ($og_vc)"
  fi
fi
cmp_header "/twitter-image.png" "Content-Type"
# Azure omits "; charset=utf-8". Cosmetic only: the document carries
# <meta charSet="utf-8">, so Hebrew renders correctly either way.
cmp_header "/" "Content-Type" soft
# text/xml vs application/xml: both spec-legal, Google treats them alike.
cmp_header "/sitemap.xml" "Content-Type" soft
cmp_header "/robots.txt" "Content-Type" soft

# ---------------------------------------------------------------------------
head_of "Indexability (the staging host must not compete with production)"
# ---------------------------------------------------------------------------
# A publicly crawlable staging copy that self-canonicalises is duplicate
# content. It is especially damaging while the production site is still
# establishing its canonicals with Google.
az_canon="$("${CURL[@]}" "$AZ/" 2>/dev/null \
  | grep -oE '<link rel="canonical" href="[^"]*"' | head -1 | sed 's/.*href="//; s/"$//')"
az_robots="$("${CURL[@]}" "$AZ/robots.txt" 2>/dev/null)"
az_xrobots="$(hdr "$AZ/" "X-Robots-Tag")"

az_host="${AZ#https://}"; az_host="${az_host%%/*}"
noindexed=0
printf '%s' "$az_xrobots" | grep -qi 'noindex' && noindexed=1
printf '%s' "$az_robots" | grep -qiE '^[[:space:]]*Disallow:[[:space:]]*/[[:space:]]*$' && noindexed=1

if [ "$noindexed" -eq 1 ]; then
  pass "staging host is noindexed"
elif [ -z "$az_canon" ]; then
  fail "staging has no canonical and is not noindexed"
elif printf '%s' "$az_canon" | grep -q "$az_host"; then
  fail "staging is crawlable AND self-canonicalises to its own host
          canonical: $az_canon
          -> Google can index the staging copy as a duplicate of production.
          Fix: send X-Robots-Tag: noindex on the staging environment, or
          Disallow: / in its robots.txt."
else
  pass "staging canonicalises to production ($az_canon)"
fi

# ---------------------------------------------------------------------------
head_of "Routing"
# ---------------------------------------------------------------------------
for path in "/" "/blog" "/blog/loneliness-in-a-relationship" "/sitemap.xml" "/robots.txt"; do
  sa="$(status_of "$AZ$path")"; sv="$(status_of "$VC$path")"
  if [ "$sa" = "$sv" ]; then pass "$path -> $sa on both"
  else fail "$path -> azure:$sa vercel:$sv"; fi
done

sa="$(status_of "$AZ/definitely-not-a-real-page")"; sv="$(status_of "$VC/definitely-not-a-real-page")"
if [ "$sa" = "$sv" ]; then pass "unknown path -> $sa on both"
else fail "unknown path -> azure:$sa vercel:$sv"; fi

# 301 vs 308 are both permanent; the difference only matters for POST and this
# site is GET-only. Accepted.
sa="$(status_of "$AZ/index.html")"; sv="$(status_of "$VC/index.html")"
if [ "$sa" = "$sv" ]; then pass "/index.html redirect -> $sa on both"
else note "/index.html redirect differs (accepted: both permanent)
          azure : $sa
          vercel: $sv"; fi

# ---------------------------------------------------------------------------
if [ "$FAST" -eq 0 ]; then
head_of "Image payload at a 375px viewport (the headline perf gap)"
# ---------------------------------------------------------------------------
  imgs="$("${CURL[@]}" "$AZ/" 2>/dev/null \
    | grep -oE '/images/[^" ]*\.(webp|png|jpg|jpeg)' | sort -u)"
  n="$(printf '%s\n' "$imgs" | grep -c . || true)"

  if [ "$n" -eq 0 ]; then
    note "no /images/ references found on the homepage — skipping"
  else
    atotal=0; vtotal=0
    while IFS= read -r p; do
      [ -z "$p" ] && continue
      a=$("${CURL[@]}" -o /dev/null -w '%{size_download}' -H "Accept: $ACCEPT" "$AZ$p" 2>/dev/null || echo 0)
      enc="$(printf '%s' "$p" | sed 's|/|%2F|g')"
      v=$("${CURL[@]}" -o /dev/null -w '%{size_download}' -H "Accept: $ACCEPT" "$VC/_next/image?url=$enc&w=640&q=75" 2>/dev/null || echo 0)
      # A tiny response from the optimizer is an error page, not an image.
      [ "${v:-0}" -lt 500 ] && v="$a"
      atotal=$((atotal + ${a:-0})); vtotal=$((vtotal + ${v:-0}))
    done <<< "$imgs"

    printf "  %d images referenced\n" "$n"
    printf "    azure  (as served)        : %8d bytes\n" "$atotal"
    printf "    vercel (optimized @ 640px): %8d bytes\n" "$vtotal"
    if [ "$vtotal" -gt 0 ]; then
      ratio="$(awk -v a="$atotal" -v v="$vtotal" 'BEGIN{printf "%.2f", a/v}')"
      over="$(awk -v r="$ratio" 'BEGIN{print (r > 1.15) ? "1" : "0"}')"
      if [ "$over" = "1" ]; then
        fail "azure serves ${ratio}x the image bytes — responsive variants missing"
      else
        pass "image payload within 15% (${ratio}x)"
      fi
    fi
  fi

  # React emits the attribute as camelCase "srcSet" in the streamed payload, so
  # this match must be case-insensitive. grep -c counts lines, not occurrences,
  # which undercounts badly here — pipe through wc -l instead.
  srcset_az="$("${CURL[@]}" "$AZ/" 2>/dev/null | grep -oi 'srcset' | wc -l | tr -d ' ')"
  srcset_vc="$("${CURL[@]}" "$VC/" 2>/dev/null | grep -oi 'srcset' | wc -l | tr -d ' ')"
  if [ "${srcset_az:-0}" -eq 0 ] && [ "${srcset_vc:-0}" -gt 0 ]; then
    fail "azure emits 0 srcset attributes, vercel emits ${srcset_vc}"
  else
    pass "srcset counts comparable (azure:${srcset_az:-0} vercel:${srcset_vc:-0})"
  fi
fi

# ---------------------------------------------------------------------------
printf "\n"
if [ "$FAILS" -eq 0 ]; then
  printf "${c_pass}Deployments are equivalent on everything checked.${c_off}\n"
else
  printf "${c_fail}%d difference(s) need attention.${c_off}\n" "$FAILS"
fi
exit $(( FAILS > 0 ? 1 : 0 ))
