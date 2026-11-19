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
  var targets = document.querySelectorAll('.section-head, .pillar, .feature, .industry, .option, .card, .steps li, .table-wrap, .faq details, .split > *, .cta .stack, .cta form');
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

  // Contact form: builds an email to info@eksontech.com from the entered details.
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
    var f = function (k) { return form.elements[k].value.trim() || '-'; };
    var lines = [
      'Name: ' + f('name'),
      'Company: ' + f('company'),
      'Role: ' + f('role'),
      'Phone: ' + f('phone'),
      'Uses Dynamics 365 Guides: ' + f('d365'),
      'Number of guides: ' + f('guides'),
      'Headsets in use: ' + f('devices'),
      'Preferred deployment: ' + f('deploy'),
      '',
      'Details:',
      form.elements['message'].value.trim() || '-'
    ];
    var subject = 'Guide Shift inquiry - ' + form.elements['company'].value.trim();
    window.location.href = 'mailto:info@eksontech.com?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
    show('Your email app should open with your details. If it does not, please write to info@eksontech.com.');
  });
})();
