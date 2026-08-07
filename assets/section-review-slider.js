(function () {
  function init(root) {
    var el = root.querySelector('.rev__viewport');
    if (!el || el.dataset.revInit === 'true') return;
    el.dataset.revInit = 'true';

    if (typeof Swiper === 'undefined') {
      el.classList.add('rev__viewport--fallback');
      return;
    }

    var prev = root.querySelector('.rev__nav--prev');
    var next = root.querySelector('.rev__nav--next');

    var swiper = new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: el.querySelectorAll('.swiper-slide').length > 1,
      grabCursor: true,
      autoHeight: false,
      a11y: { enabled: true },
      keyboard: { enabled: true, onlyInViewport: true },
      observer: true,
      observeParents: true
    });

    if (prev) prev.addEventListener('click', function () { swiper.slidePrev(); });
    if (next) next.addEventListener('click', function () { swiper.slideNext(); });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.rev').forEach(init);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();