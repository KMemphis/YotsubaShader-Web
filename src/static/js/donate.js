// Estimator on the donations page. The page already renders the default numbers, so it works without JavaScript;
// this script recalculates them as the visitor types and builds a request that can be copied.
(() => {
  const root = document.getElementById('estimate');
  if (!root) return;

  const LETTER = 'Request to sponsor Yotsuba Shader\n\nYotsuba Shader is a shader framework and compiler for C#, released under the MIT License. {developers} developers on our team use it. We estimate that it saves each of them about {hours} hours per month, which is worth about {value} per month.\n\nWe propose to sponsor the project with {amount} per month ({share}% of that value) through GitHub Sponsors, so that it stays maintained.\n\nSponsor page: {url}';
  const T = (key) => (window.__YS_T__ && window.__YS_T__[key]) || key;
  const lang = document.documentElement.lang || 'en';
  const money = new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
  const percent = (n) => `${n}%`;

  const $ = (id) => document.getElementById(id);
  const fields = { devs: $('est-devs'), hours: $('est-hours'), rate: $('est-rate'), share: $('est-share') };
  const out = {
    share: $('est-share-out'),
    hours: $('est-hours-total'),
    value: $('est-value'),
    amount: $('est-amount'),
    year: $('est-year'),
  };
  const copy = $('est-copy');
  const sponsors = root.dataset.sponsors || '';

  const read = (el, min, max, fallback) => {
    const n = parseFloat(el.value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  };

  let letter = '';

  function update() {
    const devs = read(fields.devs, 1, 10000, 1);
    const hours = read(fields.hours, 0, 1000, 0);
    const rate = read(fields.rate, 0, 10000, 0);
    const share = read(fields.share, 1, 10, 2);

    const totalHours = devs * hours;
    const value = totalHours * rate;
    const amount = (value * share) / 100;

    out.share.textContent = percent(share);
    out.hours.textContent = `${number.format(totalHours)} h`;
    out.value.textContent = money.format(value);
    out.amount.textContent = money.format(amount);
    out.year.textContent = T('{amount} a year').replace('{amount}', money.format(amount * 12));

    letter = T(LETTER)
      .replace('{developers}', number.format(devs))
      .replace('{hours}', number.format(hours))
      .replace('{value}', money.format(value))
      .replace('{amount}', money.format(amount))
      .replace('{share}', String(share))
      .replace('{url}', sponsors);
  }

  Object.values(fields).forEach((el) => el.addEventListener('input', update));
  update();

  // Copying needs JavaScript, so the button only appears when it can work.
  if (copy) {
    copy.hidden = false;
    const label = copy.querySelector('span');
    const original = label.textContent;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(letter);
      } catch {
        const area = document.createElement('textarea');
        area.value = letter;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); } catch { /* nothing else to try */ }
        area.remove();
      }
      label.textContent = T('Copied');
      setTimeout(() => { label.textContent = original; }, 1800);
    });
  }
})();
