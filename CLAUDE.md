# CLAUDE.md

Mathe-Lernstrecke „Verknüpfen von Ereignissen" als reveal.js-Präsentation, dazu die eigenen reveal.js-Plugins, die daraus hervorgegangen sind. Antworten an den Nutzer auf Deutsch.

## Dateien

Flaches Layout, wie im Repository `trent2/reveal.js-plugins` (dort ausgeliefert über jsDelivr: `https://cdn.jsdelivr.net/gh/trent2/reveal.js-plugins@<Version>/<datei>`).

| Datei | Zweck |
|---|---|
| `Verknuepfen-Ereignisse.html` | Die Präsentation (reveal.js 5 vom CDN, Inhalt deutsch, 13 Folien). Dient zugleich als **Testdatei** für alle Plugins. |
| `reveal-uncover.js` / `.css` | Plugin: Ergebnisse per Klick aufdecken (Klasse `uncover`). |
| `reveal-probability.js` / `.css` | Plugin: Venn-Diagramme (zwei Mengen), Baumdiagramme, Vierfeldertafeln. |
| `reveal-touchzoom.js` | Bestehendes Plugin (Tablet-Zoom). Lokale Kopie von Version 0.0.1 mit der zusätzlichen Option `ignore`; **noch nicht veröffentlicht**. Nur minimal ändern, der Code ist deutsch. |
| `demo.html` | Kurze Demo mit minimalem Funktionsumfang (Venn, Baum, Vierfeldertafel, Aufdecken), englisch. Für Neulinge und als Smoke-Test. |
| `test/index.html`, `test/run.sh` | Automatische Tests (siehe „Prüfen“). |

Die Aufgabenvorlagen `aufgaben.png` und `weitereA.png` (Schulbuch) gehören nicht ins Repository.

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

<div class="fourfield" data-corner="Merkmal" data-total-label="Summe"
     data-columns="$K$|$\overline{K}$" data-rows="$T$|$\overline{T}$"
     data-values="0,15|0,1|0,25 ; 0,05|0,7|0,75 ; 0,2|0,8|1"></div>
```

Venn-Modi: `none`, `complement`, `intersection`, `union`, `difference`, `partition`, `probability`. Elemente (Zahlen) zeichnen alle Modi außer `probability`; es gibt keinen eigenen Modus `elements`, `none` mit Elementlisten leistet das.

## Fallstricke

- **LaTeX in `data-`-Attributen** (Vierfeldertafel): Trennzeichen `|` und `;` werden innerhalb von `$…$` ignoriert (also geht `$P(A|B)$`). Außerhalb von `$…$` lassen sie sich nicht maskieren. `"` als `&quot;`, `&` als `&amp;` schreiben. In den SVG-Diagrammen (Venn, Baum) ist nur Klartext möglich.
- **KaTeX:** Die Plugins fügen den Text nur ein; das Deck rendert die Formeln selbst (`renderFormulas` am Ende der HTML-Datei) und tut das nach der Initialisierung der Plugins. Bei `RevealMath` muss `RevealProbability` in `plugins` davor stehen.
- **Moodle:** Dort funktionieren relative Plugin-Pfade nur, wenn die Dateien neben der HTML-Datei liegen. Für die Einbettung die Plugins über jsDelivr mit fester Version laden.
- **touchzoom:** Die Version 0.0.1 auf jsDelivr hat den Selektor `.aufdeckbar` fest eingebaut. Das Deck lädt deshalb die lokale Kopie. Sobald sie veröffentlicht ist, wieder auf die CDN-Version mit der neuen Versionsnummer umstellen.
- `renderFormulas` ruft `Reveal.layout()` nur auf, wenn neue Formeln entstanden sind. Ein `layout()` bei jedem `slidechanged` löst eine Endlosschleife aus.
- Diagramme entstehen einmal bei der Initialisierung. Später eingefügte Elemente zeichnet `Reveal.getPlugin('probability').render(scope)`, verdecken kann man sie mit `Reveal.getPlugin('uncover').cover(scope)`.

## Prüfen

Kein Test-Framework, nur Headless-Chrome (Umgebungsvariable `CHROME` überschreibt den Befehl `google-chrome-stable`). reveal.js und KaTeX kommen vom CDN, es wird also Netz gebraucht.

```bash
test/run.sh     # Exit-Code 0 = alles in Ordnung
```

`test/run.sh` führt drei Prüfungen aus:

1. **`test/index.html`** (derzeit 82 Tests, eigene Mini-Harness): Unit-Tests gegen ein Fake-Deck (`getConfig`, `getRevealElement`, `addKeyBinding`) und ein Integrationstest mit echtem reveal.js.
   - *uncover:* Startzustand, Klick (auch auf Kindelemente und SVG), API `cover`/`uncover`/`toggle` mit Bereich, später eingefügte Elemente, Taste und Beschreibung, `key: false`, Listener nur am Reveal-Element, CSS (Blur).
   - *Venn:* alle sieben Modi (Füllschichten, hervorgehobene Elemente, clipPath-IDs eindeutig), Werte, Namen, `mini`, Sets (Namen, Elemente, feste Positionen, Vorrang der Attribute, Teilpositionen, unbekanntes Set), automatische Platzierung (liegt im Bereich, Randabstand, keine Überlappung, Abstand zu Beschriftungen, zu viele Elemente), Escaping, unbekannter Modus, `aria-label`.
   - *Baum:* Struktur, Überstriche nur an Gegenereignissen, Brüche und Dezimalzahlen, Beschriftung neben dem Ast, ungültige Eingaben, Escaping.
   - *Vierfeldertafel:* Struktur und Zellreihenfolge, Standardwerte, Leerraum, `$…$`-sicheres Trennen, LaTeX unverändert, Text statt Markup, ungültige Eingaben.
   - *Plugin-API:* unabhängige Instanzen, `render()` idempotent, mit Bereich, nachträglich, nach Attributänderung, CSS-Variablen.
2. **`demo.html`:** keine Konsolenmeldungen, erwartete Anzahl Diagramme, Lösung verdeckt.
3. **Präsentation:** keine Konsolenmeldungen (außer `fsfx`), 14 Venn-Diagramme, 1 Baum, 2 Tafeln, alle 45 Lösungen verdeckt, keine KaTeX-Fehler.

**Neue Funktion = neuer Test.** Bei Änderungen an einem Plugin zuerst `test/run.sh`, bei neuen Attributen oder Modi Tests und Kopfkommentar des Plugins ergänzen. Fehlt noch: der Doppeltipp-Zoom von `reveal-touchzoom` (braucht echte Touch-Ereignisse; nur Lade-Smoke-Test).

Die Tests prüfen Struktur und Verhalten, nicht das Aussehen. Für Aussehen gilt:

```bash
# Folie N+1 (Hash ist nullbasiert) als Bild; der Hash #/10 ergibt Folie 11
google-chrome-stable --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1280,720 --virtual-time-budget=15000 \
  --screenshot=out.png "file://$PWD/Verknuepfen-Ereignisse.html#/10"
```

- Aufgedeckter Zustand: Kopie der HTML-Datei mit `<base href="file:///…/">` im `<head>` und einem Skript vor `</body>`, das nach dem Laden `document.querySelectorAll('.uncover.covered').forEach(e => e.click())` ausführt.
- **Refactoring des Aussehens:** Vorher alle Folien (verdeckt und aufgedeckt) rendern, nachher noch einmal, dann pixelweise vergleichen (`PIL.ImageChops.difference(a, b).getbbox()` ist `None` bei Gleichheit).
- **Der Nutzer will Screenshots selbst ansehen.** Bilder nicht selbst betrachten, sondern Pixelvergleich, Konsolenausgabe, DOM-Prüfungen und `test/run.sh` nutzen und dem Nutzer eine Checkliste geben, worauf er achten soll.
- Temporäre Bilder und Skripte in `.test-tmp/` ablegen (steht in `.gitignore`). Am Ende aufräumen oder dem Nutzer sagen, dass der Ordner gelöscht werden kann.

## Git

Das Verzeichnis ist das Repository `trent2/reveal.js-plugins` (Branch `main`). Änderungen in kleinen, thematisch getrennten Commits (englische Betreffzeile), nicht pushen, solange der Nutzer es nicht verlangt.
