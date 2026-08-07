if (!customElements.get('load-more-products')) {
  class LoadMoreProducts {
    static init() {
      document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-load-more-button]');
        if (!button || button.hasAttribute('disabled')) return;
        e.preventDefault();

        const url = button.dataset.nextUrl;
        const gridId = button.dataset.gridId;
        const grid = document.getElementById(gridId);
        const sectionId = button.closest('[data-load-more-id]').dataset.loadMoreId;
        if (!url || !grid) return;

        button.setAttribute('disabled', 'disabled');
        button.classList.add('loading');

        const separator = url.includes('?') ? '&' : '?';
        const fetchUrl = `${url}${separator}section_id=${sectionId}`;

        fetch(fetchUrl)
          .then((res) => res.text())
          .then((text) => {
            const html = new DOMParser().parseFromString(text, 'text/html');
            const newUl = html.querySelector('ul#product-grid');
            const currentUl = grid.tagName === 'UL' ? grid : grid.querySelector('ul#product-grid');

            if (newUl && currentUl) {
              Array.from(newUl.children).forEach((child) => currentUl.appendChild(child));
            }

            const newButton = html.querySelector('[data-load-more-button]');

            if (newButton && newButton.dataset.nextUrl) {
              button.dataset.nextUrl = newButton.dataset.nextUrl;
              button.removeAttribute('disabled');
              button.classList.remove('loading');
            } else {
              button.closest('.load-more-wrapper').remove();
            }
          })
          .catch((err) => {
            console.error('Load more error:', err);
            button.removeAttribute('disabled');
            button.classList.remove('loading');
          });
      });
    }
  }
  LoadMoreProducts.init();
}