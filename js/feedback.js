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

// This page's view uses jQuery exclusively; shared time calculations stay native.
function createTimurElement(tag, classes, text) {
  const element = jQuery('<' + tag + '>').addClass(classes || '');
  if (text !== undefined) element.text(text);
  return element;
}

function timurEffectDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
}

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
  if (data.item && !feedbackMenu.some(function (item) { return item.id === data.item; })) {
    errors.push({ id: 'ordered-item', message: 'Choose a listed sandwich or Another item / not sure.' });
  }
  if (data.message.trim().length < 20 || data.message.trim().length > 600) {
    errors.push({ id: 'guest-message', message: 'Write 20–600 characters after trimming spaces.' });
  }
  if (data.contact && !data.email && !data.phone) {
    errors.push({ id: 'contact-permission', message: 'Add an email or phone number, or untick this box.' });
  }
  return errors;
}

function filterFeedback(reviews, query, rating, order, item) {
  const search = query.trim().toLowerCase();
  const result = reviews.filter(function (review) {
    const text = (review.name + ' ' + review.text + ' ' + review.category).toLowerCase();
    const matchesRating = rating === '' ||
      (rating === 'unrated' ? review.rating === null : review.rating === Number(rating));
    const matchesItem = !item || (item === 'unspecified' ? !review.item : review.item === item);
    return text.includes(search) && matchesRating && matchesItem;
  });
  result.sort(function (left, right) {
    if (order === 'highest' || order === 'lowest') {
      if (left.rating === null && right.rating !== null) return 1;
      if (right.rating === null && left.rating !== null) return -1;
      const difference = order === 'highest' ? right.rating - left.rating : left.rating - right.rating;
      if (difference !== 0) return difference;
    }
    if (order === 'oldest') return new Date(left.date) - new Date(right.date);
    return new Date(right.date) - new Date(left.date);
  });
  return result;
}

function getFeedbackItemName(id) {
  const item = feedbackMenu.find(function (entry) { return entry.id === id; });
  return item ? item.name : 'Another item / not sure';
}

function createFeedbackSummary(data, reference) {
  const contact = data.contact ? [data.email, data.phone].filter(Boolean).join(' · ') : 'Not included';
  return [
    'Local feedback summary · ' + reference,
    'Name: ' + data.name,
    'Visit date: ' + formatFeedbackDate(data.date),
    'Group size: ' + data.group,
    'Sandwich: ' + getFeedbackItemName(data.item),
    'Rating: ' + data.rating + ' / 5',
    'Feedback: ' + data.message,
    'Contact details: ' + contact,
    'Local copy only. This feedback was not sent to Kent Sandwich; no order, booking or payment was created.'
  ].join('\n');
}

// .append(), .text() and .attr() replace createElement and DOM assignments.
// The card builder is shorter, while the filtering calculations stay plain JavaScript.
function renderFeedbackCard(review) {
  const card = createTimurElement('article', 'border border-2 rounded-0 p-3 p-md-4 mb-3 bg-white text-break');
  card.attr('id', 'review-' + review.id);
  card.append(createTimurElement('h3', 'h5 fw-bold', review.name));
  const rating = review.rating === null ? 'Rating not provided' : review.rating + ' / 5';
  card.append(createTimurElement('p', 'small mb-2', rating + ' · ' + review.category));
  const text = createTimurElement('p', 'feedback-message', review.text);
  if (review.language) text.attr('lang', review.language);
  card.append(text);
  const date = createTimurElement('time', 'small d-block mb-2', formatFeedbackDate(review.date));
  date.attr('datetime', review.date);
  card.append(date);
  if (review.visitDate) {
    const detailsId = 'review-details-' + review.id;
    const toggle = createTimurElement('button', 'btn btn-outline-dark btn-sm rounded-0 mb-2', 'Show visit details');
    toggle.attr({ type: 'button', 'data-review-details': '', 'aria-expanded': 'false', 'aria-controls': detailsId });
    const details = createTimurElement('p', 'review-details hidden small',
      'Visited ' + formatFeedbackDate(review.visitDate) + ' · Group size: ' + review.group + '.');
    details.attr('id', detailsId);
    card.append(toggle, details);
  }
  if (review.source) {
    const source = createTimurElement('a', 'link-dark small', 'Original review on 2GIS ↗');
    source.attr('href', review.source);
    source.attr('target', '_blank');
    source.attr('rel', 'noopener noreferrer');
    card.append(source);
  } else {
    card.append(createTimurElement('p', 'small mb-0', 'Local demo review — not sent to the shop.'));
  }
  return card;
}

// jQuery 3.7.1 ready ensures the form exists before handlers are attached.
jQuery(function ($) {
  if ($('body').attr('data-page') !== 'feedback') return;
  const form = $('#feedback-form');
  const dialog = $('#feedback-dialog');
  const preview = $('#feedback-review');
  const confirmation = $('#feedback-confirmation');
  const message = $('#guest-message');
  const counter = $('#feedback-character-count');
  const errorList = $('#feedback-error-list');
  const errorBox = $('#feedback-errors');
  const shareText = $('#feedback-share-text');
  const copyButton = $('#feedback-copy');
  const copyStatus = $('#feedback-copy-status');
  const copyError = $('#feedback-copy-error');
  const itemSelect = $('#ordered-item');
  const clearEmail = createTimurElement('button', 'btn btn-outline-dark btn-sm rounded-0 mt-2', 'Clear email');
  clearEmail.attr({ id: 'feedback-clear-email', type: 'button' }).insertAfter($('#guest-email'));
  clearEmail.on('click', function () {
    $('#guest-email').val('').trigger('input').trigger('focus');
  });
  const itemError = createTimurElement('p', 'field-error hidden small mt-1 mb-0');
  itemError.attr('id', 'ordered-item-error').insertAfter(itemSelect);
  itemSelect.attr('aria-describedby', 'ordered-item-error');
  const download = createTimurElement('a', 'btn btn-outline-dark rounded-0 border-2 ms-2 hidden', 'Save summary as text');
  download.attr('id', 'feedback-download').insertAfter(copyButton);
  let stage = 'editing';
  let draft = null;
  let submitted = false;
  let copyVersion = 0;
  let summaryUrl = null;

  // Retain HTML constraints; custom errors replace native popups after enhancement.
  // Browser checks can be bypassed: a real server must validate all values again.
  form.prop('noValidate', true);
  // Delegation catches links created on each validation attempt; a direct binding
  // now would miss them because the error list is initially empty.
  errorList.on('click', 'a[href^="#"]', function (event) {
    event.preventDefault(); // Keep focus on the field instead of only jumping to an anchor.
    $($(this).attr('href')).trigger('focus');
  });
  $('#feedback-count-row').removeClass('hidden');
  $('#submission-note').text(
    'Review your feedback, then confirm it on this page. Nothing is sent to the shop.');
  $('#feedback-submit').text('Review feedback');
  itemSelect.empty().append(createTimurElement('option', '', 'Another item / not sure').val(''));
  for (const item of feedbackMenu) {
    const option = createTimurElement('option', '', item.name + ' — ' + item.price + ' ₸ · ' + item.profile);
    option.val(item.id);
    itemSelect.append(option);
  }

  // Preserve the actual existing review. Its source does not specify a rating.
  const quote = $('.feedback-prompt blockquote');
  const reviews = [{
    id: 'source', name: quote.find('cite').clone().children().remove().end().text().trim().replace(/[,\s—–-]+$/, ''),
    text: quote.find('q').text(), language: quote.find('q').attr('lang'),
    rating: null, category: 'Source review',
    date: quote.find('time').attr('datetime'), source: quote.find('a').attr('href')
  }];
  quote.remove();

  // Chain: attr applies existing classes, html adds fixed emphasis, appendTo places the notice.
  // Never pass visitor text to html(); text() displays it without interpreting markup.
  $('<p>').attr('class', 'small').html('<strong>Local demo.</strong> Reviews are not sent to the shop.').appendTo($('.feedback-prompt'));

  const section = createTimurElement('section', 'py-4');
  section.attr('id', 'visitor-reviews');
  section.attr('aria-labelledby', 'visitor-reviews-title');
  const heading = createTimurElement('h2', 'fw-bold display-6 text-uppercase', 'Visitor reviews');
  heading.attr('id', 'visitor-reviews-title');
  section.append(heading, createTimurElement('p', 'small',
    'The source review is credited below. New reviews stay on this page only and disappear when you reload.'));
  const filters = createTimurElement('form', 'row g-3 mb-3');
  filters.attr('aria-label', 'Filter visitor reviews');

  function addFilter(id, labelText, control) {
    const column = createTimurElement('div', 'col-12 col-md-6');
    const label = createTimurElement('label', 'form-label', labelText);
    label.attr('for', id);
    control.attr('id', id);
    column.append(label, control);
    filters.append(column);
    return control;
  }
  const search = addFilter('review-search', 'Search reviews', createTimurElement('input', 'form-control rounded-0'));
  search.attr('type', 'search');
  search.attr('maxlength', 100);
  const ratingFilter = addFilter('review-rating-filter', 'Rating', createTimurElement('select', 'form-select rounded-0'));
  for (const value of ['', '5', '4', '3', '2', '1', 'unrated']) {
    const label = value === '' ? 'All ratings' : value === 'unrated' ? 'Not rated' : value + ' / 5';
    const option = createTimurElement('option', '', label);
    option.val(value);
    ratingFilter.append(option);
  }
  const sorting = addFilter('review-sort', 'Order', createTimurElement('select', 'form-select rounded-0'));
  const reviewOrders = [
    { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' },
    { value: 'highest', label: 'Highest rating first' }, { value: 'lowest', label: 'Lowest rating first' }
  ];
  for (const order of reviewOrders) {
    const option = createTimurElement('option', '', order.label);
    option.val(order.value);
    sorting.append(option);
  }
  const sandwichFilter = addFilter('review-item-filter', 'Sandwich', createTimurElement('select', 'form-select rounded-0'));
  sandwichFilter.append(createTimurElement('option', '', 'All sandwiches').val(''));
  for (const item of feedbackMenu) {
    const option = createTimurElement('option', '', item.name);
    option.val(item.id);
    sandwichFilter.append(option);
  }
  sandwichFilter.append(createTimurElement('option', '', 'Not specified').val('unspecified'));
  const reset = createTimurElement('button', 'btn btn-outline-dark rounded-0', 'Reset filters');
  reset.attr('type', 'reset');
  const actions = createTimurElement('div', 'col-12');
  actions.append(reset);
  filters.append(actions);
  const count = createTimurElement('p', 'small');
  count.attr('id', 'review-results-count');
  count.attr('role', 'status');
  const empty = createTimurElement('p', 'border p-3 hidden', 'No reviews match. Try another search, change the rating or reset the filters.');
  empty.attr('id', 'review-empty');
  const list = createTimurElement('div');
  list.attr('id', 'review-list');
  section.append(filters, count, empty, list);
  $('#main-content').append(section);

  // These buttons are created again after every filter: bind once on the list.
  list.on('click', 'button[data-review-details]', function () {
    const button = $(this);
    const details = button.closest('article').find('.review-details');
    const expanded = button.attr('aria-expanded') === 'true';
    button.attr('aria-expanded', String(!expanded)).text(expanded ? 'Show visit details' : 'Hide visit details');
    details.stop(true, true);
    if (expanded) details.slideUp(timurEffectDuration(), function () { details.addClass('hidden'); });
    else details.hide().removeClass('hidden').slideDown(timurEffectDuration());
  });

  function renderReviews() {
    const results = filterFeedback(reviews, search.val(), ratingFilter.val(), sorting.val(), sandwichFilter.val());
    list.empty();
    for (const review of results) list.append(renderFeedbackCard(review));
    const rated = results.filter(function (review) { return review.rating !== null; });
    let total = 0;
    for (const review of rated) total += review.rating;
    const average = rated.length > 0 ? ' Average: ' + (total / rated.length).toFixed(1) + ' / 5.' : ' No ratings in these results.';
    count.text('Showing ' + results.length + ' of ' + reviews.length + ' reviews.' + average);
    empty.toggleClass('hidden', results.length !== 0);
  }
  function resetFilters() {
    search.val('');
    ratingFilter.val('');
    sorting.val('newest');
    sandwichFilter.val('');
    renderReviews();
  }
  filters.on('input', renderReviews);
  filters.on('change', renderReviews);
  filters.on('submit', function (event) { event.preventDefault(); renderReviews(); });
  filters.on('reset', function (event) {
    event.preventDefault();
    resetFilters();
    search.trigger('focus');
  });
  renderReviews();

  // .val(), .prop(), .find() and .on() replace field properties and listeners.
  // Reading fields is shorter; the validation rules still need the same explicit checks.
  function readFeedback() {
    const selectedRating = form.find('input[name="rating"]:checked');
    return {
      name: $('#guest-name').val().trim(),
      email: $('#guest-email').val().trim(),
      phone: $('#guest-phone').val().trim(),
      group: $('#group-size').val(),
      date: $('#visit-date').val(),
      item: itemSelect.val(),
      rating: selectedRating.val() || '',
      message: message.val().trim(),
      // prop reads the current checkbox state; attr('checked') is only its initial HTML attribute.
      contact: $('#contact-permission').prop('checked')
    };
  }
  function showErrors(errors) {
    errorList.empty();
    form.find('[aria-invalid]').removeAttr('aria-invalid').removeClass('error');
    form.find('.field-error').addClass('hidden');
    for (const error of errors) {
      const control = $('#' + error.id);
      const errorId = error.id === 'rating-1' ? 'rating-error' : error.id + '-error';
      const fieldError = $('#' + errorId);
      control.attr('aria-invalid', 'true');
      control.addClass('error');
      if (error.id === 'rating-1') form.find('input[name="rating"]').attr('aria-invalid', 'true');
      fieldError.text(error.message);
      fieldError.removeClass('hidden');
      const row = $( $('#feedback-error-item').prop('content') ).clone();
      const link = row.find('a');
      link.attr('href', '#' + error.id);
      link.text(error.message);
      errorList.append(row);
    }
    errorBox.toggleClass('hidden', errors.length === 0);
  }
  function updateForm() {
    $('#visit-date').attr('max', getShopClock(new Date()).date);
    counter.text(message.val().length);
    clearEmail.prop('disabled', $('#guest-email').val().length === 0);
    form.find('input[name="rating"]').each(function () {
      $(this).closest('label').toggleClass('selected', $(this).prop('checked'));
    });
    if (submitted) showErrors(validateFeedback(readFeedback(), getShopClock(new Date()).date));
  }
  form.on('input', function () { if (!form.hasClass('hidden')) updateForm(); });
  form.on('change', updateForm);
  form.find('input[name="rating"]').on('change', function () {
    // From the chosen label, reach sibling columns instead of adding more IDs.
    const chosen = $(this).closest('label');
    chosen.addClass('selected').parent().siblings().find('label').removeClass('selected');
  });
  updateForm();

  form.on('submit', function (event) {
    event.preventDefault(); // Without this, method=dialog would close before our review step.
    if (stage !== 'editing') return;
    submitted = true;
    updateForm();
    const data = readFeedback();
    const errors = validateFeedback(data, getShopClock(new Date()).date);
    showErrors(errors);
    if (errors.length > 0) {
      $('#' + errors[0].id).trigger('focus');
      return;
    }
    draft = data;
    const values = {
      name: data.name, date: formatFeedbackDate(data.date), group: data.group,
      item: getFeedbackItemName(data.item), rating: data.rating + ' / 5',
      message: data.message,
      contact: data.contact ? [data.email, data.phone].filter(Boolean).join(' · ') : 'Not included'
    };
    for (const key of Object.keys(values)) $('#feedback-review-' + key).text(values[key]);
    stage = 'reviewing';
    form.stop(true, true).fadeOut(timurEffectDuration(), function () {
      if (stage !== 'reviewing') return; // A reset may finish this animation early.
      form.addClass('hidden');
      preview.stop(true, true).hide().removeClass('hidden').slideDown(timurEffectDuration(), function () {
        if (stage === 'reviewing') preview.trigger('focus');
      });
    });
  });
  $('#feedback-edit').on('click', function () {
    stage = 'editing';
    preview.stop(true, true).addClass('hidden');
    form.stop(true, true).removeClass('hidden').fadeIn(timurEffectDuration());
    $('#guest-name').trigger('focus');
  });
  $('#feedback-confirm').on('click', function () {
    if (stage !== 'reviewing' || !draft) return;
    stage = 'completed';
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    const item = feedbackMenu.find(function (item) { return item.id === draft.item; });
    reviews.push({
      id: reference + '-' + reviews.length, name: draft.name, text: draft.message,
      rating: Number(draft.rating), category: item ? item.name : 'Visit feedback',
      date: new Date().toISOString(), source: '', item: draft.item,
      visitDate: draft.date, group: draft.group
    });
    const summary = createFeedbackSummary(draft, reference);
    shareText.val(summary);
    // A browser download keeps the same reviewed snapshot available off this page.
    summaryUrl = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    download.attr({ href: summaryUrl, download: 'kent-feedback-' + reference + '.txt' }).removeClass('hidden');
    $('#feedback-share').removeClass('hidden');
    $('#feedback-confirmation-message').text(
      reference + ': your review was added to this page. Filters were reset so you can see it. Nothing was sent to Kent Sandwich.');
    resetFilters();
    // Reset after copying the snapshot; the reset handler must not reopen a completed form.
    form[0].reset();
    dialog[0].close('complete');
    confirmation.trigger('focus');
  });

  function resetFeedbackView() {
    stage = 'editing';
    submitted = false;
    draft = null;
    copyVersion++;
    showErrors([]);
    preview.stop(true, true).addClass('hidden');
    form.stop(true, true).removeClass('hidden').fadeIn(timurEffectDuration());
    $('#feedback-share').addClass('hidden');
    copyStatus.addClass('hidden');
    copyError.addClass('hidden');
    copyButton.removeClass('pending');
    copyButton.prop('disabled', false);
    shareText.val('');
    download.addClass('hidden').removeAttr('href download');
    if (summaryUrl) URL.revokeObjectURL(summaryUrl);
    summaryUrl = null;
    if (!dialog.prop('open')) dialog[0].show();
    updateForm();
    $('#guest-name').trigger('focus');
  }
  form.on('reset', function () {
    // Native reset finishes before the next task reads the fields.
    if (stage !== 'completed') window.setTimeout(resetFeedbackView, 0);
  });
  $('#feedback-restart').on('click', function (event) {
    event.preventDefault();
    stage = 'editing';
    form[0].reset();
  });
  copyButton.on('click', async function () {
    const version = copyVersion;
    copyButton.prop('disabled', true);
    copyButton.addClass('pending');
    copyError.addClass('hidden');
    copyStatus.removeClass('hidden');
    copyStatus.text('Copying summary…');
    try {
      await navigator.clipboard.writeText(shareText.val());
      if (version === copyVersion) copyStatus.text('Summary copied. Nothing was sent to the shop.');
    } catch (error) {
      if (version === copyVersion) {
        copyStatus.text('Copy the selected summary manually.');
        copyError.removeClass('hidden');
        shareText.trigger('focus');
        shareText.trigger('select');
      }
    } finally {
      if (version === copyVersion) {
        copyButton.prop('disabled', false);
        copyButton.removeClass('pending');
      }
    }
  });
});
