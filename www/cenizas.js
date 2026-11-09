/* THE O|F 2.1 · MODO HISTORIA (?modo=historia) y PVP (?modo=pvp) */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const CAP = window.Capacitor, NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform()), PL = NATIVE && CAP.Plugins ? CAP.Plugins : {};
  const CFG = window.THEOF_CONFIG || window.ALTIMIT_CONFIG || {};
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  /* EXPERIMENTAL: solo las 4 zonas de Haedo, PvP, Oscuros al azar en Haedo y la Central, nivel y mochila aparte */
  const EXP = /[?&]modo=(pvp|exp)\b/.test(location.search), STORY = !EXP; const VER = '2.1b';
  /* PvP: solo los mapas marcados pvp; las salidas a mapas que no son del PvP quedan cerradas */
  const ZONES = window.CZ_PVP || [];
  const MAPS = EXP ? ZONES.reduce((o, k) => { const m = Object.assign({}, window.CZ_MAPS[k]); m.exits = m.exits.filter(e => ZONES.includes(e.to));  o[k] = m; return o; }, {}) : Object.keys(window.CZ_MAPS).filter(k => !ZONES.includes(k)).reduce((o, k) => { o[k] = window.CZ_MAPS[k]; return o; }, {});
  const NPC = window.CZ_NPC || null;
  const ICON_PNG = { katana: 'katana', bate: 'bate', cuchillo: 'cuchillo', barra: 'barra', pistola: 'pistola', escopeta: 'escopeta', mascara: 'mascara', kitsune: 'capa', chaleco: 'chaleco', armadura: 'chaleco', campera: 'chaleco', palo: 'palo',
    b_contencion: 'brazalete', b_resonancia: 'brazalete', brz_ork: 'brazalete', brz_reb: 'brazalete', vendas: 'vendas', botiquin: 'vendas', suero: 'maletin', kit: 'maletin', cigarrillo: 'cigarrillo', manzana: 'manzana', credencial: 'credencial', pista_ork: 'credencial', pista_reb: 'pagina', pista: 'pagina', pagina: 'pagina', lanza: 'lanza', baston: 'lanza' };
  Object.assign(ICON_PNG, { lanzallamas: 'escopeta', metralleta: 'pistola', trampa: 'peligro', antiveneno: 'canister', venda_q: 'vendas', fragmento: 'energia', brz_jefe: 'brazalete', tarjeta: 'tarjeta', expediente: 'expediente', fusible: 'fusible', radio: 'radio', cartucho: 'cartucho', canister: 'canister', contenedor: 'contenedor', energia: 'energia' });
  const ICONS = {}; Object.entries(ICON_PNG).forEach(([k, f]) => { const i = new Image(); i.src = '/a/it/' + f + '.png'; ICONS[k] = i; });
  const iconOf = k => { const i = ICONS[k]; return i && i.complete && i.naturalWidth ? i : window.CZ_PIX.icon(k); };
  let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* =================== IMÁGENES =================== */
  const IMG = {}; function img(src) { if (!IMG[src]) { const i = new Image(); i.src = src; IMG[src] = i; } return IMG[src]; }
  const ok = i => i && i.complete && i.naturalWidth > 0;
  /* ---------- avatares pixel (los de la 0.5) ---------- */
  const SKIN = ['#e3d6c8', '#c9ab92', '#9a7860', '#6a4c3c'];
  const HCOL = [['Negro', '#1d1b1a'], ['Castaño', '#4b3a2e'], ['Gris', '#8b8680'], ['Blanco', '#d6d2cc'], ['Rubio', '#c9a24a'], ['Colorado', '#a8452a']];
  const PANTC = [['Gris oscuro', '#38383a'], ['Jean', '#3e5a7a'], ['Caqui', '#7a6a4a'], ['Negro', '#1c1c1e'], ['Verde', '#4a5240']];
  const HAIR = ['Corto', 'Rapado', 'Largo', 'Revuelto', 'Rodete', 'Colitas'];
  const TOPS = { rebel: [['Campera de jean', '#56606c', '#3e4650', '#7a8592'], ['Buzo con capucha', '#6a6a6a', '#4e4e4e', '#868686'], ['Campera negra', '#2c2c2c', '#1c1c1c', '#454545']],
    ork: [['Uniforme gris', '#5a5a5a', '#3f3f3f', '#787878'], ['Chaqueta táctica', '#363636', '#232323', '#4d4d4d'], ['Bata de VIREX', '#b9b2a6', '#8f897e', '#d8d1c4']] };
  const ACC = ['Nada', 'Gorro', 'Capucha', 'Bufanda', 'Máscara'];
  /* ORK: clases con su propia ropa y colores */
  const OCLS = ['Militar', 'Científico', 'Espía'];
  const OTOPS = [[['Verde oliva', '#4a5240', '#363c2e', '#5e6852'], ['Camuflaje gris', '#55585a', '#3c3e40', '#6e7274'], ['Negro táctico', '#26282a', '#18191a', '#3a3c3e']],
    [['Bata blanca', '#d8d4cc', '#aaa59c', '#eeebe4'], ['Bata celeste', '#a9c4cc', '#7f9aa2', '#c6dce2'], ['Bata gris', '#9a9a9a', '#767676', '#b4b4b4']],
    [['Traje negro', '#1c1c1e', '#0e0e10', '#2e2e30'], ['Gabardina gris', '#5a5650', '#423e3a', '#726e68'], ['Traje bordó', '#4a1c1e', '#341214', '#642a2c']]];
  const BODY = ['Hombre', 'Mujer'];
  const PANTS = '#38383a', BOOT = '#161616', RED = '#c9302a', PALO = '#6b5c4c';
  const scache = new Map();
  function shade(hex) { const n = parseInt(hex.slice(1), 16); const f = .82; return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f).toString(16).padStart(2, '0')).join(''); }
  function sprite(look, dir, frame, atk) {
    const mirror = dir === 'r'; const d = mirror ? 'l' : dir;
    const key = JSON.stringify(look) + d + frame + (atk ? 1 : 0) + (mirror ? 'm' : '');
    if (scache.has(key)) return scache.get(key);
    const base = document.createElement('canvas'); base.width = 16; base.height = 24; const g = base.getContext('2d');
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const fac = look.fac === 'ork' ? 'ork' : 'rebel', cls = fac === 'ork' ? (look.cls || 0) : -1, top = cls >= 0 ? (OTOPS[cls][look.top] || OTOPS[cls][0]) : (TOPS[fac][look.top] || TOPS[fac][0]), skin = SKIN[look.skin] || SKIN[0], hair = (HCOL[look.hcol] || HCOL[0])[1];
    const fem = look.body === 1, tx0 = fem ? 5 : 4, tw = fem ? 6 : 8;
    if (d === 'l') { const a = frame === 1 ? [4, 9] : frame === 2 ? [9, 4] : [6, 7];
      px(a[1], 16, 3, 5, '#2c2c2e'); px(a[1], 21, 3, 2, BOOT); px(a[0], 16, 3, 5, PANTS); px(a[0] - (frame ? 1 : 0), 21, 4, 2, BOOT); }
    else { const lu = frame === 1 ? 1 : 0, ru = frame === 2 ? 1 : 0; px(5, 16, 3, 5 - lu, PANTS); px(5, 21 - lu, 3, 2, BOOT); px(8, 16, 3, 5 - ru, PANTS); px(8, 21 - ru, 3, 2, BOOT); }
    if (d === 'l') { px(5, 9, 6, 7, top[1]); px(5, 9, 2, 7, top[3]); px(10, 9, 1, 7, top[2]); }
    else { px(tx0, 9, tw, 7, top[1]); px(tx0 + tw - 1, 9, 1, 7, top[2]); if (d === 'd') { if (look.top === 0 && fac === 'rebel') px(7, 10, 2, 6, top[3]); if (cls === 1) px(7, 10, 2, 6, '#e8e2d6'); } }
    if (fac === 'ork' && d !== 'l') px(d === 'd' ? 12 - (fem ? 1 : 0) : 3 + (fem ? 1 : 0), 11, 1, 2, RED);
    if (fac === 'ork' && d === 'd') px(6, 11, 1, 1, RED);
    if (d === 'l') { if (atk) { px(1, 11, 6, 2, top[1]); px(0, 11, 1, 2, skin); px(0, 5, 1, 7, PALO); px(1, 4, 1, 2, PALO); }
      else { const ax = frame === 1 ? 5 : frame === 2 ? 9 : 7; px(ax, 10, 2, 5, top[1]); px(ax, 15, 2, 1, skin); } }
    else { const sl = frame === 1 ? -1 : frame === 2 ? 1 : 0; const lx = tx0 - 1, rx = tx0 + tw;
      px(lx, 10 + sl, 1, 5, top[1]); px(lx, 15 + sl, 1, 1, skin);
      if (atk) { if (d === 'd') { px(rx, 10, 1, 6, top[1]); px(rx, 16, 1, 1, skin); px(rx, 17, 1, 7, PALO); } else { px(rx, 6, 1, 5, top[1]); px(rx, 5, 1, 1, skin); px(rx, 0, 1, 5, PALO); } }
      else { px(rx, 10 - sl, 1, 5, top[1]); px(rx, 15 - sl, 1, 1, skin); } }
    px(7, 8, 2, 1, skin); px(5, 2, 6, 6, skin); px(5, 7, 6, 1, skin);
    if (d === 'd') { px(6, 5, 1, 1, '#151515'); px(9, 5, 1, 1, '#151515'); px(7, 7, 2, 1, shade(skin)); }
    if (d === 'l') { px(6, 5, 1, 1, '#151515'); px(5, 6, 1, 1, shade(skin)); }
    const hs = look.hair || 0;
    if (look.acc !== 2) {
      if (d === 'u') { px(5, 1, 6, 7, hair); if (hs === 2 || (fem && hs !== 5)) px(5, 8, 6, 3, hair); }
      if (hs === 0) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 3, hair); px(11, 2, 1, 3, hair); } if (d === 'l') { px(8, 1, 3, 5, hair); px(11, 2, 1, 3, hair); } }
      if (hs === 1) { px(6, 1, 4, 1, hair); px(5, 2, 6, 1, hair); if (d === 'l') px(9, 2, 2, 3, hair); }
      if (hs === 2) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 9, hair); px(11, 2, 1, 9, hair); } if (d === 'l') { px(8, 1, 4, 10, hair); } }
      if (hs === 3) { px(4, 1, 8, 2, hair); px(5, 0, 1, 1, hair); px(7, 0, 1, 1, hair); px(10, 0, 1, 1, hair); if (d !== 'u') { px(4, 3, 1, 2, hair); px(11, 3, 1, 2, hair); } if (d === 'l') px(9, 1, 3, 5, hair); }
      if (hs === 4) { px(5, 1, 6, 2, hair); px(6, 0, 4, 1, hair); px(7, -1, 3, 2, hair); if (d === 'l') px(9, 1, 2, 4, hair); }
      if (hs === 5) { px(5, 1, 6, 2, hair); px(4, 2, 1, 3, hair); px(11, 2, 1, 3, hair); if (d === 'd') { px(2, 3, 2, 5, hair); px(12, 3, 2, 5, hair); px(6, 3, 4, 1, hair); } if (d === 'l') { px(8, 1, 4, 4, hair); px(11, 3, 2, 5, hair); } if (d === 'u') { px(2, 3, 2, 5, hair); px(12, 3, 2, 5, hair); } }
      if (fem && hs !== 2 && hs !== 4 && hs !== 5 && d === 'd') { px(4, 2, 1, 7, hair); px(11, 2, 1, 7, hair); } }
    if (look.acc === 1) { px(4, 0, 8, 3, '#3d3d3d'); px(4, 3, 8, 1, '#5a5a5a'); }
    if (look.acc === 2) { const c = top[1]; px(4, 1, 8, 2, c); px(4, 2, 1, 7, c); px(11, 2, 1, 7, c); px(5, 0, 6, 1, c); if (d === 'u') px(5, 2, 6, 6, c); if (d === 'l') px(8, 1, 4, 8, c); }
    if (look.acc === 3) { px(5, 8, 6, 2, '#4a4a4a'); px(6, 8, 1, 2, '#5e5e5e'); if (d === 'd') px(9, 10, 2, 3, '#4a4a4a'); }
    if (look.acc === 4 && d !== 'u') { if (d === 'd') { px(5, 6, 6, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); px(10, 7, 1, 1, '#5a5a5a'); } else { px(5, 6, 3, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); } }
    // detalles de cada clase ORK
    if (cls === 0) { const hc = shade(top[1]); if (d !== 'u') { px(4, 0, 8, 3, hc); px(4, 2, 8, 1, top[2]); if (d === 'd') { px(5, 7, 1, 2, '#2a2a2a'); px(10, 7, 1, 2, '#2a2a2a'); } } else px(4, 0, 8, 4, hc);
      if (d === 'd') { px(tx0, 10, 1, 6, '#1e1e1e'); px(tx0 + tw - 1, 10, 1, 6, '#1e1e1e'); px(tx0, 14, tw, 1, '#2a2a2a'); } }
    if (cls === 1) { if (d === 'l') px(5, 16, 6, 3, top[1]); else { px(tx0, 16, tw, 3, top[1]); px(tx0 + tw - 1, 16, 1, 3, top[2]); }
      if (d === 'd') { px(5, 5, 2, 1, '#8fb0c0'); px(9, 5, 2, 1, '#8fb0c0'); px(7, 5, 2, 1, '#333'); } if (d === 'l') { px(5, 5, 2, 1, '#8fb0c0'); px(7, 5, 1, 1, '#333'); } }
    if (cls === 2) { if (d === 'd') { px(5, 5, 6, 1, '#050505'); px(6, 5, 1, 1, '#2a2a2a'); px(9, 5, 1, 1, '#2a2a2a'); px(7, 9, 2, 1, '#e8e2d6'); px(7, 10, 2, 4, RED); } if (d === 'l') px(5, 5, 3, 1, '#050505'); }
    const out = document.createElement('canvas'); out.width = 18; out.height = 26; const o = out.getContext('2d');
    const src = g.getImageData(0, 0, 16, 24).data; const od = o.createImageData(18, 26);
    const A = (x, y) => (x < 0 || y < 0 || x > 15 || y > 23) ? 0 : src[(y * 16 + x) * 4 + 3];
    for (let y = 0; y < 26; y++) for (let x = 0; x < 18; x++) { const sx = x - 1, sy = y - 1, i = (y * 18 + x) * 4;
      if (A(sx, sy)) { const j = (sy * 16 + sx) * 4; od.data[i] = src[j]; od.data[i + 1] = src[j + 1]; od.data[i + 2] = src[j + 2]; od.data[i + 3] = 255; }
      else if (A(sx - 1, sy) || A(sx + 1, sy) || A(sx, sy - 1) || A(sx, sy + 1)) { od.data[i] = 7; od.data[i + 1] = 7; od.data[i + 2] = 7; od.data[i + 3] = 235; } }
    o.putImageData(od, 0, 0);
    let res = out; if (mirror) { const m = document.createElement('canvas'); m.width = 18; m.height = 26; const mc = m.getContext('2d'); mc.translate(18, 0); mc.scale(-1, 1); mc.drawImage(out, 0, 0); res = m; }
    scache.set(key, res); return res;
  }

  const HD = window.CZ_SHEETS || null;
  /* colores del personaje base: pelo, piel, ropa, pantalón, calzado (null = el del dibujo) */
  function baseColors(lk) { const fac = lk.fac === 'ork' ? 'ork' : 'rebel', cls = fac === 'ork' ? (lk.cls || 0) : -1;
    const top = cls >= 0 ? (OTOPS[cls][lk.top] || OTOPS[cls][0]) : (TOPS[fac][lk.top] || TOPS[fac][0]);
    return [(HCOL[lk.hcol] || HCOL[1])[1], SKIN[lk.skin] || SKIN[1], top[1], (PANTC[lk.pant] || PANTC[0])[1], null]; }
  function charSprite(lk, dir, frame, atk) {
    if (HD && lk) { let s = null;
      if (lk.npc) s = HD.sheet(HD.NPC_SHEET[lk.npc] || lk.npc, dir, frame, atk);
      else if (lk.pj) s = HD.sheet(lk.pj, dir, frame, atk);
      else if (lk.body != null) s = HD.base(lk.body === 1, lk.model || 0, baseColors(lk), dir, frame, atk);
      if (s) return s; }
    return lk && lk.npc && NPC && NPC.C[lk.npc] ? NPC.draw(lk.npc, dir, frame) : sprite(lk, dir, frame, atk); }
  /* dibuja un personaje (pixel 18×26 o planilla HD) con los pies en (sx, sy) */
  function blitChar(ctx, spr, sx, sy, S, k) { if (spr.hd) return HD.blit(ctx, spr, sx, sy + S, 25 * S * (k == null ? HD_K : k)); ctx.imageSmoothingEnabled = false; ctx.drawImage(spr, Math.round(sx - 9 * S), Math.round(sy - 25 * S), Math.round(18 * S), Math.round(26 * S)); }
  const SKIN_NAMES = { pablo: 'Pablo 1', pablo2: 'Pablo 2', pablo3: 'Pablo 3', pol: 'Pol del futuro', polAlter: 'Pol alter', renzo: 'Renzo', sam: 'Sam', eze: 'Eze', esteban: 'Esteban', giuliana: 'Giuliana', lean: 'Lean', luis: 'Luis', norbert: 'Norbert', toby: 'Tobías', tomy: 'Tomy' };
  const skinName = k => { const n = SKIN_NAMES[k]; if (n) return n; const H = window.CZ_SHEETS; if (H && H.ALL.includes(H.NPC_SHEET[k] || k)) return (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' '); return null; };
  /* tipos de Oscuro: h = altura en mundo; las imágenes laterales miran a la derecha */
  /* Oscuros en pixel: PXS = tamaño de cada pixel en el mundo (igual que los avatares) */
  const PIX = window.CZ_PIX, PXS = 6.4, CELL_HD = 256, HD_K = .75; // HD_K: tamaño de los personajes en planilla respecto del pixel viejo
  const MOB = {
    errante: { coins: 1, name: 'Errante', art: 'errante', pw: 18, ph: 30, hp: 6, sp: 88, wsp: 30, dmg: 13, reach: 58, sight: 360, wind: .4, cd: 1.0, xp: 15, ai: 'chase', snd: 'growl' },
    corredor: { coins: 2, name: 'Corredor', art: 'corredor', pw: 26, ph: 24, hp: 5, sp: 125, dash: 400, wsp: 0, dmg: 16, reach: 62, sight: 500, wind: .45, cd: 1.3, xp: 26, ai: 'dash', snd: 'shriek' },
    perro: { coins: 1, name: 'Sabueso', art: 'perro', pw: 27, ph: 17, hp: 4, sp: 235, wsp: 60, dmg: 10, reach: 52, sight: 540, wind: .18, cd: .55, xp: 14, ai: 'flank', snd: 'bark' },
    denso: { coins: 4, name: 'Denso', art: 'denso', pw: 26, ph: 34, hp: 24, sp: 58, wsp: 22, dmg: 32, reach: 96, aoe: 140, sight: 320, wind: .85, cd: 1.7, xp: 80, ai: 'slam', snd: 'roar', heavy: true },
    sombra: { coins: 2, name: 'Sombra', art: 'sombra', pw: 16, ph: 32, hp: 5, sp: 70, wsp: 25, dmg: 18, reach: 64, sight: 440, wind: .32, cd: .9, xp: 32, ai: 'blink', snd: 'whisper' },
    incinerario: { name: 'Incinerario', art: 'incinerario', pw: 20, ph: 30, hp: 12, sp: 75, wsp: 25, dmg: 16, reach: 430, keep: 270, pspeed: 380, sight: 520, wind: .7, cd: 2.0, xp: 50, coins: 3, ai: 'ranged', snd: 'roar' },
    mole: { name: 'La Mole', art: 'mole', pw: 36, ph: 40, hp: 90, sp: 58, wsp: 22, dmg: 22, big: 52, bigKnock: 340, reach: 100, sight: 360, wind: .7, cd: 1.15, xp: 240, coins: 10, ai: 'mole', snd: 'roar', heavy: true, respawn: 90000 },
    jefe: { name: 'MERCEDES', art: 'jefe', npc: 'mercedesMala', aura: '170,60,255', pw: 25, ph: 36, hp: 650, sp: 270, wsp: 60, dmg: 13, reach: 66, pspeed: 430, fdmg: 18, sight: 900, wind: .18, cd: .35, xp: 1800, coins: 25, ai: 'boss', snd: 'roar', heavy: true, boss: true, respawn: 480000 },
    sofia: { name: 'SOFÍA', art: 'sofia', npc: 'sofia', aura: '220,30,30', pw: 25, ph: 36, hp: 1100, sp: 255, wsp: 60, dmg: 15, reach: 64, pspeed: 720, fdmg: 14, sight: 900, wind: .2, cd: .4, xp: 6000, coins: 40, ai: 'sofia', snd: 'whisper', heavy: true, boss: true, respawn: 900000 },
    rastrero: { coins: 1, name: 'Gato Oscuro', art: 'rastrero', pw: 25, ph: 15, hp: 4, sp: 195, wsp: 45, dmg: 11, reach: 56, sight: 420, wind: .22, cd: .8, xp: 18, ai: 'zigzag', snd: 'hiss' }
  };
  MOB.ignacio = Object.assign({}, MOB.jefe, { name: 'IGNACIO', npc: 'ignacio', aura: '255,170,40', hp: 520, dmg: 12, xp: 1500, coins: 22 });
  MOB.maxi = Object.assign({}, MOB.jefe, { name: 'MAXI', npc: 'maxi', aura: '60,200,255', hp: 800, dmg: 14, xp: 2600, coins: 30 });
  MOB.lilia = Object.assign({}, MOB.jefe, { name: 'LILIA', npc: 'lilia', aura: '210,60,200', hp: 1300, dmg: 17, xp: 7000, coins: 45 });
  const BOSS_AT = { estatua: 'ignacio', lezama: 'maxi', lab: 'lilia' };
  const nm_ = (base, o) => Object.assign({}, MOB[base], { npc: undefined, aura: undefined }, o);
  MOB.oscura = nm_('errante', { name: 'Oscura', sheet: 'oscura' });
  MOB.cuervo = nm_('perro', { name: 'Cuervo', sheet: 'cuervo', sp: 250, hp: 4 });
  MOB.reptante = nm_('rastrero', { name: 'Reptante', sheet: 'reptante', hp: 6, dmg: 13 });
  MOB.insecto = nm_('corredor', { name: 'Insecto', sheet: 'insecto', hp: 7, dmg: 17, xp: 30 });
  MOB.lodo = nm_('denso', { name: 'Hombre de Lodo', sheet: 'lodo', hp: 26, xp: 85 });
  MOB.babosa = nm_('incinerario', { name: 'Babosa', sheet: 'babosa', hp: 16, sp: 45, xp: 60 });
  /* jefes de mapa: uno solo, si lo matan vuelve a la hora */
  MOB.garras = nm_('jefe', { name: 'GARRAS', sheet: 'garras', aura: '170,80,255', hp: 700, dmg: 14, xp: 2200, coins: 25, respawn: 3600000, hourly: true });
  MOB.electrico = nm_('jefe', { name: 'EL ELECTROCUTADO', sheet: 'electrico', aura: '150,170,255', hp: 600, dmg: 13, xp: 1900, coins: 22, respawn: 3600000, hourly: true });
  MOB.pantallas = nm_('jefe', { name: 'EL VIGÍA', sheet: 'pantallas', aura: '200,120,255', hp: 900, dmg: 15, xp: 3000, coins: 30, respawn: 3600000, hourly: true });
  MOB.serpiente = nm_('mole', { name: 'LA SERPIENTE DE CABLES', sheet: 'serpiente', aura: '140,60,220', hp: 260, big: 60, xp: 2600, coins: 28, boss: true, respawn: 3600000, hourly: true });
  MOB.soldado = nm_('errante', { name: 'Soldado ORK', sheet: 'ex20', hp: 12, sp: 96, dmg: 15, xp: 40, coins: 3, human: true });
  MOB.patrulla = nm_('incinerario', { name: 'Patrulla ORK', sheet: 'agente_patrulla_ork', hp: 14, xp: 55, coins: 4, human: true });
  MOB.saqueador = nm_('errante', { name: 'Saqueador', sheet: 'ex23', hp: 11, sp: 100, dmg: 14, xp: 38, coins: 3, human: true });
  MOB.tirador = nm_('incinerario', { name: 'Tirador rebelde', sheet: 'ex21', hp: 12, xp: 50, coins: 4, human: true });
  MOB.pablo = nm_('jefe', { name: 'PABLO', sheet: 'pablo_1', aura: '120,200,255', hp: 700, dmg: 12, xp: 3000, coins: 40, respawn: 99999999 });
  MOB.yuki = nm_('errante', { name: 'YUKI', sheet: 'yuki', aura: '255,200,90', ai: 'flee', hp: 26, sp: 215, wsp: 70, dmg: 0, reach: 0, sight: 620, xp: 400, coins: 15, respawn: 900000, lv1: true });
  MOB.incinerario.burn = true; MOB.insecto.poison = true; MOB.babosa.poison = true; MOB.lodo.poison = true;
  MOB.soldado.fac = 'ork'; MOB.patrulla.fac = 'ork'; MOB.saqueador.fac = 'rebel'; MOB.tirador.fac = 'rebel';
  const HOURLY_AT = { patio: 'electrico', nueveJulio: 'garras', muelle: 'serpiente', teatroAv: 'pantallas' };
  Object.values(MOB).forEach(T => { T.h = T.ph * PXS; });
  /* dibujo de un Oscuro: los jefes con forma humana usan el pixel de la historia */
  /* brillo de los Oscuros horneado una vez por dibujo (el filtro en vivo calentaba el celu) */
  const GLOW = new WeakMap();
  function glowOf(art, au) { let m = GLOW.get(art); if (!m) { m = {}; GLOW.set(art, m); } const k = au || '_'; if (m[k]) return m[k];
    const cv = document.createElement('canvas'); cv.width = art.width; cv.height = art.height; const g = cv.getContext('2d'); const bl = Math.max(1, art.width / (au ? 22 : 45));
    g.filter = 'drop-shadow(0 0 ' + bl.toFixed(1) + 'px rgba(' + (au || '230,225,215') + ',' + (au ? '.95' : '.75') + '))'; g.drawImage(art, 0, 0); g.filter = 'none'; if (!cv.width) return art; m[k] = cv; return cv; }
  function artOf(T, frame, hurt, moving, atk) { const dir = moving ? 'r' : 'd';
    if (HD) { const nm = T.sheet || (T.npc ? (HD.NPC_SHEET[T.npc] || T.npc) : HD.MOB_SHEET[T.art]); const s = nm && HD.sheet(nm, dir, frame, atk); if (s) return s; }
    if (T.npc && NPC && NPC.C[T.npc]) return NPC.draw(T.npc, dir, frame); return PIX[T.art](frame, hurt); }
  /* lo que aparece cuando se desbloquea cada jefe (por mapa) */
  const EXTRA = { incinerario: { patio: 2, estOnce: 2, lezama: 2, muelle: 2 }, mole: { congreso: 1, puente: 1 }, jefe: { lab: 1 }, sofia: { nueveJulio: 1 } };
  const TIER = [['incinerario', 'EL PRIMER JEFE: LOS INCINERARIOS'], ['mole', 'EL SEGUNDO JEFE: LA MOLE'], ['jefe', 'EL TERCER JEFE: MERCEDES'], ['sofia', 'EL CUARTO JEFE: SOFÍA']];

  /* items del Documento Maestro */
  const ITEMS = {
    botiquin: { n: 'Botiquín de campaña', t: 'Consumible · común', d: 'Recupera 45 de vida. No cura la transformación de los Oscuros.', use: 'heal', v: 45 },
    vendas: { n: 'Vendas', t: 'Consumible · común', d: 'Recupera 18 de vida.', use: 'heal', v: 18 },
    pilas: { n: 'Pilas', t: 'Común', d: 'Recargan la linterna al máximo. Si la linterna se queda sin carga y tenés pilas, se cambian solas.', use: 'pilas' },
    linterna: { n: 'Linterna de servicio', t: 'Objeto · común', d: 'En los mapas oscuros (subte, complejos, laboratorios) sin luz ves muy poco. Prendida: ves lejos, las Sombras no se pueden esconder y les pegás 25% más a los Oscuros que encandilás. Gasta pilas; si se agota y tenés pilas, se recarga sola. Ponela en ESPECIAL para prenderla y apagarla rápido.', eq: 'luz', use: 'luz' },
    barra: { n: 'Barra reforzada', t: 'Arma · común', d: 'Pega 1 más que el palo y llega más lejos. Un poco más lenta. No se rompe.', eq: 'arma' },
    cuchillo: { n: 'Cuchillo', t: 'Arma · poco común', d: 'Muy rápido y de cerca. Se rompe después de 40 golpes.', eq: 'arma', uses: 40 },
    bate: { n: 'Bate', t: 'Arma · poco común', d: 'Pega fuerte y empuja lejos. Se rompe después de 30 golpes.', eq: 'arma', uses: 30 },
    lanza: { n: 'Lanza', t: 'Arma · rara', d: 'Llega lejísimo hacia adelante y atraviesa a todos los de la línea. Se rompe después de 30 golpes.', eq: 'arma', uses: 30 },
    pistola: { n: 'Pistola', t: 'Arma · rara', d: 'Dispara a distancia. Tiene 6 tiros y cuando se terminan, se descarta.', eq: 'arma', uses: 6 },
    katana: { n: 'Katana', t: 'Arma · rara', d: 'Corta rápido y fuerte. Se rompe después de 50 golpes.', eq: 'arma', uses: 50 },
    escopeta: { n: 'Itaka', t: 'Arma · muy rara', d: 'Tiro doble que abre en abanico. Tiene 3 tiros dobles.', eq: 'arma', uses: 3 },
    baston: { n: 'Bastón mágico', t: 'Arma · única · lo deja Yuki', d: 'Tira bolas de fuego. Después de 10 se rompe.', eq: 'arma', uses: 10 },
    pista_ork: { n: 'Pista ORK', t: 'Pista · ORK', d: 'Un rastro de ORK. Con 3, Mercedes te da el brazalete ORK.' },
    pista_reb: { n: 'Pista rebelde', t: 'Pista · Rebeldes', d: 'Un rastro de la resistencia. Con 3, Jota te da el brazalete rebelde.' },
    pista: { n: 'Pista', t: 'Pista', d: 'Una pista. Se convierte en la de tu bando.' },
    brz_ork: { n: 'Brazalete ORK', t: 'Brazalete · ORK', d: '10 segundos invencible y pegás el doble. Después quedás agotado con 10 de vida.', use: 'furia' },
    brz_reb: { n: 'Brazalete rebelde', t: 'Brazalete · Rebeldes', d: '10 segundos invencible y pegás el doble. Después quedás agotado con 10 de vida.', use: 'furia' },
    cigarrillo: { n: 'Cigarrillos', t: 'Misiones · se vende', d: 'Fumar te saca 8 de vida y te hace más lento por 20 segundos. Mejor guardalo: hay gente que da mucho por uno.', use: 'fumar' },
    manzana: { n: 'Manzana', t: 'Comida', d: 'Recupera 15 de vida. A los chicos escondidos les viene bien.', use: 'comer' },
    kit: { n: 'Kit de curación', t: 'Consumible · lo vende Rosa', d: 'Te deja la vida completa.', use: 'heal', v: 9999 },
    mascara: { n: 'Máscara de filtrado', t: 'Equipo · poco común', d: 'En el subte y el complejo recibís 20% menos de daño.', eq: 'cara' },
    b_contencion: { n: 'Brazalete de contención', t: 'Brazalete · raro', d: 'A favor: recibís 30% menos de daño. En contra: tu arma pega 1 menos.', eq: 'brazo' },
    b_resonancia: { n: 'Brazalete de resonancia', t: 'Brazalete · raro', d: 'A favor: ves a las Sombras aunque se escondan. En contra: los Oscuros te detectan desde más lejos.', eq: 'brazo' },
    credencial: { n: 'Credencial de contención', t: 'Llave · poco común', d: 'La mostrás en cualquier tienda y por 10 minutos todo te sale 30% menos. Se gasta al usarla.', use: 'descuento' },
    receptor: { n: 'Receptor de señales', t: 'Objeto · poco común', d: 'Capta transmisiones: te marca con una flecha dónde está el maletín de curación (3 minutos) y te avisa si hay horda, jefe o Yuki. No se gasta (1 vez por minuto).', use: 'radar' },
    ganzuas: { n: 'Juego de ganzúas', t: 'Herramienta · poco común', d: 'Acercate a un CASILLERO de los mapas y forzalo: sacás vendas y algo más. También abre la cápsula del búnker. Se gasta.', use: 'forzar' },
    filtro: { n: 'Filtro portátil', t: 'Consumible · poco común', d: 'Hacés potable el agua: +40 de vida y corrés más rápido por 8 segundos.', use: 'vida' },
    suero: { n: 'Maletín de curación total', t: 'Único · rota cada 3 minutos', d: 'Te deja la vida completa. Hay uno solo en todo el mundo y cambia de mapa cada 3 minutos si nadie lo agarra.', use: 'heal', v: 9999 },
    vendas: { n: 'Venda', t: 'Consumible · tienda de Plaza de Mayo', d: 'Cura 30 de vida. Después de usar una, tenés que esperar 3 segundos para la siguiente.', use: 'venda', v: 30 },
    campera: { n: 'Campera reforzada', t: 'Ropa · escudo 35', d: 'Absorbe 35 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 35 },
    chaleco: { n: 'Chaleco antibalas', t: 'Ropa · escudo 70', d: 'Absorbe 70 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otro en algún mapa.', eq: 'ropa', shield: 70 },
    armadura: { n: 'Armadura improvisada', t: 'Ropa · escudo 120 · rara', d: 'Chapas y correas. Absorbe 120 de daño. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 120 },
    pagina: { n: 'Página del cuaderno', t: 'Narrativo · raro', d: 'Hojas sueltas del Cuaderno de desaparecidos. Al leerla aprendés algo (+XP) y la guardás en tu diario. También se vende.', use: 'leer' },
    fragmento: { n: 'Fragmento home', t: 'Especial · raro', d: 'Un fragmento temporal. Al romperlo saltás a la base de tu bando. Se gasta.', use: 'volver' },
    lanzallamas: { n: 'Lanzallamas', t: 'Arma de fuego · muy rara', d: 'Escupe fuego de cerca: quema todo lo que tenga adelante. 30 segundos de fuego.', eq: 'arma', uses: 250 },
    metralleta: { n: 'Metralleta', t: 'Arma de fuego · rara', d: 'Ráfaga rápida a distancia. 60 tiros.', eq: 'arma', uses: 60 },
    trampa: { n: 'Trampa', t: 'Objeto · se coloca', d: 'La dejás en el piso. El otro bando no la ve (sólo una marquita). Al pisarla queda frenado y lastimado; a los Oscuros los aturde. Dura 4 minutos.', use: 'trampa' },
    antiveneno: { n: 'Antiveneno', t: 'Consumible', d: 'Cura el envenenamiento (insectos y babosas te envenenan).', use: 'antiveneno' },
    venda_q: { n: 'Venda para quemaduras', t: 'Consumible', d: 'Cura el estado QUEMADO (el Incinerario te prende fuego) y te da 15 de vida.', use: 'vendaq' },
    brz_jefe: { n: 'Brazalete de Yuki', t: 'Brazalete · único · PvP', d: 'Lo deja Yuki cuando la derrotás. Al activarlo tenés poder de jefe por 60 segundos: el doble de vida, recibís la mitad de daño y pegás 60% más.', use: 'jefe' },
    tarjeta: { n: 'Tarjeta de acceso', t: 'Historia', d: 'Abre puertas de las instalaciones de VIREX.' },
    expediente: { n: 'Expediente VIREX', t: 'Historia', d: 'Papeles con el sello de VIREX. Vacunas, nanopartículas, nombres.' },
    fusible: { n: 'Fusible industrial', t: 'Historia', d: 'Sirve para devolverle la energía a un tablero.' },
    radio: { n: 'Radio ORK', t: 'Historia', d: 'Una radio de ORK. Todavía capta su frecuencia.' },
    cartucho: { n: 'Cartucho de datos', t: 'Historia', d: 'Un registro de VIREX. Alguien tiene que leerlo.' },
    canister: { n: 'Canister VIREX', t: 'Historia', d: 'Un frasco sellado. Mejor no abrirlo.' },
    contenedor: { n: 'Contenedor biológico', t: 'Historia', d: 'Muestras de VIREX. Pesa más de lo que parece.' },
    energia: { n: 'Módulo de energía', t: 'Historia', d: 'Una batería industrial. Alcanza para mover una compuerta.' },
    kitsune: { n: 'Máscara kitsune', t: 'Objeto · 2 usos · la vende Rosa', d: 'Te ponés la máscara y desaparecés 3 segundos: los Oscuros y los otros jugadores no te ven. Después de 2 usos se rompe.', use: 'kitsune', uses: 2 }
  };
  const MOBS_T = {
    bajo: { errante: 3, oscura: 3, perro: 2, rastrero: 2, cuervo: 2 },
    medio: { errante: 3, oscura: 2, corredor: 2, perro: 1, sombra: 2, cuervo: 2, insecto: 2, reptante: 1 },
    alto: { errante: 2, oscura: 2, corredor: 2, sombra: 2, denso: 1, lodo: 2, insecto: 2, reptante: 2, babosa: 1, cuervo: 1, incinerario: 1 },
    tope: { errante: 2, oscura: 2, corredor: 2, sombra: 2, denso: 2, lodo: 2, insecto: 2, reptante: 2, babosa: 2, incinerario: 1 },
    pvp: { errante: 4, oscura: 3, perro: 2, cuervo: 2, rastrero: 2 } };
  /* MODO HISTORIA · niveles por avance: los mapas de arranque (cerca del Nogal y de Libertador) van de 1 a 5;
     cuanto más lejos, más alto. Puerto Madero suma extra. Las bases enemigas tienen guardias de nivel alto. */
  if (STORY) { const bfs = s0 => { const d = { [s0]: 0 }, q = [s0]; while (q.length) { const k = q.shift(); for (const e of (MAPS[k].exits || [])) if (e.to && MAPS[e.to] && !(e.to in d)) { d[e.to] = d[k] + 1; q.push(e.to); } } return d; };
    const dA = bfs('nogal'), dB = MAPS.libertador ? bfs('libertador') : {}, PM = { muelle: 3, puente: 5, bunker: 6, lab: 7, lab_cuarentena: 7, arena_final: 9 };
    const FIX = { libertador: [36, 45], centro_ork: [30, 40], complejo8c_ev: [34, 44] };
    Object.entries(MAPS).forEach(([k, m]) => { if (FIX[k]) { m.lv = FIX[k]; return; } const d = Math.min(dA[k] == null ? 99 : dA[k], dB[k] == null ? 99 : dB[k]); if (d >= 99) return; const sc = d + (PM[k] || 0);
      if (sc <= 1) m.lv = [1, 4]; else if (sc === 2) m.lv = [2, 5]; else { const a = Math.round(4 + (sc - 3) * 3.3); m.lv = [a, a + 3 + Math.round(sc / 3)]; } }); }
  Object.entries(MAPS).forEach(([k, m]) => { if (m.safeAll || m.base) { m.mobs = {}; return; } const top = (m.lv || [1, 3])[1];
    m.mobs = EXP ? MOBS_T.pvp : top <= 12 ? MOBS_T.bajo : top <= 28 ? MOBS_T.medio : top <= 40 ? MOBS_T.alto : MOBS_T.tope; });
  /* soldados ORK en bases y asentamientos ORK; rebeldes armados en asentamientos rebeldes. Sólo atacan al otro bando. */
  const HUMAN_AT = { libertador: 'ork', centro_ork: 'ork', lezama: 'ork', mcd: 'ork', muelle: 'rebel', refugioSub: 'rebel', colon: 'rebel', campo_ruinas: 'rebel' };
  if (!EXP) Object.entries(HUMAN_AT).forEach(([k, f]) => { const m = MAPS[k]; if (!m) return; m.mobs = Object.assign({}, m.mobs || {}, f === 'ork' ? { soldado: 2, patrulla: 1 } : { saqueador: 2, tirador: 1 }); });
  const LOOT_T = {
    bajo: [['pilas', 3], ['campera', 1.2], ['vendas', 2], ['linterna', 1], ['barra', 1], ['cuchillo', .7], ['bate', .5], ['pista', .5]],
    medio: [['pilas', 2], ['campera', 1], ['chaleco', .7], ['vendas', 2], ['lanza', .5], ['pistola', .4], ['katana', .3], ['mascara', .8], ['pista', .6]],
    alto: [['chaleco', 1], ['armadura', .5], ['vendas', 2], ['pistola', .6], ['katana', .5], ['escopeta', .25], ['b_contencion', .4], ['b_resonancia', .4], ['pista', .7]],
    pvp: [['vendas', 2], ['campera', 1], ['cuchillo', .8], ['bate', .6], ['pistola', .3], ['pista', 1.4]],
    refugio: [['vendas', 1.5], ['pilas', 1]] };
  Object.values(LOOT_T).forEach(l => l.push(['cigarrillo', .6], ['manzana', .6]));
  const LOOT = {}; Object.entries(MAPS).forEach(([k, m]) => { const top = (m.lv || [1, 3])[1]; LOOT[k] = EXP ? LOOT_T.pvp : m.safeAll ? LOOT_T.refugio : top <= 14 ? LOOT_T.bajo : top <= 30 ? LOOT_T.medio : LOOT_T.alto; });
  LOOT.parque = LOOT_T.bajo;

  /* armas: daño extra, alcance, velocidad, empuje */
  const WEAP = { palo: { n: 'PALO', dmg: 0, range: 112, cd: .38, kb: 24 }, barra: { n: 'BARRA', dmg: 1, range: 140, cd: .44, kb: 26 },
    cuchillo: { n: 'CUCHILLO', dmg: 1, range: 92, cd: .2, kb: 12 }, bate: { n: 'BATE', dmg: 2, range: 128, cd: .5, kb: 70 },
    lanza: { n: 'LANZA', dmg: 2, range: 185, cd: .55, kb: 30, line: true }, pistola: { n: 'PISTOLA', dmg: 4, range: 650, cd: .35, kb: 10, gun: true },
    katana: { n: 'KATANA', dmg: 3, range: 135, cd: .32, kb: 30 }, escopeta: { n: 'ITAKA', dmg: 7, range: 520, cd: .7, kb: 40, gun: true, spread: true },
    baston: { n: 'BASTÓN', dmg: 9, range: 700, cd: .5, kb: 30, gun: true, fire: true }, lanzallamas: { n: 'LANZALLAMAS', dmg: 3, range: 260, cd: .12, kb: 6, gun: true, flame: true }, metralleta: { n: 'METRALLETA', dmg: 4, range: 650, cd: .09, kb: 8, gun: true } };
  const WEAPON_KEYS = ['palo', 'barra', 'cuchillo', 'bate', 'lanza', 'katana', 'pistola', 'escopeta', 'metralleta', 'lanzallamas', 'baston'];
  /* dónde despierta cada bando: Rebeldes en el fogón del parque, ORK en su base del complejo */
  /* dónde nace cada bando: Rebeldes en el Nogal, ORK en el Cruce Libertador (en los dos modos) */
  const home = () => EXP ? (me && me.faction === 'ork' ? ['pvp_rojo', MAPS.pvp_rojo.spawn] : ['pvp_azul', MAPS.pvp_azul.spawn]) : me && me.faction === 'ork' ? ['libertador', MAPS.libertador.spawn] : ['nogal', MAPS.nogal.spawn];
  const homeText = () => EXP ? (me && me.faction === 'ork' ? 'Volvés al campamento rojo.' : 'Volvés al campamento azul.') : me && me.faction === 'ork' ? 'Volvés al Cruce Libertador, la base ORK.' : 'Volvés al Nogal, la base rebelde.';
  const pickW = list => { const tot = list.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; };

  /* =================== MAPA ACTUAL =================== */
  const WS = 1.8, C = 16, CW = C * WS; let MW = 1672, MH = 941, GW = Math.ceil(MW / C), GH = Math.ceil(MH / C), WORLD_W = MW * WS, WORLD_H = MH * WS;
  let MAP = null, mapKey = '', grid = null, mgrid = null, flow = null, flowT = 0;
  function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function loadMap(k) {
    MAP = MAPS[k]; mapKey = k; img(MAP.img);
    MW = MAP.w || 1672; MH = MAP.h || 941; GW = Math.ceil(MW / C); GH = Math.ceil(MH / C); WORLD_W = MW * WS; WORLD_H = MH * WS;
    const g = new Uint8Array(GW * GH);
    const MKc = MASK[k];
    if (MKc) for (let c = 0; c < g.length; c++) g[c] = MKc[c] ? 1 : 0;
    else for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const x = i * C + C / 2, y = j * C + C / 2; g[j * GW + i] = (MAP.walk || []).some(p => inPoly(x, y, p)) && !(MAP.block || []).some(p => inPoly(x, y, p)) ? 1 : 0; }
    // sólo lo conectado al punto de inicio
    grid = new Uint8Array(GW * GH); const s = cellOf(MAP.spawn[0] * WS, MAP.spawn[1] * WS); const q = [s]; grid[s] = 1;
    while (q.length) { const c = q.pop(), x = c % GW, y = (c / GW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const n = ny * GW + nx; if (g[n] && !grid[n]) { grid[n] = 1; q.push(n); } } }
    // por donde pueden andar los Oscuros: sin zonas seguras
    mgrid = new Uint8Array(grid); if (MAP.safeAll) mgrid.fill(0);
    if (MKc) for (let c = 0; c < mgrid.length; c++) if (MKc[c] === 4) mgrid[c] = 0; // verde = refugio, los Oscuros no entran
    (MAP.safe || []).forEach(([sx, sy, r]) => { for (let c = 0; c < mgrid.length; c++) { const x = (c % GW) * C + C / 2, y = ((c / GW) | 0) * C + C / 2; if (Math.hypot(x - sx, y - sy) < r) mgrid[c] = 0; } });
    flow = new Int16Array(GW * GH);
  }
  const cellOf = (x, y) => Math.max(0, Math.min(GH - 1, Math.floor(y / CW))) * GW + Math.max(0, Math.min(GW - 1, Math.floor(x / CW)));
  const walkable = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && grid[cellOf(x, y)] === 1;
  const mobWalk = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && mgrid[cellOf(x, y)] === 1;
  const inSafe = (x, y) => MAP.safeAll || (MASK[mapKey] && MASK[mapKey][cellOf(x, y)] === 4) || (MAP.safe || []).some(([sx, sy, r]) => Math.hypot(x - sx * WS, y - sy * WS) < r * WS);
  /* ---------- MÁSCARAS DE CAMINATA (PNG de 6 colores, mismo encuadre que el dibujo) ----------
     blanco = se camina · negro = obstáculo · rojo = salida (toca el borde) · amarillo = escalera
     verde = refugio (los Oscuros no entran) · azul = punto de aparición.
     En el mapa: mask: '/a/m/xxx-mask.png'. Si no hay máscara, se usan los polígonos viejos. */
  const MASK = {};
  const PAL = [[0, 0, 0, 0], [255, 255, 255, 1], [255, 0, 0, 2], [255, 255, 0, 3], [0, 255, 0, 4], [0, 85, 255, 5]];
  const classOf = (r, g, b) => { let best = 0, bd = 1e9; for (const [pr, pg, pb, k] of PAL) { const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2; if (d < bd) { bd = d; best = k; } } return best; };
  function readMask(k, m) { return new Promise(res => { const im = new Image(); im.onload = () => { try {
      const W = m.w || 1672, H = m.h || 941, gw = Math.ceil(W / C), gh = Math.ceil(H / C);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data, out = new Uint8Array(gw * gh), pts = [[.5, .5], [.2, .2], [.8, .2], [.2, .8], [.8, .8]];
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const n = [0, 0, 0, 0, 0, 0];
        for (const [ox, oy] of pts) { const px = Math.min(W - 1, (i + ox) * C | 0), py = Math.min(H - 1, (j + oy) * C | 0), o = (py * W + px) * 4; n[classOf(d[o], d[o + 1], d[o + 2])]++; }
        let c = 0; if (n[0] >= 3) c = 0; else { c = 1; for (const t of [2, 4, 3, 5]) if (n[t] >= 2) { c = t; break; } } out[j * gw + i] = c; }
      out.gw = gw; out.gh = gh; MASK[k] = out; } catch (e) { console.warn('máscara', k, e); } res(); }; im.onerror = () => { console.warn('no cargó la máscara', m.mask); res(); }; im.src = m.mask; }); }
  /* dónde aparecés al cruzar: el punto caminable más cercano a la salida de llegada, un poco hacia adentro */
  function arrivalOf(k, exitId) { const m = MAPS[k], cls = MASK[k]; const e = m && (m.exits || []).find(x => x.id === exitId); if (!e) return m ? m.spawn : [0, 0];
    const cx = (e.r[0] + e.r[2]) / 2, cy = (e.r[1] + e.r[3]) / 2; if (!cls) return [cx, cy];
    const ok = (x, y) => { const i = Math.floor(x / C), j = Math.floor(y / C); if (i < 0 || j < 0 || i >= cls.gw || j >= cls.gh) return false; const v = cls[j * cls.gw + i]; return v && v !== 2; };
    const outside = (x, y) => x < e.r[0] - 130 || x > e.r[2] + 130 || y < e.r[1] - 130 || y > e.r[3] + 130;
    for (let r = 20; r < 500; r += 12) for (let a = 0; a < 6.283; a += .2) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (outside(x, y) && ok(x, y) && ok(x + 20, y) && ok(x - 20, y)) return [Math.round(x), Math.round(y)]; }
    return m.spawn; }
  const masksReady = Promise.all(Object.entries(MAPS).filter(([, m]) => m.mask).map(([k, m]) => readMask(k, m))).then(() => {
    Object.values(MAPS).forEach(m => (m.exits || []).forEach(e => { if (!e.side) { const w = m.w || 1672, h = m.h || 941; const d = { l: e.r[0], r: w - e.r[2], u: e.r[1], d: h - e.r[3] }; e.side = Object.keys(d).sort((a, b) => d[a] - d[b])[0]; }
      if (e.to && MAPS[e.to]) e.at = arrivalOf(e.to, e.toExit); })); });
  function buildFlow() { // distancia en celdas desde el jugador, para que los Oscuros rodeen obstáculos
    flow.fill(-1); const s = cellOf(P.x, P.y); const q = new Int32Array(GW * GH); let h = 0, t = 0; q[t++] = s; flow[s] = 0;
    while (h < t) { const c = q[h++], x = c % GW, y = (c / GW) | 0, d = flow[c];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const n = ny * GW + nx;
        if (flow[n] !== -1 || !(mgrid[n] || n === s) || !grid[n]) continue; if (dx && dy && (!grid[y * GW + nx] || !grid[ny * GW + x])) continue; flow[n] = d + 1; if (d < 40) q[t++] = n; } } }
  function randomMobCell(minDist) { for (let k = 0; k < 400; k++) { const c = (Math.random() * mgrid.length) | 0; if (!mgrid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (!P || Math.hypot(x - P.x, y - P.y) > minDist) return [x, y]; } return null; }

  /* =================== SONIDO (sintetizado) =================== */
  const SND = (() => {
    let ac = null, master = null, on = store.get('cz-snd') !== '0', noiseBuf = null, wind = null, fireG = null;
    function init() { if (ac) { if (ac.state === 'suspended') ac.resume(); return; } try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      master = ac.createGain(); master.gain.value = on ? .8 : 0; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      // viento continuo
      const n = ac.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; const g = ac.createGain(); g.gain.value = .22;
      const lfo = ac.createOscillator(); lfo.frequency.value = .09; const lg = ac.createGain(); lg.gain.value = .12; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      n.connect(f); f.connect(g); g.connect(master); n.start(); wind = g;
      fireG = ac.createGain(); fireG.gain.value = 0; fireG.connect(master); }
    function noise(dur, type, freq, vol, f2, q) { if (!ac || !on) return; const t = ac.currentTime, s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = q || 1;
      const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + .05); }
    function tone(type, f1, f2, dur, vol, delay) { if (!ac || !on) return; const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05); }
    function growl(base, dur, vol) { if (!ac || !on) return; const t = ac.currentTime, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), tr = ac.createOscillator(), tg = ac.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(base * 1.2, t); o.frequency.linearRampToValueAtTime(base * .8, t + dur); f.type = 'lowpass'; f.frequency.value = base * 6; tr.frequency.value = 18 + Math.random() * 10; tg.gain.value = vol * .5; tr.connect(tg); tg.connect(g.gain);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .08); g.gain.linearRampToValueAtTime(.0001, t + dur); o.connect(f); f.connect(g); g.connect(master); o.start(t); tr.start(t); o.stop(t + dur + .05); tr.stop(t + dur + .05); noise(dur * .8, 'bandpass', base * 4, vol * .5, base * 2, 3); }
    /* música: ambiente (calma) y tema del jefe; todo sintetizado */
    let mMode = null, mGain = null, drone = null, mNext = 0, mStep = 0, mTimer = null;
    const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
    function note(f, t0, dur, vol, type, dest) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g); g.connect(dest || mGain); o.start(t0); o.stop(t0 + dur + .05); }
    function kick(t0, vol) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(38, t0 + .18); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + .25); o.connect(g); g.connect(mGain); o.start(t0); o.stop(t0 + .3); }
    function startDrone() { if (drone) return; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 280; const g = ac.createGain(); g.gain.value = 0; const os = [55, 55.35, 82.4].map(fr => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); return o; });
      f.connect(g); g.connect(mGain); g.gain.linearRampToValueAtTime(.05, ac.currentTime + 3); drone = { os, g }; }
    function stopDrone() { if (!drone) return; const d = drone; drone = null; d.g.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2); setTimeout(() => d.os.forEach(o => { try { o.stop(); } catch (e) {} }), 1400); }
    function schedule() { if (!ac || !mMode) return; const now = ac.currentTime; if (mNext < now) mNext = now + .05;
      while (mNext < now + .3) {
        if (mMode === 'calm') { if (Math.random() < .55) { const f = PENTA[(Math.random() * PENTA.length) | 0] * (Math.random() < .3 ? .5 : 1); note(f, mNext, 2.6, .045, 'triangle'); if (Math.random() < .3) note(f * 1.5, mNext + .4, 2.2, .025, 'sine'); } mNext += rnd(1.4, 2.8); }
        else { const pat = [55, 55, 65.41, 55, 77.78, 55, 49, 55]; const f = pat[mStep % 8]; note(f, mNext, .2, .09, 'square'); note(f * 2, mNext, .12, .03, 'sawtooth');
          if (mStep % 2 === 0) kick(mNext, .35); if (mStep % 16 === 12) { note(440, mNext, 1.2, .04, 'sawtooth'); note(622.25, mNext, 1.2, .035, 'sawtooth'); } if (mStep % 4 === 2) noise(.06, 'highpass', 6000, .08);
          mStep++; mNext += .21; } } }
    function music(mode) { if (!ac || mode === mMode) return; mMode = mode;
      if (!mGain) { mGain = ac.createGain(); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; mGain.connect(f); f.connect(master); mGain.gain.value = .9; }
      if (mode === 'calm') startDrone(); else stopDrone(); mNext = ac.currentTime + (mode === 'boss' ? .1 : 1); mStep = 0;
      if (!mTimer) mTimer = setInterval(schedule, 80); }
    return {
      init, get on() { return on; }, music,
      fireball(k) { if (k === 'knife') noise(.12, 'bandpass', 4200, .25, 2200, 5); else { noise(.5, 'lowpass', 1400, .4, 200, .8); tone('sawtooth', 120, 60, .35, .12); } },
      toggle() { on = !on; store.set('cz-snd', on ? '1' : '0'); if (master) master.gain.value = on ? .8 : 0; return on; },
      fire(v) { if (!fireG) return; fireG.gain.value = v * .5; if (on && v > .05 && Math.random() < .25) { noise(.04 + Math.random() * .05, 'highpass', 1800 + Math.random() * 2500, v * .5); } },
      step() { noise(.07, 'lowpass', 500, .12); },
      swing() { noise(.18, 'bandpass', 2600, .3, 500, 2); },
      hit() { tone('sine', 140, 45, .18, .5); noise(.1, 'lowpass', 900, .35); },
      hurt() { tone('triangle', 110, 60, .25, .45); noise(.15, 'bandpass', 700, .3, 300, 2); },
      dissolve() { noise(1.1, 'highpass', 300, .35, 4000, .7); tone('sine', 220, 70, .9, .12); },
      level() { tone('sine', 523, 523, .35, .25); tone('sine', 784, 784, .5, .22, .16); tone('sine', 1046, 1046, .7, .18, .32); },
      zone() { tone('sine', 55, 82, 1.6, .25); noise(1.4, 'lowpass', 200, .2, 900, .7); },
      mob(kind, vol) { vol = vol || .3; if (kind === 'growl') growl(70 + Math.random() * 20, .9, vol); else if (kind === 'roar') growl(42, 1.4, vol * 1.3); else if (kind === 'bark') { growl(150, .18, vol); setTimeout(() => growl(140, .16, vol), 220); } else if (kind === 'whisper') { noise(.9, 'highpass', 1200, vol * .5, 5000, .5); tone('sine', 300, 180, .8, vol * .08); } else if (kind === 'hiss') { noise(.35, 'bandpass', 3200, vol * .6, 1800, 6); } else if (kind === 'shriek') { tone('sawtooth', 900, 400, .35, vol * .25); noise(.3, 'bandpass', 2400, vol * .4, 900, 4); } },
      shot(v) { v = v || 1; noise(.25, 'lowpass', 3000, .7 * v, 300, .7); tone('square', 160, 40, .12, .25 * v); },
      pick() { tone('sine', 880, 880, .12, .18); tone('sine', 1320, 1320, .25, .15, .08); },
      warn() { tone('square', 330, 330, .06, .06); }
    };
  })();
  addEventListener('pointerdown', () => SND.init(), { passive: true });
  addEventListener('keydown', () => SND.init());

  /* =================== ESTADO =================== */
  let me = null, look = null, P = null;
  const others = new Map(), mobs = [], parts = [], ash = [], floats = [], pickups = [];
  let guide = null; const ptraps = [];
  /* casilleros: 2 por mapa (no en zonas seguras), en lugares fijos; se fuerzan con ganzúas, 1 vez por día */
  let CAS = [];
  function placeCas() { CAS = []; if (!grid || MAP.safeAll || MAP.base) return; const r = seeded(hashStr(mapKey) * 31 + 7); let tries = 0;
    while (CAS.length < 2 && tries++ < 4000) { const c = (r() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (inSafe(x, y) || CAS.some(o => Math.hypot(o.x * WS - x, o.y * WS - y) < 900)) continue;
      const nb = [1, -1, GW, -GW].filter(d => grid[c + d]).length; if (nb < 4) continue; CAS.push({ obj: true, cas: true, k: 'cas_' + mapKey + CAS.length, id: mapKey + ':' + CAS.length, nm: 'CASILLERO', x: x / WS, y: y / WS }); } }
  function nearCasillero() { const o = CAS.find(o => Math.hypot(o.x * WS - P.x, (o.y * WS - P.y) * 1.2) < 170); if (!o) return null; return { id: o.id, open: !!(INV.cas && INV.cas[o.id] === dayN()) }; }
  let INV = null, noInvCol = false, noBestCol = false, shake = 0; const shots = [];
  let room = 0, ch = null, lastSent = 0, lastPos = '', running = false, paused = false, warping = false, exitLock = true;
  const lvlOf = xp => Math.min(80, Math.floor(Math.sqrt(xp / 50)) + 1), xpFor = lv => 50 * (lv - 1) * (lv - 1), maxHp = lv => (100 + (lv - 1) * 12) * (P && P.jefe > 0 ? 2 : 1), dmgOf = lv => 1 + Math.floor((lv - 1) / 3);

  /* =================== ARRANQUE =================== */
  /* reglas que se cambian desde Supabase (tabla game_state, k = 'reglas') sin bajar el juego de nuevo */
  const RULES = { muertePierdeNivel: false };
  async function loadRules() { try { const { data } = await sb.from('game_state').select('v').eq('k', 'reglas').maybeSingle(); if (data && data.v) Object.assign(RULES, data.v); } catch (e) {} }
  async function boot() { await loadRules();
    const { data: s } = await sb.auth.getSession(); if (!s.session) return location.replace('/index.html');
    const uid = s.session.user.id;
    const { data: prof } = await sb.from('profiles').select('id,nick,status,faction').eq('id', uid).maybeSingle();
    if (!prof || prof.status !== 'approved' || !prof.faction) return location.replace('/index.html');
    me = prof; document.documentElement.dataset.fac = me.faction;
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) {}
    const { data: gc, error } = await sb.from('game_chars').select('*').eq('user_id', uid).maybeSingle();
    if (error) { $('#load-t').textContent = /relation|does not exist/i.test(error.message) ? 'Falta preparar la base del juego (03_cenizas.sql). Avisale al admin.' : 'No se pudo leer tu personaje: ' + error.message; return; }
    $('#ov-load').hidden = true;
    if (!gc || !gc.look || gc.look.body == null || gc.look.fac !== me.faction) { mySkins = await loadSkins(uid, gc); creator(gc); return; }
    mySkins = await loadSkins(uid, gc);
    look = gc.look; if (look.npc && !mySkins.includes(look.npc)) delete look.npc;
    await begin(gc); checkUnlocks();
  }
  /* skins: Pablo y Pol son de una cuenta; Renzo y Sam se ganan matando a Mercedes */
  let mySkins = [];
  async function loadSkins(uid, gc) { const set = new Set((gc && gc.inv && gc.inv.skins) || []);
    try { const { data } = await sb.from('game_skins').select('skin').eq('user_id', uid); (data || []).forEach(r => set.add(r.skin)); } catch (e) {}
    return [...set].filter(k => skinName(k)); }
  /* EXPERIMENTAL: nivel, mochila y lugar guardados aparte (game_exp, o el teléfono si falta la tabla) */
  let noExpTable = false;
  async function loadExp(uid) { let row = null;
    try { const { data, error } = await sb.from('game_exp').select('*').eq('user_id', uid).maybeSingle(); if (error) noExpTable = true; else row = data; } catch (e) { noExpTable = true; }
    if (!row) { try { row = JSON.parse(store.get('cz-exp-' + uid) || 'null'); } catch (e) {} }
    row = row || {}; return { zone: MAPS[row.zone] ? row.zone : null, x: row.x, y: row.y, xp: row.xp || 0, kills: row.kills || 0, inv: row.inv && row.inv.items ? row.inv : { items: {} } }; }

  /* =================== CREADOR =================== */
  let draw = () => {};
  function perkText() { if (!me || me.faction !== 'ork') return 'Rebeldes: corren más rápido y encuentran más cosas al matar Oscuros.'; return 'ORK: los Oscuros te sacan 15% menos. ' + ['Militar: los Perros te sacan 40% menos.', 'Científico: los Corredores te sacan 40% menos.', 'Espía: los Errantes te sacan 40% menos.'][(look && look.cls) || 0]; }
  function creator(prev) {
    const pl = prev && prev.look && prev.look.body != null ? prev.look : {};
    look = Object.assign({ body: 0, skin: 1, hair: 0, hcol: 1, top: 0, acc: 0 }, pl, { fac: me.faction }); delete look.char;
    const cre = $('#cre'); cre.hidden = false; let rot = 0; const dirs = ['d', 'l', 'u', 'r'];
    if (me.faction === 'ork' && look.cls == null) look.cls = 0;
    const box = $('#opts');
    function rows() { box.querySelectorAll('.opt,.perk').forEach(e => e.remove());
      const opts = [['CUERPO', 'body', () => BODY], ['PIEL', 'skin', () => ['Tono 1', 'Tono 2', 'Tono 3', 'Tono 4']], ['PELO', 'hair', () => HAIR], ['COLOR', 'hcol', () => HCOL.map(h => h[0])],
        ['ROPA', 'top', () => me.faction === 'ork' ? OTOPS[look.cls].map(t => t[0]) : TOPS.rebel.map(t => t[0])], ['ACCESORIO', 'acc', () => ACC]];
      if (HD) { for (let i = opts.length - 1; i >= 0; i--) if (opts[i][1] === 'hair' || opts[i][1] === 'acc') opts.splice(i, 1); opts.push(['PANTALÓN', 'pant', () => PANTC.map(p => p[0])]); opts.splice(opts.findIndex(o => o[1] === 'body') + 1, 0, ['MODELO', 'model', () => ['Modelo 1', 'Modelo 2']]); }
      if (me.faction === 'ork') opts.unshift(['CLASE', 'cls', () => OCLS]);
      const SELL_ = (HD && HD.SEL) || []; if (SELL_.length) { opts.unshift(['ASPECTO', 'pjI', () => ['Armable'].concat(SELL_.map((k, i) => 'Sobreviviente ' + (i + 1)))]); look.pjI = look.pj ? SELL_.indexOf(look.pj) + 1 : 0; }
      if (mySkins.length) opts.unshift(['PERSONAJE', 'npcI', () => ['Propio'].concat(mySkins.map(k => skinName(k)))]);
      look.npcI = look.npc ? mySkins.indexOf(look.npc) + 1 : 0;
      const first = box.firstChild;
      opts.forEach(([lab, k, lf]) => { const list = lf(); const r = document.createElement('div'); r.className = 'opt';
        r.innerHTML = '<span>' + lab + '</span><button aria-label="anterior">‹</button><b></b><button aria-label="siguiente">›</button>';
        const bb = r.querySelector('b'); const upd = () => bb.textContent = list[look[k] || 0] || list[0];
        const ch_ = dv => { look[k] = ((look[k] || 0) + dv + list.length) % list.length; if (k === 'npcI') { if (look.npcI) look.npc = mySkins[look.npcI - 1]; else delete look.npc; } if (k === 'pjI') { if (look.pjI) look.pj = HD.SEL[look.pjI - 1]; else delete look.pj; } if (k === 'cls') { look.top = 0; rows(); } else upd(); draw(); };
        r.children[1].onclick = () => ch_(-1); r.children[3].onclick = () => ch_(1); upd(); box.insertBefore(r, first); });
      const pk = document.createElement('p'); pk.className = 'perk'; pk.textContent = perkText(); box.insertBefore(pk, first); }
    box.innerHTML = '';
    const go = document.createElement('button'); go.className = 'btn solid go'; go.textContent = 'ENTRAR'; box.appendChild(go); rows();
    const pv = $('#pv'), pg = pv.getContext('2d'); pg.imageSmoothingEnabled = false;
    let f = 0; draw = function () { pg.clearRect(0, 0, 48, 64); blitChar(pg, charSprite(look, dirs[rot], f, false), 24, 44, 1, 1); }
    const iv = setInterval(() => { f = (f + 1) % 3; draw(); }, 260); draw();
    $('#pv-rot').onclick = () => { rot = (rot + 1) % 4; draw(); };
    go.onclick = async () => { go.disabled = true; clearInterval(iv); delete look.npcI; delete look.pjI;
      const [hz, hp_] = home(); const fresh = !(prev && MAPS[prev.zone] && prev.x); const zone = fresh ? hz : prev.zone;
      const row = { user_id: me.id, look, zone, x: fresh ? hp_[0] * WS : prev.x, y: fresh ? hp_[1] * WS : prev.y, hp: prev && prev.hp || 100, xp: prev ? prev.xp || 0 : 0, kills: prev ? prev.kills || 0 : 0, updated_at: new Date().toISOString() };
      if (prev && prev.inv) row.inv = prev.inv; if (prev && prev.best_xp) row.best_xp = prev.best_xp;
      let { error } = await sb.from('game_chars').upsert(row); if (error && /inv|best_xp/.test(error.message || '')) { delete row.inv; delete row.best_xp; ({ error } = await sb.from('game_chars').upsert(row)); } if (error) { go.disabled = false; return toast('No se pudo guardar: ' + error.message); }
      cre.hidden = true; await masksReady; begin(row); };
  }

  /* PvP: cada vez que entrás elegís bando, pero si un bando tiene más gente sólo podés ir al otro hasta que se equilibre */
  let lobby = null;
  async function begin(row) { if (!EXP) return startGame(row); const side = await pickSide(); me = Object.assign({}, me, { faction: side, realFac: me.faction }); document.documentElement.dataset.fac = side; look = Object.assign({}, look, { fac: side }); if (side === 'ork' && look.cls == null) look.cls = 0;
    try { lobby && lobby.track({ fac: side, nick: me.nick }); } catch (e) {} startGame(await loadExp(me.id)); }
  function pickSide() { return new Promise(res => { const ov = document.createElement('div'); ov.className = 'ov'; ov.innerHTML = '<div class="box"><h2>PVP · BANDO</h2><p id="ps-t">Contando quién está adentro…</p><div class="row"><button class="btn" id="ps-r" disabled>REBELDES</button><button class="btn" id="ps-o" disabled>ORK</button></div></div>'; document.body.appendChild(ov);
      const count = () => { const n = { rebel: 0, ork: 0 }; try { const st = lobby.presenceState(); Object.keys(st).forEach(id => { if (id === me.id) return; const f = (st[id][0] || {}).fac; if (n[f] != null) n[f]++; }); } catch (e) {} return n; };
      const show = () => { const n = count(), r = ov.querySelector('#ps-r'), o = ov.querySelector('#ps-o'); r.disabled = n.rebel > n.ork; o.disabled = n.ork > n.rebel;
        ov.querySelector('#ps-t').textContent = 'Adentro: ' + n.rebel + ' rebeldes · ' + n.ork + ' ORK. ' + (n.rebel === n.ork ? 'Elegí tu bando.' : 'Para equilibrar, sólo podés entrar como ' + (n.rebel > n.ork ? 'ORK' : 'REBELDE') + '.'); };
      try { lobby = sb.channel('gpvp:lobby', { config: { presence: { key: me.id } } }); lobby.on('presence', { event: 'sync' }, show).subscribe(() => {}); } catch (e) {}
      setTimeout(show, 1500); const pick = f => { ov.remove(); res(f); }; ov.querySelector('#ps-r').onclick = () => pick('rebel'); ov.querySelector('#ps-o').onclick = () => pick('ork'); }); }
  /* =================== JUEGO =================== */
  function startGame(gc) { gc = gc || {};
    const lv = lvlOf(gc.xp || 0);
    P = { x: 0, y: 0, dir: 'd', face: 1, mv: false, walkT: 0, stepT: 0, atk: 0, cd: 0, hp: maxHp(lv), xp: gc.xp || 0, kills: gc.kills || 0, hurtT: 0, inv: 0, say: '', sayT: 0, dead: false, stam: 3, tired: false };
    let inv = gc.inv && gc.inv.items ? gc.inv : null; if (!inv && !EXP) { try { inv = JSON.parse(store.get('cz-inv-' + me.id) || 'null'); } catch (e) {} }
    INV = Object.assign({ items: {}, eq: { arma: 'palo', luz: null, cara: null, brazo: null }, bat: 0 }, inv || {}); INV.eq = Object.assign({ arma: 'palo', luz: null, cara: null, brazo: null }, INV.eq || {}); INV.items = INV.items || {}; INV.dur = INV.dur || {}; INV.lost = INV.lost || {}; INV.eq.ropa = INV.eq.ropa || null; delete INV.items.botiquin; INV.coins = INV.coins || 0; INV.ab = INV.ab || []; P.best = Math.max(gc.best_xp || 0, gc.xp || 0);
    /* 2.1: reinicio de objetos y niveles (una sola vez); se conservan los personajes desbloqueados */
    /* reinicio general (lo marca el SQL en game_state 'reglas'.reset): mochila, nivel, misiones y lugar a cero */
    if (RULES.reset && INV.reset !== RULES.reset) { const sk = INV.skins; INV = { items: { vendas: 3 }, eq: { arma: 'palo', luz: null, cara: null, brazo: null, ropa: null }, bat: 0, dur: {}, lost: {}, coins: 10, ab: [], q: { cura: 'vendas', esp: null }, ver: VER, reset: RULES.reset }; if (sk) INV.skins = sk;
      P.xp = 0; P.kills = 0; P.best = 0; P.hp = maxHp(1); gc = Object.assign({}, gc, { zone: null }); setTimeout(() => toast('Reinicio general: arrancás de cero, nivel 1, en la base de tu bando.'), 1800); }
    if (INV.ver !== VER) { if (INV.ver !== '2.1') { P.xp = 0; P.kills = 0; INV.ab = []; P.hp = maxHp(1); } INV.ver = VER; gc = Object.assign({}, gc, { zone: null }); setTimeout(() => toast('THE O|F 2.1 · nivel reiniciado: arrancás en la base de tu bando.'), 1800); }
    INV.q = INV.q || { cura: 'vendas', esp: null };
    $('#h-nick').textContent = me.nick + (EXP ? ' · PVP' : ' · HISTORIA'); ['#hud', '#topr', '#pads', '#hintL', '#stick'].forEach(s => $(s).hidden = false); if (EXP) $('#d-fac').hidden = true;
    document.body.classList.add('playing'); $('#m-snd').textContent = 'SONIDO: ' + (SND.on ? 'SÍ' : 'NO');
    for (let i = 0; i < 90; i++) ash.push(newAsh(true));
    const fresh = !MAPS[gc.zone]; const [hz, hp_] = home(); const zone = fresh ? hz : gc.zone;
    enterMap(zone, fresh ? hp_[0] * WS : gc.x, fresh ? hp_[1] * WS : gc.y, true);
    running = true; last = performance.now(); requestAnimationFrame(loop);
    setInterval(persist, 20000); setInterval(worldTick, 4000); worldTick(); quickBtns();
    if (STORY && window.CZ_STORY) CZ_STORY.init(API);
  }
  let yuki = null; const hordeSeen = {}, yukiSaid = {};
  function yukiPlan() { const d = dayN(), r = seeded(d * 7919 + 13), ks = Object.keys(MAPS).filter(k => !MAPS[k].safeAll && !MAPS[k].base); return { day: d, map: ks[(r() * ks.length) | 0], start: (r() * (1440 - 120)) | 0 }; }
  function worldTick() { if (!running || !MAP) return; if (EXP) return;
    const hk = mapKey + dayN() + (minOfDay() / 6 | 0); if (hordeOn(mapKey) && !hordeSeen[hk]) { hordeSeen[hk] = 1; toast('¡HORDA DE OSCUROS en ' + MAP.name.toLowerCase() + '!'); SND.zone(); }
    const y = yukiPlan(), now = minOfDay(), active = now >= y.start && now < y.start + 120;
    if (active && INV.yuki !== y.day && !yukiSaid[y.day]) { yukiSaid[y.day] = 1; toast('Se escucha un chillido raro en ' + MAPS[y.map].name.toLowerCase() + '. Yuki anda cerca.'); }
    if (active && y.map === mapKey && INV.yuki !== y.day && !yuki) { const p = randomWalkCell(400); if (p) { yuki = { x: p[0], y: p[1], day: y.day, t: 0 }; SND.whisper && SND.whisper(); } }
    if (yuki && (y.map !== mapKey || !active)) yuki = null; }
  function yukiTouch() { if (!yuki || P.dead || Math.hypot(yuki.x - P.x, (yuki.y - P.y) * 1.2) > 110) return; const k = Math.random() < .7 ? 'baston' : PISTA();
    addItem(k); INV.yuki = yuki.day; yuki = null; SND.pick(); buzz([20, 30, 20]); toast('Yuki chilla, te deja algo y desaparece: ' + ITEMS[k].n + '.');
    if (EXP && /^pista_/.test(k) && INV.items[k] >= 3) { INV.items[k] -= 3; if (!INV.items[k]) delete INV.items[k]; addItem(BRZ()); } persist(); }
  /* trampas del mapa central del PvP: te frenan y lastiman un poco */
  const TRAPS = { pvp_centro: [[300, 420], [760, 360], [1180, 300], [980, 640], [520, 760], [1400, 520], [220, 640], [1100, 860], [860, 180], [1540, 220]] };
  let traps = [], tileCd = 0;
  function routeTo(from, to) { if (from === to) return null; const prev = { [from]: null }, q = [from]; while (q.length) { const k = q.shift(); for (const e of (MAPS[k].exits || [])) { if (!e.to || !MAPS[e.to] || e.to in prev) continue; prev[e.to] = [k, e]; if (e.to === to) { let cur = to, first = null; while (prev[cur]) { first = prev[cur][1]; cur = prev[cur][0]; } return first; } q.push(e.to); } } return null; }
  function ptrapTick() { const now = Date.now(); for (let i = ptraps.length - 1; i >= 0; i--) { const tp = ptraps[i]; if (now - tp.t > 240000) { ptraps.splice(i, 1); continue; } if (tp.m !== mapKey) continue;
      if (tp.fac !== me.faction && !P.dead && Math.hypot(tp.x - P.x, (tp.y - P.y) * 1.3) < 50) { ptraps.splice(i, 1); net('trapx', { id: tp.id }); P.slow = 4; P.hp = Math.max(1, P.hp - 12); P.hurtT = .4; SND.hurt(); buzz([60, 30, 60]); floats.push({ x: P.x, y: P.y - 190, t: 1, txt: '¡TRAMPA!', c: '#ff8050' }); hud(); continue; }
      if (tp.by === me.id) { const o = mobs.find(o => o.hp > 0 && !o.T.boss && Math.hypot(tp.x - o.x, (tp.y - o.y) * 1.3) < 60); if (o) { ptraps.splice(i, 1); net('trapx', { id: tp.id }); o.slowT = 4; hitMob(o, 14, 0, 0); } } } }
  function pvpTick(dt) { ptrapTick(); if (!P || P.dead) return; traps.forEach(tp => { tp.cd = Math.max(0, tp.cd - dt); if (tp.cd <= 0 && Math.hypot(tp.x - P.x, (tp.y - P.y) * 1.3) < 46) { tp.cd = 20; P.slow = 3; P.hp = Math.max(1, P.hp - 6); P.hurtT = .3; SND.hurt(); buzz([40, 30, 40]); floats.push({ x: P.x, y: P.y - 190, t: .9, txt: 'TRAMPA', c: '#ffb070' }); hud(); } });
    tileCd = Math.max(0, tileCd - dt); const T_ = MAP.tiles; if (T_ && tileCd <= 0) { const i = T_.findIndex(p => Math.hypot(p[0] * WS - P.x, (p[1] * WS - P.y) * 1.3) < 50); if (i >= 0) { const opts = T_.filter((_, j) => j !== i), d = opts[(Math.random() * opts.length) | 0]; tileCd = 4; SND.zone(); buzz(30);
        for (let k = 0; k < 18; k++) parts.push({ x: P.x + rnd(-20, 20), y: P.y - rnd(0, 160), vx: rnd(-40, 40), vy: rnd(-90, -20), life: .6, s: 3, c: 210 }); P.x = d[0] * WS; P.y = d[1] * WS + 40; if (!walkable(P.x, P.y)) P.y -= 80; P.inv = Math.max(P.inv, 1); sendPos(true); } } }
  function enterMap(k, x, y, first) { yuki = null; loadHourly(k); 
    loadMap(k); placeCas();
    const okPos = x && y && walkable(x, y);
    P.x = okPos ? x : MAP.spawn[0] * WS; P.y = okPos ? y : MAP.spawn[1] * WS; P.inv = 4; exitLock = true; P.exitT = 1.5;
    mobs.length = 0; parts.length = 0; floats.length = 0; pickups.length = 0;
    const nPick = MAP.safeAll ? 1 : 3; for (let i = 0; i < nPick; i++) spawnPickup();
    sueroTick(true);
    Object.keys(INV.lost).forEach(w => { if (INV.lost[w] === k) { spawnPickup(w); delete INV.lost[w]; } }); shots.length = 0;
    hud(); healBtn(); abButtons();
    const z = $('#zone'); $('#zone-n').textContent = MAP.name; $('#zone-s').textContent = MAP.safeAll ? 'zona segura · acá no entran los Oscuros' : (Object.keys(wantMobs()).length ? 'Oscuros: ' + Object.keys(wantMobs()).map(m => MOB[m].name).join(' · ') : '');
    z.classList.add('on'); setTimeout(() => z.classList.remove('on'), 2600); if (!first) SND.zone();
    mshots.length = 0; clouds.length = 0; roomReady = false; isHost = true; hostId = null; Object.keys(lastDeath).forEach(k => delete lastDeath[k]);
    joinRoom(1); traps = (MAP.traps || TRAPS[k] || []).map(p => ({ x: p[0] * WS, y: p[1] * WS, cd: 0 })); tileCd = 2;
    if (STORY && window.CZ_STORY) CZ_STORY.enter(k);
  }
  function warp(e) { if (warping) return; const dest = MAPS[e.to];
    if (!dest) { exitLock = true; buzz(40); toast('Camino peligroso. No se puede avanzar.'); const cx = (e.r[0] + e.r[2]) / 2 * WS, cy = (e.r[1] + e.r[3]) / 2 * WS, dx = P.x - cx, dy = P.y - cy, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 12; i++) { const nx = P.x + dx / l * 12, ny = P.y + dy / l * 12; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } return; }
    if (STORY && window.CZ_STORY && !CZ_STORY.canWarp(e)) { exitLock = true; return; }
    if (EXP && dest.base && dest.base !== me.faction) { exitLock = true; buzz(40); return toast(dest.base === 'ork' ? 'BASE ORK · no podés pasar.' : 'BASE REBELDE · no podés pasar.'); }
    warping = true; $('#fade').classList.add('on'); persist();
    setTimeout(() => { enterMap(e.to, e.at[0] * WS, e.at[1] * WS); sendPos(true); persist(); $('#fade').classList.remove('on'); warping = false; }, 650); }
  function warpTo(k, x, y) { if (!MAPS[k]) return; warping = true; $('#fade').classList.add('on'); setTimeout(() => { enterMap(k, x != null ? x * WS : null, y != null ? y * WS : null); sendPos(true); persist(); $('#fade').classList.remove('on'); warping = false; }, 650); }
  function hud() { const lv = lvlOf(P.xp), a = xpFor(lv), b = xpFor(lv + 1); $('#h-hp').style.width = Math.max(0, P.hp / maxHp(lv) * 100) + '%'; $('#h-xp').style.width = ((P.xp - a) / (b - a) * 100) + '%';
    $('#h-lv').textContent = 'NV ' + lv + ' · ' + (INV ? weaponLabel() : 'PALO') + ' · ' + Math.ceil(P.hp) + '/' + maxHp(lv) + (INV && INV.eq.luz ? ' · LUZ ' + Math.ceil(INV.bat) + '%' : '') + (INV && INV.eq.ropa ? ' · ESCUDO ' + (INV.dur[INV.eq.ropa] != null ? INV.dur[INV.eq.ropa] : ITEMS[INV.eq.ropa].shield) : '') + ' · ' + (INV ? INV.coins : 0) + ' monedas' + (INV && INV.ab.length ? ' · ' + INV.ab.map(a => AB[a].n).join(' · ') : '') + (suero.map ? ' · MALETÍN: ' + MAPS[suero.map].name : ''); }
  async function persist() { if (!P || !me || !look) return; if (EXP) return persistExp(); store.set('cz-inv-' + me.id, JSON.stringify(INV));
    const row = { user_id: me.id, look, zone: mapKey, x: Math.round(P.x), y: Math.round(P.y), hp: Math.max(1, Math.round(P.hp)), xp: P.xp, kills: P.kills, updated_at: new Date().toISOString() };
    P.best = Math.max(P.best || 0, P.xp); if (!noInvCol) row.inv = INV; if (!noBestCol) row.best_xp = P.best;
    try { for (let k = 0; k < 3; k++) { const { error } = await sb.from('game_chars').upsert(row); if (!error) break; const m = error.message || '';
        if (/best_xp/.test(m)) { noBestCol = true; delete row.best_xp; } else if (/inv/.test(m)) { noInvCol = true; delete row.inv; } else break; } } catch (e) {} }

  async function persistExp() { const row = { user_id: me.id, zone: mapKey, x: Math.round(P.x), y: Math.round(P.y), hp: Math.max(1, Math.round(P.hp)), xp: P.xp, kills: P.kills, inv: INV, updated_at: new Date().toISOString() };
    store.set('cz-exp-' + me.id, JSON.stringify(row)); if (noExpTable) return; try { const { error } = await sb.from('game_exp').upsert(row); if (error) noExpTable = true; } catch (e) {} }
  /* skins del MUNDO: se guardan en la mochila del modo MUNDO */
  async function grantSkins(list) { if (EXP) return; INV.skins = INV.skins || []; const nw = list.filter(k => !INV.skins.includes(k)); if (!nw.length) return; INV.skins.push(...nw); try { sb.rpc('game_grant_boss_skins').then(() => {}, () => {}); } catch (e) {} nw.forEach(k => { if (!mySkins.includes(k)) mySkins.push(k); });
    setTimeout(() => toast('DESBLOQUEASTE A ' + nw.map(k => (skinName(k) || k).toUpperCase()).join(' Y ') + ' · elegilos en DESKTOP'), 1400); persist(); }
  /* ---------- el suero: uno solo en todo el mundo, cambia de lugar cada 3 minutos ---------- */
  const SLOT_MS = 180000, MAP_KEYS = Object.keys(MAPS); const suero = { slot: -1, map: null, taken: -1 };
  function seeded(n) { let a = (n * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function clearSuero() { for (let i = pickups.length - 1; i >= 0; i--) if (pickups[i].k === 'suero') pickups.splice(i, 1); }
  function sueroTick(force) { if (EXP) return; const slot = Math.floor(Date.now() / SLOT_MS); if (slot === suero.slot && !force) return;
    const changed = slot !== suero.slot; suero.slot = slot; const r = seeded(slot); suero.map = MAP_KEYS[(r() * MAP_KEYS.length) | 0]; clearSuero();
    if (suero.taken === slot) { suero.map = null; hud(); return; }
    try { sb.from('game_state').select('v').eq('k', 'suero').maybeSingle().then(res => { const v = res && res.data && res.data.v; if (v && v.slot === slot) { suero.taken = slot; suero.map = null; clearSuero(); hud(); } }, () => {}); } catch (e) {}
    if (suero.map === mapKey) { for (let k = 0; k < 3000; k++) { const c = (r() * grid.length) | 0; if (grid[c]) { pickups.push({ k: 'suero', x: (c % GW + .5) * CW, y: (((c / GW) | 0) + .5) * CW, t: 0, pid: 'suero-' + slot }); break; } } }
    if (changed && running) toast('Rumor en la red: hay un maletín de curación en ' + MAPS[suero.map].name.toLowerCase() + '.'); hud(); }
  function sueroTaken() { suero.taken = suero.slot; suero.map = null; try { sb.from('game_state').upsert({ k: 'suero', v: { slot: suero.slot, by: me.nick }, updated_at: new Date().toISOString() }).then(() => {}, () => {}); } catch (e) {} hud(); }

  /* ---------- items ---------- */
  const curW = () => WEAP[INV && INV.eq.arma] ? INV.eq.arma : 'palo';
  function weaponLabel() { const w = curW(), it = ITEMS[w]; return WEAP[w].n + (it && it.uses ? ' ' + (INV.dur[w] != null ? INV.dur[w] : it.uses) + (WEAP[w].gun ? ' tiros' : '') : ''); }
  function ownedWeapons() { return WEAPON_KEYS.filter(w => w === 'palo' || hasItem(w)); }
  function cycleWeapon() { if (!P || P.dead) return; const list = ownedWeapons(); if (list.length < 2) return toast('Solo tenés el palo. Buscá armas en los mapas.'); const i = list.indexOf(curW()); setWeapon(list[(i + 1) % list.length]); }
  function setWeapon(w) { INV.eq.arma = w; const it = ITEMS[w]; if (it && it.uses && INV.dur[w] == null) INV.dur[w] = it.uses; SND.pick(); toast('En la mano: ' + (w === 'palo' ? 'Palo' : it.n)); hud(); quickBtns(); }
  function breakItem(k) { const it = ITEMS[k]; INV.items[k] = (INV.items[k] || 1) - 1;
    if (INV.items[k] > 0) INV.dur[k] = it.shield || it.uses; else { delete INV.items[k]; delete INV.dur[k]; if (it.eq === 'ropa') INV.eq.ropa = null; }
    const ms = Object.keys(MAPS).filter(m => m !== mapKey); const where = ms[(Math.random() * ms.length) | 0]; INV.lost[k] = where;
    SND.hurt(); toast('Se rompió: ' + it.n + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); hud(); persist(); }
  function wearWeapon() { const w = curW(), it = ITEMS[w]; if (!it || !it.uses) return; if (INV.dur[w] == null) INV.dur[w] = it.uses; INV.dur[w]--;
    if (INV.dur[w] <= 0) { INV.items[w] = (INV.items[w] || 1) - 1; if (INV.items[w] > 0) INV.dur[w] = it.uses; else { delete INV.items[w]; delete INV.dur[w]; INV.eq.arma = 'palo'; }
      const others_ = Object.keys(MAPS).filter(m => m !== mapKey && !MAPS[m].safeAll); const where = others_[(Math.random() * others_.length) | 0]; INV.lost[w] = where;
      SND.hurt(); buzz([30, 30, 30]); toast((WEAP[w].gun ? (w === 'baston' ? 'El bastón se apagó y se rompió' : 'Se te acabaron los tiros de la ' + it.n.toLowerCase()) : 'Se rompió ' + (/lanza|katana|barra/.test(w) ? 'la ' : 'el ') + it.n.toLowerCase()) + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); persist(); }
    hud(); }
  function randomWalkCell(minDist) { for (let k = 0; k < 400; k++) { const c = (Math.random() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (Math.hypot(x - P.x, y - P.y) > minDist && !(MAP.exits || []).some(e => x / WS >= e.r[0] - 40 && x / WS <= e.r[2] + 40 && y / WS >= e.r[1] - 40 && y / WS <= e.r[3] + 40)) return [x, y]; } return null; }
  function spawnPickup(k, at) { const p = at || randomWalkCell(300); if (!p) return; pickups.push({ k: k || pickW(LOOT[mapKey] || LOOT.parque), x: p[0], y: p[1], t: Math.random() * 6 }); }
  function addItem(k, n) { INV.items[k] = (INV.items[k] || 0) + (n || 1); }
  function hasItem(k) { return (INV.items[k] || 0) > 0; }
  const dmgMult = () => { let m = 1 / (1 + .09 * (lvlOf(P.xp) - 1)); if (P.jefe > 0) m *= .5; if (INV.eq.brazo === 'b_contencion') m *= .7; if (INV.eq.cara === 'mascara' && /refugioSub|bunker|lab|patio/.test(mapKey)) m *= .8; return m; };
  function classMult(mk) { if (!mk || me.faction !== 'ork') return 1; let m = .85; const c = (look && look.cls) || 0;
    if ((c === 0 && mk === 'perro') || (c === 1 && mk === 'corredor') || (c === 2 && mk === 'errante')) m *= .6; return m; }
  function hitPlayer(d, knockFrom, knock, byId, mk) { if (P.dead || P.inv > 0 || P.furia > 0 || (!byId && inSafe(P.x, P.y))) return false;
    if (!byId && mk && d < 999 && MOB[mk]) { if (MOB[mk].burn && !(P.burn > 0)) { P.burn = 5; toast('¡Te prendiste fuego! 5 segundos de quemadura (la venda para quemaduras lo corta).'); } if (MOB[mk].poison && !(P.poison > 0)) { P.poison = 25; toast('Te envenenaron. Usá antiveneno.'); } }
    d = Math.max(1, Math.round(d * dmgMult() * classMult(mk || (knockFrom && knockFrom.kind) || (byId ? null : 'oscuro'))));
    const rk = INV.eq.ropa; if (rk && ITEMS[rk]) { if (INV.dur[rk] == null) INV.dur[rk] = ITEMS[rk].shield; const take = Math.min(INV.dur[rk], d); INV.dur[rk] -= take; d -= take;
      floats.push({ x: P.x + 26, y: P.y - 210, t: .8, txt: 'escudo -' + take, c: '#a9b4c0' }); if (INV.dur[rk] <= 0) breakItem(rk); }
    P.hp -= d; P.hurtT = .3; SND.hurt(); buzz(knock ? [60, 30, 60] : 40); shake = Math.max(shake, knock ? .35 : .15);
    floats.push({ x: P.x, y: P.y - 190, t: .9, txt: '-' + d, c: '#ff6a5c' });
    if (knock && knockFrom) { const dx = P.x - knockFrom.x, dy = P.y - knockFrom.y, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 6; i++) { const nx = P.x + dx / l * knock / 6, ny = P.y + dy / l * knock / 6; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } }
    if (P.hp <= 0) { P.hp = 0; P.dead = true; buzz([80, 60, 160]);
      /* MUNDO: si te mata un jugador o un jefe no perdés nivel; si te mata un Oscuro volvés al 1 */
      const byBoss = !byId && mk && MOB[mk] && MOB[mk].boss, rescued = me.faction === 'ork' ? 'ORK te rescató y te curaron.' : 'Los rebeldes te ayudaron y te volvieron a curar.';
      /* 2.1: en la HISTORIA no se pierde nivel, salvo 3 muertes seguidas (-1 nivel). En PvP nunca. */
      let keep = true, minus = false; if (EXP) { const L0 = lvlOf(P.xp), nl = Math.max(1, L0 - (2 + ((Math.random() * 3) | 0))); if (nl < L0) { minus = true; keep = false; P.lostLv = L0; P.xp = xpFor(nl); } }
      if (STORY) { INV.racha = (INV.racha || 0) + 1; if (INV.racha >= 3 && lvlOf(P.xp) > 1) { INV.racha = 0; keep = false; minus = true; P.lostLv = lvlOf(P.xp); P.xp = xpFor(P.lostLv - 1); } }
      let lostAb = 0; P.jefe = 0; if (window.CZ_STORY && STORY) CZ_STORY.died();
      if (byId) { const who = (others.get(byId) || {}).nick || 'alguien'; $('#ov-dead').querySelector('p').textContent = 'Te derribó ' + who + '. ' + (keep ? rescued : homeText()); pvpDrop(); net('died', { id: me.id, by: byId }); }
      else $('#ov-dead').querySelector('p').textContent = (byBoss ? MOB[mk].name + ' te derribó. ' + rescued : 'La ceniza te cubrió. ' + (keep ? rescued : homeText()));
      $('#d-lv').textContent = minus ? (EXP ? 'Caíste en el PvP: bajás del nivel ' : 'Tercera caída seguida: bajás del nivel ') + P.lostLv + ' al ' + lvlOf(P.xp) + '.' : 'No perdiste nivel: seguís en el ' + lvlOf(P.xp) + '.' + (STORY && INV.racha ? ' (Caídas seguidas: ' + INV.racha + '/3)' : '');
      sendPos(true); persist(); setTimeout(() => $('#ov-dead').hidden = false, 700); }
    hud(); return true; }

  /* PvP: al morir a manos de otro jugador se te cae un objeto común */
  function pvpDrop() { const k = ['suero', 'pilas', 'campera', 'chaleco'].find(k => hasItem(k) && INV.eq.ropa !== k && k !== 'vendas'); if (!k) return; INV.items[k]--; if (!INV.items[k]) delete INV.items[k];
    const pid = me.id.slice(0, 6) + Date.now(); pickups.push({ k, x: P.x, y: P.y, t: 0, pid }); net('drop', { pid, k, x: Math.round(P.x), y: Math.round(P.y) }); persist(); }
  const enemy = o => o && o.fac && o.fac !== me.faction && !o.dead && !o.iv;

  /* mochila */
  let invSel = null;
  function openInv() { if (!running || P.dead) return; paused = true; $('#ov-inv').hidden = false; renderInv(); }
  function closeInv() { paused = false; $('#ov-inv').hidden = true; healBtn(); persist(); }
  function renderInv() {
    const eqName = k => k ? (k === 'palo' ? 'Palo' : ITEMS[k].n) : '—';
    $('#inv-eq').onclick = e => { const sp = e.target.closest('[data-s]'); if (!sp) return; const sl = sp.dataset.s; if (sl === 'arma') setWeapon('palo'); else INV.eq[sl] = null; hud(); renderInv(); };
    $('#inv-eq').innerHTML = '<span data-s="arma">ARMA <b>' + eqName(INV.eq.arma) + '</b></span><span data-s="luz">LUZ <b>' + (INV.eq.luz ? 'Linterna ' + Math.ceil(INV.bat) + '%' : '—') + '</b></span><span data-s="ropa">ROPA <b>' + eqName(INV.eq.ropa) + '</b></span><span data-s="cara">CARA <b>' + eqName(INV.eq.cara) + '</b></span><span data-s="brazo">BRAZO <b>' + eqName(INV.eq.brazo) + '</b></span>';
    const box = $('#inv-slots'); box.innerHTML = ''; const keys = Object.keys(ITEMS).filter(k => hasItem(k));
    if (!keys.length) box.innerHTML = '<div class="empty">La mochila está vacía. Buscá cosas brillando en el piso.</div>';
    keys.forEach(k => { const b = document.createElement('button'); b.setAttribute('aria-pressed', invSel === k); if (Object.values(INV.eq).includes(k)) b.classList.add('on');
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48; { const g_ = cv.getContext('2d'), ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; g_.drawImage(ic, 0, 0, 48, 48); } b.appendChild(cv);
      if (INV.items[k] > 1) { const i = document.createElement('i'); i.textContent = INV.items[k]; b.appendChild(i); }
      if (Object.values(INV.eq).includes(k)) { const u = document.createElement('em'); u.textContent = 'EN USO'; b.appendChild(u); }
      b.onclick = () => { invSel = k; if (ITEMS[k].eq) useItem(k, 'eq'); else renderInv(); }; box.appendChild(b); });
    const det = $('#inv-det'); const QS = Object.values(NPCS).flat().filter(n => n.quest && (INV.quests_seen || {})[n.quest.id] && !(INV.quests || {})[n.quest.id]);
    const diario = QS.length ? '<p><b>MISIONES</b><br>' + QS.map(n => n.nm + ': ' + Object.entries(n.quest.need).map(([k, c]) => ITEMS[k].n + ' ' + Math.min(c, INV.items[k] || 0) + '/' + c).join(', ')).join('<br>') + '</p>' : '';
    if (!invSel || !hasItem(invSel)) { det.innerHTML = diario + '<p>Tocá un objeto para ver qué hace.</p>'; return; }
    const it = ITEMS[invSel]; let act = '';
    if (it.use === 'heal' || it.use === 'venda' || it.use === 'kitsune' || it.use === 'furia' || it.use === 'comer' || it.use === 'jefe' || it.use === 'leer' || it.use === 'fumar' || it.use === 'vida' || it.use === 'radar' || it.use === 'volver' || it.use === 'forzar' || it.use === 'trampa' || it.use === 'antiveneno' || it.use === 'vendaq') { const sl = QUICK_HEAL.includes(it.use) ? 'cura' : 'esp', on = (INV.q || {})[sl] === invSel; act = '<button class="btn solid" data-a="use">USAR</button><button class="btn" data-a="q">' + (on ? 'SACAR DEL ACCESO RÁPIDO' : sl === 'cura' ? 'PONER EN CURA RÁPIDA' : 'PONER EN ESPECIAL RÁPIDO') + '</button>'; }
    if (it.use === 'pilas') act = '<button class="btn solid" data-a="use">CARGAR LINTERNA</button>';
    if (it.use === 'luz') act = '<button class="btn solid" data-a="use">' + (INV.eq.luz ? 'APAGAR' : 'PRENDER') + '</button><button class="btn" data-a="q">' + ((INV.q || {}).esp === invSel ? 'SACAR DEL ACCESO RÁPIDO' : 'PONER EN ESPECIAL RÁPIDO') + '</button>';
    if (it.eq && it.use !== 'luz') { const on = INV.eq[it.eq] === invSel; act = '<button class="btn solid" data-a="eq">' + (on ? (it.eq === 'arma' ? 'GUARDAR Y USAR EL PALO' : it.eq === 'luz' ? 'APAGAR' : 'SACAR') : (it.eq === 'luz' ? 'PRENDER' : it.eq === 'arma' ? 'TENER EN LA MANO' : 'EQUIPAR')) + '</button>'; }
    det.innerHTML = '<b>' + it.n + (INV.items[invSel] > 1 ? ' ×' + INV.items[invSel] : '') + '</b><small>' + it.t.toUpperCase() + (it.uses ? ' · ' + (invSel === 'pistola' ? 'TIROS ' : 'USOS ') + (INV.dur[invSel] != null ? INV.dur[invSel] : it.uses) + '/' + it.uses : '') + (it.shield ? ' · QUEDA ' + (INV.dur[invSel] != null ? INV.dur[invSel] : it.shield) + '/' + it.shield : '') + '</small><p>' + it.d + '</p>' + (act ? '<div class="row">' + act + '</div>' : '');
    det.querySelectorAll('[data-a]').forEach(b => b.onclick = () => useItem(invSel, b.dataset.a)); }
  function useItem(k, a) { const it = ITEMS[k]; const lv = lvlOf(P.xp);
    if (a === 'use' && it.use === 'heal') { if (P.hp >= maxHp(lv)) return toast('Ya estás con la vida completa. Guardalo.'); P.hp = maxHp(lv); INV.items[k]--; SND.level(); toast(k === 'kit' ? 'Usaste el kit. Vida completa.' : 'Abriste el maletín. Vida completa.'); }
    if (a === 'use' && it.use === 'venda') { useVenda(); renderInv(); return; }
    if (a === 'use' && it.use === 'comer') { const lv_ = lvlOf(P.xp); if (P.hp >= maxHp(lv_)) return toast('No tenés hambre.'); P.hp = Math.min(maxHp(lv_), P.hp + 15); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; SND.pick(); hud(); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'furia') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); P.furia = 10; SND.level(); buzz([60, 40, 120]); shake = .4; toast('FURIA · 10 segundos invencible y pegás el doble.'); persist(); return; }
    if (a === 'use' && it.use === 'kitsune') { closeInv(); useKitsune(); return; }
    if (a === 'use' && it.use === 'jefe') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); P.jefe = 60; P.hp = maxHp(lvlOf(P.xp)); SND.level(); buzz([80, 40, 160]); shake = .5; toast('PODER DE JEFE · 60 segundos: doble vida, mitad de daño, pegás más fuerte.'); hud(); persist(); return; }
    if (a === 'q') { const q = INV.q = INV.q || {}; const slot = QUICK_HEAL.includes(it.use) ? 'cura' : 'esp'; q[slot] = q[slot] === k ? null : k; quickBtns(); renderInv(); return; }
    if (a === 'use' && it.use === 'leer') { const L = LORE[(INV.leidas = (INV.leidas || 0) + 1) % LORE.length]; INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.xp += 40 + lvlOf(P.xp) * 6; toast('Cuaderno: "' + L + '"'); SND.pick(); hud(); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'fumar') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.hp = Math.max(1, P.hp - 8); P.smoke = 20; toast('Fumaste. Te falta el aire: vas más lento un rato.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'vida') { if (P.hp >= maxHp(lv)) return toast('No tenés sed.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.hp = Math.min(maxHp(lv), P.hp + 40); P.fast = 8; SND.pick(); toast('Agua filtrada: +40 de vida y piernas livianas por 8 segundos.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'descuento') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; INV.descT = Date.now() + 600000; toast('Credencial mostrada: 10 minutos con 30% de descuento en las tiendas.'); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'volver') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); const [hz, hp_] = home(); toast('El fragmento se parte. Todo se dobla…'); warpTo(hz, hp_[0], hp_[1]); persist(); return; }
    if (a === 'use' && it.use === 'trampa') { if (EXP && MAP.safeAll || inSafe(P.x, P.y)) return toast('Acá no se pueden poner trampas.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; const tp = { m: mapKey, id: me.id.slice(0, 4) + Date.now().toString(36), x: Math.round(P.x), y: Math.round(P.y), fac: me.faction, by: me.id, t: Date.now() }; ptraps.push(tp); net('trap', tp); SND.pick(); toast('Trampa puesta. El otro bando sólo ve una marquita.'); closeInv(); persist(); return; }
    if (a === 'use' && it.use === 'antiveneno') { if (!(P.poison > 0)) return toast('No estás envenenado. Guardalo.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.poison = 0; SND.pick(); toast('El veneno se cortó.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'vendaq') { if (!(P.burn > 0) && P.hp >= maxHp(lv)) return toast('No estás quemado. Guardala.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.burn = 0; P.hp = Math.min(maxHp(lv), P.hp + 15); SND.pick(); toast('Venda para quemaduras: se apagó el ardor.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'forzar') { const cz = nearCasillero(); if (!cz) return toast('Usalas al lado de un CASILLERO (hay en casi todos los mapas).'); if (cz.open) return toast('Ese casillero ya lo abriste hoy.'); INV.cas = INV.cas || {}; INV.cas[cz.id] = dayN(); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; addItem('vendas', 2); const x_ = pickW([['pilas', 3], ['campera', 1.5], ['cigarrillo', 2], ['filtro', 1.5], ['pistola', .6], ['chaleco', .6]]); addItem(x_); SND.pick(); toast('Forzaste un casillero: 2 vendas y ' + ITEMS[x_].n + '.'); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'radar') { if ((INV.radarT || 0) > Date.now()) return toast('El receptor se está recargando.'); INV.radarT = Date.now() + 60000; const m_ = []; if (suero.map) { m_.push('Maletín de curación: ' + MAPS[suero.map].name + ' (seguí la flecha)'); guide = { map: suero.map, k: 'suero', until: Date.now() + 180000 }; } closeInv(); if (hordeOn(mapKey)) m_.push('HORDA en este mapa'); const hb = HOURLY_AT[mapKey]; if (hb && Date.now() - (hourlyDead[hb] || 0) > 3600000) m_.push(MOB[hb].name + ' anda por acá');
      if (STORY) { const y_ = yukiPlan(); if (minOfDay() >= y_.start && minOfDay() < y_.start + 120) m_.push('Yuki: ' + MAPS[y_.map].name); } if (EXP && yukiPvp()) m_.push('Yuki está en las ruinas'); toast('RECEPTOR · ' + (m_.join(' · ') || 'Nada raro en el aire.')); return; }
    if (a === 'use' && it.use === 'luz') { if (!INV.eq.luz && INV.bat <= 0) { if (!hasItem('pilas')) return toast('La linterna no tiene pilas.'); INV.items.pilas--; if (!INV.items.pilas) delete INV.items.pilas; INV.bat = 100; } INV.eq.luz = INV.eq.luz ? null : 'linterna'; toast(INV.eq.luz ? 'Linterna prendida.' : 'Linterna apagada.'); hud(); quickBtns(); if (!$('#ov-inv').hidden) renderInv(); return; }
    if (a === 'use' && it.use === 'pilas') { if (!hasItem('linterna')) return toast('Primero necesitás una linterna.'); INV.bat = 100; INV.items[k]--; toast('Linterna cargada.'); }
    if (a === 'eq' && slot_is_weapon(k)) { if (INV.eq.arma === k) setWeapon('palo'); else setWeapon(k); }
    else if (a === 'eq') { const slot = it.eq; if (INV.eq[slot] === k) INV.eq[slot] = slot === 'arma' ? 'palo' : null; else { INV.eq[slot] = k; if (ITEMS[k].shield && INV.dur[k] == null) INV.dur[k] = ITEMS[k].shield; if (k === 'linterna' && INV.bat <= 0) { if (hasItem('pilas')) { INV.items.pilas--; INV.bat = 100; } else { INV.eq.luz = null; toast('La linterna no tiene pilas.'); } } } }
    if (a === 'eq' && !slot_is_weapon(k) && it.eq !== 'luz') toast(INV.eq[it.eq] === k ? 'Te pusiste: ' + it.n : 'Te sacaste: ' + it.n);
    if (!INV.items[k]) { delete INV.items[k]; if (invSel === k) invSel = null; }
    hud(); renderInv(); }
  function slot_is_weapon(k) { return !!WEAP[k]; }
  $('#inv-b').onclick = openInv; $('#inv-close').onclick = closeInv;

  /* ---------- Oscuros compartidos: el anfitrión de la sala los mueve, todos ven los mismos ---------- */
  let isHost = true, hostId = null, roomReady = false, mobSeq = 0, snapT = 0, maintT = 0, unlocks = {}; const lastDeath = {};
  const MKEYS = Object.keys(MOB), STC = ['idle', 'chase', 'aim', 'run', 'rest', 'fadeout', 'fadein', 'strike', 'tele', 'volley'];
  const mshots = [], clouds = [];
  const AB = { invis: { n: 'INVISIBLE', d: 'Botón HUIR: 3 segundos invisible para escapar.' }, rapido: { n: 'GOLPE RÁPIDO', d: 'Pegás 30% más rápido.' }, cuchillos: { n: 'CUCHILLOS', d: 'Cada golpe también tira un cuchillo hacia adelante.' } };
  const hashStr = s_ => { let h = 2166136261; for (let i = 0; i < s_.length; i++) { h ^= s_.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function mobLevel(id, kind) { const T = MOB[kind]; if (!T) return 0; if (T.boss) { if (!STORY) return 0; const top = ((MAP && MAP.lv) || [1, 3])[1]; return Math.min(70, Math.max(30, top + 6)); } if (T.lv1) return 1; const [a, b] = (MAP && MAP.lv) || [1, 3]; return a + hashStr(String(id)) % (b - a + 1); }
  const lvHp = L => 1 + (L - 1) * .3, lvDmg = L => 1 + (L - 1) * .09, lvXp = L => 1 + (L - 1) * .7;
  function auraOf(L) { return L >= 45 ? '255,40,40' : L >= 30 ? '255,140,0' : L >= 15 ? '240,215,80' : null; }
  function newMob(kind, id, x, y) { const T = MOB[kind], L = mobLevel(id, kind), mhp = L ? Math.round(T.hp * (T.boss ? 1 + (L - 1) * .12 : lvHp(L))) : T.hp; return { id, kind, T, lv: L, lvK: L ? lvDmg(L) : 1, mhp, au: L ? auraOf(L) : null, x, y, tx: x, ty: y, hp: mhp, face: 1, vx: 0, vy: 0, t: Math.random() * 9, hurt: 0, wind: 0, cd: 0, wx: x, wy: y, wt: 0, alpha: 0, chasing: false, stuck: 0, lx: x, ly: y, lunge: 0,
    st: 'idle', stT: 0, side: Math.random() < .5 ? -1 : 1, vis: T.ai === 'blink' ? .2 : 1, dx: 0, dy: 0, hitDone: false, combo: 0, hitters: new Set(), ab: rnd(5, 8), shotT: 0, volleys: 0 }; }
  function spawnMob(kind, minDist, at) { if (!isHost || !MOB[kind]) return null; const p = at || randomMobCell(minDist); if (!p) return null; const o = newMob(kind, me.id.slice(0, 4) + '-' + (mobSeq++) + '-' + ((Math.random() * 1e4) | 0), p[0], p[1]); mobs.push(o);
    if (o.T.boss) { toast('⚠ ' + o.T.name + ' está en ' + MAP.name.toLowerCase()); net('boss', { k: kind }); } if (kind === 'yuki') toast('Yuki anda suelta por las ruinas. Si la alcanzás, deja su brazalete.'); return o; }
  const dayN = () => Math.floor((Date.now() - 3 * 3600e3) / 864e5), minOfDay = () => Math.floor(((Date.now() - 3 * 3600e3) % 864e5) / 6e4);
  function hordeOn(k) { const m = MAPS[k]; if (!m || m.safeAll || m.base) return false; const d = dayN(), now = minOfDay();
    return ['a', 'b', 'c', 'd'].some(x => { const a = hashStr(k + d + x) % 1440; return now >= a && now < a + 6; }); }
  const hourlyDead = {};
  function loadHourly(k) { const b = HOURLY_AT[k]; if (!b) return; try { sb.from('game_state').select('v').eq('k', 'jefe_' + b).maybeSingle().then(r => { const v = r && r.data && r.data.v; if (v && v.t) hourlyDead[b] = Math.max(hourlyDead[b] || 0, v.t); }, () => {}); } catch (e) {} }
  /* Yuki en PvP: 20 minutos de cada hora, a una hora distinta cada día */
  const yukiPvp = () => { const m = (minOfDay() + hashStr('yuki' + dayN()) % 60) % 60; return m < 20; };
  const bossOn = k => { const b = BOSS_AT[k]; if (!b || EXP) return false; const m = (minOfDay() + hashStr(b) % 120) % 120; return m < 20; };
  function wantMobs() { const w = Object.assign({}, MAP.mobs || {}); if (hordeOn(mapKey)) Object.keys(w).forEach(k => w[k] *= 3); if (bossOn(mapKey)) w[BOSS_AT[mapKey]] = 1; if (EXP) { if (mapKey === 'pvp_centro' && yukiPvp()) w.yuki = 1; return w; } Object.keys(EXTRA).forEach(k => { if (EXTRA[k][mapKey]) w[k] = (w[k] || 0) + EXTRA[k][mapKey]; }); const hb = HOURLY_AT[mapKey]; if (hb && Date.now() - (hourlyDead[hb] || 0) > 3600000) w[hb] = 1; return w; }
  function maintainMobs() { if (!isHost || !roomReady || MAP.safeAll) return; const w = wantMobs(), now = Date.now();
    Object.entries(w).forEach(([k, n]) => { let have = mobs.filter(o => o.kind === k).length; const wait = MOB[k].respawn || 12000;
      if (!lastDeath[k]) { while (have < n) { if (!spawnMob(k, 560)) break; have++; } lastDeath[k] = 1; }
      else if (have < n && now - lastDeath[k] > wait) spawnMob(k, 560); }); }
  function mobHit(o, dmg, kx, ky, byId) { if (!o || o.hp <= 0) return; o.hp -= dmg; o.hurt = .2; o.hitters.add(byId); o.chasing = true;
    if (!o.T.heavy) { o.wind = Math.max(0, o.wind - .12); const nx = o.x + kx, ny = o.y + ky; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; } }
    if (o.st === 'run') { o.st = 'rest'; o.stT = 1.1; } if (o.hp <= 0) killMob(o); }
  function hitMob(o, dmg, kx, ky) { if (o.T.fac && o.T.fac === me.faction) { floats.push({ x: o.x, y: o.y - o.T.h - 30, t: .6, txt: 'ALIADO', c: '#8fd0ff' }); return; } if (INV.eq.luz && !o.T.human && Math.hypot(o.x - P.x, o.y - P.y) < 520) dmg = Math.round(dmg * 1.25); o.hurt = .2; floats.push({ x: o.x + rnd(-10, 10), y: o.y - o.T.h * .8, t: .8, txt: '-' + dmg, c: '#ffffff' });
    for (let i = 0; i < 10; i++) parts.push({ x: o.x, y: o.y - o.T.h * .6, vx: rnd(-140, 140), vy: rnd(-110, -30), life: .6, s: rnd(2, 4), c: 25 });
    if (isHost) mobHit(o, dmg, kx, ky, me.id); else net('mhit', { id: o.id, d: dmg, kx: Math.round(kx), ky: Math.round(ky), by: me.id }); }
  function killMob(o) { const i = mobs.indexOf(o); if (i >= 0) mobs.splice(i, 1); lastDeath[o.kind] = Date.now();
    if (o.T.hourly) { hourlyDead[o.kind] = Date.now(); try { sb.from('game_state').upsert({ k: 'jefe_' + o.kind, v: { t: Date.now() }, updated_at: new Date().toISOString() }).then(() => {}, () => {}); } catch (e) {} }
    const pl = { id: o.id, kind: o.kind, x: Math.round(o.x), y: Math.round(o.y), f: o.face, by: [...o.hitters] };
    net('mdie', pl); onMobDie(pl); }
  function onMobDie(p) { const T = MOB[p.kind]; if (!T) return; const i = mobs.findIndex(o => o.id === p.id); if (i >= 0) mobs.splice(i, 1); SND.dissolve();
    const art = artOf(T, 0, false), g = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
    /* ceniza corta y liviana: pocas partículas (máx. 45), se apagan rápido */
    const st = Math.max(1, Math.round(art.width / 14)), pts = []; for (let y = 0; y < art.height; y += st) for (let x = 0; x < art.width; x += st) if (g[(y * art.width + x) * 4 + 3] >= 10) pts.push([x, y]);
    const want = T.boss ? 45 : 22, hgt = art.hd ? T.ph * PXS * HD_K / (220 / art.height) : T.ph * PXS;
    for (let n = 0; n < Math.min(want, pts.length); n++) { const [x, y] = pts[(Math.random() * pts.length) | 0], ks = hgt / art.height;
      parts.push({ x: p.x + (p.f < 0 ? art.width / 2 - x : x - art.width / 2) * ks, y: p.y - (art.height - y) * ks * (art.hd ? 240 / 256 : 1), vx: rnd(-30, 50), vy: rnd(-90, -20), life: rnd(.35, .7), s: PXS * .9, c: Math.random() < .8 ? 40 : 150 }); }
    if (T.boss) { shake = .6; toast(T.name + ' cayó.'); }
    if (!p.by.includes(me.id)) return;
    INV.racha = 0; if (window.CZ_STORY && STORY) CZ_STORY.kill(p.kind, p.x, p.y);
    const lvBefore = lvlOf(P.xp), mL = mobLevel(p.id, p.kind), gx = Math.round(T.xp * 2 * (mL && !T.boss ? lvXp(mL) : T.boss && mL ? 1 + mL / 20 : 1) * (EXP ? 3 : 1)), gc = (T.coins || 1) + Math.floor((T.boss ? 0 : mL) / 8); P.kills++; P.xp += gx; INV.coins += gc; buzz(30);
    floats.push({ x: p.x, y: p.y - T.h - 10, t: 1.4, txt: '+' + gx + ' XP · +' + gc + ' $', c: '#e8e4da' });
    const r = Math.random() / (me.faction === 'rebel' ? 1.5 : 1), at = [p.x, p.y];
    if (p.kind === 'denso' && r < .35) spawnPickup(Math.random() < .5 ? 'b_contencion' : 'b_resonancia', at);
    else if (p.kind === 'sombra' && r < .2) spawnPickup('pagina', at);
    else if (p.kind === 'mole' && r < .5) spawnPickup(pickW([['armadura', 1], ['chaleco', 2]]), at);
    else if (r < .16) spawnPickup('vendas', at);
    else if (r < .19) spawnPickup(pickW([['pilas', 3], ['campera', 1], ['chaleco', .4]]), at);
    const r2 = Math.random();
    if (r2 < .018) { const pool = [['cuchillo', 3], ['bate', 3], ['barra', 2]]; if (mL >= 10) pool.push(['lanza', 2], ['pistola', 1.5]); if (mL >= 18) pool.push(['katana', 1.5]); if (mL >= 28) pool.push(['escopeta', 1]); spawnPickup(pickW(pool), [p.x + 30, p.y]); }
    else if (r2 < .032) spawnPickup('pista', [p.x - 30, p.y]);
    else if (r2 < .055) spawnPickup(pickW([['venda_q', T.burn || mL >= 15 ? 1.2 : .3], ['antiveneno', T.poison || mL >= 15 ? 1.2 : .3], ['trampa', .5], ['fragmento', mL >= 10 ? .25 : 0], ['metralleta', mL >= 25 ? .15 : 0], ['cigarrillo', 2], ['manzana', 1.5], ['receptor', mL >= 18 ? .5 : 0], ['fragmento', mL >= 40 ? .3 : 0], ['credencial', p.kind === 'corredor' ? 1.5 : 0], ['linterna', .3]]), [p.x, p.y + 30]);
    /* ganzúas: antes solo caían de Oscuros nivel 30+; ahora en todos los niveles (los jefes siempre dejan una) */
    if (T.boss || Math.random() < (mL >= 15 ? .07 : .05)) spawnPickup('ganzuas', [p.x - 30, p.y + 20]);
    if (p.kind === 'jefe') grantSkins(['renzo', 'sam']);
    if (p.kind === 'yuki') { addItem('brz_jefe'); quickBtns(); toast('¡Alcanzaste a Yuki! Te dejó su brazalete: activalo desde ESPECIAL.'); persist(); }
    if (p.kind === 'sofia') { const can = Object.keys(AB).filter(a => !INV.ab.includes(a)); if (can.length) { const a = can[(Math.random() * can.length) | 0]; INV.ab.push(a); setTimeout(() => toast('HABILIDAD NUEVA: ' + AB[a].n + ' · ' + AB[a].d + ' Si morís, la perdés.'), 900); abButtons(); } }
    if (lvlOf(P.xp) > lvBefore) { P.hp += maxHp(lvlOf(P.xp)) - maxHp(lvBefore); SND.level(); buzz([40, 40, 90]); setTimeout(() => toast('SUBISTE A NIVEL ' + lvlOf(P.xp) + ' · pegás ' + playerDmg()), 500); checkUnlocks(); }
    hud(); }
  /* ---------- red: SOLO / MULTI_HOST / MULTI_CLIENT (ver cenizas-net.js) ---------- */
  const NET = Object.assign({ NET_TICK_HZ: 10, FULL_SNAPSHOT_INTERVAL_MS: 2000, INTERP_BUFFER_MS: 100, MAX_EXTRAPOLATION_MS: 200, POS_EPSILON: .5, HIDDEN_UNTRACK_MS: 60000, AFK_MS: 180000 }, window.CZ_NET || {});
  let netMode = 'SOLO', peers = 0, gotFull = true, needFull = false, lastFull = 0, lastPlayerSent = null, lastInput = Date.now(), netPaused = false, tracked = false, hiddenT = null;
  const lastEnemy = new Map(), NETC = { sent: 0, recv: 0, ring: [] };
  function net(event, payload) { if (!ch || peers < 1 || netPaused) return false; ch.send({ type: 'broadcast', event, payload }); NETC.sent++; return true; }
  function setMode(m) { const prev = netMode; if (m === prev) return; netMode = m;
    if (m === 'MULTI_HOST') { needFull = true; lastPlayerSent = null; mobs.forEach(o => { o.hitters = o.hitters || new Set(); o.buf = null; }); }
    if (m === 'MULTI_CLIENT') { lastPlayerSent = null; if (prev === 'SOLO') gotFull = false; setTimeout(() => net('req', {}), 50); }
    if (m === 'SOLO') { gotFull = true; mobs.forEach(o => { o.buf = null; o.hitters = o.hitters || new Set(); }); } }
  const flagsOf = o => (o.moving ? 1 : 0) | (o.wind > 0 ? 2 : 0) | (o.lunge > .3 ? 4 : 0) | (o.chasing ? 8 : 0);
  /* anfitrión: un paquete por tick con los Oscuros que cambiaron; completo cada 2 s */
  function sendEnemies() { const now = Date.now(), full = needFull || now - lastFull >= NET.FULL_SNAPSHOT_INTERVAL_MS; const e = [];
    mobs.forEach(o => { const row = [o.id, Math.round(o.x), Math.round(o.y), STC.indexOf(o.st), Math.ceil(o.hp), MKEYS.indexOf(o.kind), o.face, flagsOf(o), Math.round(o.vis * 10), o.combo % 3];
      const l = lastEnemy.get(o.id); if (full || !l || Math.abs(l[1] - row[1]) > NET.POS_EPSILON || Math.abs(l[2] - row[2]) > NET.POS_EPSILON || l.slice(3).join() !== row.slice(3).join()) { e.push(row); lastEnemy.set(o.id, row); } });
    if (!full && !e.length) return; if (full) { lastFull = now; needFull = false; [...lastEnemy.keys()].forEach(id => { if (!mobs.some(o => o.id === id)) lastEnemy.delete(id); }); }
    net('enemies', { t: now, full, e }); }
  /* cliente: guarda los estados con la hora de llegada para interpolar */
  function pushBuf(o, x, y) { const now = performance.now(); o.buf = o.buf || []; const last = o.buf[o.buf.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) > 260) o.buf.length = 0; else if (last && now - last.t > 250) o.buf.push({ t: now - 1000 / NET.NET_TICK_HZ, x: last.x, y: last.y });
    o.buf.push({ t: now, x, y }); while (o.buf.length > 5) o.buf.shift(); }
  function applyEnemies(p) { if (netMode !== 'MULTI_CLIENT') return; const seen = p.full ? new Set() : null;
    p.e.forEach(([id, x, y, sti, hp, ki, face, fl, vis, combo]) => { if (seen) seen.add(id); const kind = MKEYS[ki]; if (!kind) return; let o = mobs.find(m => m.id === id);
      if (!o) { o = newMob(kind, id, x, y); o.alpha = 1; mobs.push(o); } pushBuf(o, x, y);
      const wasWind = o.wind > 0, wasChase = o.chasing; o.hp = hp; o.face = face; o.moving = !!(fl & 1); o.wind = fl & 2 ? Math.max(o.wind, .01) : 0; if (fl & 4) o.lunge = 1; o.chasing = !!(fl & 8); o.vis = vis / 10; o.st = STC[sti] || 'idle'; o.combo = combo;
      if (o.wind > 0 && !wasWind) { if (o.T.heavy) SND.mob('roar', .2); else SND.warn(); } if (o.chasing && !wasChase) SND.mob(o.T.snd, .2); });
    if (seen) { for (let i = mobs.length - 1; i >= 0; i--) if (!seen.has(mobs[i].id)) mobs.splice(i, 1); gotFull = true; } }
  /* interpolación con ~100 ms de atraso; si no llega nada, adivina hasta 200 ms y se congela */
  function interp(o, moving) { const b = o.buf; if (!b || !b.length) return; const rt = performance.now() - NET.INTERP_BUFFER_MS; let i = b.length - 1; const ox = o.x;
    if (rt >= b[i].t) { if (i >= 1 && moving) { const a = b[i - 1], c2 = b[i], span = Math.max(1, c2.t - a.t), ex = Math.min(rt - c2.t, NET.MAX_EXTRAPOLATION_MS); o.x = c2.x + (c2.x - a.x) * ex / span; o.y = c2.y + (c2.y - a.y) * ex / span; } else { o.x = b[i].x; o.y = b[i].y; } }
    else { while (i > 0 && b[i - 1].t > rt) i--; if (i === 0) { o.x = b[0].x; o.y = b[0].y; } else { const a = b[i - 1], c2 = b[i], k = (rt - a.t) / Math.max(1, c2.t - a.t); o.x = a.x + (c2.x - a.x) * k; o.y = a.y + (c2.y - a.y) * k; } }
    if (Math.abs(o.x - ox) > .5) o.vx = o.x - ox; }
  /* mi posición: solo si cambió (y no si estoy AFK) */
  function sendPlayer(force) { if (!P || !ch) return; if (!force && Date.now() - lastInput > NET.AFK_MS) return;
    const hpP = Math.round(P.hp / maxHp(lvlOf(P.xp)) * 100), a = (P.mv ? 1 : 0) | (P.atk > .2 ? 2 : 0) | (P.dead ? 4 : 0) | (P.inv > 0 || P.ghost > 0 ? 8 : 0) | (P.running ? 16 : 0) | (P.ghost > 0 ? 32 : 0);
    const st = { id: me.id, x: Math.round(P.x), y: Math.round(P.y), d: P.dir, a, t: Date.now(), f: P.face, h: hpP }; const l = lastPlayerSent;
    if (!force && l && Math.abs(l.x - st.x) <= NET.POS_EPSILON && Math.abs(l.y - st.y) <= NET.POS_EPSILON && l.d === st.d && l.a === st.a && l.f === st.f && l.h === st.h) return;
    if (net('player', st)) lastPlayerSent = st; }
  let netN = 0; function netTick() { if (!ch || peers < 1 || netPaused || !P || warping) return; sendPlayer(false); if (netMode === 'MULTI_HOST' && (mobs.length < 6 || (netN++ % 3) !== 2)) sendEnemies(); }
  setInterval(netTick, 1000 / NET.NET_TICK_HZ);
  /* contador de mensajes (solo en modo desarrollo: ?dev o localStorage cz-dev=1) */
  const DEV = /[?&]dev\b/.test(location.search) || store.get('cz-dev') === '1';
  if (DEV) { const d = document.createElement('div'); d.id = 'netdbg'; d.style.cssText = 'position:fixed;left:8px;bottom:36px;z-index:40;font:11px TechMono,monospace;color:#9fe0b0;background:rgba(0,0,0,.7);padding:4px 6px;pointer-events:none'; document.body.appendChild(d);
    let ls = 0, lr = 0; setInterval(() => { NETC.ring.push([NETC.sent - ls, NETC.recv - lr]); ls = NETC.sent; lr = NETC.recv; if (NETC.ring.length > 60) NETC.ring.shift();
      const sm = NETC.ring.reduce((a, b) => a + b[0], 0), rm = NETC.ring.reduce((a, b) => a + b[1], 0); d.textContent = netMode + ' · pares ' + peers + ' · enviados/min ' + sm + ' · recibidos/min ' + rm + (gotFull ? '' : ' · sincronizando'); }, 1000); }
  /* proyectiles de los Oscuros (fuego, cuchillos) y nubes tóxicas: cada uno calcula si le pegan a él */
  function fireMob(o, tg, kind, spread) { const T = o.T, ang = Math.atan2(tg.y - o.y, tg.x - o.x) + (spread || 0), sp = T.pspeed || 400;
    const b = { x: o.x + Math.cos(ang) * 30, y: o.y + Math.sin(ang) * 20, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, k: kind, d: T.fdmg || T.dmg, life: 2.2, mk: o.kind }; b.d = Math.round(b.d * (o.lvK || 1));
    mshots.push(b); net('mfire', { x: Math.round(b.x), y: Math.round(b.y), vx: Math.round(b.vx), vy: Math.round(b.vy), k: kind, d: b.d, mk: o.kind }); SND.fireball(kind); }
  function addCloud(x, y) { const c0 = { x, y, r: 150, ttl: 4.5, tick: 0 }; clouds.push(c0); net('mcloud', { x: Math.round(x), y: Math.round(y) }); }
  function updateMobShots(dt) {
    for (let i = mshots.length - 1; i >= 0; i--) { const b = mshots[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; let gone = b.life <= 0 || !walkable(b.x, b.y);
      if (b.k === 'fire' && Math.random() < .7) parts.push({ x: b.x + rnd(-6, 6), y: b.y - 70 + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-40, -10), life: .4, s: rnd(3, 6), c: 200, fire: 1 });
      if (!gone && !P.dead && Math.abs(b.x - P.x) < 40 && Math.abs(b.y - P.y) < 34) { gone = true; hitPlayer(b.d, { x: b.x - b.vx * .1, y: b.y - b.vy * .1 }, b.k === 'fire' ? 40 : 0, null, b.mk || 'oscuro'); if (b.k === 'fire') for (let j = 0; j < 14; j++) parts.push({ x: P.x, y: P.y - 80, vx: rnd(-90, 90), vy: rnd(-90, 0), life: .5, s: 4, c: 200, fire: 1 }); }
      if (gone) mshots.splice(i, 1); }
    for (let i = clouds.length - 1; i >= 0; i--) { const c0 = clouds[i]; c0.ttl -= dt; if (c0.ttl <= 0) { clouds.splice(i, 1); continue; }
      if (!P.dead && Math.hypot(P.x - c0.x, (P.y - c0.y) * 1.4) < c0.r) { c0.tick -= dt; if (c0.tick <= 0) { c0.tick = .5; hitPlayer(6, null, 0, null, 'sofia'); } } } }
  /* ataque de un Oscuro sobre un jugador: si soy yo me pega acá; si es otro, le aviso */
  function strikeOn(pl, d, from, knock) { d = Math.round(d * (from.lvK || 1)); if (pl.me) hitPlayer(d, from, knock, null, from.kind); else net('mstrike', { to: pl.id, d, x: Math.round(from.x), y: Math.round(from.y), k: knock || 0, mk: from.kind }); }
  /* desbloqueos de jefes: los calcula Supabase con el mejor nivel de cada uno */
  let unlockT = 0;
  async function checkUnlocks() { if (EXP) return; try { await persist(); const { data, error } = await sb.rpc('game_unlocks'); if (error || !data) return; const before = Object.assign({}, unlocks); unlocks = data;
      TIER.forEach(([k, txt]) => { if (unlocks[k] && !before[k] && unlockT) { toast('SE DESBLOQUEÓ ' + txt); SND.zone(); } }); unlockT = 1; } catch (e) {} }

  /* ---------- online: salas de 10 por mapa ---------- */
  function trackMe() { if (!ch) return; ch.track({ nick: me.nick, fac: me.faction, look, lvl: lvlOf(P.xp), x: Math.round(P.x), y: Math.round(P.y), at: myAt, joinedAt: myAt }); tracked = true; }
  function leaveRoom() { if (!ch) return; const c = ch; ch = null; try { c.untrack(); } catch (e) {} try { sb.removeChannel(c); } catch (e) {} tracked = false; peers = 0; netMode = 'SOLO'; }
  function joinRoom(n) {
    leaveRoom(); others.clear(); room = n; const myMap = mapKey; netMode = 'SOLO'; gotFull = true; lastEnemy.clear();
    $('#h-sala').textContent = 'sala ' + n + ' · conectando…';
    const c = sb.channel((EXP ? 'gpvp:' : 'game:') + myMap + '-' + n, { config: { presence: { key: me.id }, broadcast: { self: false, ack: false } } }); ch = c;
    const onPresence = () => { if (ch !== c) return; const st = c.presenceState(); const ids = Object.keys(st); const before = peers;
      for (const id of [...others.keys()]) if (!ids.includes(id)) others.delete(id);
      ids.forEach(id => { if (id === me.id) return; const m = st[id][0] || {}; const o = others.get(id) || { x: m.x || P.x, y: m.y || P.y, tx: m.x || P.x, ty: m.y || P.y, face: 1, walkT: 0, say: '', sayT: 0 };
        Object.assign(o, { look: m.look, nick: m.nick, fac: m.fac, lvl: m.lvl }); others.set(id, o); });
      electHost(st); if (peers > before) { lastPlayerSent = null; if (netMode === 'MULTI_HOST') needFull = true; }
      $('#h-sala').textContent = (EXP ? 'EXP · ' : '') + 'sala ' + n + ' · ' + (peers + 1) + '/10 acá' + (netMode === 'SOLO' ? ' · solo' : ''); };
    ['sync', 'join', 'leave'].forEach(ev => c.on('presence', { event: ev }, onPresence));
    const H = {
      trap: p => { if (p && p.id && !ptraps.some(t => t.id === p.id)) ptraps.push(Object.assign({}, p, { t: Date.now() })); },
      trapx: p => { const i = ptraps.findIndex(t => t.id === (p && p.id)); if (i >= 0) ptraps.splice(i, 1); },
      player: p => { const o = others.get(p.id); if (!o) return; pushBuf(o, p.x, p.y); o.tx = p.x; o.ty = p.y; o.face = p.f || o.face; o.dir = p.d || o.dir; o.mv = !!(p.a & 1); if (p.a & 2) o.atk = .25; o.dead = !!(p.a & 4); o.iv = !!(p.a & 8); o.gh = !!(p.a & 32); o.hp = p.h; },
      enemies: p => applyEnemies(p),
      req: () => { if (netMode === 'MULTI_HOST') needFull = true; lastPlayerSent = null; },
      say: p => { const o = others.get(p.id); if (o) { o.say = p.t; o.sayT = 6; } },
      hit: p => { const a = others.get(p.id); if (p.to === me.id) { if (!a || a.fac === me.faction) return; if (hitPlayer(p.d, { x: p.ax, y: p.ay }, 40, p.id)) floats.push({ x: P.x, y: P.y - 215, t: 1, txt: a.nick, c: '#ff7a70' }); } else { const v = others.get(p.to); if (v) v.hurt = .2; } },
      died: p => { const v = others.get(p.id); if (v) { v.dead = true; v.hp = 0; }
        if (p.by === me.id) { const lvB = lvlOf(P.xp); P.xp += 40; P.pvp = (P.pvp || 0) + 1; SND.level(); buzz([40, 40, 90]); toast('Derribaste a ' + (v ? v.nick : 'un enemigo') + ' · +40 XP'); if (lvlOf(P.xp) > lvB) P.hp += maxHp(lvlOf(P.xp)) - maxHp(lvB); hud(); persist(); }
        else if (v) toast(v.nick + ' cayó.'); },
      mhit: p => { if (netMode !== 'MULTI_HOST') return; const o = mobs.find(m => m.id === p.id); if (o) mobHit(o, p.d, p.kx, p.ky, p.by); },
      mdie: p => onMobDie(p),
      mstrike: p => { if (p.to === me.id) hitPlayer(p.d, { x: p.x, y: p.y }, p.k, null, p.mk || 'oscuro'); },
      mfire: p => { mshots.push({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, k: p.k, d: p.d, life: 2.2, mk: p.mk }); SND.fireball(p.k); },
      mcloud: p => clouds.push({ x: p.x, y: p.y, r: 150, ttl: 4.5, tick: 0 }),
      boss: p => { if (MOB[p.k]) toast('⚠ ' + MOB[p.k].name + ' está en ' + MAP.name.toLowerCase()); },
      shot: p => { shots.push({ x: p.x, y: p.y, vx: p.vx * 1100, vy: p.vy * 1100 * .8, life: .6, fake: true }); SND.shot(.35); },
      suero: p => { if (p.slot === suero.slot) { suero.taken = p.slot; suero.map = null; clearSuero(); toast(p.by + ' agarró el maletín de curación.'); hud(); } },
      drop: p => { if (!pickups.some(q => q.pid === p.pid)) pickups.push({ k: p.k, x: p.x, y: p.y, t: 0, pid: p.pid }); },
      took: p => { const i = pickups.findIndex(q => q.pid === p.pid); if (i >= 0) pickups.splice(i, 1); }
    };
    Object.entries(H).forEach(([ev, fn]) => c.on('broadcast', { event: ev }, ({ payload }) => { NETC.recv++; if (ch === c) fn(payload); }));
    c.subscribe(async status => { if (ch !== c) return;
      if (status !== 'SUBSCRIBED') { if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { $('#h-sala').textContent = 'sin conexión · jugando solo'; peers = 0; netMode = 'SOLO'; isHost = true; hostId = me.id; roomReady = true; maintT = 0; } return; }
      myAt = Date.now(); trackMe(); setTimeout(() => { if (ch === c) { electHost(c.presenceState()); roomReady = true; maintT = 0; } }, 1200);
      setTimeout(() => { if (ch !== c) return; const st = c.presenceState(); const list = Object.entries(st).map(([id, v]) => ({ id, at: (v[0] && (v[0].joinedAt || v[0].at)) || 0 })).sort((a, b) => a.at - b.at);
        const idx = list.findIndex(e => e.id === me.id); if (list.length > 10 && idx >= 10 && n < 50) { toast('Sala ' + n + ' llena · pasando a la ' + (n + 1)); joinRoom(n + 1); } }, 900); });
  }
  let myAt = 0;
  /* anfitrión determinista: el que entró primero (desempate por id) */
  function electHost(st) { const list = Object.entries(st || {}).map(([id, v]) => ({ id, at: (v[0] && (v[0].joinedAt || v[0].at)) || 0 })); if (!list.find(e => e.id === me.id)) list.push({ id: me.id, at: myAt });
    peers = list.length - 1; if (peers < 1) { hostId = me.id; isHost = true; setMode('SOLO'); return; }
    list.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1)); hostId = list[0].id; isHost = hostId === me.id; setMode(isHost ? 'MULTI_HOST' : 'MULTI_CLIENT'); }
  function sendPos(force) { if (force) sendPlayer(true); }

  /* ---------- personajes de la historia (solo MUNDO, quietos) ---------- */
  const NPCS = {}; Object.entries(MAPS).forEach(([k, m]) => { if (m.npcs) NPCS[k] = m.npcs.map(n => Object.assign({}, n, n.act === 'heal' ? { heal: n.fac, act: null } : {}, n.k === 'mercedes' ? { brz: 'ork' } : {}, n.act === 'brazalete' ? { brz: n.fac, act: null } : {})); });
  if (EXP) { NPCS.pvp_azul = [{ k: 'ex10', nm: 'INTENDENTE', line: 'Kit de combate. Elegí bien.', x: 640, y: 330, act: 'kit', fac: 'rebel' }]; NPCS.pvp_rojo = [{ k: 'instructor_ork', nm: 'INSTRUCTOR', line: 'Equipate, recluta.', x: 760, y: 330, act: 'kit', fac: 'ork' }]; }
  const npcsHere = () => CAS.concat(NPCS[mapKey] || []).filter(n => !n.cada || ((minOfDay() + hashStr(n.k) % 60) % 60) < 20).concat(STORY && window.CZ_STORY ? CZ_STORY.npcs(mapKey) : []);
  function nearNpc() { let best = null, bd = 150; npcsHere().forEach(n => { const d = Math.hypot(n.x * WS - P.x, (n.y * WS - P.y) * 1.2); if (d < bd) { bd = d; best = n; } }); return best; }
  const healCd = {};
  /* el bando contrario no te atiende: te maldicen, te insultan o te lastiman */
  function hostil(n) { const r = Math.random(), L = n.fac === 'ork' ? ['"Rata rebelde."', '"Andate antes de que llame a los guardias."', '"No te debo nada."'] : ['"Fuera de acá, perro de ORK."', '"Que la ceniza te trague."', '"Traidor."'];
    if (r < .35) { const d = 10; P.hp = Math.max(1, P.hp - d); P.hurtT = .3; SND.hurt(); buzz(40); floats.push({ x: P.x, y: P.y - 190, t: .9, txt: '-' + d, c: '#ff6a5c' }); toast(n.nm + ' te empuja contra la pared.'); hud(); }
    else toast(n.nm + ': ' + L[(Math.random() * L.length) | 0]); }
  /* 3 pistas del bando → brazalete (Mercedes para ORK, Jota para rebeldes) */
  const PISTA = () => me.faction === 'ork' ? 'pista_ork' : 'pista_reb', BRZ = () => me.faction === 'ork' ? 'brz_ork' : 'brz_reb';
  function tryBrazalete(n) { const have = INV.items[PISTA()] || 0; if (have < 3) { if (n.act === null && !n.heal) toast(n.nm + ': "Traeme 3 pistas y te doy algo que vale la pena. Tenés ' + have + '."'); return false; }
    INV.items[PISTA()] -= 3; if (!INV.items[PISTA()]) delete INV.items[PISTA()]; addItem(BRZ()); SND.level(); toast(n.nm + ' te da el ' + ITEMS[BRZ()].n.toLowerCase() + '.'); persist(); return true; }
  /* misiones de búsqueda: te piden algo, lo traés, te dan algo (una sola vez por cuenta) */
  function questTalk(n) { const q = n.quest; INV.quests = INV.quests || {};
    if (INV.quests[q.id]) { if (n.shop) return openShop(n); return toast(n.nm + ': "' + q.done + '"'); }
    const falta = Object.entries(q.need).filter(([k, c]) => (INV.items[k] || 0) < c);
    if (falta.length) { INV.quests_seen = INV.quests_seen || {}; INV.quests_seen[q.id] = n.nm; toast(n.nm + ': "' + q.txt + '" · ' + Object.entries(q.need).map(([k, c]) => ITEMS[k].n + ' ' + Math.min(c, INV.items[k] || 0) + '/' + c).join(' · ')); return; }
    Object.entries(q.need).forEach(([k, c]) => { INV.items[k] -= c; if (INV.items[k] <= 0) delete INV.items[k]; });
    const g = q.give || {}; Object.entries(g.items || {}).forEach(([k, c]) => addItem(k === 'pista' ? PISTA() : k, c)); if (g.coins) INV.coins += g.coins;
    if (g.xp) { const lb = lvlOf(P.xp); P.xp += g.xp; if (lvlOf(P.xp) > lb) { P.hp = maxHp(lvlOf(P.xp)); SND.level(); } }
    if (g.ab) { const can = Object.keys(AB).filter(a => !INV.ab.includes(a)); if (can.length) { INV.ab.push(can[(Math.random() * can.length) | 0]); abButtons(); } }
    INV.quests[q.id] = 1; SND.level(); buzz([30, 40, 60]); toast('MISIÓN CUMPLIDA · ' + n.nm + ': "' + q.done + '"'); hud(); persist(); }
  function talkNpc(n) { n.sayT = 4; SND.pick();
    if (n.cas) { const op = INV.cas && INV.cas[n.id] === dayN(); if (op) return toast('Casillero abierto. Ya no queda nada (vuelve a llenarse mañana).'); if (!hasItem('ganzuas')) return toast('Casillero cerrado. Necesitás ganzúas para forzarlo.'); return useItem('ganzuas', 'use'); }
    if (n.story && window.CZ_STORY) return CZ_STORY.talk(n);
    if (n.act === 'kit') return n.fac !== me.faction ? hostil(n) : openKit(n);
    if (STORY && window.CZ_STORY && CZ_STORY.talkHook(n)) return;
    if (n.fac && n.fac !== me.faction && !n.heal && !n.brz) return hostil(n);
    if (n.quest && !(n.heal && (INV.quests || {})[n.quest.id])) { if (n.heal && P.hp < maxHp(lvlOf(P.xp)) * .5) {} else return questTalk(n); }
    if (n.shop && !n.heal) return openShop(n);
    if (!n.heal && !n.brz && n.act !== 'shop') return toast(n.nm + ': "' + n.line + '"');
    if (n.brz && !n.heal) { if (me.faction !== n.brz) return hostil(n); if (!tryBrazalete(n)) toast(n.nm + ': "' + n.line + ' Necesito 3 pistas, tenés ' + (INV.items[PISTA()] || 0) + '."'); return; }
    if (n.act === 'shop') return openShop();
    if (n.heal) { const lv = lvlOf(P.xp);
      if (n.heal !== 'any' && me.faction !== n.heal) return hostil(n);
      if (n.brz && tryBrazalete(n)) return;
      if ((healCd[n.k] || 0) > Date.now()) return toast(n.nm + ': "Todavía no. Volvé en ' + Math.ceil((healCd[n.k] - Date.now()) / 1000) + ' segundos."');
      if (P.hp >= maxHp(lv)) return toast('Estás entero. ' + n.nm + ' te deja ir.');
      P.hp = maxHp(lv); healCd[n.k] = Date.now() + 90000; SND.level(); floats.push({ x: P.x, y: P.y - 200, t: 1.2, txt: 'vida completa', c: '#9fe0b0' }); hud(); persist(); } }
  /* ---------- controles ---------- */
  const keys = {}; let joy = { on: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
  addEventListener('keydown', e => { if (document.activeElement === $('#say-in')) return; keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.toLowerCase() === 'j') attack(); if (e.key === 'Enter' || e.key.toLowerCase() === 'k') pressA(); if (e.key === 'Escape') openMenu(); if (e.key.toLowerCase() === 'q') cycleWeapon(); if (e.key.toLowerCase() === 'h') quickUse('cura'); if (e.key.toLowerCase() === 'e') quickUse('esp'); if (e.key.toLowerCase() === 'x') goGhost(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const cv = $('#cv');
  /* joystick 2.1: base fija abajo a la izquierda; si tocás en otro lado de la mitad izquierda, se mueve ahí. Zona muerta, captura del dedo y se suelta solo si algo lo interrumpe */
  const stickHome = () => [Math.max(96, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sal')) || 0) + 96), innerHeight - 104];
  function stickRest() { const s = $('#stick'), [x, y] = stickHome(); s.style.left = x + 'px'; s.style.top = y + 'px'; s.classList.remove('live'); $('#knob').style.transform = ''; }
  function joyStart(e) { if (!running || paused || P.dead) return; if (e.clientX > innerWidth * .5 || e.clientY < 70) return; e.preventDefault(); const [hx, hy] = stickHome(); const nearHome = Math.hypot(e.clientX - hx, e.clientY - hy) < 90;
    const x0 = nearHome ? hx : e.clientX, y0 = nearHome ? hy : e.clientY; joy = { on: true, id: e.pointerId, x0, y0, dx: 0, dy: 0 }; const s = $('#stick'); s.style.left = x0 + 'px'; s.style.top = y0 + 'px'; s.classList.add('live'); $('#hintL').hidden = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} joyMove(e); }
  function joyMove(e) { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const d = Math.hypot(dx, dy), m = 56; if (d > m) { dx = dx / d * m; dy = dy / d * m; } const k = Math.min(1, d / m); const dz = .14;
    if (k < dz) { joy.dx = joy.dy = 0; } else { const a = Math.atan2(dy, dx), kk = (k - dz) / (1 - dz); joy.dx = Math.cos(a) * kk; joy.dy = Math.sin(a) * kk; } $('#knob').style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
  const endJoy = e => { if (e && e.pointerId != null && e.pointerId !== joy.id) return; joy.on = false; joy.dx = joy.dy = 0; stickRest(); };
  cv.addEventListener('pointerdown', joyStart); cv.addEventListener('pointermove', joyMove); addEventListener('pointermove', joyMove);
  addEventListener('pointerup', endJoy); addEventListener('pointercancel', endJoy); cv.addEventListener('lostpointercapture', endJoy); addEventListener('blur', () => endJoy()); document.addEventListener('visibilitychange', () => endJoy());
  addEventListener('resize', stickRest); setTimeout(stickRest, 0);
  $('#btn-b').addEventListener('pointerdown', e => { e.preventDefault(); attack(); $('#btn-b').classList.add('on'); setTimeout(() => $('#btn-b').classList.remove('on'), 120); });
  $('#btn-a').addEventListener('pointerdown', e => { e.preventDefault(); pressA(); });
  $('#btn-w').addEventListener('pointerdown', e => { e.preventDefault(); cycleWeapon(); });
  $('#btn-h').addEventListener('pointerdown', e => { e.preventDefault(); quickUse('cura'); });
  $('#btn-s').addEventListener('pointerdown', e => { e.preventDefault(); quickUse('esp'); });
  $('#say-b').onclick = () => { if (!P || P.dead) return; const s_ = $('#say'); s_.hidden = false; const i = $('#say-in'); i.value = ''; i.focus(); };
  let runHeld = false; const rb = $('#btn-r');
  rb.addEventListener('pointerdown', e => { e.preventDefault(); runHeld = true; rb.classList.add('on'); try { rb.setPointerCapture(e.pointerId); } catch (x) {} });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => rb.addEventListener(ev, () => { runHeld = false; rb.classList.remove('on'); }));
  $('#btn-x').addEventListener('pointerdown', e => { e.preventDefault(); goGhost(); });
  /* tienda de Plaza de Mayo */
  const SHOP = [['kit', 100, 'Vida completa'], ['vendas', 3, 'Cura 30 de vida · 3 s entre vendas'], ['pilas', 2, 'Recargan la linterna'], ['lanza', 8, 'Llega lejos y atraviesa · 30 golpes'], ['kitsune', 10, 'Desaparecés 3 segundos · 2 usos'], ['ganzuas', 6, 'Abren un casillero · se gastan']];
  let curShop = null; function openShop(n) { if (!n || !n.nm) n = npcsHere().find(x => x.act === 'shop' || x.shop); if (!n || P.dead) return; curShop = (n.shop ? n.shop.map(([k, p]) => [k, p, ITEMS[k].d]) : SHOP.slice()); [['venda_q', 6], ['antiveneno', 6], ['trampa', 12], ['fragmento', 45]].concat(n.shop && n.shop.some(([k]) => ITEMS[k] && ITEMS[k].eq === 'arma' && WEAP[k] && WEAP[k].gun) ? [['metralleta', 110]] : []).forEach(([k, p]) => { if (!curShop.some(r => r[0] === k)) curShop.push([k, p, ITEMS[k].d]); });
    $('#ov-shop h2').textContent = n.nm; $('#ov-shop p i').textContent = '"' + n.line + '"'; paused = true; $('#ov-shop').hidden = false; renderShop(); }
  const SELL = { metralleta: 20, trampa: 5, antiveneno: 3, venda_q: 3, pagina: 4, cigarrillo: 3, credencial: 6, receptor: 8, ganzuas: 6, filtro: 5, fragmento: 15, pista: 3, manzana: 2, pilas: 1, tarjeta: 10, expediente: 10, fusible: 4, radio: 6, cartucho: 10, canister: 10, contenedor: 8, energia: 8, mascara: 8, b_contencion: 12, b_resonancia: 12, campera: 5, chaleco: 10, armadura: 18, linterna: 4, cuchillo: 3, bate: 4, barra: 3, lanza: 6, pistola: 8, katana: 10, escopeta: 14, lanzallamas: 18, pista_ork: 4, pista_reb: 4 };
  const disc = () => (INV.descT || 0) > Date.now() ? .7 : 1;
  function renderShop() { $('#shop-c').textContent = INV.coins + ' monedas' + (disc() < 1 ? ' · 30% OFF' : ''); const box = $('#shop-l'); box.innerHTML = '';
    (curShop || SHOP).forEach(([k, price, d]) => { const r = document.createElement('div'); r.className = 'shopr'; const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48; { const g_ = cv.getContext('2d'), ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; g_.drawImage(ic, 0, 0, 48, 48); } r.appendChild(cv);
      const tx = document.createElement('div'); tx.innerHTML = '<b>' + ITEMS[k].n + '</b><small>' + d + ' · tenés ' + (INV.items[k] || 0) + '</small>'; r.appendChild(tx);
      const pr = Math.max(1, Math.round(price * disc())); const b = document.createElement('button'); b.className = 'btn solid'; b.textContent = pr + ' $'; b.disabled = INV.coins < pr; b.onclick = () => { if (INV.coins < pr) return; INV.coins -= pr; addItem(k); SND.pick(); renderShop(); hud(); healBtn(); abButtons(); persist(); }; r.appendChild(b); box.appendChild(r); });
    const need = STORY && window.CZ_STORY && CZ_STORY.step ? Object.keys(Object.assign({}, CZ_STORY.step.need || {}, CZ_STORY.step.get ? { [CZ_STORY.step.get]: 1 } : {})) : [];
    const ven = Object.keys(SELL).filter(k => hasItem(k) && !Object.values(INV.eq).includes(k) && !need.includes(k)); if (ven.length) { const h = document.createElement('div'); h.className = 'kitr'; h.innerHTML = '<small>VENDER</small>'; box.appendChild(h);
      ven.forEach(k => { const r = document.createElement('div'); r.className = 'shopr'; const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48; { const g_ = cv.getContext('2d'), ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; g_.drawImage(ic, 0, 0, 48, 48); } r.appendChild(cv);
        const tx = document.createElement('div'); tx.innerHTML = '<b>' + ITEMS[k].n + '</b><small>tenés ' + INV.items[k] + '</small>'; r.appendChild(tx); const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'VENDER ' + SELL[k] + ' $';
        b.onclick = () => { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; delete INV.dur[k]; INV.coins += SELL[k]; SND.pick(); renderShop(); hud(); quickBtns(); persist(); }; r.appendChild(b); box.appendChild(r); }); } }
  /* PvP: el intendente de cada campamento da 20 vendas + un arma de fuego + una cuerpo a cuerpo (cada 15 minutos) */
  function openKit(n) { const wait = (INV.kitT || 0) - Date.now(); if (wait > 0) { toast(n.nm + ': "Ya te equipé. Volvé en ' + Math.ceil(wait / 60000) + ' minutos."'); return openShop(Object.assign({}, n, { shop: [['vendas', 3], ['kit', 60], ['lanzallamas', 90], ['pistola', 25], ['chaleco', 30]] })); }
    let fire = null, melee = null; paused = true; $('#ov-shop').hidden = false; $('#ov-shop h2').textContent = n.nm; $('#ov-shop p i').textContent = '"' + n.line + '"'; $('#shop-c').textContent = '20 vendas + 2 armas';
    const box = $('#shop-l'); const draw = () => { box.innerHTML = ''; const row = (lab, list, cur, set) => { const d = document.createElement('div'); d.className = 'kitr'; d.innerHTML = '<small>' + lab + '</small>'; list.forEach(k => { const b = document.createElement('button'); b.className = 'btn' + (cur === k ? ' solid' : ''); b.textContent = ITEMS[k].n; b.onclick = () => { set(k); draw(); }; d.appendChild(b); }); box.appendChild(d); };
      row('ARMA DE FUEGO', ['pistola', 'escopeta', 'metralleta', 'lanzallamas'], fire, k => fire = k); row('CUERPO A CUERPO', ['katana', 'bate', 'cuchillo', 'lanza'], melee, k => melee = k);
      const go = document.createElement('button'); go.className = 'btn solid'; go.textContent = 'RECIBIR EL KIT'; go.disabled = !(fire && melee); go.style.marginTop = '10px';
      go.onclick = () => { addItem('vendas', 20); addItem(fire); addItem(melee); delete INV.dur[fire]; delete INV.dur[melee]; setWeapon(melee); INV.kitT = Date.now() + 15 * 60000; SND.level(); paused = false; $('#ov-shop').hidden = true; toast('Recibiste 20 vendas, ' + ITEMS[fire].n + ' y ' + ITEMS[melee].n + '.'); quickBtns(); hud(); persist(); }; box.appendChild(go); };
    draw(); }
  $('#shop-b').onclick = openShop; $('#shop-close').onclick = () => { paused = false; $('#ov-shop').hidden = true; };
  const playerDmg = () => Math.max(1, dmgOf(lvlOf(P.xp)) + (INV ? WEAP[curW()].dmg : 0) - (INV && INV.eq.brazo === 'b_contencion' ? 1 : 0)) * (P.furia > 0 ? 2 : 1) * (P.jefe > 0 ? 1.6 : 1);
  function attack() { if (!P || P.dead || paused || P.cd > 0) return; const wk = curW(), W = WEAP[wk]; P.atk = .3; P.cd = W.cd * (INV.ab.includes('rapido') ? .7 : 1); P.wk = wk;
    const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir], dmg = playerDmg(), range = W.range; let hitAny = false;
    if (W.gun) { shoot(fx, dmg, W); return; }
    sendPos(true); SND.swing(); buzz(12);
    mobs.slice().forEach(o => { if (o.vis < .5) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range + (o.T.heavy ? 30 : 0)) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      hitAny = true; const kb = o.T.heavy ? (wk === 'bate' && !o.T.boss ? 14 : 0) : (o.st === 'run' ? 8 : W.kb); hitMob(o, dmg, fx[0] * kb, fx[1] * kb); });
    if (INV.ab.includes('cuchillos')) throwKnife(fx, dmg);
    others.forEach((o, id) => { if (!enemy(o)) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      const d = dmg * 8; hitAny = true; o.hurt = .2; floats.push({ x: o.x + rnd(-10, 10), y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' });
      net('hit', { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) }); });
    if (hitAny) { SND.hit(); buzz(25); wearWeapon(); } }
  /* pistola: la bala viaja y pega al primero que encuentra */
  function shoot(fx, dmg, W) { if (W && W.flame) { const ox = P.x + fx[0] * 40, oy = P.y - 90 + fx[1] * 20; for (let i = 0; i < 3; i++) { const a = rnd(-.22, .22), c_ = Math.cos(a), s_ = Math.sin(a), vx = fx[0] * c_ - fx[1] * s_, vy = fx[0] * s_ + fx[1] * c_; shots.push({ x: ox, y: oy, vx: vx * 620, vy: vy * 620 * .8, life: .32, dmg: Math.max(1, Math.round(dmg * .6)), fire: 1, flame: 1 }); }
      if ((P.flameS = (P.flameS || 0) + 1) % 3 === 0) SND.shot(); wearWeapon(); buzz(8); sendPos(true); net('shot', { x: Math.round(ox), y: Math.round(oy), vx: fx[0], vy: fx[1] }); return; }
    const ox = P.x + fx[0] * 40, oy = P.y - 95 + fx[1] * 20, sp = W && W.fire ? 650 : 1100;
    const dirs = W && W.spread ? [-.13, .13] : [0]; dirs.forEach(a => { const c_ = Math.cos(a), s_ = Math.sin(a), vx = fx[0] * c_ - fx[1] * s_, vy = fx[0] * s_ + fx[1] * c_; shots.push({ x: ox, y: oy, vx: vx * sp, vy: vy * sp * .8, life: W && W.fire ? 1.1 : .6, dmg, fire: W && W.fire ? 1 : 0 }); });
    SND.shot(); buzz(30); shake = Math.max(shake, .12); sendPos(true); net('shot', { x: Math.round(ox), y: Math.round(oy), vx: fx[0], vy: fx[1] }); wearWeapon(); }
  function throwKnife(fx, dmg) { shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 820, vy: fx[1] * 820 * .8, life: .55, dmg, knife: 1 }); }
  /* vendas: 3 segundos entre una y otra */
  function useVenda() { if (!hasItem('vendas')) return toast(EXP ? 'No tenés vendas. Buscalas en los mapas de Haedo.' : 'No tenés vendas. Rosa las vende en Plaza de Mayo.'); const lv = lvlOf(P.xp);
    if (P.dead) return; if ((P.vendaCd || 0) > 0) return toast('Esperá ' + Math.ceil(P.vendaCd) + ' s para la próxima venda.'); if (P.hp >= maxHp(lv)) return toast('Ya estás con la vida completa.');
    P.hp = Math.min(maxHp(lv), P.hp + ITEMS.vendas.v); P.vendaCd = 3; INV.items.vendas--; if (!INV.items.vendas) delete INV.items.vendas; SND.pick(); quickBtns(); floats.push({ x: P.x, y: P.y - 200, t: 1, txt: '+30', c: '#9fe0b0' }); hud(); healBtn(); }
  const QUICK_HEAL = ['venda', 'heal', 'comer', 'vida', 'vendaq', 'antiveneno'];
  const LORE = ['Lucía, 34 años. La vieron entrar al subte de Once. Nunca salió.', 'El que vuelve no siempre recuerda. El que recuerda no siempre vuelve.', 'VIREX repartió la vacuna gratis. Después vinieron los Oscuros.', 'Si escuchás un chillido, no corras: el ruido los llama.', 'Hay un viajero que regresa sin mutar. Lo buscan todos.', 'En el puerto hay un refugio que parece normal. No lo es.', 'Mariano anota nombres. Dice que mientras alguien los nombre, no se pierden.', 'Refugio Norte: tachado. Puerto Madero: subrayado dos veces.'];
  function healBtn() { quickBtns(); }
  function quickBtns() { if (!INV) return; const q = INV.q = INV.q || {}; if (q.cura && !hasItem(q.cura)) q.cura = null; if (!q.cura) q.cura = ['vendas', 'manzana', 'kit', 'suero'].find(k => hasItem(k)) || null; if (q.esp && !hasItem(q.esp)) q.esp = null; if (!q.esp) q.esp = ['brz_jefe', 'brz_ork', 'brz_reb', 'kitsune', 'linterna'].find(k => hasItem(k)) || null;
    const put = (id, k) => { const b = $(id); if (!b) return; const cv = b.querySelector('canvas'), n = b.querySelector('i'); if (cv) { const g_ = cv.getContext('2d'); g_.clearRect(0, 0, 48, 48); if (k) { const ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; try { g_.drawImage(ic, 4, 4, 40, 40); } catch (e) {} } } if (n) n.textContent = k ? (INV.items[k] || 0) : ''; b.classList.toggle('off', !k); };
    put('#btn-h', q.cura); put('#btn-s', q.esp); const w = $('#btn-w'); if (w) { put('#btn-w', INV.eq.arma === 'palo' ? 'palo' : INV.eq.arma); const n = w.querySelector('i'); if (n) n.textContent = weaponLabel(); } }
  function quickUse(slot) { if (!INV || !P || P.dead || paused) return; const k = (INV.q || {})[slot]; if (!k || !hasItem(k)) return toast(slot === 'cura' ? 'No tenés nada para curarte. Elegí uno en la MOCHILA.' : 'No tenés objeto especial. Elegí uno en la MOCHILA.');
    const it = ITEMS[k]; if (it.use === 'venda') return useVenda(); if (it.use === 'kitsune') return useKitsune(); useItem(k, 'use'); paused = false; $('#ov-inv').hidden = true; quickBtns(); }
  function abButtons() { $('#btn-x').hidden = !INV.ab.includes('invis') && !hasItem('kitsune'); }
  function useKitsune() { if (!hasItem('kitsune') || P.dead) return; if ((P.ghost || 0) > 0) return; P.ghost = 3; if (INV.dur.kitsune == null) INV.dur.kitsune = 2; INV.dur.kitsune--; SND.mob('whisper', .3); sendPos(true);
    if (INV.dur.kitsune <= 0) { INV.items.kitsune--; if (INV.items.kitsune > 0) INV.dur.kitsune = 2; else { delete INV.items.kitsune; delete INV.dur.kitsune; } toast('Desaparecés 3 segundos. La máscara kitsune se partió.'); } else toast('Desaparecés 3 segundos. A la máscara le queda 1 uso.'); abButtons(); hud(); persist(); }
  function goGhost() { if (P.dead) return; if (!INV.ab.includes('invis') || ((P.ghostCd || 0) > 0 && hasItem('kitsune'))) return useKitsune(); if ((P.ghostCd || 0) > 0) return toast('HUIR vuelve en ' + Math.ceil(P.ghostCd) + ' s.'); P.ghost = 3; P.ghostCd = 20; SND.mob('whisper', .3); sendPos(true); toast('Invisible por 3 segundos.'); }
  function updateShots(dt) { for (let i = shots.length - 1; i >= 0; i--) { const b = shots[i]; const steps = 4; let hit = false;
      for (let k = 0; k < steps && !hit; k++) { b.x += b.vx * dt / steps; b.y += b.vy * dt / steps; const gy = b.y + 95;
        if (!walkable(b.x, gy) && !b.fake) { hit = true; break; }
        if (b.fake) continue;
        for (const o of mobs) { if (o.vis < .5) continue; if (Math.abs(o.x - b.x) < o.T.pw * PXS * .45 && gy > o.y - 40 && gy < o.y + 40) { hit = true; const l = Math.hypot(b.vx, b.vy) || 1, kb = o.T.heavy ? 0 : 14; SND.hit(); hitMob(o, b.dmg, b.vx / l * kb, b.vy / l * kb); break; } }
        if (!hit) others.forEach((o, id) => { if (hit || !enemy(o)) return; if (Math.abs(o.x - b.x) < 40 && gy > o.y - 40 && gy < o.y + 40) { hit = true; const d = b.dmg * 6; o.hurt = .2; floats.push({ x: o.x, y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' }); SND.hit();
            net('hit', { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) }); } }); }
      b.life -= dt; if (hit || b.life <= 0) { for (let j = 0; j < 6; j++) parts.push({ x: b.x, y: b.y + 95 - 95, vx: rnd(-80, 80), vy: rnd(-80, 0), life: .3, s: 2, c: 200 }); shots.splice(i, 1); } } }
  function pressA() { if (!P || P.dead || paused) return; const n = nearNpc(); if (n) return talkNpc(n); }
  function sendSay() { const t = $('#say-in').value.trim(); $('#say').hidden = true; $('#say-in').blur(); if (!t) return; P.say = t; P.sayT = 6; net('say', { id: me.id, t }); }
  $('#say-go').onclick = sendSay; $('#say-in').addEventListener('keydown', e => { if (e.key === 'Enter') sendSay(); if (e.key === 'Escape') { $('#say').hidden = true; $('#say-in').blur(); } });

  /* ---------- menú / salir ---------- */
  function openMenu() { if (!running) return; paused = true; $('#ov-menu').hidden = false; }
  $('#menu-b').onclick = openMenu; $('#m-back').onclick = () => { paused = false; $('#ov-menu').hidden = true; };
  $('#m-snd').onclick = () => { SND.init(); $('#m-snd').textContent = 'SONIDO: ' + (SND.toggle() ? 'SÍ' : 'NO'); };
  $('#m-exit').onclick = async () => { $('#m-exit').disabled = true; $('#m-exit').textContent = 'GUARDANDO…'; await persist(); leaveRoom();
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'portrait' }); } catch (e) {} location.replace('/index.html#theof'); };
  if (PL.App && PL.App.addListener) PL.App.addListener('backButton', () => { if (!$('#say').hidden) { $('#say').hidden = true; return; } if (!$('#ov-inv').hidden) { closeInv(); return; } if (!$('#ov-shop').hidden) { paused = false; $('#ov-shop').hidden = true; return; } if (paused) { paused = false; $('#ov-menu').hidden = true; } else openMenu(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { persist(); netPaused = true; clearTimeout(hiddenT); hiddenT = setTimeout(() => { if (ch && tracked) { try { ch.untrack(); } catch (e) {} tracked = false; } }, NET.HIDDEN_UNTRACK_MS); }
    else { netPaused = false; clearTimeout(hiddenT); if (ch && !tracked) trackMe(); lastPlayerSent = null; if (netMode === 'MULTI_CLIENT') net('req', {}); else if (netMode === 'MULTI_HOST') needFull = true; } });
  ['keydown', 'pointerdown'].forEach(ev => addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true }));
  addEventListener('pagehide', () => leaveRoom());
  $('#d-fac').onclick = async () => { const b = $('#d-fac'); b.disabled = true; b.textContent = 'REINICIANDO…'; await persist();
    const { error } = await sb.rpc('game_reset_faction'); if (error) { b.disabled = false; b.textContent = 'ELEGIR BANDO DE NUEVO'; return toast('No se pudo: falta correr 05_reglas.sql en Supabase.'); }
    leaveRoom(); try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'portrait' }); } catch (e) {} location.replace('/index.html'); };
  $('#d-ok').onclick = () => { $('#ov-dead').hidden = true; $('#fade').classList.add('on');
    setTimeout(() => { P.hp = maxHp(lvlOf(P.xp)); P.dead = false; hud(); const [hz, hp_] = home(); if (mapKey !== hz) enterMap(hz, hp_[0] * WS, hp_[1] * WS); else { P.x = hp_[0] * WS; P.y = hp_[1] * WS; P.inv = 4; } hud(); sendPos(true); persist(); $('#fade').classList.remove('on'); }, 600); };

  /* =================== API para el modo historia (cenizas-story.js) =================== */
  const API = { useItem, get CAS() { return CAS; }, get ptraps() { return ptraps; }, get guide() { return guide; }, get suero() { return suero; }, get P() { return P; }, get look() { return look; }, get INV() { return INV; }, get me() { return me; }, get mapKey() { return mapKey; }, get MAP() { return MAP; }, MAPS, ITEMS, MOB, WS, toast, buzz, SND, hud, persist, addItem, hasItem, spawnPickup, warpTo, iconOf, img, ok, quickBtns,
    lvlOf, xpFor, maxHp, walkable, charSprite, blitChar, HD_K, get mobs() { return mobs; }, get pickups() { return pickups; },
    setPaused(v) { paused = v; }, spawnMob(kind, x, y) { const o = spawnMob(kind, 0, [x, y]); if (o) { o.story = 1; o.chasing = true; } return o; },
    giveXp(x) { const lb = lvlOf(P.xp); P.xp += x; if (lvlOf(P.xp) > lb) { P.hp = maxHp(lvlOf(P.xp)); SND.level(); toast('SUBISTE A NIVEL ' + lvlOf(P.xp)); } hud(); },
    giveCoins(c_) { INV.coins += c_; hud(); }, takeItem(k, n) { INV.items[k] = (INV.items[k] || 0) - (n || 1); if (INV.items[k] <= 0) delete INV.items[k]; quickBtns(); } };
  window.CZ_API = API;

  /* =================== LOOP =================== */
  const ctx = cv.getContext('2d'); let DPR = 1, VW = 0, VH = 0, zoom = 1, last = 0, t = 0;
  const dark = document.createElement('canvas'), dg = dark.getContext('2d');
  const tint = document.createElement('canvas'), tg = tint.getContext('2d');
  function resize() { DPR = Math.min(1.5, devicePixelRatio || 1); VW = innerWidth; VH = innerHeight; cv.width = VW * DPR; cv.height = VH * DPR; dark.width = Math.ceil(VW / 2); dark.height = Math.ceil(VH / 2); zoom = Math.max(.55, Math.min(1.35, VH / 600)); }
  addEventListener('resize', resize); resize();
  function newAsh(any) { return { x: Math.random() * VW, y: any ? Math.random() * VH : -10, v: 12 + Math.random() * 26, w: Math.random() * 6.28, s: .8 + Math.random() * 1.8, o: .2 + Math.random() * .45 }; }
  function loop(now) { requestAnimationFrame(loop); if (document.hidden || now - last < 1000 / 40 - 2) return; const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; if (!paused && !warping) update(dt); render(); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) last = performance.now(); });

  function update(dt) {
    // jugador
    let ix = joy.dx, iy = joy.dy;
    if (keys.arrowleft || keys.a) ix = -1; if (keys.arrowright || keys.d) ix = 1; if (keys.arrowup || keys.w) iy = -1; if (keys.arrowdown || keys.s) iy = 1;
    if (paused) { ix = iy = 0; } const mag = Math.hypot(ix, iy); P.mv = !P.dead && mag > .08;
    const wantRun = (runHeld || keys.shift) && P.mv && !P.tired && P.stam > 0; P.running = wantRun;
    if (wantRun) { P.stam = Math.max(0, P.stam - dt); if (P.stam <= 0) { P.tired = true; toast('Te cansaste. Esperá a recuperar el aire.'); } } else { P.stam = Math.min(3, P.stam + dt * .55); if (P.stam >= 3) P.tired = false; }
    const sb_ = $('#h-st'); if (sb_) { sb_.style.width = (P.stam / 3 * 100) + '%'; sb_.style.background = P.tired ? '#7a3a34' : ''; }
    if (P.mv) { const sp = 175 * Math.min(1, mag) * (P.slow > 0 ? .45 : 1) * (P.fast > 0 ? 1.3 : 1) * (P.smoke > 0 ? .75 : 1) * (wantRun ? (me.faction === 'rebel' ? 1.9 : 1.65) : 1); const vx = ix / mag * sp * dt, vy = iy / mag * sp * dt;
      if (walkable(P.x + vx, P.y)) P.x += vx; if (walkable(P.x, P.y + vy)) P.y += vy;
      P.dir = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'l' : 'r') : (iy < 0 ? 'u' : 'd'); if (Math.abs(ix) > .2) P.face = ix < 0 ? -1 : 1;
      P.walkT += dt * 9 * Math.min(1, mag) * (wantRun ? 1.6 : 1); P.stepT -= dt; if (P.stepT <= 0) { P.stepT = wantRun ? .22 : .36; SND.step(); } if (wantRun && Math.random() < .5) parts.push({ x: P.x + rnd(-14, 14), y: P.y - rnd(0, 10), vx: rnd(-30, 30), vy: rnd(-30, -5), life: .4, s: rnd(2, 4), c: 120 }); }
    P.atk = Math.max(0, P.atk - dt); P.cd = Math.max(0, P.cd - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.inv = Math.max(0, P.inv - dt); if (P.sayT > 0) P.sayT -= dt;
    if (P.furia > 0) { P.furia -= dt; if ((t % .2) < dt) parts.push({ x: P.x + rnd(-20, 20), y: P.y - rnd(40, 160), vx: 0, vy: -60, life: .5, s: 4, c: 200, fire: 1 }); if (P.furia <= 0) { P.furia = 0; P.hp = Math.min(P.hp, 10); SND.hurt(); toast('La furia se terminó. Quedaste agotado: 10 de vida.'); hud(); } }
    if (P.jefe > 0) { P.jefe -= dt; if ((t % .25) < dt) parts.push({ x: P.x + rnd(-24, 24), y: P.y - rnd(30, 180), vx: 0, vy: -50, life: .6, s: 4, c: 200, fire: 1 }); if (P.jefe <= 0) { P.jefe = 0; P.hp = Math.min(P.hp, maxHp(lvlOf(P.xp))); toast('El poder de jefe se apagó.'); hud(); } }
    if (P.slow > 0) P.slow -= dt; if (P.fast > 0) P.fast -= dt; if (P.smoke > 0) P.smoke -= dt;
    if (P.burn > 0 && !P.dead) { P.burn -= dt; P.dotT = (P.dotT || 0) + dt; if (Math.random() < dt * 8) parts.push({ x: P.x + rnd(-18, 18), y: P.y - rnd(20, 150), vx: rnd(-10, 10), vy: -60, life: .5, s: 4, c: 200, fire: 1 }); }
    if (P.poison > 0 && !P.dead) { P.poison -= dt; P.dotT = (P.dotT || 0) + dt; if (Math.random() < dt * 4) parts.push({ x: P.x + rnd(-14, 14), y: P.y - rnd(40, 150), vx: 0, vy: -30, life: .7, s: 3, c: 120 }); }
    if ((P.burn > 0 || P.poison > 0) && P.dotT >= 1 && !P.dead) { P.dotT = 0; const dd = (P.burn > 0 ? 3 : 0) + (P.poison > 0 ? 2 : 0); P.hp -= dd; floats.push({ x: P.x, y: P.y - 200, t: .7, txt: (P.burn > 0 ? 'QUEMADO ' : '') + (P.poison > 0 ? 'VENENO ' : '') + '-' + dd, c: P.burn > 0 ? '#ff9a50' : '#9fe070' }); hud(); if (P.hp <= 0) { P.hp = 1; hitPlayer(999, null, 0, null, P.burn > 0 ? 'incinerario' : 'insecto'); } }
    { const fx = $('#fx-st'); if (fx) { const tx = (P.burn > 0 ? '🔥 QUEMADO · venda para quemaduras  ' : '') + (P.poison > 0 ? '☠ ENVENENADO · antiveneno' : '') + (P.smoke > 0 ? ' · sin aire' : '') + (P.fast > 0 ? ' · veloz' : ''); if (fx.textContent !== tx) fx.textContent = tx; fx.hidden = !tx; } }
    pvpTick(dt); if (STORY && window.CZ_STORY) CZ_STORY.tick(dt);
    const fireD = MAP.fire ? Math.hypot(P.x - MAP.fire[0] * WS, P.y - MAP.fire[1] * WS) : 9999;
    SND.fire(Math.max(0, 1 - fireD / 700));
    const lv = lvlOf(P.xp);
    if (INV.eq.luz) { INV.bat = Math.max(0, INV.bat - dt * .8); if (INV.bat <= 0) { if (hasItem('pilas')) { INV.items.pilas--; if (!INV.items.pilas) delete INV.items.pilas; INV.bat = 100; toast('Cambiaste las pilas de la linterna.'); } else { INV.eq.luz = null; toast('La linterna se quedó sin pilas.'); } } if ((t % 1) < dt) hud(); }
    shake = Math.max(0, shake - dt); updateShots(dt); updateMobShots(dt); sueroTick(false);
    P.vendaCd = Math.max(0, (P.vendaCd || 0) - dt); P.ghost = Math.max(0, (P.ghost || 0) - dt); P.ghostCd = Math.max(0, (P.ghostCd || 0) - dt);
    $('#shop-b').hidden = true; const nn = nearNpc(); const al = $('#a-lab'); if (al) { const want = nn ? nn.nm : 'HABLAR'; if (al.textContent !== want) al.textContent = want; } $('#btn-a').hidden = !nn; npcsHere().forEach(n => { if (n.sayT > 0) n.sayT -= dt; });
    for (let i = pickups.length - 1; i >= 0; i--) { const q = pickups[i]; q.t += dt; if (!P.dead && Math.hypot(q.x - P.x, (q.y - P.y) * 1.2) < 70) { pickups.splice(i, 1); if (q.k === 'pista') q.k = PISTA(); addItem(q.k); SND.pick(); buzz(20);
        if (EXP && /^pista_/.test(q.k) && INV.items[q.k] >= 3) { INV.items[q.k] -= 3; if (!INV.items[q.k]) delete INV.items[q.k]; addItem(BRZ()); setTimeout(() => toast('Juntaste 3 pistas: tenés el ' + ITEMS[BRZ()].n.toLowerCase() + '. Usalo desde la MOCHILA.'), 1200); } if (q.k === 'suero') sueroTaken(); if (q.pid) net('took', { pid: q.pid });
        toast('Encontraste: ' + ITEMS[q.k].n + (ITEMS[q.k].eq ? ' · equipalo desde la MOCHILA' : ''));
        if (q.k === 'pagina') { const n = INV.items.pagina; floats.push({ x: P.x, y: P.y - 210, t: 1.6, txt: 'página ' + n, c: '#e8e4da' }); }
        if (q.k === 'suero') net('suero', { slot: suero.slot, by: me.nick }); abButtons();
        if (!q.pid) { const mk = mapKey; setTimeout(() => { if (mapKey === mk && pickups.length < (MAP.safeAll ? 1 : 3)) spawnPickup(); }, rnd(120000, 240000)); } persist(); } }
    if (yuki) { yuki.t += dt; yukiTouch(); }
    // salidas
    const ix0 = P.x / WS, iy0 = P.y / WS; let inExit = null;
    (MAP.exits || []).forEach(e => { if (ix0 >= e.r[0] - 4 && ix0 <= e.r[2] + 4 && iy0 >= e.r[1] - 4 && iy0 <= e.r[3] + 4) inExit = e; });
    P.exitT = Math.max(0, (P.exitT || 0) - dt); if (!inExit) exitLock = false; else if (!exitLock && !P.dead && P.exitT <= 0) warp(inExit);
    // otros jugadores
    others.forEach(o => { if (o.buf) interp(o, o.mv); else { o.x += (o.tx - o.x) * Math.min(1, dt * 10); o.y += (o.ty - o.y) * Math.min(1, dt * 10); } if (o.mv) o.walkT = (o.walkT || 0) + dt * 9; if (o.sayT > 0) o.sayT -= dt; if (o.atk > 0) o.atk -= dt; });
    // Oscuros
    const pSafe = inSafe(P.x, P.y);
    if (netMode === 'MULTI_CLIENT') {
      mobs.forEach(o => { o.t += dt; o.alpha = Math.min(1, o.alpha + dt * .8); o.hurt = Math.max(0, o.hurt - dt); o.lunge = Math.max(0, o.lunge - dt * 3); interp(o, o.moving);
        if (o.vis > .5 && Math.random() < dt * 5) parts.push({ x: o.x + rnd(-.25, .25) * o.T.pw * PXS, y: o.y - rnd(.2, .9) * o.T.h, vx: rnd(5, 25), vy: rnd(-40, -15), life: rnd(.8, 1.6), s: rnd(1.5, 3.5), c: 30 }); });
    } else {
    maintT -= dt; if (maintT <= 0) { maintT = 3; maintainMobs(); }
    const sightMul = (INV.eq.brazo === 'b_resonancia' ? 1.4 : 1) * (INV.eq.luz && MAP.dark > .45 ? 1.2 : 1);
    // jugadores que los Oscuros pueden atacar
    const PLS = [{ id: me.id, me: true, fac: me.faction, x: P.x, y: P.y, ok: !P.dead && P.inv <= 0 && !(P.ghost > 0) && !pSafe, sm: sightMul, mv: P.mv }];
    others.forEach((o, id) => PLS.push({ id, me: false, fac: o.fac, x: o.x, y: o.y, ok: !o.dead && !o.iv && !inSafe(o.x, o.y), sm: 1, mv: o.mv }));
    const live = PLS.filter(p => p.ok);
    flowT -= dt; if (flowT <= 0) { flowT = .3; buildFlowMulti(live); }
    function steer(o, dx, dy, dist) { const c = cellOf(o.x, o.y), d0 = flow[c];
      if (dist < CW * 2.2 || d0 < 0) return [dx / dist, dy / dist];
      let best = d0, bx = 0, by = 0; const cx = c % GW, cy = (c / GW) | 0;
      for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = cx + ddx, ny = cy + ddy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const v = flow[ny * GW + nx]; if (v >= 0 && v < best) { best = v; bx = ddx; by = ddy; } }
      if (bx || by) { const tx = (cx + bx + .5) * CW, ty = (cy + by + .5) * CW, l = Math.hypot(tx - o.x, ty - o.y) || 1; return [(tx - o.x) / l, (ty - o.y) / l]; } return [dx / dist, dy / dist]; }
    function blinkTo(o, tg, near, minFar) { let p = null; if (near && tg) for (let k = 0; k < 25 && !p; k++) { const a = Math.random() * 6.283, r = rnd(110, 190), nx = tg.x + Math.cos(a) * r, ny = tg.y + Math.sin(a) * r * .7; if (mobWalk(nx, ny)) p = [nx, ny]; }
      if (!p) { if (tg && minFar) { for (let k = 0; k < 40 && !p; k++) { const q = randomMobCell(0); if (q && Math.hypot(q[0] - tg.x, q[1] - tg.y) > minFar) p = q; } } if (!p) p = randomMobCell(500); }
      if (p) { for (let i = 0; i < 18; i++) parts.push({ x: o.x + rnd(-20, 20), y: o.y - rnd(0, o.T.h), vx: rnd(-40, 40), vy: rnd(-60, -10), life: rnd(.4, .9), s: rnd(2, 5), c: 20 }); o.x = p[0]; o.y = p[1]; } }
    mobs.slice().forEach(o => { const T = o.T; o.t += dt; o.alpha = Math.min(1, o.alpha + dt * .8); o.hurt = Math.max(0, o.hurt - dt); o.cd = Math.max(0, o.cd - dt); o.lunge = Math.max(0, o.lunge - dt * 3); o.stT -= dt; o.ab -= dt; o.shotT -= dt;
      // objetivo: el jugador vivo más cercano que lo pueda ver
      let tg = null, best = 1e9; live.forEach(p => { if (T.fac && p.fac === T.fac) return; const d = Math.hypot(p.x - o.x, p.y - o.y); if (d < T.sight * p.sm * (o.chasing ? 1.4 : 1) && d < best) { best = d; tg = p; } });
      const dx = tg ? tg.x - o.x : 0, dy = tg ? tg.y - o.y : 0, dist = tg ? (Math.hypot(dx, dy) || 1) : 1e9;
      if (tg && !o.chasing) { o.chasing = true; SND.mob(T.snd, Math.max(.08, .35 - Math.hypot(P.x - o.x, P.y - o.y) / 2000)); }
      if (!tg) { o.chasing = false; if (o.st !== 'idle' && T.ai !== 'blink' && !T.boss) o.st = 'idle'; }
      let mx = 0, my = 0, sp = T.wsp;
      const strike = () => { o.lunge = 1; o.cd = T.cd;
        if (T.ai === 'slam') { if (Math.hypot(P.x - o.x, P.y - o.y) < 700) shake = .4; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; parts.push({ x: o.x + Math.cos(a) * 30, y: o.y + Math.sin(a) * 12, vx: Math.cos(a) * 160, vy: Math.sin(a) * 60 - 20, life: .7, s: 4, c: 60 }); }
          live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.aoe) strikeOn(p, T.dmg, o, 110); }); }
        else if (T.ai === 'ranged') { if (tg) fireMob(o, tg, 'fire'); }
        else if (T.ai === 'mole') { o.combo++; const big = o.combo % 3 === 0; if (big) { shake = Math.max(shake, Math.hypot(P.x - o.x, P.y - o.y) < 700 ? .5 : 0); for (let i = 0; i < 30; i++) parts.push({ x: o.x + o.face * 50, y: o.y - 20, vx: o.face * rnd(60, 220), vy: rnd(-120, -20), life: .6, s: 5, c: 70 }); }
          live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.reach + 30) strikeOn(p, big ? T.big : T.dmg, o, big ? T.bigKnock : 30); }); }
        else if (tg && dist < T.reach + 28) strikeOn(tg, T.dmg, o, T.boss ? 30 : 0); };
      if (o.wind > 0) { o.wind -= dt; if (o.wind <= 0) { strike(); if (T.ai === 'blink') { o.st = 'fadeout'; o.stT = .45; o.far = Math.random() < .35; } } }
      else if (T.ai === 'flee') { if (tg) { o.face = dx < 0 ? 1 : -1; sp = dist < 560 ? T.sp : T.wsp; mx = -dx / dist; my = -dy / dist; if (!mobWalk(o.x + mx * 60, o.y + my * 60)) { mx = -dy / dist * o.side; my = dx / dist * o.side; if (!mobWalk(o.x + mx * 60, o.y + my * 60)) o.side *= -1; } if (Math.random() < dt * .6) o.side *= -1; }
        else { o.wt -= dt; if (o.wt <= 0) { o.wt = rnd(2, 4); const p = randomNear(o.x, o.y, 300); o.wx = p[0]; o.wy = p[1]; } const wd = Math.hypot(o.wx - o.x, o.wy - o.y); if (wd > 10) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; sp = T.wsp; } } }
      else if (T.ai === 'boss' && tg) {
        if (o.st === 'tele') { o.vis = Math.max(0, o.vis - dt * 3); if (o.stT <= 0) { blinkTo(o, tg, false, 520); o.vis = 1; o.st = 'volley'; o.stT = 1.6; o.volleys = 0; o.shotT = .2; SND.mob('roar', .3); } }
        else if (o.st === 'volley') { o.face = dx < 0 ? -1 : 1; if (o.shotT <= 0 && o.volleys < 4) { o.shotT = .32; o.volleys++; fireMob(o, tg, 'fire', rnd(-.12, .12)); } if (o.stT <= 0) { o.st = 'chase'; o.ab = rnd(6, 9); } }
        else { o.st = 'chase'; if (o.ab <= 0) { o.st = 'tele'; o.stT = .4; } else if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; SND.warn(); } else { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); } } }
      else if (T.ai === 'sofia' && tg) {
        if (o.st === 'fadeout') { o.vis = Math.max(0, o.vis - dt * 3); if (o.stT <= 0) { addCloud(o.x, o.y); blinkTo(o, tg, true); o.st = 'fadein'; o.stT = .3; } }
        else if (o.st === 'fadein') { o.vis = Math.min(1, o.vis + dt * 4); if (o.stT <= 0) { o.vis = 1; o.st = 'chase'; o.ab = rnd(6, 8); } }
        else { o.st = 'chase'; o.face = dx < 0 ? -1 : 1;
          if (o.ab <= 0) { o.st = 'fadeout'; o.stT = .35; SND.mob('whisper', .35); }
          else if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; SND.warn(); }
          else { if (dist > 150 && o.shotT <= 0) { o.shotT = .45; fireMob(o, tg, 'knife', rnd(-.06, .06)); }
            sp = T.sp * (dist > 260 ? 1 : .55); [mx, my] = steer(o, dx, dy, dist); if (dist < 260) { const px = -my, py = mx; mx = mx * .4 + px * o.side; my = my * .4 + py * o.side; const l = Math.hypot(mx, my) || 1; mx /= l; my /= l; if (Math.random() < dt) o.side *= -1; } } } }
      else if (T.ai === 'ranged' && tg) { o.face = dx < 0 ? -1 : 1;
        if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; SND.mob('roar', .18); }
        else if (dist > T.keep * 1.3) { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); }
        else if (dist < T.keep * .7) { sp = T.sp; mx = -dx / dist; my = -dy / dist; if (!mobWalk(o.x + mx * 40, o.y + my * 40)) { mx = -dy / dist * o.side; my = dx / dist * o.side; } }
        else { sp = T.wsp; mx = -dy / dist * o.side; my = dx / dist * o.side; if (Math.random() < dt * .5) o.side *= -1; } }
      else if (T.ai === 'dash' && tg) {
        if (o.st === 'idle' || o.st === 'chase') { if (dist > 150 && o.cd <= 0) { o.st = 'aim'; o.stT = T.wind; SND.mob('shriek', .22); } else if (dist < T.reach && o.cd <= 0) { o.wind = .3; SND.warn(); } else { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); } }
        else if (o.st === 'aim') { o.face = dx < 0 ? -1 : 1; if (o.stT <= 0) { const lead = tg.me && P.mv ? .25 : 0, tx = tg.x + (lead ? (joy.dx || 0) * 175 * lead : 0) - o.x, ty = tg.y + (lead ? (joy.dy || 0) * 175 * lead : 0) - o.y, l = Math.hypot(tx, ty) || 1; o.dx = tx / l; o.dy = ty / l; o.st = 'run'; o.stT = .85; o.hitDone = false; } }
        else if (o.st === 'run') { const nx = o.x + o.dx * T.dash * dt, ny = o.y + o.dy * T.dash * dt; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; } else o.stT = 0; o.face = o.dx < 0 ? -1 : 1; o.moving = true; o.vx = o.dx; o.vy = o.dy;
          if (Math.random() < .8) parts.push({ x: o.x - o.dx * 30, y: o.y - rnd(20, 120), vx: -o.dx * 60, vy: rnd(-30, 0), life: .5, s: rnd(2, 5), c: 50 });
          if (!o.hitDone) live.forEach(p => { if (!o.hitDone && Math.hypot(p.x - o.x, p.y - o.y) < T.reach) { o.hitDone = true; strikeOn(p, T.dmg, o, 60); } });
          if (o.stT <= 0) { o.st = 'rest'; o.stT = 1.0; o.cd = T.cd; } }
        else if (o.st === 'rest') { if (o.stT <= 0) o.st = 'chase'; } }
      else if (T.ai === 'blink') {
        if (o.st === 'idle') { o.vis = Math.max(.18, o.vis - dt); if (o.chasing && tg) { o.st = 'fadeout'; o.stT = .4; o.far = false; SND.mob('whisper', .25); } else { o.wt -= dt; if (o.wt <= 0) { o.wt = rnd(3, 6); const p = randomNear(o.x, o.y, 300); o.wx = p[0]; o.wy = p[1]; } const wd = Math.hypot(o.wx - o.x, o.wy - o.y); if (wd > 10) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; } } }
        else if (o.st === 'fadeout') { o.vis = Math.max(0, o.vis - dt * 3); if (o.stT <= 0) { blinkTo(o, tg, !o.far && !!tg); o.st = tg && !o.far ? 'fadein' : 'idle'; o.stT = .3; if (tg) o.face = (tg.x - o.x) < 0 ? -1 : 1; } }
        else if (o.st === 'fadein') { o.vis = Math.min(1, o.vis + dt * 4); if (o.stT <= 0) { o.vis = 1; o.st = 'strike'; o.stT = 1.6; } }
        else if (o.st === 'strike') { if (tg) { o.face = dx < 0 ? -1 : 1; if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; SND.warn(); } else { sp = T.sp * 1.6; [mx, my] = steer(o, dx, dy, dist); } } if (o.stT <= 0) { o.st = 'fadeout'; o.stT = .45; o.far = Math.random() < .3; } } }
      else if (o.chasing && tg) {
        if (dist < T.reach && o.cd <= 0) { o.wind = T.wind * (T.ai === 'mole' && o.combo % 3 === 2 ? 1.5 : 1); if (T.heavy) SND.mob('roar', .25); else SND.warn(); }
        else if (dist > T.reach * .7) { sp = T.sp;
          if (T.ai === 'flank' && dist < 320) { const px = -dy / dist, py = dx / dist, k = Math.min(1, dist / 260) * o.side; const tx = tg.x + px * 90 * k - o.x, ty = tg.y + py * 90 * k - o.y, l = Math.hypot(tx, ty) || 1; mx = tx / l; my = ty / l; if (!mobWalk(o.x + mx * 30, o.y + my * 30)) [mx, my] = steer(o, dx, dy, dist); }
          else [mx, my] = steer(o, dx, dy, dist);
          if (T.ai === 'zigzag') { const z = Math.sin(o.t * 7) * .9, px = -my, py = mx; mx += px * z; my += py * z; const l = Math.hypot(mx, my) || 1; mx /= l; my /= l; if (dist < 170 && o.cd <= 0 && Math.random() < dt * 3) { o.wind = T.wind; SND.mob('hiss', .2); } } } }
      else { o.wt -= dt; const wd = Math.hypot(o.wx - o.x, o.wy - o.y);
        if (T.ai !== 'dash' && (o.wt <= 0 || wd < 10)) { o.wt = rnd(2.5, 5.5); const p = randomNear(o.x, o.y, 380); o.wx = p[0]; o.wy = p[1]; }
        if (T.ai !== 'dash' && wd > 10 && o.wt < 4.2) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; } }
      if (o.slowT > 0) { o.slowT -= dt; sp *= .3; }
      if (o.st !== 'run') { if (mx || my) { const nx = o.x + mx * sp * dt, ny = o.y + my * sp * dt; let moved = false;
          if (mobWalk(nx, o.y)) { o.x = nx; moved = true; } if (mobWalk(o.x, ny)) { o.y = ny; moved = true; }
          if (!moved) { o.stuck += dt; } if (Math.abs(mx) > .15) o.face = mx < 0 ? -1 : 1; o.vx = mx; o.vy = my; o.moving = true; } else o.moving = false; }
      if (o.t % 2 < dt) { if (Math.hypot(o.x - o.lx, o.y - o.ly) < 8 && (mx || my)) { o.stuck += 2; o.wt = 0; } else o.stuck = 0; o.lx = o.x; o.ly = o.y; }
      if (o.stuck > 6 || !mgrid[cellOf(o.x, o.y)]) { const p = randomMobCell(600); if (p) { o.x = p[0]; o.y = p[1]; o.stuck = 0; o.alpha = 0; o.chasing = false; o.st = 'idle'; } }
      if (o.vis > .5 && Math.random() < dt * 5) parts.push({ x: o.x + rnd(-.25, .25) * T.pw * PXS, y: o.y - rnd(.2, .9) * T.h, vx: rnd(5, 25), vy: rnd(-40, -15), life: rnd(.8, 1.6), s: rnd(1.5, 3.5), c: 30 }); });
    }
    // música: tema tenebroso si hay un jefe en el mapa
    SND.music(mobs.some(o => o.T.boss) ? 'boss' : 'calm');
    unlockTick -= dt; if (unlockTick <= 0) { unlockTick = 60; checkUnlocks(); }
    // separar Oscuros entre sí
    for (let i = 0; i < mobs.length; i++) for (let j = i + 1; j < mobs.length; j++) { const a = mobs[i], b = mobs[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, min = 40;
      if (d < min) { const push = (min - d) / 2, ux = dx / d * push, uy = dy / d * push; if (mobWalk(a.x - ux, a.y - uy)) { a.x -= ux; a.y -= uy; } if (mobWalk(b.x + ux, b.y + uy)) { b.x += ux; b.y += uy; } } }
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 10 * dt; p.vx *= .99; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
    for (let i = floats.length - 1; i >= 0; i--) { floats[i].t -= dt; floats[i].y -= 40 * dt; if (floats[i].t <= 0) floats.splice(i, 1); }
    ash.forEach((a, i) => { a.y += a.v * dt; a.x += Math.sin(t * .8 + a.w) * 12 * dt + 6 * dt; if (a.y > VH + 10) ash[i] = newAsh(false); });
  }
  let unlockTick = 2;
  /* flujo de distancias desde TODOS los jugadores atacables: cada Oscuro va hacia el más cercano rodeando obstáculos */
  function buildFlowMulti(list) { flow.fill(-1); const q = new Int32Array(GW * GH); let h = 0, tt = 0;
    list.forEach(p => { const s = cellOf(p.x, p.y); if (flow[s] === -1) { flow[s] = 0; q[tt++] = s; } });
    while (h < tt) { const c = q[h++], x = c % GW, y = (c / GW) | 0, d = flow[c];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const n = ny * GW + nx;
        if (flow[n] !== -1 || !grid[n] || !mgrid[n]) continue; if (dx && dy && (!grid[y * GW + nx] || !grid[ny * GW + x])) continue; flow[n] = d + 1; if (d < 45) q[tt++] = n; } } }
  function randomNear(x, y, r) { for (let k = 0; k < 20; k++) { const nx = x + rnd(-r, r), ny = y + rnd(-r * .6, r * .6); if (mobWalk(nx, ny)) return [nx, ny]; } return [x, y]; }

  function render() {
    const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH);
    if (!P || !MAP) return;
    const vw = VW / zoom, vh = VH / zoom; let cx = P.x - vw / 2, cy = P.y - 70 - vh / 2; cx = Math.max(0, Math.min(WORLD_W - vw, cx)); cy = Math.max(0, Math.min(WORLD_H - vh, cy)); if (shake > 0) { cx += rnd(-1, 1) * shake * 30; cy += rnd(-1, 1) * shake * 30; }
    const W2S = (x, y) => [(x - cx) * zoom, (y - cy) * zoom];
    const bg = img(MAP.img); c.imageSmoothingEnabled = true; if (ok(bg)) c.drawImage(bg, cx / WS, cy / WS, vw / WS, vh / WS, 0, 0, VW, VH);
    let fx = -999, fy = -999, fl = 1;
    if (MAP.fire) { [fx, fy] = W2S(MAP.fire[0] * WS, MAP.fire[1] * WS); fl = 1 + Math.sin(t * 9) * .05 + Math.sin(t * 23) * .04;
      const g = c.createRadialGradient(fx, fy, 0, fx, fy, 230 * zoom * fl); g.addColorStop(0, 'rgba(255,150,60,.28)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(fx - 260 * zoom, fy - 260 * zoom, 520 * zoom, 520 * zoom); }
    // salidas
    (MAP.exits || []).forEach(e => { const [x0, y0] = W2S(e.r[0] * WS, e.r[1] * WS), [x1, y1] = W2S(e.r[2] * WS, e.r[3] * WS); const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (mx < -200 || mx > VW + 200 || my < -200 || my > VH + 200) return; const a = .45 + Math.sin(t * 3) * .25;
      if (!e.to) { c.fillStyle = 'rgba(200,40,30,' + a * .18 + ')'; c.fillRect(x0, y0, Math.max(6, x1 - x0), Math.max(6, y1 - y0)); return; }
      c.fillStyle = 'rgba(240,236,226,' + a * .25 + ')'; c.fillRect(x0, y0, Math.max(6, x1 - x0), Math.max(6, y1 - y0));
      const lx = Math.max(90, Math.min(VW - 90, mx)), ly = Math.max(120, Math.min(VH - 150, my)); const arrow = { l: '◀ ', r: '', u: '▲ ', d: '▼ ' }[e.side] || '', arrowR = e.side === 'r' ? ' ▶' : '';
      c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const txt = arrow + e.label + arrowR; const w = c.measureText(txt).width + 14;
      c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(lx - w / 2, ly - 12, w, 20); c.fillStyle = 'rgba(240,236,226,' + (.6 + a * .4) + ')'; c.fillText(txt, lx, ly + 3); });
    (MAP.tiles || []).forEach(p => { const [sx, sy] = W2S(p[0] * WS, p[1] * WS), a = .35 + Math.sin(t * 4 + p[0]) * .2; c.strokeStyle = 'rgba(120,220,255,' + a + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(sx, sy, 46 * zoom, 18 * zoom, 0, 0, 7); c.stroke(); });
    traps.forEach(tp => { const [sx, sy] = W2S(tp.x, tp.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return; c.save(); c.translate(sx, sy); c.scale(zoom, zoom * .5); c.strokeStyle = tp.cd > 0 ? 'rgba(120,110,100,.6)' : 'rgba(210,190,160,.9)'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283, r = i % 2 ? 18 : 34; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); c.stroke(); c.restore(); });
    // entidades
    const ents = [];
    const occIm = MAP.occ && MAP.occ.length ? img('/a/m/' + mapKey + '-occ.png') : null;
    if (occIm && ok(occIm)) MAP.occ.forEach(o => { const [sx, sy] = W2S(o[0] * WS, o[1] * WS), w = o[2] * WS * zoom, h = o[3] * WS * zoom; if (sx > VW || sy > VH || sx + w < 0 || sy + h < 0) return; ents.push({ y: MAP.occTop ? 1e12 : o[4] * WS, occ: [sx, sy, w, h], draw: () => c.drawImage(occIm, 0, o[5], o[2], o[3], sx, sy, w, h) }); });
    if (STORY && window.CZ_STORY) CZ_STORY.ents(ents, W2S, c, zoom, WS);
    ents.push({ y: P.y, draw: () => drawChar(P, look, me.nick, me.faction, true) });
    others.forEach(o => { if (o.look) ents.push({ y: o.y, draw: () => drawChar(o, o.look, o.nick, o.fac, false) }); });
    if (gotFull) mobs.forEach(o => ents.push({ y: o.y, draw: () => drawMob(o) }));
    pickups.forEach(q => ents.push({ y: q.y - 30, draw: () => drawPickup(q) }));
    npcsHere().forEach(n => ents.push({ y: n.y * WS, draw: () => drawNpc(n) }));
    if (yuki) ents.push({ y: yuki.y, draw: () => { const [sx, sy] = W2S(yuki.x, yuki.y), S = 6.4 * zoom; const sp = HD && HD.sheet('yuki', Math.sin(yuki.t * 2) > 0 ? 'l' : 'r', (yuki.t * 6 | 0) % 3, false); shadow(sx, sy, 18); if (sp) blitChar(c, sp, sx, sy, S, HD_K * .6);
      c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#e8c070'; c.fillText('YUKI', sx, sy - 120 * zoom); } });
    ptraps.forEach(tp => { if (tp.m !== mapKey) return; const [tx, ty] = W2S(tp.x, tp.y); if (tx < -60 || tx > VW + 60 || ty < -60 || ty > VH + 60) return;
      if (tp.fac === me.faction) { const im = img('/a/it/peligro.png'), w = 44 * zoom; c.globalAlpha = .9; if (ok(im)) c.drawImage(im, tx - w / 2, ty - w * .8, w, w); c.globalAlpha = 1; c.strokeStyle = 'rgba(255,170,80,.7)'; c.lineWidth = 2; c.beginPath(); c.ellipse(tx, ty, 34 * zoom, 11 * zoom, 0, 0, 7); c.stroke(); }
      else { c.fillStyle = 'rgba(20,14,10,.38)'; c.beginPath(); c.ellipse(tx, ty, 9 * zoom, 3.5 * zoom, .3, 0, 7); c.fill(); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    if (STORY) { const sk = img('/a/it/calavera.png'); mobs.forEach(o => { if (!(o.hp > 0) || !(o.T.boss || o.T.hourly)) return; const [bx, by] = W2S(o.x, o.y - o.T.h - 40); const on = bx > 20 && bx < VW - 20 && by > 20 && by < VH - 20, w = 40 * Math.max(.8, zoom);
      const ex = Math.max(34, Math.min(VW - 34, bx)), ey = Math.max(70, Math.min(VH - 60, by)); if (ok(sk)) c.drawImage(sk, ex - w / 2, ey - w / 2 + (on ? Math.sin(t * 4) * 4 : 0), w, w);
      if (!on) { const a = Math.atan2(by - ey, bx - ex); c.save(); c.translate(ex + Math.cos(a) * 30, ey + Math.sin(a) * 30); c.rotate(a); c.fillStyle = '#ff3a3a'; c.beginPath(); c.moveTo(10, 0); c.lineTo(-6, -8); c.lineTo(-6, 8); c.fill(); c.restore(); }
      c.font = '12px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#ff6a5c'; c.fillText('JEFE · ' + o.T.name, ex, ey + w / 2 + 14); }); }
    if (guide && (Date.now() > guide.until || !suero.map)) guide = null;
    if (guide) { let gx = null, gy = null, lab = 'MALETÍN';
      if (guide.map === mapKey) { const q = pickups.find(q => q.k === 'suero'); if (q) { gx = q.x; gy = q.y; } }
      else { const e = routeTo(mapKey, guide.map); if (e) { gx = (e.r[0] + e.r[2]) / 2 * WS; gy = (e.r[1] + e.r[3]) / 2 * WS; lab = 'MALETÍN · ' + (e.label || 'salida'); } }
      if (gx != null) { const [px, py] = W2S(P.x, P.y - 100), [qx, qy] = W2S(gx, gy), a = Math.atan2(qy - py, qx - px), d = Math.hypot(qx - px, qy - py);
        if (d > 90) { c.save(); c.translate(px + Math.cos(a) * 120 * zoom, py + Math.sin(a) * 120 * zoom); c.rotate(a); c.fillStyle = 'rgba(120,230,160,.9)'; c.beginPath(); c.moveTo(22, 0); c.lineTo(-10, -13); c.lineTo(-4, 0); c.lineTo(-10, 13); c.fill(); c.restore();
          c.font = '12px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#8ff0b0'; c.fillText(lab, px + Math.cos(a) * 120 * zoom, py + Math.sin(a) * 120 * zoom - 22); } } }
    /* (sin círculo de rayos X: lo que está en la capa de frente tapa al personaje) */
    if (STORY && window.CZ_STORY) CZ_STORY.draw(c, W2S, VW, VH, zoom, WS);
    function shadow(x, y, w) { c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(x, y, w * zoom, w * .3 * zoom, 0, 0, 7); c.fill(); }
    function drawSprite(im, sx, sy, h, face, rot, sq, flash, alpha) { if (!ok(im)) return; const H = h * zoom * (sq || 1), W = im.naturalWidth / im.naturalHeight * h * zoom;
      c.save(); c.translate(sx, sy); if (rot) c.rotate(rot); c.scale(face < 0 ? -1 : 1, 1); c.globalAlpha = alpha == null ? 1 : alpha;
      if (flash) { tint.width = Math.ceil(W); tint.height = Math.ceil(H); tg.clearRect(0, 0, tint.width, tint.height); tg.drawImage(im, 0, 0, tint.width, tint.height); tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = 'rgba(255,255,255,' + flash + ')'; tg.fillRect(0, 0, tint.width, tint.height); tg.globalCompositeOperation = 'source-over'; c.drawImage(tint, -W / 2, -H); }
      else c.drawImage(im, -W / 2, -H, W, H);
      c.restore(); }
    function drawChar(o, lk, nick, fac, mine) {
      const [sx, sy] = W2S(o.x, o.y); const moving = mine ? o.mv : (Math.hypot((o.tx || 0) - o.x, (o.ty || 0) - o.y) > 2 || o.mv);
      const frame = moving ? (Math.floor((o.walkT || 0) / 1.6) % 2 ? 1 : 2) : 0; const dir = mine ? P.dir : (o.dir || 'd');
      const S = 6.4 * zoom; shadow(sx, sy, 28);
      c.imageSmoothingEnabled = false; if (mine && (P.hurtT > 0 || P.inv > 0)) c.globalAlpha = .7 + Math.sin(t * 30) * .25; if (mine && P.dead) c.globalAlpha = .35; if (mine && P.ghost > 0) c.globalAlpha = .25;
      if (!mine && o.dead) c.globalAlpha = .3; else if (!mine && o.gh) c.globalAlpha = .1; else if (!mine && o.iv) c.globalAlpha = .6;
      const spr = charSprite(lk, dir, frame, (o.atk || 0) > 0); blitChar(c, spr, sx, sy, S);
      if (!mine && (o.hurt || 0) > 0) { o.hurt -= 1 / 60; c.globalCompositeOperation = 'lighter'; c.globalAlpha = .6; blitChar(c, spr, sx, sy, S); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if (!mine && fac !== me.faction && o.hp != null && !o.dead) { const bw = 46 * zoom, by = sy - 27 * S - 24; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 4); c.fillStyle = '#ff6a5c'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / 100), 4); }
      if ((o.atk || 0) > 0) { const a = { d: Math.PI / 2, u: -Math.PI / 2, l: Math.PI, r: 0 }[dir]; const k = 1 - (o.atk / .3), wk = mine ? (P.wk || 'palo') : 'palo';
        if (wk === 'pistola') { const mx = sx + Math.cos(a) * 50 * zoom, my = sy - 95 * zoom + Math.sin(a) * 30 * zoom; c.fillStyle = 'rgba(255,220,140,' + (1 - k) + ')'; c.beginPath(); c.arc(mx, my, 14 * zoom * (1 - k), 0, 7); c.fill(); }
        else if (wk === 'lanza') { const r0 = 30 * zoom, r1 = (110 + 70 * Math.sin(k * Math.PI)) * zoom; c.strokeStyle = 'rgba(200,200,205,' + (1 - k * .6) + ')'; c.lineWidth = 4 * zoom; c.beginPath(); c.moveTo(sx + Math.cos(a) * r0, sy - 80 * zoom + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * r1, sy - 80 * zoom + Math.sin(a) * r1); c.stroke(); }
        else { const rad = (wk === 'cuchillo' ? 70 : wk === 'bate' ? 105 : 95) * zoom; c.strokeStyle = 'rgba(255,255,255,' + (.75 * (1 - k)) + ')'; c.lineWidth = (wk === 'bate' ? 8 : 5) * zoom; c.beginPath(); c.arc(sx, sy - 80 * zoom, rad, a - 1.1 + k * .6, a + .2 + k * .9); c.stroke(); } }
      if (!mine && !o.gh) { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = (o.lvl >= lvlOf(P.xp) + 10 && fac !== me.faction ? '☠ ' : '') + nick + (fac !== me.faction ? ' ✕' : ''); const w = c.measureText(nm).width + 10; const ny = sy - 27 * S - 6; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sx - w / 2, ny - 12, w, 15); c.fillStyle = fac === 'ork' ? '#ff7a70' : '#eeeeee'; c.fillText(nm, sx, ny); }
      if (o.sayT > 0 && o.say) bubble(sx, sy - 27 * S - (mine ? 6 : 24), o.say); }
    function drawMob(o) { const T = o.T; const [sx, sy] = W2S(o.x, o.y); if (sx < -300 || sx > VW + 300 || sy < -50 || sy > VH + 400) return;
      let vis = o.vis; if (T.ai === 'blink' && (INV.eq.brazo === 'b_resonancia' || INV.eq.luz)) vis = Math.max(vis, .55);
      if (vis < .03) return;
      const fast = o.st === 'run' ? 20 : o.chasing ? (T.boss ? 14 : 9) : 5, frame = o.moving ? (Math.floor(o.t * fast) % 2 ? 1 : 2) : 0;
      const art = artOf(T, frame, o.hurt > 0, o.moving, o.lunge > 0 || o.st === 'aim'), S = PXS * zoom, W = T.pw * S, H = T.ph * S;
      const AX = art.hd ? CELL_HD * H * HD_K / 220 : W, AY = art.hd ? 240 * H * HD_K / 220 : H, AW = art.hd ? AX : W, AH = art.hd ? AX : H; // HD: celda cuadrada con pies en 240
      let lx = 0, jx = 0; if (o.lunge > 0) lx = o.face * 26 * o.lunge * zoom; if (o.wind > 0 || o.st === 'aim') jx = Math.sin(t * 60) * 2 * zoom;
      shadow(sx, sy, Math.max(22, T.pw * 1.6));
      c.save(); c.translate(Math.round(sx + lx + jx), Math.round(sy)); if (o.face < 0) c.scale(-1, 1);
      c.globalAlpha = o.alpha * vis * (T.ai === 'blink' ? (.75 + Math.sin(t * 12 + o.x) * .2) : 1); c.imageSmoothingEnabled = false;
      const AU = T.aura || o.au; c.drawImage(glowOf(art, AU), Math.round(-AW / 2), Math.round(-AY), Math.round(AW), Math.round(AH));
      if (T.npc && o.hurt > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35 * vis; c.drawImage(art, Math.round(-AW / 2), Math.round(-AY), Math.round(AW), Math.round(AH)); c.globalCompositeOperation = 'source-over'; }
      if (o.wind > 0 || o.st === 'aim') { c.globalAlpha = .25 + Math.sin(t * 40) * .15; c.globalCompositeOperation = 'lighter'; c.drawImage(art, Math.round(-AW / 2), Math.round(-AY), Math.round(AW), Math.round(AH)); c.globalCompositeOperation = 'source-over'; }
      c.restore(); c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if (o.hp < o.mhp && vis > .5) { const bw = 48 * zoom, by = sy - (art.hd ? AY * .8 : H) - 6; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 5); c.fillStyle = '#d8d6d0'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / o.mhp), 5); }
      if (o.lv && vis > .5) { const danger = o.lv >= lvlOf(P.xp) + 10, txt = (danger ? '☠ ' : '') + 'NV ' + o.lv, ty = sy - (art.hd ? AY * .8 : H) - 26; c.font = 'bold ' + Math.round(13 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const tw = c.measureText(txt).width + 10; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - tw / 2, ty - 13, tw, 17); c.fillStyle = danger ? '#ff5a4a' : '#e6e2d8'; c.fillText(txt, sx, ty); }
      if (o.wind > 0 || o.st === 'aim') { c.fillStyle = 'rgba(255,90,70,.95)'; c.font = 'bold ' + Math.round(22 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillText(o.st === 'aim' ? '!!' : '!', sx, sy - H - 22); }
      if (T.ai === 'mole' && o.wind > 0 && o.combo % 3 === 2) { const k = 1 - o.wind / (T.wind * 1.5); c.strokeStyle = 'rgba(255,60,40,' + (.4 + k * .5) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(sx + o.face * 50 * zoom, sy, 120 * zoom * k, 40 * zoom * k, 0, 0, 7); c.stroke(); }
      if (T.ai === 'ranged' || T.boss) { const ar = (T.aura ? 110 : 60) * zoom * (1 + Math.sin(t * 4) * .06); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(sx, sy - H * .55, 0, sx, sy - H * .55, ar); gr.addColorStop(0, T.aura ? 'rgba(' + T.aura + ',.32)' : 'rgba(255,120,40,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(sx - ar, sy - H * .55 - ar, ar * 2, ar * 2); c.globalCompositeOperation = 'source-over'; }
      if (T.ai === 'slam' && o.wind > 0) { const k = 1 - o.wind / T.wind; c.strokeStyle = 'rgba(255,90,70,' + (.25 + k * .5) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx, sy, T.aoe * zoom * k, T.aoe * .35 * zoom * k, 0, 0, 7); c.stroke(); } }
    function drawNpc(n) { if (n.obj) { const [ox, oy] = W2S(n.x * WS, n.y * WS); if (n.cas) { const im = img('/a/ob/casillero.png'), h = 150 * zoom; if (ok(im)) { const w = im.naturalWidth / im.naturalHeight * h; shadow(ox, oy, 30); if (INV.cas && INV.cas[n.id] === dayN()) c.globalAlpha = .55; c.drawImage(im, ox - w / 2, oy - h, w, h); c.globalAlpha = 1; } } if (nearNpc() === n) { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#e8c070'; c.fillText(n.nm + ' · A', ox, oy - 40 * zoom); } return; } const [sx, sy] = W2S(n.x * WS, n.y * WS); if (sx < -200 || sx > VW + 200 || sy < -50 || sy > VH + 300) return; const S = 6.4 * zoom; shadow(sx, sy, 28);
      const dir = Math.abs(P.x - n.x * WS) > 120 ? (P.x < n.x * WS ? 'l' : 'r') : 'd'; blitChar(c, charSprite({ npc: n.k }, dir, 0, false), sx, sy, S, n.sc ? HD_K * n.sc : undefined); c.imageSmoothingEnabled = true;
      const near = nearNpc() === n; c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = n.nm + (near ? ' · A' : ''); const w = c.measureText(nm).width + 10, ny = sy - 27 * S - 6;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sx - w / 2, ny - 12, w, 15); c.fillStyle = '#e8c070'; c.fillText(nm, sx, ny);
      if (n.sayT > 0 || near) bubble(sx, ny - 18, n.line); }
    function drawPickup(q) { const [sx, sy] = W2S(q.x, q.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return; const b = Math.sin(q.t * 3) * 4 * zoom, S = 4.2 * zoom;
      const gl = c.createRadialGradient(sx, sy - 20 * zoom, 0, sx, sy - 20 * zoom, 46 * zoom); gl.addColorStop(0, 'rgba(255,240,200,' + (.25 + Math.sin(q.t * 4) * .1) + ')'); gl.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gl; c.fillRect(sx - 50 * zoom, sy - 70 * zoom, 100 * zoom, 100 * zoom);
      shadow(sx, sy, 14); c.imageSmoothingEnabled = false; c.drawImage(iconOf(q.k), Math.round(sx - 6 * S), Math.round(sy - 14 * S + b), Math.round(12 * S), Math.round(12 * S)); c.imageSmoothingEnabled = true;
      if ((q.t % 2.4) < .25) { c.fillStyle = 'rgba(255,255,255,.9)'; const k = (q.t % 2.4) / .25; c.fillRect(sx + 10 * zoom - 1, sy - 30 * zoom - 6 * k, 2, 12 * k); c.fillRect(sx + 10 * zoom - 6 * k, sy - 30 * zoom - 1, 12 * k, 2); } }
    function bubble(x, y, text) { c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const words = text.split(' '); const lines = []; let ln = '';
      words.forEach(w => { if (c.measureText(ln + ' ' + w).width > 170 && ln) { lines.push(ln); ln = w; } else ln = ln ? ln + ' ' + w : w; }); lines.push(ln);
      const w = Math.max(...lines.map(l => c.measureText(l).width)) + 16, h = lines.length * 16 + 10; c.fillStyle = 'rgba(240,238,232,.94)'; c.fillRect(x - w / 2, y - h, w, h); c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x, y + 6); c.fill();
      c.fillStyle = '#111'; lines.forEach((l, i) => c.fillText(l, x, y - h + 18 + i * 16)); }
    // nubes tóxicas
    clouds.forEach(c0 => { const [x, y] = W2S(c0.x, c0.y); const a = Math.min(1, c0.ttl) * .5; const gr = c.createRadialGradient(x, y, 0, x, y, c0.r * zoom); gr.addColorStop(0, 'rgba(120,150,90,' + a + ')'); gr.addColorStop(.7, 'rgba(80,100,60,' + a * .6 + ')'); gr.addColorStop(1, 'rgba(60,70,50,0)');
      c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, c0.r * zoom, c0.r * .7 * zoom, 0, 0, 7); c.fill(); });
    // fuego y cuchillos de los Oscuros
    mshots.forEach(b => { const [x, y] = W2S(b.x, b.y - 70);
      if (b.k === 'fire') { c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 0, x, y, 26 * zoom); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(.4, 'rgba(255,140,40,.9)'); gr.addColorStop(1, 'rgba(200,40,10,0)'); c.fillStyle = gr; c.fillRect(x - 26 * zoom, y - 26 * zoom, 52 * zoom, 52 * zoom); c.globalCompositeOperation = 'source-over'; }
      else { const l = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / l, uy = b.vy / l; c.strokeStyle = '#e8ecf0'; c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x - ux * 18 * zoom, y - uy * 18 * zoom); c.lineTo(x + ux * 12 * zoom, y + uy * 12 * zoom); c.stroke(); } });
    // balas
    shots.forEach(b => { if (!b.fire) return; const [x, y] = W2S(b.x, b.y); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 0, x, y, 24 * zoom); gr.addColorStop(0, 'rgba(255,245,200,1)'); gr.addColorStop(.4, 'rgba(255,150,50,.9)'); gr.addColorStop(1, 'rgba(200,40,10,0)'); c.fillStyle = gr; c.fillRect(x - 24 * zoom, y - 24 * zoom, 48 * zoom, 48 * zoom); c.globalCompositeOperation = 'source-over'; });
    shots.forEach(b => { if (b.fire) return; const [x, y] = W2S(b.x, b.y); const [x2, y2] = W2S(b.x - b.vx * .03, b.y - b.vy * .03); c.strokeStyle = b.knife ? '#e8ecf0' : 'rgba(255,230,160,.9)'; c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x, y); c.stroke(); });
    // partículas
    parts.forEach(p => { const [x, y] = W2S(p.x, p.y); const v = p.c || 30; c.fillStyle = p.fire ? 'rgba(255,' + (120 + (Math.random() * 100 | 0)) + ',40,' + Math.min(1, p.life * 2) + ')' : 'rgba(' + v + ',' + v + ',' + (v + 2) + ',' + Math.min(1, p.life) * .85 + ')'; c.fillRect(x, y, p.s * zoom, p.s * zoom); });
    // oscuridad
    const dw = dark.width, dh = dark.height; dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, dw, dh); dg.fillStyle = 'rgba(4,4,8,' + Math.min(.9, (MAP.dark || .5) * ((MAP.dark || .5) >= .42 && !INV.eq.luz ? 1.75 : 1)) + ')'; dg.fillRect(0, 0, dw, dh);
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { const gg = dg.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2); gg.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gg; dg.fillRect(x / 2 - r / 2, y / 2 - r / 2, r, r); };
    const [px_, py_] = W2S(P.x, P.y - 80); hole(px_, py_, (INV.eq.luz ? 980 : (MAP.dark || .4) >= .42 ? 300 : 520) * zoom, .97); if (MAP.fire) hole(fx, fy, 520 * zoom * fl, 1);
    others.forEach(o => { const [ox, oy] = W2S(o.x, o.y - 80); hole(ox, oy, 280 * zoom, .7); });
    c.drawImage(dark, 0, 0, VW, VH);
    // números flotantes
    floats.forEach(f => { const [x, y] = W2S(f.x, f.y); c.globalAlpha = Math.min(1, f.t * 2); c.font = 'bold ' + Math.round(15 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(f.txt, x + 1, y + 1); c.fillStyle = f.c; c.fillText(f.txt, x, y); c.globalAlpha = 1; });
    // ceniza
    ash.forEach(a => { c.fillStyle = 'rgba(220,216,206,' + a.o + ')'; c.fillRect(a.x, a.y, a.s, a.s); });
    let g = c.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    if (P.hurtT > 0) { c.fillStyle = 'rgba(160,20,10,' + P.hurtT * .8 + ')'; c.fillRect(0, 0, VW, VH); }
    if (P.ghost > 0) { c.fillStyle = 'rgba(180,200,220,.08)'; c.fillRect(0, 0, VW, VH); }
    // barra del jefe
    const boss = gotFull && mobs.find(o => o.T.boss); const bb = $('#boss'); if (boss) { bb.hidden = false; $('#boss-n').textContent = boss.T.name; $('#boss-hp').style.width = Math.max(0, Math.min(100, boss.hp / (boss.mhp || boss.T.hp) * 100)) + '%'; } else bb.hidden = true;
    const lv = lvlOf(P.xp); if (!P.dead && P.hp < maxHp(lv) * .25) { c.fillStyle = 'rgba(120,10,5,' + (.12 + Math.sin(t * 5) * .08) + ')'; c.fillRect(0, 0, VW, VH); }
  }

    window.__cz = { EXP, npcs: () => npcsHere(), talk: () => { const n = nearNpc(); if (n) talkNpc(n); return n && n.k; }, get skins() { return mySkins; }, get look() { return look; }, get net() { return { mode: netMode, peers, sent: NETC.sent, recv: NETC.recv, gotFull }; }, get host() { return isHost; }, get hostId() { return hostId; }, set unlocks(v) { unlocks = v; }, get unlocks() { return unlocks; }, mshots, clouds, killMob, get suero() { return suero; }, get P() { return P; }, get INV() { return INV; }, pickups, mobs, spawnMob, spawnPickup, get map() { return mapKey; }, warp: k => enterMap(k, 0, 0) };
  boot().catch(e => { $('#load-t').textContent = 'Error al cargar: ' + (e.message || e); });
})();
