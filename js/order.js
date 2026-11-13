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

  Kent.validatePickup = validatePickup;

  // Kazakhstan numbering plan: https://www.itu.int/oth/T020200006F/en
  // Additional network codes cross-checked against published KZ numbering metadata.
  const phoneNetworkCodes = new Set([
    '700', '701', '702', '705', '706', '707', '708', '747', '751', '753',
    '760', '761', '762', '763', '764', '771', '775', '776', '777', '778', '785', '790'
  ]);
  const landlinePrefix = /^(?:71[0-68][2-9]|7172|72[1-9][2-9])/;

  function validatePhone(value) {
    const phone = String(value).trim();
    if (!phone) return 'Enter your phone number.';
    if (!/^\+?(?:\d|\(\d+\))(?:[\s-]*(?:\d|\(\d+\)))*$/.test(phone)) {
      return 'Use digits, spaces, parentheses or hyphens. A plus sign can only go at the start.';
    }

    const compact = phone.replace(/[\s()-]/g, '');
    const match = compact.match(/^(?:\+7|[78])?(\d{10})$/);
    if (!match) return 'Enter a Kazakhstan phone number, for example +7 7XX XXX XX XX.';

    const national = match[1];
    if (!phoneNetworkCodes.has(national.slice(0, 3)) && !landlinePrefix.test(national)) {
      return 'Check the mobile or area code and enter a Kazakhstan phone number.';
    }
    return '';
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
      ? '' : 'Enter a valid email address, for example name@example.com.';
  }
  Kent.validatePhone = validatePhone;
  Kent.validateEmail = validateEmail;

  // Rewrite 3: .val(), .prop(), .toggleClass() and .on() replace native form reads, classes and listeners.
  // DOM work is clearer, but validation/reset/recovery rules still need explicit code, so not all of it is shorter.
  jQuery(function ($) {
    const form = $('#order-form');
    if (!form.length) return;
    const create = Kent.element;
    const name = $('#customer-name');
    const date = $('#pickup-date');
    const time = $('#pickup-time');
    const note = $('#order-note');
    const request = $('#contact-request');
    const submit = $('#submit-order');
    const errorSummary = $('#order-error');
    const confirmation = $('#order-confirmation');
    const fields = form.find('#customer-name, #customer-phone, #customer-email, #pickup-date, #pickup-time, #contact-method, #order-note');
    const touched = new Set();
    const messages = new Map();
    const choiceGrid = form.find('.choice-grid');
    const choices = Kent.MENU.map(function (item) {
      const id = 'item-' + item.id;
      const checkbox = create('input', 'form-check-input flex-shrink-0 mt-0')
        .attr({ id, type: 'checkbox', name: 'items', value: item.id });
      const description = create('span', '').append(
        create('span', 'd-block fw-semibold', item.name),
        create('span', 'd-block small text-body-secondary', Kent.formatMoney(item.price))
      );
      const label = create('label', 'form-check-label d-flex align-items-center gap-2')
        .attr('for', id).append(checkbox, description);
      const minus = create('button', 'btn btn-outline-dark rounded-0 p-0 fs-5 lh-1', '−')
        .attr({ type: 'button', 'data-quantity-step': '-1', 'aria-label': 'Decrease ' + item.name + ' quantity' });
      const plus = create('button', 'btn btn-outline-dark rounded-0 p-0 fs-5 lh-1', '+')
        .attr({ type: 'button', 'data-quantity-step': '1', 'aria-label': 'Increase ' + item.name + ' quantity' });
      const quantity = create('output', 'd-flex align-items-center justify-content-center px-1 fw-semibold', '0')
        .attr({ id: 'quantity-' + item.id, tabindex: '-1', 'aria-live': 'off' });
      const stepper = create('div', 'order-quantity d-inline-flex flex-shrink-0 ms-auto')
        .attr({ role: 'group', 'aria-label': item.name + ' quantity' }).append(minus, quantity, plus);
      const tile = create('div', 'choice-card d-flex flex-wrap align-items-center gap-2 border rounded-0 px-2 px-sm-3 py-3 h-100')
        .attr('data-menu-item', item.id).append(label, stepper);
      create('div', 'col-12 col-md-6').append(tile).appendTo(choiceGrid);
      return { id: item.id, checkbox, tile, minus, quantity, plus };
    });
    let resetting = false;
    let confirmed = false;
    let submitted = false;
    let lastSnapshot = null;

    // Retain native field types and limits, but show our own nearby errors.
    // Client checks can be bypassed; a real server must validate everything again before accepting an order.
    form.prop('noValidate', true);
    submit.attr('type', 'submit').text('Prepare demo order');
    name.attr('maxlength', 80);
    date.attr('min', getShopClock(new Date()).date);
    request.siblings('span').text('Include my contact preference in the demo summary.');
    $('.order-summary dt').filter(function () {
      return $(this).text() === 'Online form';
    }).next('dd').text('Prepare a demo pickup summary on this page.');

    function value(id) { return String($('#' + id).val() || '').trim(); }

    function appendDescription(control, id) {
      const ids = new Set((control.attr('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(id);
      control.attr('aria-describedby', Array.from(ids).join(' '));
    }

    function removeDescription(control, id) {
      const ids = (control.attr('aria-describedby') || '').split(/\s+/)
        .filter(function (entry) { return entry && entry !== id; });
      if (ids.length) control.attr('aria-describedby', ids.join(' '));
      else control.removeAttr('aria-describedby');
    }

    function prepareError(control) {
      const id = control.attr('id');
      const message = create('span', 'd-block small mt-1 text-danger is-hidden').attr('id', id + '-error');
      control.after(message);
      messages.set(id, message);
    }
    fields.each(function () { prepareError($(this)); });

    function showFieldError(control, error, showSuccess) {
      const message = messages.get(control.attr('id'));
      message.text(error).toggleClass('is-hidden', !error);
      control.toggleClass('is-error', Boolean(error)).toggleClass('is-success', !error && Boolean(showSuccess));
      if (error) {
        control.attr('aria-invalid', 'true');
        appendDescription(control, message.attr('id'));
      } else {
        control.removeAttr('aria-invalid');
        removeDescription(control, message.attr('id'));
      }
    }

    const selectionError = create('p', 'form-message is-error small mt-2 is-hidden')
      .attr('id', 'selection-error').appendTo(form.find('fieldset').first());
    function showSelectionError() {
      const empty = form.find('[name="items"]:checked').length === 0;
      selectionError.text(empty ? 'Choose at least one sandwich.' : '').toggleClass('is-hidden', !empty);
      choices.forEach(function (choice) {
        choice.checkbox.toggleClass('is-error', empty);
        if (empty) {
          choice.checkbox.attr('aria-invalid', 'true');
          appendDescription(choice.checkbox, 'selection-error');
        } else {
          choice.checkbox.removeAttr('aria-invalid');
          removeDescription(choice.checkbox, 'selection-error');
        }
      });
      return empty;
    }

    const noteCounter = create('span', 'd-block small mt-1').attr('id', 'order-note-count').insertAfter(note);
    appendDescription(note, noteCounter.attr('id'));

    // .html() is appropriate for this fixed, trusted emphasis; visitor values always use .text().
    const demoNotice = create('p', 'form-text mb-3').attr('id', 'order-demo-notice')
      .html('<strong>Demo only:</strong> your details stay on this page. No order, payment or contact request is sent to the shop.')
      .insertBefore(submit);
    appendDescription(submit, demoNotice.attr('id'));
    const draft = create('section', 'border border-dark p-3 mb-4').attr('aria-labelledby', 'pickup-draft-title');
    const draftTitle = create('h3', 'h5 fw-bold', 'Your demo draft').attr('id', 'pickup-draft-title');
    const draftText = create('p', 'mb-2');
    const availability = create('p', 'small mb-0', 'Pickup times: 09:30–21:15, Astana time. Choose a future date and time.');
    draft.append(draftTitle, draftText, availability).appendTo(form.find('fieldset').eq(1));
    const submitHint = create('p', 'form-text mb-3').attr('id', 'order-submit-hint').insertBefore(submit);
    appendDescription(submit, submitHint.attr('id'));

    function updateDraft() {
      const basket = Kent.calculateCart(Kent.getCart());
      const selection = basket.quantity + (basket.quantity === 1 ? ' sandwich' : ' sandwiches') + ' · ' + Kent.formatMoney(basket.total);
      draftText.text(selection + (date.val() && time.val()
        ? ' · Pickup ' + date.val() + ' at ' + time.val() + ' (Astana).' : ' · Pickup not selected yet.'));
      noteCounter.text(String(note.val()).length + ' / 240 characters');
      submit.prop('disabled', basket.quantity === 0 || confirmed);
      submitHint.text(confirmed ? 'Demo prepared. The form and basket are cleared. Use Edit details to restore this draft.'
        : basket.quantity === 0 ? 'Choose at least one sandwich to prepare a demo order.'
          : 'Review your basket and pickup details, then prepare the demo summary.');
    }

    function invalidateConfirmation() {
      if (!confirmed) return;
      confirmed = false;
      lastSnapshot = null;
      confirmation.stop(true, true).addClass('is-hidden').empty();
      Kent.announce('The previous demo summary was cleared. Review your changes and prepare it again.');
    }

    function getQuantity(cart, id) {
      const line = cart.find(function (entry) { return entry.id === id; });
      return line ? line.quantity : 0;
    }

    function syncChoices() {
      const cart = Kent.getCart();
      choices.forEach(function (choice) {
        const count = getQuantity(cart, choice.id);
        const atMin = count === 0;
        const atMax = count === Kent.MAX_QUANTITY;
        const reachedLimit = (atMin && choice.minus.is(':focus')) || (atMax && choice.plus.is(':focus'));
        // .prop('checked') updates the live state; the basket owns the quantity.
        choice.checkbox.prop('checked', !atMin);
        choice.tile.toggleClass('is-selected', !atMin);
        choice.quantity.text(count);
        choice.minus.prop('disabled', atMin);
        choice.plus.prop('disabled', atMax);
        if (reachedLimit) choice.quantity.trigger('focus');
      });
      updateDraft();
    }

    function fieldErrors() {
      const errors = new Map();
      const customer = value('customer-name');
      errors.set('customer-name', customer.length < 2 || customer.length > 80
        ? 'Enter a name with 2 to 80 characters, excluding surrounding spaces.' : '');
      errors.set('customer-phone', validatePhone(value('customer-phone')));
      errors.set('customer-email', validateEmail(value('customer-email')) ||
        ($('#customer-email').prop('validity').typeMismatch ? 'Enter a valid email address.' : ''));
      const pickup = validatePickup(value('pickup-date'), value('pickup-time'));
      errors.set('pickup-date', pickup.date);
      errors.set('pickup-time', pickup.time);
      const method = value('contact-method');
      errors.set('contact-method', method === 'phone' || method === 'whatsapp' ? '' : 'Choose phone call or WhatsApp.');
      errors.set('order-note', value('order-note').length <= 240 ? '' : 'Keep your note within 240 characters.');
      return errors;
    }

    function updateTouchedErrors() {
      const errors = fieldErrors();
      errors.forEach(function (error, id) {
        if (touched.has(id)) {
          const control = $('#' + id);
          showFieldError(control, error, Boolean(value(id)) && !control.prop('disabled'));
        }
      });
      if (submitted) {
        const count = Array.from(errors.values()).filter(Boolean).length;
        const empty = showSelectionError();
        errorSummary.text(empty ? 'Choose at least one sandwich and check the highlighted fields.'
          : count ? 'Please correct the highlighted fields before preparing your demo order.' : '')
          .toggleClass('is-hidden', !empty && count === 0);
      }
    }

    choiceGrid.on('click', 'button[data-quantity-step]', function () {
      const button = $(this);
      const id = button.closest('[data-menu-item]').attr('data-menu-item');
      const count = getQuantity(Kent.getCart(), id) + Number(button.attr('data-quantity-step'));
      Kent.announce(Kent.setQuantity(id, count).message);
    });
    choiceGrid.on('change', 'input[name="items"]', function () {
      const checkbox = $(this);
      Kent.announce(Kent.setQuantity(checkbox.val(), checkbox.prop('checked') ? 1 : 0).message);
    });
    form.on('input change', 'input:not([name="items"]), select, textarea', function (event) {
      invalidateConfirmation();
      const id = $(this).attr('id');
      if (event.type === 'change' && messages.has(id)) touched.add(id);
      updateTouchedErrors();
      updateDraft();
    });
    form.on('focusout', 'input, select, textarea', function () {
      const id = $(this).attr('id');
      if (!messages.has(id)) return;
      touched.add(id);
      updateTouchedErrors();
    });

    function captureSnapshot(basket) {
      const values = {};
      fields.each(function () { values[$(this).attr('id')] = String($(this).val()).trim(); });
      return { basket: basket, values: values, request: request.prop('checked') };
    }

    function resetDraft(keepConfirmation) {
      resetting = true;
      submitted = false;
      touched.clear();
      form.find('input, textarea').each(function () {
        const control = $(this);
        if (control.is(':checkbox')) control.prop('checked', control.prop('defaultChecked'));
        else control.val(control.prop('defaultValue'));
      });
      form.find('select').each(function () {
        const control = $(this);
        const defaults = control.find('option').filter(function () { return $(this).prop('defaultSelected'); });
        control.val((defaults.length ? defaults.first() : control.find('option').first()).val());
      });
      messages.forEach(function (message, id) { showFieldError($('#' + id), '', false); });
      selectionError.addClass('is-hidden').text('');
      choices.forEach(function (choice) {
        choice.checkbox.removeClass('is-error').removeAttr('aria-invalid');
        removeDescription(choice.checkbox, 'selection-error');
      });
      errorSummary.addClass('is-hidden').text('');
      if (!keepConfirmation) invalidateConfirmation();
      date.attr('min', getShopClock(new Date()).date);
      Kent.clearCart();
      syncChoices();
      resetting = false;
    }

    function addSummaryLine(list, label, text) {
      list.append(create('dt', 'fw-semibold mt-2', label), create('dd', 'mb-1 text-break', text));
    }

    function showConfirmation(snapshot) {
      confirmed = true;
      lastSnapshot = snapshot;
      const basket = snapshot.basket;
      const values = snapshot.values;
      const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
      const heading = create('h3', 'h4 fw-bold', 'Demo order prepared · ' + reference);
      const notice = create('p', 'fw-semibold', 'This is a local demonstration. Nothing was sent to the shop. No real order or payment was made.');
      const lines = create('ul', 'mb-3');
      basket.lines.forEach(function (line) {
        lines.append(create('li', '', line.item.name + ' × ' + line.quantity + ' — ' + Kent.formatMoney(line.subtotal)));
      });
      const total = create('p', 'fw-bold', 'Total: ' + Kent.formatMoney(basket.total) +
        ' · ' + basket.quantity + (basket.quantity === 1 ? ' sandwich' : ' sandwiches'));
      const details = create('dl', 'mb-3');
      addSummaryLine(details, 'Name', values['customer-name']);
      addSummaryLine(details, 'Phone', values['customer-phone']);
      addSummaryLine(details, 'Email', values['customer-email']);
      addSummaryLine(details, 'Pickup in Astana', values['pickup-date'] + ' at ' + values['pickup-time']);
      addSummaryLine(details, 'Contact preference', snapshot.request
        ? (values['contact-method'] === 'whatsapp' ? 'WhatsApp' : 'Phone call') + ' requested in this demo only. No message will be sent.'
        : 'No reply requested.');
      addSummaryLine(details, 'Note', values['order-note'] || 'No extra note.');
      const edit = create('button', 'btn btn-outline-dark rounded-0 me-2 mb-2', 'Edit details')
        .attr({ type: 'button', 'data-demo-action': 'edit' });
      const start = create('button', 'btn btn-dark rounded-0 mb-2', 'Start new demo')
        .attr({ type: 'button', 'data-demo-action': 'new' });
      confirmation.stop(true, true).empty().append(heading, notice, lines, total, details, edit, start)
        .attr('tabindex', '-1').removeClass('is-hidden').hide()
        .slideDown(Kent.effectDuration(), function () {
          // Focus only after the summary is visible; the snapshot survives the form reset.
          if (confirmed) $(this).trigger('focus');
        });
      updateDraft();
    }

    // Delegation works for confirmation buttons that are created only after a successful submit.
    confirmation.on('click', 'button[data-demo-action]', function () {
      const action = $(this).attr('data-demo-action');
      if (action === 'new') {
        form.trigger('reset');
        return;
      }
      const snapshot = lastSnapshot;
      if (!snapshot) return;
      invalidateConfirmation();
      resetting = true;
      Object.entries(snapshot.values).forEach(function (entry) { $('#' + entry[0]).val(entry[1]); });
      request.prop('checked', snapshot.request);
      Kent.replaceCart(snapshot.basket.lines.map(function (line) {
        return { id: line.item.id, quantity: line.quantity };
      }));
      resetting = false;
      syncChoices();
      name.trigger('focus');
    });

    form.on('submit', function (event) {
      // Without preventDefault the browser would navigate/submit contact details; this is a local demo.
      event.preventDefault();
      if (confirmed) return;
      fields.each(function () { $(this).val(String($(this).val() || '').trim()); });
      date.attr('min', getShopClock(new Date()).date);
      submitted = true;
      const errors = fieldErrors();
      errors.forEach(function (error, id) {
        const control = $('#' + id);
        touched.add(id);
        showFieldError(control, error, Boolean(value(id)) && !control.prop('disabled'));
      });
      const noSelection = showSelectionError();
      const firstInvalid = form.find('input, select, textarea').filter(function () {
        return Boolean(errors.get($(this).attr('id')));
      }).first();
      const basket = Kent.calculateCart(Kent.getCart());
      if (noSelection || firstInvalid.length || basket.quantity === 0) {
        errorSummary.text(noSelection ? 'Choose at least one sandwich, then check the highlighted fields.'
          : 'Please correct the highlighted fields before preparing your demo order.').removeClass('is-hidden');
        (noSelection ? choices[0].checkbox : firstInvalid).trigger('focus');
        return;
      }
      const snapshot = captureSnapshot(basket);
      resetDraft(true);
      showConfirmation(snapshot);
    });

    form.on('reset', function (event) {
      // Native reset runs after this handler; cancel it to avoid overwriting our synchronous cart sync.
      event.preventDefault();
      resetDraft(false);
      Kent.announce('Demo draft cleared, including basket and pickup details.');
      choices[0].checkbox.trigger('focus');
    });

    Kent.onCartChange(function () {
      if (resetting) return;
      invalidateConfirmation();
      syncChoices();
      updateTouchedErrors();
    });
    syncChoices();
  });
})();
