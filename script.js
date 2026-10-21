(() => {
  const menuToggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('#siteNav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  document.querySelectorAll('.program-toggle').forEach(toggle => {
    const detail = toggle.nextElementSibling;
    if (toggle.getAttribute('aria-expanded') === 'true') detail.style.maxHeight = `${detail.scrollHeight}px`;
    toggle.addEventListener('click', () => {
      const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.program-toggle').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = '0px';
      });
      if (shouldOpen) {
        toggle.setAttribute('aria-expanded', 'true');
        detail.style.maxHeight = `${detail.scrollHeight}px`;
      }
    });
  });
  window.addEventListener('resize', () => {
    document.querySelectorAll('.program-toggle[aria-expanded="true"]').forEach(toggle => {
      toggle.nextElementSibling.style.maxHeight = `${toggle.nextElementSibling.scrollHeight}px`;
    });
  });

  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#formStatus');
  const submit = form?.querySelector('button[type="submit"]');
  const csrfInput = document.querySelector('#csrfToken');
  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  // Token is provided by PHP when the project is served through Apache/XAMPP.
  fetch('backend/contact.php?action=token', { headers: { 'Accept': 'application/json' } })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(data => { if (data.csrf_token && csrfInput) csrfInput.value = data.csrf_token; })
    .catch(() => { /* Website still renders when opened as a static frontend. */ });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!csrfInput.value) {
      setStatus('Backend belum aktif. Jalankan website melalui Apache/PHP untuk mengirim formulir.', 'error');
      return;
    }
    submit.disabled = true;
    submit.innerHTML = 'Mengirim…';
    setStatus('');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Permintaan belum dapat dikirim.');
      form.reset();
      if (csrfInput) csrfInput.value = data.csrf_token || '';
      setStatus(data.message || 'Permintaan berhasil dikirim.', 'success');
    } catch (error) {
      setStatus(error.message || 'Terjadi kendala. Coba kembali beberapa saat lagi.', 'error');
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Kirim Permintaan <span aria-hidden="true">→</span>';
    }
  });
})();
