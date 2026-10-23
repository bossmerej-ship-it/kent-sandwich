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
