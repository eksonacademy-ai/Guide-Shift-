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


  // Header shadow and reading progress bar.
  var header = document.querySelector('.site-header');
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (header) header.classList.toggle('scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll with a small stagger inside each group.
  var targets = document.querySelectorAll('.section-head, .pillar, .feature, .industry, .option, .card, .steps li, .table-wrap, .stat, .bars, .faq details, .split > *, .cta .stack, .cta form');
  if ('IntersectionObserver' in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) {
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(sibs, 5) * 0.08 + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Contact form. If data-endpoint is set (Formspree / Web3Forms / own handler) the
  // inquiry is sent directly to info@eksontech.com; otherwise it opens an email draft.
  var form = document.getElementById('demo-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  var btn = form.querySelector('button[type="submit"]');
  function show(text, isError) {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = 'form-msg' + (isError ? ' error' : '');
  }
  var LABELS = { name: 'Name', company: 'Company', email: 'Work email', role: 'Role', phone: 'Phone', d365: 'Uses Dynamics 365 Guides', guides: 'Number of guides', devices: 'Headsets in use', deploy: 'Preferred deployment', country: 'Country or region', type: 'Business type', site: 'Website', message: 'Details' };
  var KEYS = Array.prototype.map.call(form.elements, function (el) { return el.name; }).filter(function (n, i, a) { return n && n !== 'website' && a.indexOf(n) === i; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.elements['website'] && form.elements['website'].value) { form.reset(); return; }
    var data = {};
    KEYS.forEach(function (k) { data[k] = form.elements[k].value.trim(); });
    var subject = (form.getAttribute('data-subject') || 'Guide Shift inquiry') + ' - ' + data.company;
    var endpoint = form.getAttribute('data-endpoint');
    if (endpoint) {
      var payload = { subject: subject, from_name: data.name, replyto: data.email, _replyto: data._replyto };
      KEYS.forEach(function (k) { payload[k] = data[k]; });
      var key = form.getAttribute('data-access-key');
      if (key) payload.access_key = key;
      btn.disabled = true;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok || d.success === false) throw new Error(d.message || ('Server replied ' + r.status));
          form.reset();
          show('Thank you. Your inquiry has been sent and our team will contact you shortly.');
        });
      }).catch(function (err) {
        var why = (err && err.message === 'Failed to fetch') ? 'connection blocked by the browser or network' : (err && err.message) || 'unknown error';
        show('Sorry, we could not send your inquiry (' + why + '). Please email us at info@eksontech.com.', true);
      }).then(function () { btn.disabled = false; });
      return;
    }
    var f = function (k) { return data[k] || '-'; };
    var lines = KEYS.map(function (k) { return (LABELS[k] || k) + ': ' + (data[k] || '-'); });
    window.location.href = 'mailto:info@eksontech.com?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
    show('Your email app should open with your details. If it does not, please write to info@eksontech.com.');
  });
})();
