---
title: "reveal-layouts – Folienvorlagen"
subtitle: "Referenz"
lang: de
---

# Überblick

`reveal-layouts.css` stellt Folienvorlagen für reveal.js bereit, ähnlich den Folienlayouts in PowerPoint.
Es ist eine reine CSS-Datei ohne Skript und unabhängig von den anderen Plugins.

Eine Vorlage wählt man mit einer Klasse am `<section>`. Die Inhalte der Folie finden ihren Platz über
Klassennamen, die in der jeweiligen Vorlage gelten.

```html
<link rel="stylesheet" href=".../reveal-layouts.css">

<section class="layout-side">
  <h2>Überschrift</h2>
  <div class="visual">…Diagramm…</div>
  <div class="text">…Text…</div>
</section>
```

Eine lauffähige Vorführung aller Vorlagen ist `demo-layouts.html`.

| Vorlage | Zweck | Inhalte |
|:--|:--|:--|
| `layout-title` | Titelfolie | `h1`, `.subtitle`, `.hint` |
| `layout-section` | Kapitelfolie | `h1`, `.subtitle` |
| `layout-content` | Überschrift mit Fließinhalt | `h2`, beliebig |
| `layout-two-columns` | zwei gleich breite Spalten | `h2`, `.col`, `.col` |
| `layout-side` | Abbildung links, Text rechts | `h2`, `.visual`, `.text` |
| `layout-task` | Aufgabe, eine Spalte | `h2`, `.layout-box`, `.part`, `.item` |
| `layout-task-aside` | Aufgabe mit Spalte rechts | `h2`, `.task`, `.aside` oder `.visual` |
| `layout-summary` | Zusammenfassung mit Tabelle | `h2`, `.layout-panel` |

: Die Vorlagen {#tbl:templates}

# Vorlagen

## `layout-title` und `layout-section`

Helle Schrift für dunkle Folien (`.subtitle` 80 %, `.hint` 60 % deckend). Der dunkle Hintergrund wird von reveal.js erzeugt und deshalb am
`<section>` angegeben, nicht im CSS.

```html
<section class="layout-title" data-background-color="#1F4E7A">
  <h1>Titel</h1>
  <p class="subtitle">Untertitel</p>
  <p class="hint">Hinweise zur Bedienung (klein, blass)</p>
</section>
```

`layout-section` ist gleich aufgebaut, hat aber nur `h1` (größer) und `.subtitle`.

## `layout-content`

Überschrift zentriert, der Rest linksbündig. Für Folien ohne besondere Anordnung.

```html
<section class="layout-content">
  <h2>Überschrift</h2>
  <p>Text …</p>
</section>
```

## `layout-two-columns`

Zwei gleich breite Spalten; die Überschrift steht über beiden.

```html
<section class="layout-two-columns">
  <h2>Überschrift</h2>
  <div class="col">…</div>
  <div class="col">…</div>
</section>
```

## `layout-side`

Links eine Abbildung fester Breite (`.visual`), rechts eine Textspalte in kleinerer Schrift (`.text`), in der
Kästen untereinander stehen.

```html
<section class="layout-side">
  <h2>Überschrift</h2>
  <div class="visual"><div class="venn" data-mode="union"></div></div>
  <div class="text">
    <div class="layout-box">…</div>
    <div class="layout-box">…</div>
  </div>
</section>
```

Die Breite der linken Spalte ist `--layout-visual-width` (Standard 640px). Ist die Abbildung ein einzelnes
Element, kann es die Klasse selbst tragen: `<div class="venn visual" …></div>`.

## `layout-task`

Aufgabenfolie in einer Spalte, Schrift kleiner als normal. Teilaufgaben tragen die Klasse `.part`.
Beschriftete Zeilen (`.item`) haben links eine Beschriftung (`.label`) und rechts den Inhalt.

```html
<section class="layout-task">
  <h2>Aufgabe 1</h2>
  <div class="layout-box"><p>Ausgangssituation …</p></div>
  <div>
    <p class="part">a) Teilaufgabe …</p>
    <span class="uncover block">Lösung</span>
  </div>
  <div style="--layout-label-width: 7em">
    <p class="part">b) Bestimme …</p>
    <div class="item"><span class="label">(1) P(A)</span><div>…</div></div>
  </div>
</section>
```

Die Breite der Beschriftungsspalte ist `--layout-label-width` (Standard `auto`; für gleich ausgerichtete Zeilen
auf einem umgebenden Element setzen).

## `layout-task-aside`

Wie `layout-task`, aber mit einer zweiten Spalte rechts für ein Diagramm, einen Baum oder eine Tafel.

```html
<section class="layout-task-aside">
  <h2>Aufgabe 5</h2>
  <div class="task">…Aufgabentext, .layout-box, .part, .item…</div>
  <div class="aside"><div class="tree" data-probabilities="…"></div></div>
</section>
```

Die rechte Spalte ist entweder `.aside` (kleine Schrift wie `.task`, mehrere Elemente untereinander) oder
`.visual` (normale Schrift, z. B. für eine Vierfeldertafel). Ihre Breite ist `--layout-aside-width`
(Standard 440px).

```html
<div class="visual"><div class="fourfield" data-values="…"></div></div>
```

## `layout-summary`

Überschrift mit einer Tabelle in einem Rahmen (`.layout-panel`). Kopfzeile (`th`) und Zeilenlinien sind
vorgegeben; die Tabelle füllt die Breite.

```html
<section class="layout-summary">
  <h2>Zusammenfassung</h2>
  <div class="layout-panel">
    <p class="box-title">Titel des Rahmens</p>
    <table>
      <tr><th>Spalte 1</th><th>Spalte 2</th></tr>
      <tr><td>…</td><td>…</td></tr>
    </table>
  </div>
</section>
```

# Bausteine

Bausteine kann man in jeder Vorlage und auch ohne Vorlage verwenden.

| Klasse | Wirkung |
|:--|:--|
| `layout-box` | Kasten mit Rahmen links; `.box-title` ist die fette Titelzeile |
| `layout-box-definition` | zusätzlich zu `layout-box`: Kasten in der zweiten Farbe (Definitionen) |
| `layout-panel` | Rahmen um einen größeren Bereich (Tabelle); `.box-title` darin |
| `layout-legend` | Reihe von Farberklärungen |
| `layout-chip` | ein Farbfeld in der Legende, Farbe per `style="background:…"` |

: Bausteine {#tbl:blocks}

```html
<div class="layout-box layout-box-definition">
  <p class="box-title">Gegenereignis</p>
  <p>Alle Ergebnisse, die nicht zu $A$ gehören.</p>
</div>

<div class="layout-legend">
  <span><span class="layout-chip" style="background:#FFE0A3"></span>beides</span>
</div>
```

# Anpassen

Die Vorlagen lesen Custom Properties, die man auf `:root` (ganze Präsentation) oder an einem einzelnen
`<section>` setzt.

| Variable | Wirkung | Standard |
|:--|:--|:--|
| `--layout-primary` | Rahmen und Titel der Kästen, Tabellenköpfe | `#1F4E7A` |
| `--layout-accent` | Rahmen des Panels, Linie unter den Tabellenköpfen | `#0A84C1` |
| `--layout-definition` | Definitionskasten | `#6A4C93` |
| `--layout-muted` | Rand der Farbfelder | `#5B6779` |
| `--layout-box-bg` | Hintergrund der Kästen | `#EEF4FA` |
| `--layout-definition-bg` | Hintergrund der Definitionskästen | `#F3EFF8` |
| `--layout-panel-bg` | Hintergrund des Panels | `#EDF3FB` |
| `--layout-rule` | dünne Linien in der Tabelle | `#C9D6E4` |
| `--layout-on-dark` | Textfarbe auf dunklen Folien | `#fff` |
| `--layout-gap` | Abstand der Spalten | `34px` |
| `--layout-visual-width` | `layout-side`: linke Spalte | `640px` |
| `--layout-aside-width` | `layout-task-aside`: rechte Spalte | `440px` |
| `--layout-label-width` | `.item`: Beschriftungsspalte | `auto` |
| `--layout-text-size` | `layout-side`: Textspalte; `layout-summary`: Tabelle | `.58em` |
| `--layout-task-size` | Aufgabenvorlagen: Schrift | `.6em` |

: Custom Properties {#tbl:variables}

Beispiel: eine Folie mit breiterer Abbildung.

```html
<section class="layout-side" style="--layout-visual-width: 760px">…</section>
```

# Hinweise

- reveal.js setzt an jedes `<section>` selbst `display: block`. Die Vorlagen mit Spalten überschreiben das mit
  `!important`; von reveal.js ausgeblendete Folien (`display: none`) bleiben ausgeblendet.
- Die Überschrift (`h1` oder `h2`) spannt in den Spaltenvorlagen über alle Spalten und ist zentriert.
  Ihre Farbe und Schriftart kommen vom reveal.js-Theme.
- Vorlagen und Bausteine gelten nur innerhalb von `.reveal`.
- Namen der Vorlagen und Variablen sind englisch (wie alle Plugin-Namen); diese Referenz ist deutsch.
