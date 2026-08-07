(function () {
  function initCard(card) {
    if (card.dataset.pcInit === 'true') return;
    card.dataset.pcInit = 'true';

    var swatches = Array.prototype.slice.call(card.querySelectorAll('.pcard__swatch'));

    // No colour swatches → keep the quick box reachable on touch (nothing to tap).
    if (swatches.length === 0) card.classList.add('is-open');

    var dataEl = card.querySelector('.pcard__data');
    if (!dataEl) return;

    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }

    var variants = data.variants || [];
    var hasColor = !!data.hasColor;
    var hasSize = !!data.hasSize;

    var img = card.querySelector('.pcard__image');
    var idInput = card.querySelector('.pcard__variant-id');
    var addBtn = card.querySelector('.pcard__add');
    var sizes = Array.prototype.slice.call(card.querySelectorAll('.pcard__size'));

    var state = { color: data.selectedColor || null, size: data.selectedSize || null };

    function findVariant(color, size) {
      return variants.find(function (v) {
        return (!hasColor || v.color === color) && (!hasSize || v.size === size);
      });
    }

    function firstAvailableSize(color) {
      var v = variants.find(function (v) {
        return (!hasColor || v.color === color) && v.available;
      });
      if (v) return v.size;
      var any = variants.find(function (v) {
        return !hasColor || v.color === color;
      });
      return any ? any.size : null;
    }

    function updateSwatches() {
      swatches.forEach(function (btn) {
        var on = btn.dataset.color === state.color;
        btn.classList.toggle('is-selected', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function updateSizes() {
      sizes.forEach(function (btn) {
        var size = btn.dataset.size;
        var v = findVariant(state.color, size);
        var avail = !!(v && v.available);
        btn.disabled = !avail;
        btn.classList.toggle('is-unavailable', !avail);
        var selected = avail && size === state.size;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    }

    function updateForm() {
      var v = findVariant(state.color, state.size);
      if (v && idInput) idInput.value = v.id;
      if (!addBtn) return;
      var soldOut = !v || !v.available;
      addBtn.disabled = soldOut;
      addBtn.classList.toggle('is-sold-out', soldOut);
      var label = addBtn.querySelector('.pcard__add-label');
      if (label) label.textContent = soldOut ? addBtn.dataset.soldOut : addBtn.dataset.add;
    }

    function swapImage(btn) {
      if (!img) return;
      if (btn.dataset.src) img.src = btn.dataset.src;
      if (btn.dataset.srcset) img.srcset = btn.dataset.srcset;
    }

    swatches.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Selecting a colour reveals the quick box on touch devices.
        card.classList.add('is-open');
        state.color = btn.dataset.color;
        var v = findVariant(state.color, state.size);
        if (hasSize && (!v || !v.available)) {
          state.size = firstAvailableSize(state.color);
        }
        swapImage(btn);
        updateSwatches();
        updateSizes();
        updateForm();
      });
    });

    sizes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        state.size = btn.dataset.size;
        updateSizes();
        updateForm();
      });
    });

    if (hasSize) {
      var initial = findVariant(state.color, state.size);
      if (!initial || !initial.available) state.size = firstAvailableSize(state.color);
    }

    updateSwatches();
    updateSizes();
    updateForm();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.pcard').forEach(initCard);
  }

initAll(document);

  if (!window.__pcardV2Bound) {
    window.__pcardV2Bound = true;

    document.addEventListener('shopify:section:load', function (e) {
      initAll(e.target);
    });

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('pcard')) {
            initCard(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('.pcard').forEach(initCard);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
})();