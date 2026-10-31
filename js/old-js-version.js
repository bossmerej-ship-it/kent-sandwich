// Comparison archive from final c1ce694. Never load this file on a page.
// Original basket, menu filtering and order validation, plus their Home consumer.

// ===== Original js/main.js =====
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
  navList.querySelectorAll('a[href="colophon.html"]').forEach(function (link) {
    const item = link.closest('li');
    if (item) item.remove();
  });
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

// ===== Original js/index.js =====
(function () {
    'use strict';

    const Kent = window.Kent;
    const signature = document.querySelector('.signature-section');
    if (!Kent || !signature || Kent.MENU.length === 0) {
        return;
    }

    const create = Kent.createElement;
    const section = create('section', 'py-5 border-bottom border-2 border-dark');
    section.setAttribute('aria-labelledby', 'suggestion-title');
    const heading = create('h2', 'fw-bold mb-3 display-6 text-uppercase lh-1', 'Need a hand choosing?');
    heading.id = 'suggestion-title';
    const introduction = create('p', '', 'Try a random pick from our eight sandwiches, or ask for another suggestion.');
    const card = create('article', 'menu-card card border-dark border-2 rounded-0');
    const body = create('div', 'card-body p-4');
    const name = create('h3', 'h4 fw-bold text-uppercase');
    const description = create('p');
    const profile = create('p', 'small text-body-secondary');
    const price = create('p', 'menu-price fs-3 fw-bold');
    const quantity = create('p', 'small mb-3');
    const actions = create('div', 'd-flex flex-wrap gap-2');
    const add = create('button', 'btn btn-dark rounded-0 border-2 fw-bold', 'Add to basket');
    add.type = 'button';
    const another = create('button', 'btn btn-outline-dark rounded-0 border-2', 'Another suggestion');
    another.type = 'button';
    const menuLink = create('a', 'btn btn-link link-dark', 'View the full menu →');
    menuLink.href = 'menu.html';
    const status = create('p', 'small mt-3 mb-0');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-atomic', 'true');
    const basketLink = create('a', 'link-dark fw-semibold d-inline-block mt-3', 'Review your basket →');
    basketLink.href = 'order.html';
    actions.append(add, another, menuLink);
    body.append(name, description, profile, price, quantity, actions, status, basketLink);
    card.append(body);
    section.append(heading, introduction, card);
    signature.before(section);

    let suggestionIndex = -1;

    // Skip the current item so that "Another suggestion" always produces a change.
    function chooseSuggestion(previousIndex, items) {
        if (items.length <= 1) {
            return 0;
        }
        if (previousIndex < 0) {
            return Math.floor(Math.random() * items.length);
        }
        const index = Math.floor(Math.random() * (items.length - 1));
        return index >= previousIndex ? index + 1 : index;
    }

    function updateBasketSelection() {
        const item = Kent.MENU[suggestionIndex];
        const entry = Kent.getCart().find(function (line) {
            return line.id === item.id;
        });
        const count = entry ? entry.quantity : 0;
        card.classList.toggle('is-selected', count > 0);
        quantity.textContent = count > 0 ? count + ' in your basket.' : 'Not in your basket yet.';
    }

    function showSuggestion(shouldAnnounce) {
        suggestionIndex = chooseSuggestion(suggestionIndex, Kent.MENU);
        const item = Kent.MENU[suggestionIndex];
        name.textContent = item.name;
        description.textContent = item.description;
        profile.textContent = 'Profile: ' + item.profile;
        price.textContent = Kent.formatMoney(item.price);
        add.setAttribute('aria-label', 'Add ' + item.name + ' to basket');
        updateBasketSelection();
        status.classList.remove('text-danger');
        status.textContent = shouldAnnounce ? 'Suggestion: ' + item.name + ', ' + Kent.formatMoney(item.price) + '.' : '';
    }

    another.addEventListener('click', function () {
        showSuggestion(true);
    });

    add.addEventListener('click', function () {
        const item = Kent.MENU[suggestionIndex];
        const result = Kent.addToCart(item.id);
        status.classList.toggle('text-danger', !result.ok);
        if (!result.ok) {
            status.textContent = result.message;
            return;
        }
        const basket = Kent.calculateCart(Kent.getCart());
        const unit = basket.quantity === 1 ? ' sandwich' : ' sandwiches';
        status.textContent = item.name + ' added. Basket: ' + basket.quantity + unit + ', ' + Kent.formatMoney(basket.total) + '.';
    });

    showSuggestion(false);
    Kent.onCartChange(updateBasketSelection);
}());

// ===== Original js/menu.js =====
(function () {
    'use strict';

    const Kent = window.Kent;
    const board = document.querySelector('.menu-board');
    const grid = document.querySelector('.menu-board > .row');
    const tableBody = document.getElementById('menu-price-rows');
    if (!Kent || !board || !grid || !tableBody) {
        return;
    }

    const create = Kent.createElement;
    const form = create('form', 'mb-4');
    form.setAttribute('aria-label', 'Filter the sandwich menu');
    const fieldset = create('fieldset');
    const legend = create('legend', 'h4 fw-bold mb-3', 'Find your sandwich');
    const controls = create('div', 'row g-3');

    function addControl(labelText, control, classes) {
        const column = create('div', classes);
        const label = create('label', 'form-label fw-semibold', labelText);
        label.htmlFor = control.id;
        column.append(label, control);
        controls.append(column);
        return control;
    }

    function addOption(select, value, label) {
        const option = create('option', '', label);
        option.value = value;
        select.append(option);
    }

    const search = create('input', 'form-control rounded-0');
    search.id = 'menu-search';
    search.type = 'search';
    search.name = 'search';
    search.maxLength = 100;
    search.placeholder = 'Name or description';
    addControl('Search sandwiches', search, 'col-12 col-md-6');

    const profile = create('select', 'form-select rounded-0');
    profile.id = 'menu-profile';
    profile.name = 'profile';
    addOption(profile, '', 'All profiles');
    const profiles = Array.from(new Set(Kent.MENU.map(function (item) {
        return item.profile;
    })));
    profiles.forEach(function (value) {
        addOption(profile, value, value);
    });
    addControl('Sandwich profile', profile, 'col-12 col-sm-6 col-md-3');

    const budget = create('select', 'form-select rounded-0');
    budget.id = 'menu-max-price';
    budget.name = 'maxPrice';
    addOption(budget, '', 'Any price');
    const prices = Array.from(new Set(Kent.MENU.map(function (item) {
        return item.price;
    }))).sort(function (left, right) {
        return left - right;
    });
    prices.forEach(function (value) {
        addOption(budget, String(value), 'Up to ' + Kent.formatMoney(value));
    });
    addControl('Maximum price', budget, 'col-12 col-sm-6 col-md-3');

    const sorting = create('select', 'form-select rounded-0');
    sorting.id = 'menu-sort';
    sorting.name = 'sort';
    addOption(sorting, 'menu', 'Menu order');
    addOption(sorting, 'price-asc', 'Price: low to high');
    addOption(sorting, 'price-desc', 'Price: high to low');
    addOption(sorting, 'name', 'Name: A to Z');
    addControl('Sort results', sorting, 'col-12 col-sm-6 col-md-4');

    const resetColumn = create('div', 'col-12 col-sm-6 col-md-4 d-flex align-items-end');
    const reset = create('button', 'btn btn-outline-dark rounded-0 border-2', 'Reset filters');
    reset.type = 'reset';
    resetColumn.append(reset);
    controls.append(resetColumn);
    fieldset.append(legend, controls);
    form.append(fieldset);

    const summary = create('div', 'd-flex flex-wrap align-items-center justify-content-between gap-2 mb-3');
    const count = create('p', 'mb-0 fw-semibold');
    count.id = 'menu-result-count';
    count.setAttribute('role', 'status');
    count.setAttribute('aria-atomic', 'true');
    const basketLink = create('a', 'link-dark fw-bold');
    basketLink.href = 'order.html';
    summary.append(count, basketLink);

    const feedback = create('p', 'small mb-3');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-atomic', 'true');
    const empty = create('div', 'form-message is-hidden');
    const emptyHeading = create('h3', 'h5 fw-bold', 'No sandwiches match these filters.');
    const emptyHelp = create('p', 'mb-0', 'Try a different search, increase the maximum price, or reset the filters.');
    empty.append(emptyHeading, emptyHelp);
    grid.before(form, summary, feedback, empty);

    function menuNumber(item) {
        return String(Kent.MENU.indexOf(item) + 1).padStart(2, '0');
    }

    // Both the card grid and table below use this same filtered array.
    function sortedResults(items, order) {
        const result = items.slice();
        if (order === 'price-asc') {
            result.sort(function (left, right) { return left.price - right.price; });
        } else if (order === 'price-desc') {
            result.sort(function (left, right) { return right.price - left.price; });
        } else if (order === 'name') {
            result.sort(function (left, right) { return left.name.localeCompare(right.name, 'en'); });
        }
        return result;
    }

    function renderMenuCard(item) {
        const column = create('div', 'col-12 col-md-6 col-lg-3');
        const colour = item.id === 'mini' ? 'bg-warning' : 'bg-white';
        const article = create('article', 'menu-card card h-100 border-dark border-2 rounded-0 ' + colour);
        article.id = 'menu-item-' + item.id;
        article.dataset.menuItem = item.id;
        article.dataset.price = String(item.price);
        const body = create('div', 'card-body d-flex flex-column p-4');
        const number = create('p', 'menu-number small text-body-secondary mb-3', menuNumber(item));
        const title = create('h3', 'h5 fw-bold card-title text-uppercase lh-1', item.name);
        const note = create('p', 'menu-note card-text text-body-secondary', item.description);
        const profileText = create('p', 'small text-body-secondary', 'Profile: ' + item.profile);
        const price = create('p', 'menu-price mt-auto fs-3 fw-bold mb-0', Kent.formatMoney(item.price));
        body.append(number, title, note, profileText, price);
        if (item.id === 'mini') {
            body.append(create('span', 'menu-badge badge text-bg-dark align-self-start mt-2', 'Small'));
        }
        const selection = create('p', 'small mt-3 mb-2');
        selection.dataset.basketQuantity = item.id;
        const add = create('button', 'btn btn-dark rounded-0 border-2 fw-bold', 'Add to basket');
        add.type = 'button';
        add.dataset.addItem = item.id;
        add.setAttribute('aria-label', 'Add ' + item.name + ' to basket');
        body.append(selection, add);
        article.append(body);
        column.append(article);
        return column;
    }

    function renderPriceRow(item) {
        const row = create('tr');
        row.id = 'price-row-' + item.id;
        row.dataset.menuItem = item.id;
        row.dataset.price = String(item.price);
        const number = create('th', '', menuNumber(item));
        number.scope = 'row';
        row.append(number, create('td', '', item.name), create('td', '', item.profile), create('td', '', Kent.formatMoney(item.price)));
        return row;
    }

    // Update existing nodes only, preserving keyboard focus on the Add button.
    function updateBasketSelection() {
        const cart = Kent.getCart();
        grid.querySelectorAll('[data-basket-quantity]').forEach(function (label) {
            const entry = cart.find(function (line) {
                return line.id === label.dataset.basketQuantity;
            });
            const quantity = entry ? entry.quantity : 0;
            label.textContent = quantity > 0 ? quantity + ' in your basket' : 'Not in your basket yet';
            label.closest('.menu-card').classList.toggle('is-selected', quantity > 0);
        });
        const basket = Kent.calculateCart(cart);
        basketLink.textContent = 'Review basket (' + basket.quantity + ') · ' + Kent.formatMoney(basket.total) + ' →';
    }

    function applyFilters(resetMessage) {
        const maxPrice = budget.value === '' ? Infinity : Number(budget.value);
        const filtered = Kent.filterMenu(Kent.MENU, search.value, profile.value, maxPrice);
        const results = sortedResults(filtered, sorting.value);
        grid.replaceChildren();
        tableBody.replaceChildren();
        results.forEach(function (item) {
            grid.append(renderMenuCard(item));
            tableBody.append(renderPriceRow(item));
        });
        empty.classList.toggle('is-hidden', results.length > 0);
        if (results.length === 0) {
            const row = create('tr');
            const cell = create('td', 'text-center py-4', 'No sandwiches match the selected filters.');
            cell.colSpan = 4;
            row.append(cell);
            tableBody.append(row);
        }
        count.textContent = (resetMessage ? 'Filters reset. ' : '') + 'Showing ' + results.length + ' of ' + Kent.MENU.length + ' sandwiches.';
        feedback.textContent = '';
        feedback.classList.remove('text-danger');
        updateBasketSelection();
    }

    search.addEventListener('input', function () { applyFilters(false); });
    [profile, budget, sorting].forEach(function (control) {
        control.addEventListener('change', function () { applyFilters(false); });
    });
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilters(false);
    });
    form.addEventListener('reset', function (event) {
        event.preventDefault();
        search.value = '';
        profile.value = '';
        budget.value = '';
        sorting.value = 'menu';
        applyFilters(true);
        search.focus();
    });
    grid.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-add-item]');
        if (!button || !grid.contains(button)) {
            return;
        }
        const item = Kent.getMenuItem(Kent.MENU, button.dataset.addItem);
        const result = Kent.addToCart(item.id);
        feedback.classList.toggle('text-danger', !result.ok);
        if (!result.ok) {
            feedback.textContent = result.message;
            return;
        }
        const basket = Kent.calculateCart(Kent.getCart());
        const unit = basket.quantity === 1 ? ' sandwich' : ' sandwiches';
        feedback.textContent = item.name + ' added. Basket: ' + basket.quantity + unit + ', ' + Kent.formatMoney(basket.total) + '. Review your basket to adjust quantities.';
    });

    applyFilters(false);
    Kent.onCartChange(updateBasketSelection);
}());

// ===== Original js/order.js =====
(function () {
  'use strict';

  const Kent = window.Kent;
  if (!Kent) return;

  // The shop's calendar is used even when the visitor is in another time zone.
  function getShopClock(now) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Almaty',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(now);
    const values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return {
      date: values.year + '-' + values.month + '-' + values.day,
      seconds: Number(values.hour) * 3600 + Number(values.minute) * 60 + Number(values.second)
    };
  }

  function validateQuantity(value) {
    if (String(value).trim() === '') return 'Enter a quantity from 1 to 10.';
    const quantity = Number(value);
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= 10
      ? '' : 'Quantity must be a whole number from 1 to 10.';
  }

  // A date/time pair must be in the future AND inside the prepared pickup hours.
  function validatePickup(date, time, now) {
    const clock = getShopClock(now || new Date());
    const errors = { date: '', time: '' };
    const dateObject = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T00:00:00Z') : null;
    const validDate = dateObject && !Number.isNaN(dateObject.getTime()) &&
      dateObject.toISOString().slice(0, 10) === date;
    if (!validDate) errors.date = 'Choose a pickup date.';
    else if (date < clock.date) errors.date = 'Choose today or a later date in Astana.';

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) errors.time = 'Choose a pickup time.';
    else if (time < '09:30' || time > '21:15') errors.time = 'Pickup is available from 09:30 to 21:15.';
    else if (validDate && !errors.date && date === clock.date) {
      const seconds = Number(time.slice(0, 2)) * 3600 + Number(time.slice(3, 5)) * 60;
      if (seconds <= clock.seconds) errors.time = 'Choose a pickup time later than now in Astana.';
    }
    return errors;
  }

  Kent.validateQuantity = validateQuantity;
  Kent.validatePickup = validatePickup;

  const form = document.getElementById('order-form');
  if (!form) return;

  const name = document.getElementById('customer-name');
  const phone = document.getElementById('customer-phone');
  const email = document.getElementById('customer-email');
  const date = document.getElementById('pickup-date');
  const time = document.getElementById('pickup-time');
  const method = document.getElementById('contact-method');
  const note = document.getElementById('order-note');
  const request = document.getElementById('contact-request');
  const submit = document.getElementById('submit-order');
  const errorSummary = document.getElementById('order-error');
  const confirmation = document.getElementById('order-confirmation');
  const touched = new Set();
  const invalidQuantities = new Set();
  const messages = new Map();
  const fields = [name, phone, email, date, time, method, note];
  const choices = Array.from(form.querySelectorAll('[name="items"]')).map(function (checkbox) {
    return {
      id: checkbox.value,
      checkbox: checkbox,
      quantity: document.getElementById('quantity-' + checkbox.value),
      label: checkbox.closest('.choice-card')
    };
  });
  let changingCart = false;
  let resetting = false;
  let confirmed = false;
  let submitted = false;
  let previousQuantities = new Map();

  form.noValidate = true;
  submit.type = 'submit';
  submit.textContent = 'Prepare demo order';
  name.maxLength = 80;
  date.min = getShopClock(new Date()).date;

  function appendDescription(control, id) {
    const ids = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(id);
    control.setAttribute('aria-describedby', Array.from(ids).join(' '));
  }

  function removeDescription(control, id) {
    const ids = (control.getAttribute('aria-describedby') || '').split(/\s+/)
      .filter(function (value) { return value && value !== id; });
    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');
  }

  function prepareError(control) {
    const message = Kent.createElement('span', 'd-block small mt-1 text-danger is-hidden');
    message.id = control.id + '-error';
    const anchor = control.classList.contains('item-quantity') ? control.closest('label') : control;
    anchor.insertAdjacentElement('afterend', message);
    messages.set(control, message);
  }

  fields.forEach(prepareError);
  choices.forEach(function (choice) { prepareError(choice.quantity); });

  function showFieldError(control, error, showSuccess) {
    const message = messages.get(control);
    message.textContent = error;
    message.classList.toggle('is-hidden', !error);
    control.classList.toggle('is-error', Boolean(error));
    control.classList.toggle('is-success', !error && Boolean(showSuccess));
    if (error) {
      control.setAttribute('aria-invalid', 'true');
      appendDescription(control, message.id);
    } else {
      control.removeAttribute('aria-invalid');
      removeDescription(control, message.id);
    }
  }

  const noteCounter = Kent.createElement('span', 'd-block small mt-1');
  noteCounter.id = 'order-note-count';
  note.insertAdjacentElement('afterend', noteCounter);
  appendDescription(note, noteCounter.id);

  const demoNotice = Kent.createElement('p', 'form-text mb-3',
    'Demo only: your details stay on this page. No order, payment or contact request is sent to the shop.');
  demoNotice.id = 'order-demo-notice';
  submit.insertAdjacentElement('beforebegin', demoNotice);
  appendDescription(submit, demoNotice.id);

  const draft = Kent.createElement('section', 'border border-dark p-3 mb-4');
  draft.setAttribute('aria-labelledby', 'pickup-draft-title');
  const draftTitle = Kent.createElement('h3', 'h5 fw-bold', 'Your demo draft');
  draftTitle.id = 'pickup-draft-title';
  const draftText = Kent.createElement('p', 'mb-2');
  const availability = Kent.createElement('p', 'small mb-0',
    'Pickup times: 09:30–21:15, Astana time. Choose a future date and time.');
  draft.append(draftTitle, draftText, availability);
  form.querySelectorAll('fieldset')[1].append(draft);

  const submitHint = Kent.createElement('p', 'form-text mb-3');
  submitHint.id = 'order-submit-hint';
  submit.insertAdjacentElement('beforebegin', submitHint);
  appendDescription(submit, submitHint.id);

  function updateDraft() {
    const basket = Kent.calculateCart(Kent.getCart());
    const selection = basket.quantity + (basket.quantity === 1 ? ' sandwich' : ' sandwiches') +
      ' · ' + Kent.formatMoney(basket.total);
    draftText.textContent = selection + (date.value && time.value
      ? ' · Pickup ' + date.value + ' at ' + time.value + ' (Astana).' : ' · Pickup not selected yet.');
    noteCounter.textContent = note.value.length + ' / 240 characters';
    submit.disabled = basket.quantity === 0 || confirmed;
    submitHint.textContent = basket.quantity === 0
      ? 'Choose at least one sandwich to prepare a demo order.'
      : confirmed ? 'Demo prepared. Edit any detail or choose Edit details to prepare it again.'
        : 'Review your basket and pickup details, then prepare the demo summary.';
  }

  function invalidateConfirmation() {
    if (!confirmed) return;
    confirmed = false;
    confirmation.classList.add('is-hidden');
    confirmation.replaceChildren();
    submit.textContent = 'Prepare demo order';
    Kent.announce('The previous demo summary was cleared. Review your changes and prepare it again.');
  }

  function mutateCart(action) {
    changingCart = true;
    try { return action(); }
    finally { changingCart = false; }
  }

  function syncChoices(preserveInvalid) {
    const cart = Kent.getCart();
    const cartCleared = !preserveInvalid && previousQuantities.size > 0 && cart.length === 0;
    choices.forEach(function (choice) {
      const line = cart.find(function (entry) { return entry.id === choice.id; });
      const unchangedQuantity = previousQuantities.get(choice.id) === (line ? line.quantity : undefined);
      const keepInvalid = !cartCleared && invalidQuantities.has(choice.id) && (preserveInvalid || unchangedQuantity);
      if (!keepInvalid) {
        invalidQuantities.delete(choice.id);
        choice.checkbox.checked = Boolean(line);
        choice.quantity.value = line ? String(line.quantity) : '1';
        showFieldError(choice.quantity, '', Boolean(line) && touched.has(choice.quantity));
      }
      choice.quantity.disabled = !choice.checkbox.checked;
      choice.label.classList.toggle('is-selected', choice.checkbox.checked);
    });
    previousQuantities = new Map(cart.map(function (line) { return [line.id, line.quantity]; }));
    updateDraft();
  }

  function fieldErrors() {
    const errors = new Map();
    const customer = name.value.trim();
    errors.set(name, customer.length < 2 || customer.length > 80
      ? 'Enter a name with 2 to 80 characters, excluding surrounding spaces.' : '');
    errors.set(phone, /^\+?[0-9](?:[ ()-]*[0-9]){9,14}$/.test(phone.value.trim())
      ? '' : 'Enter a phone number with 10 to 15 digits. Spaces, brackets and hyphens are allowed.');
    errors.set(email, email.value.trim() && !email.validity.typeMismatch
      ? '' : 'Enter a valid email address, for example name@example.com.');
    const pickup = validatePickup(date.value, time.value);
    errors.set(date, pickup.date);
    errors.set(time, pickup.time);
    errors.set(method, method.value === 'phone' || method.value === 'whatsapp'
      ? '' : 'Choose phone call or WhatsApp.');
    errors.set(note, note.value.length <= 240 ? '' : 'Keep your note within 240 characters.');
    choices.forEach(function (choice) {
      errors.set(choice.quantity, choice.checkbox.checked ? validateQuantity(choice.quantity.value) : '');
    });
    return errors;
  }

  function updateTouchedErrors() {
    fieldErrors().forEach(function (error, control) {
      if (touched.has(control)) showFieldError(control, error, Boolean(control.value.trim()));
    });
    if (submitted) {
      const count = Array.from(fieldErrors().values()).filter(Boolean).length;
      const empty = Kent.calculateCart(Kent.getCart()).quantity === 0;
      errorSummary.textContent = empty ? 'Choose at least one sandwich and check the highlighted fields.'
        : count ? 'Please correct the highlighted fields before preparing your demo order.' : '';
      errorSummary.classList.toggle('is-hidden', !empty && count === 0);
    }
  }

  function updateQuantity(choice) {
    touched.add(choice.quantity);
    if (!choice.checkbox.checked) return;
    const error = validateQuantity(choice.quantity.value);
    showFieldError(choice.quantity, error, !error);
    if (error) invalidQuantities.add(choice.id);
    else {
      invalidQuantities.delete(choice.id);
      const quantity = Number(choice.quantity.value);
      const existing = Kent.getCart().find(function (entry) { return entry.id === choice.id; });
      if (!existing || existing.quantity !== quantity) {
        mutateCart(function () { return Kent.setQuantity(choice.id, quantity); });
      }
    }
  }

  form.addEventListener('input', function (event) {
    if (!event.target.matches('input, select, textarea')) return;
    invalidateConfirmation();
    const choice = choices.find(function (entry) { return entry.quantity === event.target; });
    if (choice) updateQuantity(choice);
    updateTouchedErrors();
    updateDraft();
  });

  form.addEventListener('change', function (event) {
    if (!event.target.matches('input, select, textarea')) return;
    invalidateConfirmation();
    const choice = choices.find(function (entry) { return entry.checkbox === event.target; });
    if (choice) {
      if (choice.checkbox.checked) {
        choice.quantity.disabled = false;
        updateQuantity(choice);
      } else {
        invalidQuantities.delete(choice.id);
        touched.delete(choice.quantity);
        showFieldError(choice.quantity, '', false);
        mutateCart(function () { return Kent.removeFromCart(choice.id); });
        syncChoices(true);
      }
      choice.label.classList.toggle('is-selected', choice.checkbox.checked);
    } else if (messages.has(event.target)) touched.add(event.target);
    updateTouchedErrors();
    updateDraft();
  });

  form.addEventListener('focusout', function (event) {
    if (!messages.has(event.target)) return;
    touched.add(event.target);
    updateTouchedErrors();
  });

  function addSummaryLine(list, label, value) {
    list.append(Kent.createElement('dt', 'fw-semibold mt-2', label),
      Kent.createElement('dd', 'mb-1 text-break', value));
  }

  function showConfirmation(basket) {
    confirmed = true;
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    const heading = Kent.createElement('h3', 'h4 fw-bold', 'Demo order prepared · ' + reference);
    const notice = Kent.createElement('p', 'fw-semibold',
      'This is a local demonstration. Nothing was sent to the shop. No real order or payment was made.');
    const lines = Kent.createElement('ul', 'mb-3');
    basket.lines.forEach(function (line) {
      lines.append(Kent.createElement('li', '', line.item.name + ' × ' + line.quantity +
        ' — ' + Kent.formatMoney(line.subtotal)));
    });
    const total = Kent.createElement('p', 'fw-bold', 'Total: ' + Kent.formatMoney(basket.total) +
      ' · ' + basket.quantity + (basket.quantity === 1 ? ' sandwich' : ' sandwiches'));
    const details = Kent.createElement('dl', 'mb-3');
    addSummaryLine(details, 'Name', name.value.trim());
    addSummaryLine(details, 'Phone', phone.value.trim());
    addSummaryLine(details, 'Email', email.value.trim());
    addSummaryLine(details, 'Pickup in Astana', date.value + ' at ' + time.value);
    addSummaryLine(details, 'Contact preference', request.checked
      ? (method.value === 'whatsapp' ? 'WhatsApp' : 'Phone call') + ' requested in this demo only. No message will be sent.'
      : 'No reply requested.');
    addSummaryLine(details, 'Note', note.value.trim() || 'No extra note.');
    const edit = Kent.createElement('button', 'btn btn-outline-dark rounded-0 me-2 mb-2', 'Edit details');
    edit.type = 'button';
    edit.addEventListener('click', function () {
      invalidateConfirmation();
      updateDraft();
      name.focus();
    });
    const start = Kent.createElement('button', 'btn btn-dark rounded-0 mb-2', 'Start new demo');
    start.type = 'button';
    start.addEventListener('click', function () { form.reset(); });
    confirmation.replaceChildren(heading, notice, lines, total, details, edit, start);
    confirmation.classList.remove('is-hidden');
    confirmation.tabIndex = -1;
    submit.textContent = 'Demo prepared';
    updateDraft();
    confirmation.focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (confirmed) return;
    date.min = getShopClock(new Date()).date;
    submitted = true;
    const errors = fieldErrors();
    errors.forEach(function (error, control) {
      touched.add(control);
      showFieldError(control, error, Boolean(control.value.trim()) && !control.disabled);
    });
    const firstInvalid = Array.from(form.elements).find(function (control) { return Boolean(errors.get(control)); });
    const basket = Kent.calculateCart(Kent.getCart());
    if (firstInvalid || basket.quantity === 0) {
      errorSummary.textContent = basket.quantity === 0
        ? 'Choose at least one sandwich, then check the highlighted fields.'
        : 'Please correct the highlighted fields before preparing your demo order.';
      errorSummary.classList.remove('is-hidden');
      (firstInvalid || choices[0].checkbox).focus();
      return;
    }
    errorSummary.classList.add('is-hidden');
    errorSummary.textContent = '';
    showConfirmation(basket);
  });

  form.addEventListener('reset', function (event) {
    // Reset synchronously: a delayed native reset could overwrite the cart sync.
    event.preventDefault();
    resetting = true;
    confirmed = false;
    submitted = false;
    touched.clear();
    invalidQuantities.clear();
    Array.from(form.elements).forEach(function (control) {
      if (control.matches('input[type="checkbox"]')) control.checked = control.defaultChecked;
      else if (control.matches('select')) {
        Array.from(control.options).forEach(function (option) { option.selected = option.defaultSelected; });
        if (control.selectedIndex < 0) control.selectedIndex = 0;
      } else if (control.matches('input, textarea')) control.value = control.defaultValue;
    });
    messages.forEach(function (message, control) { showFieldError(control, '', false); });
    confirmation.replaceChildren();
    confirmation.classList.add('is-hidden');
    errorSummary.textContent = '';
    errorSummary.classList.add('is-hidden');
    submit.textContent = 'Prepare demo order';
    date.min = getShopClock(new Date()).date;
    Kent.clearCart();
    syncChoices(false);
    resetting = false;
    Kent.announce('Demo draft cleared, including basket and pickup details.');
    choices[0].checkbox.focus();
  });

  Kent.onCartChange(function () {
    if (!resetting) invalidateConfirmation();
    syncChoices(changingCart);
    if (!resetting) updateTouchedErrors();
  });

  syncChoices(false);
})();


// Previous Timur implementation: timur.js
(function () {
'use strict';

function createTimurElement(tag, classes, text) {
  const element = document.createElement(tag);
  element.className = classes || '';
  if (text !== undefined) element.textContent = text;
  return element;
}

function getShopClock(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const values = {};
  for (const part of parts) values[part.type] = part.value;
  return {
    date: values.year + '-' + values.month + '-' + values.day,
    time: values.hour + ':' + values.minute
  };
}

function alignTimurHeader() {
  const header = document.querySelector('.site-header');
  header.classList.remove('bg-body', 'py-4', 'border-2');
  header.classList.add('py-3');
  const logo = header.querySelector('.brand-mark img');
  logo.width = 44;
  logo.height = 44;
  logo.classList.remove('border-2');
  header.querySelector('.navbar-toggler').classList.remove('rounded-0', 'border-dark', 'border-2');
  header.querySelector('.header-note').classList.remove('text-uppercase');
  const links = header.querySelectorAll('.nav-link');
  for (const link of links) {
    link.classList.remove('rounded-0', 'text-uppercase', 'small', 'fw-bold');
    link.classList.add('fw-semibold');
    if (link.getAttribute('href') === 'colophon.html') link.closest('li').remove();
  }
}

const timurPage = document.body.dataset.page;
if (timurPage === 'about' || timurPage === 'feedback' || timurPage === 'colophon') {
  alignTimurHeader();
}

})();


// Previous Timur implementation: about.js
(function () {
'use strict';

function getOpeningStatus(now, opening, closing) {
  const clock = getShopClock(now);
  const open = clock.time >= opening && clock.time < closing;
  let text = 'Open until ' + closing + ' (Astana time).';
  if (!open) {
    const day = clock.time < opening ? 'today' : 'tomorrow';
    text = 'Closed — opens ' + day + ' at ' + opening + ' (Astana time).';
  }
  return { open: open, text: text };
}

function getNextMinuteDelay(now) {
  return 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
}

function getNextPhotoIndex(index, step, count) {
  return (index + step + count) % count;
}

function initTimurAbout() {
  const hours = document.getElementById('visit-hours');
  const status = document.getElementById('visit-status');
  function updateHours() {
    const result = getOpeningStatus(new Date(), hours.dataset.open, hours.dataset.close);
    status.textContent = result.text;
    status.classList.remove('hidden');
    status.classList.toggle('success', result.open);
  }
  function refreshHours() {
    updateHours();
    window.setTimeout(refreshHours, getNextMinuteDelay(new Date()));
  }
  refreshHours();
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) updateHours();
  });

  const links = Array.from(document.querySelectorAll('.gallery-link'));
  const dialog = document.getElementById('gallery-dialog');
  const image = document.getElementById('gallery-dialog-image');
  const caption = document.getElementById('gallery-dialog-caption');
  const error = document.getElementById('gallery-error');
  let photoIndex = 0;
  let opener = null;

  function showPhoto(index) {
    photoIndex = index;
    const link = links[index];
    image.alt = link.querySelector('img').alt;
    image.src = link.getAttribute('href');
    caption.textContent = document.getElementById(link.dataset.captionId).textContent;
    document.getElementById('gallery-position').textContent = (index + 1) + ' of ' + links.length;
    error.classList.add('hidden');
  }
  for (let index = 0; index < links.length; index++) {
    links[index].addEventListener('click', function (event) {
      event.preventDefault();
      opener = links[index];
      showPhoto(index);
      dialog.showModal();
    });
  }
  document.getElementById('gallery-next').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, 1, links.length));
  });
  document.getElementById('gallery-previous').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, -1, links.length));
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      showPhoto(getNextPhotoIndex(photoIndex, step, links.length));
    }
  });
  dialog.addEventListener('close', function () {
    if (opener) opener.focus();
  });
  image.addEventListener('error', function () { error.classList.remove('hidden'); });
  image.addEventListener('load', function () { error.classList.add('hidden'); });
}

if (document.body.dataset.page === 'about') {
  initTimurAbout();
}

})();


// Previous Timur implementation: feedback.js
(function () {
'use strict';

// The same eight items and prices as the existing menu.
const feedbackMenu = [
  { id: 'mini', name: 'Mini sandwich', price: 390, profile: 'Compact' },
  { id: 'chicken', name: 'Chicken', price: 640, profile: 'Classic' },
  { id: 'classic', name: 'Classic', price: 640, profile: 'Classic' },
  { id: 'cheese', name: 'Cheese', price: 640, profile: 'Rich' },
  { id: 'cutlet', name: 'Cutlet', price: 690, profile: 'Filling' },
  { id: 'spicy-cutlet', name: 'Spicy cutlet', price: 740, profile: 'Hot' },
  { id: 'hot-dog', name: 'Hot dog', price: 640, profile: 'Classic' },
  { id: 'spicy', name: 'Spicy', price: 690, profile: 'Hot' }
];

function formatFeedbackDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty', dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined
  }).format(new Date(value));
}

function validateFeedback(data, today) {
  const errors = [];
  if (data.name.trim().length < 2 || data.name.trim().length > 80) {
    errors.push({ id: 'guest-name', message: 'Enter a name with 2–80 characters after trimming spaces.' });
  }
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
    errors.push({ id: 'guest-email', message: 'Enter a valid email address, or leave it empty.' });
  }
  if (data.phone && (data.phone.length > 30 || !/^\+?[0-9](?:[ ()-]*[0-9]){9,14}$/.test(data.phone))) {
    errors.push({ id: 'guest-phone', message: 'Enter 10–15 phone digits, or leave this field empty.' });
  }
  const group = Number(data.group);
  if (!Number.isInteger(group) || group < 1 || group > 20) {
    errors.push({ id: 'group-size', message: 'Choose a whole group size from 1 to 20.' });
  }
  const date = new Date(data.date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== data.date || data.date > today) {
    errors.push({ id: 'visit-date', message: 'Choose a real visit date that is not in the future.' });
  }
  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ id: 'rating-1', message: 'Choose a rating from 1 to 5.' });
  }
  if (data.message.trim().length < 20 || data.message.trim().length > 600) {
    errors.push({ id: 'guest-message', message: 'Write 20–600 characters after trimming spaces.' });
  }
  if (data.contact && !data.email && !data.phone) {
    errors.push({ id: 'contact-permission', message: 'Add an email or phone number, or untick this box.' });
  }
  return errors;
}

function filterFeedback(reviews, query, rating, order) {
  const search = query.trim().toLowerCase();
  const result = reviews.filter(function (review) {
    const text = (review.name + ' ' + review.text + ' ' + review.category).toLowerCase();
    const matchesRating = rating === '' ||
      (rating === 'unrated' ? review.rating === null : review.rating === Number(rating));
    return text.includes(search) && matchesRating;
  });
  result.sort(function (left, right) {
    if (order === 'oldest') return new Date(left.date) - new Date(right.date);
    return new Date(right.date) - new Date(left.date);
  });
  return result;
}

function renderFeedbackCard(review) {
  const card = createTimurElement('article', 'border border-2 rounded-0 p-3 p-md-4 mb-3 bg-white text-break');
  card.id = 'review-' + review.id;
  card.append(createTimurElement('h3', 'h5 fw-bold', review.name));
  const rating = review.rating === null ? 'Rating not provided' : review.rating + ' / 5';
  card.append(createTimurElement('p', 'small mb-2', rating + ' · ' + review.category));
  const text = createTimurElement('p', 'feedback-message', review.text);
  if (review.language) text.lang = review.language;
  card.append(text);
  const date = createTimurElement('time', 'small d-block mb-2', formatFeedbackDate(review.date));
  date.dateTime = review.date;
  card.append(date);
  if (review.source) {
    const source = createTimurElement('a', 'link-dark small', 'Original review on 2GIS ↗');
    source.href = review.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    card.append(source);
  } else {
    card.append(createTimurElement('p', 'small mb-0', 'Local demo review — not sent to the shop.'));
  }
  return card;
}

function initTimurFeedback() {
  const form = document.getElementById('feedback-form');
  const dialog = document.getElementById('feedback-dialog');
  const preview = document.getElementById('feedback-review');
  const confirmation = document.getElementById('feedback-confirmation');
  const message = document.getElementById('guest-message');
  const counter = document.getElementById('feedback-character-count');
  const errorList = document.getElementById('feedback-error-list');
  const errorBox = document.getElementById('feedback-errors');
  const shareText = document.getElementById('feedback-share-text');
  const copyButton = document.getElementById('feedback-copy');
  const copyStatus = document.getElementById('feedback-copy-status');
  const copyError = document.getElementById('feedback-copy-error');
  const itemSelect = document.getElementById('ordered-item');
  let stage = 'editing';
  let draft = null;
  let submitted = false;
  let copyVersion = 0;

  form.noValidate = true;
  document.getElementById('feedback-count-row').classList.remove('hidden');
  document.getElementById('submission-note').textContent =
    'Review your feedback, then confirm it on this page. Nothing is sent to the shop.';
  document.getElementById('feedback-submit').textContent = 'Review feedback';
  itemSelect.replaceChildren(createTimurElement('option', '', 'Another item / not sure'));
  itemSelect.firstElementChild.value = '';
  for (const item of feedbackMenu) {
    const option = createTimurElement('option', '', item.name + ' — ' + item.price + ' ₸ · ' + item.profile);
    option.value = item.id;
    itemSelect.append(option);
  }

  // Preserve the actual existing review. Its source does not specify a rating.
  const quote = document.querySelector('.feedback-prompt blockquote');
  const reviews = [{
    id: 'source', name: quote.querySelector('cite').firstChild.textContent.trim().replace(/,$/, ''),
    text: quote.querySelector('q').textContent, language: quote.querySelector('q').lang,
    rating: null, category: 'Source review',
    date: quote.querySelector('time').dateTime, source: quote.querySelector('a').href
  }];
  quote.remove();

  const section = createTimurElement('section', 'py-4');
  section.id = 'visitor-reviews';
  section.setAttribute('aria-labelledby', 'visitor-reviews-title');
  const heading = createTimurElement('h2', 'fw-bold display-6 text-uppercase', 'Visitor reviews');
  heading.id = 'visitor-reviews-title';
  section.append(heading, createTimurElement('p', 'small',
    'The source review is credited below. New reviews stay on this page only and disappear when you reload.'));
  const filters = createTimurElement('form', 'row g-3 mb-3');
  filters.setAttribute('aria-label', 'Filter visitor reviews');

  function addFilter(id, labelText, control) {
    const column = createTimurElement('div', 'col-12 col-md-4');
    const label = createTimurElement('label', 'form-label', labelText);
    label.htmlFor = id;
    control.id = id;
    column.append(label, control);
    filters.append(column);
    return control;
  }
  const search = addFilter('review-search', 'Search reviews', createTimurElement('input', 'form-control rounded-0'));
  search.type = 'search';
  search.maxLength = 100;
  const ratingFilter = addFilter('review-rating-filter', 'Rating', createTimurElement('select', 'form-select rounded-0'));
  for (const value of ['', '5', '4', '3', '2', '1', 'unrated']) {
    const label = value === '' ? 'All ratings' : value === 'unrated' ? 'Not rated' : value + ' / 5';
    const option = createTimurElement('option', '', label);
    option.value = value;
    ratingFilter.append(option);
  }
  const sorting = addFilter('review-sort', 'Order', createTimurElement('select', 'form-select rounded-0'));
  for (const value of ['newest', 'oldest']) {
    const option = createTimurElement('option', '', value === 'newest' ? 'Newest first' : 'Oldest first');
    option.value = value;
    sorting.append(option);
  }
  const reset = createTimurElement('button', 'btn btn-outline-dark rounded-0', 'Reset filters');
  reset.type = 'reset';
  const actions = createTimurElement('div', 'col-12');
  actions.append(reset);
  filters.append(actions);
  const count = createTimurElement('p', 'small');
  count.id = 'review-results-count';
  count.setAttribute('role', 'status');
  const empty = createTimurElement('p', 'border p-3 hidden', 'No reviews match. Try another search, change the rating or reset the filters.');
  empty.id = 'review-empty';
  const list = createTimurElement('div');
  list.id = 'review-list';
  section.append(filters, count, empty, list);
  document.getElementById('main-content').append(section);

  function renderReviews() {
    const results = filterFeedback(reviews, search.value, ratingFilter.value, sorting.value);
    list.replaceChildren();
    for (const review of results) list.append(renderFeedbackCard(review));
    const rated = results.filter(function (review) { return review.rating !== null; });
    let total = 0;
    for (const review of rated) total += review.rating;
    const average = rated.length > 0 ? ' Average: ' + (total / rated.length).toFixed(1) + ' / 5.' : ' No ratings in these results.';
    count.textContent = 'Showing ' + results.length + ' of ' + reviews.length + ' reviews.' + average;
    empty.classList.toggle('hidden', results.length !== 0);
  }
  function resetFilters() {
    search.value = '';
    ratingFilter.value = '';
    sorting.value = 'newest';
    renderReviews();
  }
  filters.addEventListener('input', renderReviews);
  filters.addEventListener('change', renderReviews);
  filters.addEventListener('submit', function (event) { event.preventDefault(); renderReviews(); });
  filters.addEventListener('reset', function (event) {
    event.preventDefault();
    resetFilters();
    search.focus();
  });
  renderReviews();

  function readFeedback() {
    const selectedRating = form.querySelector('input[name="rating"]:checked');
    return {
      name: document.getElementById('guest-name').value.trim(),
      email: document.getElementById('guest-email').value.trim(),
      phone: document.getElementById('guest-phone').value.trim(),
      group: document.getElementById('group-size').value,
      date: document.getElementById('visit-date').value,
      item: itemSelect.value,
      rating: selectedRating ? selectedRating.value : '',
      message: message.value.trim(),
      contact: document.getElementById('contact-permission').checked
    };
  }
  function showErrors(errors) {
    errorList.replaceChildren();
    for (const control of form.querySelectorAll('[aria-invalid]')) {
      control.removeAttribute('aria-invalid');
      control.classList.remove('error');
    }
    for (const error of form.querySelectorAll('.field-error')) error.classList.add('hidden');
    for (const error of errors) {
      const control = document.getElementById(error.id);
      const errorId = error.id === 'rating-1' ? 'rating-error' : error.id + '-error';
      const fieldError = document.getElementById(errorId);
      control.setAttribute('aria-invalid', 'true');
      control.classList.add('error');
      fieldError.textContent = error.message;
      fieldError.classList.remove('hidden');
      const row = document.getElementById('feedback-error-item').content.cloneNode(true);
      const link = row.querySelector('a');
      link.href = '#' + error.id;
      link.textContent = error.message;
      link.addEventListener('click', function (event) { event.preventDefault(); control.focus(); });
      errorList.append(row);
    }
    errorBox.classList.toggle('hidden', errors.length === 0);
  }
  function updateForm() {
    document.getElementById('visit-date').max = getShopClock(new Date()).date;
    counter.textContent = message.value.length;
    for (const radio of form.querySelectorAll('input[name="rating"]')) {
      radio.closest('label').classList.toggle('selected', radio.checked);
    }
    if (submitted) showErrors(validateFeedback(readFeedback(), getShopClock(new Date()).date));
  }
  form.addEventListener('input', updateForm);
  form.addEventListener('change', updateForm);
  updateForm();

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (stage !== 'editing') return;
    submitted = true;
    updateForm();
    const data = readFeedback();
    const errors = validateFeedback(data, getShopClock(new Date()).date);
    showErrors(errors);
    if (errors.length > 0) {
      document.getElementById(errors[0].id).focus();
      return;
    }
    draft = data;
    const item = feedbackMenu.find(function (item) { return item.id === data.item; });
    const values = {
      name: data.name, date: formatFeedbackDate(data.date), group: data.group,
      item: item ? item.name : 'Another item / not sure', rating: data.rating + ' / 5',
      message: data.message,
      contact: data.contact ? [data.email, data.phone].filter(Boolean).join(' · ') : 'Not included'
    };
    for (const key of Object.keys(values)) document.getElementById('feedback-review-' + key).textContent = values[key];
    form.classList.add('hidden');
    preview.classList.remove('hidden');
    stage = 'reviewing';
    preview.focus();
  });
  document.getElementById('feedback-edit').addEventListener('click', function () {
    stage = 'editing';
    preview.classList.add('hidden');
    form.classList.remove('hidden');
    document.getElementById('guest-name').focus();
  });
  document.getElementById('feedback-confirm').addEventListener('click', function () {
    if (stage !== 'reviewing' || !draft) return;
    stage = 'completed';
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    const item = feedbackMenu.find(function (item) { return item.id === draft.item; });
    reviews.push({
      id: reference + '-' + reviews.length, name: draft.name, text: draft.message,
      rating: Number(draft.rating), category: item ? item.name : 'Visit feedback',
      date: new Date().toISOString(), source: ''
    });
    const lines = ['Local feedback summary · ' + reference];
    for (const label of ['name', 'date', 'group', 'item', 'rating', 'message', 'contact']) {
      lines.push(label + ': ' + document.getElementById('feedback-review-' + label).textContent);
    }
    lines.push('Demo only. No data was sent to Kent Sandwich; no order, booking or payment was created.');
    shareText.value = lines.join('\n');
    document.getElementById('feedback-share').classList.remove('hidden');
    document.getElementById('feedback-confirmation-message').textContent =
      reference + ': your review was added to this page. Filters were reset so you can see it. Nothing was sent to Kent Sandwich.';
    resetFilters();
    dialog.close('complete');
    confirmation.focus();
  });

  function resetFeedbackView() {
    stage = 'editing';
    submitted = false;
    draft = null;
    copyVersion++;
    showErrors([]);
    preview.classList.add('hidden');
    form.classList.remove('hidden');
    document.getElementById('feedback-share').classList.add('hidden');
    copyStatus.classList.add('hidden');
    copyError.classList.add('hidden');
    copyButton.classList.remove('pending');
    copyButton.disabled = false;
    shareText.value = '';
    if (!dialog.open) dialog.show();
    updateForm();
    document.getElementById('guest-name').focus();
  }
  form.addEventListener('reset', function () {
    // Native reset finishes before the next task reads the fields.
    window.setTimeout(resetFeedbackView, 0);
  });
  document.getElementById('feedback-restart').addEventListener('click', function (event) {
    event.preventDefault();
    form.reset();
  });
  copyButton.addEventListener('click', async function () {
    const version = copyVersion;
    copyButton.disabled = true;
    copyButton.classList.add('pending');
    copyError.classList.add('hidden');
    copyStatus.classList.remove('hidden');
    copyStatus.textContent = 'Copying summary…';
    try {
      await navigator.clipboard.writeText(shareText.value);
      if (version === copyVersion) copyStatus.textContent = 'Summary copied. Nothing was sent to the shop.';
    } catch (error) {
      if (version === copyVersion) {
        copyStatus.textContent = 'Copy the selected summary manually.';
        copyError.classList.remove('hidden');
        shareText.focus();
        shareText.select();
      }
    } finally {
      if (version === copyVersion) {
        copyButton.disabled = false;
        copyButton.classList.remove('pending');
      }
    }
  });
}

if (document.body.dataset.page === 'feedback') {
  initTimurFeedback();
}

})();
