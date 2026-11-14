(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', prepareMobileNavigation);

  function prepareMobileNavigation() {
    const header = document.querySelector('.site-header');
    const menu = document.getElementById('main-navbar');
    const toggle = header.querySelector('.navbar-toggler');
    const skipLink = document.querySelector('a[href="#main-content"]');
    const backToTop = document.querySelector('.site-actions a[href="#page-top"]');
    const compact = window.matchMedia('(max-width: 991.98px)');
    const root = document.documentElement;

    function closeMenu(restoreFocus) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (menu.classList.contains('collapsing')) {
        menu.addEventListener('shown.bs.collapse', function () {
          closeMenu(restoreFocus);
        }, { once: true });
        return;
      }
      window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    function setScrollOffset() {
      // Only the fixed-height bar needs to stay above an anchor target.
      root.style.scrollPaddingTop = compact.matches
        ? header.offsetHeight - menu.offsetHeight + 8 + 'px'
        : '';
    }

    function updateHeader() {
      header.classList.toggle('sticky-top', compact.matches);
      header.classList.toggle('bg-body', compact.matches);
      skipLink.classList.toggle('fixed-top', compact.matches);
      skipLink.classList.toggle('position-absolute', !compact.matches);
      skipLink.classList.toggle('z-3', !compact.matches);
      menu.style.maxHeight = compact.matches ? 'calc(100dvh - 5rem)' : '';
      for (const link of menu.querySelectorAll('.nav-link')) {
        link.classList.toggle('lh-lg', compact.matches);
        link.classList.toggle('py-2', compact.matches);
      }
      if (!compact.matches) closeMenu(false);
      setScrollOffset();
    }

    header.classList.replace('py-3', 'py-2');
    header.classList.add('py-lg-3');
    toggle.classList.add('rounded-0', 'border-dark', 'p-2');
    toggle.setAttribute('aria-label', 'Open menu');

    menu.addEventListener('show.bs.collapse', function () {
      toggle.setAttribute('aria-label', 'Close menu');
      toggle.classList.add('bg-body-tertiary');
    });
    menu.addEventListener('shown.bs.collapse', function () {
      menu.classList.add('overflow-auto');
    });
    menu.addEventListener('hide.bs.collapse', function () {
      toggle.setAttribute('aria-label', 'Open menu');
      toggle.classList.remove('bg-body-tertiary');
      menu.classList.remove('overflow-auto');
    });
    document.addEventListener('keydown', function (event) {
      if (compact.matches && event.key === 'Escape' && header.contains(document.activeElement)) closeMenu(true);
    });
    document.addEventListener('click', function (event) {
      if (compact.matches && !header.contains(event.target)) closeMenu(menu.contains(document.activeElement));
    });
    menu.addEventListener('click', function (event) {
      if (compact.matches && event.target.closest('a[href]')) closeMenu(false);
    });
    backToTop.addEventListener('click', function (event) {
      if (!compact.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      closeMenu(false);
      window.scrollTo(0, 0);
      header.focus({ preventScroll: true });
    });
    compact.addEventListener('change', updateHeader);
    window.addEventListener('resize', setScrollOffset);
    updateHeader();
  }

  const Kent = window.Kent;
  const basketLink = document.getElementById('shared-basket-link');
  const badge = document.getElementById('basket-badge');
  if (!Kent || !basketLink || !badge) return;

  function updateBasketBadge() {
    const { quantity } = Kent.calculateCart(Kent.getCart());
    badge.textContent = quantity;
    badge.hidden = quantity === 0;
    const unit = quantity === 1 ? ' item' : ' items';
    basketLink.setAttribute('aria-label', quantity ? 'Basket, ' + quantity + unit : 'Basket');
  }

  Kent.onCartChange(updateBasketBadge);
  updateBasketBadge();
})();
