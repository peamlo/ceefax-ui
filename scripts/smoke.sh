#!/usr/bin/env bash
# Smoke test a published Storybook site: the Pages deploy (pages.yml) and each
# Storybook preview (preview.yml) run this same check against their base URL.
# Usage: scripts/smoke.sh https://example.com/path/
set -eo pipefail
# The grep, jq and [[ ]] checks fail without a word; name the one that did.
trap 'echo "smoke: line $LINENO failed: $BASH_COMMAND" >&2' ERR

URL="${1:?usage: smoke.sh <base-url>}"
URL="${URL%/}/"

get() { curl -fsS --retry 5 --retry-delay 10 --retry-all-errors "${URL}$1"; }
get "" > /dev/null
# iframe.html is static (200 for any id), so the real check is a story in index.json.
id=$(get index.json | jq -re '[.entries[] | select(.type == "story")][0].id')
get "iframe.html?id=${id}" > /dev/null
grep -q 'src/index.css' <<< "$(get demo/)"
for page in demo/ demo/screen; do grep -q 'public/favicon.svg' <<< "$(get "$page")"; done
get src/index.css > /dev/null
# The first font the stylesheet names, so renaming a font file can't break this check.
# An assignment, so set -e stops here if the stylesheet names none. A here-string, not a
# pipe: grep -m1 quits at its first match, and curl still writing would fail with pipefail.
font=$(grep -om1 "fonts/[^')]*\.woff2" <<< "$(get src/tokens/typography.css)")
get "$font" > /dev/null
get public/favicon.svg > /dev/null
# A host that serves index.html for missing paths hides every broken link above.
# --retry rides out a 5xx (it never retries a 404); not [[ ]] alone, which bash 3.2's set -e ignores.
code=$(curl -sS --retry 5 --retry-delay 10 -o /dev/null -w '%{http_code}' "${URL}does-not-exist")
[[ $code == 404 ]] || { echo "smoke: ${URL}does-not-exist returned $code, not 404" >&2; exit 1; }
