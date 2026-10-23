(function () {
  'use strict';

  const Kent = window.Kent || {};
  const MAX_QUANTITY = 10;
  const MENU = Object.freeze([
    { id: 'mini', name: 'Mini sandwich', price: 390, description: 'The smallest sandwich on the menu.', profile: 'Compact' },
    { id: 'chicken', name: 'Chicken', price: 640, description: 'Hot sandwich with chicken.', profile: 'Classic' },
    { id: 'classic', name: 'Classic', price: 640, description: 'The classic Kent Sandwich option.', profile: 'Classic' },
    { id: 'cheese', name: 'Cheese', price: 640, description: 'Hot sandwich with cheese.', profile: 'Rich' },
    { id: 'cutlet', name: 'Cutlet', price: 690, description: 'Hot sandwich with a cutlet.', profile: 'Filling' },
    { id: 'spicy-cutlet', name: 'Spicy cutlet', price: 740, description: 'Cutlet sandwich with a spicy taste.', profile: 'Hot' },
    { id: 'hot-dog', name: 'Hot dog', price: 640, description: 'Kent Sandwich hot dog.', profile: 'Classic' },
    { id: 'spicy', name: 'Spicy', price: 690, description: 'A spicy hot sandwich.', profile: 'Hot' }
  ].map(function (item) { return Object.freeze(item); }));

  function getMenuItem(items, id) {
    return items.find(function (item) { return item.id === id; });
  }

  function matchesFilters(item, query, profile, maxPrice) {
    const search = String(query || '').trim().toLowerCase();
    const limit = maxPrice === '' || maxPrice === undefined ? Infinity : Number(maxPrice);
    const text = (item.name + ' ' + item.description).toLowerCase();
    return (search === '' || text.includes(search)) &&
      (!profile || profile === 'all' || item.profile === profile) && item.price <= limit;
  }

  function filterMenu(items, query, profile, maxPrice) {
    return items.filter(function (item) { return matchesFilters(item, query, profile, maxPrice); });
  }

  // Stored baskets contain product IDs and quantities only, never contact details.
  function normaliseCart(value) {
    const result = [];
    if (!Array.isArray(value)) return result;
    value.forEach(function (line) {
      if (!line || !getMenuItem(MENU, line.id) || !Number.isInteger(line.quantity) || line.quantity < 1) return;
      const existing = result.find(function (entry) { return entry.id === line.id; });
      if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + line.quantity);
      else result.push({ id: line.id, quantity: Math.min(MAX_QUANTITY, line.quantity) });
    });
    return result;
  }

  function calculateLineTotal(item, quantity) {
    return item.price * quantity;
  }

  function calculateCart(cart) {
    const lines = normaliseCart(cart).map(function (entry) {
      const item = getMenuItem(MENU, entry.id);
      return { item: item, quantity: entry.quantity, subtotal: calculateLineTotal(item, entry.quantity) };
    });
    const totals = lines.reduce(function (result, line) {
      result.quantity += line.quantity;
      result.total += line.subtotal;
      return result;
    }, { quantity: 0, total: 0 });
    return { lines: lines, quantity: totals.quantity, total: totals.total };
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) + ' ₸';
  }

  Object.assign(Kent, {
    MENU: MENU, MAX_QUANTITY: MAX_QUANTITY, getMenuItem: getMenuItem,
    matchesFilters: matchesFilters, filterMenu: filterMenu, normaliseCart: normaliseCart,
    calculateLineTotal: calculateLineTotal, calculateCart: calculateCart, formatMoney: formatMoney
  });
  window.Kent = Kent;
}());
