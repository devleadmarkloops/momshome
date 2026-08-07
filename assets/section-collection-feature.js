(function () {
  function initSlider(root) {
    var el = root.querySelector('.cf__cards');
    if (!el || el.dataset.cfInit === 'true') return;
    el.dataset.cfInit = 'true';

    if (typeof Swiper === 'undefined') {
      el.classList.add('cf__cards--fallback');
      return;
    }

    var spvD = parseFloat(el.dataset.spvD) || 3;
    var spvM = parseFloat(el.dataset.spvM) || 1.5;
    var prev = root.querySelector('.cf__nav--prev');
    var next = root.querySelector('.cf__nav--next');

    var swiper = new Swiper(el, {
      slidesPerView: spvM,
      spaceBetween: 10,
      grabCursor: true,
      watchOverflow: true,
      resistanceRatio: 0.85,
      a11y: { enabled: true },
      keyboard: { enabled: true, onlyInViewport: true },
      observer: true,
      observeParents: true,
      breakpoints: {
        990: { slidesPerView: spvD, spaceBetween: 14 }
      }
    });

    function updateNav() {
      if (!prev || !next) return;
      var locked = swiper.isLocked;
      prev.disabled = locked || swiper.isBeginning;
      next.disabled = locked || swiper.isEnd;
    }

    if (prev) prev.addEventListener('click', function () { swiper.slidePrev(); });
    if (next) next.addEventListener('click', function () { swiper.slideNext(); });

    swiper.on('slideChange', updateNav);
    swiper.on('reachBeginning', updateNav);
    swiper.on('reachEnd', updateNav);
    swiper.on('resize', updateNav);
    swiper.on('lock', updateNav);
    swiper.on('unlock', updateNav);
    updateNav();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.cf').forEach(initSlider);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();