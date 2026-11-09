"""Summarise a dumped DOM of the presentation as JSON (one entry per top-level slide).

  python3 -I test/deck-snapshot.py deck.dom > snapshot.json

Used by test/run.sh: the snapshot is compared with the golden master
test/golden/deck.json, which `test/run.sh --update-golden` regenerates.
"""
import json, sys
from html.parser import HTMLParser


class Snapshot(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.slides, self.depth, self.slide = [], 0, None
        self.in_heading, self.pending = False, None
        self.katex_errors = 0

    def handle_starttag(self, tag, attrs):
        classes = (dict(attrs).get('class') or '').split()
        if 'katex-error' in classes:
            self.katex_errors += 1
        if tag == 'section':
            self.depth += 1
            if self.depth == 1:
                self.slide = dict(title='', venn=0, tree=0, fourfield=0, built=0, uncover=0, covered=0)
                self.slides.append(self.slide)
            return
        if self.slide is None:
            return
        if self.pending and tag in ('svg', 'table'):
            self.slide['built'] += 1
        self.pending = None
        for kind in ('venn', 'tree', 'fourfield'):
            if tag == 'div' and kind in classes:
                self.slide[kind] += 1
                self.pending = kind
        if 'uncover' in classes:
            self.slide['uncover'] += 1
            self.slide['covered'] += 'covered' in classes
        if tag in ('h1', 'h2', 'h3') and not self.slide['title']:
            self.in_heading = True

    def handle_endtag(self, tag):
        if tag == 'section' and self.depth:
            self.depth -= 1
            if self.depth == 0:
                self.slide = None
        if tag in ('h1', 'h2', 'h3'):
            self.in_heading = False

    def handle_data(self, data):
        if self.in_heading and self.slide is not None:
            self.slide['title'] = (self.slide['title'] + ' ' + data).strip() if not self.slide['title'] else self.slide['title']


parser = Snapshot()
parser.feed(open(sys.argv[1], encoding='utf-8').read())
for number, slide in enumerate(parser.slides, 1):
    slide['slide'] = number
json.dump({'slides': parser.slides, 'katex_errors': parser.katex_errors}, sys.stdout, ensure_ascii=False, indent=1)
print()
