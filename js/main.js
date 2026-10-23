(function () {
  'use strict';

  const Kent = window.Kent;
  const STORAGE_KEY = 'kent-sandwich-basket-v1';
  let cart = [];
  let storageAvailable = true;

  function createElement(tag, classes, text) {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  const main = document.querySelector('main');
  const icon = createElement('link');
  icon.rel = 'icon';
  icon.href = 'images/kent-logo.jpg';
  document.head.append(icon);
  const status = createElement('p', 'visually-hidden');
  status.id = 'basket-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  main.prepend(status);
  const storageNotice = createElement('p', 'form-message is-hidden');
  storageNotice.id = 'basket-storage-notice';
  main.prepend(storageNotice);

  function showStorageNotice() {
    storageNotice.classList.remove('is-hidden');
    storageNotice.textContent = 'Your basket works on this page. Browser storage is unavailable, so it may not carry over to another page.';
  }

  function readCart() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      try { return Kent.normaliseCart(JSON.parse(saved)); }
      catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
        return [];
      }
    } catch (error) {
      storageAvailable = false;
      showStorageNotice();
      return [];
    }
  }

  function announce(message) {
    status.textContent = '';
    window.requestAnimationFrame(function () { status.textContent = message; });
  }

  function getCart() {
    return cart.map(function (line) { return { id: line.id, quantity: line.quantity }; });
  }

  function notifyCartChanged() {
    document.dispatchEvent(new CustomEvent('kent:cart-change'));
  }

  function saveCart() {
    if (storageAvailable) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
      catch (error) { storageAvailable = false; showStorageNotice(); }
    }
    notifyCartChanged();
  }

  function setQuantity(id, quantity) {
    const item = Kent.getMenuItem(Kent.MENU, id);
    if (!item) return { ok: false, message: 'This sandwich is not on the menu.' };
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > Kent.MAX_QUANTITY) {
      return { ok: false, message: 'Choose a whole quantity from 1 to ' + Kent.MAX_QUANTITY + ' per sandwich.' };
    }
    const existing = cart.find(function (line) { return line.id === id; });
    if (quantity === 0) cart = cart.filter(function (line) { return line.id !== id; });
    else if (existing) existing.quantity = quantity;
    else cart.push({ id: id, quantity: quantity });
    saveCart();
    return { ok: true, message: quantity === 0 ? item.name + ' removed from your basket.' : item.name + ': ' + quantity + ' in your basket.' };
  }

  function addToCart(id, quantity) {
    const added = quantity === undefined ? 1 : quantity;
    if (!Number.isInteger(added) || added < 1) return { ok: false, message: 'Choose a whole quantity of at least 1.' };
    const existing = cart.find(function (line) { return line.id === id; });
    return setQuantity(id, (existing ? existing.quantity : 0) + added);
  }

  function removeFromCart(id) { return setQuantity(id, 0); }

  function clearCart() {
    cart = [];
    saveCart();
    return { ok: true, message: 'Your basket is now empty.' };
  }

  function onCartChange(callback) {
    document.addEventListener('kent:cart-change', callback);
  }

  Object.assign(Kent, {
    createElement: createElement, announce: announce, getCart: getCart, setQuantity: setQuantity,
    addToCart: addToCart, removeFromCart: removeFromCart, clearCart: clearCart, onCartChange: onCartChange
  });
  cart = readCart();

  // This shared basket link is added only on the three pages loading main.js.
  const navList = document.querySelector('#main-navbar ul');
  navList.querySelectorAll('a').forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('aria-current') === 'page');
  });
  const navItem = createElement('li', 'nav-item');
  const navLink = createElement('a', 'nav-link px-3 fw-semibold');
  navLink.id = 'shared-basket-link';
  navLink.href = 'order.html#order-cart';
  navItem.append(navLink);
  navList.append(navItem);

  const cartRegion = document.getElementById('order-cart');
  const cartList = document.getElementById('cart-items');
  let clearButton;
  if (cartRegion) {
    cartRegion.classList.remove('is-hidden');
    clearButton = createElement('button', 'btn btn-outline-dark rounded-0 mt-3', 'Clear basket');
    clearButton.type = 'button';
    clearButton.id = 'clear-basket';
    cartRegion.append(clearButton);
    clearButton.addEventListener('click', function () {
      clearCart();
      announce('Your basket is now empty. Add sandwiches to prepare a demo order.');
    });
  }

  function makeCartButton(action, item, label, accessibleName) {
    const button = createElement('button', 'btn btn-outline-dark rounded-0', label);
    button.type = 'button';
    button.dataset.cartAction = action;
    button.dataset.itemId = item.id;
    button.setAttribute('aria-label', accessibleName);
    return button;
  }

  function renderCart() {
    const summary = Kent.calculateCart(cart);
    navLink.textContent = 'Basket (' + summary.quantity + ')';
    navLink.setAttribute('aria-label', 'Basket, ' + summary.quantity + ' items, ' + Kent.formatMoney(summary.total));
    if (!cartList) return;
    const focused = document.activeElement;
    const focusInList = cartList.contains(focused);
    const focusedId = focusInList ? focused.dataset.itemId : '';
    const focusedAction = focusInList ? focused.dataset.cartAction : '';
    cartList.replaceChildren();
    summary.lines.forEach(function (line) {
      const row = createElement('li', 'border-bottom py-3');
      row.dataset.itemId = line.item.id;
      const heading = createElement('p', 'fw-bold mb-2', line.item.name + ' — ' + Kent.formatMoney(line.item.price) + ' each');
      const controls = createElement('div', 'd-flex flex-wrap align-items-center gap-2');
      const minus = makeCartButton('decrease', line.item, '−', 'Decrease ' + line.item.name + ' quantity');
      const plus = makeCartButton('increase', line.item, '+', 'Increase ' + line.item.name + ' quantity');
      plus.disabled = line.quantity >= Kent.MAX_QUANTITY;
      const quantity = createElement('span', 'px-2', String(line.quantity));
      quantity.setAttribute('aria-label', line.quantity + ' ' + line.item.name);
      const remove = makeCartButton('remove', line.item, 'Remove', 'Remove ' + line.item.name + ' from basket');
      const subtotal = createElement('strong', 'ms-sm-auto', Kent.formatMoney(line.subtotal));
      controls.append(minus, quantity, plus, remove, subtotal);
      row.append(heading, controls);
      cartList.append(row);
    });
    document.getElementById('cart-count').textContent = summary.quantity + (summary.quantity === 1 ? ' item' : ' items');
    document.getElementById('cart-total').textContent = Kent.formatMoney(summary.total);
    document.getElementById('cart-empty-state').classList.toggle('is-hidden', summary.quantity !== 0);
    clearButton.disabled = summary.quantity === 0;
    if (focusInList) {
      const buttons = Array.from(cartList.querySelectorAll('button'));
      const next = buttons.find(function (button) {
        return button.dataset.itemId === focusedId && button.dataset.cartAction === focusedAction && !button.disabled;
      }) || buttons.find(function (button) { return !button.disabled; });
      if (next) next.focus();
      else {
        const empty = document.getElementById('cart-empty-state');
        empty.tabIndex = -1;
        empty.focus();
      }
    }
  }

  if (cartList) cartList.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-cart-action]');
    if (!button || !cartList.contains(button)) return;
    const line = cart.find(function (entry) { return entry.id === button.dataset.itemId; });
    if (!line) return;
    const quantity = button.dataset.cartAction === 'increase' ? line.quantity + 1 :
      button.dataset.cartAction === 'decrease' ? line.quantity - 1 : 0;
    const result = setQuantity(line.id, quantity);
    announce(result.message);
  });
  onCartChange(renderCart);
  window.addEventListener('storage', function (event) {
    if (storageAvailable && (event.key === STORAGE_KEY || event.key === null)) {
      cart = readCart();
      notifyCartChanged();
      announce('Your basket was updated in another tab.');
    }
  });
  renderCart();
}());
