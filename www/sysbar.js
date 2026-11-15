/* hora y batería (la barra de Android queda escondida, así que la mostramos nosotros) */
(function () {
  const pad = n => String(n).padStart(2, '0'); let bat = null;
  function draw() { const d = new Date(), t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    document.querySelectorAll('.sysbar').forEach(el => { const c = el.querySelector('.sb-c'), b = el.querySelector('.sb-b');
      if (c) c.textContent = t; if (b) { if (bat) { const p = Math.round(bat.level * 100); b.textContent = (bat.charging ? '⚡' : '') + p + '%'; b.style.setProperty('--p', p + '%'); b.classList.toggle('low', p <= 15 && !bat.charging); b.hidden = false; } else b.hidden = true; } }); }
  if (navigator.getBattery) navigator.getBattery().then(b => { bat = b; ['levelchange', 'chargingchange'].forEach(e => b.addEventListener(e, draw)); draw(); }).catch(() => {});
  setInterval(draw, 15000); document.addEventListener('DOMContentLoaded', draw); draw();
})();
