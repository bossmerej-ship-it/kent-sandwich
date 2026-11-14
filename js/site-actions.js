(function () {
  'use strict';

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
