(function () {
  function init(root) {
    var frame = root.querySelector('.ba__frame');
    if (!frame || frame.dataset.baInit === 'true') return;
    frame.dataset.baInit = 'true';

    var handle = frame.querySelector('.ba__handle');
    var dragging = false;

    // Left look occupies p% of the frame, right look occupies (100 - p)%.
    // A side's button shows only while that side owns 51%+ of the width,
    // and hides once it drops to 49% or less. At an exact 50/50 both stay.
    function syncButtons(p) {
      frame.classList.toggle('ba--hide-left-btn', p <= 49);
      frame.classList.toggle('ba--hide-right-btn', p >= 51);
    }

    function setPos(p) {
      p = Math.max(0, Math.min(100, p));
      frame.style.setProperty('--ba-pos', p + '%');
      if (handle) handle.setAttribute('aria-valuenow', Math.round(p));
      syncButtons(p);
    }

    function current() {
      return parseFloat(frame.style.getPropertyValue('--ba-pos')) || 50;
    }

    function posFromEvent(e) {
      var r = frame.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    frame.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.ba__look')) return; // let buttons receive the click
      dragging = true;
      try { frame.setPointerCapture(e.pointerId); } catch (err) {}
      setPos(posFromEvent(e));
      e.preventDefault();
    });

    frame.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setPos(posFromEvent(e));
    });

    function stop() { dragging = false; }
    frame.addEventListener('pointerup', stop);
    frame.addEventListener('pointercancel', stop);

    syncButtons(current());

    if (handle) {
      handle.addEventListener('keydown', function (e) {
        var cur = current();
        if (e.key === 'ArrowLeft') { setPos(cur - 2); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { setPos(cur + 2); e.preventDefault(); }
        else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
        else if (e.key === 'End') { setPos(100); e.preventDefault(); }
      });
    }
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.ba').forEach(init);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();
