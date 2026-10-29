/* CENIZAS 0.1 · Parque del Nogal */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const CAP = window.Capacitor, NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform()), PL = NATIVE && CAP.Plugins ? CAP.Plugins : {};
  const CFG = window.THEOF_CONFIG || window.ALTIMIT_CONFIG || {};
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  /* =================== MAPA =================== */
  const WS = 1.8;                                    // escala imagen → mundo
  const IMG_W = 1672, IMG_H = 941, WORLD_W = IMG_W * WS, WORLD_H = IMG_H * WS;
  const sc = pts => pts.map(p => [p[0] * WS, p[1] * WS]);
  const WALK = sc([[100, 330], [600, 292], [1250, 318], [1390, 398], [1660, 430], [1660, 535], [1420, 545], [1500, 620], [1400, 700], [1110, 720], [1010, 820], [1040, 935], [300, 935], [330, 725], [250, 705], [250, 565], [100, 525]]);
  const BLOCK = [
    sc([[565, 300], [1140, 300], [1140, 478], [1010, 505], [700, 505], [560, 455]]),   // el nogal y el campamento
    sc([[745, 605], [965, 605], [965, 700], [745, 700]]),                              // reja del medio
    sc([[330, 615], [445, 615], [445, 705], [330, 705]]),                              // reja izquierda
    sc([[1425, 530], [1565, 530], [1565, 605], [1425, 605]])                           // banco derecho
  ];
  const FIRE = [1085 * WS, 470 * WS], SPAWN = [905 * WS, 560 * WS], SAFE_R = 420;
  const OSC_SPAWNS = sc([[200, 790], [1440, 640], [300, 420], [1560, 470], [700, 880], [1250, 380]]);
  function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  const walkable = (x, y) => inPoly(x, y, WALK) && !BLOCK.some(b => inPoly(x, y, b));
  const bg = new Image(); bg.src = '/a/parque.jpg';

  /* =================== SPRITES por capas =================== */
  const SKIN = ['#e3d6c8', '#c9ab92', '#9a7860', '#6a4c3c'];
  const HCOL = [['Negro', '#1d1b1a'], ['Castaño', '#4b3a2e'], ['Gris', '#8b8680'], ['Blanco', '#d6d2cc']];
  const HAIR = ['Corto', 'Rapado', 'Largo', 'Revuelto', 'Rodete'];
  const TOPS = { rebel: [['Campera de jean', '#56606c', '#3e4650', '#7a8592'], ['Buzo con capucha', '#6a6a6a', '#4e4e4e', '#868686'], ['Campera negra', '#2c2c2c', '#1c1c1c', '#454545']],
    ork: [['Uniforme gris', '#5a5a5a', '#3f3f3f', '#787878'], ['Chaqueta táctica', '#363636', '#232323', '#4d4d4d'], ['Bata de VIREX', '#b9b2a6', '#8f897e', '#d8d1c4']] };
  const ACC = ['Nada', 'Gorro', 'Capucha', 'Bufanda', 'Máscara'];
  const BODY = ['Hombre', 'Mujer'];
  const PANTS = '#38383a', BOOT = '#161616', RED = '#c9302a', PALO = '#6b5c4c', OUT = '#070707';
  const cache = new Map();
  function sprite(look, dir, frame, atk) {
    const mirror = dir === 'r'; const d = mirror ? 'l' : dir;
    const key = JSON.stringify(look) + d + frame + (atk ? 1 : 0) + (mirror ? 'm' : '');
    if (cache.has(key)) return cache.get(key);
    const base = document.createElement('canvas'); base.width = 16; base.height = 24; const g = base.getContext('2d');
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const fac = look.fac === 'ork' ? 'ork' : 'rebel', top = TOPS[fac][look.top] || TOPS[fac][0], skin = SKIN[look.skin] || SKIN[0], hair = (HCOL[look.hcol] || HCOL[0])[1];
    const fem = look.body === 1, tx0 = fem ? 5 : 4, tw = fem ? 6 : 8;
    // piernas
    if (d === 'l') {
      const a = frame === 1 ? [4, 9] : frame === 2 ? [9, 4] : [6, 7];
      px(a[1], 16, 3, 5, '#2c2c2e'); px(a[1], 21, 3, 2, BOOT); px(a[0], 16, 3, 5, PANTS); px(a[0] - (frame ? 1 : 0), 21, 4, 2, BOOT);
    } else {
      const lu = frame === 1 ? 1 : 0, ru = frame === 2 ? 1 : 0;
      px(5, 16, 3, 5 - lu, PANTS); px(5, 21 - lu, 3, 2, BOOT); px(8, 16, 3, 5 - ru, PANTS); px(8, 21 - ru, 3, 2, BOOT);
    }
    // torso
    if (d === 'l') { px(5, 9, 6, 7, top[1]); px(5, 9, 2, 7, top[3]); px(10, 9, 1, 7, top[2]); }
    else { px(tx0, 9, tw, 7, top[1]); px(tx0 + tw - 1, 9, 1, 7, top[2]); if (d === 'd') { if (look.top === 0 && fac === 'rebel') px(7, 10, 2, 6, top[3]); if (fac === 'ork' && look.top === 2) px(7, 10, 2, 6, '#e8e2d6'); } }
    if (fac === 'ork' && d !== 'l') px(d === 'd' ? 12 - (fem ? 1 : 0) : 3 + (fem ? 1 : 0), 11, 1, 2, RED);
    if (fac === 'ork' && d === 'd') px(6, 11, 1, 1, RED);
    // brazos
    if (d === 'l') {
      if (atk) { px(1, 11, 6, 2, top[1]); px(0, 11, 1, 2, skin); px(0, 5, 1, 7, PALO); px(1, 4, 1, 2, PALO); }
      else { const ax = frame === 1 ? 5 : frame === 2 ? 9 : 7; px(ax, 10, 2, 5, top[1]); px(ax, 15, 2, 1, skin); }
    } else {
      const sl = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      const lx = tx0 - 1, rx = tx0 + tw;
      px(lx, 10 + sl, 1, 5, top[1]); px(lx, 15 + sl, 1, 1, skin);
      if (atk) { if (d === 'd') { px(rx, 10, 1, 6, top[1]); px(rx, 16, 1, 1, skin); px(rx, 17, 1, 7, PALO); } else { px(rx, 6, 1, 5, top[1]); px(rx, 5, 1, 1, skin); px(rx, 0, 1, 5, PALO); } }
      else { px(rx, 10 - sl, 1, 5, top[1]); px(rx, 15 - sl, 1, 1, skin); }
    }
    // cuello y cabeza
    px(7, 8, 2, 1, skin); px(5, 2, 6, 6, skin); px(5, 7, 6, 1, skin);
    if (d === 'd') { px(6, 5, 1, 1, '#151515'); px(9, 5, 1, 1, '#151515'); px(7, 7, 2, 1, shade(skin)); }
    if (d === 'l') { px(6, 5, 1, 1, '#151515'); px(5, 6, 1, 1, shade(skin)); }
    // pelo
    const hs = look.hair || 0;
    if (look.acc !== 2) {
      if (d === 'u') { px(5, 1, 6, 7, hair); if (hs === 2 || fem) px(5, 8, 6, 3, hair); }
      if (hs === 0) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 3, hair); px(11, 2, 1, 3, hair); } if (d === 'l') { px(8, 1, 3, 5, hair); px(11, 2, 1, 3, hair); } }
      if (hs === 1) { px(6, 1, 4, 1, hair); px(5, 2, 6, 1, hair); if (d === 'l') px(9, 2, 2, 3, hair); }
      if (hs === 2) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 9, hair); px(11, 2, 1, 9, hair); } if (d === 'l') { px(8, 1, 4, 10, hair); } }
      if (hs === 3) { px(4, 1, 8, 2, hair); px(5, 0, 1, 1, hair); px(7, 0, 1, 1, hair); px(10, 0, 1, 1, hair); if (d !== 'u') { px(4, 3, 1, 2, hair); px(11, 3, 1, 2, hair); } if (d === 'l') px(9, 1, 3, 5, hair); }
      if (hs === 4) { px(5, 1, 6, 2, hair); px(6, 0, 4, 1, hair); px(7, -1, 3, 2, hair); if (d === 'l') px(9, 1, 2, 4, hair); }
      if (fem && hs !== 2 && hs !== 4 && d === 'd') { px(4, 2, 1, 7, hair); px(11, 2, 1, 7, hair); }
    }
    // accesorio
    if (look.acc === 1) { px(4, 0, 8, 3, '#3d3d3d'); px(4, 3, 8, 1, '#5a5a5a'); }
    if (look.acc === 2) { const c = top[1]; px(4, 1, 8, 2, c); px(4, 2, 1, 7, c); px(11, 2, 1, 7, c); px(5, 0, 6, 1, c); if (d === 'u') px(5, 2, 6, 6, c); if (d === 'l') px(8, 1, 4, 8, c); }
    if (look.acc === 3) { px(5, 8, 6, 2, '#4a4a4a'); px(6, 8, 1, 2, '#5e5e5e'); if (d === 'd') px(9, 10, 2, 3, '#4a4a4a'); }
    if (look.acc === 4 && d !== 'u') { if (d === 'd') { px(5, 6, 6, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); px(10, 7, 1, 1, '#5a5a5a'); } else { px(5, 6, 3, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); } }
    // contorno
    const out = document.createElement('canvas'); out.width = 18; out.height = 26; const o = out.getContext('2d');
    const src = g.getImageData(0, 0, 16, 24).data; const od = o.createImageData(18, 26);
    const A = (x, y) => (x < 0 || y < 0 || x > 15 || y > 23) ? 0 : src[(y * 16 + x) * 4 + 3];
    for (let y = 0; y < 26; y++) for (let x = 0; x < 18; x++) { const sx = x - 1, sy = y - 1, i = (y * 18 + x) * 4;
      if (A(sx, sy)) { const j = (sy * 16 + sx) * 4; od.data[i] = src[j]; od.data[i + 1] = src[j + 1]; od.data[i + 2] = src[j + 2]; od.data[i + 3] = 255; }
      else if (A(sx - 1, sy) || A(sx + 1, sy) || A(sx, sy - 1) || A(sx, sy + 1)) { od.data[i] = 7; od.data[i + 1] = 7; od.data[i + 2] = 7; od.data[i + 3] = 235; } }
    o.putImageData(od, 0, 0);
    let res = out; if (mirror) { const m = document.createElement('canvas'); m.width = 18; m.height = 26; const mc = m.getContext('2d'); mc.translate(18, 0); mc.scale(-1, 1); mc.drawImage(out, 0, 0); res = m; }
    cache.set(key, res); return res;
  }
  function shade(hex) { const n = parseInt(hex.slice(1), 16); const f = .82; return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f).toString(16).padStart(2, '0')).join(''); }
  // Oscuro Errante
  const oscCache = {};
  function oscSprite(frame, hurt) {
    const k = frame + (hurt ? 'h' : ''); if (oscCache[k]) return oscCache[k];
    const c = document.createElement('canvas'); c.width = 18; c.height = 30; const g = c.getContext('2d'); const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const B = hurt ? '#d8d4cc' : '#2b2b2c', H = hurt ? '#f2efe8' : '#3e3e40', D = '#1a1a1b';
    px(6, 1, 6, 6, B); px(7, 0, 4, 1, B); px(7, 3, 1, 2, '#000'); px(10, 3, 1, 2, '#000'); px(7, 6, 4, 1, D);
    px(8, 7, 2, 1, B); px(5, 8, 8, 10, B); px(5, 8, 2, 10, H); px(4, 17, 1, 2, B); px(13, 16, 1, 3, B); px(6, 18, 1, 1, B); px(11, 18, 1, 2, B);
    const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    px(3, 9 + sw, 2, 11, B); px(3, 20 + sw, 1, 2, D); px(13, 9 - sw, 2, 11, B); px(14, 20 - sw, 1, 2, D);
    const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
    px(6, 18, 2, 10 - l, B); px(10, 18, 2, 10 - r, B); px(5, 28 - l, 3, 1, D); px(10, 28 - r, 3, 1, D);
    oscCache[k] = c; return c;
  }

  /* =================== ESTADO =================== */
  let me = null, look = null, P = null, save = null;
  const others = new Map();     // id -> {x,y,tx,ty,dir,mv,atk,look,nick,fac,lvl,say,sayT,frame,ft}
  const oscs = [], parts = [], ash = [];
  let room = 0, ch = null, lastSent = 0, lastPos = '', running = false, paused = false;
  const lvlOf = xp => Math.floor(xp / 100) + 1, maxHp = lv => 100 + (lv - 1) * 10;

  /* =================== ARRANQUE =================== */
  async function boot() {
    const { data: s } = await sb.auth.getSession(); if (!s.session) return location.replace('/index.html');
    const uid = s.session.user.id;
    const { data: prof } = await sb.from('profiles').select('id,nick,status,faction').eq('id', uid).maybeSingle();
    if (!prof || prof.status !== 'approved' || !prof.faction) return location.replace('/index.html');
    me = prof; document.documentElement.dataset.fac = me.faction;
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) {}
    const { data: gc, error } = await sb.from('game_chars').select('*').eq('user_id', uid).maybeSingle();
    if (error && !/relation|does not exist/i.test(error.message)) toast('No se pudo leer tu personaje: ' + error.message);
    if (error) { $('#load-t').textContent = 'Falta preparar la base del juego (03_cenizas.sql). Avisale al admin.'; return; }
    $('#ov-load').hidden = true;
    if (!gc || !gc.look || !gc.look.fac) { creator(gc); return; }
    look = gc.look; look.fac = me.faction; startGame(gc);
  }

  /* =================== CREADOR =================== */
  function creator(prev) {
    look = Object.assign({ body: 0, skin: 1, hair: 0, hcol: 1, top: 0, acc: 0 }, prev && prev.look || {}, { fac: me.faction });
    const cre = $('#cre'); cre.hidden = false; let rot = 0; const dirs = ['d', 'l', 'u', 'r'];
    const opts = [['CUERPO', 'body', BODY], ['PIEL', 'skin', ['Tono 1', 'Tono 2', 'Tono 3', 'Tono 4']], ['PELO', 'hair', HAIR], ['COLOR', 'hcol', HCOL.map(h => h[0])], ['ROPA', 'top', TOPS[me.faction].map(t => t[0])], ['ACCESORIO', 'acc', ACC]];
    const box = $('#opts'); box.innerHTML = '';
    opts.forEach(([lab, k, list]) => { const r = document.createElement('div'); r.className = 'opt';
      r.innerHTML = '<span>' + lab + '</span><button aria-label="anterior">‹</button><b></b><button aria-label="siguiente">›</button>';
      const b = r.querySelector('b'); const upd = () => b.textContent = list[look[k]];
      r.children[1].onclick = () => { look[k] = (look[k] + list.length - 1) % list.length; upd(); draw(); };
      r.children[3].onclick = () => { look[k] = (look[k] + 1) % list.length; upd(); draw(); };
      upd(); box.appendChild(r); });
    const go = document.createElement('button'); go.className = 'btn solid go'; go.textContent = 'ENTRAR AL PARQUE'; box.appendChild(go);
    const pv = $('#pv'), pg = pv.getContext('2d'); pg.imageSmoothingEnabled = false;
    let f = 0; function draw() { pg.clearRect(0, 0, 48, 64); pg.drawImage(sprite(look, dirs[rot], f, false), 15, 19, 18, 26); }
    const iv = setInterval(() => { f = (f + 1) % 3; draw(); }, 260); draw();
    $('#pv-rot').onclick = () => { rot = (rot + 1) % 4; draw(); };
    go.onclick = async () => { go.disabled = true; clearInterval(iv);
      const row = { user_id: me.id, look, zone: 'parque', x: SPAWN[0], y: SPAWN[1], hp: 100, xp: prev ? prev.xp || 0 : 0, kills: prev ? prev.kills || 0 : 0, updated_at: new Date().toISOString() };
      const { error } = await sb.from('game_chars').upsert(row); if (error) { go.disabled = false; return toast('No se pudo guardar: ' + error.message); }
      cre.hidden = true; startGame(row); };
  }

  /* =================== JUEGO =================== */
  function startGame(gc) {
    save = gc; const lv = lvlOf(gc.xp || 0);
    const ok = gc.x && gc.y && walkable(gc.x, gc.y);
    P = { x: ok ? gc.x : SPAWN[0], y: ok ? gc.y : SPAWN[1], dir: 'd', mv: false, frame: 0, ft: 0, atk: 0, cd: 0, hp: Math.min(gc.hp || maxHp(lv), maxHp(lv)), xp: gc.xp || 0, kills: gc.kills || 0, hurtT: 0, say: '', sayT: 0, dead: false };
    if (P.hp <= 0) P.hp = maxHp(lv);
    $('#h-nick').textContent = me.nick; ['#hud', '#topr', '#pads', '#hintL'].forEach(s => $(s).hidden = false);
    document.body.classList.add('playing'); hud();
    for (let i = 0; i < 4; i++) spawnOsc(i);
    for (let i = 0; i < 90; i++) ash.push(newAsh(true));
    joinRoom(1); running = true; last = performance.now(); requestAnimationFrame(loop);
    setInterval(persist, 20000);
    setTimeout(() => toast('Parque del Nogal · cerca del fogón estás a salvo'), 600);
  }
  function hud() { const lv = lvlOf(P.xp); $('#h-hp').style.width = Math.max(0, P.hp / maxHp(lv) * 100) + '%'; $('#h-xp').style.width = (P.xp % 100) + '%'; $('#h-lv').textContent = 'NV ' + lv + ' · PALO · ' + Math.ceil(P.hp) + '/' + maxHp(lv); }
  async function persist() { if (!P || !me) return; const row = { user_id: me.id, look, zone: 'parque', x: Math.round(P.x), y: Math.round(P.y), hp: Math.round(P.hp), xp: P.xp, kills: P.kills, updated_at: new Date().toISOString() };
    try { await sb.from('game_chars').upsert(row); } catch (e) {} }

  /* ---------- Oscuros ---------- */
  function spawnOsc(i) { const s = OSC_SPAWNS[(i + Math.floor(Math.random() * OSC_SPAWNS.length)) % OSC_SPAWNS.length];
    oscs[i] = { x: s[0], y: s[1], hp: 3, dir: 1, frame: 0, ft: 0, hurt: 0, hitCd: 0, wx: s[0], wy: s[1], wt: 0, dead: false, respawn: 0, alpha: 0 }; }
  function killOsc(o) { o.dead = true; o.respawn = 16; for (let i = 0; i < 46; i++) parts.push({ x: o.x + (Math.random() - .5) * 30, y: o.y - Math.random() * 80, vx: (Math.random() - .3) * 70, vy: -30 - Math.random() * 70, life: 1.4 + Math.random(), s: 2 + Math.random() * 4 });
    P.kills++; const before = lvlOf(P.xp); P.xp += 15; toast('+15 XP'); if (lvlOf(P.xp) > before) { P.hp = maxHp(lvlOf(P.xp)); setTimeout(() => toast('SUBISTE A NIVEL ' + lvlOf(P.xp)), 700); buzz([40, 40, 80]); } hud(); }

  /* ---------- online: salas de 10 ---------- */
  function joinRoom(n) {
    if (ch) { sb.removeChannel(ch); ch = null; } others.clear(); room = n;
    $('#h-sala').textContent = 'sala ' + n + ' · conectando…';
    ch = sb.channel('cenizas-parque-' + n, { config: { presence: { key: me.id }, broadcast: { self: false } } });
    ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); const ids = Object.keys(st);
        for (const id of [...others.keys()]) if (!ids.includes(id)) others.delete(id);
        ids.forEach(id => { if (id === me.id) return; const m = st[id][0] || {}; const o = others.get(id) || { x: m.x || SPAWN[0], y: m.y || SPAWN[1], tx: m.x || SPAWN[0], ty: m.y || SPAWN[1], dir: 'd', frame: 0, ft: 0, say: '', sayT: 0 };
          Object.assign(o, { look: m.look, nick: m.nick, fac: m.fac, lvl: m.lvl }); others.set(id, o); });
        $('#h-sala').textContent = 'sala ' + n + ' · ' + ids.length + '/10 en el parque'; })
      .on('broadcast', { event: 'pos' }, ({ payload: p }) => { const o = others.get(p.id); if (!o) return; o.tx = p.x; o.ty = p.y; o.dir = p.dir; o.mv = p.mv; if (p.atk) o.atk = .25; })
      .on('broadcast', { event: 'say' }, ({ payload: p }) => { const o = others.get(p.id); if (o) { o.say = p.t; o.sayT = 6; } })
      .subscribe(async status => {
        if (status !== 'SUBSCRIBED') { if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') $('#h-sala').textContent = 'sin conexión · jugando solo'; return; }
        await ch.track({ nick: me.nick, fac: me.faction, look, lvl: lvlOf(P.xp), x: P.x, y: P.y, at: Date.now() });
        setTimeout(() => { if (!ch) return; const st = ch.presenceState(); const list = Object.entries(st).map(([id, v]) => ({ id, at: (v[0] && v[0].at) || 0 })).sort((a, b) => a.at - b.at);
          const idx = list.findIndex(e => e.id === me.id); if (list.length > 10 && idx >= 10 && n < 50) { toast('Sala ' + n + ' llena · pasando a la ' + (n + 1)); joinRoom(n + 1); } }, 900);
      });
  }
  function sendPos(force) { if (!ch) return; const now = performance.now(); const k = Math.round(P.x) + ',' + Math.round(P.y) + P.dir + (P.mv ? 1 : 0);
    if (!force && (k === lastPos ? now - lastSent < 1500 : now - lastSent < 100)) return; lastPos = k; lastSent = now;
    ch.send({ type: 'broadcast', event: 'pos', payload: { id: me.id, x: Math.round(P.x), y: Math.round(P.y), dir: P.dir, mv: P.mv, atk: P.atk > .2 } }); }

  /* ---------- controles ---------- */
  const keys = {}; let joy = { on: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
  addEventListener('keydown', e => { if (document.activeElement === $('#say-in')) return; keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.toLowerCase() === 'j') attack(); if (e.key === 'Enter' || e.key.toLowerCase() === 'k') pressA(); if (e.key === 'Escape') openMenu(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const cv = $('#cv');
  cv.addEventListener('pointerdown', e => { if (!running || paused) return; if (e.clientX > innerWidth * .55) return; joy = { on: true, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; const s = $('#stick'); s.hidden = false; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; $('#knob').style.transform = ''; $('#hintL').hidden = true; });
  addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const d = Math.hypot(dx, dy), m = 50; if (d > m) { dx = dx / d * m; dy = dy / d * m; } joy.dx = dx / m; joy.dy = dy / m; $('#knob').style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; });
  const endJoy = e => { if (e.pointerId !== joy.id) return; joy.on = false; joy.dx = joy.dy = 0; $('#stick').hidden = true; };
  addEventListener('pointerup', endJoy); addEventListener('pointercancel', endJoy);
  $('#btn-b').addEventListener('pointerdown', e => { e.preventDefault(); attack(); $('#btn-b').classList.add('on'); setTimeout(() => $('#btn-b').classList.remove('on'), 120); });
  $('#btn-a').addEventListener('pointerdown', e => { e.preventDefault(); pressA(); });
  function attack() { if (!P || P.dead || paused || P.cd > 0) return; P.atk = .28; P.cd = .42; sendPos(true); buzz(15);
    const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir];
    oscs.forEach(o => { if (!o || o.dead) return; const dx = o.x - P.x, dy = (o.y - P.y); const dist = Math.hypot(dx, dy); if (dist > 105) return;
      if ((dx * fx[0] + dy * fx[1]) / (dist || 1) < .2 && dist > 30) return;
      o.hp--; o.hurt = .18; o.x += fx[0] * 14; o.y += fx[1] * 14; if (!walkable(o.x, o.y)) { o.x -= fx[0] * 14; o.y -= fx[1] * 14; }
      for (let i = 0; i < 8; i++) parts.push({ x: o.x, y: o.y - 50, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 60, life: .6, s: 2 + Math.random() * 3 });
      if (o.hp <= 0) killOsc(o); }); }
  const nearFire = () => Math.hypot(P.x - FIRE[0], P.y - FIRE[1]) < 200;
  function pressA() { if (!P || P.dead || paused) return; const s = $('#say'); s.hidden = false; const i = $('#say-in'); i.value = ''; i.focus(); }
  function sendSay() { const t = $('#say-in').value.trim(); $('#say').hidden = true; $('#say-in').blur(); if (!t) return; P.say = t; P.sayT = 6; if (ch) ch.send({ type: 'broadcast', event: 'say', payload: { id: me.id, t } }); }
  $('#say-go').onclick = sendSay; $('#say-in').addEventListener('keydown', e => { if (e.key === 'Enter') sendSay(); if (e.key === 'Escape') { $('#say').hidden = true; $('#say-in').blur(); } });

  /* ---------- menú / salir ---------- */
  function openMenu() { if (!running) return; paused = true; $('#ov-menu').hidden = false; }
  $('#menu-b').onclick = openMenu; $('#m-back').onclick = () => { paused = false; $('#ov-menu').hidden = true; };
  $('#m-exit').onclick = async () => { $('#m-exit').disabled = true; $('#m-exit').textContent = 'GUARDANDO…'; await persist(); if (ch) sb.removeChannel(ch);
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'portrait' }); } catch (e) {} location.replace('/index.html#theof'); };
  if (PL.App && PL.App.addListener) PL.App.addListener('backButton', () => { if (!$('#say').hidden) { $('#say').hidden = true; return; } if (paused) { paused = false; $('#ov-menu').hidden = true; } else openMenu(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  $('#d-ok').onclick = () => { $('#ov-dead').hidden = true; $('#fade').classList.add('on'); setTimeout(() => { P.x = SPAWN[0]; P.y = SPAWN[1]; P.hp = maxHp(lvlOf(P.xp)); P.dead = false; hud(); sendPos(true); $('#fade').classList.remove('on'); }, 600); };

  /* =================== LOOP =================== */
  const ctx = cv.getContext('2d'); let DPR = 1, VW = 0, VH = 0, zoom = 1, last = 0, t = 0;
  const dark = document.createElement('canvas'), dg = dark.getContext('2d');
  function resize() { DPR = Math.min(2, devicePixelRatio || 1); VW = innerWidth; VH = innerHeight; cv.width = VW * DPR; cv.height = VH * DPR; dark.width = Math.ceil(VW / 2); dark.height = Math.ceil(VH / 2); zoom = Math.max(.55, Math.min(1.4, VH / 560)); }
  addEventListener('resize', resize); resize();
  function newAsh(any) { return { x: Math.random() * VW, y: any ? Math.random() * VH : -10, v: 12 + Math.random() * 26, w: Math.random() * 6.28, s: .8 + Math.random() * 1.8, o: .2 + Math.random() * .45 }; }
  function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; if (!paused) update(dt); render(); requestAnimationFrame(loop); }
  function update(dt) {
    // jugador
    let ix = joy.dx, iy = joy.dy;
    if (keys.arrowleft || keys.a) ix = -1; if (keys.arrowright || keys.d) ix = 1; if (keys.arrowup || keys.w) iy = -1; if (keys.arrowdown || keys.s) iy = 1;
    const mag = Math.hypot(ix, iy); P.mv = !P.dead && mag > .18;
    if (P.mv) { const sp = 165 * Math.min(1, mag); const vx = ix / mag * sp * dt, vy = iy / mag * sp * dt;
      if (walkable(P.x + vx, P.y)) P.x += vx; if (walkable(P.x, P.y + vy)) P.y += vy;
      P.dir = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'l' : 'r') : (iy < 0 ? 'u' : 'd');
      P.ft += dt; if (P.ft > .14) { P.ft = 0; P.frame = P.frame === 1 ? 2 : 1; } } else P.frame = 0;
    P.atk = Math.max(0, P.atk - dt); P.cd = Math.max(0, P.cd - dt); P.hurtT = Math.max(0, P.hurtT - dt); if (P.sayT > 0) P.sayT -= dt;
    if (!P.dead && nearFire() && P.hp < maxHp(lvlOf(P.xp))) { P.hp = Math.min(maxHp(lvlOf(P.xp)), P.hp + 12 * dt); hud(); }
    $('#a-lab').textContent = 'HABLAR';
    sendPos(false);
    // otros
    others.forEach(o => { o.x += (o.tx - o.x) * Math.min(1, dt * 10); o.y += (o.ty - o.y) * Math.min(1, dt * 10); const moving = Math.hypot(o.tx - o.x, o.ty - o.y) > 2 || o.mv;
      if (moving) { o.ft = (o.ft || 0) + dt; if (o.ft > .14) { o.ft = 0; o.frame = o.frame === 1 ? 2 : 1; } } else o.frame = 0; if (o.sayT > 0) o.sayT -= dt; if (o.atk > 0) o.atk -= dt; });
    // oscuros
    oscs.forEach((o, i) => { if (!o) return;
      if (o.dead) { o.respawn -= dt; if (o.respawn <= 0) spawnOsc(i); return; }
      o.alpha = Math.min(1, o.alpha + dt * .7); o.hurt = Math.max(0, o.hurt - dt); o.hitCd = Math.max(0, o.hitCd - dt);
      const dx = P.x - o.x, dy = P.y - o.y, dist = Math.hypot(dx, dy), pSafe = Math.hypot(P.x - FIRE[0], P.y - FIRE[1]) < SAFE_R;
      let tx, ty, sp;
      if (!P.dead && dist < 280 && !pSafe) { tx = P.x; ty = P.y; sp = 58 + lvlOf(P.xp) * 2; }
      else { o.wt -= dt; if (o.wt <= 0) { o.wt = 2 + Math.random() * 3; o.wx = o.x + (Math.random() - .5) * 300; o.wy = o.y + (Math.random() - .5) * 200; } tx = o.wx; ty = o.wy; sp = 28; }
      const ddx = tx - o.x, ddy = ty - o.y, dd = Math.hypot(ddx, ddy);
      if (dd > 6) { let nx = o.x + ddx / dd * sp * dt, ny = o.y + ddy / dd * sp * dt;
        if (Math.hypot(nx - FIRE[0], ny - FIRE[1]) < SAFE_R) { nx = o.x; ny = o.y; o.wt = 0; }
        if (walkable(nx, o.y)) o.x = nx; if (walkable(o.x, ny)) o.y = ny; o.dir = ddx < 0 ? -1 : 1; o.ft += dt; if (o.ft > .22) { o.ft = 0; o.frame = o.frame === 1 ? 2 : 1; } }
      if (Math.random() < dt * 6) parts.push({ x: o.x + (Math.random() - .5) * 20, y: o.y - 30 - Math.random() * 50, vx: 10 + Math.random() * 20, vy: -15 - Math.random() * 25, life: 1 + Math.random(), s: 1.5 + Math.random() * 2.5 });
      if (!P.dead && dist < 38 && o.hitCd <= 0 && !pSafe) { o.hitCd = .9; P.hp -= 7; P.hurtT = .25; buzz(35); hud(); if (P.hp <= 0) { P.hp = 0; P.dead = true; hud(); buzz([80, 60, 120]); setTimeout(() => $('#ov-dead').hidden = false, 500); } } });
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 8 * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
    ash.forEach((a, i) => { a.y += a.v * dt; a.x += Math.sin(t * .8 + a.w) * 12 * dt + 6 * dt; if (a.y > VH + 10) ash[i] = newAsh(false); });
  }
  function render() {
    const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH);
    if (!P) return;
    const vw = VW / zoom, vh = VH / zoom; let cx = P.x - vw / 2, cy = P.y - 40 - vh / 2; cx = Math.max(0, Math.min(WORLD_W - vw, cx)); cy = Math.max(0, Math.min(WORLD_H - vh, cy));
    const W2S = (x, y) => [(x - cx) * zoom, (y - cy) * zoom];
    c.imageSmoothingEnabled = true; if (bg.complete && bg.naturalWidth) c.drawImage(bg, cx / WS, cy / WS, vw / WS, vh / WS, 0, 0, VW, VH);
    // fogón: brillo
    const [fx, fy] = W2S(FIRE[0], FIRE[1]); const fl = 1 + Math.sin(t * 9) * .05 + Math.sin(t * 23) * .04;
    let g = c.createRadialGradient(fx, fy, 0, fx, fy, 210 * zoom * fl); g.addColorStop(0, 'rgba(255,150,60,.28)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(fx - 260 * zoom, fy - 260 * zoom, 520 * zoom, 520 * zoom);
    // entidades ordenadas por y
    const ents = [];
    ents.push({ y: P.y, draw: () => drawChar(P, look, me.nick, me.faction, true) });
    others.forEach(o => { if (o.look) ents.push({ y: o.y, draw: () => drawChar(o, o.look, o.nick, o.fac, false) }); });
    oscs.forEach(o => { if (o && !o.dead) ents.push({ y: o.y, draw: () => drawOsc(o) }); });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    function shadow(x, y, w) { c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(x, y, w * zoom, w * .35 * zoom, 0, 0, 7); c.fill(); }
    function drawChar(o, lk, nick, fac, mine) {
      const [sx, sy] = W2S(o.x, o.y); const S = 3.6 * zoom; const img = sprite(lk, o.dir || 'd', o.frame || 0, (o.atk || 0) > 0); shadow(sx, sy, 20);
      c.imageSmoothingEnabled = false; if (mine && P.hurtT > 0) c.globalAlpha = .55 + Math.sin(t * 60) * .3;
      c.drawImage(img, sx - 9 * S, sy - 25 * S, 18 * S, 26 * S); c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if ((o.atk || 0) > 0) { const a = { d: Math.PI / 2, u: -Math.PI / 2, l: Math.PI, r: 0 }[o.dir || 'd']; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3 * zoom; c.beginPath(); c.arc(sx, sy - 34 * zoom, 52 * zoom, a - .9, a + .9); c.stroke(); }
      if (!mine) { c.font = Math.round(12 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = 'rgba(0,0,0,.6)'; const nm = nick + (fac !== me.faction ? ' ✕' : ''); const w = c.measureText(nm).width + 10; c.fillRect(sx - w / 2, sy - 27 * S - 16, w, 15); c.fillStyle = fac === 'ork' ? '#ff7a70' : '#eeeeee'; c.fillText(nm, sx, sy - 27 * S - 4); }
      if (o.sayT > 0 && o.say) bubble(sx, sy - 27 * S - (mine ? 6 : 22), o.say);
    }
    function drawOsc(o) { const [sx, sy] = W2S(o.x, o.y); const S = 3.8 * zoom; shadow(sx, sy, 18); c.imageSmoothingEnabled = false; c.globalAlpha = o.alpha * (.9 + Math.sin(t * 4 + o.x) * .1);
      c.save(); c.translate(sx, sy); if (o.dir < 0) c.scale(-1, 1); c.drawImage(oscSprite(o.frame, o.hurt > 0), -9 * S, -29 * S, 18 * S, 30 * S); c.restore(); c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sx - 18 * zoom, sy - 30 * S - 8, 36 * zoom, 4); c.fillStyle = '#d8d6d0'; c.fillRect(sx - 18 * zoom, sy - 30 * S - 8, 36 * zoom * (o.hp / 3), 4); }
    function bubble(x, y, text) { c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const words = text.split(' '); const lines = []; let ln = '';
      words.forEach(w => { if (c.measureText(ln + ' ' + w).width > 170 && ln) { lines.push(ln); ln = w; } else ln = ln ? ln + ' ' + w : w; }); lines.push(ln);
      const w = Math.max(...lines.map(l => c.measureText(l).width)) + 16, h = lines.length * 16 + 10; c.fillStyle = 'rgba(240,238,232,.94)'; c.fillRect(x - w / 2, y - h, w, h); c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x, y + 6); c.fill();
      c.fillStyle = '#111'; lines.forEach((l, i) => c.fillText(l, x, y - h + 18 + i * 16)); }
    // partículas
    parts.forEach(p => { const [x, y] = W2S(p.x, p.y); c.fillStyle = 'rgba(30,30,32,' + Math.min(1, p.life) * .85 + ')'; c.fillRect(x, y, p.s * zoom, p.s * zoom); });
    // oscuridad con luz alrededor del jugador y del fuego
    const dw = dark.width, dh = dark.height; dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, dw, dh); dg.fillStyle = 'rgba(4,4,8,.5)'; dg.fillRect(0, 0, dw, dh);
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { const gg = dg.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2); gg.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gg; dg.fillRect(x / 2 - r / 2, y / 2 - r / 2, r, r); };
    const [px_, py_] = W2S(P.x, P.y - 30); hole(px_, py_, 330 * zoom, .95); hole(fx, fy, 440 * zoom * fl, 1);
    others.forEach(o => { const [ox, oy] = W2S(o.x, o.y - 30); hole(ox, oy, 180 * zoom, .7); });
    c.drawImage(dark, 0, 0, VW, VH);
    // ceniza
    ash.forEach(a => { c.fillStyle = 'rgba(220,216,206,' + a.o + ')'; c.fillRect(a.x, a.y, a.s, a.s); });
    // viñeta + golpe
    g = c.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    if (P.hurtT > 0) { c.fillStyle = 'rgba(160,20,10,' + P.hurtT * .9 + ')'; c.fillRect(0, 0, VW, VH); }
  }

  window.__cz = { get P() { return P; }, oscs };
  boot().catch(e => { $('#load-t').textContent = 'Error al cargar: ' + (e.message || e); });
})();
