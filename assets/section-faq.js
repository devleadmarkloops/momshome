(function () {
  function setItemState(item, open) {
    item.classList.toggle('is-open', open);
    var btn = item.querySelector('.faq__q-btn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function initSection(root) {
    if (root.dataset.faqInit === 'true') return;
    root.dataset.faqInit = 'true';

    var single = root.getAttribute('data-single') === 'true';
    var items = Array.prototype.slice.call(root.querySelectorAll('.faq__item'));

    // In single-open mode, keep only the first "open by default" item open on load
    if (single) {
      var foundOpen = false;
      items.forEach(function (it) {
        if (it.classList.contains('is-open')) {
          if (foundOpen) {
            setItemState(it, false);
          } else {
            foundOpen = true;
          }
        }
      });
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.faq__q-btn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        if (single) {
          items.forEach(function (it) {
            if (it !== item) setItemState(it, false);
          });
        }

        setItemState(item, !isOpen);
      });
    });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.faq').forEach(initSection);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) {
    e.target.querySelectorAll('.faq').forEach(function (f) { f.dataset.faqInit = 'false'; });
    initAll(e.target);
  });

  // Theme editor: open a question when its block is selected
  document.addEventListener('shopify:block:select', function (e) {
    var item = e.target;
    if (!item.classList || !item.classList.contains('faq__item')) return;

    var root = item.closest('.faq');
    if (root && root.getAttribute('data-single') === 'true') {
      root.querySelectorAll('.faq__item.is-open').forEach(function (it) {
        if (it !== item) setItemState(it, false);
      });
    }

    setItemState(item, true);
  });
})();
