// Email subscription for "What's New": posts to the contact list's public endpoint (no key; the site is on its allow-list).
(() => {
  const form = document.getElementById('sub-form');
  if (!form) return;
  const ok = document.getElementById('sub-ok');
  const err = document.getElementById('sub-err');
  const button = form.querySelector('button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.hidden = true; err.hidden = true;
    const email = form.email.value.trim();
    if (!form.email.checkValidity() || !email) { err.hidden = false; return; }
    button.disabled = true;
    try {
      const res = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: email.split('@')[0], tags: 'news', source: 'web-news', website: form.website.value }),
      });
      if (res.ok) { ok.hidden = false; form.reset(); } else { err.hidden = false; }
    } catch {
      err.hidden = false;
    } finally {
      button.disabled = false;
    }
  });
})();
