(function () {
  function setFullOffset(root) {
    if (!root.classList.contains('hero-slider--has-full')) return;
    // Document Y of the hero = combined height of everything above it
    // (announcement bar + header). Stable regardless of scroll position.
    var y = root.getBoundingClientRect().top + window.pageYOffset;
    if (y < 0 || y > window.innerHeight) y = 0; // only subtract when hero is at the top
    root.style.setProperty('--hs-header-offset', y + 'px');
  }

  function initSlider(root) {
    if (!root || root.dataset.hsInit === 'true') return;

    setFullOffset(root);

    if (typeof Swiper === 'undefined') return;

    var swiperEl = root.querySelector('.hero-slider__swiper');
    if (!swiperEl) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('.hero-slider__tab'));
    var bars = tabs.map(function (tab) {
      return tab.querySelector('.hero-slider__tab-progress');
    });

    var slideCount = swiperEl.querySelectorAll('.swiper-slide').length;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var autoplayEnabled = root.dataset.autoplay === 'true' && slideCount > 1 && !reduceMotion;
    var loopEnabled = root.dataset.loop === 'true' && slideCount > 1;
    var effect = root.dataset.effect === 'slide' || reduceMotion ? 'slide' : 'fade';
    var speed = parseInt(root.dataset.autoplaySpeed, 10) || 6000;
    var pauseOnHover = root.dataset.pauseHover === 'true';

    function resetBars() {
      bars.forEach(function (bar) {
        if (bar) bar.style.transform = 'scaleX(0)';
      });
    }

    function setActive(index) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      resetBars();
      // No autoplay = no time-left ticks, so show a static full bar on the active tab
      if (!autoplayEnabled && bars[index]) {
        bars[index].style.transform = 'scaleX(1)';
      }
    }

    var swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      loop: loopEnabled,
      speed: reduceMotion ? 0 : 600,
      effect: effect,
      fadeEffect: { crossFade: true },
      allowTouchMove: slideCount > 1,
      a11y: { enabled: true },
      autoplay: autoplayEnabled
        ? { delay: speed, disableOnInteraction: false, pauseOnMouseEnter: pauseOnHover }
        : false,
      on: {
        init: function () {
          setActive(this.realIndex || 0);
        },
        slideChangeTransitionStart: function () {
          setActive(this.realIndex);
        },
        autoplayTimeLeft: function (s, time, progress) {
          var bar = bars[s.realIndex];
          if (bar) bar.style.transform = 'scaleX(' + (1 - progress) + ')';
        }
      }
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (loopEnabled) {
          swiper.slideToLoop(i);
        } else {
          swiper.slideTo(i);
        }
        if (autoplayEnabled && swiper.autoplay) swiper.autoplay.start();
      });
    });

    // Theme editor: jump to the selected slide and hold autoplay while editing
    root.addEventListener('shopify:block:select', function (e) {
      var id = e.detail.blockId;
      var idx = tabs.map(function (t) { return t.dataset.blockId; }).indexOf(id);
      if (idx > -1) {
        loopEnabled ? swiper.slideToLoop(idx) : swiper.slideTo(idx);
      }
      if (swiper.autoplay) swiper.autoplay.stop();
    });

    root.addEventListener('shopify:block:deselect', function () {
      if (autoplayEnabled && swiper.autoplay) swiper.autoplay.start();
    });

    root.__swiper = swiper;
    root.dataset.hsInit = 'true';
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.hero-slider').forEach(initSlider);
  }

  function updateOffsets() {
    document.querySelectorAll('.hero-slider--has-full').forEach(setFullOffset);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  }

  window.addEventListener('load', updateOffsets);

  var rafId;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateOffsets);
  });

  document.addEventListener('shopify:section:load', function (e) {
    initAll(e.target);
  });

  document.addEventListener('shopify:section:unload', function (e) {
    var root = e.target.querySelector('.hero-slider');
    if (root && root.__swiper) {
      root.__swiper.destroy(true, true);
      root.__swiper = null;
      root.dataset.hsInit = 'false';
    }
  });
})();