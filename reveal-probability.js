/*!
 * reveal-probability.js – probability diagrams for reveal.js
 *
 * Draws three kinds of diagrams from plain HTML elements:
 *   .venn       Venn diagram with two sets (SVG)
 *   .tree       two-stage tree diagram (SVG)
 *   .fourfield  four-field table (HTML table)
 *
 * Usage:
 *   <link rel="stylesheet" href=".../reveal-probability.css">
 *   <script src=".../reveal-probability.js"></script>
 *   Reveal.initialize({ plugins: [ ..., RevealProbability ] });
 *
 * ---------------------------------------------------------------------------------------
 * Venn diagram   <div class="venn" data-mode="union" data-names="I,V"></div>
 *
 *   Rectangle = sample space S, left circle = event 1, right circle = event 2.
 *   The four regions are called leftOnly, both (intersection), rightOnly and outside.
 *
 *   data-mode (default: none)   what is highlighted
 *     none          nothing
 *     complement    everything outside the left circle (complement of event 1)
 *     intersection  the overlap of both circles
 *     union         both circles
 *     difference    the left circle without the right one (event 1 \ event 2)
 *     partition     the four regions in four colours
 *     probability   the four regions in the same colours, with one value per region
 *                   instead of elements (data-values)
 *
 *   data-names="I,V"           labels of the left and the right circle (default: A,B)
 *   data-values="a|b|c|d"      only mode probability: values for leftOnly | both | rightOnly |
 *                              outside, e.g. data-values="0,35|0,25|0,10|0,30". Plain text.
 *   data-left-only="2,3"       elements (plain text labels) in each region, separated by commas.
 *   data-both="1"              All modes except probability draw them. Elements in highlighted
 *   data-right-only="4,5"      regions are filled. Without explicit positions (see sets) the
 *   data-outside="6"           plugin places them automatically.
 *   data-set="persons"         takes names, elements and positions from probability.sets.persons
 *                              (see configuration). Explicit data-* attributes win over the set.
 *   class="mini"               in addition to "venn": only circles and colours, no labels and
 *                              no elements; 130px wide (for summaries).
 *
 * ---------------------------------------------------------------------------------------
 * Tree diagram   <div class="tree" data-names="A,B"
 *                     data-probabilities="1/6|5/6 ; 1/3|2/3 ; 4/5|1/5"></div>
 *
 *   Two stages: event A and its complement, then event B and its complement after each.
 *   Complements get an overline. Names and probabilities are plain text (no LaTeX).
 *   data-names            names of the events of stage 1 and stage 2 (default: A,B)
 *   data-probabilities    three groups separated by ";" with two probabilities each, separated
 *                         by "|":  A | not A  ;  B | not B after A  ;  B | not B after not A.
 *                         "a/b" is drawn as a stacked fraction, other text (e.g. 0,3) as it is.
 *
 * ---------------------------------------------------------------------------------------
 * Four-field table   <div class="fourfield"
 *                         data-corner="Feature"
 *                         data-columns="$K$: ill|$\overline{K}$: healthy"
 *                         data-rows="Test + ($T$)|Test − ($\overline{T}$)"
 *                         data-total-label="Sum"
 *                         data-values="0,15|0,1|0,25 ; 0,05|0,7|0,75 ; 0,2|0,8|1"></div>
 *
 *   data-columns / data-rows   the two column / row headings, separated by "|"
 *   data-corner                text in the top left cell (default: empty)
 *   data-total-label           heading of the sum row and column (default: Σ)
 *   data-values                3 rows separated by ";", each with 3 cells separated by "|":
 *                              [row 1, col 1 | row 1, col 2 | sum row 1] ;
 *                              [row 2, col 1 | row 2, col 2 | sum row 2] ;
 *                              [sum col 1    | sum col 2    | total]
 *                              The plugin does not calculate; it only lays out what is given.
 *
 *   LaTeX in attribute values (headings and cells): text between $…$ is passed on unchanged.
 *   Separators ("|", ";") inside $…$ are ignored, so $P(A|B)$ works. Notes:
 *   – Inside the attribute, write " as &quot; and & as &amp; (as everywhere in HTML).
 *   – Outside $…$ the separators cannot be escaped.
 *   – The plugin only inserts the text. Rendering it is up to your math renderer, which must
 *     run after the plugin has built the diagrams: list RevealProbability before the math
 *     plugin in "plugins", or call your renderer after Reveal.getPlugin('probability').render().
 *     Venn and tree diagrams are SVG; their labels cannot contain LaTeX.
 *
 * ---------------------------------------------------------------------------------------
 * Configuration (all optional):
 *   Reveal.initialize({ probability: {
 *     labels: { venn: 'Venn diagram', tree: 'Tree diagram' },     aria-label of the SVGs
 *     sets: {                                                     reusable element sets
 *       persons: {
 *         names: ['I', 'V'],                                      default for data-names
 *         leftOnly: [1, 2, 3], both: [4, 5], rightOnly: [6, 7], outside: [8, 9],
 *         positions: { 1: [140, 150], 2: [185, 120], … }          label -> [x, y] in the 560×360
 *       }                                                         viewBox; a region without
 *     }                                                           positions is placed automatically
 *   } });
 *
 * API (Reveal.getPlugin('probability')):
 *   render(scope = .reveal)    (re)draw all diagrams inside scope
 *
 * ---------------------------------------------------------------------------------------
 * Covered and highlighted values
 *
 *   A "?" in front of a value (probability tree, four-field table, mode probability of the Venn
 *   diagram) makes it a solution that is covered until it is clicked:
 *       data-values="?0,15|0,1|?0,25 ; …"     data-probabilities="?1/6|5/6 ; …"
 *   The value gets the class "uncover" (table: a <span class="uncover block"> inside the cell;
 *   SVG: a <g class="uncover"> around the text or fraction). data-uncover="all" on the diagram
 *   covers all of its values (in the table also headings only with an explicit "?").
 *   A "!" in front of a table cell adds the class "highlight" to the cell (red frame); it can be
 *   combined with "?" ("?!0,23"). "!" has no effect in the tree and the Venn diagram.
 *
 *   The plugin does not depend on reveal-uncover. It only sets the class and, if the plugin is
 *   loaded, asks it to cover the new elements (Reveal.getPlugin('uncover').cover(diagram)).
 *   Without reveal-uncover the values simply stay visible.
 *
 * Colours, line widths and fonts are CSS; see reveal-probability.css.
 */
(function () {
  'use strict';

  const warn = (...args) => console.warn('[reveal-probability]', ...args);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const splitPlain = (text, separator) => text.split(separator).map(s => s.trim()).filter(Boolean);

  // Flags in front of a value: "?" = covered until clicked (class "uncover", see reveal-uncover),
  // "!" = highlighted. data-uncover="all" on the diagram covers every value.
  function parseFlags(text, coverAll = false) {
    const [, flags, rest] = /^([?!]*)\s*([\s\S]*)$/.exec(text);
    return { text: rest, cover: coverAll || flags.includes('?'), highlight: flags.includes('!') };
  }

  // Split at a separator but not inside $…$; a backslash keeps the next character from counting.
  function splitOutsideMath(text, separator) {
    const parts = [];
    let current = '', inMath = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '\\') { current += c + (text[++i] ?? ''); continue; }
      if (c === '$') inMath = !inMath;
      if (c === separator && !inMath) { parts.push(current.trim()); current = ''; }
      else current += c;
    }
    parts.push(current.trim());
    return parts;
  }

  // ======================================================================================
  // Venn diagram
  // ======================================================================================

  // Geometry in the 560×360 viewBox
  const SHAPES = {
    universe: '<rect x="10" y="10" width="540" height="340"',
    left:     '<circle cx="215" cy="180" r="125"',
    right:    '<circle cx="345" cy="180" r="125"'
  };
  const NAME_SPOTS = [[92, 90], [468, 90]];                  // circle names (left, right)
  const UNIVERSE_SPOT = [532, 340];                          // the "S"
  const VALUE_SPOTS = [[140, 190], [280, 190], [415, 190], [275, 334]];   // leftOnly, both, rightOnly, outside
  const ELEMENT_RADIUS = 14;

  const REGION_NAMES = ['leftOnly', 'both', 'rightOnly', 'outside'];

  // Fill layers (back to front) as [shape, fill kind, clipped to the left circle?]
  const PARTITION = [['universe', 'outside'], ['left', 'left'], ['right', 'right'], ['right', 'both', true]];
  const MODES = {
    none:         { fills: [],                                                             highlighted: [] },
    complement:   { fills: [['universe', 'highlight'], ['left', 'blank']],                 highlighted: ['rightOnly', 'outside'] },
    intersection: { fills: [['right', 'highlight', true]],                                 highlighted: ['both'] },
    union:        { fills: [['left', 'highlight'], ['right', 'highlight']],                highlighted: ['leftOnly', 'both', 'rightOnly'] },
    difference:   { fills: [['left', 'highlight'], ['right', 'blank']],                    highlighted: ['leftOnly'] },
    partition:    { fills: PARTITION,                                                      highlighted: [] },
    probability:  { fills: PARTITION,                                                      highlighted: [], values: true }
  };

  // Automatic placement of elements. Each region has an anchor and a membership test with
  // margin m (so that an element does not touch a line).
  const distLeft = (x, y) => Math.hypot(x - 215, y - 180) - 125;    // < 0: inside the left circle
  const distRight = (x, y) => Math.hypot(x - 345, y - 180) - 125;   // < 0: inside the right circle
  const nearLabel = (x, y) => [...NAME_SPOTS, UNIVERSE_SPOT].some(([lx, ly]) => Math.hypot(x - lx, y - ly) <= 40);
  const REGIONS = {
    leftOnly:  { anchor: [150, 180], contains: (x, y, m) => distLeft(x, y) <= -m && distRight(x, y) >= m },
    both:      { anchor: [280, 180], contains: (x, y, m) => distLeft(x, y) <= -m && distRight(x, y) <= -m },
    rightOnly: { anchor: [410, 180], contains: (x, y, m) => distRight(x, y) <= -m && distLeft(x, y) >= m },
    outside:   { anchor: [60, 305],  contains: (x, y, m) => distLeft(x, y) >= m && distRight(x, y) >= m
                 && x >= 10 + m && x <= 550 - m && y >= 10 + m && y <= 350 - m && !nearLabel(x, y) }
  };

  // Place n elements in a region. A staggered grid is laid out so that the anchor is the centre
  // of a grid triangle; the n admissible points closest to the anchor are taken (a tidy cluster).
  // If there is too little room the grid gets finer.
  function autoPlaces(regionName, n) {
    const { anchor: [ax, ay], contains } = REGIONS[regionName];
    for (const step of [42, 38, 34, 31]) {
      const h = step * 0.87;
      const points = [];
      for (let j = -12; j <= 12; j++)
        for (let i = -14; i <= 14; i++) {
          const x = ax - step / 2 + i * step + (j & 1) * step / 2, y = ay - h / 3 + j * h;
          if (contains(x, y, ELEMENT_RADIUS + 4)) points.push([x, y]);
        }
      if (points.length >= n) {
        const distance = p => Math.hypot(p[0] - ax, p[1] - ay);
        return points.sort((p, q) => distance(p) - distance(q)).slice(0, n);
      }
    }
    warn(`not enough room for ${n} elements in region "${regionName}"`);
    return [];
  }

  let vennCount = 0;

  function drawVenn(host, config) {
    const mode = host.dataset.mode || 'none';
    if (!MODES[mode]) warn(`unknown mode "${mode}" (allowed: ${Object.keys(MODES).join(', ')})`);
    const { fills, highlighted, values } = MODES[mode] || MODES.none;
    const mini = host.classList.contains('mini');

    const setName = host.dataset.set;
    const set = setName ? (config.sets || {})[setName] : undefined;
    if (setName && !set) warn(`unknown set "${setName}" (define it as probability.sets in Reveal.initialize)`);
    const givenNames = host.dataset.names ?? set?.names?.join(',');
    let [name1, name2] = ['A', 'B'];
    if (givenNames !== undefined) {
      const names = givenNames.split(',').map(s => s.trim());
      if (names.length === 2) [name1, name2] = names;
      else warn(`data-names needs exactly two names separated by a comma, got "${givenNames}"`, host);
    }

    const clipId = `venn-clip-${++vennCount}`;
    const shape = (name, classes, extra = '') => `${SHAPES[name]} class="${classes}" ${extra}/>`;
    const text = (x, y, classes, content, extra = '') =>
      `<text x="${x}" y="${y}" class="${classes}" ${extra}>${esc(content)}</text>`;

    let svg = `<svg viewBox="0 0 560 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(config.labels?.venn ?? 'Venn diagram')}">`
      + `<defs><clipPath id="${clipId}">${SHAPES.left}/></clipPath></defs>`
      + shape('universe', 'venn-fill venn-fill-blank')
      + fills.map(([name, kind, clipped]) =>
          shape(name, `venn-fill venn-fill-${kind}`, clipped ? `clip-path="url(#${clipId})"` : '')).join('')
      + shape('universe', 'venn-frame')
      + shape('left', 'venn-circle venn-circle-1')
      + shape('right', 'venn-circle venn-circle-2');

    if (!mini) {
      svg += text(...NAME_SPOTS[0], 'venn-name venn-name-1', name1)
           + text(...NAME_SPOTS[1], 'venn-name venn-name-2', name2)
           + text(...UNIVERSE_SPOT, 'venn-universe-label', 'S');

      if (values) {
        const given = host.dataset.values ? host.dataset.values.split('|').map(s => s.trim()) : [];
        given.slice(0, VALUE_SPOTS.length).forEach((value, i) => {
          const { text: shown, cover } = parseFlags(value, host.dataset.uncover === 'all');
          const t = text(...VALUE_SPOTS[i], 'venn-value', shown);
          svg += cover ? `<g class="uncover">${t}</g>` : t;
        });
      } else {
        for (const region of REGION_NAMES) {
          const given = host.dataset[region];
          const labels = (given !== undefined ? splitPlain(given, ',') : (set?.[region] || [])).map(String);
          const positions = set?.positions;
          const places = positions && labels.every(label => positions[label])
            ? labels.map(label => positions[label])
            : autoPlaces(region, labels.length);
          const on = highlighted.includes(region) ? ' venn-element-highlighted' : '';
          labels.forEach((label, i) => {
            if (!places[i]) return;
            const [x, y] = places[i];
            svg += `<circle cx="${x}" cy="${y}" r="${ELEMENT_RADIUS}" class="venn-element${on}"/>`
                 + text(x, y, `venn-element-label${on}`, label, 'dy=".35em"');
          });
        }
      }
    }
    host.innerHTML = svg + '</svg>';
  }

  // ======================================================================================
  // Tree diagram
  // ======================================================================================

  const TREE = {
    root: [230, 8],
    stage1: [[115, 100], [345, 100]],                                  // event, complement
    stage2: [[[55, 215], [175, 215]], [[285, 215], [405, 215]]]        // after event, after complement
  };

  function drawTree(host, config) {
    const [name1, name2] = (host.dataset.names || 'A,B').split(',').map(s => s.trim());
    const stages = splitPlain(host.dataset.probabilities || '', ';').map(part => splitPlain(part, '|'));
    if (stages.length !== 3 || stages.some(p => p.length !== 2)) {
      warn('data-probabilities needs three groups with two probabilities each, e.g. "1/6|5/6 ; 1/3|2/3 ; 4/5|1/5"', host);
      return;
    }
    const { root, stage1, stage2 } = TREE;
    const nodes = [
      ...stage1.map(([x, y], i) => ({ x, y, name: name1, complement: i === 1, level: 1 })),
      ...stage2.flat().map(([x, y], i) => ({ x, y, name: name2, complement: i % 2 === 1, level: 2 }))
    ];
    const branches = [                                                  // from, to, probability
      [root, stage1[0], stages[0][0]], [root, stage1[1], stages[0][1]],
      [stage1[0], stage2[0][0], stages[1][0]], [stage1[0], stage2[0][1], stages[1][1]],
      [stage1[1], stage2[1][0], stages[2][0]], [stage1[1], stage2[1][1], stages[2][1]]
    ];

    // a/b as a stacked fraction around (x, y), other text on one line
    const label = (x, y, value) => {
      const { text: p, cover } = parseFlags(value, host.dataset.uncover === 'all');
      const [numerator, denominator] = p.split('/');
      const svg = denominator === undefined
        ? `<text x="${x}" y="${y}" dy=".35em" class="tree-probability">${esc(p)}</text>`
        : `<text x="${x}" y="${y - 5}" class="tree-probability">${esc(numerator)}</text>`
        + `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" class="tree-fraction-bar"/>`
        + `<text x="${x}" y="${y + 18}" class="tree-probability">${esc(denominator)}</text>`;
      return cover ? `<g class="uncover">${svg}</g>` : svg;
    };

    let svg = `<svg viewBox="0 0 460 245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(config.labels?.tree ?? 'Tree diagram')}">`;
    for (const [from, to] of branches)
      svg += `<line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" class="tree-branch"/>`;
    for (const { x, y, name, complement, level } of nodes) {
      svg += `<circle cx="${x}" cy="${y}" r="18" class="tree-node tree-node-${level}"/>`
           + `<text x="${x}" y="${y}" dy=".35em" class="tree-node-label tree-node-${level}">${esc(name)}</text>`
           + (complement ? `<line x1="${x - 7}" y1="${y - 12}" x2="${x + 7}" y2="${y - 12}" class="tree-overline tree-node-${level}"/>` : '');
    }
    for (const [from, to, p] of branches) {
      const toTheLeft = to[0] < from[0];                                // label sits beside its branch, a bit above the middle
      svg += label((from[0] + to[0]) / 2 + (toTheLeft ? -27 : 27), (from[1] + to[1]) / 2 - 8, p);
    }
    host.innerHTML = svg + '</svg>';
  }

  // ======================================================================================
  // Four-field table
  // ======================================================================================

  function drawFourField(host) {
    const columns = splitOutsideMath(host.dataset.columns || '', '|');
    const rows = splitOutsideMath(host.dataset.rows || '', '|');
    const values = splitOutsideMath(host.dataset.values || '', ';').map(row => splitOutsideMath(row, '|'));
    if (columns.length !== 2 || rows.length !== 2 || values.length !== 3 || values.some(row => row.length !== 3)) {
      warn('four-field table needs 2 data-columns, 2 data-rows and data-values with 3 rows of 3 cells', host);
      return;
    }
    const total = host.dataset.totalLabel ?? 'Σ';
    const cell = (tag, content, className, coverAll = false) => {
      const { text, cover, highlight } = parseFlags(content, coverAll);
      const el = document.createElement(tag);
      if (cover) {
        const span = document.createElement('span');
        span.className = 'uncover block';
        span.textContent = text;
        el.append(span);
      } else el.textContent = text;
      el.className = [className, highlight && 'highlight'].filter(Boolean).join(' ');
      return el;
    };
    const all = host.dataset.uncover === 'all';
    const row = (...cells) => {
      const tr = document.createElement('tr');
      tr.append(...cells);
      return tr;
    };

    const table = document.createElement('table');
    table.append(
      row(cell('th', host.dataset.corner ?? ''), cell('th', columns[0]), cell('th', columns[1]), cell('th', total)),
      row(cell('th', rows[0]), cell('td', values[0][0], 'inner', all), cell('td', values[0][1], 'inner', all), cell('td', values[0][2], '', all)),
      row(cell('th', rows[1]), cell('td', values[1][0], 'inner', all), cell('td', values[1][1], 'inner', all), cell('td', values[1][2], '', all)),
      row(cell('th', total), cell('td', values[2][0], '', all), cell('td', values[2][1], '', all), cell('td', values[2][2], '', all))
    );
    host.replaceChildren(table);
  }

  // ======================================================================================
  // Plugin
  // ======================================================================================

  window.RevealProbability = () => {
    let config = {}, deck = null;

    function render(scope = document) {
      const hosts = scope.querySelectorAll('.venn, .tree, .fourfield');
      scope.querySelectorAll('.venn').forEach(host => drawVenn(host, config));
      scope.querySelectorAll('.tree').forEach(host => drawTree(host, config));
      scope.querySelectorAll('.fourfield').forEach(host => drawFourField(host));
      // Cover the marked values if reveal-uncover is loaded; without it they stay visible.
      const uncover = deck?.getPlugin?.('uncover');
      if (uncover) hosts.forEach(host => { if (host.querySelector('.uncover')) uncover.cover(host); });
    }

    function init(revealDeck) {
      deck = revealDeck;
      config = deck.getConfig().probability || {};
      render(deck.getRevealElement());
    }

    return { id: 'probability', init, render };
  };
})();
