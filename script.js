'use strict';

const params = new URLSearchParams(window.__DEMO_PARAMS__ ?? window.location.search);
const company = (params.get('e')?.trim() || params.get('n')?.trim() || '').slice(0, 80);
const form = document.querySelector('#quote');
const fields = form.querySelector('fieldset');
const service = document.querySelector('#service');
const area = document.querySelector('#area');
const detail = document.querySelector('#detail');
const prepared = document.querySelector('#prepared');
const note = document.querySelector('#contact-note');
const direct = document.querySelector('#direct');
const mobileWhatsapp = document.querySelector('#mobile-whatsapp');
const mobileError = document.querySelector('#mobile-contact-error');
document.querySelector('#year').textContent = new Date().getFullYear();

if (company) {
  document.querySelectorAll('[data-brand]').forEach(element => { element.textContent = company; });
  document.title = company + ' | Poda y cuidado de árboles · Demo';
}

function normalizePhone(value) {
  if (!value || value.length > 40 || !/^\+?[\d .()-]+$/.test(value.trim())) return null;
  let national = value.replace(/\D/g, '');
  if (national.startsWith('549') && national.length === 13) national = national.slice(3);
  else if (national.startsWith('54') && national.length === 12) national = national.slice(2);
  else if (national.startsWith('0') && national.length === 11) national = national.slice(1);
  return /^[1-9]\d{9}$/.test(national) ? '549' + national : null;
}

const phone = normalizePhone(params.get('t'));
const invalidPhone = params.has('t') && (params.getAll('t').length !== 1 || phone === null);
const defaultNote = phone
  ? 'Podés revisar y enviar la consulta desde WhatsApp.'
  : 'Demo interactiva. WhatsApp se abre para que elijas un destinatario.';

function contactUrl(message) {
  const url = new URL('https://wa.me/');
  if (phone) url.pathname = '/' + phone;
  url.searchParams.set('text', message);
  return url.href;
}

function clearPreparedMessage() {
  prepared.hidden = true;
  prepared.removeAttribute('href');
  note.textContent = defaultNote;
}

if (invalidPhone) {
  direct.hidden = true;
  mobileWhatsapp.hidden = true;
  mobileError.hidden = false;
  note.textContent = 'El teléfono de este enlace de demostración no es válido.';
} else {
  note.textContent = defaultNote;
  direct.href = contactUrl('Hola, quisiera consultar por un trabajo de poda.');
  mobileWhatsapp.href = direct.href;
  form.addEventListener('input', clearPreparedMessage);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const neighborhood = area.value.trim();
    if (!neighborhood) {
      area.setCustomValidity('Escribí el barrio o la localidad.');
      area.reportValidity();
      return;
    }
    const lines = [
      'Hola, quisiera pedir un presupuesto.',
      'Servicio: ' + service.value,
      'Barrio o localidad: ' + neighborhood
    ];
    if (detail.value.trim()) lines.push('Detalle: ' + detail.value.trim());
    prepared.href = contactUrl(lines.join('\n'));
    prepared.hidden = false;
    note.textContent = 'La consulta está lista para abrir en WhatsApp.';
    prepared.focus();
  });
  area.addEventListener('input', () => area.setCustomValidity(''));
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      service.value = link.dataset.service;
      clearPreparedMessage();
    });
  });
  fields.disabled = false;
}
