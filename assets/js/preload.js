(function () {
  try {
    if (sessionStorage.getItem('gs-pl')) { document.documentElement.className += ' pl-skip'; }
    else { sessionStorage.setItem('gs-pl', '1'); }
  } catch (e) {}
  window.__plStart = Date.now();
})();
