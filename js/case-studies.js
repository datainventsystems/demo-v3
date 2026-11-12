/* DataInvent: success stories (the global case-study module).
   The content lives in the page markup (section.success-stories). This file only runs the behaviour:
   a new story every 6 seconds, a click on an "UP NEXT" card or a dot shows that story, the rotation pauses while the pointer is over the
   module or the keyboard focus is inside it, it does not auto-play with "reduce motion", and it does not run while the section is off screen. */
(function () {
  'use strict';

  var DURATION = 6000;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function toArray(list) { return Array.prototype.slice.call(list); }

  function isKeyboardFocus(element) {
    try { return element.matches(':focus-visible'); } catch (error) { return true; }
  }

  function init(root) {
    var panels = toArray(root.querySelectorAll('.ss-panel'));
    var cards = toArray(root.querySelectorAll('.ss-queue .q-card'));
    var dots = toArray(root.querySelectorAll('.story-dots button'));
    var stage = root.querySelector('.story-stage');
    var total = panels.length;
    if (total < 2 || !stage) { return; }

    var current = 0;
    var timer = null;
    var inView = !('IntersectionObserver' in window);
    var hovering = false;
    var keyboardFocus = false;

    function render() {
      panels.forEach(function (panel, i) {
        var on = i === current;
        panel.classList.toggle('is-active', on);
        if (on) { panel.removeAttribute('aria-hidden'); } else { panel.setAttribute('aria-hidden', 'true'); }
      });
      dots.forEach(function (dot, i) {
        var on = i === current;
        dot.classList.toggle('active', on);
        if (on) { dot.setAttribute('aria-current', 'true'); } else { dot.removeAttribute('aria-current'); }
      });
      cards.forEach(function (card) {
        var index = parseInt(card.getAttribute('data-ss-go'), 10);
        card.setAttribute('data-pos', String((index - current + total) % total));
      });
    }

    function restartDot() {
      var dot = dots[current];
      if (!dot) { return; }
      dot.classList.remove('active');
      void dot.offsetWidth;
      dot.classList.add('active');
    }

    function canPlay() {
      return !reduceMotion && inView && !hovering && !keyboardFocus && !document.hidden;
    }

    function stop() {
      if (timer) { clearTimeout(timer); timer = null; }
      root.classList.add('is-paused');
    }

    function start() {
      if (timer) { clearTimeout(timer); }
      root.classList.remove('is-paused');
      restartDot();
      timer = setTimeout(function () { go(current + 1, false); }, DURATION);
    }

    function update() {
      if (canPlay()) { if (!timer) { start(); } } else { stop(); }
    }

    function go(index, byKeyboard) {
      current = ((index % total) + total) % total;
      render();
      if (canPlay()) { start(); } else { stop(); }
      if (byKeyboard && dots[current]) { dots[current].focus(); }
    }

    function onActivate(event) {
      var index = parseInt(this.getAttribute('data-ss-go'), 10);
      if (isNaN(index)) { return; }
      go(index, event.detail === 0);
    }

    cards.concat(dots).forEach(function (element) { element.addEventListener('click', onActivate); });

    stage.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') { hovering = true; update(); } });
    stage.addEventListener('pointerleave', function (event) { if (event.pointerType === 'mouse') { hovering = false; update(); } });
    stage.addEventListener('focusin', function (event) { keyboardFocus = isKeyboardFocus(event.target); update(); });
    stage.addEventListener('focusout', function (event) {
      if (!stage.contains(event.relatedTarget)) { keyboardFocus = false; update(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        update();
      }, { threshold: 0.2 }).observe(root);
    }
    document.addEventListener('visibilitychange', update);

    render();
    update();
  }

  toArray(document.querySelectorAll('[data-success-stories]')).forEach(init);
})();
