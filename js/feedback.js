'use strict';

// This page's view uses jQuery exclusively; shared time calculations stay native.
function createTimurElement(tag, classes, text) {
  const element = jQuery('<' + tag + '>').addClass(classes || '');
  if (text !== undefined) element.text(text);
  return element;
}

function feedbackIcon(symbol, classes = '') {
  return createTimurElement('span', 'flex-shrink-0 ' + classes, symbol).attr('aria-hidden', 'true');
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
  if (!digits) return compact.startsWith('+7') ? '+7' : '';

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
  if (data.group !== '' && (!Number.isInteger(group) || group < 1 || group > 20)) {
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
    'Visit date: ' + (data.date ? formatFeedbackDate(data.date) : 'Not provided'),
    'Group size: ' + (data.group || 'Not provided'),
    'Order total: ' + (data.total ? formatFeedbackMoney(data.total) : 'Not provided'),
    'Check per person: ' + (data.total && data.group ? formatFeedbackMoney(data.total / data.group) : 'Not provided'),
    'Rating: ' + data.rating + ' / 5',
    'Feedback: ' + data.message,
    'Contact details: ' + contact,
    'Local copy only. This feedback was not sent to Kent Sandwich; no order, booking or payment was created.'
  ].join('\n');
}

function renderReviewDetails(review) {
  const fields = [];
  if (review.visitDate) fields.push(['Visit date', formatFeedbackDate(review.visitDate)]);
  if (review.group > 0) fields.push(['Group size', review.group]);
  if (review.total > 0) {
    fields.push(['Order total', formatFeedbackMoney(review.total)]);
    if (review.group > 0) fields.push(['Per person', formatFeedbackMoney(review.total / review.group)]);
  }
  if (fields.length === 0) return null;
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
  const avatar = createTimurElement('span', 'd-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white small fw-bold flex-shrink-0', initial.toUpperCase())
    .css({ width: '2.25rem', height: '2.25rem' })
    .attr('aria-hidden', 'true');
  const author = createTimurElement('div', 'text-break');
  author.append(createTimurElement('h3', 'h5 fw-bold mb-1', review.name));
  const date = createTimurElement('time', 'small text-body-secondary d-block', formatFeedbackDate(review.date));
  date.attr('datetime', review.date);
  author.append(date);
  identity.append(avatar, author);

  const rating = review.rating === null ? 'Rating not provided' : review.rating + ' / 5';
  const badge = createTimurElement('span', 'review-rating badge d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2 text-dark ' +
    (review.rating === null ? 'bg-light border' : 'bg-body-tertiary fs-5'));
  if (review.rating !== null) {
    badge.append(createTimurElement('span', '', '★').attr('aria-hidden', 'true'));
  }
  badge.append(createTimurElement('span', '', rating));
  header.append(identity, badge);
  card.append(header);

  card.append(renderReviewDetails(review));
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
  const form = $('#feedback-form');
  const confirmation = $('#feedback-confirmation');
  const message = $('#guest-message');
  const counter = $('#feedback-character-count');
  const errorList = $('#feedback-error-list');
  const errorBox = $('#feedback-errors');
  const shareText = $('#feedback-share-text');
  const copyButton = $('#feedback-copy');
  const copyStatus = $('#feedback-copy-status');
  const copyError = $('#feedback-copy-error');
  const groupInput = $('#group-size');
  const totalInput = createTimurElement('input', 'form-control rounded-0 bg-white');
  totalInput.attr({ id: 'order-total', name: 'order-total', type: 'number', min: 1, step: 1,
    placeholder: 'e.g. 1400', 'aria-describedby': 'order-total-hint order-total-error' });
  $('#ordered-item').replaceWith(totalInput);
  $('label[for="ordered-item"]').attr('for', 'order-total').text('Order total (₸)');
  const totalHint = createTimurElement('p', 'form-text mb-0');
  totalHint.attr('id', 'order-total-hint').insertAfter(totalInput);
  const phoneInput = $('#guest-phone');
  phoneInput.attr({ placeholder: phoneExample, title: phoneHelp }).removeAttr('pattern');
  $('#guest-phone-hint, #guest-phone-error').text(phoneHelp);
  phoneInput.on('input change', function () {
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
  $('#visit-date-hint').text('Include the date if you remember it.');
  groupInput.val('').prop('defaultValue', '');
  $('label[for="group-size"]').text('People in your group (optional)');
  const totalError = createTimurElement('p', 'field-error hidden small mt-1 mb-0');
  totalError.attr('id', 'order-total-error').insertAfter(totalHint);
  const photoField = createTimurElement('div', 'rounded-3 border bg-light p-3 my-4');
  const photoLabel = createTimurElement('label', 'form-label fw-semibold', 'Photo (optional)').attr('for', 'guest-photo');
  photoLabel.prepend(feedbackIcon('▧', 'me-2'));
  const photoInput = createTimurElement('input', 'form-control rounded-3 bg-white');
  photoInput.attr({ id: 'guest-photo', name: 'guest-photo', type: 'file',
    accept: 'image/jpeg,image/png,image/webp', 'aria-describedby': 'guest-photo-hint guest-photo-error' });
  const photoHelp = 'JPG, PNG or WebP, up to 5 MB. The photo stays on this page only.';
  const photoHint = createTimurElement('p', 'form-text mb-2', photoHelp).attr('id', 'guest-photo-hint');
  const photoErrorText = createTimurElement('p', 'field-error hidden small mb-2').attr('id', 'guest-photo-error');
  const photoPreview = createTimurElement('div', 'ratio ratio-16x9 border rounded-3 overflow-hidden bg-white mb-3 hidden')
    .attr('id', 'feedback-photo-preview');
  const removePhoto = createTimurElement('button', 'btn btn-outline-dark btn-sm rounded-3 hidden', 'Remove photo');
  removePhoto.attr({ id: 'feedback-remove-photo', type: 'button' });
  photoField.append(photoLabel, photoInput, photoHint, photoErrorText, photoPreview, removePhoto)
    .insertBefore($('#contact-permission').closest('label'));
  const download = createTimurElement('a', 'btn btn-outline-dark rounded-3', 'Save summary as text');
  download.attr('id', 'feedback-download').prepend(feedbackIcon('↓', 'me-2'));
  const share = createTimurElement('details', 'small');
  share.append(createTimurElement('summary', 'fw-semibold', 'Copy or save your summary'));
  const shareContent = $('#feedback-share').removeClass('hidden mb-4').addClass('pt-3');
  shareText.attr('rows', 6).removeClass('rounded-0').addClass('rounded-3 bg-white');
  copyButton.removeClass('rounded-0 border-2').addClass('rounded-3').prepend(feedbackIcon('▣', 'me-2'));
  const shareActions = createTimurElement('div', 'd-flex flex-wrap gap-2');
  shareActions.insertBefore(copyButton).append(copyButton, download);
  share.append(shareContent);
  confirmation.removeClass('border-2 rounded-0 p-md-4').addClass('hidden rounded-4 mb-3');
  $('#feedback-confirmation-title').removeClass('display-6 text-uppercase lh-1 mb-3').addClass('h5 mb-2')
    .text('Feedback added').prepend(feedbackIcon('✓', 'me-2'));
  $('#feedback-confirmation-message').addClass('small mb-2');
  const shopLinks = $('#feedback-shop-instagram').parent().detach();
  const restart = $('#feedback-restart').attr('href', '#guest-name').text('Back to the feedback form');
  restart.parent().addClass('small mt-2');
  share.insertBefore(restart.parent());
  let submitted = false;
  let copyVersion = 0;
  let summaryUrl = null;
  let photoUrl = '';
  let photoError = '';
  let photoLoading = false;

  function clearPhoto() {
    photoPreview.addClass('hidden').empty();
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

  // Replace the old review dialog with the inline form.
  $('#feedback-dialog').replaceWith(form.detach());
  form.attr('aria-labelledby', 'feedback-title').prop('noValidate', true);
  // Delegation catches links created on each validation attempt; a direct binding
  // now would miss them because the error list is initially empty.
  errorList.on('click', 'a[href^="#"]', function (event) {
    event.preventDefault(); // Keep focus on the field instead of only jumping to an anchor.
    $($(this).attr('href')).trigger('focus');
  });

  const intro = $('.feedback-intro');
  intro.removeClass('border-bottom border-dark border-2 mb-4').addClass('mb-2');
  intro.find('h1').removeClass('display-2 text-uppercase mb-4').addClass('display-4 mb-0');
  intro.find('.lead').text('Tell us about the food, service or space.').addClass('mb-0');
  intro.find('.small.mb-0').remove();
  $('.feedback-layout').removeClass('py-4').addClass('pb-4');
  form.removeClass('rounded-0 border-2 p-md-4').addClass('rounded-4 shadow-sm p-sm-4 p-xl-5');
  form.find('.feedback-fields .form-control').removeClass('rounded-0').addClass('rounded-3 py-2');
  form.find('.feedback-fields label, label[for="guest-message"]').addClass('fw-semibold');
  $('#feedback-title').removeClass('display-6 text-uppercase').addClass('h2');
  $('#feedback-title').addClass('d-flex align-items-center gap-3')
    .prepend(feedbackIcon('✎', 'bg-body-tertiary rounded-3 px-3 py-2 fs-5'));
  message.removeClass('rounded-0').addClass('rounded-3').attr('rows', 4);
  const counterRow = $('#feedback-count-row').removeClass('hidden mt-1').addClass('mb-0 ms-auto');
  const messageHelp = createTimurElement('div', 'd-flex flex-wrap align-items-baseline gap-2 mt-2');
  messageHelp.insertAfter(message).append($('#guest-message-hint').removeClass('mt-1'), counterRow);
  $('#feedback-errors').removeClass('rounded-0').addClass('rounded-3');
  $('#feedback-rating').removeClass('border rounded-0 p-3').addClass('border-0 p-0');
  $('#feedback-rating legend').removeClass('px-2');
  form.find('.rating-row > div').removeClass('col-6 col-md-4 col-xl').addClass('col');
  form.find('.rating-choice').removeClass('d-block border-2 rounded-0 p-3')
    .addClass('d-flex flex-column align-items-center border rounded-3 p-2');
  form.find('.rating-choice > span').addClass('small text-center');
  form.find('.rating-choice small').removeClass('d-block').addClass('d-none d-md-block');
  form.find('.rating-choice input').removeClass('me-2');
  form.find('.rating-choice').prepend(feedbackIcon('★', 'mb-1'));
  $('#submission-note').text('Your review appears on this page until you reload. To reach the shop, use its contact links.');
  const submit = $('#feedback-submit').removeClass('btn-dark me-2 mb-2 rounded-0 border-2 text-uppercase px-4 py-3')
    .addClass('btn-warning rounded-3 px-4 py-2').text('Post feedback').prepend(feedbackIcon('↗', 'me-2'));
  const clear = $('#feedback-reset').removeClass('mb-2 rounded-0 border-2 text-uppercase px-4 py-3')
    .addClass('rounded-3 px-4 py-2').prepend(feedbackIcon('↺', 'me-2'));
  const formActions = createTimurElement('div', 'd-grid d-sm-flex flex-wrap gap-2');
  formActions.insertBefore(submit).append(submit, clear);

  // Preserve the actual existing review. Its source does not specify a rating.
  const prompt = $('.feedback-prompt');
  form.parent().insertBefore(prompt.parent());
  const quote = prompt.find('blockquote');
  const reviews = [{
    id: 'source', name: quote.find('cite').clone().children().remove().end().text().trim().replace(/[,\s—–-]+$/, ''),
    text: quote.find('q').text(), language: quote.find('q').attr('lang'),
    rating: null, category: 'Source review',
    date: quote.find('time').attr('datetime'), source: quote.find('a').attr('href')
  }];
  quote.remove();
  prompt.removeClass('rounded-0 border-2 border-dark p-4 bg-warning').addClass('rounded-4 p-3 p-md-4 bg-body-tertiary');
  prompt.children('.eyebrow, p:last-child').remove();
  prompt.find('h2').removeClass('display-6 text-uppercase').addClass('h4');
  prompt.find('.ratio').removeClass('rounded-0').addClass('rounded-3');
  shopLinks.removeClass('mb-3').addClass('mt-3 mb-0');
  shopLinks.find('a').removeClass('rounded-0 border-2').addClass('rounded-3 btn-sm');
  prompt.append(shopLinks);

  const section = createTimurElement('section', 'py-4 mt-4 border-top border-dark');
  section.attr('id', 'visitor-reviews');
  section.attr('aria-labelledby', 'visitor-reviews-title');
  const heading = createTimurElement('h2', 'fw-bold h2', 'Visitor reviews');
  heading.attr('id', 'visitor-reviews-title');
  const averageCheck = createTimurElement('p', 'small fw-semibold border rounded-3 bg-white p-3 mb-3');
  averageCheck.attr('id', 'review-average-check');
  section.append(heading, createTimurElement('p', 'small',
    'The source review is credited below. New reviews stay on this page only and disappear when you reload.'), averageCheck);
  const filterPanel = createTimurElement('div', 'border rounded-4 bg-white p-3 p-md-4 mb-3');
  const filters = createTimurElement('form', 'row g-3');
  filters.attr('aria-label', 'Filter visitor reviews');

  function addFilter(id, labelText, control) {
    const column = createTimurElement('div', 'col-12 col-md-6 col-lg-3');
    const label = createTimurElement('label', 'form-label fw-semibold', labelText);
    label.attr('for', id).addClass('small');
    control.attr('id', id).removeClass('rounded-0').addClass('rounded-3 bg-white');
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
  const reset = createTimurElement('button', 'btn btn-outline-dark rounded-3', 'Reset filters');
  reset.attr('type', 'reset').prepend(feedbackIcon('↺', 'me-2'));
  const actions = createTimurElement('div', 'col-12 d-flex justify-content-end');
  actions.append(reset);
  filters.append(actions);
  const count = createTimurElement('p', 'small text-body-secondary mb-3');
  count.attr('id', 'review-results-count');
  count.attr('role', 'status');
  const empty = createTimurElement('p', 'border rounded-4 bg-white p-4 hidden', 'No reviews match. Try another search, change the rating or reset the filters.');
  empty.attr('id', 'review-empty');
  const list = createTimurElement('div', 'row g-3 align-items-start');
  list.attr('id', 'review-list');
  filterPanel.append(filters);
  section.append(filterPanel, count, empty, confirmation, list);
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
    averageCheck.text(check === null ? 'Average check per person: no reviews with both an order total and group size yet.'
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
      group: groupInput.prop('validity').badInput ? NaN : groupInput.val(),
      date: $('#visit-date').val(),
      total: totalInput.prop('validity').badInput ? NaN : totalInput.val(),
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
    const group = Number(groupInput.val());
    totalHint.text(Number.isInteger(total) && total > 0 && Number.isInteger(group) && group >= 1 && group <= 20
      ? formatFeedbackMoney(total / group) + ' per person.'
      : 'Optional. Enter the total bill for your group in tenge.');
    counter.text(message.val().length);
    form.find('input[name="rating"]').each(function () {
      $(this).closest('label').toggleClass('selected', $(this).prop('checked'));
    });
    if (submitted) showErrors(validateFeedback(readFeedback(), getShopClock(new Date()).date));
  }
  form.on('input change', updateForm);
  updateForm();

  form.on('submit', function (event) {
    event.preventDefault();
    submitted = true;
    const now = new Date();
    const data = readFeedback();
    const errors = validateFeedback(data, getShopClock(now).date);
    showErrors(errors);
    if (errors.length > 0) {
      $('#' + errors[0].id).trigger('focus');
      return;
    }
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    reviews.unshift({
      id: reference + '-' + reviews.length, name: data.name, text: data.message,
      rating: Number(data.rating), category: 'Visit feedback',
      date: now.toISOString(), source: '', total: data.total ? Number(data.total) : null,
      visitDate: data.date, group: data.group, photo: data.photo
    });
    // The posted card now owns the photo URL.
    photoUrl = '';
    form[0].reset();
    resetFilters();

    const summary = createFeedbackSummary(data, reference);
    if (summaryUrl) URL.revokeObjectURL(summaryUrl);
    shareText.val(summary);
    summaryUrl = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    download.attr({ href: summaryUrl, download: 'kent-feedback-' + reference + '.txt' });
    copyVersion++;
    copyStatus.addClass('hidden');
    copyError.addClass('hidden');
    copyButton.removeClass('pending').prop('disabled', false);
    share.prop('open', false);
    $('#feedback-confirmation-message').text('Your review is below. It stays on this page until you reload.');
    confirmation.removeClass('hidden').trigger('focus');
  });

  form.on('reset', function () {
    submitted = false;
    clearPhoto();
    showErrors([]);
    // The default values are restored after the reset event.
    window.setTimeout(updateForm, 0);
  });
  restart.on('click', function (event) {
    event.preventDefault();
    $('#guest-name').trigger('focus');
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
