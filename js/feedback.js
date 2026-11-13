'use strict';

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
    timeZone: 'Asia/Almaty', dateStyle: 'medium'
  }).format(new Date(value));
}

const phoneExample = '+7-(747)-123-1212';
const phoneHelp = 'Enter 10 digits after +7, for example ' + phoneExample + '.';

function formatFeedbackPhone(value) {
  const compact = value.trim().replace(/[^\d+]/g, '');
  let digits = compact.replace(/\D/g, '');
  if (/^\+[0-689]/.test(compact)) return '+' + digits.slice(0, 11);

  // Pasted numbers may start with +7, 7 or the local prefix 8.
  if (compact.startsWith('+7') || (digits.length > 10 && /^[78]/.test(digits))) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (!digits) return '+7';

  let phone = '+7-(' + digits.slice(0, 3);
  if (digits.length > 3) phone += ')-' + digits.slice(3, 6);
  if (digits.length > 6) phone += '-' + digits.slice(6);
  return phone;
}

function validateFeedback(data, today) {
  const errors = [];
  if (data.name.trim().length < 2 || data.name.trim().length > 80) {
    errors.push({ id: 'guest-name', message: 'Enter a name with 2–80 characters after trimming spaces.' });
  }
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
    errors.push({ id: 'guest-email', message: 'Enter a valid email address, or leave it empty.' });
  }
  if (data.phone && !/^\+7(?:[ ()-]*\d){10}$/.test(data.phone)) {
    errors.push({ id: 'guest-phone', message: phoneHelp });
  }
  const group = Number(data.group);
  if (!Number.isInteger(group) || group < 1 || group > 20) {
    errors.push({ id: 'group-size', message: 'Choose a whole group size from 1 to 20.' });
  }
  const date = new Date(data.date + 'T00:00:00Z');
  if (data.date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== data.date || data.date > today)) {
    errors.push({ id: 'visit-date', message: 'Choose a real visit date that is not in the future.' });
  }
  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ id: 'rating-1', message: 'Choose a rating from 1 to 5.' });
  }
  if (data.total !== '' && (!Number.isInteger(Number(data.total)) || Number(data.total) <= 0)) {
    errors.push({ id: 'order-total', message: 'Enter a positive whole amount in tenge, or leave it empty.' });
  }
  if (data.message.trim().length < 20 || data.message.trim().length > 600) {
    errors.push({ id: 'guest-message', message: 'Write 20–600 characters after trimming spaces.' });
  }
  if (data.photoError) errors.push({ id: 'guest-photo', message: data.photoError });
  if (data.contact && !data.email && !data.phone) {
    errors.push({ id: 'contact-permission', message: 'Add an email or phone number, or untick this box.' });
  }
  return errors;
}

function filterFeedback(reviews, query, rating, order, totalFilter) {
  const search = query.trim().toLowerCase();
  const result = reviews.filter(function (review) {
    const text = (review.name + ' ' + review.text + ' ' + review.category).toLowerCase();
    const matchesRating = rating === '' ||
      (rating === 'unrated' ? review.rating === null : review.rating === Number(rating));
    const matchesTotal = !totalFilter ||
      (totalFilter === 'with-total' ? review.total > 0 : !(review.total > 0));
    return text.includes(search) && matchesRating && matchesTotal;
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

function formatFeedbackMoney(value) {
  return Math.round(value).toLocaleString('en-US') + ' ₸';
}

function getAverageFeedbackCheck(reviews) {
  let total = 0;
  let people = 0;
  for (const review of reviews) {
    if (review.total > 0 && review.group > 0) {
      total += Number(review.total);
      people += Number(review.group);
    }
  }
  return people > 0 ? total / people : null;
}

function createFeedbackSummary(data, reference) {
  const contact = data.contact ? [data.email, data.phone].filter(Boolean).join(' · ') : 'Not included';
  return [
    'Local feedback summary · ' + reference,
    'Name: ' + data.name,
    'Visit date: ' + formatFeedbackDate(data.date),
    'Group size: ' + data.group,
    'Order total: ' + (data.total ? formatFeedbackMoney(data.total) : 'Not provided'),
    'Check per person: ' + (data.total ? formatFeedbackMoney(data.total / data.group) : 'Not provided'),
    'Rating: ' + data.rating + ' / 5',
    'Feedback: ' + data.message,
    'Contact details: ' + contact,
    'Local copy only. This feedback was not sent to Kent Sandwich; no order, booking or payment was created.'
  ].join('\n');
}

function createFeedbackPhoto(src, alt) {
  const frame = createTimurElement('div', 'ratio ratio-4x3 border border-dark bg-light mb-3');
  if (src) frame.append(createTimurElement('img', 'w-100 h-100 object-fit-contain').attr({ src: src, alt: alt }));
  return frame;
}

function renderReviewDetails(review) {
  const fields = [
    ['Visit date', formatFeedbackDate(review.visitDate)],
    ['Group size', review.group]
  ];
  if (review.total > 0) {
    fields.push(['Order total', formatFeedbackMoney(review.total)]);
    fields.push(['Per person', formatFeedbackMoney(review.total / review.group)]);
  }
  const details = createTimurElement('dl', 'review-details row row-cols-2 row-cols-xl-4 g-2 border rounded-3 bg-light mx-0 mt-0 mb-3 p-2');
  for (const [label, value] of fields) {
    details.append(createTimurElement('div', 'col mt-0 py-1').append(
      createTimurElement('dt', 'small text-body-secondary fw-normal', label),
      createTimurElement('dd', 'fw-semibold mb-0', value)
    ));
  }
  return details;
}

// jQuery builds the card and inserts visitor input as plain text.
function renderFeedbackCard(review) {
  const card = createTimurElement('article', 'border rounded-4 shadow-sm p-3 p-md-4 bg-white text-break');
  card.attr('id', 'review-' + review.id);
  const header = createTimurElement('header', 'd-flex flex-wrap justify-content-between align-items-start gap-2 mb-3');
  const identity = createTimurElement('div', 'd-flex align-items-center gap-2');
  const initial = Array.from(review.name)[0] || '';
  const avatar = createTimurElement('span', 'badge rounded-circle bg-dark text-white p-2 flex-shrink-0', initial.toUpperCase())
    .attr('aria-hidden', 'true');
  const author = createTimurElement('div', 'text-break');
  author.append(createTimurElement('h3', 'h5 fw-bold mb-1', review.name));
  const date = createTimurElement('time', 'small text-body-secondary d-block', formatFeedbackDate(review.date));
  date.attr('datetime', review.date);
  author.append(date);
  identity.append(avatar, author);

  const rating = review.rating === null ? 'Rating not provided' : review.rating + ' / 5';
  const badge = createTimurElement('span', 'review-rating badge d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2 text-dark ' +
    (review.rating === null ? 'bg-light border' : 'bg-body-tertiary'));
  if (review.rating !== null) {
    badge.append(createTimurElement('span', '', '★').attr('aria-hidden', 'true'));
  }
  badge.append(createTimurElement('span', '', rating));
  header.append(identity, badge);
  card.append(header);

  if (review.visitDate) card.append(renderReviewDetails(review));
  if (review.source) {
    card.append(createTimurElement('p', 'small text-body-secondary mb-2', review.category));
  }
  const content = createTimurElement('div', 'd-flex align-items-start justify-content-between gap-3');
  const message = createTimurElement('p', 'feedback-message mb-0', review.text);
  if (review.language) message.attr('lang', review.language);
  content.append(message);

  if (review.photo) {
    const thumbnail = createTimurElement('button', 'btn border bg-light rounded-3 overflow-hidden p-0 position-relative flex-shrink-0')
      .attr({ type: 'button', 'data-review-photo': '', 'aria-label': 'Open review photo by ' + review.name, 'aria-haspopup': 'dialog' });
    const image = createTimurElement('img', 'd-block object-fit-cover')
      .attr({ src: review.photo, alt: '', width: 96, height: 72 });
    const expandIcon = createTimurElement('span', 'badge text-bg-dark position-absolute bottom-0 end-0 m-1', '⤢')
      .attr('aria-hidden', 'true');
    thumbnail.append(image, expandIcon);
    content.append(thumbnail);
  }
  card.append(content);
  return card;
}

// jQuery 3.7.1 ready ensures the form exists before handlers are attached.
jQuery(function ($) {
  if ($('body').attr('data-page') !== 'feedback') return;
  $('.feedback-intro .small.mb-0').remove();
  $('.feedback-prompt').removeClass('bg-warning').addClass('bg-body-tertiary');
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
  const totalInput = createTimurElement('input', 'form-control rounded-0 bg-white');
  totalInput.attr({ id: 'order-total', name: 'order-total', type: 'number', min: 1, step: 1,
    placeholder: 'e.g. 1400', 'aria-describedby': 'order-total-hint order-total-error' });
  $('#ordered-item').replaceWith(totalInput);
  $('label[for="ordered-item"]').attr('for', 'order-total').text('Order total (₸)');
  const totalHint = createTimurElement('p', 'form-text mb-0');
  totalHint.attr('id', 'order-total-hint').insertAfter(totalInput);
  $('#feedback-review-item').attr({ id: 'feedback-review-total', for: 'order-total' })
    .closest('dd').prev('dt').text('Order total');
  const phoneInput = $('#guest-phone');
  phoneInput.attr({ placeholder: phoneExample, title: phoneHelp }).removeAttr('pattern');
  $('#guest-phone-hint, #guest-phone-error').text(phoneHelp);
  phoneInput.val('+7').prop('defaultValue', '+7').on('input change', function () {
    const value = phoneInput.val();
    const formatted = formatFeedbackPhone(value);
    if (value === formatted) return;

    const cursor = this.selectionStart;
    phoneInput.val(formatted);

    // Keep the cursor next to the same digit when editing the middle.
    if (cursor === null || cursor === value.length) return;
    let digitsBeforeCursor = value.slice(0, cursor).replace(/\D/g, '').length;
    let position = 0;
    while (position < formatted.length && digitsBeforeCursor > 0) {
      if (/\d/.test(formatted[position])) digitsBeforeCursor--;
      position++;
    }
    position = Math.max(position, 2);
    this.setSelectionRange(position, position);
  });
  $('#visit-date').prop('required', false);
  $('label[for="visit-date"]').text('Visit date (optional)');
  $('#visit-date-hint').text('Leave empty to use today\'s date.');
  const totalError = createTimurElement('p', 'field-error hidden small mt-1 mb-0');
  totalError.attr('id', 'order-total-error').insertAfter(totalHint);
  const photoField = createTimurElement('div', 'my-4');
  const photoLabel = createTimurElement('label', 'form-label fw-semibold', 'Photo (optional)').attr('for', 'guest-photo');
  const photoInput = createTimurElement('input', 'form-control rounded-0 bg-white');
  photoInput.attr({ id: 'guest-photo', name: 'guest-photo', type: 'file',
    accept: 'image/jpeg,image/png,image/webp', 'aria-describedby': 'guest-photo-hint guest-photo-error' });
  const photoHelp = 'JPG, PNG or WebP, up to 5 MB. The photo stays on this page only.';
  const photoHint = createTimurElement('p', 'form-text mb-2', photoHelp).attr('id', 'guest-photo-hint');
  const photoErrorText = createTimurElement('p', 'field-error hidden small mb-2').attr('id', 'guest-photo-error');
  const photoPreview = createFeedbackPhoto('', 'Selected review photo').attr('id', 'feedback-photo-preview').addClass('hidden');
  const removePhoto = createTimurElement('button', 'btn btn-outline-dark btn-sm rounded-0 hidden', 'Remove photo');
  removePhoto.attr({ id: 'feedback-remove-photo', type: 'button' });
  photoField.append(photoLabel, photoInput, photoHint, photoErrorText, photoPreview, removePhoto)
    .insertBefore($('#contact-permission').closest('label'));
  const reviewPhoto = createFeedbackPhoto('', 'Photo attached to your review').attr('id', 'feedback-review-photo').addClass('hidden');
  reviewPhoto.insertBefore($('#feedback-confirm'));
  const download = createTimurElement('a', 'btn btn-outline-dark rounded-0 border-2 ms-2 hidden', 'Save summary as text');
  download.attr('id', 'feedback-download').insertAfter(copyButton);
  let stage = 'editing';
  let draft = null;
  let submitted = false;
  let copyVersion = 0;
  let summaryUrl = null;
  let photoUrl = '';
  let photoError = '';
  let photoLoading = false;

  function clearPhoto() {
    photoPreview.addClass('hidden').empty();
    reviewPhoto.addClass('hidden').empty();
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = '';
    photoError = '';
    photoLoading = false;
    removePhoto.addClass('hidden');
    photoErrorText.addClass('hidden').text('');
    photoInput.removeAttr('aria-invalid').removeClass('error');
  }
  photoInput.on('change', function () {
    clearPhoto();
    const file = photoInput.prop('files')[0];
    if (!file) { updateForm(); return; }
    removePhoto.removeClass('hidden');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      photoError = 'Choose a JPG, PNG or WebP photo up to 5 MB.';
      updateForm();
      return;
    }
    photoUrl = URL.createObjectURL(file);
    const selectedUrl = photoUrl;
    photoLoading = true;
    const image = createTimurElement('img', 'w-100 h-100 object-fit-contain').attr('alt', 'Selected review photo');
    photoPreview.append(image);
    image.one('load', function () {
      if (photoUrl !== selectedUrl) return;
      photoLoading = false;
      updateForm();
    }).one('error', function () {
      if (photoUrl !== selectedUrl) return;
      clearPhoto();
      removePhoto.removeClass('hidden');
      photoError = 'This photo could not be opened. Choose another image or remove it.';
      updateForm();
    }).attr('src', photoUrl);
    photoPreview.removeClass('hidden');
    updateForm();
  });
  removePhoto.on('click', function () {
    photoInput.val('');
    clearPhoto();
    updateForm();
  });

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

  const section = createTimurElement('section', 'py-4 mt-4 border-top border-dark');
  section.attr('id', 'visitor-reviews');
  section.attr('aria-labelledby', 'visitor-reviews-title');
  const heading = createTimurElement('h2', 'fw-bold display-6 text-uppercase', 'Visitor reviews');
  heading.attr('id', 'visitor-reviews-title');
  const averageCheck = createTimurElement('p', 'fw-semibold border border-dark bg-body-tertiary text-dark p-3 mb-4');
  averageCheck.attr('id', 'review-average-check');
  section.append(heading, createTimurElement('p', 'small',
    'The source review is credited below. New reviews stay on this page only and disappear when you reload.'), averageCheck);
  const filterPanel = createTimurElement('div', 'border border-dark bg-white p-3 p-md-4 mb-4');
  const filters = createTimurElement('form', 'row g-3');
  filters.attr('aria-label', 'Filter visitor reviews');

  function addFilter(id, labelText, control) {
    const column = createTimurElement('div', 'col-12 col-md-6 col-lg-3');
    const label = createTimurElement('label', 'form-label fw-semibold', labelText);
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
  const totalFilter = addFilter('review-total-filter', 'Order total', createTimurElement('select', 'form-select rounded-0'));
  for (const option of [
    { value: '', label: 'All reviews' },
    { value: 'with-total', label: 'With order total' },
    { value: 'without-total', label: 'Without order total' }
  ]) {
    totalFilter.append(createTimurElement('option', '', option.label).val(option.value));
  }
  const reset = createTimurElement('button', 'btn btn-outline-dark rounded-0', 'Reset filters');
  reset.attr('type', 'reset');
  const actions = createTimurElement('div', 'col-12 d-flex justify-content-end');
  actions.append(reset);
  filters.append(actions);
  const count = createTimurElement('p', 'small border-bottom border-dark pb-3 mb-4');
  count.attr('id', 'review-results-count');
  count.attr('role', 'status');
  const empty = createTimurElement('p', 'border border-dark bg-white p-4 hidden', 'No reviews match. Try another search, change the rating or reset the filters.');
  empty.attr('id', 'review-empty');
  const list = createTimurElement('div', 'row g-3 align-items-start');
  list.attr('id', 'review-list');
  filterPanel.append(filters);
  section.append(filterPanel, count, empty, list);
  $('#main-content').append(section);

  const photoDialog = createTimurElement('dialog', 'gallery-dialog border rounded-4 p-3 shadow')
    .attr({ id: 'review-photo-dialog', 'aria-label': 'Review photo' });
  const fullPhoto = createTimurElement('img', 'gallery-dialog-image d-block')
    .attr('alt', 'Photo attached to the review');
  const closePhoto = createTimurElement('button', 'btn-close d-block ms-auto mb-3')
    .attr({ type: 'button', 'aria-label': 'Close review photo' });
  photoDialog.append(closePhoto).insertAfter(section);
  closePhoto.on('click', function () { photoDialog[0].close(); });
  // Filtering rebuilds the thumbnails. One handler on the list serves them all.
  list.on('click', 'button[data-review-photo]', function () {
    const thumbnail = $(this);
    fullPhoto.attr('src', thumbnail.find('img').attr('src')).appendTo(photoDialog);
    thumbnail.trigger('focus');
    photoDialog[0].showModal(); // The browser handles Escape and returns focus.
  });

  function renderReviews() {
    const results = filterFeedback(reviews, search.val(), ratingFilter.val(), sorting.val(), totalFilter.val());
    list.empty();
    for (const review of results) {
      list.append(createTimurElement('div', 'col-12 col-lg-6').append(renderFeedbackCard(review)));
    }
    const rated = results.filter(function (review) { return review.rating !== null; });
    let total = 0;
    for (const review of rated) total += review.rating;
    const average = rated.length > 0 ? ' Average: ' + (total / rated.length).toFixed(1) + ' / 5.' : ' No ratings in these results.';
    count.text('Showing ' + results.length + ' of ' + reviews.length + ' reviews.' + average);
    const check = getAverageFeedbackCheck(reviews);
    averageCheck.text(check === null ? 'Average check per person: no order totals yet.'
      : 'Average check per person (local reviews): ' + formatFeedbackMoney(check));
    empty.toggleClass('hidden', results.length !== 0);
  }
  function resetFilters() {
    search.val('');
    ratingFilter.val('');
    sorting.val('newest');
    totalFilter.val('');
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
    const phone = phoneInput.val().trim();
    return {
      name: $('#guest-name').val().trim(),
      email: $('#guest-email').val().trim(),
      phone: phone === '+7' ? '' : phone,
      group: $('#group-size').val(),
      date: $('#visit-date').val() || getShopClock(new Date()).date,
      total: totalInput.val(),
      rating: selectedRating.val() || '',
      message: message.val().trim(),
      photo: photoUrl,
      photoError: photoLoading ? 'Wait for your photo to finish loading.' : photoError,
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
    photoHint.text(photoLoading ? 'Loading photo…' : photoHelp);
    photoErrorText.text(photoError).toggleClass('hidden', !photoError);
    photoInput.toggleClass('error', Boolean(photoError)).attr('aria-invalid', String(Boolean(photoError)));
    const total = Number(totalInput.val());
    const group = Number($('#group-size').val());
    totalHint.text(Number.isInteger(total) && total > 0 && Number.isInteger(group) && group >= 1 && group <= 20
      ? formatFeedbackMoney(total / group) + ' per person.'
      : 'Optional. Enter the total bill for your group in tenge.');
    counter.text(message.val().length);
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
      total: data.total ? formatFeedbackMoney(data.total) + ' · ' +
        formatFeedbackMoney(data.total / data.group) + ' per person' : 'Not provided',
      rating: data.rating + ' / 5',
      message: data.message,
      contact: data.contact ? [data.email, data.phone].filter(Boolean).join(' · ') : 'Not included'
    };
    for (const key of Object.keys(values)) $('#feedback-review-' + key).text(values[key]);
    reviewPhoto.empty().toggleClass('hidden', !data.photo);
    if (data.photo) reviewPhoto.append(createFeedbackPhoto(data.photo, 'Photo attached to your review').children());
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
    const now = new Date();
    if (!$('#visit-date').val()) draft.date = getShopClock(now).date;
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    reviews.push({
      id: reference + '-' + reviews.length, name: draft.name, text: draft.message,
      rating: Number(draft.rating), category: 'Visit feedback',
      date: now.toISOString(), source: '', total: draft.total ? Number(draft.total) : null,
      visitDate: draft.date, group: draft.group, photo: draft.photo
    });
    // The submitted review keeps its URL; resetting only clears the draft photo.
    photoUrl = '';
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
    clearPhoto();
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
