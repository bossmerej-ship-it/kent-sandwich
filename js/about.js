'use strict';

// Published daily hours from the existing visit-details section.
const visitPlace = {
  opening: '09:30', closing: '21:30',
  address: 'Adolfa Yanushkevicha Street, 1, Astana',
  map: 'https://2gis.kz/astana/firm/70000001114376342'
};
const visitDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  return count > 0 ? (index + step + count) % count : 0;
}

function addVisitDays(date, days) {
  const next = new Date(date + 'T00:00:00Z');
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatVisitDate(date) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(date + 'T00:00:00Z'));
}

function getVisitWeek(start) {
  const days = [];
  for (let offset = 0; offset < 7; offset++) {
    const date = addVisitDays(start, offset);
    days.push({
      date: date, day: visitDays[new Date(date + 'T00:00:00Z').getUTCDay()],
      opening: visitPlace.opening, closing: visitPlace.closing
    });
  }
  return days;
}

function getVisitPlan(date, time, now) {
  const clock = getShopClock(now);
  const errors = [];
  const parsed = new Date(date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date || date < clock.date) {
    errors.push({ id: 'plan-date', message: 'Choose a real date from today onwards in Astana.' });
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || (date === clock.date && time < clock.time)) {
    errors.push({ id: 'plan-time', message: 'Choose a valid time that has not already passed in Astana.' });
  }
  if (errors.length > 0) return { errors: errors };
  const open = time >= visitPlace.opening && time < visitPlace.closing;
  const minutes = function (value) {
    const parts = value.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  };
  return {
    errors: errors, open: open,
    minutesUntilClose: open ? minutes(visitPlace.closing) - minutes(time) : 0,
    nextOpening: (time < visitPlace.opening ? date : addVisitDays(date, 1)) + ' ' + visitPlace.opening
  };
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.page !== 'about') return;
  const hours = document.getElementById('visit-hours');
  const status = document.getElementById('visit-status');
  let displayedDate = '';
  function updateHours() {
    const now = new Date();
    const result = getOpeningStatus(now, hours.dataset.open, hours.dataset.close);
    status.textContent = result.text;
    status.classList.remove('hidden');
    status.classList.toggle('success', result.open);
    const today = getShopClock(now).date;
    dateInput.min = today;
    if (displayedDate !== today) renderWeek(today);
    if (attempted && getVisitPlan(dateInput.value, timeInput.value, now).errors.length > 0) changePlan();
  }
  function refreshHours() {
    updateHours();
    window.setTimeout(refreshHours, getNextMinuteDelay(new Date()));
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) updateHours();
  });

  // The planner and the next seven days are created from data, not HTML.
  const planner = createTimurNode('section', 'border border-2 rounded-0 p-3 p-md-4 mt-4 bg-white');
  planner.id = 'visit-planner';
  planner.setAttribute('aria-labelledby', 'visit-planner-title');
  const heading = createTimurNode('h3', 'h4 fw-bold text-uppercase', 'Plan your visit');
  heading.id = 'visit-planner-title';
  planner.append(heading, createTimurNode('p', 'small',
    'Check a date and arrival time against the daily opening hours. All times are in Astana. This does not book a table.'));
  const week = createTimurNode('div', 'row g-2 mb-4');
  week.id = 'visit-week';
  planner.append(week);
  const form = createTimurNode('form', 'row g-3');
  form.id = 'visit-plan-form';
  form.noValidate = true;
  function addField(id, type, labelText) {
    const column = createTimurNode('div', 'col-12 col-md-6');
    const label = createTimurNode('label', 'form-label', labelText);
    label.htmlFor = id;
    const input = createTimurNode('input', 'form-control rounded-0');
    input.id = id;
    input.name = id;
    input.type = type;
    input.required = true;
    input.setAttribute('aria-describedby', id + '-error');
    const error = createTimurNode('p', 'field-error hidden small mt-1 mb-0');
    error.id = id + '-error';
    column.append(label, input, error);
    form.append(column);
    return input;
  }
  const dateInput = addField('plan-date', 'date', 'Visit date');
  const timeInput = addField('plan-time', 'text', 'Arrival time (HH:MM)');
  timeInput.placeholder = '20:30';
  timeInput.maxLength = 5;
  const actions = createTimurNode('div', 'col-12 d-flex flex-wrap gap-2');
  const check = createTimurNode('button', 'btn btn-dark rounded-0', 'Check visit time');
  check.type = 'submit';
  const reset = createTimurNode('button', 'btn btn-outline-dark rounded-0', 'Reset visit plan');
  reset.type = 'reset';
  actions.append(check, reset);
  form.append(actions);
  const output = createTimurNode('div', 'hidden border rounded-0 p-3 mt-3');
  output.id = 'visit-plan-result';
  output.tabIndex = -1;
  output.setAttribute('role', 'status');
  planner.append(form, output);
  document.getElementById('details').append(planner);
  let attempted = false;

  function selectDay() {
    for (const button of week.querySelectorAll('button')) {
      const selected = button.dataset.visitDate === dateInput.value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }
  function renderWeek(today) {
    displayedDate = today;
    week.replaceChildren();
    for (const day of getVisitWeek(today)) {
      const column = createTimurNode('div', 'col-12 col-md-6');
      const button = createTimurNode('button', 'btn btn-outline-dark rounded-0 w-100 text-start');
      button.type = 'button';
      button.dataset.visitDate = day.date;
      button.append(createTimurNode('span', 'd-block fw-semibold', day.day + ' · ' + formatVisitDate(day.date)),
        createTimurNode('span', 'small', day.opening + '–' + day.closing));
      column.append(button);
      week.append(column);
    }
    selectDay();
  }
  function showPlanErrors(errors) {
    for (const input of [dateInput, timeInput]) {
      const error = errors.find(function (entry) { return entry.id === input.id; });
      const note = document.getElementById(input.id + '-error');
      input.classList.toggle('error', Boolean(error));
      input.setAttribute('aria-invalid', String(Boolean(error)));
      note.classList.toggle('hidden', !error);
      note.textContent = error ? error.message : '';
    }
  }
  function resetPlan() {
    attempted = false;
    dateInput.value = '';
    timeInput.value = '';
    showPlanErrors([]);
    output.classList.add('hidden');
    selectDay();
  }
  function changePlan() {
    output.classList.add('hidden'); // Never leave a result for an older selection visible.
    selectDay();
    if (attempted) showPlanErrors(getVisitPlan(dateInput.value, timeInput.value, new Date()).errors);
  }
  // Delegation also handles the new buttons rebuilt after Astana midnight.
  week.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-visit-date]');
    if (!button || !week.contains(button)) return;
    dateInput.value = button.dataset.visitDate;
    changePlan();
    timeInput.focus();
  });
  form.addEventListener('input', changePlan);
  form.addEventListener('change', changePlan);
  form.addEventListener('reset', function (event) {
    event.preventDefault();
    resetPlan();
    dateInput.focus();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    attempted = true;
    const plan = getVisitPlan(dateInput.value.trim(), timeInput.value.trim(), new Date());
    showPlanErrors(plan.errors);
    if (plan.errors.length > 0) {
      output.classList.add('hidden');
      document.getElementById(plan.errors[0].id).focus();
      return;
    }
    const chosen = formatVisitDate(dateInput.value) + ' at ' + timeInput.value + ' (Astana time)';
    const summary = plan.open
      ? 'Open at your arrival. ' + plan.minutesUntilClose + ' minutes until closing.'
      : 'Closed at your arrival. Next opening: ' + formatVisitDate(plan.nextOpening.slice(0, 10)) + ' at ' + visitPlace.opening + '.';
    const map = createTimurNode('a', 'btn btn-outline-dark rounded-0', 'View location on 2GIS ↗');
    map.href = visitPlace.map;
    map.target = '_blank';
    map.rel = 'noopener noreferrer';
    output.replaceChildren(createTimurNode('h4', 'h5 fw-bold', chosen),
      createTimurNode('p', '', summary), createTimurNode('p', '', visitPlace.address), map);
    output.classList.toggle('success', plan.open);
    output.classList.remove('hidden');
    output.focus();
  });
  refreshHours();

  // Native dialog owns focus trapping, Escape and the backdrop.
  const links = Array.from(document.querySelectorAll('.gallery-link'));
  const dialog = document.getElementById('gallery-dialog');
  const image = document.getElementById('gallery-dialog-image');
  const fullSize = createTimurNode('a', 'link-dark small d-block mt-3', 'Open original photograph ↗');
  fullSize.id = 'gallery-original';
  fullSize.target = '_blank';
  fullSize.rel = 'noopener noreferrer';
  dialog.append(fullSize);
  let photoIndex = 0;
  let opener = null;
  function showPhoto(index) {
    photoIndex = index;
    const link = links[index];
    image.alt = link.querySelector('img').alt;
    image.src = link.href;
    fullSize.href = link.href;
    document.getElementById('gallery-dialog-caption').textContent = document.getElementById(link.dataset.captionId).textContent;
    document.getElementById('gallery-position').textContent = (index + 1) + ' of ' + links.length;
    document.getElementById('gallery-error').classList.add('hidden');
  }
  document.getElementById('space').addEventListener('click', function (event) {
    const link = event.target.closest('.gallery-link');
    if (!link || !links.includes(link)) return;
    event.preventDefault();
    opener = link;
    showPhoto(links.indexOf(link));
    dialog.showModal();
  });
  document.getElementById('gallery-next').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, 1, links.length));
  });
  document.getElementById('gallery-previous').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, -1, links.length));
  });
  dialog.addEventListener('keydown', function (event) {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') showPhoto(0);
      else if (event.key === 'End') showPhoto(links.length - 1);
      else showPhoto(getNextPhotoIndex(photoIndex, event.key === 'ArrowRight' ? 1 : -1, links.length));
    }
  });
  dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  image.addEventListener('error', function () { document.getElementById('gallery-error').classList.remove('hidden'); });
  image.addEventListener('load', function () { document.getElementById('gallery-error').classList.add('hidden'); });
});
