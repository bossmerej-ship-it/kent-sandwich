(function () {
  'use strict';

  const Kent = window.Kent;
  const STORAGE_KEY = 'kent-sandwich-basket-v1';
  const listeners = new Set();
  let storageAvailable = true;
  let cart = readCart();

  function readCart() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      try {
        return Kent.normaliseCart(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return [];
      }
    } catch {
      storageAvailable = false;
      return [];
    }
  }

  function notifyCartChanged(source) {
    listeners.forEach(function (listener) { listener(source); });
  }

  function getCart() {
    return cart.map(function (line) { return { id: line.id, quantity: line.quantity }; });
  }

  // Only product IDs and quantities go into storage. Both interfaces use this same basket.
  function replaceCart(lines) {
    cart = Kent.normaliseCart(lines);
    if (storageAvailable) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {
        storageAvailable = false;
      }
    }
    notifyCartChanged('page');
  }

  function setQuantity(id, quantity) {
    const item = Kent.getMenuItem(Kent.MENU, id);
    if (!item) return { ok: false, message: 'This sandwich is not on the menu.' };
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > Kent.MAX_QUANTITY) {
      return { ok: false, message: 'Choose a whole quantity from 1 to ' + Kent.MAX_QUANTITY + ' per sandwich.' };
    }
    const lines = getCart();
    const index = lines.findIndex(function (line) { return line.id === id; });
    if (quantity === 0) {
      if (index !== -1) lines.splice(index, 1);
    } else if (index !== -1) {
      lines[index].quantity = quantity;
    } else {
      lines.push({ id: id, quantity: quantity });
    }
    replaceCart(lines);
    return { ok: true, message: quantity === 0
      ? item.name + ' removed from your basket.'
      : item.name + ': ' + quantity + ' in your basket.' };
  }

  function addToCart(id, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, message: 'Choose a whole quantity of at least 1.' };
    }
    const existing = cart.find(function (line) { return line.id === id; });
    return setQuantity(id, (existing ? existing.quantity : 0) + quantity);
  }

  function clearCart() { replaceCart([]); }
  function removeFromCart(id) { return setQuantity(id, 0); }
  function onCartChange(listener) { listeners.add(listener); }
  function isCartStorageAvailable() { return storageAvailable; }

  window.addEventListener('storage', function (event) {
    if (!storageAvailable || (event.key !== STORAGE_KEY && event.key !== null)) return;
    if (event.storageArea !== window.localStorage) return;
    cart = readCart();
    notifyCartChanged('storage');
  });

  Object.assign(Kent, {
    getCart, replaceCart, setQuantity, addToCart, removeFromCart, clearCart,
    onCartChange, isCartStorageAvailable
  });
})();
