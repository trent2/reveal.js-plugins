#!/bin/bash
# Renders every slide of the presentation as a PNG, covered and uncovered (for pixel comparisons).
#
#   test/shots.sh <output directory>          e.g. .test-tmp/before, later .test-tmp/after
#   test/compare-shots.py <before> <after>    lists the slides that differ
#
# Files: <dir>/covered-N.png and <dir>/uncovered-N.png (N counts from 0 like the URL hash).
# PAR=1 renders one page at a time (default 4); the slide number in the bottom right corner
# flickers between runs, compare-shots.py ignores that corner.
set -eu
cd "$(dirname "$0")/.."
ROOT=$PWD
DECK=${DECK:-Verknuepfen-Ereignisse.html}
CHROME=${CHROME:-google-chrome-stable}
out=$(realpath -m "$1"); mkdir -p "$out"
for state in covered uncovered; do
  python3 -I - "$ROOT/$DECK" "$ROOT" "$state" "$out/$state.html" <<'PYEOF'
import sys
deck, root, state, dest = sys.argv[1:]
s = open(deck, encoding='utf-8').read()
s = s.replace('<head>', f'<head><base href="file://{root}/">', 1)
if state == 'uncovered':
    s = s.replace('</body>', "<script>window.addEventListener('load',()=>setTimeout(()=>document.querySelectorAll('.uncover.covered').forEach(e=>e.click()),1500))</script></body>")
open(dest, 'w', encoding='utf-8').write(s)
PYEOF
done
slides=$(grep -c '^  <section' "$ROOT/$DECK")
shoot() { "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=1280,720 \
  --virtual-time-budget=20000 --screenshot="$out/$1-$2.png" "file://$out/$1.html#/$2" >/dev/null 2>&1; }
export -f shoot; export out CHROME
for state in covered uncovered; do for ((i = 0; i < slides; i++)); do echo "$state $i"; done; done \
  | xargs -P "${PAR:-4}" -L1 bash -c 'shoot $0 $1'
echo "$(ls "$out"/*.png | wc -l) images in $out"
