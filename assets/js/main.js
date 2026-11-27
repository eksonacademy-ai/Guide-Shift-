(function () {
  'use strict';
  // Preloader: shown once per session, hidden when the page has loaded (never shorter than 700 ms,
  // never longer than 3 s). A CSS failsafe also hides it if scripts are blocked.
  var pl = document.getElementById('preloader');
  if (pl) {
    var plDone = false;
    var plStart = window.__plStart || Date.now();
    var plHide = function () {
      if (plDone) return;
      plDone = true;
      setTimeout(function () {
        pl.classList.add('pl-done');
        setTimeout(function () { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 700);
      }, Math.max(0, 700 - (Date.now() - plStart)));
    };
    if (document.readyState === 'complete') plHide();
    else window.addEventListener('load', plHide);
    setTimeout(plHide, 3000);
  }

  // Days left until Dynamics 365 Guides end of support (31 Dec 2026, end of day)
  var el = document.getElementById('days-left');
  if (el) {
    var end = new Date(2026, 11, 31, 23, 59, 59);
    var days = Math.ceil((end - new Date()) / 86400000);
    if (days > 1) el.textContent = days + ' days left';
    else if (days === 1) el.textContent = '1 day left';
    else el.textContent = 'Support has ended';
  }


  // Set BUY_URL to the UCG portal address; every "Buy Now" button will then open it.
  var BUY_URL = '';
  if (BUY_URL) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-buy]'), function (a) {
      a.href = BUY_URL; a.target = '_blank'; a.rel = 'noopener';
    });
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
  var targets = document.querySelectorAll('.section-head, .pillar, .feature, .price-card, .industry, .option, .card, .steps li, .table-wrap, .stat, .bars, .faq details, .split > *, .cta .stack, .cta form');
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

  // Contact form. If data-endpoint is set (Web3Forms) the inquiry is sent by email to every
  // recipient. Web3Forms binds one access key to one mailbox; the key in data-access-keys is bound to
  // Cs@guideshift.ltd. (More recipients: list one extra key per mailbox, comma separated.) Otherwise it opens an email draft.
  var RECIPIENTS = ['Cs@guideshift.ltd'];
  var KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var form = document.getElementById('demo-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  var btn = form.querySelector('button[type="submit"]');
  function show(text, isError) {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = 'form-msg' + (isError ? ' error' : '');
  }
  var LABELS = { name: 'Name', company: 'Company', email: 'Work email', role: 'Role', phone: 'Phone', d365: 'Uses Dynamics 365 Guides', guides: 'Number of guides', devices: 'Devices in use', country: 'Country or region', type: 'Business type', site: 'Website', message: 'Details' };
  var KEYS = Array.prototype.map.call(form.elements, function (el) { return el.name; }).filter(function (n, i, a) { return n && n !== 'website' && a.indexOf(n) === i; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.elements['website'] && form.elements['website'].value) { form.reset(); return; }
    var data = {};
    KEYS.forEach(function (k) { data[k] = form.elements[k].value.trim(); });
    var subject = (form.getAttribute('data-subject') || 'GuideShift inquiry') + ' - ' + data.company;
    var endpoint = form.getAttribute('data-endpoint');
    if (endpoint) {
      var base = { subject: subject, from_name: data.name, replyto: data.email };
      KEYS.forEach(function (k) { base[k] = data[k]; });
      var keys = (form.getAttribute('data-access-keys') || form.getAttribute('data-access-key') || '')
        .split(',').map(function (k) { return k.trim(); }).filter(function (k) { return KEY_RE.test(k); });
      if (!keys.length) keys = [''];
      function send(key) {
        var payload = {};
        Object.keys(base).forEach(function (k) { payload[k] = base[k]; });
        if (key) payload.access_key = key;
        return fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (!r.ok || d.success === false) throw new Error(d.message || ('Server replied ' + r.status));
            return true;
          });
        });
      }
      btn.disabled = true;
      var failures = [];
      Promise.all(keys.map(function (k) {
        return send(k).then(function () { return true; }, function (err) { failures.push(err); return false; });
      })).then(function (results) {
        if (results.some(Boolean)) {
          form.reset();
          show('Thank you. Your inquiry has been sent and our team will contact you shortly.');
        } else {
          var err = failures[0];
          var why = (err && err.message === 'Failed to fetch') ? 'connection blocked by the browser or network' : (err && err.message) || 'unknown error';
          show('Sorry, we could not send your inquiry (' + why + '). Please email us at ' + RECIPIENTS.join(' or ') + '.', true);
        }
      }).then(function () { btn.disabled = false; });
      return;
    }
    var f = function (k) { return data[k] || '-'; };
    var lines = KEYS.map(function (k) { return (LABELS[k] || k) + ': ' + (data[k] || '-'); });
    window.location.href = 'mailto:' + RECIPIENTS.join(',') + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
    show('Your email app should open with your details. If it does not, please write to ' + RECIPIENTS.join(' or ') + '.');
  });
})();
