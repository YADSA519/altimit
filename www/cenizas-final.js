/* THE O|F · el final: el rift, los créditos y el último video. Después vuelve al juego libre. */
(function () {
  'use strict';
  const CSS = `
  #fin{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;font-family:'Bebas',Impact,sans-serif;color:#f1e6d2;touch-action:none}
  #fin .pn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1.1s}
  #fin .pn.on{opacity:1}
  #fin .pn .bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(26px) brightness(.45)}
  #fin .pn img{position:relative;height:94vh;max-width:94vw;object-fit:contain;box-shadow:0 0 60px rgba(0,0,0,.9);border-radius:4px;animation:kb var(--d) linear forwards}
  @keyframes kb{from{transform:scale(1.0) translate(0,0)}to{transform:scale(1.09) translate(var(--tx),var(--ty))}}
  #fin canvas{position:absolute;inset:0;width:100%;height:100%}
  #fin .cr{position:absolute;inset:0;opacity:0;transition:opacity 1.6s}
  #fin .cr.on{opacity:1}
  #fin .cr .bg{position:absolute;inset:-40px;background:url(/a/final/creditos.jpg) center/cover;filter:blur(24px) brightness(.3)}
  #fin .cr .art{position:absolute;left:3%;top:3vh;height:94vh;max-width:47%;object-fit:contain;object-position:center;border-radius:4px;box-shadow:0 0 50px rgba(0,0,0,.9);filter:brightness(.9)}
  #fin .cr .sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 48%,rgba(0,0,0,.7) 53%,rgba(0,0,0,.85))}
  #fin .cr .roll{position:absolute;left:52%;right:4%;top:100%;text-align:center;will-change:transform}
  #fin .cr .roll p{margin:0 0 18px;font:15px/1.5 'TechMono',monospace;color:#d8cdb8;letter-spacing:.04em}
  #fin .cr .roll h1{margin:0 0 6px;font-size:54px;letter-spacing:.08em;color:#fff}
  #fin .cr .roll h2{margin:26px 0 2px;font:13px 'TechMono',monospace;letter-spacing:.3em;color:#e9a05a}
  #fin .cr .roll h3{margin:0 0 10px;font-size:34px;letter-spacing:.06em;color:#fff}
  #fin .skip{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:16px;z-index:3;font:13px 'TechMono',monospace;letter-spacing:.2em;color:#e8dcc4;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:8px 14px}
  #fin .fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .25s}`;
  const $ = s => document.querySelector(s);
  function audio(src, vol) { const a = new Audio(src); a.volume = vol; a.play().catch(() => {}); return a; }
  function fadeOut(a, ms) { if (!a) return; const v0 = a.volume, t0 = performance.now(); const f = () => { const k = 1 - (performance.now() - t0) / ms; if (k <= 0) { a.pause(); return; } a.volume = Math.max(0, v0 * k); requestAnimationFrame(f); }; f(); }

  function play(fac, done) {
    if ($('#fin')) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const root = document.createElement('div'); root.id = 'fin'; root.innerHTML = '<canvas></canvas><div class="fl"></div><button class="skip">SALTAR ›</button>'; document.body.appendChild(root);
    let stage = 0, timer = null, music = null, sting = null, raf = 0; const pre = fac === 'ork' ? 'ork' : 'reb';
    const stages = [rift, () => panels(pre, 3800), credits, () => panels('r2', 4200), end];
    const next = () => { clearTimeout(timer); cancelAnimationFrame(raf); stage++; if (stages[stage]) stages[stage](); };
    root.querySelector('.skip').onclick = e => { e.stopPropagation(); next(); };

    /* 1 · el rift se abre: remolino de luz y destello */
    function rift() { sting = audio('/a/final/fin.mp3', .9); const cv = root.querySelector('canvas'), g = cv.getContext('2d'); const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio; const t0 = performance.now();
      const sp = Array.from({ length: 260 }, () => ({ a: Math.random() * 6.283, r: Math.random() * Math.max(W, H) * .7 + 40, s: Math.random() * 2 + .6, c: Math.random() < .5 ? '120,230,255' : '255,210,120' }));
      const f = () => { const t = (performance.now() - t0) / 1000; g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
        sp.forEach(p => { p.a += .02 * p.s * (1 + t); p.r *= .992 - t * .002; const x = W / 2 + Math.cos(p.a) * p.r, y = H / 2 + Math.sin(p.a) * p.r * .6; g.fillStyle = 'rgba(' + p.c + ',' + Math.min(1, .25 + t / 3) + ')'; g.fillRect(x, y, 3 * p.s, 3 * p.s); });
        const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 60 + t * 140); gr.addColorStop(0, 'rgba(230,250,255,' + Math.min(1, t / 3) + ')'); gr.addColorStop(1, 'rgba(60,160,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
        if (t < 3.1) raf = requestAnimationFrame(f); };
      f(); timer = setTimeout(() => { const fl = root.querySelector('.fl'); fl.style.opacity = 1; setTimeout(() => { root.querySelector('canvas').remove(); fl.style.transition = 'opacity 1.4s'; fl.style.opacity = 0; next(); }, 260); }, 3000); }

    /* 2 y 4 · las viñetas, una por una */
    function panels(p, ms) { root.querySelectorAll('.cr').forEach(e => { e.classList.remove('on'); setTimeout(() => e.remove(), 1700); }); let i = 0; const show = () => { root.querySelectorAll('.pn').forEach(e => { e.classList.remove('on'); setTimeout(() => e.remove(), 1200); });
        if (i >= 9) return next(); i++; const src = '/a/final/' + p + i + '.jpg', d = document.createElement('div'); d.className = 'pn';
        d.innerHTML = '<div class="bg" style="background-image:url(' + src + ')"></div><img src="' + src + '" alt="" style="--d:' + (ms + 1200) + 'ms;--tx:' + ((Math.random() * 2 - 1) * 14 | 0) + 'px;--ty:' + ((Math.random() * 2 - 1) * 10 | 0) + 'px">';
        root.insertBefore(d, root.querySelector('.skip')); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); timer = setTimeout(show, ms); };
      show(); }

    /* 3 · créditos sobre la tapa del libro, con la música */
    function credits() { root.querySelectorAll('.pn').forEach(e => e.remove()); fadeOut(sting, 1500); music = audio('/a/final/creditos.mp3', .95);
      const c = document.createElement('div'); c.className = 'cr';
      c.innerHTML = '<div class="bg"></div><img class="art" src="/a/final/creditos.jpg" alt=""><div class="sh"></div><div class="roll"><h1>THE O|F</h1><p>Basado en el libro</p><h3>CENIZAS DE UN FUTURO INCIERTO</h3>'
        + '<p style="margin-top:34px">Gracias por compartir de nuevo<br>un nuevo desafío:<br>hacer este mini juego con una base del libro<br><i>Cenizas de un futuro incierto</i>.</p>'
        + '<h2>CREADO POR</h2><h3>PABLO M. FLORES</h3><h2>PROGRAMADO POR</h2><h3>LOU</h3><h2>CON LA AYUDA DE</h2><h3>POL</h3><h2>Y TODO EL EQUIPO DE</h2><h3>YAD</h3>'
        + '<p style="margin-top:46px;font-size:20px;color:#fff">Gracias a todos.</p></div>';
      root.insertBefore(c, root.querySelector('.skip')); requestAnimationFrame(() => c.classList.add('on'));
      const roll = c.querySelector('.roll'), dur = 38000, t0 = performance.now();
      const f = () => { const k = (performance.now() - t0) / dur, h = roll.offsetHeight, H = innerHeight; roll.style.transform = 'translateY(' + (-k * (h + H * 1.05)) + 'px)'; if (k < 1) raf = requestAnimationFrame(f); else next(); }; f();
      timer = setTimeout(() => {}, dur); }

    /* 5 · vuelve al juego libre */
    function end() { root.querySelectorAll('.pn,.cr').forEach(e => e.classList.remove('on')); fadeOut(music, 2500); fadeOut(sting, 500);
      root.style.transition = 'opacity 2.4s'; setTimeout(() => { root.style.opacity = 0; }, 900); setTimeout(() => { root.remove(); st.remove(); done && done(); }, 3500); }

    stages[0]();
  }
  /* el golpe final: ORK → todo tiembla y se apaga · rebeldes → un hilo dorado se tensa y se corta */
  function drama(fac, done) { if (document.getElementById('fin-dr')) return done && done();
    const cv = document.createElement('canvas'); cv.id = 'fin-dr'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:9998;pointer-events:none';
    document.body.appendChild(cv); const g = cv.getContext('2d'), dpr = devicePixelRatio || 1, W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, t0 = performance.now();
    const ork = fac === 'ork', T = ork ? 5.2 : 5.6, body = document.body, shk = a => { body.style.transform = a ? 'translate(' + ((Math.random() - .5) * a) + 'px,' + ((Math.random() - .5) * a) + 'px)' : ''; };
    try { navigator.vibrate && navigator.vibrate(ork ? [200, 80, 300, 80, 500] : [60, 40, 60, 300, 400]); } catch (e) {}
    const dust = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: Math.random() * 1.5 + .4 }));
    let snapT = 3.2, bits = null;
    const f = () => { const t = (performance.now() - t0) / 1000; g.clearRect(0, 0, W, H);
      if (ork) { const k = Math.min(1, t / 3.6);
        shk(t < 3.8 ? 6 + 22 * Math.sin(Math.min(1, t / 3.8) * Math.PI) : 0);
        if (Math.random() < .08 && t < 3.6) { g.fillStyle = 'rgba(160,0,10,.25)'; g.fillRect(0, 0, W, H); }
        const gr = g.createRadialGradient(W / 2, H / 2, Math.max(0, (1 - k) * Math.max(W, H) * .7), W / 2, H / 2, Math.max(W, H) * (.75 - k * .2) + 1);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + Math.min(1, .3 + k) + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        if (t > 3.6) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, (t - 3.6) / 1) + ')'; g.fillRect(0, 0, W, H); }
        dust.forEach(p => { p.y += p.v * dpr * 2; if (p.y > H) p.y = 0; g.fillStyle = 'rgba(40,10,10,.6)'; g.fillRect(p.x, p.y, 3 * dpr, 3 * dpr); }); }
      else { const y = H * .5, x0 = W * .06, x1 = W * .94;
        g.fillStyle = 'rgba(0,0,0,' + Math.min(.55, t / 3) + ')'; g.fillRect(0, 0, W, H);
        if (t < snapT) { const vib = Math.min(1, t / snapT), amp = (2 + vib * 10) * dpr; g.lineWidth = (3 + vib * 2) * dpr; g.strokeStyle = '#ffd86a'; g.shadowColor = '#ffcc33'; g.shadowBlur = 24 * dpr;
          g.beginPath(); for (let i = 0; i <= 60; i++) { const x = x0 + (x1 - x0) * i / 60, e = Math.sin(i / 60 * Math.PI); g.lineTo(x, y + Math.sin(t * (30 + vib * 50) + i * .9) * amp * e - vib * 18 * dpr * e); } g.stroke(); g.shadowBlur = 0; shk(vib * 6); }
        else { if (!bits) { bits = Array.from({ length: 80 }, () => ({ x: W / 2 + (Math.random() - .5) * 40 * dpr, y, vx: (Math.random() - .5) * 26 * dpr, vy: (Math.random() - .7) * 16 * dpr, l: 1 })); }
          const u = t - snapT; shk(u < 1 ? 26 * (1 - u) : 0); if (u < .15) { g.fillStyle = 'rgba(255,240,190,' + (1 - u / .15) + ')'; g.fillRect(0, 0, W, H); }
          g.strokeStyle = '#ffd86a'; g.lineWidth = 4 * dpr; g.shadowColor = '#ffcc33'; g.shadowBlur = 18 * dpr; const L = Math.min(1, u * 1.6);
          g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 + (W / 2 - x0) * .5, y + H * .35 * L, x0 + 10 * dpr, y + H * .48 * L); g.stroke();
          g.beginPath(); g.moveTo(x1, y); g.quadraticCurveTo(x1 - (x1 - W / 2) * .5, y + H * .35 * L, x1 - 10 * dpr, y + H * .48 * L); g.stroke(); g.shadowBlur = 0;
          bits.forEach(b => { b.x += b.vx; b.y += b.vy; b.vy += .6 * dpr; b.l -= .012; if (b.l > 0) { g.fillStyle = 'rgba(255,215,110,' + b.l + ')'; g.fillRect(b.x, b.y, 3 * dpr, 3 * dpr); } });
          if (u > 1.4) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, (u - 1.4) / .9) + ')'; g.fillRect(0, 0, W, H); } } }
      if (t < T) requestAnimationFrame(f); else { shk(0); cv.remove(); done && done(); } };
    f(); }
  window.CZ_FINAL = { play, drama };
})();
