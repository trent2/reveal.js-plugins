/*!
 * reveal-uncover.js – click-to-uncover solutions for reveal.js
 *
 * Elements marked with the class "uncover" start out covered (blurred, unreadable).
 * A click uncovers one element, another click covers it again. A key covers everything
 * at once, so a slide can be reused with a new group.
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
 *     key: 'V',                                  key that covers everything again (false: no key)
 *     keyDescription: 'Cover all solutions'      text in reveal.js's keyboard help
 *   } });
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

    function init(deck) {
      const cfg = Object.assign(
        { key: 'V', keyDescription: 'Cover all solutions' }, deck.getConfig().uncover);
      root = deck.getRevealElement();

      root.addEventListener('click', e => {
        const el = e.target.closest(SELECTOR);
        if (el) toggle(el);
      });

      if (cfg.key) {
        const key = String(cfg.key).toUpperCase();
        deck.addKeyBinding({ keyCode: key.charCodeAt(0), key, description: cfg.keyDescription }, () => cover());
      }

      cover();
    }

    return { id: 'uncover', init, cover, uncover, toggle };
  };
})();
