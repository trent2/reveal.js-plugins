# CLAUDE.md

Mathe-Lernstrecke „Verknüpfen von Ereignissen" als reveal.js-Präsentation, dazu die eigenen reveal.js-Plugins, die daraus hervorgegangen sind. Antworten an den Nutzer auf Deutsch.

## Dateien

Flaches Layout, wie im Repository `trent2/reveal.js-plugins` (dort ausgeliefert über jsDelivr: `https://cdn.jsdelivr.net/gh/trent2/reveal.js-plugins@<Version>/<datei>`).

| Datei | Zweck |
|---|---|
| `Verknuepfen-Ereignisse.html` | Die Präsentation (reveal.js 5 vom CDN, Inhalt deutsch, derzeit 15 Folien), Testdatei für alle Plugins. **Liegt nur lokal und ist nicht im Repository** (steht in `.gitignore`); nicht committen, solange der Nutzer es nicht verlangt. |
| `reveal-uncover.js` / `.css` | Plugin: Ergebnisse per Klick aufdecken (Klasse `uncover`). |
| `reveal-probability.js` / `.css` | Plugin: Venn-Diagramme (zwei Mengen), Baumdiagramme, Vierfeldertafeln. |
| `reveal-touchzoom.js` | Bestehendes Plugin (Tablet-Zoom). Lokale Kopie von Version 0.0.1 mit der zusätzlichen Option `ignore`; **noch nicht veröffentlicht**. Nur minimal ändern, der Code ist deutsch. |
| `reveal-layouts.css` | Plugin (nur CSS): Folienvorlagen `layout-…` am `<section>` und Bausteine (`layout-box`, `layout-panel`, `layout-legend`). Variablen `--layout-*`, Übersicht im Kopfkommentar. |
| `docs/reference.md`, `docs/build.sh` | Referenz der Vorlagen (Pandoc-Markdown, deutsch); `build.sh` erzeugt HTML und PDF. **`pandoc` ist hier nicht installiert, `build.sh` ist daher ungetestet.** Ausgaben stehen in `.gitignore`. Plugin-APIs bleiben in den Kopfkommentaren der `.js`-Dateien. Bei neuen Vorlagen, Bausteinen oder Variablen die Referenz mitpflegen (`test/run.sh` prüft die Namen). |
| `demo-layouts.html` | Alle Vorlagen auf je einer Folie (englisch), zum Ansehen und als Smoke-Test. |
| `demo.html` | Kurze Demo mit minimalem Funktionsumfang (Venn, Baum, Vierfeldertafel, Aufdecken), englisch. Für Neulinge und als Smoke-Test. |
| `test/index.html`, `test/run.sh` | Automatische Tests (siehe „Prüfen“). |
| `test/shots.sh`, `test/compare-shots.py` | Alle Folien der Präsentation als PNG (verdeckt und aufgedeckt) und pixelweiser Vergleich zweier Läufe, für Refactorings des Aussehens. |
| `test/deck-snapshot.py`, `test/golden/deck.json` | Zusammenfassung der Präsentation pro Folie und der Golden Master dazu. Der Master liegt nur lokal (steht in `.gitignore`, wie die Präsentation) und wird mit `test/run.sh --update-golden` neu erzeugt. |

Die API jedes Plugins (Attribute, Konfiguration, Methoden) steht im Kommentar am Anfang der `.js`-Datei, die Farb-Variablen im Kopf der `.css`-Datei. Bei API-Änderungen diese Kommentare mitpflegen.

## Sprache

- **Plugins:** alles Englisch (Bezeichner, Kommentare, Konsolenmeldungen, CSS-Klassen, `data-`-Attribute, Konfigurationsschlüssel).
- **Präsentation:** sichtbare Texte, Sprechernotizen und Folienkommentare deutsch; das Skript am Ende der HTML-Datei englisch. Die deutschen Layout-Klassen des Decks (`.raster-venn`, `.aufg`, `.pos`, …) bleiben, bis jemand die Umbenennung beauftragt.
- Texte, die der Nutzer des Plugins sieht (aria-label, Hilfetext zur Taste V), haben englische Vorgaben und werden im Deck per Konfiguration übersetzt.

## Plugin-Konventionen

- Aufbau wie `reveal-touchzoom.js`: IIFE mit `'use strict'`, Export `window.RevealX = () => ({ id: 'x', init, … })`, Konfiguration über `Reveal.initialize({ x: { … } })` (`deck.getConfig().x`), Eingabe über HTML-Elemente mit Klassen und `data-`-Attributen.
- **Aussehen steht im CSS, nicht im JS.** Das JS enthält nur Geometrie; SVG-Elemente tragen Klassen (`venn-…`, `tree-…`). Farben sind Custom Properties (`--probability-*`, `--uncover-transition-time`) mit Standardwerten in der Plugin-CSS.
- **Keine Daten des Decks im Plugin.** Die 20 Personen der Folien 2 bis 7 stehen in der Deck-Konfiguration `probability.sets.persons`, nicht im Plugin-Code.
- **Plugins sind voneinander unabhängig.** `reveal-touchzoom` muss ohne `reveal-uncover` laufen (und umgekehrt). Verbunden werden sie nur durch die Deck-Konfiguration `touchzoom: { ignore: '.uncover' }`.
- **Kopplung über Konvention, nicht über Code:** `reveal-probability` setzt auf Werte, die der Nutzer mit führendem `?` markiert (`data-values="?0,15|0,1|…"`, `data-probabilities="?1/6|…"`, Kurzform `data-uncover="all"`), die Klasse `uncover`. Es kennt `reveal-uncover` nicht als Abhängigkeit; nur falls vorhanden, ruft es danach `deck.getPlugin('uncover')?.cover(host)` auf (Fallback: bubbelndes `CustomEvent('probability:rendered')`, falls `getPlugin` während `init` noch nichts liefert). Ohne Uncover-Plugin sind die Werte sichtbar. Vierfeldertafel: Inhalt in `<span class="uncover block">` innerhalb der Zelle, nicht die `td` selbst; SVG (Baum, Venn-Werte): `<g class="uncover">` um Text bzw. Bruch. `getPlugin` ist während `init` verfügbar, ein Event war nicht nötig. Verdeckt wird nur der Diagramm-Host (`cover(host)`), nie der ganze Bereich, damit vom Nutzer aufgedeckte Lösungen beim späteren `render(scope)` offen bleiben. `!` vor einer Tafelzelle gibt ihr die Klasse `highlight` (roter Rahmen, `--probability-table-highlight`); kombinierbar: `?!0,23`.
- **Tasten in `reveal-uncover`:** `U` Folie aufdecken, `Shift+U` alles aufdecken, `V` Folie verdecken, `Shift+V` alles verdecken (vorher verdeckte `V` alles). Konfiguration `uncover: { keys: { uncoverSlide, uncoverAll, coverSlide, coverAll }, descriptions: {…} }` ersetzt `key`/`keyDescription`; `false` schaltet eine Taste ab. Folie = `deck.getCurrentSlide()`. reveal.js verwirft Tastendrücke mit Shift/Strg/Alt, bevor es `addKeyBinding`-Callbacks aufruft; `U`/`V` laufen deshalb über `addKeyBinding`, die `Shift+`-Tasten über einen eigenen `keydown`-Listener (nicht in Eingabefeldern), die Hilfezeile über `deck.registerKeyboardShortcut`.
- **Folienvorlagen:** Klasse `layout-<name>` am `<section>`, Inhalte über Kind-Klassen, die nur innerhalb der Vorlage gelten (`.visual`, `.text`, `.col`, `.task`, `.aside` (kleine Schrift) oder `.visual` (normale Schrift) als rechte Spalte von `layout-task-aside`, `.part`, `.item`, `.label`, `.subtitle`, `.hint`). Bausteine tragen das Präfix `layout-` (`layout-box`, `layout-box-definition`, `layout-panel`, `layout-legend`, `layout-chip`), damit sie nicht mit Klassen des Decks kollidieren. Vorlagen: `layout-title`, `layout-section`, `layout-content`, `layout-two-columns`, `layout-side`, `layout-task`, `layout-task-aside`, `layout-summary`. Das Deck nutzt sie seit der Migration (die alten Klassen `.raster-venn`, `.aufg`, `.raster-aufg`, `.zus`, `.box`, `.legende` usw. gibt es dort nicht mehr; übrig sind nur `.klein`, `.klein2`, `.kapit`). Abstände: Das Deck wurde pixelgleich umgestellt, deshalb gibt es in `layout-task` keinen `gap` zwischen Überschrift und erstem Element (Abstand 10px nur zwischen Nicht-Überschriften), und ein `layout-box` direkt unter dem `<section>` hat Aufgabengröße, verschachtelte nicht doppelt.
- Eingaben prüfen und bei Fehlern `console.warn('[reveal-probability] …')` statt Exceptions oder `undefined` im Bild.

## HTML-Kurzreferenz

```html
<span class="uncover">Lösung</span>              <!-- Klick deckt auf; "uncover block" für eine ganze Zeile -->

<div class="venn" data-mode="union" data-set="persons"></div>
<div class="venn" data-mode="none" data-names="E,F"
     data-left-only="5,1,3" data-both="2,6,4" data-right-only="8" data-outside="7"></div>
<div class="venn" data-mode="probability" data-names="T,K" data-values="0,1|0,15|0,05|0,7"></div>
<div class="venn mini" data-mode="complement"></div>   <!-- nur Kreise und Färbung, für Übersichten -->

<div class="tree" data-names="A,B" data-probabilities="1/6|5/6 ; 1/3|2/3 ; 4/5|1/5"></div>
<!-- optional: data-complement-names="…,…" (eigene Namen statt Überstrich), data-paths="a|b|c|d" (Pfadwahrscheinlichkeiten unter den Blättern) -->

<div class="fourfield" data-corner="Merkmal" data-total-label="Summe"
     data-columns="$K$|$\overline{K}$" data-rows="$T$|$\overline{T}$"
     data-values="0,15|0,1|0,25 ; 0,05|0,7|0,75 ; 0,2|0,8|1"></div>
<!-- "?" vor einem Wert (Tafel, Baum, Venn-Werte): verdeckt bis zum Klick; "!" (nur Tafel): rot umrandet; data-uncover="all": alle Werte verdeckt -->
<div class="fourfield" data-values="?0,15|?!0,1|0,25 ; …" …></div>
```

Venn-Modi: `none`, `complement`, `intersection`, `union`, `difference`, `partition`, `probability`. Elemente (Zahlen) zeichnen alle Modi außer `probability`; es gibt keinen eigenen Modus `elements`, `none` mit Elementlisten leistet das.

## Fallstricke

- **LaTeX in `data-`-Attributen** (Vierfeldertafel): Trennzeichen `|` und `;` werden innerhalb von `$…$` ignoriert (also geht `$P(A|B)$`). Außerhalb von `$…$` lassen sie sich nicht maskieren. `"` als `&quot;`, `&` als `&amp;` schreiben. In den SVG-Diagrammen (Venn, Baum) ist nur Klartext möglich.
- **KaTeX:** Die Plugins fügen den Text nur ein; das Deck rendert die Formeln selbst (`renderFormulas` am Ende der HTML-Datei) und tut das nach der Initialisierung der Plugins. Bei `RevealMath` muss `RevealProbability` in `plugins` davor stehen.
- **Moodle:** Dort funktionieren relative Plugin-Pfade nur, wenn die Dateien neben der HTML-Datei liegen. Für die Einbettung die Plugins über jsDelivr mit fester Version laden.
- **touchzoom:** Die Version 0.0.1 auf jsDelivr hat den Selektor `.aufdeckbar` fest eingebaut. Das Deck lädt deshalb die lokale Kopie. Sobald sie veröffentlicht ist, wieder auf die CDN-Version mit der neuen Versionsnummer umstellen.
- **`td` nicht als `.uncover`:** `.uncover` ist `inline-block`/`block` und zerstört das Tabellenlayout; immer ein `span` in der Zelle.
- **`display` am `<section>`:** reveal.js setzt an *jedes* `<section>` inline `display: block`, auch an künftige Folien. Die Grid/Flex-Vorlagen brauchen deshalb `display: … !important`, dazu die Schutzregel `section[style*="display: none"] { display: none !important }`, sonst erscheinen von reveal.js ausgeblendete Folien. Neue Vorlagen mit Grid/Flex müssen in beide Regeln aufgenommen werden (getestet).
- **Tasten mit Modifikator:** reveal.js ignoriert sie (siehe Tasten in `reveal-uncover`). Strg-Kombinationen sind außerdem Browserbelegungen (Strg+U Quelltext, Strg+V Einfügen); deshalb Shift.
- `renderFormulas` ruft `Reveal.layout()` nur auf, wenn neue Formeln entstanden sind. Ein `layout()` bei jedem `slidechanged` löst eine Endlosschleife aus.
- Diagramme entstehen einmal bei der Initialisierung. Später eingefügte Elemente zeichnet `Reveal.getPlugin('probability').render(scope)`, `render` verdeckt die mit `?` markierten Werte selbst, wenn `reveal-uncover` geladen ist; handgeschriebene `.uncover`-Elemente verdeckt man mit `Reveal.getPlugin('uncover').cover(scope)`.

## Prüfen

Kein Test-Framework, nur Headless-Chrome (Umgebungsvariable `CHROME` überschreibt den Befehl `google-chrome-stable`). reveal.js und KaTeX kommen vom CDN, es wird also Netz gebraucht.

```bash
test/run.sh     # Exit-Code 0 = alles in Ordnung
```

`test/run.sh` führt vier Prüfungen aus (`test/run.sh --update-golden` erzeugt zusätzlich den Golden Master der Präsentation neu):

1. **`test/index.html`** (derzeit 113 Tests, eigene Mini-Harness): Unit-Tests gegen ein Fake-Deck (`getConfig`, `getRevealElement`, `addKeyBinding`) und ein Integrationstest mit echtem reveal.js.
   - *uncover:* Startzustand, Klick (auch auf Kindelemente und SVG), API `cover`/`uncover`/`toggle` mit Bereich, später eingefügte Elemente, Tasten `U`/`V`/`Shift+U`/`Shift+V` (Folie gegen alles, andere Modifikatoren, Eingabefelder, Konfiguration, `false`, Hilfetext), Listener nur am Reveal-Element, CSS (Blur).
   - *Aufdeckbare/hervorgehobene Werte:* `?` und `!` in Tafel, Baum und Venn, `data-uncover="all"`, Escaping, mit und ohne `reveal-uncover`, späteres `render(scope)`, CSS.
   - *Venn:* alle sieben Modi (Füllschichten, hervorgehobene Elemente, clipPath-IDs eindeutig), Werte, Namen, `mini`, Sets (Namen, Elemente, feste Positionen, Vorrang der Attribute, Teilpositionen, unbekanntes Set), automatische Platzierung (liegt im Bereich, Randabstand, keine Überlappung, Abstand zu Beschriftungen, zu viele Elemente), Escaping, unbekannter Modus, `aria-label`.
   - *Baum:* Struktur, Überstriche nur an Gegenereignissen, Brüche und Dezimalzahlen, Beschriftung neben dem Ast, ungültige Eingaben, Escaping.
   - *Vierfeldertafel:* Struktur und Zellreihenfolge, Standardwerte, Leerraum, `$…$`-sicheres Trennen, LaTeX unverändert, Text statt Markup, ungültige Eingaben.
   - *Vorlagen:* je Vorlage berechnete Stile in einem `.reveal`-Fixture (Grid/Flex trotz Inline-`display`, ausgeblendete Folien bleiben aus, Spaltenzahl und -breiten, Variablen, Überschrift über allen Spalten, Farben, Bausteine).
   - *Plugin-API:* unabhängige Instanzen, `render()` idempotent, mit Bereich, nachträglich, nach Attributänderung, CSS-Variablen.
2. **`demo.html`** und **`demo-layouts.html`:** keine Konsolenmeldungen, erwartete Anzahl Diagramme (`demo.html`) bzw. alle Diagramme gebaut und alle Lösungen verdeckt, keine KaTeX-Fehler (`demo-layouts.html`).
3. **`docs/reference.md`:** jede `layout-…`-Klasse und `--layout-…`-Variable aus `reveal-layouts.css` steht in der Referenz und umgekehrt.
4. **Präsentation** (nur wenn die Datei vorhanden ist, sie liegt nicht im Repository): `run.sh` testet eine Kopie, in der die Plugins lokal geladen werden (jsDelivr-Adressen werden ersetzt, `<base>` für relative Pfade). Geprüft werden: keine Konsolenmeldungen (außer `fsfx`), alle Diagramme gebaut, alle Lösungen verdeckt, keine KaTeX-Fehler und der **Golden Master** `test/golden/deck.json`: Folientitel und je Folie Anzahl Venn/Baum/Tafel/Lösungen. Ändert sich die HTML-Datei absichtlich, `test/run.sh --update-golden` ausführen und die Differenz prüfen (`diff` zeigt der Lauf vorher); die Zahlen stehen nicht mehr in `run.sh`.

**Neue Funktion = neuer Test.** Bei Änderungen an einem Plugin zuerst `test/run.sh`, bei neuen Attributen oder Modi Tests und Kopfkommentar des Plugins ergänzen. Fehlt noch: der Doppeltipp-Zoom von `reveal-touchzoom` (braucht echte Touch-Ereignisse; nur Lade-Smoke-Test).

Die Tests prüfen Struktur und Verhalten, nicht das Aussehen. Für Aussehen gilt:

```bash
# Folie N+1 (Hash ist nullbasiert) als Bild; der Hash #/10 ergibt Folie 11
google-chrome-stable --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1280,720 --virtual-time-budget=15000 \
  --screenshot=out.png "file://$PWD/Verknuepfen-Ereignisse.html#/10"
```

- Aufgedeckter Zustand: Kopie der HTML-Datei mit `<base href="file:///…/">` im `<head>` und einem Skript vor `</body>`, das nach dem Laden `document.querySelectorAll('.uncover.covered').forEach(e => e.click())` ausführt.
- **Refactoring des Aussehens:** Vorher `PAR=1 test/shots.sh .test-tmp/before`, nach der Änderung `PAR=1 test/shots.sh .test-tmp/after`, dann `python3 -I test/compare-shots.py .test-tmp/before .test-tmp/after` (benötigt Pillow; die Ecke mit der Foliennummer wird ignoriert, sie flackert). Bei Abweichungen die Elementpositionen im Browser messen (`getBoundingClientRect` vorher/nachher), statt Bilder anzusehen. `<base>` und `hash: true` vertragen sich nicht mit `Reveal.slide()` in einer Kopie (SecurityError bei `replaceState`); dort `Reveal.configure({ hash: false })` setzen. Letzte Prüfung: Migration auf `layout-…` am 2026-11-09, alle 30 Bilder identisch.
- **Der Nutzer will Screenshots selbst ansehen.** Bilder nicht selbst betrachten, sondern Pixelvergleich, Konsolenausgabe, DOM-Prüfungen und `test/run.sh` nutzen und dem Nutzer eine Checkliste geben, worauf er achten soll.
- Temporäre Bilder und Skripte in `.test-tmp/` ablegen (steht in `.gitignore`). Am Ende aufräumen oder dem Nutzer sagen, dass der Ordner gelöscht werden kann.

## Offen

- Die veröffentlichte Plugin-Version (jsDelivr, derzeit 0.0.2) kennt die Tasten `U`/`V`/`Shift+U`/`Shift+V` und die Werte-Markierung `?`/`!` noch nicht; für Moodle neue Version veröffentlichen und im Deck eintragen.
- `docs/build.sh` ist ungetestet, solange `pandoc` fehlt.

## Git

Das Verzeichnis ist das Repository `trent2/reveal.js-plugins` (Branch `main`). Änderungen in kleinen, thematisch getrennten Commits (englische Betreffzeile), nicht pushen, solange der Nutzer es nicht verlangt.
