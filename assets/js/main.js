(function () {
  'use strict';
  // Days left until Dynamics 365 Guides end of support (31 Dec 2026, end of day)
  var el = document.getElementById('days-left');
  if (el) {
    var end = new Date(2026, 11, 31, 23, 59, 59);
    var days = Math.ceil((end - new Date()) / 86400000);
    if (days > 1) el.textContent = days + ' days left';
    else if (days === 1) el.textContent = '1 day left';
    else el.textContent = 'Support has ended';
  }

  // Demo request form.
  // To connect it, set data-endpoint on the <form> to EKSON's contact handler URL
  // (same-origin is easiest; a cross-origin URL must also be added to connect-src in the CSP).
  var form = document.getElementById('demo-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  function show(text, isError) {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = 'form-msg' + (isError ? ' error' : '');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    // Honeypot: bots fill the hidden field, people never see it.
    if (form.elements['website'] && form.elements['website'].value) { form.reset(); return; }
    var ok = 'Thank you. We\u2019ll be in touch to set up your demo workspace.';
    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) { show(ok); form.reset(); return; }
    var data = {};
    ['name', 'company', 'email', 'd365', 'message'].forEach(function (k) { data[k] = form.elements[k].value.trim(); });
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      show(ok); form.reset();
    }).catch(function () {
      show('Sorry, something went wrong. Please try again in a moment.', true);
    });
  });
})();
