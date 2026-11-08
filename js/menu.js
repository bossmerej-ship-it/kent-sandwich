jQuery(function ($) {
    'use strict';

    const Kent = window.Kent;
    const board = $('.menu-board');
    const grid = $('.menu-board > .row');
    const tableBody = $('#menu-price-rows');
    if (!Kent || !board.length || !grid.length || !tableBody.length) {
        return;
    }

    const create = Kent.element;
    const form = create('form', 'mb-4');
    form.attr('aria-label', 'Filter the sandwich menu');
    const fieldset = create('fieldset');
    const legend = create('legend', 'h4 fw-bold mb-3', 'Find your sandwich');
    const controls = create('div', 'row g-3');

    function addControl(labelText, control, classes) {
        const column = create('div', classes);
        const label = create('label', 'form-label fw-semibold', labelText);
        label.attr('for', control.attr('id'));
        column.append(label, control);
        controls.append(column);
        return control;
    }

    function addOption(select, value, label) {
        const option = create('option', '', label);
        option.val(value);
        select.append(option);
    }

    const search = create('input', 'form-control rounded-0');
    search.attr("id", 'menu-search');
    search.attr("type", 'search');
    search.attr("name", 'search');
    search.attr("maxlength", 100);
    search.attr("placeholder", 'Name or description');
    addControl('Search sandwiches', search, 'col-12 col-md-6');

    const profile = create('select', 'form-select rounded-0');
    profile.attr("id", 'menu-profile');
    profile.attr("name", 'profile');
    addOption(profile, '', 'All profiles');
    const profiles = Array.from(new Set(Kent.MENU.map(function (item) {
        return item.profile;
    })));
    profiles.forEach(function (value) {
        addOption(profile, value, value);
    });
    addControl('Sandwich profile', profile, 'col-12 col-sm-6 col-md-3');

    const budget = create('select', 'form-select rounded-0');
    budget.attr("id", 'menu-max-price');
    budget.attr("name", 'maxPrice');
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
    sorting.attr("id", 'menu-sort');
    sorting.attr("name", 'sort');
    addOption(sorting, 'menu', 'Menu order');
    addOption(sorting, 'price-asc', 'Price: low to high');
    addOption(sorting, 'price-desc', 'Price: high to low');
    addOption(sorting, 'name', 'Name: A to Z');
    addControl('Sort results', sorting, 'col-12 col-sm-6 col-md-4');

    const resetColumn = create('div', 'col-12 col-sm-6 col-md-4 d-flex align-items-end');
    const reset = create('button', 'btn btn-outline-dark rounded-0 border-2', 'Reset filters');
    reset.attr("type", 'reset');
    resetColumn.append(reset);
    controls.append(resetColumn);
    fieldset.append(legend, controls);
    form.append(fieldset);

    const summary = create('div', 'd-flex flex-wrap align-items-center justify-content-between gap-2 mb-3');
    const count = create('p', 'mb-0 fw-semibold');
    count.attr("id", 'menu-result-count');
    count.attr('role', 'status');
    count.attr('aria-atomic', 'true');
    const basketLink = create('a', 'link-dark fw-bold');
    basketLink.attr("href", 'order.html');
    summary.append(count, basketLink);

    const feedback = create('p', 'small mb-3');
    feedback.attr('role', 'status');
    feedback.attr('aria-atomic', 'true');
    const empty = create('div', 'form-message is-hidden');
    const emptyHeading = create('h3', 'h5 fw-bold', 'No sandwiches match these filters.');
    const emptyHelp = create('p', 'mb-0', 'Try a different search, increase the maximum price, or reset the filters.');
    empty.append(emptyHeading, emptyHelp);
    controls.attr('id', 'menu-filter-controls');
    const toggle = create('button', 'btn btn-outline-dark rounded-0 mb-3', 'Hide filters')
        .attr({ type: 'button', 'aria-controls': 'menu-filter-controls', 'aria-expanded': 'true' });
    legend.after(toggle);
    toggle.on('click', function () {
        const button = $(this);
        controls.stop(true, true);
        const expanded = button.attr('aria-expanded') !== 'true';
        button.attr('aria-expanded', String(expanded)).text(expanded ? 'Hide filters' : 'Show filters');
        if (!expanded) button.trigger('focus');
        controls.slideToggle(Kent.effectDuration(), function () {
            if (expanded) search.trigger('focus');
        });
    });
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
        article.attr("id", 'menu-item-' + item.id);
        article.attr("data-menu-item", item.id);
        article.attr("data-price", String(item.price));
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
        selection.attr("data-basket-quantity", item.id);
        const add = create('button', 'btn btn-dark rounded-0 border-2 fw-bold', 'Add to basket');
        add.attr("type", 'button');
        add.attr("data-add-item", item.id);
        add.attr('aria-label', 'Add ' + item.name + ' to basket');
        body.append(selection, add);
        article.append(body);
        column.append(article);
        return column;
    }

    function renderPriceRow(item) {
        const row = create('tr');
        row.attr("id", 'price-row-' + item.id);
        row.attr("data-menu-item", item.id);
        row.attr("data-price", String(item.price));
        const number = create('th', '', menuNumber(item));
        number.attr("scope", 'row');
        row.append(number, create('td', '', item.name), create('td', '', item.profile), create('td', '', Kent.formatMoney(item.price)));
        return row;
    }

    // Update existing nodes only, preserving keyboard focus on the Add button.
    function updateBasketSelection() {
        const cart = Kent.getCart();
        grid.find('[data-basket-quantity]').each(function () {
            const label = $(this);
            const entry = cart.find(function (line) {
                return line.id === label.attr('data-basket-quantity');
            });
            const quantity = entry ? entry.quantity : 0;
            label.text(quantity > 0 ? quantity + ' in your basket' : 'Not in your basket yet');
            label.closest('.menu-card').toggleClass('is-selected', quantity > 0);
        });
        const basket = Kent.calculateCart(cart);
        basketLink.text('Review basket (' + basket.quantity + ') · ' + Kent.formatMoney(basket.total) + ' →');
    }

    // Rewrite 1: .val(), .empty(), .append() and .on() replace value, replaceChildren and native listeners.
    // Selection/rendering is shorter; filtering and sorting calculations are deliberately unchanged.
    function applyFilters(resetMessage) {
        const maxPrice = budget.val() === '' ? Infinity : Number(budget.val());
        const filtered = Kent.filterMenu(Kent.MENU, search.val(), profile.val(), maxPrice);
        const results = sortedResults(filtered, sorting.val());
        grid.empty();
        tableBody.empty();
        results.forEach(function (item) {
            grid.append(renderMenuCard(item));
            tableBody.append(renderPriceRow(item));
        });
        empty.toggleClass('is-hidden', results.length > 0);
        if (results.length === 0) {
            const row = create('tr');
            const cell = create('td', 'text-center py-4', 'No sandwiches match the selected filters.');
            cell.attr("colspan", 4);
            row.append(cell);
            tableBody.append(row);
        }
        const priceHint = results.length
            ? ' Lowest price: ' + Kent.formatMoney(Math.min(...results.map(item => item.price))) + '.'
            : '';
        count.text((resetMessage ? 'Filters reset. ' : '') + 'Showing ' + results.length + ' of ' +
            Kent.MENU.length + ' sandwiches.' + priceHint);
        feedback.stop(true, true).text('');
        feedback.removeClass('text-danger');
        updateBasketSelection();
    }

    search.on('input', function () { applyFilters(false); });
    [profile, budget, sorting].forEach(function (control) {
        control.on('change', function () { applyFilters(false); });
    });
    form.on('submit', function (event) {
        // Without this, pressing Enter would submit/navigate instead of filtering this page.
        event.preventDefault();
        applyFilters(false);
    });
    form.on('reset', function (event) {
        // Cancel the later native reset so it cannot overwrite the filters we update synchronously.
        event.preventDefault();
        search.val('');
        profile.val('');
        budget.val('');
        sorting.val('menu');
        applyFilters(true);
        search.trigger('focus');
    });
    function showBasketFeedback(message) {
        // Chain: stop finishes old effects; hide prepares the reveal; text safely writes the result;
        // fadeIn shows the response to this Add action, with a duration that respects reduced motion.
        feedback.stop(true, true).hide().text(message).fadeIn(Kent.effectDuration());
    }

    // Delegation stays on the existing grid; direct handlers would miss cards rebuilt by filtering.
    grid.on('click', 'button[data-add-item]', function () {
        const button = $(this);
        const item = Kent.getMenuItem(Kent.MENU, button.attr('data-add-item'));
        const result = Kent.addToCart(item.id);
        feedback.toggleClass('text-danger', !result.ok);
        if (!result.ok) {
            showBasketFeedback(result.message);
            return;
        }
        const basket = Kent.calculateCart(Kent.getCart());
        const unit = basket.quantity === 1 ? ' sandwich' : ' sandwiches';
        showBasketFeedback(item.name + ' added. Basket: ' + basket.quantity + unit + ', ' + Kent.formatMoney(basket.total) + '. Review your basket to adjust quantities.');
    });

    applyFilters(false);
    Kent.onCartChange(updateBasketSelection);
});
