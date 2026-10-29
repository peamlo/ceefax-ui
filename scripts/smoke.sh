#!/usr/bin/env bash
# Smoke test a published Storybook site: the Pages deploy (pages.yml) and each
# Storybook preview (preview.yml) run this same check against their base URL.
# Usage: scripts/smoke.sh https://example.com/path/
set -eo pipefail

URL="${1:?usage: smoke.sh <base-url>}"
URL="${URL%/}/"

get() { curl -fsS --retry 5 --retry-delay 10 --retry-all-errors "${URL}$1"; }
get "" > /dev/null
# iframe.html is static (200 for any id), so the real check is a story in index.json.
id=$(get index.json | jq -re '[.entries[] | select(.type == "story")][0].id')
get "iframe.html?id=${id}" > /dev/null
grep -q 'src/index.css' <<< "$(get demo/)"
get src/index.css > /dev/null
get fonts/bedstead-3.261-regular.woff2 > /dev/null
