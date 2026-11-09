#!/bin/bash
# Runs all tests with headless Chrome. Exit code 0 = everything passed.
#
#   test/run.sh
#   test/run.sh --update-golden     regenerate the golden master of the presentation
#
# 1. test/index.html     unit tests (fake deck) and integration test (real reveal.js)
# 2. demo.html           loads without console warnings; all diagrams are built
# 3. the presentation    (only if present; not in the repository) loads without console warnings, all diagrams built,
#                        all solutions covered, per-slide summary equals the golden master test/golden/deck.json.
#                        After an intended change of the presentation: test/run.sh --update-golden
set -u
UPDATE_GOLDEN=0
[ "${1:-}" = "--update-golden" ] && UPDATE_GOLDEN=1
cd "$(dirname "$0")/.." || exit 1
ROOT=$PWD
CHROME=${CHROME:-google-chrome-stable}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# dump DOM and console log of a page: $1 = url, $2 = output prefix
load() {
  timeout 120 "$CHROME" --headless=new --no-sandbox --disable-gpu --enable-logging=stderr --v=0 \
    --virtual-time-budget=20000 --dump-dom "$1" 2>"$2.log" >"$2.dom"
}

# console messages of a page, without noise from third-party plugins
console_messages() {
  grep -o 'CONSOLE:[0-9]*\] ".*' "$1.log" | grep -v 'fsfx' || true
}

status=0

echo "== test/index.html"
load "file://$ROOT/test/index.html" "$TMP/unit"
python3 -I - "$TMP/unit.dom" <<'EOF' || status=1
import html, json, re, sys
dom = open(sys.argv[1], encoding='utf-8').read()
m = re.search(r'<pre id="result">(.*?)</pre>', dom, re.S)
if not m or 'data-done="true"' not in dom:
    print('  FAIL: the test page did not finish (no result)'); sys.exit(1)
data = json.loads(html.unescape(m.group(1)))
for r in data['results']:
    if not r['ok']:
        print(f"  FAIL {r['name']}\n       {r['error']}")
print(f"  {data['total'] - data['failed']}/{data['total']} tests passed")
sys.exit(1 if data['failed'] else 0)
EOF

echo "== demo.html"
load "file://$ROOT/demo.html" "$TMP/demo"
msgs=$(console_messages "$TMP/demo")
[ -z "$msgs" ] || { echo "  FAIL console messages:"; echo "$msgs" | sed 's/^/    /'; status=1; }
python3 -I - "$TMP/demo.dom" <<'EOF' || status=1
import re, sys
dom = open(sys.argv[1], encoding='utf-8').read()
counts = {
    'venn': len(re.findall(r'<div class="venn[^"]*"[^>]*><svg', dom)),
    'tree': len(re.findall(r'<div class="tree"[^>]*><svg', dom)),
    'fourfield': len(re.findall(r'<div class="fourfield"[^>]*><table', dom)),
}
expected = {'venn': 2, 'tree': 1, 'fourfield': 1}
bad = {k: (v, expected[k]) for k, v in counts.items() if v != expected[k]}
covered, total = len(re.findall(r'class="uncover[^"]*covered', dom)), len(re.findall(r'class="uncover', dom))
if bad or covered != total or total != 1 or 'katex-error' in dom:
    print('  FAIL', bad, f'covered {covered}/{total}'); sys.exit(1)
print('  OK: 2 Venn diagrams, 1 tree, 1 four-field table, 1 covered solution')
EOF

echo "== Verknuepfen-Ereignisse.html"
GOLDEN=test/golden/deck.json
if [ ! -f Verknuepfen-Ereignisse.html ]; then echo "  skipped (file not present; it is not part of the repository)"; else
# The presentation may load the plugins from jsDelivr (pinned version) or from relative paths;
# test it with the local files in both cases (copy in $TMP, <base> for the relative paths).
sed -E -e "s#https://cdn\.jsdelivr\.net/gh/trent2/reveal\.js-plugins@[0-9.]+/#file://$ROOT/#g" \
       -e "0,/<head>/s##<head><base href=\"file://$ROOT/\">#" Verknuepfen-Ereignisse.html > "$TMP/deck.html"
load "file://$TMP/deck.html" "$TMP/deck"
msgs=$(console_messages "$TMP/deck")
[ -z "$msgs" ] || { echo "  FAIL console messages:"; echo "$msgs" | sed 's/^/    /'; status=1; }
python3 -I test/deck-snapshot.py "$TMP/deck.dom" > "$TMP/deck.json"
python3 -I - "$TMP/deck.json" <<'PYEOF' || status=1
import json, sys
data = json.load(open(sys.argv[1], encoding='utf-8'))
bad = [s for s in data['slides'] if s['built'] != s['venn'] + s['tree'] + s['fourfield'] or s['covered'] != s['uncover']]
for s in bad:
    print(f"  FAIL slide {s['slide']} ({s['title']}): {s['built']}/{s['venn'] + s['tree'] + s['fourfield']} diagrams built, {s['covered']}/{s['uncover']} solutions covered")
if data['katex_errors']:
    print('  FAIL KaTeX errors:', data['katex_errors'])
sys.exit(1 if bad or data['katex_errors'] else 0)
PYEOF
if [ "$UPDATE_GOLDEN" = 1 ]; then
  mkdir -p test/golden && cp "$TMP/deck.json" "$GOLDEN" && echo "  golden master written: $GOLDEN"
elif [ ! -f "$GOLDEN" ]; then
  echo "  FAIL no golden master; create it with: test/run.sh --update-golden"; status=1
elif diff -u "$GOLDEN" "$TMP/deck.json" > "$TMP/golden.diff"; then
  python3 -I - "$GOLDEN" <<'PYEOF'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))['slides']
total = lambda key: sum(s[key] for s in d)
print(f"  OK: matches the golden master ({len(d)} slides, {total('venn')} Venn, {total('tree')} trees, {total('fourfield')} four-field tables, {total('uncover')} solutions)")
PYEOF
else
  echo "  FAIL differs from the golden master (intended? then run: test/run.sh --update-golden)"; sed 's/^/    /' "$TMP/golden.diff"; status=1
fi
fi

[ $status -eq 0 ] && echo "ALL OK" || echo "FAILED"
exit $status
