/*!
 * reveal-uncover.js – click-to-uncover solutions for reveal.js
 *
 * Elements marked with the class "uncover" start out covered (blurred, unreadable).
 * A click uncovers one element, another click covers it again. Keys uncover or cover all
 * elements of the current slide or of the whole presentation, so a slide can be reused
 * with a new group.
 *
 * Usage:
 *   <link rel="stylesheet" href=".../reveal-uncover.css">
 *   <script src=".../reveal-uncover.js"></script>
 *   Reveal.initialize({ plugins: [ ..., RevealUncover ] });
 *
 *   <span class="uncover">solution</span>           inline element
 *   <span class="uncover block">solution</span>     full-width element (display: block)
 *
 * Several .uncover elements on one slide give a step-by-step solution: the audience
 * (or the teacher) clicks them in the order they want.
 *
 * Optional configuration:
 *   Reveal.initialize({ uncover: {
 *     keys: {                                    false switches a key off
 *       uncoverSlide: 'U',                       uncover everything on the current slide
 *       uncoverAll:   'Shift+U',                 uncover everything in the presentation
 *       coverSlide:   'V',                       cover everything on the current slide
 *       coverAll:     'Shift+V'                  cover everything in the presentation
 *     },
 *     descriptions: {                            texts in reveal.js's keyboard help
 *       uncoverSlide: 'Uncover all solutions on this slide', uncoverAll: '…', coverSlide: '…', coverAll: '…'
 *     }
 *   } });
 *   A key is a single character, optionally with the prefix "Shift+". reveal.js ignores keys
 *   with modifiers, so the plugin listens for "Shift+" keys itself (not while typing in a field).
 *
 * API (Reveal.getPlugin('uncover')):
 *   cover(scope = .reveal)     cover all .uncover elements inside scope
 *   uncover(scope = .reveal)   uncover them
 *   toggle(element)            toggle a single element
 *
 * Notes:
 *  – The class "covered" marks the covered state; reveal-uncover.css styles it.
 *  – Clicks are handled by one listener on the .reveal element, so elements that are
 *    added later work without further setup. They start out uncovered; call cover(scope).
 *  – The plugin does not depend on any other plugin. Touch-zoom plugins that react to
 *    double taps should be told to ignore ".uncover" (see reveal-touchzoom: ignore).
 */
(function () {
  'use strict';

  const SELECTOR = '.uncover';
  const COVERED = 'covered';

  window.RevealUncover = () => {
    let root = document;

    const setState = (scope, covered) =>
      scope.querySelectorAll(SELECTOR).forEach(el => el.classList.toggle(COVERED, covered));
    const cover = (scope = root) => setState(scope, true);
    const uncover = (scope = root) => setState(scope, false);
    const toggle = el => el.classList.toggle(COVERED);

    const ACTIONS = {
      uncoverSlide: { key: 'U', description: 'Uncover all solutions on this slide', run: (deck, self) => self.uncover(deck.getCurrentSlide()) },
      uncoverAll:   { key: 'Shift+U', description: 'Uncover all solutions', run: (deck, self) => self.uncover() },
      coverSlide:   { key: 'V', description: 'Cover all solutions on this slide', run: (deck, self) => self.cover(deck.getCurrentSlide()) },
      coverAll:     { key: 'Shift+V', description: 'Cover all solutions', run: (deck, self) => self.cover() }
    };

    function init(deck) {
      const cfg = deck.getConfig().uncover || {};
      root = deck.getRevealElement();

      root.addEventListener('click', e => {
        const el = e.target.closest(SELECTOR);
        if (el) toggle(el);
      });

      const shiftActions = {};                                      // upper-case character -> action
      for (const [name, action] of Object.entries(ACTIONS)) {
        const keySpec = cfg.keys?.[name] ?? action.key;
        if (!keySpec) continue;
        const description = cfg.descriptions?.[name] ?? action.description;
        const shift = /^shift\+/i.test(keySpec);
        const key = String(keySpec).replace(/^shift\+/i, '').toUpperCase();
        const run = () => action.run(deck, self);
        if (shift) {
          shiftActions[key] = run;
          deck.registerKeyboardShortcut?.('Shift + ' + key, description);
        } else {
          deck.addKeyBinding({ keyCode: key.charCodeAt(0), key, description }, run);
        }
      }

      // reveal.js drops every key press with a modifier, so Shift+key needs its own listener.
      if (Object.keys(shiftActions).length) {
        document.addEventListener('keydown', e => {
          const run = e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && shiftActions[e.key.toUpperCase()];
          const target = e.target;
          if (run && !(target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) run();
        });
      }

      cover();
    }

    const self = { id: 'uncover', init, cover, uncover, toggle };
    return self;
  };
})();
