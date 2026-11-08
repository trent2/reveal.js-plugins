#!/bin/bash
# Runs all tests with headless Chrome. Exit code 0 = everything passed.
#
#   test/run.sh
#
# 1. test/index.html     unit tests (fake deck) and integration test (real reveal.js)
# 2. demo.html           loads without console warnings; all diagrams are built
# 3. the presentation    (only if present; not in the repository) loads without console warnings; expected number of diagrams, all solutions covered
set -u
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
if [ ! -f Verknuepfen-Ereignisse.html ]; then echo "  skipped (file not present; it is not part of the repository)"; else
load "file://$ROOT/Verknuepfen-Ereignisse.html" "$TMP/deck"
msgs=$(console_messages "$TMP/deck")
[ -z "$msgs" ] || { echo "  FAIL console messages:"; echo "$msgs" | sed 's/^/    /'; status=1; }
python3 -I - "$TMP/deck.dom" <<'EOF' || status=1
import re, sys
dom = open(sys.argv[1], encoding='utf-8').read()
counts = {
    'venn': (len(re.findall(r'<div class="venn[^"]*"[^>]*><svg', dom)), 14),
    'tree': (len(re.findall(r'<div class="tree"[^>]*><svg', dom)), 1),
    'fourfield': (len(re.findall(r'<div class="fourfield"[^>]*><table', dom)), 2),
}
bad = {k: v for k, v in counts.items() if v[0] != v[1]}
covered, total = len(re.findall(r'class="uncover[^"]*covered', dom)), len(re.findall(r'class="uncover', dom))
if bad or covered != total or total != 45 or 'katex-error' in dom:
    print('  FAIL (found, expected):', bad, f'covered {covered}/{total}'); sys.exit(1)
print('  OK: 14 Venn diagrams, 1 tree, 2 four-field tables, 45 covered solutions')
EOF
fi

[ $status -eq 0 ] && echo "ALL OK" || echo "FAILED"
exit $status
