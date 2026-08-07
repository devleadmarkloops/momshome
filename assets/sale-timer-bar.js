class SaleTimerBar extends HTMLElement {
  connectedCallback() {
    // Re-render from the section markup Dawn already fetched on variant change,
    // so the discount figure follows the selected variant.
    this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      const source = event?.data?.html?.getElementById(this.id);
      if (!source) return;
      if (source.innerHTML.trim() === this.innerHTML.trim()) return;
      this.innerHTML = source.innerHTML;
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
  }
}

if (!customElements.get('sale-timer-bar')) {
  customElements.define('sale-timer-bar', SaleTimerBar);
}
