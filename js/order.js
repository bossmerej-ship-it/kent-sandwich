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
