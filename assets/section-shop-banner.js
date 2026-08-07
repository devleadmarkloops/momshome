(function () {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function initSection(root) {
    if (root.dataset.sbInit === 'true') return;
    root.dataset.sbInit = 'true';

    var el = root.querySelector('.sb__swiper');
    var prev = root.querySelector('.sb__nav--prev');
    var next = root.querySelector('.sb__nav--next');
    var curEl = root.querySelector('.sb__count-cur');
    var totalEl = root.querySelector('.sb__count-total');
    var scroll = root.querySelector('.sb__scroll');

    function closeTips() {
      root.querySelectorAll('.sb__dot.is-open').forEach(function (d) { d.classList.remove('is-open'); });
    }

    var mqMobile = window.matchMedia('(max-width: 989px)');

    function openFirstDot() {
      if (!mqMobile.matches) return;
      var active = root.querySelector('.swiper-slide-active') || root.querySelector('.sb__slide');
      if (!active) return;
      var dot = active.querySelector('.sb__dot');
      if (dot) dot.classList.add('is-open');
    }

    /* tap-to-open dots (mobile) + outside click closes */
    root.addEventListener('click', function (e) {
      if (e.target.closest('.sb__tip')) return;        // let product link work
      if (e.target.closest('.sb__scroll')) return;      // handled below
      var btn = e.target.closest('.sb__dot-btn');
      if (btn) {
        var dot = btn.closest('.sb__dot');
        var open = dot.classList.contains('is-open');
        closeTips();
        if (!open) dot.classList.add('is-open');
        return;
      }
      closeTips();
    });

    /* smooth scroll to the next section */
    if (scroll) {
      scroll.addEventListener('click', function () {
        var section = root.closest('.shopify-section');
        var target = section && section.nextElementSibling;
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }
      });
    }

    if (!el) return;

    var total = parseInt(el.dataset.total, 10) || (root.querySelectorAll('.sb__slide').length);
    if (totalEl) totalEl.textContent = pad(total);

    if (typeof Swiper === 'undefined') {
      // no slider library: still show first slide, wire nothing else
      if (curEl) curEl.textContent = pad(1);
      openFirstDot();
      return;
    }

    var swiper = new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: el.dataset.loop === 'true' && total > 1,
      grabCursor: true,
      a11y: { enabled: true },
      keyboard: { enabled: true, onlyInViewport: true },
      observer: true,
      observeParents: true
    });

    function update() {
      var cur = (typeof swiper.realIndex === 'number' ? swiper.realIndex : 0) + 1;
      if (curEl) curEl.textContent = pad(cur);
    }

    if (prev) prev.addEventListener('click', function () { swiper.slidePrev(); });
    if (next) next.addEventListener('click', function () { swiper.slideNext(); });

    swiper.on('slideChange', function () { update(); closeTips(); openFirstDot(); });
    update();
    openFirstDot();
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.sb').forEach(initSection);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();