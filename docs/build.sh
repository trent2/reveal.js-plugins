#!/bin/bash
# Builds the reference documentation from docs/reference.md (Pandoc Markdown).
#
#   docs/build.sh            HTML and PDF
#   docs/build.sh html       only HTML
#   docs/build.sh pdf        only PDF (needs xelatex)
#
# Output: docs/reference.html (one file, no external resources) and docs/reference.pdf.
# Other formats work the same way, e.g.: pandoc docs/reference.md -o docs/reference.docx
set -eu
cd "$(dirname "$0")"
command -v pandoc >/dev/null || { echo "pandoc is not installed (https://pandoc.org/installing.html)" >&2; exit 1; }
target=${1:-all}

if [ "$target" = all ] || [ "$target" = html ]; then
  pandoc reference.md --standalone --toc --embed-resources --metadata pagetitle="reveal-layouts" \
    -V colorlinks=true -o reference.html
  echo "docs/reference.html"
fi
if [ "$target" = all ] || [ "$target" = pdf ]; then
  command -v xelatex >/dev/null || { echo "xelatex is not installed; skipping the PDF" >&2; exit 1; }
  pandoc reference.md --standalone --toc --pdf-engine=xelatex -V geometry:margin=2.5cm -V colorlinks=true \
    -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono" -o reference.pdf
  echo "docs/reference.pdf"
fi
