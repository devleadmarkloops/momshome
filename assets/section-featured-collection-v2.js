(function () {
  function initFtc(root) {
    if (!root || root.dataset.ftcInit === 'true') return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('.ftc__tab'));

    if (tabs.length) {
      var panels = tabs.map(function (tab) {
        return root.querySelector('#' + tab.getAttribute('aria-controls'));
      });

      function activate(index, focusTab, animateIn) {
        tabs.forEach(function (tab, i) {
          var on = i === index;
          tab.classList.toggle('is-active', on);
          tab.setAttribute('aria-selected', on ? 'true' : 'false');
          tab.tabIndex = on ? 0 : -1;
        });

        panels.forEach(function (panel, i) {
          if (!panel) return;
          var on = i === index;
          if (on) {
            panel.hidden = false;
            panel.classList.add('is-active');
            if (animateIn) {
              // Replay the entrance animation
              panel.classList.remove('ftc__panel--in');
              void panel.offsetWidth; // force reflow
              panel.classList.add('ftc__panel--in');
            }
          } else {
            panel.hidden = true;
            panel.classList.remove('is-active', 'ftc__panel--in');
          }
        });

        if (focusTab && tabs[index]) tabs[index].focus();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          activate(i, false, true);
        });

        tab.addEventListener('keydown', function (e) {
          if (e.key === 'Home') {
            e.preventDefault();
            activate(0, true, true);
            return;
          }
          if (e.key === 'End') {
            e.preventDefault();
            activate(tabs.length - 1, true, true);
            return;
          }
          var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          var next = (i + dir + tabs.length) % tabs.length;
          activate(next, true, true);
        });
      });

      // Theme editor: surface the tab whose block is being edited
      root.addEventListener('shopify:block:select', function (e) {
        var idx = tabs
          .map(function (t) { return t.dataset.blockId; })
          .indexOf(e.detail.blockId);
        if (idx > -1) activate(idx, false, true);
      });

      // Sync state on init without animating (server marks the first tab active)
      var current = tabs.findIndex(function (t) {
        return t.classList.contains('is-active');
      });
      activate(current > -1 ? current : 0, false, false);
    }

    root.dataset.ftcInit = 'true';
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.ftc').forEach(initFtc);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  }

  document.addEventListener('shopify:section:load', function (e) {
    initAll(e.target);
  });

  document.addEventListener('shopify:section:unload', function (e) {
    var root = e.target.querySelector('.ftc');
    if (root) root.dataset.ftcInit = 'false';
  });
})();