(function () {
  function initSection(root) {
    if (root.dataset.vtInit === 'true') return;
    root.dataset.vtInit = 'true';

    var items = Array.prototype.slice.call(root.querySelectorAll('.vt__item'));
    if (!items.length) return;

    var prev = root.querySelector('.vt__nav--prev');
    var next = root.querySelector('.vt__nav--next');
    var activeIndex = 0;

    function wireVideos(item) {
      item.querySelectorAll('.vt__video').forEach(function (cell) {
        if (cell.dataset.vwired === 'true') return;
        cell.dataset.vwired = 'true';

        var video = cell.querySelector('video');
        var mute = cell.querySelector('[data-mute]');
        var pp = cell.querySelector('[data-playpause]');
        var playBtn = cell.querySelector('[data-play]');

        if (video) {
          video.addEventListener('play', function () { cell.classList.add('is-playing', 'is-started'); });
          video.addEventListener('pause', function () { cell.classList.remove('is-playing'); });
        }
        if (mute && video) {
          mute.addEventListener('click', function (e) {
            e.stopPropagation();
            video.muted = !video.muted;
            cell.classList.toggle('is-muted', video.muted);
          });
        }
        if (pp && video) {
          pp.addEventListener('click', function (e) {
            e.stopPropagation();
            if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
            else { video.pause(); }
          });
        }
        if (playBtn && video) {
          playBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            cell.classList.add('is-started');
            var p = video.play(); if (p && p.catch) p.catch(function () {});
          });
        }
      });
    }

    function resetVideos(item) {
      item.querySelectorAll('.vt__video').forEach(function (cell) {
        var video = cell.querySelector('video');
        if (video) { try { video.pause(); video.currentTime = 0; } catch (e) {} }
        cell.classList.remove('is-playing', 'is-started');
      });
    }

    function playActive(item) {
      item.querySelectorAll('.vt__video').forEach(function (cell) {
        var video = cell.querySelector('video');
        if (cell.dataset.autoplay === 'true' && video) {
          video.muted = true;
          cell.classList.add('is-muted', 'is-started');
          var p = video.play(); if (p && p.catch) p.catch(function () {});
        } else {
          cell.classList.remove('is-started');
        }
      });
    }

    function activate(i) {
      if (i < 0) i = items.length - 1;
      if (i >= items.length) i = 0;

      items.forEach(function (it, idx) {
        var on = idx === i;
        it.classList.toggle('is-active', on);
        var head = it.querySelector('.vt__item-head');
        if (head) head.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (!on) resetVideos(it);
      });

      activeIndex = i;
      var active = items[i];
      wireVideos(active);
      playActive(active);
    }

    items.forEach(function (it, idx) {
      var head = it.querySelector('.vt__item-head');
      if (head) head.addEventListener('click', function () { activate(idx); });
    });
    if (prev) prev.addEventListener('click', function () { activate(activeIndex - 1); });
    if (next) next.addEventListener('click', function () { activate(activeIndex + 1); });

    activate(0);
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('.vt').forEach(initSection);
  }

  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();