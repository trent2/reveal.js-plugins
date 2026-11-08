/*!
 * reveal-touchzoom.js – Touch-Zoom für reveal.js (Tablet, auch im Vollbild)
 *
 * Gesten: zwei Finger zoomen/verschieben · ein Finger (gezoomt) verschieben ·
 *         Doppeltipp 2,5-fach an der Stelle bzw. zurück auf 1.
 *
 * Einbinden:
 *   <script src=".../reveal-touchzoom.js"></script>
 *   Reveal.initialize({ plugins: [ ..., RevealTouchZoom ] });
 * Optional:
 *   Reveal.initialize({ touchzoom: { max: 5, doppeltipp: 2.5 }, ... });
 *
 * Funktionsweise:
 *  – Im Vollbild ist .reveal das Vollbild-Element; dafür erzwingt der Browser
 *    „transform: none“. Gezoomt werden deshalb die Kinder .slides und .backgrounds.
 *  – reveal.js setzt auf .slides selbst „transform“ (Skalierung). Der Zoom nutzt
 *    daher die eigenständigen CSS-Eigenschaften „translate“ und „scale“, die der
 *    Browser mit „transform“ verrechnet, statt es zu überschreiben.
 *  – reveal.js wertet in Safari Pointer Events aus. Die Gesten werden in der
 *    Capture-Phase abgefangen, damit sie nicht als Wischen (Folienwechsel) gelten.
 */
(function () {
  'use strict';

  function init(deck) {
      const el = deck.getRevealElement();
      const ziele = ['.slides', '.backgrounds'].map(sel => el.querySelector(sel)).filter(Boolean);
      const cfg = deck.getConfig().touchzoom || {};
      const MAX = cfg.max || 5, DOPPEL_STUFE = cfg.doppeltipp || 2.5, DOPPEL_MS = 350, TIPP_TOL = 12, DOPPEL_TOL = 40;
      const KEIN_DOPPELTIPP = '.aufdeckbar, .controls, .progress, .fsbutton, a, button, input';

      // Browser-eigenes Zoomen auf der Präsentation abschalten (verschiebt sonst das Layout)
      el.style.touchAction = 'none';
      ['gesturestart', 'gesturechange'].forEach(typ =>
        document.addEventListener(typ, e => e.preventDefault(), { passive: false }));

      // Zoom als Abbildung p ↦ (tx, ty) + s·p in Koordinaten von .reveal
      let s = 1, tx = 0, ty = 0;

      // Für ein Kindelement mit Transformationsursprung o (in .reveal-Koordinaten)
      // ergibt sich dieselbe Abbildung aus  scale: s  und  translate: (tx, ty) + (s − 1)·o.
      const anwenden = anim => {
        for (const z of ziele) {
          z.style.transition = anim ? 'translate .3s ease, scale .3s ease' : '';
          if (s === 1) { z.style.translate = ''; z.style.scale = ''; continue; }
          const [ux, uy] = getComputedStyle(z).transformOrigin.split(' ').map(parseFloat);
          const ox = z.offsetLeft + ux, oy = z.offsetTop + uy;
          z.style.translate = `${tx + (s - 1) * ox}px ${ty + (s - 1) * oy}px`;
          z.style.scale = String(s);
        }
      };
      const begrenzen = () => {           // gezoomter Inhalt deckt .reveal stets vollständig ab
        const w = el.clientWidth, h = el.clientHeight;
        tx = Math.min(0, Math.max(w - w * s, tx));
        ty = Math.min(0, Math.max(h - h * s, ty));
      };
      const zuruecksetzen = anim => { s = 1; tx = ty = 0; anwenden(anim); };
      const lokal = p => { const r = el.getBoundingClientRect(); return { x: p.x - r.left, y: p.y - r.top }; };

      const zeiger = new Map();           // aktive Finger: pointerId -> {x, y}
      let pinch = null, pan = null, tipp = null, letzterTipp = null;
      let gesperrt = false;               // nach Zwei-Finger-Geste, bis alle Finger oben sind
      let klickSperreBis = 0;             // nach Verschieben/Zoomen keinen Klick auslösen

      const zwei = () => [...zeiger.values()].slice(0, 2);
      const mitte = (a, b) => lokal({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const pinchStarten = () => { const [a, b] = zwei(); pinch = { d: abstand(a, b), m: mitte(a, b), s, tx, ty }; };
      const panStarten = p => { pan = { x: p.x, y: p.y, tx, ty }; };
      const istTouch = e => e.pointerType === 'touch';

      window.addEventListener('pointerdown', e => {
        if (!istTouch(e) || deck.isOverview()) return;
        zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (zeiger.size >= 2) {
          pinchStarten();
          pan = null; tipp = null; letzterTipp = null; gesperrt = true;
          e.stopPropagation();
        } else {
          tipp = { x: e.clientX, y: e.clientY, zeit: Date.now(), ziel: e.target };
          if (s > 1) { panStarten({ x: e.clientX, y: e.clientY }); e.stopPropagation(); }
        }
      }, true);

      window.addEventListener('pointermove', e => {
        if (!istTouch(e) || !zeiger.has(e.pointerId)) return;
        zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (tipp && Math.hypot(e.clientX - tipp.x, e.clientY - tipp.y) > TIPP_TOL) tipp = null;
        if (pinch && zeiger.size >= 2) {
          const [a, b] = zwei(), m = mitte(a, b);
          const cx = (pinch.m.x - pinch.tx) / pinch.s, cy = (pinch.m.y - pinch.ty) / pinch.s;
          s = Math.min(MAX, Math.max(1, pinch.s * abstand(a, b) / pinch.d));
          tx = m.x - cx * s; ty = m.y - cy * s;
          begrenzen(); anwenden(false);
          klickSperreBis = Date.now() + 400;
          e.stopPropagation();
        } else if (pan) {
          tx = pan.tx + e.clientX - pan.x; ty = pan.ty + e.clientY - pan.y;
          begrenzen(); anwenden(false);
          if (!tipp) klickSperreBis = Date.now() + 400;
          e.stopPropagation();
        } else if (gesperrt) {
          e.stopPropagation();
        }
      }, true);

      const ende = e => {
        if (!istTouch(e) || !zeiger.has(e.pointerId)) return;
        zeiger.delete(e.pointerId);
        if (pinch && zeiger.size < 2) {
          pinch = null;
          if (s < 1.05) zuruecksetzen(true);
          if (zeiger.size === 1 && s > 1) panStarten([...zeiger.values()][0]);
        } else if (pinch) {
          pinchStarten();
        }
        if (zeiger.size > 0) return;
        pan = null;
        const warGesperrt = gesperrt;
        gesperrt = false;
        if (warGesperrt || !tipp || e.type === 'pointercancel') { tipp = null; return; }

        // Doppeltipp
        const jetzt = tipp;
        tipp = null;
        if (letzterTipp && jetzt.zeit - letzterTipp.zeit < DOPPEL_MS
            && Math.hypot(jetzt.x - letzterTipp.x, jetzt.y - letzterTipp.y) < DOPPEL_TOL
            && !(jetzt.ziel.closest && jetzt.ziel.closest(KEIN_DOPPELTIPP))) {
          letzterTipp = null;
          if (s > 1) zuruecksetzen(true);
          else {
            const p = lokal(jetzt);
            s = DOPPEL_STUFE; tx = p.x * (1 - s); ty = p.y * (1 - s);
            begrenzen(); anwenden(true);
          }
          klickSperreBis = Date.now() + 400;
          e.stopPropagation();
        } else {
          letzterTipp = jetzt;
        }
      };
      window.addEventListener('pointerup', ende, true);
      window.addEventListener('pointercancel', ende, true);

      // Nach Verschieben, Zoomen oder Doppeltipp keinen Klick (z. B. Aufdecken) auslösen
      window.addEventListener('click', e => {
        if (Date.now() < klickSperreBis) { e.stopPropagation(); e.preventDefault(); }
      }, true);

      // Zurück auf 1 bei Folienwechsel, Übersicht und Vollbildwechsel;
      // nach Größenänderung (reveal.js layoutet neu) Ursprung neu berechnen
      deck.on('slidechanged', () => zuruecksetzen(false));
      deck.on('overviewshown', () => zuruecksetzen(false));
      deck.on('resize', () => { if (s > 1) { begrenzen(); anwenden(false); } });
      ['fullscreenchange', 'webkitfullscreenchange'].forEach(typ =>
        document.addEventListener(typ, () => zuruecksetzen(false)));
  }

  window.RevealTouchZoom = () => ({ id: 'touchzoom', init });
})();
