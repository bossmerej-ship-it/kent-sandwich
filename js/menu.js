jQuery(function ($) {
    'use strict';

    const Kent = window.Kent;
    const board = $('.menu-board');
    const grid = $('.menu-board > .row');
    if (!Kent || !board.length || !grid.length) {
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
    basketLink.attr("href", 'order.html#order-cart');
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
        const column = create('div', 'col-12 col-sm-6 col-lg-3');
        const article = create('article', 'menu-card card h-100 border-dark border-2 rounded-0');
        article.attr("id", 'menu-item-' + item.id);
        article.attr("data-menu-item", item.id);
        const image = create('img', 'menu-card-photo border-bottom border-dark').attr({
            src: 'images/menu/' + item.id + '.webp',
            alt: item.imageAlt,
            width: 720,
            height: 480,
            loading: 'lazy'
        });
        const body = create('div', 'card-body d-flex flex-column p-3');
        const title = create('h3', 'h5 fw-bold card-title text-uppercase lh-1', item.name);
        const note = create('p', 'menu-note card-text text-body-secondary', item.description);
        const profileText = create('p', 'small text-body-secondary', 'Profile: ' + item.profile);
        const price = create('p', 'menu-price mt-auto fs-3 fw-bold mb-0', Kent.formatMoney(item.price));
        body.append(title, note, profileText, price);
        const selection = create('p', 'menu-item-quantity small mt-2 mb-2').attr('id', 'menu-quantity-' + item.id);
        const decrease = create('button', 'btn btn-outline-dark rounded-0 border-2 px-0 fs-5 lh-1 d-none', '−')
            .attr({
                type: 'button',
                'data-menu-quantity': 'decrease',
                'aria-label': 'Decrease ' + item.name + ' quantity',
                'aria-describedby': selection.attr('id')
            });
        const add = create('button', 'btn btn-dark rounded-0 border-2 fw-bold flex-grow-1', 'Add to basket')
            .attr({ type: 'button', 'data-menu-quantity': 'increase', 'aria-label': 'Add to basket: ' + item.name });
        body.append(selection, create('div', 'd-flex gap-2').append(decrease, add));
        article.append(image, body);
        column.append(article);
        return column;
    }

    // Basket changes update the existing controls without rebuilding the cards.
    function updateBasketSelection() {
        const basket = Kent.calculateCart(Kent.getCart());
        grid.find('.menu-card').each(function () {
            const card = $(this);
            const id = card.attr('data-menu-item');
            const item = Kent.getMenuItem(Kent.MENU, id);
            const quantity = basket.lines.find(function (line) { return line.item.id === id; })?.quantity ?? 0;
            const atLimit = quantity >= Kent.MAX_QUANTITY;
            const selection = card.find('.menu-item-quantity');
            const decrease = card.find('[data-menu-quantity="decrease"]');
            const add = card.find('[data-menu-quantity="increase"]');
            const focusAdd = quantity === 0 && (decrease.is(':focus') || selection.is(':focus'));
            const focusStatus = atLimit && add.is(':focus');
            selection.text(quantity > 0
                ? quantity + ' in your basket' + (atLimit ? ' · Limit reached' : '')
                : '');
            selection.toggleClass('fw-bold', quantity > 0);
            card.toggleClass('is-selected', quantity > 0);
            decrease.toggleClass('d-none', quantity === 0);
            add.text(quantity > 0 ? quantity + ' +' : 'Add to basket')
                .attr('aria-label', quantity > 0 ? 'Add one more ' + item.name + ' to basket' : 'Add to basket: ' + item.name);
            if (quantity) add.attr('aria-describedby', selection.attr('id'));
            else add.removeAttr('aria-describedby');
            add.prop('disabled', atLimit);
            if (focusAdd) add.trigger('focus');
            if (focusStatus) selection.attr('tabindex', '-1').trigger('focus');
        });
        basketLink.text('Review basket (' + basket.quantity + ') · ' + Kent.formatMoney(basket.total) + ' →');
    }

    // Rewrite 1: .val(), .empty(), .append() and .on() replace value, replaceChildren and native listeners.
    // Selection/rendering is shorter; filtering and sorting calculations are deliberately unchanged.
    function applyFilters(resetMessage) {
        const maxPrice = budget.val() === '' ? Infinity : Number(budget.val());
        const filtered = Kent.filterMenu(Kent.MENU, search.val(), profile.val(), maxPrice);
        const results = sortedResults(filtered, sorting.val());
        grid.empty();
        results.forEach(function (item) {
            grid.append(renderMenuCard(item));
        });
        empty.toggleClass('is-hidden', results.length > 0);
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
    grid.on('click', 'button[data-menu-quantity]', function () {
        const button = $(this);
        const id = button.closest('.menu-card').attr('data-menu-item');
        let result;
        if (button.attr('data-menu-quantity') === 'decrease') {
            const entry = Kent.getCart().find(function (line) { return line.id === id; });
            if (!entry) return;
            result = Kent.setQuantity(id, entry.quantity - 1);
        } else {
            result = Kent.addToCart(id);
        }
        feedback.toggleClass('text-danger', !result.ok);
        showBasketFeedback(result.message);
    });

    applyFilters(false);
    Kent.onCartChange(updateBasketSelection);
});
