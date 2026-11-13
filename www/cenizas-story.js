/* THE O|F · MODO HISTORIA: misiones, diálogos con retrato, barras de cine, carteles de misión y guía al objetivo. */
(function () {
  'use strict';
  const D = window.CZ_STORY_DATA; if (!D) return;
  let A = null, S = null, step = null, mis = null, list = null;
  const $ = s => document.querySelector(s);
  const HUM = () => A.me.faction === 'ork' ? ['saqueador', 'tirador'] : ['soldado', 'patrulla'];
  const kindsOf = k => k === 'HUM' ? HUM() : Array.isArray(k) ? k : [k];
  const nameOf = k => k === 'VOS' ? (A.me.nick || 'VOS').toUpperCase() : D.names[k] || (k || '').toUpperCase().replace(/_/g, ' ');

  /* ---------- interfaz ---------- */
  function ui() { if ($('#st-ui')) return;
    const css = document.createElement('style'); css.textContent = `
#st-obj{position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:max(64px,calc(env(safe-area-inset-top,0px) + 56px));max-width:min(46vw,360px);pointer-events:none;z-index:5;font-size:11.5px;letter-spacing:.05em;color:#e8c070;text-shadow:0 1px 3px #000;background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0));padding:5px 10px 5px 8px;border-left:2px solid #e8c070}
#st-obj b{display:block;font-family:Bebas,sans-serif;font-weight:400;font-size:15px;letter-spacing:.16em;color:#f1efe9}
.st-bar{position:fixed;left:0;right:0;height:0;background:#000;z-index:26;transition:height .45s ease}
#st-top{top:0}#st-bot{bottom:0}body.cine .st-bar{height:11vh}
#st-dlg{position:fixed;left:50%;bottom:calc(11vh + 6px);transform:translateX(-50%);width:min(92vw,calc(34vh * 3),860px);aspect-ratio:1086/362;z-index:27;background:url(/a/ob/dialogo.png) center/100% 100% no-repeat;display:none}
body.cine #st-dlg{display:block}
#st-por{position:absolute;left:5.4%;top:15.5%;width:15%;height:59%;object-fit:cover;image-rendering:auto;background:#111}
#st-nm{position:absolute;left:23%;top:13%;font-family:Bebas,sans-serif;font-size:clamp(16px,3.2vh,24px);letter-spacing:.18em;color:#e8c070}
#st-tx{position:absolute;left:23%;right:7%;top:26%;bottom:20%;font-family:Elite,monospace;font-size:clamp(13px,2.7vh,18px);line-height:1.4;color:#ece8de;overflow:hidden}
#st-nx{position:absolute;right:8%;bottom:14%;font-size:11px;letter-spacing:.14em;color:#8e8b84;animation:stb 1s infinite}
@keyframes stb{50%{opacity:.25}}
#st-card{position:fixed;inset:0;z-index:28;display:none;align-items:center;justify-content:center;flex-direction:column;background:rgba(0,0,0,.86);text-align:center;pointer-events:none}
#st-card.on{display:flex;animation:stc 3.2s ease forwards}
#st-card small{font-family:TechMono,monospace;font-size:13px;letter-spacing:.4em;color:#8e8b84}
#st-card b{font-family:Bebas,sans-serif;font-weight:400;font-size:clamp(34px,9vh,72px);letter-spacing:.14em;color:#f1efe9;animation:stg .18s steps(2) 6}
#st-card i{font-style:normal;font-family:Elite,monospace;font-size:14px;color:#bdb8ae;margin-top:8px;max-width:80vw}
#st-card::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px);animation:stn .12s steps(3) infinite}
@keyframes stc{0%{opacity:0}10%{opacity:1}82%{opacity:1}100%{opacity:0}}
@keyframes stg{0%{transform:translateX(-3px);text-shadow:3px 0 #d23a2c,-3px 0 #4aa3c9}100%{transform:translateX(2px);text-shadow:-2px 0 #d23a2c,2px 0 #4aa3c9}}
@keyframes stn{0%{transform:translateY(0)}100%{transform:translateY(3px)}}
#st-log{position:fixed;right:max(12px,env(safe-area-inset-right,0px));top:max(52px,calc(env(safe-area-inset-top,0px) + 46px));z-index:5}
`; document.head.appendChild(css);
    const d = document.createElement('div'); d.id = 'st-ui';
    d.innerHTML = '<div id="st-obj" hidden><b id="st-t"></b><span id="st-s"></span></div><div class="st-bar" id="st-top"></div><div class="st-bar" id="st-bot"></div>' +
      '<div id="st-dlg"><canvas id="st-pc" width="160" height="200" hidden></canvas><img id="st-por" alt=""><div id="st-nm"></div><div id="st-tx"></div><div id="st-nx">TOCÁ PARA SEGUIR ▸</div></div><div id="st-card"><small id="st-cs"></small><b id="st-cb"></b><i id="st-ci"></i></div>';
    document.body.appendChild(d);
    $('#st-dlg').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); next(); });
    $('#st-top').addEventListener('pointerdown', e => { e.stopPropagation(); next(); }); $('#st-bot').addEventListener('pointerdown', e => { e.stopPropagation(); next(); });
  }
  /* ---------- retratos: dibujados (a/av) o busto sacado de la planilla ---------- */
  const busts = {}; const AVSEL = [];
  function portrait(k) {
    if (D.portraits[k]) return '/a/av/' + D.portraits[k] + '.jpg';
    if (k === 'RADIO') return '/a/it/radio.png';
    if (k === 'VOS' && A.look && AVSEL.includes(A.look.pj)) return '/a/av/' + A.look.pj + '.jpg';
    if (busts[k]) return busts[k];
    let spr = null; try { spr = k === 'VOS' ? A.charSprite(A.look || {}, 'd', 0, false) : A.charSprite({ npc: k }, 'd', 0, false); } catch (e) {}
    if (!spr || !spr.hd) return '/a/it/aviso.png';
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 200; const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, '#3a3836'); gr.addColorStop(1, '#141312'); g.fillStyle = gr; g.fillRect(0, 0, 160, 200);
    g.imageSmoothingEnabled = true; g.drawImage(spr, 58, 14, 140, 175, -20, -6, 200, 250);
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < 200; y += 3) g.fillRect(0, y, 160, 1);
    try { const u = cv.toDataURL('image/jpeg', .85); if (k !== 'VOS') busts[k] = u; return u; } catch (e) { return '/a/it/aviso.png'; }
  }
  /* ---------- diálogos ---------- */
  let queue = [], onDone = null, typing = null;
  function say(lines, cb) { if (!lines || !lines.length) { cb && cb(); return; } queue = lines.slice(); onDone = cb; A.setPaused(true); document.body.classList.add('cine'); show(); }
  function show() { const [k, txt] = queue[0]; $('#st-nm').textContent = nameOf(k); $('#st-por').src = portrait(k);
    const el = $('#st-tx'); el.textContent = ''; let i = 0; clearInterval(typing); typing = setInterval(() => { i += 2; el.textContent = txt.slice(0, i); if (i >= txt.length) { clearInterval(typing); typing = null; } }, 22); A.SND && A.SND.pick && A.SND.pick(); }
  function next() { if (!queue.length) return; if (typing) { clearInterval(typing); typing = null; $('#st-tx').textContent = queue[0][1]; return; }
    queue.shift(); if (queue.length) return show(); document.body.classList.remove('cine'); A.setPaused(false); const cb = onDone; onDone = null; cb && setTimeout(cb, 250); }
  function card(small, big, sub, cb) { const c = $('#st-card'); $('#st-cs').textContent = small; $('#st-cb').textContent = big; $('#st-ci').textContent = sub || ''; c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); A.SND && A.SND.zone && A.SND.zone(); setTimeout(() => { c.classList.remove('on'); cb && cb(); }, 3200); }

  /* ---------- progreso ---------- */
  function save() { A.INV.story = S; A.persist(); }
  function objective() { const o = $('#st-obj'); if (!mis) { o.hidden = true; return; } o.hidden = false;
    $('#st-t').textContent = 'MISIÓN ' + String(S.m + 1).padStart(2, '0') + ' · ' + mis.t;
    let extra = ''; if (step.kill) extra = ' (' + S.c + '/' + step.n + ')'; if (step.get) extra = ' (' + Math.min(step.n, A.INV.items[step.get] || 0) + '/' + step.n + ')'; if (step.survive) extra = ' (' + Math.max(0, Math.ceil(step.survive - S.c)) + ' s)';
    const here = step.map && step.map !== A.mapKey && !step.go ? ' · en ' + (A.MAPS[step.map] ? A.MAPS[step.map].name : step.map) : '';
    $('#st-s').textContent = '▸ ' + step.txt + extra; }
  function setMission(i, fresh) { S.m = i; mis = list[i]; S.s = fresh ? 0 : S.s; S.c = fresh ? 0 : S.c; if (!mis) { step = null; objective(); return; } step = mis.steps[S.s]; save();
    if (fresh) card('MISIÓN ' + String(i + 1).padStart(2, '0'), mis.t, '', () => say(mis.intro, () => { prep(); objective(); })); else { prep(); objective(); } }
  function advance() { S.s++; S.c = 0; S.loose = false; spawned = {}; if (S.s >= mis.steps.length) return finish(); step = mis.steps[S.s]; save(); prep(); objective(); A.toast('▸ ' + step.txt); }
  function finish() { const r = mis.reward || {}; if (r.xp) A.giveXp(r.xp); if (r.coins) A.giveCoins(r.coins); Object.entries(r.items || {}).forEach(([k, n]) => A.addItem(k, n)); A.quickBtns(); A.INV.racha = 0;
    const done = mis; S.done = (S.done || []).concat(done.id); step = null; mis = null; objective(); save();
    card('MISIÓN CUMPLIDA', done.t, '+' + (r.xp || 0) + ' XP · +' + (r.coins || 0) + ' $' + Object.entries(r.items || {}).map(([k, n]) => ' · ' + (A.ITEMS[k] ? A.ITEMS[k].n : k) + ' ×' + n).join(''), () => {
      if (done.fin) { if (window.CZ_FINAL) { A.setPaused(true); return CZ_FINAL.play(A.me.faction, () => { A.setPaused(false); card('THE O|F', 'FIN', done.fin + ' · El mundo sigue abierto: recorrelo libre.', () => {}); }); } return card('THE O|F', 'FIN', done.fin, () => {}); }
      setTimeout(() => setMission(S.m + 1, true), 1200); }); }
  /* ---------- lugares ---------- */
  function posOf(st, mapK) { const m = A.MAPS[mapK || st.map]; if (!m) return [0, 0]; const at = st.at || [0, 0]; let x = m.spawn[0] + at[0], y = m.spawn[1] + at[1];
    const W = A.WS; if (!A.walkable(x * W, y * W) || A.mapKey !== (mapK || st.map)) { if (A.mapKey === (mapK || st.map)) { let best = null, bd = 1e9; for (let r = 10; r < 600 && !best; r += 14) for (let a = 0; a < 6.28; a += .3) { const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; if (A.walkable(nx * W, ny * W)) { const d = Math.hypot(nx - x, ny - y); if (d < bd) { bd = d; best = [nx, ny]; } } } if (best) [x, y] = best; } }
    return [Math.round(x), Math.round(y)]; }
  let spawned = {}, place = {};
  function prep() { if (!step || A.mapKey !== step.map && !(step.go && A.mapKey === step.go)) return; const k = S.m + '-' + S.s + '-' + A.mapKey; if (spawned[k]) return; spawned[k] = 1;
    if ((step.talk || step.use) && step.map === A.mapKey) place[k] = posOf(step);
    if (step.kill && step.spawn) { const ks = kindsOf(step.kill); setTimeout(() => { for (let i = 0; i < step.n - S.c; i++) { const p = randomAround(500, 900); if (!p || !A.spawnMob(ks[i % ks.length], p[0], p[1])) S.loose = true; } }, 900); }
    if (step.get) { const have = A.INV.items[step.get] || 0; for (let i = have; i < step.n; i++) setTimeout(() => A.spawnPickup(step.get), 600 + i * 200); } }
  function randomAround(min, max) { const P = A.P; for (let k = 0; k < 80; k++) { const a = Math.random() * 6.28, r = min + Math.random() * (max - min), x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r * .7; if (A.walkable(x, y)) return [x, y]; } return null; }
  /* ---------- camino al objetivo: BFS por las salidas ---------- */
  function route(from, to) { if (from === to) return null; const prev = { [from]: null }, q = [from]; while (q.length) { const k = q.shift(); for (const e of (A.MAPS[k].exits || [])) { if (!e.to || !A.MAPS[e.to] || e.to in prev) continue; prev[e.to] = [k, e]; if (e.to === to) { let cur = to, first = null; while (prev[cur]) { first = prev[cur][1]; cur = prev[cur][0]; } return first; } q.push(e.to); } } return null; }
  const REDIR = { oficina_presente: 'oficina_ruina' }; /* mapas sin salida propia: se llega por la puerta de otro */
  function redir(to) { if (!step) return null; const tm = step.go || step.map; return (tm && REDIR[tm] === to) ? tm : null; }
  function target() { if (!step) return null; let tm = step.go || step.map; if (!tm) return null; if (REDIR[tm] && A.mapKey === REDIR[tm]) { const e = (A.MAPS[A.mapKey].exits || [])[0]; return e ? { x: (e.r[0] + e.r[2]) / 2, y: (e.r[1] + e.r[3]) / 2, lab: 'SALÍ Y VOLVÉ A ENTRAR' } : null; } if (REDIR[tm] && A.mapKey !== tm) tm = REDIR[tm];
    if (A.mapKey !== tm) { const e = route(A.mapKey, tm); return e ? { x: (e.r[0] + e.r[2]) / 2, y: (e.r[1] + e.r[3]) / 2, lab: e.label || 'SALIDA' } : null; }
    if (step.talk || step.use) { const k = S.m + '-' + S.s + '-' + A.mapKey; const n = (step.talk && worldNpc()) || null; if (n) return { x: n.x, y: n.y, lab: nameOf(step.talk) }; const p = place[k]; return p ? { x: p[0], y: p[1], lab: step.use ? 'ACTIVAR' : 'HABLAR' } : null; }
    const P = A.P, WS_ = A.WS, near = (arr) => { let b = null, bd = 1e18; arr.forEach(o => { const d = (o.x - P.x) ** 2 + (o.y - P.y) ** 2; if (d < bd) { bd = d; b = o; } }); return b; };
    if (step.kill) { const ks = kindsOf(step.kill); const m = near(A.mobs.filter(o => o.hp > 0 && (o.story || ks.includes(o.kind)))); if (m) return { x: m.x / WS_, y: m.y / WS_, lab: 'ENEMIGO' }; }
    if (step.get) { const q = near(A.pickups.filter(q => q.k === step.get)); if (q) return { x: q.x / WS_, y: q.y / WS_, lab: 'BUSCAR' }; }
    return null; }
  function worldNpc() { const n = ((A.MAP && A.MAP.npcs) || []).find(x => x.k === step.talk); return n || null; }

  /* ---------- API que usa el motor ---------- */
  const H = window.CZ_STORY = {
    init(api) { A = api; ui(); list = D[A.me.faction === 'ork' ? 'ork' : 'rebel'];
      S = A.INV.story && A.INV.story.fac === A.me.faction ? A.INV.story : { fac: A.me.faction, m: 0, s: 0, c: 0, done: [] };
      if (S.m >= list.length) { mis = null; step = null; objective(); return; }
      const fresh = !A.INV.story || A.INV.story.fac !== A.me.faction; setTimeout(() => setMission(S.m, fresh && S.s === 0), 2600); },
    enter(k) { if (!A || !step) return; spawned = {}; if (step.go && step.go === k) { setTimeout(advance, 600); return; } setTimeout(() => { prep(); objective(); }, 300); },
    tick(dt) { if (!step || !A) return; const P = A.P;
      if (step.go && step.go === A.mapKey) { advance(); return; }
      if (step.get && (A.INV.items[step.get] || 0) >= step.n) { advance(); return; }
      if (step.survive && step.map === A.mapKey && !P.dead) { S.c += dt; if (((S.c * 10) | 0) % 10 === 0) objective(); H._w = (H._w || 0) - dt; const alive = A.mobs.filter(o => o.story).length;
        if (H._w <= 0 && alive < 5) { H._w = 3.2; const ks = kindsOf(step.kinds || 'HUM'), p = randomAround(450, 800); if (p) A.spawnMob(ks[(Math.random() * ks.length) | 0], p[0], p[1]); }
        if (S.c >= step.survive) advance(); }
      H._o = (H._o || 0) - dt; if (H._o <= 0) { H._o = 1; objective(); } },
    kill(kind) { if (!step || !step.kill || step.map !== A.mapKey) return; if (!kindsOf(step.kill).includes(kind) && !(A.MOB[kind] && !A.MOB[kind].boss && step.kill !== 'pablo' && S.loose)) return; S.c++; objective(); if (S.c >= step.n) setTimeout(advance, 500); },
    died() { if (step && step.survive) S.c = Math.max(0, S.c - 10); },
    canWarp() { return !queue.length; },
    npcs(k) { if (!step || step.map !== k || !(step.talk || step.use)) return []; if (step.talk && worldNpc()) return []; const pk = S.m + '-' + S.s + '-' + k; const p = place[pk] || (place[pk] = posOf(step));
      if (step.talk) return [{ k: step.talk, nm: nameOf(step.talk), line: '…', x: p[0], y: p[1], story: true, sc: step.sc }];
      return [{ k: 'obj_' + step.use, nm: step.nm, line: '', x: p[0], y: p[1], story: true, obj: true, ob: step.ob }]; },
    talkHook(n) { if (!step || !step.talk || step.map !== A.mapKey || n.k !== step.talk) return false; H.talk(n); return true; },
    talk(n) { if (!step) return; if (step.use) { if (step.need) { const miss = Object.entries(step.need).filter(([k, c]) => (A.INV.items[k] || 0) < c); if (miss.length) return A.toast('Te falta: ' + miss.map(([k, c]) => A.ITEMS[k].n + ' ×' + c).join(', ')); Object.entries(step.need).forEach(([k, c]) => A.takeItem(k, c)); }
        if (step.give) Object.entries(step.give).forEach(([k, c]) => A.addItem(k, c));
        const w = step.warp; return say(step.lines || [['VOS', 'Listo.']], () => { if (w) { A.warpTo(w[0], w[1], w[2]); } advance(); }); }
      say(step.lines, advance); },
    ents(ents, W2S, c, zoom, WS) { if (!step || !step.use || step.map !== A.mapKey) return; const pk = S.m + '-' + S.s + '-' + A.mapKey, p = place[pk]; if (!p) return; const im = A.img('/a/ob/' + (step.ob || 'caja') + '.png');
      ents.push({ y: p[1] * WS - 1, draw: () => { if (!A.ok(im)) return; const [sx, sy] = W2S(p[0] * WS, p[1] * WS), h = 150 * zoom, w = im.naturalWidth / im.naturalHeight * h; c.drawImage(im, sx - w / 2, sy - h + 10 * zoom, w, h);
        const a = .5 + Math.sin(performance.now() / 300) * .4; c.strokeStyle = 'rgba(232,192,112,' + a + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx, sy + 6 * zoom, w * .55, 16 * zoom, 0, 0, 7); c.stroke();
        c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#e8c070'; c.fillText(step.nm, sx, sy - h - 2); } }); },
    draw(c, W2S, VW, VH, zoom, WS) { const tg = target(); if (!tg || !A.P) return; const [sx, sy] = W2S(tg.x * WS, tg.y * WS), [px, py] = W2S(A.P.x, A.P.y - 90); const t_ = performance.now() / 1000;
      const on = sx > 40 && sx < VW - 40 && sy > 70 && sy < VH - 40, dist = Math.hypot(sx - px, sy - py);
      if (on) { const b = Math.sin(t_ * 4) * 7, y0 = sy - 150 * zoom + b; c.fillStyle = '#e8c070'; c.strokeStyle = 'rgba(0,0,0,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx, y0); c.lineTo(sx - 15, y0 - 24); c.lineTo(sx + 15, y0 - 24); c.closePath(); c.stroke(); c.fill();
        c.font = '12px TechMono, monospace'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeText(tg.lab || '', sx, y0 - 32); c.fillText(tg.lab || '', sx, y0 - 32); }
      if (on && dist < 260) return;
      /* flecha alrededor del personaje que apunta al objetivo (o a la salida que lleva a él) */
      const ang = Math.atan2(sy - py, sx - px), r = 115 * Math.max(.8, zoom), ax = px + Math.cos(ang) * r, ay = py + Math.sin(ang) * r, pulse = 1 + Math.sin(t_ * 5) * .08;
      c.save(); c.translate(ax, ay); c.rotate(ang); c.scale(pulse, pulse); c.fillStyle = 'rgba(232,192,112,.95)'; c.strokeStyle = 'rgba(0,0,0,.75)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(26, 0); c.lineTo(-12, -16); c.lineTo(-4, 0); c.lineTo(-12, 16); c.closePath(); c.stroke(); c.fill(); c.restore();
      const lx = px + Math.cos(ang) * (r + 44), ly = py + Math.sin(ang) * (r + 44) + 4; c.font = '12px TechMono, monospace'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; c.fillStyle = '#f0d696';
      const txt = (tg.lab || 'OBJETIVO') + ' · ' + Math.max(1, Math.round(dist / Math.max(.3, zoom) / 40)) + ' m'; c.strokeText(txt, lx, ly); c.fillText(txt, lx, ly); },
    wants(k) { return !!(step && step.talk === k && (step.go || step.map) === A.mapKey); },
    redir, say, card,
    jump(m, s_) { S.m = m; S.s = s_; S.c = 0; mis = list[m]; step = mis.steps[s_]; spawned = {}; place = {}; prep(); objective(); return step; },
    get step() { return step; }, get list() { return list; }
  };
})();
