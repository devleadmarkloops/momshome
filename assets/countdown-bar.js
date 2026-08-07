class CountdownBar extends HTMLElement {
  connectedCallback() {
    this.digits = {
      days: this.querySelector('[data-days]'),
      hours: this.querySelector('[data-hours]'),
      minutes: this.querySelector('[data-minutes]'),
      seconds: this.querySelector('[data-seconds]'),
    };
    this.inner = this.querySelector('.countdown-bar__inner');
    this.expiredMessage = this.querySelector('[data-expired-message]');
    this.showDays = this.dataset.showDays === 'true';
    this.endTime = this.resolveEndTime();

    if (!this.endTime) {
      this.handleExpired();
      return;
    }

    this.hidden = false;
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);

    // Background tabs throttle timers — resync as soon as the tab is visible again.
    this.onVisibilityChange = () => {
      if (!document.hidden) this.tick();
    };
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  disconnectedCallback() {
    clearInterval(this.interval);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  resolveEndTime() {
    const now = Date.now();

    switch (this.dataset.mode) {
      case 'fixed': {
        const raw = (this.dataset.end || '').trim();
        if (!raw) return null;
        // Accepts "YYYY-MM-DD HH:MM" and "YYYY-MM-DDTHH:MM" — parsed in the visitor's local time.
        const parsed = new Date(raw.replace(' ', 'T')).getTime();
        if (Number.isNaN(parsed) || parsed <= now) return null;
        return parsed;
      }

      case 'daily': {
        const resetHour = Math.min(23, Math.max(0, parseInt(this.dataset.resetHour, 10) || 0));
        const target = new Date();
        target.setHours(resetHour, 0, 0, 0);
        if (target.getTime() <= now) target.setDate(target.getDate() + 1);
        return target.getTime();
      }

      case 'evergreen':
      default: {
        const durationMs = (parseFloat(this.dataset.duration) || 24) * 3600000;
        const key = this.dataset.storageKey;
        let stored = null;

        try {
          stored = parseInt(localStorage.getItem(key), 10);
        } catch (error) {
          stored = null;
        }

        if (stored && stored > now) return stored;

        const end = now + durationMs;
        try {
          localStorage.setItem(key, String(end));
        } catch (error) {
          // Private browsing / storage disabled — timer simply restarts on next load.
        }
        return end;
      }
    }
  }

  tick() {
    let remaining = Math.floor((this.endTime - Date.now()) / 1000);

    if (remaining <= 0) {
      clearInterval(this.interval);
      this.handleExpired();
      return;
    }

    const days = Math.floor(remaining / 86400);
    remaining -= days * 86400;
    const hours = Math.floor(remaining / 3600);
    remaining -= hours * 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining - minutes * 60;

    if (this.showDays && this.digits.days) {
      this.setDigits(this.digits.days, days);
      this.setDigits(this.digits.hours, hours);
    } else {
      // No days column — roll the remaining days into the hours figure.
      this.setDigits(this.digits.hours, days * 24 + hours);
    }

    this.setDigits(this.digits.minutes, minutes);
    this.setDigits(this.digits.seconds, seconds);
  }

  setDigits(node, value) {
    if (!node) return;
    const next = String(value).padStart(2, '0');
    if (node.textContent !== next) node.textContent = next;
  }

  handleExpired() {
    if (this.dataset.expiredAction === 'message' && this.expiredMessage) {
      if (this.inner) this.inner.hidden = true;
      this.expiredMessage.hidden = false;
      this.hidden = false;
      return;
    }

    this.hidden = true;
  }
}

if (!customElements.get('countdown-bar')) {
  customElements.define('countdown-bar', CountdownBar);
}
