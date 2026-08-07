(function () {
  var mq = window.matchMedia('(max-width: 749px)');

  function initFooter(root) {
    if (root.dataset.bpfInit === 'true') return;
    root.dataset.bpfInit = 'true';

    var cols = Array.prototype.slice.call(root.querySelectorAll('.bpf__col--accordion'));

    function closeCol(col) {
      col.classList.remove('is-open');
      var h = col.querySelector('.bpf__col-head');
      if (h) h.setAttribute('aria-expanded', 'false');
    }

    cols.forEach(function (col) {
      var head = col.querySelector('.bpf__col-head');
      if (!head) return;

      head.addEventListener('click', function () {
        if (!mq.matches) return; // accordion only on mobile

        var wasOpen = col.classList.contains('is-open');

        // Close all other accordions — only one open at a time
        cols.forEach(function (other) {
          if (other !== col) closeCol(other);
        });

        if (wasOpen) {
          closeCol(col);
        } else {
          col.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });

    function sync() {
      cols.forEach(function (col) {
        var head = col.querySelector('.bpf__col-head');
        if (!head) return;
        if (mq.matches) {
          head.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false');
        } else {
          // desktop: panels are always visible
          head.setAttribute('aria-expanded', 'true');
        }
      });
    }

    if (mq.addEventListener) {
      mq.addEventListener('change', sync);
    } else if (mq.addListener) {
      mq.addListener(sync);
    }
    sync();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.bpf').forEach(initFooter);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) {
    e.target.querySelectorAll('.bpf').forEach(function (f) { f.dataset.bpfInit = 'false'; });
    initAll(e.target);
  });
})();