/* Naveen Kumar Palani — small progressive enhancements.
   The page works fully without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- Light / dark toggle ---------- */
  var toggle = document.querySelector('.theme-toggle');
  function currentTheme() {
    return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  }
  function syncToggle() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    var color = currentTheme() === 'dark' ? '#0b0d14' : '#f4f5fb';
    for (var i = 0; i < meta.length; i++) meta[i].setAttribute('content', color);
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
    systemDark.addEventListener && systemDark.addEventListener('change', syncToggle);
    syncToggle();
  }

  /* ---------- Background follows the cursor (mouse only) ----------
     The colour layers drift a little toward the pointer and a faint glow
     trails it. When the pointer rests, everything eases back. Skipped on
     touch screens and when reduced motion is requested. */
  (function () {
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    var layers = Array.prototype.slice.call(document.querySelectorAll('.bg__layer'));
    var glow = document.querySelector('.bg__glow');
    if (!layers.length || !glow) return;

    var REACH = 46;        // max drift in px for the deepest layer
    var EASE = 0.045;      // lower = slower, softer
    var IDLE_MS = 1400;    // pointer rest time before easing back
    var tx = 0, ty = 0, cx = 0, cy = 0;          // layer drift: target / current
    var gx = 0, gy = 0, gtx = 0, gty = 0;        // glow position
    var go = 0, gto = 0;                         // glow opacity
    var running = false, idleTimer = 0, placed = false;

    function enabled() { return finePointer.matches && !reduceMotion.matches; }

    function frame() {
      cx += (tx - cx) * EASE; cy += (ty - cy) * EASE;
      gx += (gtx - gx) * EASE * 1.6; gy += (gty - gy) * EASE * 1.6;
      go += (gto - go) * 0.05;
      for (var i = 0; i < layers.length; i++) {
        var depth = +layers[i].getAttribute('data-depth') || 1;
        layers[i].style.transform = 'translate3d(' + (cx * depth).toFixed(2) + 'px,' + (cy * depth).toFixed(2) + 'px,0)';
      }
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      glow.style.opacity = go.toFixed(3);
      var settled = Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1 &&
                    Math.abs(gtx - gx) < 0.3 && Math.abs(gty - gy) < 0.3 && Math.abs(gto - go) < 0.002;
      if (settled) { running = false; return; }
      requestAnimationFrame(frame);
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

    function rest() { tx = 0; ty = 0; gto = 0; kick(); }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !enabled()) return;
      var w = window.innerWidth, h = window.innerHeight;
      tx = ((e.clientX / w) - 0.5) * 2 * REACH;
      ty = ((e.clientY / h) - 0.5) * 2 * REACH;
      gtx = e.clientX; gty = e.clientY; gto = 1;
      if (!placed) { gx = gtx; gy = gty; placed = true; }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(rest, IDLE_MS);
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', rest);
    window.addEventListener('blur', rest);
    reduceMotion.addEventListener && reduceMotion.addEventListener('change', function () {
      if (reduceMotion.matches) { cx = cy = tx = ty = 0; go = gto = 0; kick(); }
    });
  })();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add('is-visible');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var k = 0; k < reveals.length; k++) io.observe(reveals[k]);
  }

  /* ---------- Research tree lines ---------- */
  var tree = document.querySelector('[data-tree]');
  if (!tree) return;
  var svg = tree.querySelector('.tree__lines');
  var rootNode = tree.querySelector('.node--root');
  var kids = Array.prototype.slice.call(tree.querySelectorAll('.node--child'));
  var NS = 'http://www.w3.org/2000/svg';

  svg.innerHTML =
    '<defs><linearGradient id="tree-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" style="stop-color:var(--line)"/><stop offset="1" style="stop-color:var(--line-2)"/>' +
    '</linearGradient></defs><g class="branches"></g><g class="pulses"></g>';
  var gBranches = svg.querySelector('.branches');
  var gPulses = svg.querySelector('.pulses');
  var branches = [], pulses = [];
  kids.forEach(function () {
    var b = document.createElementNS(NS, 'path');
    b.setAttribute('class', 'branch'); b.setAttribute('pathLength', '1');
    gBranches.appendChild(b); branches.push(b);
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'pulse'); p.setAttribute('pathLength', '1');
    gPulses.appendChild(p); pulses.push(p);
  });

  function layout() {
    var t = tree.getBoundingClientRect();
    var r = rootNode.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + t.width + ' ' + t.height);
    var grad = svg.querySelector('#tree-grad');
    grad.setAttribute('y1', r.bottom - t.top);
    grad.setAttribute('y2', t.height);
    var boxes = kids.map(function (k) { return k.getBoundingClientRect(); });
    var stacked = boxes.length > 1 && Math.abs(boxes[0].top - boxes[1].top) > 4;
    var ry = r.bottom - t.top;

    boxes.forEach(function (b, i) {
      var d;
      if (!stacked) {
        // Curved branch from the root's bottom-centre to each child's top-centre.
        var x0 = r.left + r.width / 2 - t.left;
        var x1 = b.left + b.width / 2 - t.left;
        var y1 = b.top - t.top;
        var my = ry + (y1 - ry) * 0.55;
        d = 'M' + x0 + ',' + ry + ' C' + x0 + ',' + my + ' ' + x1 + ',' + my + ' ' + x1 + ',' + y1;
      } else {
        // Phones: a trunk down the left edge, rounding into each child.
        var tx = 14;
        var cy = b.top - t.top + 30;
        var kx = b.left - t.left;
        var rad = 14;
        d = 'M' + tx + ',' + ry + ' V' + (cy - rad) + ' Q' + tx + ',' + cy + ' ' + (tx + rad) + ',' + cy + ' H' + kx;
      }
      branches[i].setAttribute('d', d);
      pulses[i].setAttribute('d', d);
    });
  }

  layout();
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(tree);
  else window.addEventListener('resize', layout);

  // Draw the lines once the tree scrolls into view.
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    tree.classList.add('is-drawn');
  } else {
    var tio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        setTimeout(function () { tree.classList.add('is-drawn'); }, 250);
        tio.disconnect();
      }
    }, { threshold: 0.25 });
    tio.observe(tree);
  }

  // Hover: light up the branch(es) connected to the node.
  function hot(list, on) { list.forEach(function (b) { b.classList.toggle('is-hot', on); }); }
  rootNode.addEventListener('mouseenter', function () { hot(branches, true); });
  rootNode.addEventListener('mouseleave', function () { hot(branches, false); });
  kids.forEach(function (k, i) {
    k.addEventListener('mouseenter', function () { hot([branches[i]], true); });
    k.addEventListener('mouseleave', function () { hot([branches[i]], false); });
  });
})();
