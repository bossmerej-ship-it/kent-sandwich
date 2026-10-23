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
