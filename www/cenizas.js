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
  const ICON_PNG = { katana: 'katana', bate: 'bate', cuchillo: 'cuchillo', barra: 'barra', pistola: 'pistola', escopeta: 'escopeta', mascara: 'mascara', kitsune: 'capa', chaleco: 'chaleco', chaleco_t: 'chaleco', armadura: 'chaleco', campera: 'chaleco', palo: 'palo',
    b_contencion: 'brazalete', b_resonancia: 'brazalete', brz_ork: 'brazalete', brz_reb: 'brazalete', vendas: 'vendas', botiquin: 'vendas', suero: 'maletin', kit: 'maletin', cigarrillo: 'cigarrillo', manzana: 'manzana', credencial: 'credencial', pista_ork: 'credencial', pista_reb: 'pagina', pista: 'pagina', pagina: 'pagina', lanza: 'lanza', baston: 'lanza' };
  Object.assign(ICON_PNG, { llave_rift: 'llaves', ganzuas: 'ganzuas', barra: 'barra2', cuchillo: 'cuchillo2', mascara: 'mascara_gas', filtro: 'respirador' });
  Object.assign(ICON_PNG, { lanzallamas: 'escopeta', metralleta: 'pistola', trampa: 'dinamita', antiveneno: 'canister', venda_q: 'vendas', fragmento: 'energia', brz_jefe: 'brazalete', tarjeta: 'tarjeta2', expediente: 'expediente', fusible: 'fusible', radio: 'radio', cartucho: 'cartucho', canister: 'canister', contenedor: 'contenedor', energia: 'energia' });
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
      else if (lk.cu && HD.custom) s = HD.custom(lk, dir, frame, atk);
      else if (lk.pj) s = HD.sheet(lk.pj, dir, frame, atk);
      else if (lk.body != null) s = HD.base(lk.body === 1, lk.model || 0, baseColors(lk), dir, frame, atk);
      if (s) return s; }
    return lk && lk.npc && NPC && NPC.C[lk.npc] ? NPC.draw(lk.npc, dir, frame) : sprite(lk, dir, frame, atk); }
  /* dibuja un personaje (pixel 18×26 o planilla HD) con los pies en (sx, sy) */
  function blitChar(ctx, spr, sx, sy, S, k) { if (spr.hd) return HD.blit(ctx, spr, sx, sy + S, 25 * S * (k == null ? HD_K : k)); ctx.imageSmoothingEnabled = false; ctx.drawImage(spr, Math.round(sx - 9 * S), Math.round(sy - 25 * S), Math.round(18 * S), Math.round(26 * S)); }
  const SKIN_NAMES = { pablo4: 'Pablo casual', pabloFuturo: 'Pablo futuro', pablo: 'Pablo 1', pablo2: 'Pablo 2', pablo3: 'Pablo 3', pol: 'Pol del futuro', polAlter: 'Pol alter', renzo: 'Renzo', sam: 'Sam', eze: 'Eze', esteban: 'Esteban', giuliana: 'Giuliana', lean: 'Lean', luis: 'Luis', norbert: 'Norbert', toby: 'Tobías', tomy: 'Tomy' };
  const skinName = k => { const n = SKIN_NAMES[k]; if (n) return n; const H = window.CZ_SHEETS; if (H && H.ALL.includes(H.NPC_SHEET[k] || k)) return (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' '); return null; };
  /* tipos de Oscuro: h = altura en mundo; las imágenes laterales miran a la derecha */
  /* Oscuros en pixel: PXS = tamaño de cada pixel en el mundo (igual que los avatares) */
  const PIX = window.CZ_PIX, PXS = 6.4, CELL_HD = 256, HD_K = .75; // HD_K: tamaño de los personajes en planilla respecto del pixel viejo
  const MOB = {
    errante: { coins: 1, name: 'Errante', art: 'errante', pw: 18, ph: 30, hp: 6, sp: 88, wsp: 30, dmg: 13, reach: 58, sight: 360, wind: .4, cd: 1.0, xp: 15, ai: 'chase', snd: 'growl' },
    corredor: { coins: 2, name: 'Corredor', art: 'corredor', pw: 26, ph: 24, hp: 5, sp: 125, dash: 400, wsp: 0, dmg: 16, reach: 62, sight: 500, wind: .45, cd: 1.3, xp: 26, ai: 'dash', snd: 'shriek' },
    perro: { coins: 1, name: 'Sabueso', art: 'perro', pw: 30, ph: 22, hp: 4, sp: 235, wsp: 60, dmg: 10, reach: 52, sight: 540, wind: .18, cd: .55, xp: 14, ai: 'flank', snd: 'bark' },
    denso: { coins: 4, name: 'Denso', art: 'denso', pw: 26, ph: 34, hp: 24, sp: 58, wsp: 22, dmg: 32, reach: 96, aoe: 140, sight: 320, wind: .85, cd: 1.7, xp: 80, ai: 'slam', snd: 'roar', heavy: true },
    sombra: { coins: 2, name: 'Sombra', art: 'sombra', pw: 16, ph: 32, hp: 5, sp: 70, wsp: 25, dmg: 18, reach: 64, sight: 440, wind: .32, cd: .9, xp: 32, ai: 'blink', snd: 'whisper' },
    incinerario: { name: 'Incinerario', art: 'incinerario', pw: 20, ph: 30, hp: 12, sp: 75, wsp: 25, dmg: 16, reach: 430, keep: 270, pspeed: 380, sight: 520, wind: .7, cd: 2.0, xp: 50, coins: 3, ai: 'ranged', snd: 'roar' },
    mole: { name: 'La Mole', art: 'mole', pw: 36, ph: 40, hp: 90, sp: 58, wsp: 22, dmg: 22, big: 52, bigKnock: 340, reach: 100, sight: 360, wind: .7, cd: 1.15, xp: 240, coins: 10, ai: 'mole', snd: 'roar', heavy: true, respawn: 90000 },
    jefe: { name: 'MERCEDES', art: 'jefe', npc: 'mercedesMala', aura: '170,60,255', pw: 25, ph: 36, hp: 650, sp: 270, wsp: 60, dmg: 13, reach: 66, pspeed: 430, fdmg: 18, sight: 900, wind: .18, cd: .35, xp: 1800, coins: 25, ai: 'boss', snd: 'roar', heavy: true, boss: true, respawn: 480000 },
    sofia: { name: 'SOFÍA', art: 'sofia', npc: 'sofia', aura: '220,30,30', pw: 25, ph: 36, hp: 1100, sp: 255, wsp: 60, dmg: 15, reach: 64, pspeed: 720, fdmg: 14, sight: 900, wind: .2, cd: .4, xp: 6000, coins: 40, ai: 'sofia', snd: 'whisper', heavy: true, boss: true, respawn: 900000 },
    rastrero: { coins: 1, name: 'Gato Oscuro', art: 'rastrero', pw: 28, ph: 20, hp: 4, sp: 195, wsp: 45, dmg: 11, reach: 56, sight: 420, wind: .22, cd: .8, xp: 18, ai: 'zigzag', snd: 'hiss' }
  };
  MOB.ignacio = Object.assign({}, MOB.jefe, { name: 'IGNACIO', npc: 'ignacio', aura: '255,170,40', hp: 520, dmg: 12, xp: 1500, coins: 22 });
  MOB.maxi = Object.assign({}, MOB.jefe, { name: 'MAXI', npc: 'maxi', aura: '60,200,255', hp: 800, dmg: 14, xp: 2600, coins: 30 });
  MOB.lilia = Object.assign({}, MOB.jefe, { name: 'LILIA', npc: 'lilia', aura: '210,60,200', hp: 1300, dmg: 17, xp: 7000, coins: 45 });
  const BOSS_AT = { estatua: 'ignacio', lezama: 'maxi', lab: 'lilia' };
  const nm_ = (base, o) => Object.assign({}, MOB[base], { npc: undefined, aura: undefined }, o);
  MOB.oscura = nm_('errante', { name: 'Oscura', sheet: 'oscura' });
  /* el clon que queda cuando morís contagiado: tiene tu cara (o.cl) y tu nombre (o.cn) */
  /* el Contagiado: Oscuro común que contagia el doble */
  MOB.contagiado = nm_('errante', { name: 'Contagiado', sheet: 'contagiado', hp: 8, dmg: 12, sp: 105, xp: 22, coins: 2, cont: 2 });
  MOB.clon = nm_('errante', { name: 'Contagiado', hp: 9, dmg: 14, sp: 100, xp: 30, coins: 3, aura: '150,60,255' });
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
  MOB.yuki = nm_('errante', { name: 'YUKI', sheet: 'yuki', pw: 11, ph: 17, aura: '255,200,90', ai: 'flee', hp: 26, sp: 215, wsp: 70, dmg: 0, reach: 0, sight: 620, xp: 400, coins: 15, respawn: 900000, lv1: true });
  MOB.incinerario.burn = true; MOB.insecto.poison = true; MOB.babosa.poison = true; MOB.lodo.poison = true;
  MOB.soldado.fac = 'ork'; MOB.patrulla.fac = 'ork'; MOB.saqueador.fac = 'rebel'; MOB.tirador.fac = 'rebel';
  const HOURLY_AT = { patio: 'electrico', nueveJulio: 'garras', muelle: 'serpiente', teatroAv: 'pantallas' };
  /* nuevos: los Ojos (sólo en la oscuridad, sin linterna), la Quieta (se mueve cuando no la mirás) y el Kamikaze (explota) */
  MOB.ojos = nm_('sombra', { name: 'Ojos', eyes: true, ai: 'chase', hp: 6, sp: 150, wsp: 40, dmg: 14, reach: 60, sight: 620, wind: .35, cd: 1.1, xp: 30, coins: 2 });
  MOB.quieta = nm_('errante', { name: 'La Quieta', sheet: 'oscuro_mujer', ai: 'angel', hp: 10, sp: 360, wsp: 0, dmg: 20, reach: 66, sight: 950, wind: .05, cd: 1.4, xp: 45, coins: 3 });
  MOB.kamikaze = nm_('corredor', { name: 'Kamikaze', sheet: 'kamikaze', ai: 'boom', hp: 5, sp: 165, dmg: 30, aoe: 150, reach: 95, sight: 480, wind: .9, cd: 2, xp: 28, coins: 2 });
  /* cada uno tira lo suyo: no todo es bola de fuego */
  Object.assign(MOB.babosa, { shot: 'acido' }); Object.assign(MOB.patrulla, { shot: 'bala', pspeed: 620 }); Object.assign(MOB.tirador, { shot: 'bala', pspeed: 620 });
  Object.assign(MOB.jefe, { shot: 'vacio' }); Object.assign(MOB.lilia, { shot: 'vacio' }); Object.assign(MOB.maxi, { shot: 'orbe' }); Object.assign(MOB.pantallas, { shot: 'orbe' });
  Object.assign(MOB.electrico, { shot: 'rayo', pspeed: 900 }); Object.assign(MOB.pablo, { shot: 'orbe' }); Object.assign(MOB.garras, { shot: 'vacio' });
  /* ===== modelos nuevos de Thiriang ===== */
  Object.assign(MOB.jefe, { sheet: 'mercedes_jefe' }); Object.assign(MOB.ignacio, { sheet: 'ignacio2' }); Object.assign(MOB.maxi, { sheet: 'maxi2' }); Object.assign(MOB.lilia, { sheet: 'lilia2' }); Object.assign(MOB.sofia, { sheet: 'sofia_mala2' });
  MOB.oscura.sheet = 'oscuro_mujer3'; MOB.quieta.sheet = 'quieta'; Object.assign(MOB.maxi, { shot: 'bala', pspeed: 620 });
  MOB.lucas = nm_('jefe', { name: 'LUCAS', sheet: 'lucas_jefe', aura: '120,255,170', hp: 900, dmg: 14, xp: 3200, coins: 32, shot: 'acido' });
  MOB.noster = nm_('jefe', { name: 'NOSTER', sheet: 'noster_oscuro', aura: '255,90,40', hp: 1000, dmg: 16, xp: 3600, coins: 34, shot: 'fire' });
  MOB.ani = nm_('jefe', { name: 'ANI · FASE OSCURA', sheet: 'ani_oscura', aura: '255,120,30', hp: 950, dmg: 15, xp: 3400, coins: 34, shot: 'vacio', sp: 300 });
  MOB.nacho = nm_('jefe', { name: 'NACHO OSCURO', sheet: 'nacho_oscuro', aura: '255,150,40', hp: 1100, dmg: 17, xp: 3800, coins: 36, shot: 'fire' });
  /* la Dama y el Galán de los bares: primero hablan y piden plata, después se transforman */
  MOB.chica = nm_('jefe', { name: 'LA DAMA', sheet: 'chica1', aura: '255,60,120', passive: 'chica', hp: 999, xp: 0, coins: 0 });
  MOB.chica_b = nm_('jefe', { name: 'LA DAMA', sheet: 'chica2', aura: '255,60,120', passive: 'chica', hp: 999, xp: 0, coins: 0 });
  MOB.chica_c = nm_('jefe', { name: 'LA DAMA · BESTIA', sheet: 'chica3', aura: '255,30,90', hp: 1200, dmg: 17, xp: 4200, coins: 160, shot: 'vacio', sp: 290 });
  MOB.chico = nm_('jefe', { name: 'EL GALÁN', sheet: 'chico1', aura: '255,90,60', passive: 'chico', hp: 999, xp: 0, coins: 0 });
  MOB.chico_b = nm_('jefe', { name: 'EL GALÁN', sheet: 'chico2', aura: '255,90,60', passive: 'chico', hp: 999, xp: 0, coins: 0 });
  MOB.chico_c = nm_('jefe', { name: 'EL GALÁN · BESTIA', sheet: 'chico3', aura: '255,40,40', hp: 1250, dmg: 18, xp: 4200, coins: 160, shot: 'fire', sp: 280 });
  /* Oscuros nuevos */
  MOB.griton = nm_('errante', { name: 'Gritón', sheet: 'griton', ai: 'scream', hp: 9, sp: 80, dmg: 8, reach: 330, sight: 480, wind: .8, cd: 5.5, xp: 38, coins: 3 });
  MOB.empujador = nm_('errante', { name: 'Empujador', sheet: 'empujador', hp: 14, sp: 95, dmg: 18, knock: 430, xp: 40, coins: 3, heavy: true });
  MOB.mocoso = nm_('incinerario', { name: 'Desintegrada', sheet: 'desintegrado', shot: 'moco', burn: false, hp: 11, reach: 380, keep: 240, pspeed: 330, xp: 45, coins: 3 });
  MOB.mocoso_h = nm_('incinerario', { name: 'Desintegrado', sheet: 'desintegrado_h', shot: 'moco', burn: false, hp: 12, reach: 380, keep: 240, pspeed: 330, xp: 46, coins: 3 });
  MOB.piedra = nm_('incinerario', { name: 'Oscura de Piedra', sheet: 'piedra', shot: 'piedra', burn: false, hp: 10, reach: 420, keep: 280, pspeed: 480, xp: 42, coins: 3 });
  MOB.lava = nm_('incinerario', { name: 'Desintegrado de Lava', sheet: 'desintegrado_lava', shot: 'fire', hp: 13, xp: 50 });
  MOB.lava_oscura = nm_('denso', { name: 'Criatura de Lava', sheet: 'lava_oscura', hp: 22, xp: 75, burn: true });
  MOB.ojo = nm_('incinerario', { name: 'El Ojo', sheet: 'ojo', shot: 'orbe', burn: false, hp: 14, sp: 60, wsp: 20, pspeed: 420, xp: 55, coins: 3 });
  /* de bando: palomas y perros policía (atacan a ORK) · drones y perros robot (atacan a los rebeldes) */
  MOB.paloma = nm_('cuervo', { name: 'Paloma', sheet: 'paloma', ph: 32, pw: 24, hp: 2, dmg: 6, xp: 8, coins: 1, fac: 'rebel' });
  MOB.paloma_zombi = nm_('cuervo', { name: 'Paloma Zombi', sheet: 'paloma_zombi', ph: 30, pw: 24, hp: 4, dmg: 9, xp: 14, coins: 1, fac: 'rebel' });
  MOB.paloma_cohete = nm_('kamikaze', { name: 'Paloma Cohete', sheet: 'paloma_cohete', ph: 29, pw: 24, hp: 3, sp: 240, dmg: 22, aoe: 120, xp: 20, coins: 2, fac: 'rebel' });
  MOB.perro_policia = nm_('perro', { name: 'Perro Policía', sheet: 'perro_policia', ph: 34, pw: 32, hp: 9, dmg: 14, xp: 30, coins: 2, fac: 'rebel' });
  MOB.drone = nm_('incinerario', { name: 'Drone ORK', sheet: 'drone', shot: 'rayo', burn: false, hp: 8, sp: 110, pspeed: 700, xp: 40, coins: 3, fac: 'ork' });
  MOB.perro_robot = nm_('perro', { name: 'Perro Robot IA', sheet: 'perro_robot', hp: 14, dmg: 16, sp: 250, xp: 42, coins: 3, fac: 'ork' });
  /* jefes de mapa: cada día salen 3 al azar, cada uno en un mapa; si lo matan no vuelve hasta el día siguiente */
  /* jefes del mundo: solo en zonas de nivel medio/alto (nada de jefes en Haedo ni en las zonas de arranque) */
  const BOSS_POOL = { garras: ['oficina_ruina', 'esperanza', 'lezama'], electrico: ['complejo8c', 'subte_arena', 'rivadavia'], pantallas: ['bar_humo', 'oficina_ruina', 'urbanoBA'], serpiente: ['muelle', 'puente'],
    ignacio: ['congreso', 'estOnce', 'terminal_once'], maxi: ['esperanza', 'muelle'], lilia: ['lab', 'lab_cuarentena'], jefe: ['lab_cuarentena', 'arena_final'], sofia: ['oficina', 'oficina_ruina', 'puente'],
    lucas: ['lab', 'terminal_once'], noster: ['urbanoBA', 'oficina', 'arena_final'], ani: ['rivadavia', 'lezama', 'subte_arena'], nacho: ['estOnce', 'bunker', 'muelle'] };
  Object.keys(BOSS_POOL).concat(['chica', 'chico']).forEach(k => { MOB[k].respawn = 99999999; MOB[k].world = true; });
  ['chica_b', 'chica_c', 'chico_b', 'chico_c'].forEach(k => { MOB[k].respawn = 99999999; MOB[k].world = true; });
  /* mientras le das plata no es jefe: recién la bestia (_c) cuenta como jefe */
  ['chica', 'chica_b', 'chico', 'chico_b'].forEach(k => { MOB[k].boss = false; MOB[k].name = MOB[k].name.replace(' · BESTIA', ''); });
  /* balance: los Oscuros pegan menos (que no te maten de dos golpes) */
  Object.values(MOB).forEach(T => { const f = T.boss ? .45 : .8; T.dmg = Math.round(T.dmg * f); if (T.fdmg) T.fdmg = Math.round(T.fdmg * f); if (T.big) T.big = Math.round(T.big * f); if (!T.boss) T.sight = Math.round(T.sight * .85); });
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
  const EXTRA = { incinerario: { patio: 1, estOnce: 1, muelle: 1 }, mole: { congreso: 1, puente: 1 } };
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
    llave_rift: { n: 'Llave oxidada', t: 'Historia · abre la puerta del costado del Nogal', d: 'Tiene grabado NOGAL. Abre la puerta oxidada del costado del campamento.' },
    ganzuas: { n: 'Juego de ganzúas', t: 'Herramienta · poco común', d: 'Acercate a un CASILLERO de los mapas y forzalo: sacás vendas y algo más. También abre la cápsula del búnker. Se gasta.', use: 'forzar' },
    filtro: { n: 'Filtro portátil', t: 'Consumible · poco común', d: 'Hacés potable el agua: +40 de vida y corrés más rápido por 8 segundos.', use: 'vida' },
    suero: { n: 'Maletín de curación total', t: 'Único · rota cada 3 minutos', d: 'Te deja la vida completa. Hay uno solo en todo el mundo y cambia de mapa cada 3 minutos si nadie lo agarra.', use: 'heal', v: 9999 },
    vendas: { n: 'Venda', t: 'Consumible · tienda de Plaza de Mayo', d: 'Cura 30 de vida. Después de usar una, tenés que esperar 3 segundos para la siguiente.', use: 'venda', v: 30 },
    campera: { n: 'Campera reforzada', t: 'Ropa · escudo 35', d: 'Absorbe 35 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 35 },
    chaleco: { n: 'Chaleco antibalas', t: 'Ropa · escudo 70', d: 'Absorbe 70 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otro en algún mapa.', eq: 'ropa', shield: 70 },
    chaleco_t: { n: 'Chaleco táctico', t: 'Ropa · escudo 220 · solo en casilleros', d: 'Kevlar de verdad. Absorbe 220 de daño antes que tu vida. Sólo sale de los casilleros.', eq: 'ropa', shield: 220 },
    armadura: { n: 'Armadura improvisada', t: 'Ropa · escudo 120 · rara', d: 'Chapas y correas. Absorbe 120 de daño. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 120 },
    pagina: { n: 'Página del cuaderno', t: 'Narrativo · raro', d: 'Hojas sueltas del Cuaderno de desaparecidos. Al leerla aprendés algo (+XP) y la guardás en tu diario. También se vende.', use: 'leer' },
    fragmento: { n: 'Fragmento home', t: 'Especial · raro', d: 'Un fragmento temporal. Al romperlo saltás a la base de tu bando. Se gasta.', use: 'volver' },
    lanzallamas: { n: 'Lanzallamas', t: 'Arma de fuego · muy rara', d: 'Escupe fuego de cerca: quema todo lo que tenga adelante. 30 segundos de fuego.', eq: 'arma', uses: 250 },
    metralleta: { n: 'Metralleta', t: 'Arma de fuego · rara', d: 'Ráfaga rápida a distancia. 60 tiros.', eq: 'arma', uses: 60 },
    trampa: { n: 'Trampa', t: 'Objeto · se coloca', d: 'La dejás en el piso. El otro bando no la ve (sólo una marquita). Al pisarla queda frenado y lastimado; a los Oscuros los aturde. Dura 4 minutos.', use: 'trampa' },
    jeringa: { n: 'Jeringa de nanocura', t: 'Consumible · contagio', d: 'Te cura el contagio de los Oscuros por completo. Se vende en la tienda de Rosa (Plaza de Mayo).', use: 'jeringa', v: 100, imm: 8 },
    jeringa_max: { n: 'Jeringa de nanomoléculas', t: 'Consumible · contagio · rara', d: 'Te cura el contagio por completo, te devuelve 30 de vida y no te contagiás por 2 minutos.', use: 'jeringa', v: 100, imm: 120, hp: 30 },
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
    bajo: { errante: 1, oscura: 1, perro: 1, rastrero: 1, cuervo: 1, quieta: 1, corredor: 1, insecto: 1, piedra: 1, kamikaze: 1 },
    medio: { errante: 2, oscura: 1, corredor: 1, perro: 1, sombra: 1, cuervo: 1, insecto: 1, reptante: 1, kamikaze: 1, quieta: 1, griton: 1, empujador: 1, piedra: 1 },
    alto: { errante: 1, oscura: 1, corredor: 1, sombra: 1, denso: 1, lodo: 1, insecto: 1, reptante: 1, babosa: 1, incinerario: 1, kamikaze: 1, quieta: 1, griton: 1, empujador: 1, mocoso: 1, mocoso_h: 1, piedra: 1, lava: 1 },
    tope: { errante: 1, oscura: 1, corredor: 1, sombra: 1, denso: 1, lodo: 1, insecto: 1, reptante: 1, babosa: 1, incinerario: 1, kamikaze: 1, quieta: 1, griton: 1, empujador: 1, mocoso: 1, mocoso_h: 1, piedra: 1, lava: 1, lava_oscura: 1 },
    pvp: { errante: 4, oscura: 3, perro: 2, cuervo: 2, rastrero: 2 } };
  /* MODO HISTORIA · niveles por avance: los mapas de arranque (cerca del Nogal y de Libertador) van de 1 a 5;
     cuanto más lejos, más alto. Puerto Madero suma extra. Las bases enemigas tienen guardias de nivel alto. */
  if (STORY) { const bfs = s0 => { const d = { [s0]: 0 }, q = [s0]; while (q.length) { const k = q.shift(); for (const e of (MAPS[k].exits || [])) if (e.to && MAPS[e.to] && !(e.to in d)) { d[e.to] = d[k] + 1; q.push(e.to); } } return d; };
    const dA = bfs('nogal'), dB = MAPS.libertador ? bfs('libertador') : {};
    /* el nivel lo da el mapa (no el jugador): al salir de las bases 1-6 y sube a medida que te alejás. Puerto Madero y el final, lo más alto. */
    const BYD = [[1, 4], [2, 6], [5, 10], [9, 15], [14, 21], [20, 28], [27, 36]];
    const FIX = { libertador: [1, 4], nogal: [1, 4], muelle: [38, 46], puente: [46, 55], bunker: [55, 65], lab: [64, 74], lab_cuarentena: [74, 85], arena_final: [82, 92] };
    Object.entries(MAPS).forEach(([k, m]) => { if (m.mvp) return; if (FIX[k]) { m.lv = FIX[k]; return; } const d = Math.min(dA[k] == null ? 99 : dA[k], dB[k] == null ? 99 : dB[k]); if (d >= 99) return; m.lv = BYD[Math.min(d, BYD.length - 1)]; }); }
  Object.entries(MAPS).forEach(([k, m]) => { if (m.safeAll || m.base || m.mvp) { m.mobs = {}; return; } const top = (m.lv || [1, 3])[1];
    m.mobs = EXP ? MOBS_T.pvp : top <= 12 ? MOBS_T.bajo : top <= 28 ? MOBS_T.medio : top <= 40 ? MOBS_T.alto : MOBS_T.tope;
    /* pocos y variados: cada mapa elige 5 tipos de su lista (siempre distintos entre mapas), máximo 6 Oscuros */
    if (!EXP) { const hs = s_ => { let h = 2166136261; for (let i = 0; i < s_.length; i++) { h ^= s_.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }; const ks = Object.keys(m.mobs), h0 = hs('mob' + k); ks.sort((x, y) => (hs(x + h0) % 997) - (hs(y + h0) % 997)); const pick = {}; let tot = 0; ks.slice(0, 6).forEach(x => { pick[x] = 1; tot++; }); m.mobs = pick; } });
  /* soldados ORK en bases y asentamientos ORK; rebeldes armados en asentamientos rebeldes. Sólo atacan al otro bando. */
  const HUMAN_AT = { libertador: 'ork', centro_ork: 'ork', lezama: 'ork', mcd: 'ork', muelle: 'rebel', refugioSub: 'rebel', colon: 'rebel' };
  if (!EXP) Object.entries(HUMAN_AT).forEach(([k, f]) => { const m = MAPS[k]; if (!m) return; m.mobs = Object.assign({}, m.mobs || {}, f === 'ork' ? { soldado: 1, patrulla: 1 } : { saqueador: 1, tirador: 1 }); });
  const SPECIAL_AT = { plazaMayo: { paloma: 2, paloma_zombi: 1, paloma_cohete: 1, perro_policia: 2 }, lezama: { ojo: 2, drone: 1, perro_robot: 1 }, libertador: { drone: 2, perro_robot: 1 }, centro_ork: { drone: 1, perro_robot: 2 },
    arena_final: { drone: 1, perro_robot: 1 }, mcd: { drone: 1 }, barrio_chino: { perro_robot: 1 } };
  if (MAPS.plazaMayo && !EXP) MAPS.plazaMayo.safeFac = 'rebel'; /* Plaza de Mayo: segura para rebeldes; para ORK hay palomas y perros policía */
  if (!EXP) Object.entries(SPECIAL_AT).forEach(([k, add]) => { const m = MAPS[k]; if (m) m.mobs = Object.assign({}, m.mobs || {}, add); });
  const LOOT_T = {
    bajo: [['pilas', 3], ['campera', 1.2], ['V', 2.2], ['linterna', 1], ['W', 1.6], ['C', .4], ['M', .5], ['X', .25], ['P', .25], ['A', .2], ['pista', .5]],
    medio: [['pilas', 2], ['campera', 1], ['C', .8], ['V', 2], ['W', 1.6], ['G', .18], ['M', .8], ['X', .4], ['P', .35], ['A', .35], ['mascara', .6], ['pista', .6]],
    alto: [['C', 1.1], ['armadura', .4], ['V', 2], ['W', 1.6], ['G', .3], ['M', 1], ['X', .5], ['P', .4], ['A', .5], ['b_contencion', .3], ['b_resonancia', .3], ['pista', .7]],
    pvp: [['V', 2], ['campera', 1], ['W', 1.4], ['G', .12], ['M', .4], ['X', .4], ['pista', 1.4]],
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
  /* ================= EQUIPO: rarezas, munición, accesorios, arrojables y épicos =================
     Colores: gris común · VERDE · AZUL · VIOLETA · NARANJA (casi épico) · ÉPICO (solo MVPs, nunca se rompe) */
  const RAR = { g: ['COMÚN', '#a0a0a0'], v: ['VERDE', '#47d16a'], a: ['AZUL', '#3fa2ff'], p: ['VIOLETA', '#b26cff'], n: ['NARANJA', '#ff9a2a'], e: ['ÉPICO', '#ff3b5c'] };
  const TIERS = ['v', 'a', 'p', 'n'], TKEY = (b, t) => t === 'v' ? b : b + '_' + t, TB = { v: [0, 1, 1], a: [1, 1.15, 1.45], p: [2, 1.32, 1.95], n: [4, 1.55, 2.7] }, TADJ = { v: '', a: ' azul', p: ' violeta', n: ' naranja' };
  const ICO = (k, f) => { if (ICONS[k] && ICONS[k].src && ICONS[k].src.endsWith('/' + f + '.png')) return; const i = new Image(); i.src = '/a/it/' + f + '.png'; ICONS[k] = i; };
  const tierOf = k => (ITEMS[k] && ITEMS[k].r) || 'g', baseOf = k => (ITEMS[k] && ITEMS[k].base) || k;
  /* cuerpo a cuerpo: se rompen (podés juntar varias) */
  const MELEE = { barra: ['Barra de acero', 'Larga y pesada, llega lejos.', { dmg: 1, range: 140, cd: .44, kb: 26 }, 60], cuchillo: ['Cuchillo', 'Muy rápido y de cerca.', { dmg: 1, range: 92, cd: .2, kb: 12 }, 40],
    bate: ['Bate', 'Pega fuerte y empuja lejos.', { dmg: 2, range: 128, cd: .5, kb: 70 }, 30], lanza: ['Lanza', 'Llega lejísimo y atraviesa a todos los de la línea.', { dmg: 2, range: 185, cd: .55, kb: 30, line: true }, 30],
    katana: ['Katana', 'Corta rápido y fuerte.', { dmg: 3, range: 135, cd: .32, kb: 30 }, 50], hacha: ['Hacha', 'Pega muy fuerte, un poco lenta.', { dmg: 3, range: 125, cd: .55, kb: 40 }, 35],
    machete: ['Machete', 'Rápido y filoso.', { dmg: 2, range: 122, cd: .3, kb: 18 }, 45], martillo: ['Martillo de demolición', 'Lento, pero manda a volar a cualquiera.', { dmg: 4, range: 118, cd: .72, kb: 90 }, 30],
    cadena: ['Cadena', 'Llega lejos y barre a varios.', { dmg: 2, range: 175, cd: .46, kb: 30 }, 45], tubo: ['Tubo con clavos', 'Pega fuerte y desgarra.', { dmg: 3, range: 130, cd: .5, kb: 45 }, 35] };
  Object.entries(MELEE).forEach(([b, [nm, d, st, u]]) => { ICO(b, ICON_PNG[b] || b); TIERS.forEach(t => { const k = TKEY(b, t), uses = Math.round(u * TB[t][2]);
    ITEMS[k] = { n: nm + TADJ[t], t: 'Arma · ' + RAR[t][0] + ' · se rompe', d: d + ' Aguanta ' + uses + ' golpes.', eq: 'arma', uses, r: t, base: b };
    WEAP[k] = Object.assign({ n: nm.split(' ')[0].toUpperCase() }, st, { dmg: st.dmg + TB[t][0], mul: TB[t][1] }); if (t !== 'v') ICO(k, ICON_PNG[b] || b); }); });
  /* armas de fuego: no se rompen, máximo 1 de cada una; se recargan con su munición */
  WEAP.ballesta = { n: 'BALLESTA', dmg: 6, range: 700, cd: .8, kb: 22, gun: true, bolt: true };
  const GUNS = { pistola: ['Pistola', 6, 'balas', 'Dispara a distancia.'], escopeta: ['Itaka', 3, 'cart_itaka', 'Tiro doble que abre en abanico.'], metralleta: ['Metralleta', 30, 'cargador', 'Ráfaga rápida a distancia.'],
    lanzallamas: ['Lanzallamas', 120, 'nafta', 'Escupe fuego de cerca y quema todo lo de adelante.'], ballesta: ['Ballesta', 5, 'virotes', 'Silenciosa y muy fuerte. Atraviesa.'] };
  const AMMO = { balas: ['Balas de pistola', 'pistola'], cart_itaka: ['Cartuchos de Itaka', 'escopeta'], cargador: ['Cargador de metralleta', 'metralleta'], nafta: ['Bidón de nafta', 'lanzallamas'], virotes: ['Virotes de ballesta', 'ballesta'] };
  Object.entries(AMMO).forEach(([k, [nm, g]]) => { ITEMS[k] = { n: nm, t: 'Munición', d: 'Recarga la ' + GUNS[g][0].toLowerCase() + ' (' + GUNS[g][1] + (g === 'lanzallamas' ? ' de fuego' : ' tiros') + '). Se usa sola cuando se vacía.', r: 'g', ammo: g }; ICO(k, k); });
  Object.entries(GUNS).forEach(([b, [nm, mag, am, d]]) => { ICO(b, ICON_PNG[b] && b !== 'metralleta' && b !== 'lanzallamas' ? ICON_PNG[b] : b); const W0 = WEAP[b]; TIERS.forEach(t => { const k = TKEY(b, t);
    ITEMS[k] = { n: nm + TADJ[t], t: 'Arma de fuego · ' + RAR[t][0] + ' · no se rompe · máx. 1', d: d + ' Cargador de ' + mag + '. Se recarga con ' + ITEMS[am].n.toLowerCase() + '.', eq: 'arma', mag, ammoK: am, r: t, base: b, gun: 1 };
    WEAP[k] = Object.assign({}, W0, { dmg: W0.dmg + TB[t][0], mul: TB[t][1] }); if (t !== 'v') ICO(k, ICON_PNG[b] && b !== 'metralleta' && b !== 'lanzallamas' ? ICON_PNG[b] : b); }); });
  ITEMS.baston.r = 'p';
  /* chalecos (se gastan: podés juntar muchos) */
  Object.assign(ITEMS.campera, { r: 'g' }); Object.assign(ITEMS.armadura, { r: 'a' }); Object.assign(ITEMS.chaleco_t, { r: 'p' });
  [['v', 60], ['a', 110], ['p', 180], ['n', 300]].forEach(([t, s]) => { const k = TKEY('chaleco', t); ITEMS[k] = { n: 'Chaleco' + TADJ[t], t: 'Ropa · ' + RAR[t][0] + ' · escudo ' + s, d: 'Absorbe ' + s + ' de daño antes que tu vida. Cuando se gasta, se rompe.', eq: 'ropa', shield: s, r: t, base: 'chaleco' }; ICO(k, 'chaleco'); });
  /* vendas: curan de a poco durante 3 segundos */
  [['v', 22], ['a', 35], ['p', 50], ['n', 75]].forEach(([t, v]) => { const k = TKEY('vendas', t); ITEMS[k] = { n: 'Venda' + TADJ[t], t: 'Consumible · ' + RAR[t][0], d: 'Cura el ' + v + '% de tu vida de a poco durante 3 segundos.', use: 'venda', v, pct: v / 100, r: t, base: 'vendas' }; ICO(k, 'vendas'); });
  /* pociones de velocidad */
  [['v', 6], ['a', 9], ['p', 12], ['n', 16]].forEach(([t, s]) => { const k = TKEY('pocion', t); ITEMS[k] = { n: 'Poción de velocidad' + TADJ[t], t: 'Habilidad · ' + RAR[t][0], d: 'Corrés mucho más rápido durante ' + s + ' segundos. Va en el botón de HABILIDAD.', use: 'veloz', s, r: t, hab: 1, base: 'pocion' }; ICO(k, 'pocion'); });
  /* arrojables */
  ITEMS.granada = { n: 'Granada', t: 'Arrojable · AZUL', d: 'La tirás hacia donde mirás: explota al segundo y lastima fuerte a todo lo que esté cerca. Va en el botón de HABILIDAD.', use: 'tirar', r: 'a', hab: 1 }; ICO('granada', 'granada');
  ITEMS.molotov = { n: 'Bomba molotov', t: 'Arrojable · VERDE', d: 'Se rompe donde cae y deja el piso prendido fuego 5 segundos: quema a todos los Oscuros que pisen. Va en el botón de HABILIDAD.', use: 'tirar', r: 'v', hab: 1 }; ICO('molotov', 'molotov');
  /* accesorios: guantes, rodilleras, amuleto, mira (ACCESORIO 1 y 2), zapatillas (PIES), casco (CABEZA) */
  const ACCS = { guantes: ['Guantes de combate', 'acc', 'dmg', 'Pegás un % más fuerte con todo.'], rodilleras: ['Rodilleras', 'acc', 'def', 'Recibís un % menos de daño.'], amuleto: ['Amuleto de ceniza', 'acc', 'hp', 'Tenés un % más de vida máxima.'],
    mira: ['Mira de precisión', 'acc', 'gdmg', 'Las armas de fuego pegan un % más.'], zapatillas: ['Zapatillas', 'pies', 'spd', 'Caminás y corrés un % más rápido.'], casco: ['Casco', 'cabeza', 'def', 'Recibís un % menos de daño.'] };
  const ACCSV = { v: .06, a: .12, p: .18, n: .26 };
  Object.entries(ACCS).forEach(([b, [nm, sl, st, d]]) => TIERS.forEach(t => { const k = TKEY(b, t), v = st === 'spd' ? ACCSV[t] * .8 : ACCSV[t];
    ITEMS[k] = { n: nm + TADJ[t], t: (sl === 'acc' ? 'Accesorio' : sl === 'pies' ? 'Pies' : 'Cabeza') + ' · ' + RAR[t][0] + ' · +' + Math.round(v * 100) + '%', d: d.replace('un %', 'un ' + Math.round(v * 100) + '%') + ' No se rompe.', eq: sl, [st]: v, r: t, base: b }; ICO(k, b); }));
  ITEMS.mascara.eq = 'cabeza';
  /* ÉPICOS · los dejan los MVPs de las libretas (muy poca probabilidad), nunca se rompen y se usan sin límite */
  const EPIC = {
    chaleco_cs: { n: 'Chaleco del Come Sueños', eq: 'ropa', shield: 500, regen: 1, d: 'Absorbe 500 de daño y nunca se rompe: si pasás 8 segundos sin que te peguen, se vuelve a cargar entero.' },
    ojo_desc: { n: 'Ojo del Descubrimiento', eq: 'acc', act: 'dormir', cd: 20, d: 'HABILIDAD: el enemigo más cercano se queda dormido 5 segundos (jefes también). Cada 20 segundos, sin límite.' },
    palo_destino: { n: 'Palo del Destino', eq: 'arma', act: 'clon', cd: 30, d: 'Arma que nunca se rompe. HABILIDAD: aparece un clon tuyo 5 segundos que pega igual que vos. Cada 30 segundos.' },
    zapatos_fauno: { n: 'Zapatos del Fauno', eq: 'pies', spd: .35, fauno: 1, d: 'Corrés muchísimo más rápido. Si pegás mientras corrés, hacés el doble de daño.' },
    daga_demonio: { n: 'Daga del Demonio', eq: 'arma', boom: 1, d: 'Muy rápida. Cada 2 golpes larga un boomerang de fuego de largo alcance (no atraviesa paredes ni objetos).' },
    baston_oscuro: { n: 'Bastón del Oscuro', eq: 'arma', empuje: 1, d: 'Manda a volar al que golpeás. Si choca contra otro, los dos quedan aturdidos 5 segundos con estrellitas.' },
    gorro_desap: { n: 'Gorro del Desaparecido', eq: 'cabeza', act: 'invis', cd: 15, d: 'HABILIDAD: te volvés invisible. Volvés a aparecer si pegás o si te pegan. Sin límite.' },
    ropa_distinta: { n: 'Ropa de la Distinta', eq: 'ropa', shield: 320, regen: 1, espinas: 1, d: 'Absorbe 320 de daño, nunca se rompe y se recarga. El que te pega queda envenenado.' },
    baston_resina: { n: 'Bastón de resina con moco', eq: 'arma', moco: 1, d: 'Pega fuerte. Cada 3 golpes larga una bola de moco: envenena 5 segundos y deja lento.' },
    anillo_lagrimas: { n: 'Anillo de las Lágrimas Frías', eq: 'acc', act: 'lagrima', cd: 3, d: 'HABILIDAD: tirás una lágrima que congela 5 segundos. Si está congelado y estás cerca, le robás vida y te curás. Cada 3 segundos.' },
    anillo_una: { n: 'Anillo de la Uña de la Maldita', eq: 'acc', act: 'una', cd: 3, d: 'HABILIDAD: tirás una bola de fuego que prende fuego al enemigo y te cura un poco. Cada 3 segundos.' },
    espada_lamentos: { n: 'Espada de los Lamentos', eq: 'arma', lamento: 1, d: 'Dos golpes y el tercero paraliza 5 segundos. Si el enemigo muere antes del tercero, una sombra te lleva atrás del próximo.' } };
  Object.entries(EPIC).forEach(([k, o]) => { ITEMS[k] = Object.assign({ t: (o.eq === 'arma' ? 'Arma' : o.eq === 'ropa' ? 'Ropa' : o.eq === 'acc' ? 'Accesorio' : o.eq === 'pies' ? 'Pies' : 'Cabeza') + ' · ÉPICO · MVP', r: 'e', epic: 1 }, o); ICO(k, k); });
  Object.assign(WEAP, { palo_destino: { n: 'PALO DEL DESTINO', dmg: 5, range: 150, cd: .45, kb: 40, mul: 1.6 }, daga_demonio: { n: 'DAGA', dmg: 4, range: 105, cd: .22, kb: 14, mul: 1.6 },
    baston_oscuro: { n: 'BASTÓN OSCURO', dmg: 5, range: 145, cd: .55, kb: 170, mul: 1.6 }, baston_resina: { n: 'BASTÓN DE RESINA', dmg: 6, range: 140, cd: .5, kb: 50, mul: 1.7 }, espada_lamentos: { n: 'LAMENTOS', dmg: 7, range: 140, cd: .3, kb: 30, mul: 1.9 } });
  /* fotos propias para los que antes compartían o no tenían */
  ['brz_ork', 'brz_reb', 'b_contencion', 'b_resonancia', 'brz_jefe', 'campera', 'chaleco_t', 'armadura', 'botiquin', 'venda_q', 'kit', 'canister', 'baston', 'pista_ork', 'pista_reb', 'pista', 'fragmento', 'trampa', 'antiveneno', 'linterna', 'receptor', 'pilas', 'jeringa', 'jeringa_max'].forEach(k => ICO(k, k));
  const WEAPON_KEYS = ['palo'].concat(Object.keys(WEAP).filter(k => k !== 'palo' && ITEMS[k]));
  /* suma de bonos de todo lo equipado */
  function gearSum(st) { if (!INV || !INV.eq) return 0; let s = 0; Object.values(INV.eq).forEach(k => { const it = k && ITEMS[k]; if (it && it[st]) s += it[st]; }); return s; }
  /* qué arma de fuego (cualquier color) ya tenés */
  const gunOwned = b => Object.keys(INV.items).find(k => INV.items[k] > 0 && ITEMS[k] && ITEMS[k].gun && ITEMS[k].base === b);
  const TORD = { g: 0, v: 1, a: 2, p: 3, n: 4, e: 5 };
  /* reglas al agarrar: 1 linterna y 1 de cada arma de fuego; si ya la tenés, sacás munición (o la mejorás si es de mejor color) */
  function takeItem(k) { const it = ITEMS[k]; if (!it) return null;
    if (k === 'linterna' && hasItem('linterna')) { addItem('pilas'); toast('Ya tenés linterna: le sacaste las pilas.'); return 'pilas'; }
    if (it.gun) { const own = gunOwned(it.base); if (own) { if (TORD[it.r] > TORD[tierOf(own)]) { const was = INV.eq.arma === own; delete INV.items[own]; const d = INV.dur[own]; delete INV.dur[own]; addItem(k); INV.dur[k] = d != null ? d : it.mag; if (was) INV.eq.arma = k; toast('Mejoraste: ' + it.n + '.'); return k; }
        addItem(it.ammoK); toast('Ya tenés ' + ITEMS[own].n.toLowerCase() + ': le sacaste la munición (' + ITEMS[it.ammoK].n.toLowerCase() + ').'); return it.ammoK; }
      addItem(k); INV.dur[k] = it.mag; return autoFill(k); }
    addItem(k); return autoFill(k); }
  /* AUTO-EQUIPAR: si agarrás algo y ese lugar está vacío, te lo ponés; si se rompe lo que tenías, te ponés lo mejor que quede en la mochila */
  const wScore = k => { const w = WEAP[k]; return w ? (w.dmg || 0) * (w.mul || 1) : -1; };
  const shieldOf = k => (ITEMS[k] && ITEMS[k].shield) || 0;
  function bestFor(slot, skip) { const ks = Object.keys(INV.items || {}).filter(k => INV.items[k] > 0 && k !== skip && ITEMS[k]);
    if (slot === 'arma') { const mel = ks.filter(k => WEAP[k] && !WEAP[k].gun && k !== 'palo').sort((a, b) => wScore(b) - wScore(a)); if (mel.length) return mel[0];
      return ks.filter(k => WEAP[k] && WEAP[k].gun && ((INV.dur[k] || 0) > 0 || hasItem(ITEMS[k].ammoK))).sort((a, b) => wScore(b) - wScore(a))[0] || null; }
    if (slot === 'ropa') return ks.filter(k => ITEMS[k].eq === 'ropa').sort((a, b) => shieldOf(b) - shieldOf(a))[0] || null;
    return ks.filter(k => ITEMS[k].eq === slot).sort((a, b) => (TORD[ITEMS[b].r] || 0) - (TORD[ITEMS[a].r] || 0))[0] || null; }
  function autoEquip(slot, skip, quiet) { if (!INV) return null; const k = bestFor(slot, skip); if (!k) return null;
    if (slot === 'arma') { INV.eq.arma = k; const it = ITEMS[k]; if (it.uses && INV.dur[k] == null) INV.dur[k] = it.uses; if (it.gun && INV.dur[k] == null) INV.dur[k] = it.mag; }
    else { INV.eq[slot] = k; if (shieldOf(k) && INV.dur[k] == null) INV.dur[k] = shieldOf(k); }
    if (!quiet) setTimeout(() => toast('Te equipaste solo: ' + ITEMS[k].n + '.'), 900); hud(); quickBtns(); return k; }
  function autoFill(k) { const it = ITEMS[k]; if (!it || !INV) return k;
    if (WEAP[k] && !WEAP[k].gun && curW() === 'palo') { INV.eq.arma = k; if (it.uses && INV.dur[k] == null) INV.dur[k] = it.uses; setTimeout(() => toast('Te equipaste: ' + it.n + '.'), 600); quickBtns(); }
    else if (it.eq && it.eq !== 'arma' && it.eq !== 'acc' && it.eq !== 'luz' && !INV.eq[it.eq]) { INV.eq[it.eq] = k; if (shieldOf(k) && INV.dur[k] == null) INV.dur[k] = shieldOf(k); setTimeout(() => toast('Te pusiste: ' + it.n + '.'), 600); }
    return k; }
  /* botín: fichas genéricas que se convierten en un objeto del color que toque */
  const DROPW = { mapa: { v: 70, a: 22, p: 7, n: 1 }, alto: { v: 45, a: 34, p: 17, n: 4 }, jefe: { v: 8, a: 32, p: 38, n: 22 }, mvp: { v: 0, a: 20, p: 45, n: 35 }, evento: { v: 65, a: 30, p: 5 } };
  const pickT = w => pickW(Object.entries(DROPW[w] || DROPW.mapa));
  function resolveLoot(k, w) { if (!k || k.length > 2 || !/^[A-Z]$/.test(k)) return k; const t = pickT(w || (MAP && (MAP.lv || [1, 3])[1] > 30 ? 'alto' : 'mapa'));
    if (k === 'W') return TKEY(pickW([['barra', 2], ['cuchillo', 2], ['bate', 2], ['lanza', 1], ['katana', 1], ['hacha', 1.4], ['machete', 1.6], ['martillo', 1], ['cadena', 1.2], ['tubo', 1.3]]), t);
    if (k === 'G') return TKEY(pickW([['pistola', 3], ['ballesta', 1.2], ['escopeta', 1], ['metralleta', .8], ['lanzallamas', .4]]), t);
    if (k === 'C') return TKEY('chaleco', t); if (k === 'V') return TKEY('vendas', t); if (k === 'P') return TKEY('pocion', t);
    if (k === 'A') return TKEY(pickW([['guantes', 1], ['rodilleras', 1], ['amuleto', 1], ['mira', .7], ['zapatillas', 1], ['casco', 1]]), t);
    if (k === 'M') return pickW([['balas', 3], ['cart_itaka', 1.2], ['cargador', 1.2], ['nafta', .6], ['virotes', 1]]);
    if (k === 'X') return pickW([['molotov', 2], ['granada', 1]]); return k; }
  /* estados de los Oscuros: aturdido/dormido/congelado, quemado/envenenado (daño de a poco), lento */
  function mobFx(o, fx, byId) { if (!o || !fx) return; if (!isHost) { net('mfx', { id: o.id, fx, by: byId || me.id }); return; } applyMobFx(o, fx, byId || me.id); }
  function applyMobFx(o, fx, by) { if (!o || o.hp <= 0) return; if (fx.stun) { o.stunT = Math.max(o.stunT || 0, fx.stun); o.stunK = fx.k || 'stun'; o.wind = 0; }
    if (fx.slow) o.slowT = Math.max(o.slowT || 0, fx.slow); if (fx.dot) { o.dot = { t: fx.dot, dps: fx.dps || 4, by, c: fx.c || 'p', tk: 0 }; } }
  function mobStatus(o, dt) { if (o.dot && o.dot.t > 0) { o.dot.t -= dt; o.dot.tk -= dt; if (o.dot.tk <= 0) { o.dot.tk = .5; mobHit(o, Math.max(1, Math.round(o.dot.dps * .5)), 0, 0, o.dot.by); } }
    if (o.stunT > 0) { o.stunT -= dt; o.wind = 0; o.moving = false; o.lunge = 0; return true; } return false; }
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
    mgrid = new Uint8Array(grid); if (MAP.safeAll && !MAP.safeFac) mgrid.fill(0);
    if (MKc) for (let c = 0; c < mgrid.length; c++) if (MKc[c] === 4) mgrid[c] = 0; // verde = refugio, los Oscuros no entran
    (MAP.safe || []).forEach(([sx, sy, r]) => { for (let c = 0; c < mgrid.length; c++) { const x = (c % GW) * C + C / 2, y = ((c / GW) | 0) * C + C / 2; if (Math.hypot(x - sx, y - sy) < r) mgrid[c] = 0; } });
    flow = new Int16Array(GW * GH);
  }
  const cellOf = (x, y) => Math.max(0, Math.min(GH - 1, Math.floor(y / CW))) * GW + Math.max(0, Math.min(GW - 1, Math.floor(x / CW)));
  const walkable = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && grid[cellOf(x, y)] === 1;
  const mobWalk = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && mgrid[cellOf(x, y)] === 1;
  const inSafe = (x, y) => (MAP.safeAll && (!MAP.safeFac || (me && me.faction === MAP.safeFac))) || (MASK[mapKey] && MASK[mapKey][cellOf(x, y)] === 4) || (MAP.safe || []).some(([sx, sy, r]) => Math.hypot(x - sx * WS, y - sy * WS) < r * WS);
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
      /* salidas finitas, al ras del borde: así no se comen el piso ni dejan objetos inalcanzables */
      { const w = m.w || 1672, h = m.h || 941, r = e.r, key = Object.keys(MAPS).find(q => MAPS[q] === m), cls = MASK[key];
        const walkC = (x, y) => { if (!cls) return false; const i = Math.floor(x / C), j = Math.floor(y / C); return i >= 0 && j >= 0 && i < cls.gw && j < cls.gh && !!cls[j * cls.gw + i]; };
        /* puertas en el medio del mapa: franja fina de 26 px donde más se pisa */
        const edge_ = r[1] <= 30 || h - r[3] <= 30 || r[0] <= 30 || w - r[2] <= 30;
        if (!edge_ && cls) { const ww = r[2] - r[0], hh = r[3] - r[1], T2 = 26; if (Math.min(ww, hh) > 34) { const horiz = ww >= hh; let best = null, bv = -1;
            for (let o = 0; o + T2 <= (horiz ? hh : ww); o += 4) { let v = 0; for (let x = (horiz ? r[0] : r[0] + o) + 4; x <= (horiz ? r[2] : r[0] + o + T2); x += 8) for (let y = (horiz ? r[1] + o : r[1]) + 4; y <= (horiz ? r[1] + o + T2 : r[3]); y += 8) if (walkC(x, y)) v++; if (v > bv || (v === bv && v > 0)) { bv = v; best = o; } }
            if (best != null && bv >= 2) e.r = horiz ? [r[0], r[1] + best, r[2], r[1] + best + T2] : [r[0] + best, r[1], r[0] + best + T2, r[3]]; } }
        /* se busca la franja más fina (desde el borde hacia adentro) que todavía se pueda pisar */
        for (const T of [20, 36, 52, 70]) { let nr = null;
          if (e.side === 'd' && h - r[3] <= 30) nr = [r[0], Math.max(r[1], h - T), r[2], h - 1]; else if (e.side === 'u' && r[1] <= 30) nr = [r[0], 0, r[2], Math.min(r[3], T)];
          else if (e.side === 'l' && r[0] <= 30) nr = [0, r[1], Math.min(r[2], T), r[3]]; else if (e.side === 'r' && w - r[2] <= 30) nr = [Math.max(r[0], w - T), r[1], w - 1, r[3]];
          if (!nr) break; let ok = 0; for (let x = nr[0] + 4; x <= nr[2]; x += 8) for (let y = nr[1] + 4; y <= nr[3]; y += 8) if (walkC(x, y)) ok++; if (ok >= 3) { const M_ = 14; e.r = e.side === 'd' ? [nr[0], Math.max(r[1], nr[1] - M_), nr[2], nr[3]] : e.side === 'u' ? [nr[0], nr[1], nr[2], Math.min(r[3], nr[3] + M_)] : e.side === 'l' ? [nr[0], nr[1], Math.min(r[2], nr[2] + M_), nr[3]] : [Math.max(r[0], nr[0] - M_), nr[1], nr[2], nr[3]]; break; } } }
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
  /* casilleros: pocos (1 en la mitad de los mapas, no en zonas seguras), en lugares fijos; premio grande; se fuerzan con ganzúas, 1 vez por día */
  let CAS = [];
  const CAPS_MAPS = ['lab', 'lab_cuarentena', 'bunker', 'centro_ork', 'arena_final', 'lezama', 'libertador'];
  function placeCaps() { if (!grid || EXP || !CAPS_MAPS.includes(mapKey)) return; const r = seeded(hashStr(mapKey) * 17 + 3); let tries = 0, n = 0;
    while (n < 1 && tries++ < 4000) { const c = (r() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if ([1, -1, GW, -GW].filter(d => grid[c + d]).length < 4) continue;
      if (Math.hypot(x - MAP.spawn[0] * WS, y - MAP.spawn[1] * WS) < 400) continue; CAS.push({ obj: true, caps: true, k: 'capsula_chica', id: 'caps:' + mapKey, nm: 'CÁPSULA', x: x / WS, y: y / WS }); n++; } }
  /* BOTÍN: mochilas, maletines y cápsulas tirados por el mapa (cambian de lugar cada día, cada uno se abre una vez por día por jugador) */
  const BOT_IMG = {};
  const BOTIN = [['mochila', 'MOCHILA', 'mochila'], ['maletin', 'MALETÍN', 'maletin'], ['caps_azul', 'CÁPSULA MÉDICA', 'caps_azul'], ['caps_roja', 'CÁPSULA DE ARMAS', 'caps_roja'], ['caps_amarilla', 'CÁPSULA DE SUMINISTROS', 'caps_amarilla'], ['caps_violeta', 'CÁPSULA DE EQUIPO', 'caps_violeta']];
  /* cápsulas de curación: fijas, cerca de los campamentos y en Puerto Madero. Curan todo (vida, estados y contagio), sin límite, salvo en plena pelea */
  const POD_MAPS = ['calle', 'muelle', 'puente', 'esperanza', 'teatroAv', 'congreso', 'pvp_centro'];
  function placePods() { if (!grid || !POD_MAPS.includes(mapKey)) return; const r = seeded(hashStr(mapKey + ':pod')); let tries = 0;
    while (tries++ < 6000) { const c = (r() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if ([1, -1, GW, -GW, GW + 1, GW - 1].filter(dd => grid[c + dd]).length < 6) continue;
      const dsp = Math.hypot(x - MAP.spawn[0] * WS, y - MAP.spawn[1] * WS); if (dsp < 250 || dsp > 1400) continue; CAS.push({ obj: true, pod: true, k: 'capsula_cura', id: 'pod:' + mapKey, nm: 'CÁPSULA DE CURACIÓN', x: x / WS, y: y / WS }); return; } }
  function usePod() { if (Date.now() - (P.lastHitT || 0) < 3000) return toast('No funciona en plena pelea: alejate un momento.');
    const mx = maxHp(lvlOf(P.xp)); P.hp = mx; P.poison = 0; P.burn = 0; P.slow = 0; P.stunT = 0; P.goo = 0; if (INV) INV.cont = 0; P.contFin = 0;
    SND.level(); buzz([40, 30, 80]); floats.push({ x: P.x, y: P.y - 200, t: 1.2, txt: '+ CURACIÓN TOTAL', c: '#7ff6f2' }); toast('La cápsula te curó por completo: vida, estados y contagio.'); hud(); persist(); }
  function placeBotin() { if (!grid || EXP || MAP.base || MAP.safeAll || MAP.mvp) return; const d = dayN(), r = seeded(hashStr(mapKey + ':bot:' + d)); const n = 2 + ((r() * 2) | 0); let tries = 0, k = 0;
    while (k < n && tries++ < 6000) { const c = (r() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if ([1, -1, GW, -GW].filter(dd => grid[c + dd]).length < 4) continue;
      if (Math.hypot(x - MAP.spawn[0] * WS, y - MAP.spawn[1] * WS) < 300 || CAS.some(o => Math.hypot(o.x * WS - x, o.y * WS - y) < 500)) continue;
      const t = BOTIN[(k + (d % 3)) % BOTIN.length]; CAS.push({ obj: true, bot: t[0], k: t[2], id: 'bot:' + mapKey + ':' + k, nm: t[1], x: x / WS, y: y / WS }); k++; } }
  function openBotin(n) { INV.cas = INV.cas || {}; if (INV.cas[n.id] === dayN()) return toast('Ya lo revisaste. Mañana puede haber otro.');
    INV.cas[n.id] = dayN(); const got = [], add = k => { const g = takeItem(k); if (g) got.push(ITEMS[g].n); };
    if (n.bot === 'mochila') { add(pickW([['vendas', 3], ['venda_q', 2], ['vendas_a', 1]])); if (Math.random() < .5) add(resolveLoot('W')); if (Math.random() < .3) add(pickW([['manzana', 2], ['cigarrillo', 1], ['pilas', 1]])); }
    else if (n.bot === 'maletin') { add(resolveLoot('W')); add(pickW([['vendas', 2], ['vendas_a', 1.2], ['antiveneno', 1]])); if (Math.random() < .35) add(pickW([['balas', 2], ['cargador', 1], ['cart_itaka', 1], ['molotov', 1], ['granada', .6]])); }
    else if (n.bot === 'caps_azul') { if (Math.random() < 2 / 3) add('jeringa'); else add(pickW([['vendas_a', 2], ['venda_q', 1]])); if (Math.random() < .25) add(pickW([['vendas', 2], ['antiveneno', 1]])); }
    else if (n.bot === 'caps_roja') { add(resolveLoot('W')); if (Math.random() < .6) add(pickW([['balas', 2], ['cargador', 1], ['cart_itaka', 1], ['virotes', .8]])); if (Math.random() < .3) add(pickW([['molotov', 1], ['granada', .7]])); }
    else if (n.bot === 'caps_amarilla') { add(pickW([['vendas', 3], ['venda_q', 2], ['vendas_a', 1]])); add(pickW([['manzana', 2], ['pilas', 1.5], ['cigarrillo', 1]])); if (Math.random() < .3) add('antiveneno'); }
    else { add(resolveLoot(pickW([['A', 2], ['C', 1.4]]))); if (Math.random() < .4) add(pickW([['vendas', 2], ['pilas', 1]])); }
    SND.pick(); buzz(30); toast(got.length ? n.nm.charAt(0) + n.nm.slice(1).toLowerCase() + ': ' + got.join(', ') + '.' : 'Estaba vacío.'); quickBtns(); persist(); }
  function placeCas() { CAS = []; placeCaps(); placeBotin(); placePods(); if (!grid || MAP.safeAll || MAP.base || EXP || hashStr(mapKey) % 2) return; const r = seeded(hashStr(mapKey) * 31 + 7); let tries = 0;
    while (CAS.length < 1 && tries++ < 4000) { const c = (r() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (inSafe(x, y) || CAS.some(o => Math.hypot(o.x * WS - x, o.y * WS - y) < 900)) continue;
      const nb = [1, -1, GW, -GW].filter(d => grid[c + d]).length; if (nb < 4) continue; CAS.push({ obj: true, cas: true, k: 'cas_' + mapKey + CAS.length, id: mapKey + ':' + CAS.length, nm: 'CASILLERO', x: x / WS, y: y / WS }); } }
  function nearCasillero() { const o = CAS.find(o => Math.hypot(o.x * WS - P.x, (o.y * WS - P.y) * 1.2) < 170); if (!o) return null; return { id: o.id, open: !!(INV.cas && INV.cas[o.id] === dayN()) }; }
  let INV = null, noInvCol = false, noBestCol = false, shake = 0; const shots = [];
  let room = 0, ch = null, lastSent = 0, lastPos = '', running = false, paused = false, warping = false, exitLock = true;
  const lvlOf = xp => Math.min(100, Math.floor(Math.sqrt(xp / 50)) + 1), xpFor = lv => 50 * (lv - 1) * (lv - 1), maxHp = lv => Math.round((100 + (lv - 1) * 12) * (P && P.jefe > 0 ? 2 : 1) * (1 + gearSum('hp'))), dmgOf = lv => 1 + Math.floor((lv - 1) / 3);

  /* =================== ARRANQUE =================== */
  /* reglas que se cambian desde Supabase (tabla game_state, k = 'reglas') sin bajar el juego de nuevo */
  const RULES = { muertePierdeNivel: false };
  async function loadRules() { try { const { data } = await sb.from('game_state').select('v').eq('k', 'reglas').maybeSingle(); if (data && data.v) Object.assign(RULES, data.v); } catch (e) {} }
  async function boot() { await loadRules();
    const { data: s } = await sb.auth.getSession(); if (!s.session) return location.replace('/index.html');
    const uid = s.session.user.id;
    const { data: prof } = await sb.from('profiles').select('id,nick,status,role,faction').eq('id', uid).maybeSingle();
    if (!prof || prof.status !== 'approved' || !prof.faction) return location.replace('/index.html');
    me = prof; document.documentElement.dataset.fac = me.faction; if (!window.CZ_OFFLINE) store.set('of-prof', JSON.stringify(prof)); else setTimeout(() => toast('MODO OFFLINE · jugás solo y tu progreso queda guardado en este teléfono.'), 3500);
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) {}
    const { data: gc, error } = await sb.from('game_chars').select('*').eq('user_id', uid).maybeSingle();
    if (error) { $('#load-t').textContent = /relation|does not exist/i.test(error.message) ? 'Falta preparar la base del juego (03_cenizas.sql). Avisale al admin.' : 'No se pudo leer tu personaje: ' + error.message; return; }
    $('#ov-load').hidden = true;
    if (!gc || !gc.look || gc.look.body == null || gc.look.fac !== me.faction) { mySkins = await loadSkins(uid, gc); creator(gc); return; }
    mySkins = await loadSkins(uid, gc);
    if (gc.look && gc.look.npc && /^pablo/.test(gc.look.npc) && !pabloOk()) delete gc.look.npc; /* nadie más usa a Pablo */
    look = gc.look; if (look.npc && !mySkins.includes(look.npc)) delete look.npc;
    await begin(gc); checkUnlocks();
  }
  /* skins: Pablo y Pol son de una cuenta; Renzo y Sam se ganan matando a Mercedes */
  let mySkins = [];
  /* los skins de Pablo son solo de Thiriang: su cuenta admin y su cuenta xhiang */
  const pabloOk = () => !!me && (me.role === 'admin' || String(me.nick || '').toLowerCase() === 'xhiang');
  async function loadSkins(uid, gc) { const set = new Set((gc && gc.inv && gc.inv.skins) || []); if (pabloOk()) { set.add('pablo4'); set.add('pabloFuturo'); }
    try { const { data } = await sb.from('game_skins').select('skin').eq('user_id', uid); (data || []).forEach(r => set.add(r.skin)); } catch (e) {}
    return [...set].filter(k => skinName(k) && (!/^pablo/.test(k) || pabloOk())); } /* los skins de Pablo son solo de la cuenta admin */
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
    look = Object.assign({ body: 0 }, pl, { fac: me.faction }); delete look.char;
    const cre = $('#cre'); cre.hidden = false; let rot = 0; const dirs = ['d', 'l', 'u', 'r'];
    if (me.faction === 'ork' && look.cls == null) look.cls = 0;
    const box = $('#opts');
    const orig = Object.assign({}, look);
    function rows() { box.querySelectorAll('.opt,.perk').forEach(e => e.remove());
      const ork = me.faction === 'ork', list = HD ? HD.roster(look.body === 1, ork, orig) : [];
      if (HD) { const ix = HD.rosterIdx(list, look); HD.pickPj(look, list[ix]); look.pjI = ix; }
      const cur = HD ? list[look.pjI] : null, fixed = cur && cur.cls != null, P_ = HD && HD.CPAL, nm = a => a.map(x => x[0]);
      const opts = [['CUERPO', 'body', () => BODY], ['PERSONAJE', 'pjI', () => list.map(r => r.nm)]];
      if (look.cu && P_) opts.push(['PIEL', 'cs', () => nm(P_.piel)], ['PELO', 'ch', () => nm(P_.pelo)], ['ROPA', 'ct', () => nm(P_.ropa)], ['PANTALÓN', 'cp', () => nm(P_.pant)]);
      if (ork) opts.push(['CLASE', 'cls', () => OCLS, fixed]);
      if (mySkins.length) opts.unshift(['ESPECIAL', 'npcI', () => ['Ninguno'].concat(mySkins.map(k => skinName(k)))]);
      look.npcI = look.npc ? mySkins.indexOf(look.npc) + 1 : 0;
      const first = box.firstChild;
      opts.forEach(([lab, k, lf, lock]) => { const L = lf(); const r = document.createElement('div'); r.className = 'opt';
        r.innerHTML = '<span>' + lab + '</span><button aria-label="anterior">‹</button><b></b><button aria-label="siguiente">›</button>';
        const bb = r.querySelector('b'); bb.textContent = L[look[k] || 0] || L[0];
        if (P_ && ['cs', 'ch', 'ct', 'cp'].includes(k)) { const pal = { cs: P_.piel, ch: P_.pelo, ct: P_.ropa, cp: P_.pant }[k]; bb.style.borderLeft = '14px solid ' + (pal[look[k] || 0] || pal[0])[1]; bb.style.paddingLeft = '6px'; }
        if (lock) { r.children[1].disabled = r.children[3].disabled = true; r.classList.add('lock'); bb.textContent += ' · fija'; }
        const ch_ = dv => { look[k] = ((look[k] || 0) + dv + L.length) % L.length;
          if (k === 'npcI') { if (look.npcI) look.npc = mySkins[look.npcI - 1]; else delete look.npc; }
          if (k === 'body') { delete look.pj; delete look.model; delete look.cu; }
          if (k === 'pjI') { HD.pickPj(look, list[look.pjI]); if (list[look.pjI].cls == null && cur && cur.cls != null) look.cls = 0; }
          rows(); draw(); };
        r.children[1].onclick = () => ch_(-1); r.children[3].onclick = () => ch_(1); box.insertBefore(r, first); });
      const pk = document.createElement('p'); pk.className = 'perk'; pk.textContent = perkText(); box.insertBefore(pk, first); }
    box.innerHTML = '';
    const go = document.createElement('button'); go.className = 'btn solid go'; go.textContent = 'ENTRAR'; box.appendChild(go); rows();
    const pv = $('#pv'), pg = pv.getContext('2d'); pg.imageSmoothingEnabled = false;
    let f = 0; draw = function () { pg.clearRect(0, 0, 240, 320); const sp = charSprite(look, dirs[rot], f, false); pg.imageSmoothingEnabled = !!sp.hd; blitChar(pg, sp, 120, 220, 5, 1.6); }
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
    if (EXP && (gc.xp || 0) < xpFor(10)) gc = Object.assign({}, gc, { xp: xpFor(10) }); /* en PvP arrancás en nivel 10 */
    const lv = lvlOf(gc.xp || 0);
    P = { x: 0, y: 0, dir: 'd', face: 1, mv: false, walkT: 0, stepT: 0, atk: 0, cd: 0, hp: maxHp(lv), xp: gc.xp || 0, kills: gc.kills || 0, hurtT: 0, inv: 0, say: '', sayT: 0, dead: false, stam: 3, tired: false };
    let inv = gc.inv && gc.inv.items ? gc.inv : null; if (!inv && !EXP) { try { inv = JSON.parse(store.get('cz-inv-' + me.id) || 'null'); } catch (e) {} }
    INV = Object.assign({ items: {}, eq: { arma: 'palo', luz: null, cara: null, brazo: null }, bat: 0 }, inv || {}); INV.eq = Object.assign({ arma: 'palo', luz: null, cara: null, brazo: null }, INV.eq || {}); INV.items = INV.items || {}; INV.dur = INV.dur || {}; INV.lost = INV.lost || {}; INV.eq.ropa = INV.eq.ropa || null; ['cabeza', 'pies', 'acc1', 'acc2'].forEach(k => { if (!(k in INV.eq)) INV.eq[k] = null; }); if (INV.eq.cara) { INV.eq.cabeza = INV.eq.cabeza || INV.eq.cara; } delete INV.eq.cara; Object.keys(INV.items).forEach(k => { if (!ITEMS[k]) delete INV.items[k]; }); Object.keys(INV.eq).forEach(k => { if (INV.eq[k] && !ITEMS[INV.eq[k]] && INV.eq[k] !== 'palo') INV.eq[k] = k === 'arma' ? 'palo' : null; }); Object.keys(INV.items).forEach(k => { if (ITEMS[k].gun && INV.dur[k] == null) INV.dur[k] = ITEMS[k].mag; }); if (INV.items.linterna > 1) INV.items.linterna = 1; { const best = {}; Object.keys(INV.items).forEach(k => { const it = ITEMS[k]; if (!it || !it.gun) return; if (INV.items[k] > 1) INV.items[k] = 1; const b = it.base; if (!best[b] || TORD[it.r] > TORD[ITEMS[best[b]].r]) best[b] = k; }); Object.keys(INV.items).forEach(k => { const it = ITEMS[k]; if (it && it.gun && best[it.base] !== k) { if (INV.eq.arma === k) INV.eq.arma = best[it.base]; delete INV.items[k]; delete INV.dur[k]; } }); } delete INV.items.botiquin; INV.coins = INV.coins || 0; INV.ab = INV.ab || []; P.best = Math.max(gc.best_xp || 0, gc.xp || 0);
    /* 2.1: reinicio de objetos y niveles (una sola vez); se conservan los personajes desbloqueados */
    /* reinicio general (lo marca el SQL en game_state 'reglas'.reset): mochila, nivel, misiones y lugar a cero */
    if (RULES.reset && INV.reset !== RULES.reset) { const sk = INV.skins; INV = { items: { vendas: 3 }, eq: { arma: 'palo', luz: null, cara: null, brazo: null, ropa: null }, bat: 0, dur: {}, lost: {}, coins: 10, ab: [], q: { cura: 'vendas', esp: null }, ver: VER, reset: RULES.reset }; if (sk) INV.skins = sk;
      P.xp = 0; P.kills = 0; P.best = 0; P.hp = maxHp(1); gc = Object.assign({}, gc, { zone: null }); setTimeout(() => toast('Reinicio general: arrancás de cero, nivel 1, en la base de tu bando.'), 1800); }
    if (INV.ver !== VER) { if (INV.ver !== '2.1') { P.xp = 0; P.kills = 0; INV.ab = []; P.hp = maxHp(1); } INV.ver = VER; gc = Object.assign({}, gc, { zone: null }); setTimeout(() => toast('THE O|F 2.1 · nivel reiniciado: arrancás en la base de tu bando.'), 1800); }
    INV.q = INV.q || { cura: 'vendas', esp: null };
    $('#h-nick').textContent = me.nick; ['#hud', '#topr', '#pads', '#hintL', '#stick'].forEach(s => $(s).hidden = false); if (EXP) $('#d-fac').hidden = true;
    document.body.classList.add('playing'); document.body.classList.toggle('ork', me.faction === 'ork'); $('#snd-b').classList.toggle('off', !SND.on); $('#m-snd').textContent = 'SONIDO: ' + (SND.on ? 'SÍ' : 'NO');
    for (let i = 0; i < 90; i++) ash.push(newAsh(true));
    const fresh = !MAPS[gc.zone]; const [hz, hp_] = home(); const zone = fresh ? hz : gc.zone;
    enterMap(zone, fresh ? hp_[0] * WS : gc.x, fresh ? hp_[1] * WS : gc.y, true);
    running = true; last = performance.now(); requestAnimationFrame(loop);
    setInterval(persist, 20000); setInterval(worldTick, 4000); worldTick(); quickBtns();
    if (STORY && window.CZ_STORY) CZ_STORY.init(API);
  }
  let yuki = null; const hordeSeen = {}, yukiSaid = {};
  function yukiPlan() { const sl = (minOfDay() / 180) | 0, d = dayN() * 8 + sl, r = seeded(d * 7919 + 13), ks = Object.keys(MAPS).filter(k => !MAPS[k].safeAll && !MAPS[k].base && !MAPS[k].mvp); return { day: d, map: ks[(r() * ks.length) | 0], start: sl * 180 + ((r() * 60) | 0) }; } /* Yuki: 8 veces por día (cada 3 horas), 2 horas cada vez */
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
  /* lo que quedó tirado en un mapa se guarda al irte y vuelve a estar si volvés (durante 20 minutos) */
  const PKC = {};
  function enterMap(k, x, y, first) { if (mapKey && mapKey !== k) { const l = pickups.filter(q => q.k !== 'suero'); if (l.length) PKC[mapKey] = { t: Date.now(), l: l.map(q => Object.assign({}, q)) }; else delete PKC[mapKey]; }
    yuki = null; loadHourly(k); 
    loadMap(k); placeCas(); setTimeout(loadClones, 1500); (NPCS[k] || []).forEach(n => { n.ox = n.oy = 0; n.tgId = null; n.mv = false; n.face = null; });
    const okPos = x && y && walkable(x, y);
    P.x = okPos ? x : MAP.spawn[0] * WS; P.y = okPos ? y : MAP.spawn[1] * WS; P.inv = 4; exitLock = true; P.exitT = 1.5;
    netMode = 'SOLO'; mobs.length = 0; parts.length = 0; floats.length = 0; pickups.length = 0;
    const nPick = MAP.safeAll ? 1 : 2, pc = PKC[k]; delete PKC[k]; if (pc && Date.now() - pc.t < 20 * 60000) pc.l.forEach(q => pickups.push(q)); else for (let i = 0; i < nPick; i++) spawnPickup();
    sueroTick(true);
    Object.keys(INV.lost).forEach(w => { if (INV.lost[w] === k) { spawnPickup(w); delete INV.lost[w]; } }); shots.length = 0; mvpEnter();
    hud(); healBtn(); abButtons();
    const z = $('#zone'); $('#zone-n').textContent = MAP.name; $('#zone-s').textContent = MAP.safeAll ? 'zona segura · acá no entran los Oscuros' : (Object.keys(wantMobs()).length ? 'Oscuros: ' + Object.keys(wantMobs()).map(m => MOB[m].name).join(' · ') : '');
    z.classList.add('on'); setTimeout(() => z.classList.remove('on'), 2600); if (!first) SND.zone();
    mshots.length = 0; clouds.length = 0; goos.length = 0; roomReady = false; isHost = true; hostId = null; Object.keys(lastDeath).forEach(k => delete lastDeath[k]);
    joinRoom(1); traps = (MAP.traps || TRAPS[k] || []).map(p => ({ x: p[0] * WS, y: p[1] * WS, cd: 0 })); tileCd = 2;
    if (STORY && window.CZ_STORY) CZ_STORY.enter(k);
  }
  function warp(e) { if (warping) return;
    /* misión del empleado: mientras el paso está en la oficina del presente, la reja de la oficina lleva ahí */
    if (STORY && window.CZ_STORY && CZ_STORY.redir) { const t = CZ_STORY.redir(e.to); if (t && MAPS[t]) { const at = arrivalOf(t, 'salida'); exitLock = true; return warpTo(t, at[0], at[1]); } }
    const dest = MAPS[e.to];
    /* puerta oxidada del Nogal: por ahora solo pasa Pablo (o el admin, para probar) */
    if (e.lock === 'pablo' && !((look && look.npc && /^pablo/.test(look.npc)) || (me && me.role === 'admin') || hasItem('llave_rift') || (INV.story && INV.story.fac === me.faction && (INV.story.done || []).some(x => x === 'r16' || x === 'v11')))) { exitLock = true; buzz(40); toast('La cerradura está oxidada. Parece que hace mucho que no se abre.'); const cx = (e.r[0] + e.r[2]) / 2 * WS, cy = (e.r[1] + e.r[3]) / 2 * WS, dx = P.x - cx, dy = P.y - cy, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 12; i++) { const nx = P.x + dx / l * 12, ny = P.y + dy / l * 12; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } return; }
    if (!dest) { exitLock = true; buzz(40); toast('Camino peligroso. No se puede avanzar.'); const cx = (e.r[0] + e.r[2]) / 2 * WS, cy = (e.r[1] + e.r[3]) / 2 * WS, dx = P.x - cx, dy = P.y - cy, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 12; i++) { const nx = P.x + dx / l * 12, ny = P.y + dy / l * 12; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } return; }
    if (STORY && window.CZ_STORY && !CZ_STORY.canWarp(e)) { exitLock = true; return; }
    if (EXP && dest.base && dest.base !== me.faction) { exitLock = true; buzz(40); return toast(dest.base === 'ork' ? 'BASE ORK · no podés pasar.' : 'BASE REBELDE · no podés pasar.'); }
    warping = true; $('#fade').classList.add('on'); persist();
    setTimeout(() => { enterMap(e.to, e.at[0] * WS, e.at[1] * WS); sendPos(true); persist(); $('#fade').classList.remove('on'); warping = false; }, 650); }
  function warpTo(k, x, y) { if (!MAPS[k]) return; warping = true; $('#fade').classList.add('on'); setTimeout(() => { enterMap(k, x != null ? x * WS : null, y != null ? y * WS : null); sendPos(true); persist(); $('#fade').classList.remove('on'); warping = false; }, 650); }
  function drawAv() { const cv = $('#h-av'); if (!cv || !look) return; const g = cv.getContext('2d'); g.clearRect(0, 0, 96, 128); let spr = null; try { spr = charSprite(look, 'd', 0, false); } catch (e) {} if (!spr) return; if (spr.hd) { g.imageSmoothingEnabled = true; g.drawImage(spr, 58, 22, 140, 186, 0, 0, 96, 128); } else { g.imageSmoothingEnabled = false; g.drawImage(spr, 0, 0, spr.width, spr.height * .7, 6, 6, 84, 116 * .9); } drawAv.ok = spr.hd ? 2 : 1; drawAv.key = JSON.stringify(look); }
  setInterval(() => { if (look && ((drawAv.ok || 0) < 2 || drawAv.key !== JSON.stringify(look))) drawAv(); }, 600); /* el retrato espera a que cargue la planilla */
  function hudCont() { const cb = $('#h-cb'); if (!cb || !INV) return; const v = Math.round(INV.cont || 0), im = (P.inmune || 0) > 0; $('#h-ct').style.width = (v * .678) + '%';
    const left = Math.max(0, Math.ceil(120 * (1 - (INV.cont || 0) / 100))), tx = im ? 'INMUNE ' + Math.ceil(P.inmune) + 's' : v ? (P.contFin > 0 ? '☣ TE ESTÁS CONVIRTIENDO' : '☣ CONTAGIADO ' + ((left / 60) | 0) + ':' + String(left % 60).padStart(2, '0')) : ''; if ($('#h-ctn').textContent !== tx) $('#h-ctn').textContent = tx;
    cb.classList.toggle('on', v > 0 || im); cb.classList.toggle('grave', v >= 70); cb.classList.toggle('inm', im); }
  function hud() { hudCont(); if ((drawAv.ok || 0) < 2 && (drawAv.n = (drawAv.n || 0) + 1) < 60 && drawAv.n % 6 === 0) drawAv(); { const nk = $('#h-nick'), t_ = me.nick + '|' + lvlOf(P.xp); if (nk && nk.dataset.v !== t_) { nk.dataset.v = t_; nk.textContent = me.nick; const e_ = document.createElement('em'); e_.textContent = 'NV ' + lvlOf(P.xp); nk.appendChild(e_); } } const lv = lvlOf(P.xp), a = xpFor(lv), b = xpFor(lv + 1); $('#h-hp').style.width = Math.max(0, P.hp / maxHp(lv) * 100) + '%'; $('#h-xp').style.width = (lv >= 100 ? 100 : Math.min(100, (P.xp - a) / (b - a) * 100)) + '%';
    $('#h-lv').textContent = 'NV ' + lv + ' · ' + (INV ? weaponLabel() : 'PALO') + ' · ' + Math.ceil(P.hp) + '/' + maxHp(lv) + (INV && INV.eq.luz ? ' · LUZ ' + Math.ceil(INV.bat) + '%' : '') + (INV && INV.eq.ropa ? ' · ESCUDO ' + (INV.dur[INV.eq.ropa] != null ? INV.dur[INV.eq.ropa] : ITEMS[INV.eq.ropa].shield) : '') + ' · ' + (INV ? INV.coins : 0) + ' monedas' + (INV && INV.ab.length ? ' · ' + INV.ab.map(a => AB[a].n).join(' · ') : '') + (suero.map ? ' · MALETÍN: ' + MAPS[suero.map].name : ''); }
  async function persist() { if (!P || !me || !look) return; if (EXP) return persistExp(); store.set('cz-inv-' + me.id, JSON.stringify(INV));
    const row = { user_id: me.id, look, zone: mapKey, x: Math.round(P.x), y: Math.round(P.y), hp: Math.max(1, Math.round(P.hp)), xp: P.xp, kills: P.kills, updated_at: new Date().toISOString() };
    P.best = Math.max(P.best || 0, P.xp); if (!noInvCol) row.inv = INV; if (!noBestCol) row.best_xp = P.best; if (!window.CZ_OFFLINE) { try { localStorage.setItem('of-char-online', JSON.stringify(Object.assign({}, row, { inv: INV }))); } catch (e) {} }
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
    hud(); }
  function sueroTaken() { suero.taken = suero.slot; suero.map = null; try { sb.from('game_state').upsert({ k: 'suero', v: { slot: suero.slot, by: me.nick }, updated_at: new Date().toISOString() }).then(() => {}, () => {}); } catch (e) {} hud(); }

  /* ---------- items ---------- */
  const curW = () => WEAP[INV && INV.eq.arma] ? INV.eq.arma : 'palo';
  function weaponLabel() { const w = curW(), it = ITEMS[w]; if (it && it.gun) return WEAP[w].n + ' ' + (INV.dur[w] != null ? INV.dur[w] : it.mag) + '/' + it.mag + ' +' + (INV.items[it.ammoK] || 0); return WEAP[w].n + (it && it.uses ? ' ' + (INV.dur[w] != null ? INV.dur[w] : it.uses) + (WEAP[w].gun ? ' tiros' : '') : ''); }
  function gunReady(w) { const it = ITEMS[w]; if (!it || !it.gun) return true; if (INV.dur[w] == null) INV.dur[w] = it.mag; if (INV.dur[w] > 0) return true;
    if (hasItem(it.ammoK)) { INV.items[it.ammoK]--; if (!INV.items[it.ammoK]) delete INV.items[it.ammoK]; INV.dur[w] = it.mag; SND.pick(); toast('Recargaste la ' + it.n.toLowerCase() + '.'); hud(); quickBtns(); return true; }
    toast('Sin munición: buscá ' + ITEMS[it.ammoK].n.toLowerCase() + '.'); P.cd = .6; return false; }
  function ownedWeapons() { return WEAPON_KEYS.filter(w => w === 'palo' || hasItem(w)); }
  function cycleWeapon() { if (!P || P.dead) return; const list = ownedWeapons(); if (list.length < 2) return toast('Solo tenés el palo. Buscá armas en los mapas.'); const i = list.indexOf(curW()); setWeapon(list[(i + 1) % list.length]); }
  function setWeapon(w) { INV.eq.arma = w; const it = ITEMS[w]; if (it && it.uses && INV.dur[w] == null) INV.dur[w] = it.uses; SND.pick(); toast('En la mano: ' + (w === 'palo' ? 'Palo' : it.n)); hud(); quickBtns(); }
  function breakItem(k) { const it = ITEMS[k]; INV.items[k] = (INV.items[k] || 1) - 1;
    if (INV.items[k] > 0) INV.dur[k] = it.shield || it.uses; else { delete INV.items[k]; delete INV.dur[k]; if (it.eq === 'ropa') { INV.eq.ropa = null; autoEquip('ropa'); } }
    const ms = Object.keys(MAPS).filter(m => m !== mapKey); const where = ms[(Math.random() * ms.length) | 0]; INV.lost[k] = where;
    SND.hurt(); toast('Se rompió: ' + it.n + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); hud(); persist(); }
  function wearWeapon() { const w = curW(), it = ITEMS[w]; if (it && it.gun) { INV.dur[w] = Math.max(0, (INV.dur[w] != null ? INV.dur[w] : it.mag) - 1); if (INV.dur[w] <= 0 && hasItem(it.ammoK)) gunReady(w); else if (INV.dur[w] <= 0) autoEquip('arma', w); hud(); return; } if (!it || !it.uses) return; if (INV.dur[w] == null) INV.dur[w] = it.uses; INV.dur[w]--;
    if (INV.dur[w] <= 0) { INV.items[w] = (INV.items[w] || 1) - 1; if (INV.items[w] > 0) INV.dur[w] = it.uses; else { delete INV.items[w]; delete INV.dur[w]; INV.eq.arma = 'palo'; autoEquip('arma'); }
      const others_ = Object.keys(MAPS).filter(m => m !== mapKey && !MAPS[m].safeAll); const where = others_[(Math.random() * others_.length) | 0]; INV.lost[w] = where;
      SND.hurt(); buzz([30, 30, 30]); toast((WEAP[w].gun ? (w === 'baston' ? 'El bastón se apagó y se rompió' : 'Se te acabaron los tiros de la ' + it.n.toLowerCase()) : 'Se rompió ' + (/lanza|katana|barra/.test(w) ? 'la ' : 'el ') + it.n.toLowerCase()) + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); persist(); }
    hud(); }
  function randomWalkCell(minDist) { for (let k = 0; k < 400; k++) { const c = (Math.random() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (Math.hypot(x - P.x, y - P.y) > minDist && !(MAP.exits || []).some(e => x / WS >= e.r[0] - 40 && x / WS <= e.r[2] + 40 && y / WS >= e.r[1] - 40 && y / WS <= e.r[3] + 40)) return [x, y]; } return null; }
  let pkSeq = 0;
  function spawnPickup(k, at, w) { if (!at && netMode === 'MULTI_CLIENT') return; const p = at || randomWalkCell(300); if (!p) return; const kk = resolveLoot(k || pickW(LOOT[mapKey] || LOOT.parque), w); if (!ITEMS[kk]) return; const pid = me.id.slice(0, 6) + '-' + (pkSeq++) + '-' + ((Math.random() * 1e4) | 0); pickups.push({ k: kk, x: p[0], y: p[1], t: Math.random() * 6, pid, loc: !at }); if (netMode !== 'SOLO') net('drop', { pid, k: kk, x: Math.round(p[0]), y: Math.round(p[1]) }); }
  function addItem(k, n) { INV.items[k] = (INV.items[k] || 0) + (n || 1); }
  function hasItem(k) { return (INV.items[k] || 0) > 0; }
  const dmgMult = () => { let m = 1; if (P.jefe > 0) m *= .5; if (INV.eq.brazo === 'b_contencion') m *= .7; if (INV.eq.cabeza === 'mascara' && /refugioSub|bunker|lab|patio/.test(mapKey)) m *= .8; m *= 1 - Math.min(.6, gearSum('def')); return m; };
  function classMult(mk) { if (!mk || me.faction !== 'ork') return 1; let m = .85; const c = (look && look.cls) || 0;
    if ((c === 0 && mk === 'perro') || (c === 1 && mk === 'corredor') || (c === 2 && mk === 'errante')) m *= .6; return m; }
  /* ---------- contagio de los Oscuros: barra 0-100. +30 pierde vida, +70 más rápido. Al morir contagiado queda tu clon Oscuro ---------- */
  /* contagio: un toque de un Oscuro y quedás contagiado (INV.cont = % de los 2 minutos que pasaron). Más golpes no lo aceleran.
     A los 2 minutos sin jeringa: si tenés más de la mitad de la vida te baja a la mitad y a los segundos morís; si ya tenías la mitad o menos, morís en el acto. */
  const CONT_MIN = 0.01, CONT_SEG = 120, CONT_FIN = 4;
  function contagiar(fuerte) { if ((P.inmune || 0) > 0 || P.dead || (INV.cont || 0) > 0) return; INV.cont = fuerte ? 50 : 0.5; P.contFin = 0; toast(fuerte ? '☣ Te contagió un Contagiado: tenés 1 minuto para usar una jeringa.' : '☣ Te contagiaste. Tenés 2 minutos para usar una jeringa.'); buzz([60, 40, 60]); hud(); }
  function contTick(dt) { if (P.dead || !INV) return; if (P.inmune > 0) P.inmune -= dt; const cv = INV.cont || 0; if (cv <= 0) return;
    if (inSafe(P.x, P.y) && !(P.contFin > 0)) return; /* en zona segura la cuenta se frena */
    if (P.contFin > 0) { P.contFin -= dt; if (Math.random() < dt * 6) parts.push({ x: P.x + rnd(-16, 16), y: P.y - rnd(40, 160), vx: 0, vy: -26, life: .8, s: 3, c: 270 }); if (P.contFin <= 0) { P.hp = 1; hitPlayer(999, null, 0, null, 'contagio'); } return; }
    const was = cv; INV.cont = Math.min(100, cv + dt * 100 / CONT_SEG);
    if (was < 50 && INV.cont >= 50) toast('☣ Te queda 1 minuto de contagio.'); else if (was < 84 && INV.cont >= 84) toast('☣ ¡20 segundos! Usá una jeringa.');
    if (INV.cont >= 100) { const mx = maxHp(lvlOf(P.xp)); P.slow = Math.max(P.slow || 0, 1);
      if (P.hp > mx / 2) { P.hp = Math.floor(mx / 2); P.contFin = CONT_FIN; floats.push({ x: P.x, y: P.y - 200, t: 1.2, txt: '☣ EL CONTAGIO TE CONSUME', c: '#c070ff' }); buzz([200, 80, 200]); hud(); }
      else { P.hp = 1; hitPlayer(999, null, 0, null, 'contagio'); } } }
  /* ---------- CLONES: cualquier muerte deja un clon Oscuro con todas tus cosas (no las de misión).
     Queda guardado en el mapa hasta que alguien lo mata y se queda con todo (también vos).
     Las cosas de misión te las guarda Mary (rebeldes) o Mercedes (ORK), que además te dan un kit. ---------- */
  const isMision = k => { const it = ITEMS[k]; return !!it && (/^(Historia|Misiones|Pista)/.test(it.t || '') || k === 'pagina' || k === 'brz_ork' || k === 'brz_reb'); };
  const MODE = () => STORY ? 'h' : 'x';
  function cloneLook() { const lk = {}; ['pj', 'npc', 'body', 'model', 'cls', 'cu', 'cs', 'ch', 'ct', 'cp', 'skin', 'hair', 'hcol', 'top', 'pant', 'fac'].forEach(k => { if (look && look[k] != null) lk[k] = look[k]; }); return lk; }
  async function dejarClon() { if (!INV || MAP.safeAll || MAP.mvp) return; const lk = cloneLook(), loot = {}, held = INV.held || {};
    Object.entries(INV.items || {}).forEach(([k, n]) => { if (!(n > 0) || !ITEMS[k]) return; if (isMision(k)) held[k] = (held[k] || 0) + n; else loot[k] = n; });
    const back = { items: INV.items, eq: INV.eq, q: INV.q, held: INV.held };
    INV.held = held; INV.items = {}; INV.eq = { arma: 'palo', luz: null, cara: null, brazo: null, ropa: null }; if (INV.q) Object.keys(INV.q).forEach(sl => INV.q[sl] = null); INV.kitPend = true;
    const p = { cl: lk, cn: me.nick, x: Math.round(P.x), y: Math.round(P.y), lvl: lvlOf(P.xp) };
    if (Object.keys(loot).length) { try { const { data, error } = await sb.from('game_clones').insert({ owner: me.id, nick: me.nick, mode: MODE(), map: mapKey, x: p.x, y: p.y, lvl: p.lvl, look: lk, items: loot }).select('id').single(); if (error || !data) throw error || 0; p.cid = data.id; }
      catch (e) { Object.assign(INV, back); INV.kitPend = false; } } /* si no se pudo guardar el clon, no perdés nada */
    if (EXP && INV.kitPend) { const H = INV.held || {}; INV.held = {}; Object.entries(H).forEach(([k, c]) => addItem(k, c)); setTimeout(() => giveKit({ k: me.faction === 'ork' ? 'mercedes' : 'mary', nm: me.faction === 'ork' ? 'MERCEDES' : 'MARY' }), 1500); } /* en PvP no hay base con Mary/Mercedes: el kit llega solo */
    persist(); quickBtns(); if (isHost) spawnClon(p); else net('clon', p); }
  function spawnClon(p) { if (p.cid && mobs.some(o => o.cid === p.cid)) return; const o = spawnMob('clon', 0, [p.x, p.y]); if (!o) return; o.cl = p.cl; o.cn = p.cn; o.cid = p.cid || null; o.alpha = 1; needFull = true; }
  async function loadClones() { if (!isHost || MAP.safeAll) return; const mk0 = mapKey; try { const { data } = await sb.from('game_clones').select('id,nick,x,y,lvl,look').eq('mode', MODE()).eq('map', mapKey).order('created_at', { ascending: false }).limit(8);
      if (mapKey !== mk0) return; (data || []).forEach(r => spawnClon({ cid: r.id, cn: r.nick, cl: r.look || {}, x: r.x, y: r.y, lvl: r.lvl })); } catch (e) {} }
  async function claimClone(cid, nick) { try { const { data, error } = await sb.rpc('claim_clone', { cid }); if (error || !data) return; const got = []; Object.entries(data).forEach(([k, n]) => { if (ITEMS[k] && n > 0) { addItem(k, n); got.push(ITEMS[k].n + (n > 1 ? ' x' + n : '')); } });
      if (got.length) { SND.level(); buzz([40, 30, 80]); banner('BOTÍN DEL CLON', (nick ? 'De ' + nick + ': ' : '') + got.slice(0, 6).join(', ') + (got.length > 6 ? '…' : ''), 4200, '#c99bff'); quickBtns(); persist(); } } catch (e) {} }
  /* kit de Mary / Mercedes al volver a la base después de morir */
  const KIT_LINE = { mary: 'Por mi hijo haría lo mismo. Tomá, y volvé a levantarte.', mercedes: 'Quizás me esté equivocando… pero no nos rendiremos.' };
  function giveKit(n) { if (!INV.kitPend) return false; INV.kitPend = false; const held = INV.held || {}; INV.held = {};
    [['chaleco', 1], ['katana', 1], ['vendas', 3], ['antiveneno', 1], ['casco', 1], ['mascara', 1], ['jeringa', 1]].forEach(([k, c]) => addItem(k, c));
    Object.entries(held).forEach(([k, c]) => addItem(k, c));
    if (INV.eq.arma === 'palo') setWeapon('katana'); if (!INV.eq.ropa) { INV.eq.ropa = 'chaleco'; INV.dur.chaleco = ITEMS.chaleco.shield; } if (!INV.eq.cabeza) INV.eq.cabeza = 'casco'; if (!INV.eq.cara) INV.eq.cara = 'mascara';
    npcSay(n, KIT_LINE[n.k] || 'Tomá. Seguí.'); setTimeout(() => toast('Kit de supervivencia: chaleco, katana, casco, máscara, vendas, antiveneno y nanocura' + (Object.keys(held).length ? '. Y te devolvieron tus cosas de misión.' : '.')), 1200);
    SND.level(); quickBtns(); hud(); persist(); return true; }
  function hitPlayer(d, knockFrom, knock, byId, mk, melee) { if (P.dead || P.inv > 0 || P.furia > 0 || (!byId && inSafe(P.x, P.y))) return false; if (d < 999) P.lastHitT = Date.now();
    if (!byId && mk && d < 999 && MOB[mk]) { if (MOB[mk].burn && !(P.burn > 0)) { P.burn = 5; toast('¡Te prendiste fuego! 5 segundos de quemadura (la venda para quemaduras lo corta).'); } if (MOB[mk].poison && !(P.poison > 0)) { P.poison = 25; toast('Te envenenaron. Usá antiveneno.'); } }
    if (melee && !byId && mk && d < 999 && MOB[mk] && !MOB[mk].passive && !MOB[mk].npc && !MOB[mk].fac) contagiar(MOB[mk].cont); /* solo contagian los Oscuros que pegan cuerpo a cuerpo */
    if (P.goo > 0) d *= 2; if (P.stunT > 0 && mk && MOB[mk] && MOB[mk].mvp) d *= 2.5;
    if (mk && MOB[mk] && MOB[mk].pois5 && d < 999) { P.poison = Math.max(P.poison || 0, 5); P.poisonK = MOB[mk].pois5; }
    d = Math.max(1, Math.round(d * dmgMult() * classMult(mk || (knockFrom && knockFrom.kind) || (byId ? null : 'oscuro'))));
    P.lastHitT = performance.now(); if (P.gorro) { P.gorro = 0; P.ghost = 0; toast('Te pegaron: volviste a aparecer.'); }
    const rk = INV.eq.ropa; if (rk && ITEMS[rk]) { if (INV.dur[rk] == null) INV.dur[rk] = ITEMS[rk].shield; const take = Math.min(INV.dur[rk], d); INV.dur[rk] -= take; d -= take;
      if (take > 0) floats.push({ x: P.x + 26, y: P.y - 210, t: .8, txt: 'escudo -' + take, c: '#a9b4c0' }); if (INV.dur[rk] <= 0 && !ITEMS[rk].epic) breakItem(rk); else if (INV.dur[rk] < 0) INV.dur[rk] = 0; }
    if (ITEMS[INV.eq.ropa] && ITEMS[INV.eq.ropa].espinas && knockFrom && knockFrom.T && knockFrom.hp > 0) mobFx(knockFrom, { dot: 5, dps: 6 + lvlOf(P.xp) / 4, c: 'p' });
    P.hp -= d; P.hurtT = .3; SND.hurt(); buzz(knock ? [60, 30, 60] : 40); shake = Math.max(shake, knock ? .35 : .15);
    floats.push({ x: P.x, y: P.y - 190, t: .9, txt: '-' + d, c: '#ff6a5c' });
    if (knock && knockFrom) { const dx = P.x - knockFrom.x, dy = P.y - knockFrom.y, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 6; i++) { const nx = P.x + dx / l * knock / 6, ny = P.y + dy / l * knock / 6; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } }
    if (P.hp <= 0) { const wasC = true; P.hp = 0; P.dead = true; buzz([80, 60, 160]); dejarClon(); cleanse(true);
      /* MUNDO: si te mata un jugador o un jefe no perdés nivel; si te mata un Oscuro volvés al 1 */
      const byBoss = !byId && mk && MOB[mk] && MOB[mk].boss, rescued = me.faction === 'ork' ? 'ORK te rescató y te curaron.' : 'Los rebeldes te ayudaron y te volvieron a curar.';
      /* 2.1: en la HISTORIA no se pierde nivel, salvo 3 muertes seguidas (-1 nivel). En PvP nunca. */
      let keep = true, minus = false; if (EXP) { const L0 = lvlOf(P.xp), nl = Math.max(1, L0 - (2 + ((Math.random() * 3) | 0))); if (nl < L0) { minus = true; keep = false; P.lostLv = L0; P.xp = xpFor(nl); } }
      if (STORY) { INV.racha = (INV.racha || 0) + 1; if (INV.racha >= 3 && lvlOf(P.xp) > 1) { INV.racha = 0; keep = false; minus = true; P.lostLv = lvlOf(P.xp); P.xp = xpFor(P.lostLv - 1); } }
      let lostAb = 0; P.jefe = 0; if (window.CZ_STORY && STORY) CZ_STORY.died();
      if (byId) { const who = (others.get(byId) || {}).nick || 'alguien'; $('#ov-dead').querySelector('p').textContent = 'Te derribó ' + who + '. Tu clon quedó con tus cosas. ' + (keep ? rescued : homeText()); net('died', { id: me.id, by: byId }); }
      else $('#ov-dead').querySelector('p').textContent = (mk === 'contagio' ? 'El contagio te consumió. ' : byBoss ? MOB[mk].name + ' te derribó. ' : 'La ceniza te cubrió. ') + (wasC ? 'Tu clon Oscuro quedó en ' + MAP.name.toLowerCase() + ' con tus cosas: el que lo mate se las queda. Hablá con ' + (me.faction === 'ork' ? 'Mercedes' : 'Mary') + ' en la base. ' : '') + (byBoss || keep ? rescued : homeText());
      $('#d-lv').textContent = minus ? (EXP ? 'Caíste en el PvP: bajás del nivel ' : 'Tercera caída seguida: bajás del nivel ') + P.lostLv + ' al ' + lvlOf(P.xp) + '.' : 'No perdiste nivel: seguís en el ' + lvlOf(P.xp) + '.' + (STORY && INV.racha ? ' (Caídas seguidas: ' + INV.racha + '/3)' : '');
      sendPos(true); persist(); if (MAP.mvp) banner('CAÍSTE', 'Esperá que alguien te reviva', 4000, '#ff5a6a'); else setTimeout(() => $('#ov-dead').hidden = false, 700); }
    hud(); return true; }

  /* PvP: al morir a manos de otro jugador se te cae un objeto común */
  function pvpDrop() { const k = ['suero', 'pilas', 'campera', 'chaleco'].find(k => hasItem(k) && INV.eq.ropa !== k && k !== 'vendas'); if (!k) return; INV.items[k]--; if (!INV.items[k]) delete INV.items[k];
    const pid = me.id.slice(0, 6) + Date.now(); pickups.push({ k, x: P.x, y: P.y, t: 0, pid }); net('drop', { pid, k, x: Math.round(P.x), y: Math.round(P.y) }); persist(); }
  const enemy = o => o && o.fac && o.fac !== me.faction && !o.dead && !o.iv && !(MAP && MAP.mvp); /* en el evento de MVP nadie se pega con nadie */

  /* mochila */
  let invSel = null;
  function openInv() { if (!running || P.dead) return; paused = true; $('#ov-inv').hidden = false; renderInv(); }
  function closeInv() { paused = false; $('#ov-inv').hidden = true; healBtn(); persist(); }
  function renderInv() {
    const eqName = k => k ? (k === 'palo' ? 'Palo' : ITEMS[k].n) : '—';
    $('#inv-eq').onclick = e => { const sp = e.target.closest('[data-s]'); if (!sp) return; const sl = sp.dataset.s; if (sl === 'arma') setWeapon('palo'); else INV.eq[sl] = null; hud(); renderInv(); };
    const col = k => k && ITEMS[k] && ITEMS[k].r ? ' style="color:' + RAR[ITEMS[k].r][1] + '"' : '';
    $('#inv-eq').innerHTML = [['arma', 'ARMA'], ['cabeza', 'CABEZA'], ['ropa', 'ROPA'], ['brazo', 'BRAZO'], ['pies', 'PIES'], ['acc1', 'ACC 1'], ['acc2', 'ACC 2'], ['luz', 'LUZ']].map(([s_, l_]) => { const ek = s_ === 'luz' ? (INV.eq.luz ? 'linterna' : null) : INV.eq[s_], src_ = ek && ICONS[ek] && ICONS[ek].src ? ICONS[ek].src : ''; return '<span data-s="' + s_ + '" class="' + (ek ? 'full' : '') + '"' + (ek && ITEMS[ek] && ITEMS[ek].r ? ' style="--rc:' + RAR[ITEMS[ek].r][1] + '"' : '') + '>' + (src_ ? '<img src="' + src_ + '" alt="">' : '') + '<u>' + l_ + '</u> <b' + col(INV.eq[s_]) + '>' + (s_ === 'luz' ? (INV.eq.luz ? 'Linterna ' + Math.ceil(INV.bat) + '%' : '—') : eqName(INV.eq[s_])) + (s_ === 'ropa' && INV.eq.ropa && ITEMS[INV.eq.ropa] ? ' ' + Math.ceil(INV.dur[INV.eq.ropa] != null ? INV.dur[INV.eq.ropa] : ITEMS[INV.eq.ropa].shield) : '') + '</b></span>'; }).join('');
    const box = $('#inv-slots'); box.innerHTML = ''; const keys = Object.keys(ITEMS).filter(k => hasItem(k));
    if (!keys.length) box.innerHTML = '<div class="empty">La mochila está vacía. Buscá cosas brillando en el piso.</div>';
    keys.sort((a, b) => TORD[tierOf(b)] - TORD[tierOf(a)]); keys.forEach(k => { const b = document.createElement('button'); b.setAttribute('aria-pressed', invSel === k); if (Object.values(INV.eq).includes(k)) b.classList.add('on'); if (ITEMS[k].r && ITEMS[k].r !== 'g') { b.style.borderColor = RAR[ITEMS[k].r][1]; b.style.boxShadow = 'inset 0 0 10px ' + RAR[ITEMS[k].r][1] + '66'; }
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48; { const g_ = cv.getContext('2d'), ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; g_.drawImage(ic, 0, 0, 48, 48); } b.appendChild(cv);
      if (INV.items[k] > 1) { const i = document.createElement('i'); i.textContent = INV.items[k]; b.appendChild(i); }
      if (Object.values(INV.eq).includes(k)) { const u = document.createElement('em'); u.textContent = 'EN USO'; b.appendChild(u); }
      b.onclick = () => { invSel = k; if (ITEMS[k].eq) useItem(k, 'eq'); else renderInv(); }; box.appendChild(b); });
    const det = $('#inv-det'); const QS = Object.values(NPCS).flat().filter(n => n.quest && (INV.quests_seen || {})[n.quest.id] && !(INV.quests || {})[n.quest.id]);
    const diario = QS.length ? '<p><b>MISIONES</b><br>' + QS.map(n => n.nm + ': ' + Object.entries(n.quest.need).map(([k, c]) => ITEMS[k].n + ' ' + Math.min(c, INV.items[k] || 0) + '/' + c).join(', ')).join('<br>') + '</p>' : '';
    if (!invSel || !hasItem(invSel)) { det.innerHTML = diario + '<p>Tocá un objeto para ver qué hace.</p>'; return; }
    const it = ITEMS[invSel]; let act = '';
    if (it.hab || it.act) act = '<button class="btn solid" data-a="' + (it.eq ? 'eq' : 'use') + '">' + (it.eq ? (Object.values(INV.eq).includes(invSel) ? 'SACAR' : 'EQUIPAR') : 'USAR') + '</button><button class="btn" data-a="h">' + ((INV.q || {}).hab === invSel ? 'SACAR DE HABILIDAD' : 'PONER EN HABILIDAD') + '</button>';
    else if (it.use === 'heal' || it.use === 'venda' || it.use === 'kitsune' || it.use === 'furia' || it.use === 'comer' || it.use === 'jefe' || it.use === 'leer' || it.use === 'fumar' || it.use === 'vida' || it.use === 'radar' || it.use === 'volver' || it.use === 'forzar' || it.use === 'trampa' || it.use === 'antiveneno' || it.use === 'vendaq' || it.use === 'jeringa') { const sl = QUICK_HEAL.includes(it.use) ? 'cura' : 'esp', on = (INV.q || {})[sl] === invSel; act = '<button class="btn solid" data-a="use">USAR</button><button class="btn" data-a="q">' + (on ? 'SACAR DEL ACCESO RÁPIDO' : sl === 'cura' ? 'PONER EN CURA RÁPIDA' : 'PONER EN ESPECIAL RÁPIDO') + '</button>'; }
    if (it.use === 'pilas') act = '<button class="btn solid" data-a="use">CARGAR LINTERNA</button>';
    if (it.use === 'luz') act = '<button class="btn solid" data-a="use">' + (INV.eq.luz ? 'APAGAR' : 'PRENDER') + '</button><button class="btn" data-a="q">' + ((INV.q || {}).esp === invSel ? 'SACAR DEL ACCESO RÁPIDO' : 'PONER EN ESPECIAL RÁPIDO') + '</button>';
    if (it.eq && it.use !== 'luz' && !it.act) { const on = it.eq === 'acc' ? (INV.eq.acc1 === invSel || INV.eq.acc2 === invSel) : INV.eq[it.eq] === invSel; act = '<button class="btn solid" data-a="eq">' + (on ? (it.eq === 'arma' ? 'GUARDAR Y USAR EL PALO' : it.eq === 'luz' ? 'APAGAR' : 'SACAR') : (it.eq === 'luz' ? 'PRENDER' : it.eq === 'arma' ? 'TENER EN LA MANO' : 'EQUIPAR')) + '</button>'; }
    if (it.use && !it.eq && it.use !== 'pilas') act += '<button class="btn" data-a="x">' + ((INV.q || {}).x === invSel ? 'SACAR DEL 4º ACCESO' : 'PONER EN 4º ACCESO') + '</button>';
    if (invSel !== 'palo' && !/^Historia/.test(it.t)) act += '<button class="btn" data-a="drop">TIRAR</button>';
    det.innerHTML = '<b' + (it.r ? ' style="color:' + RAR[it.r][1] + '"' : '') + '>' + it.n + (INV.items[invSel] > 1 ? ' ×' + INV.items[invSel] : '') + '</b><small>' + it.t.toUpperCase() + (it.gun ? ' · CARGADOR ' + (INV.dur[invSel] != null ? INV.dur[invSel] : it.mag) + '/' + it.mag + ' · RECARGAS ' + (INV.items[it.ammoK] || 0) : '') + (it.uses ? ' · ' + (invSel === 'pistola' ? 'TIROS ' : 'USOS ') + (INV.dur[invSel] != null ? INV.dur[invSel] : it.uses) + '/' + it.uses : '') + (it.shield ? ' · QUEDA ' + (INV.dur[invSel] != null ? INV.dur[invSel] : it.shield) + '/' + it.shield : '') + '</small><p>' + it.d + '</p>' + (act ? '<div class="row">' + act + '</div>' : '');
    det.querySelectorAll('[data-a]').forEach(b => b.onclick = () => useItem(invSel, b.dataset.a)); }
  function useItem(k, a) { const it = ITEMS[k]; const lv = lvlOf(P.xp);
    if (a === 'drop') { if (!hasItem(k)) return; INV.items[k]--; if (!INV.items[k]) { delete INV.items[k]; Object.keys(INV.eq).forEach(sl => { if (INV.eq[sl] === k) INV.eq[sl] = sl === 'arma' ? 'palo' : null; }); if (INV.q) Object.keys(INV.q).forEach(sl => { if (INV.q[sl] === k) INV.q[sl] = null; }); }
      const fx = P.dir === 'l' ? -1 : P.dir === 'r' ? 1 : 0, fy = P.dir === 'u' ? -1 : P.dir === 'd' ? 1 : 0; let dx_ = P.x + fx * 110, dy_ = P.y + fy * 90; if (!walkable(dx_, dy_)) { dx_ = P.x; dy_ = P.y; }
      const pid = me.id.slice(0, 6) + Date.now(); pickups.push({ k, x: dx_, y: dy_, t: 0, pid, cool: 2.5 }); net('drop', { pid, k, x: Math.round(dx_), y: Math.round(dy_) }); SND.pick(); toast('Tiraste ' + it.n + '. Queda en el piso.'); renderInv(); quickBtns(); hud(); persist(); return; }
    if (a === 'use' && it.use === 'heal') { if (P.hp >= maxHp(lv)) return toast('Ya estás con la vida completa. Guardalo.'); P.hp = maxHp(lv); INV.items[k]--; SND.level(); toast(k === 'kit' ? 'Usaste el kit. Vida completa.' : 'Abriste el maletín. Vida completa.'); }
    if (a === 'use' && it.use === 'venda') { useVenda(k); renderInv(); return; }
    if (a === 'use' && it.use === 'comer') { const lv_ = lvlOf(P.xp); if (P.hp >= maxHp(lv_)) return toast('No tenés hambre.'); P.hp = Math.min(maxHp(lv_), P.hp + 15); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; SND.pick(); hud(); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'furia') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); P.furia = 10; SND.level(); buzz([60, 40, 120]); shake = .4; toast('FURIA · 10 segundos invencible y pegás el doble.'); persist(); return; }
    if (a === 'use' && it.use === 'kitsune') { closeInv(); useKitsune(); return; }
    if (a === 'use' && it.use === 'jefe') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); P.jefe = 60; P.hp = maxHp(lvlOf(P.xp)); SND.level(); buzz([80, 40, 160]); shake = .5; toast('PODER DE JEFE · 60 segundos: doble vida, mitad de daño, pegás más fuerte.'); hud(); persist(); return; }
    if (a === 'x') { const q = INV.q = INV.q || {}; q.x = q.x === k ? null : k; quickBtns(); renderInv(); return; }
    if (a === 'h') { const q = INV.q = INV.q || {}; q.hab = q.hab === k ? null : k; quickBtns(); renderInv(); return; }
    if (a === 'use' && it.use === 'veloz') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.fast = Math.max(P.fast || 0, it.s); P.potion = 1; SND.level(); toast('¡Poción! ' + it.s + ' segundos volando.'); quickBtns(); hud(); persist(); if (!$('#ov-inv').hidden) renderInv(); return; }
    if (a === 'use' && it.use === 'tirar') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInvQuiet(); throwIt(k); quickBtns(); persist(); return; }
    if (a === 'q') { const q = INV.q = INV.q || {}; const slot = QUICK_HEAL.includes(it.use) ? 'cura' : 'esp'; q[slot] = q[slot] === k ? null : k; quickBtns(); renderInv(); return; }
    if (a === 'use' && it.use === 'leer') { const L = LORE[(INV.leidas = (INV.leidas || 0) + 1) % LORE.length]; INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.xp += 40 + lvlOf(P.xp) * 6; toast('Cuaderno: "' + L + '"'); SND.pick(); hud(); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'fumar') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.hp = Math.max(1, P.hp - 8); P.smoke = 20; toast('Fumaste. Te falta el aire: vas más lento un rato.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'vida') { if (P.hp >= maxHp(lv)) return toast('No tenés sed.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.hp = Math.min(maxHp(lv), P.hp + 40); P.fast = 8; SND.pick(); toast('Agua filtrada: +40 de vida y piernas livianas por 8 segundos.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'descuento') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; INV.descT = Date.now() + 600000; toast('Credencial mostrada: 10 minutos con 30% de descuento en las tiendas.'); renderInv(); persist(); return; }
    if (a === 'use' && it.use === 'volver') { INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; closeInv(); const [hz, hp_] = home(); toast('El fragmento se parte. Todo se dobla…'); warpTo(hz, hp_[0], hp_[1]); persist(); return; }
    if (a === 'use' && it.use === 'trampa') { if (EXP && MAP.safeAll || inSafe(P.x, P.y)) return toast('Acá no se pueden poner trampas.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; const tp = { m: mapKey, id: me.id.slice(0, 4) + Date.now().toString(36), x: Math.round(P.x), y: Math.round(P.y), fac: me.faction, by: me.id, t: Date.now() }; ptraps.push(tp); net('trap', tp); SND.pick(); toast('Trampa puesta. El otro bando sólo ve una marquita.'); closeInv(); persist(); return; }
    if (a === 'use' && it.use === 'jeringa') { if (!(INV.cont > 0) && !it.hp) return toast('No estás contagiado. Guardala.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; INV.cont = 0; P.contFin = 0; P.inmune = Math.max(P.inmune || 0, it.imm); if (it.hp) P.hp = Math.min(maxHp(lvlOf(P.xp)), P.hp + it.hp); SND.pick(); buzz(30);
      toast('Contagio curado.' + (it.imm >= 120 ? ' No te contagiás por 2 minutos.' : '')); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'antiveneno') { if (!(P.poison > 0)) return toast('No estás envenenado. Guardalo.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.poison = 0; SND.pick(); toast('El veneno se cortó.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'vendaq') { if (!(P.burn > 0) && P.hp >= maxHp(lv)) return toast('No estás quemado. Guardala.'); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; P.burn = 0; P.hp = Math.min(maxHp(lv), P.hp + 15); SND.pick(); toast('Venda para quemaduras: se apagó el ardor.'); hud(); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'forzar') { const cz = nearCasillero(); if (!cz) return toast('Usalas al lado de un CASILLERO (hay en algunos mapas, bien escondidos).'); if (cz.open) return toast('Ese casillero ya lo abriste hoy.'); INV.cas = INV.cas || {}; INV.cas[cz.id] = dayN(); INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; addItem('vendas', 3); const jx = Math.random() < .25 ? 'jeringa_max' : 'jeringa'; addItem(jx); const x_ = pickW([['chaleco_t', 1.4], ['armadura', 1.2], ['katana', 1], ['escopeta', 1], ['metralleta', .8], ['lanzallamas', .4]]); addItem(x_); SND.pick(); toast('¡Casillero forzado! 3 vendas, ' + ITEMS[jx].n + ' y ' + ITEMS[x_].n + '.'); renderInv(); quickBtns(); persist(); return; }
    if (a === 'use' && it.use === 'radar') { if ((INV.radarT || 0) > Date.now()) return toast('El receptor se está recargando.'); INV.radarT = Date.now() + 60000; const m_ = []; if (suero.map) { m_.push('Maletín de curación: ' + MAPS[suero.map].name + ' (seguí la flecha)'); guide = { map: suero.map, k: 'suero', until: Date.now() + 180000 }; } closeInv(); if (hordeOn(mapKey)) m_.push('HORDA en este mapa'); Object.entries(bossesToday()).forEach(([mk, bk]) => { if (bossAlive(bk)) m_.push('JEFE ' + MOB[bk].name + ' · ' + MAPS[mk].name); });
      if (STORY) { const y_ = yukiPlan(); if (minOfDay() >= y_.start && minOfDay() < y_.start + 120) m_.push('Yuki: ' + MAPS[y_.map].name); } if (EXP && yukiPvp()) m_.push('Yuki está en las ruinas'); toast('RECEPTOR · ' + (m_.join(' · ') || 'Nada raro en el aire.')); return; }
    if (a === 'use' && it.use === 'luz') { if (!INV.eq.luz && INV.bat <= 0) { if (!hasItem('pilas')) return toast('La linterna no tiene pilas.'); INV.items.pilas--; if (!INV.items.pilas) delete INV.items.pilas; INV.bat = 100; } INV.eq.luz = INV.eq.luz ? null : 'linterna'; toast(INV.eq.luz ? 'Linterna prendida.' : 'Linterna apagada.'); hud(); quickBtns(); if (!$('#ov-inv').hidden) renderInv(); return; }
    if (a === 'use' && it.use === 'pilas') { if (!hasItem('linterna')) return toast('Primero necesitás una linterna.'); INV.bat = 100; INV.items[k]--; toast('Linterna cargada.'); }
    if (a === 'eq' && slot_is_weapon(k)) { if (INV.eq.arma === k) setWeapon('palo'); else setWeapon(k); }
    else if (a === 'eq' && it.eq === 'acc') { if (INV.eq.acc1 === k && !(INV.eq.acc2 !== k && INV.items[k] > 1 && false)) INV.eq.acc1 = null; else if (INV.eq.acc2 === k) INV.eq.acc2 = null; else if (!INV.eq.acc1) INV.eq.acc1 = k; else if (!INV.eq.acc2) INV.eq.acc2 = k; else { INV.eq.acc1 = INV.eq.acc2; INV.eq.acc2 = k; } toast(INV.eq.acc1 === k || INV.eq.acc2 === k ? 'Te pusiste: ' + it.n : 'Te sacaste: ' + it.n); }
    else if (a === 'eq') { const slot = it.eq; if (INV.eq[slot] === k) INV.eq[slot] = slot === 'arma' ? 'palo' : null; else { INV.eq[slot] = k; if (ITEMS[k].shield && INV.dur[k] == null) INV.dur[k] = ITEMS[k].shield; if (k === 'linterna' && INV.bat <= 0) { if (hasItem('pilas')) { INV.items.pilas--; INV.bat = 100; } else { INV.eq.luz = null; toast('La linterna no tiene pilas.'); } } } }
    if (a === 'eq' && !slot_is_weapon(k) && it.eq !== 'luz' && it.eq !== 'acc') toast(INV.eq[it.eq] === k ? 'Te pusiste: ' + it.n : 'Te sacaste: ' + it.n);
    if (!INV.items[k]) { delete INV.items[k]; if (invSel === k) invSel = null; }
    hud(); renderInv(); }
  /* ---------- botón de HABILIDAD: épicos con poder, granadas, molotov, pociones ---------- */
  function habOk(k) { const it = ITEMS[k]; if (!it) return false; if (it.act) return Object.values(INV.eq).includes(k); return hasItem(k) && !!it.hab; }
  function habAuto() { const eqAct = Object.values(INV.eq).find(k => k && ITEMS[k] && ITEMS[k].act); if (eqAct) return eqAct; return ['granada', 'molotov', 'pocion_n', 'pocion_p', 'pocion_a', 'pocion'].find(hasItem) || null; }
  function closeInvQuiet() { if (!$('#ov-inv').hidden) { $('#ov-inv').hidden = true; paused = false; } }
  function useHab() { if (!INV || !P || P.dead || paused) return; const q = INV.q = INV.q || {}; if (!q.hab || !habOk(q.hab)) q.hab = habAuto(); const k = q.hab; if (!k) return toast('No tenés habilidad. Poné una granada, una poción o un objeto ÉPICO desde la MOCHILA.');
    const it = ITEMS[k]; if (!it.act) return useItem(k, 'use');
    INV.habT = INV.habT || {}; const left = (INV.habT[k] || 0) - Date.now(); if (left > 0) return toast(it.n + ': vuelve en ' + Math.ceil(left / 1000) + ' s.');
    const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir], near = (r) => mobs.filter(m => m.hp > 0 && !m.T.passive && Math.hypot(m.x - P.x, m.y - P.y) < r).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
    if (it.act === 'dormir') { const o = near(700); if (!o) return toast('No hay nadie cerca para dormir.'); mobFx(o, { stun: 5, k: 'zz' }); floats.push({ x: o.x, y: o.y - o.T.h - 20, t: 1.4, txt: 'Zzz', c: '#9fd8ff' }); SND.mob('whisper', .3); }
    else if (it.act === 'clon') { P.clone = { t: 5, x: P.x - (fx[0] || .7) * 90, y: P.y - (fx[1] || 0) * 60 + (fx[0] ? 0 : 40) }; floats.push({ x: P.x, y: P.y - 220, t: 1, txt: 'CLON', c: '#ffd890' }); SND.level(); }
    else if (it.act === 'invis') { P.ghost = 999; P.gorro = 1; sendPos(true); toast('Desapareciste. Si pegás o te pegan, volvés a aparecer.'); SND.mob('whisper', .3); }
    else if (it.act === 'lagrima') { shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 620, vy: fx[1] * 620 * .8, life: 1, dmg: Math.max(1, playerDmg() * .6), tear: 1, fx: { stun: 5, k: 'frz' } }); SND.shot(); }
    else if (it.act === 'una') { shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 650, vy: fx[1] * 650 * .8, life: 1.1, dmg: playerDmg() * 1.3, fire: 1, heal: .08, fx: { dot: 5, dps: playerDmg() * .9, c: 'f' } }); SND.shot(); }
    INV.habT[k] = Date.now() + it.cd * 1000; quickBtns(); }
  /* granadas y molotov: vuelan en arco y caen donde mirás */
  const throws = [], fireZones = [];
  function throwIt(k) { const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir]; const dist = 330; let tx = P.x + fx[0] * dist, ty = P.y + fx[1] * dist * .8;
    for (let i = 10; i > 0 && !walkable(tx, ty); i--) { tx = P.x + fx[0] * dist * i / 10; ty = P.y + fx[1] * dist * .8 * i / 10; }
    throws.push({ k, x0: P.x, y0: P.y, x1: tx, y1: ty, t: 0, T: .75, dmg: playerDmg() }); SND.swing(); net('throw', { k, x0: Math.round(P.x), y0: Math.round(P.y), x1: Math.round(tx), y1: Math.round(ty) }); }
  function landThrow(th, mine) { const { x1: x, y1: y } = th; shake = Math.max(shake, th.k === 'granada' ? .5 : .2);
    if (th.k === 'granada') { fx('explosion', x, y - 70, { w: 330, T: .55, grow: .2 }); SND.shot(); buzz([40, 20, 60]); for (let i = 0; i < 40; i++) parts.push({ x: x + rnd(-30, 30), y: y - rnd(0, 40), vx: rnd(-260, 260), vy: rnd(-260, 20), life: rnd(.4, .9), s: rnd(3, 7), c: Math.random() < .5 ? 220 : 60 });
      if (mine) mobs.slice().forEach(o => { if (o.hp <= 0 || o.T.passive) return; const d = Math.hypot(o.x - x, (o.y - y) * 1.3); if (d < 230) { const l = d || 1; hitMob(o, Math.round(th.dmg * 5 + 25), (o.x - x) / l * 40, (o.y - y) / l * 40, { stun: .6 }); } });
      if (Math.hypot(P.x - x, (P.y - y) * 1.3) < 180 && !mine) hitPlayer(20, { x, y }, 120); }
    else { fireZones.push({ x, y, r: 170, t: 5, tk: 0, mine, dmg: th.dmg }); SND.mob('hiss', .3); } }
  function gearTick(dt) {
    if (P.regen && P.regen.left > 0) { const st = Math.min(dt, P.regen.left); P.regen.left -= st; P.hp = Math.min(maxHp(lvlOf(P.xp)), P.hp + P.regen.rate * st); if (Math.random() < dt * 6) parts.push({ x: P.x + rnd(-20, 20), y: P.y - rnd(40, 160), vx: 0, vy: -40, life: .6, s: 3, c: 140 }); hud(); }
    const rk = INV.eq.ropa; if (rk && ITEMS[rk] && ITEMS[rk].regen && performance.now() - (P.lastHitT || 0) > 8000 && INV.dur[rk] < ITEMS[rk].shield) { INV.dur[rk] = ITEMS[rk].shield; floats.push({ x: P.x, y: P.y - 220, t: 1, txt: 'escudo lleno', c: '#a9e0ff' }); }
    if (P.clone && P.clone.t > 0) P.clone.t -= dt;
    if (!(P.fast > 0)) P.potion = 0;
    for (let i = throws.length - 1; i >= 0; i--) { const th = throws[i]; th.t += dt; if (th.t >= th.T) { throws.splice(i, 1); landThrow(th, !th.remote); } }
    for (let i = fireZones.length - 1; i >= 0; i--) { const z = fireZones[i]; z.t -= dt; z.tk -= dt; if (Math.random() < dt * 30) parts.push({ x: z.x + rnd(-z.r, z.r) * .8, y: z.y + rnd(-z.r, z.r) * .35, vx: rnd(-10, 10), vy: rnd(-120, -60), life: rnd(.3, .7), s: rnd(3, 6), c: 220 });
      if (z.tk <= 0) { z.tk = .5; if (z.mine) mobs.slice().forEach(o => { if (o.hp > 0 && !o.T.passive && Math.hypot(o.x - z.x, (o.y - z.y) * 1.5) < z.r) hitMob(o, Math.max(2, Math.round(z.dmg * 1.1)), 0, 0); });
        else if (Math.hypot(P.x - z.x, (P.y - z.y) * 1.5) < z.r) hitPlayer(6, null, 0); }
      if (z.t <= 0) fireZones.splice(i, 1); }
    /* lágrima: si está congelado por vos y estás cerca, le robás vida */
    mobs.forEach(o => { if (o.frzBy === me.id && o.stunT > 0 && Math.hypot(o.x - P.x, o.y - P.y) < 260) { o.drk = (o.drk || 0) - dt; if (o.drk <= 0) { o.drk = .5; const d = Math.max(2, Math.round(playerDmg() * .5)); hitMob(o, d, 0, 0); P.hp = Math.min(maxHp(lvlOf(P.xp)), P.hp + d); hud(); } } });
    if (INV.habT && Object.values(INV.habT).some(v => v > Date.now() - 1500) && (gearTick.c = (gearTick.c || 0) + dt) > .5) { gearTick.c = 0; quickBtns(); } }
  function gearDraw(c, W2S, zoom, t) {
    fireZones.forEach(z => { const [x, y] = W2S(z.x, z.y); if (drawFxImg(c, 'fuego_piso', x, y - 30 * zoom, z.r * 2.1 * zoom, 0, Math.min(1, z.t) * (.85 + Math.sin(performance.now() / 90 + z.x) * .15), false)) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, z.r * zoom); g.addColorStop(0, 'rgba(255,160,40,' + (.35 * Math.min(1, z.t)) + ')'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, z.r * zoom, z.r * .45 * zoom, 0, 0, 7); c.fill(); c.restore(); });
    throws.forEach(th => { const k = th.t / th.T, x_ = th.x0 + (th.x1 - th.x0) * k, y_ = th.y0 + (th.y1 - th.y0) * k - Math.sin(k * Math.PI) * 160 - 90; const [x, y] = W2S(x_, y_); const ic = iconOf(th.k); c.save(); c.translate(x, y); c.rotate(t * 10); try { c.drawImage(ic, -16 * zoom, -16 * zoom, 32 * zoom, 32 * zoom); } catch (e) {} c.restore(); });
    mobs.forEach(o => { if (!(o.stunT > 0) && !(o.dot && o.dot.t > 0)) return; const [x, y] = W2S(o.x, o.y - o.T.h - 18);
      if (o.stunT > 0) { if (o.stunK === 'frz') { const [bx, by] = W2S(o.x, o.y); if (!drawFxImg(c, 'hielo_piso', bx, by - 10 * zoom, 190 * zoom, 0, .9, false)) { c.fillStyle = 'rgba(150,220,255,.25)'; c.fillRect(bx - 40 * zoom, by - o.T.h * zoom * .9, 80 * zoom, o.T.h * zoom * .9); } }
        c.fillStyle = o.stunK === 'zz' ? '#9fd8ff' : o.stunK === 'frz' ? '#c8f0ff' : o.stunK === 'para' ? '#c090ff' : '#ffe070'; c.font = 'bold ' + Math.round(20 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center';
        if (o.stunK === 'zz') c.fillText('Z z z', x, y); else if (o.stunK === 'frz') c.fillText('❄', x, y); else for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillText('★', x + Math.cos(a) * 26 * zoom, y + Math.sin(a) * 8 * zoom); } }
      if (o.dot && o.dot.t > 0) { c.fillStyle = o.dot.c === 'f' ? 'rgba(255,140,40,.9)' : 'rgba(120,230,90,.9)'; c.font = Math.round(16 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillText(o.dot.c === 'f' ? '🔥' : '☠', x + 34 * zoom, y + 14 * zoom); } });
  }
  /* ======================= LIBRETAS Y MVPs =======================
     Libreta de Pablo (casa de Pablo, con la historia terminada): El Come Sueños · El Hombre de Galera · La Bruja Podrida.
     Libreta de Sofía (9 de Julio, con alguna pista de Pablo): La Dama Triste · El Demonio del Palo.
     Elegís uno y todos los del mapa viajan con vos. Uno por día. Los caídos quedan en el piso hasta que alguien los reviva. */
  const MVPS = {
    cs: { kind: 'mvp_cs', map: 'mvp_hospital', lib: 'pablo', n: 'EL COME SUEÑOS', pista: 'una torre rota', drops: [['chaleco_cs', .12], ['ojo_desc', .12]],
      txt: 'Pega, salta y grita. Si grita y no estás detrás de una camilla, quedás aturdido y te destroza.' },
    galera: { kind: 'mvp_galera', map: 'mvp_cementerio', lib: 'pablo', n: 'EL HOMBRE DE GALERA', pista: 'una calle con verdes y cortos caminos', drops: [['baston_oscuro', .12], ['gorro_desap', .12]],
      txt: 'Casi invisible. Deja galeras: rompelas. Si junta 3, aparece atrás de alguien y lo mata de un golpe.' },
    bruja: { kind: 'mvp_bruja', map: 'mvp_callejon', lib: 'pablo', n: 'LA BRUJA PODRIDA', pista: 'la sangre de la traidora', drops: [['ropa_distinta', .12], ['baston_resina', .12]],
      txt: 'Lenta, pero tira mocos que envenenan. Si hay moco en el piso y están juntos, se carga y le roba el alma a uno. Sepárense.' },
    dama: { kind: 'mvp_dama', map: 'mvp_santuario', lib: 'sofia', n: 'LA DAMA TRISTE', drops: [['anillo_lagrimas', .1], ['anillo_una', .1], ['espada_lamentos', .035]],
      txt: 'Azul: llora y congela. Roja: se enoja y quema. Si estás prendido fuego te roba la vida. Contra el hielo, quédense de a 3 juntos.' },
    demonio: { kind: 'mvp_demonio', map: 'mvp_patio', lib: 'sofia', n: 'EL DEMONIO DEL PALO', drops: [['palo_destino', .1], ['zapatos_fauno', .1], ['daga_demonio', .1]],
      txt: 'El más difícil. Quema alrededor, deja clones y a veces desaparece dejando fuegos: súbanse a uno antes de que explote todo.' } };
  const MVP_BY_MAP = {}; Object.entries(MVPS).forEach(([k, v]) => MVP_BY_MAP[v.map] = k);
  const LIBS = { pablo: { map: 'casa_pablo', nm: 'LIBRETA DE PABLO', img: '/a/ob/libreta_pablo.png', list: ['cs', 'galera', 'bruja'] }, sofia: { map: 'nueveJulio', nm: 'LIBRETA DE SOFÍA', img: '/a/ob/libreta_sofia.png', list: ['dama', 'demonio'] } };
  const MB = { art: 'jefe', aura: '255,40,60', pw: 30, ph: 44, sp: 150, wsp: 60, sight: 2400, wind: .35, cd: .9, reach: 95, heavy: true, boss: true, mvp: true, respawn: 99999999, coins: 300, xp: 40000, snd: 'roar', ai: 'mvp' };
  MOB.mvp_cs = Object.assign({}, MB, { name: 'EL COME SUEÑOS', sheet: 'mvp_cs', hp: 3000, dmg: 55, sp: 175 });
  MOB.mvp_galera = Object.assign({}, MB, { name: 'EL HOMBRE DE GALERA', sheet: 'mvp_galera', hp: 2500, dmg: 50, ph: 48, sp: 140, aura: '170,120,255' });
  MOB.mvp_bruja = Object.assign({}, MB, { name: 'LA BRUJA PODRIDA', sheet: 'mvp_bruja', hp: 2800, dmg: 45, sp: 80, aura: '140,220,60', pspeed: 380, fdmg: 30, pois5: 25 });
  MOB.mvp_dama = Object.assign({}, MB, { name: 'LA DAMA TRISTE', sheet: 'mvp_dama', hp: 3200, dmg: 52, ph: 46, sp: 150, aura: '120,180,255' });
  MOB.mvp_demonio = Object.assign({}, MB, { name: 'EL DEMONIO DEL PALO', sheet: 'mvp_demonio', hp: 4400, dmg: 70, ph: 48, pw: 34, sp: 165, aura: '255,110,30' });
  MOB.mvp_clon = Object.assign({}, MB, { name: 'CLON', sheet: 'mvp_demonio', hp: 120, dmg: 40, boss: false, mvp: false, clon: true, sp: 200, xp: 0, coins: 0, aura: '255,110,30' });
  const SKN = [null, 'mvp_cs_grito', 'mvp_cs_salto', 'mvp_galera_humo', 'mvp_galera_golpe', 'mvp_bruja_poder', 'mvp_bruja_salto', 'mvp_dama_azul', 'mvp_dama_roja', 'mvp_dama_humo', 'mvp_demonio_humo', 'mvp_demonio_fuego'];
  /* camillas del hospital (detrás de una, el grito no te aturde) */
  const CAMILLAS = [[350, 240], [840, 230], [1220, 230], [130, 480], [560, 480], [1090, 480], [1550, 480], [520, 720], [1110, 720]];
  let mvpObjs = [], mvpEv = null; const mvpSeen = {};
  const storyFin = () => !!(INV && INV.story && INV.story.fac === me.faction && (INV.story.finSeen || (INV.story.done || []).some(x => x === 'r16' || x === 'v11')));
  function libNpcs() { if (EXP) return []; const out = []; Object.entries(LIBS).forEach(([lk, L]) => { if (mapKey !== L.map) return; const [sx, sy] = MAP.spawn; let x = sx + 110, y = sy - 30; if (!walkable(x * WS, y * WS)) { x = sx - 110; } if (!walkable(x * WS, y * WS)) { x = sx; y = sy - 90; }
      out.push({ obj: 1, lib: lk, k: 'libreta_' + lk, nm: L.nm, x, y }); }); return out; }
  function banner(txt, sub, ms, col) { const b = $('#mvp-ban'); if (!b) return; b.innerHTML = '<b' + (col ? ' style="color:' + col + '"' : '') + '>' + txt + '</b>' + (sub ? '<small>' + sub + '</small>' : ''); b.hidden = false; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); clearTimeout(banner.t); banner.t = setTimeout(() => b.hidden = true, ms || 2200); }
  function openLib(lk) { const L = LIBS[lk]; if (!storyFin()) return toast(L.nm + ': las páginas están pegadas con ceniza. Terminá la historia para poder abrirla.');
    if (lk === 'sofia' && !(INV.mvpPistas || []).length) return toast('LIBRETA DE SOFÍA: tiene un candado de sangre. Las pistas de la libreta de Pablo te dicen cómo abrirlo.');
    paused = true; const ov = $('#ov-lib'); ov.hidden = false; ov.dataset.lib = lk; const done = INV.mvpDay === dayN(); const box = ov.querySelector('.libl'); box.innerHTML = '';
    const det = ov.querySelector('.libd'); const pick = mk => { const M = MVPS[mk], won = (INV.mvpWon || {})[mk]; box.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mk === mk));
      det.innerHTML = '<img src="/a/ob/mvp_' + mk + '.webp" alt=""><b>' + M.n + '</b><small>' + M.txt + '</small>' + (won ? '<em>VENCIDO ×' + won + '</em>' : '') + (M.pista && won ? '<em>PISTA: "' + M.pista + '"</em>' : '');
      const go = document.createElement('button'); go.className = 'libgo'; go.textContent = done ? 'HASTA MAÑANA' : 'ENFRENTAR'; go.disabled = done; go.onclick = () => { closeLib(); startMvp(mk); }; det.appendChild(go); };
    L.list.forEach(mk => { const b = document.createElement('button'); b.dataset.mk = mk; b.setAttribute('aria-label', MVPS[mk].n); b.onclick = () => pick(mk); box.appendChild(b); });
    pick(L.list[0]);
    ov.querySelector('.libn').textContent = done ? 'Ya venciste a un MVP hoy. Si otro jugador abre la libreta, podés ir con él.' : 'Todos los que estén en este mapa vienen con vos.' + ((INV.mvpPistas || []).length ? ' Pistas: ' + INV.mvpPistas.join(' · ') : ''); }
  function closeLib() { $('#ov-lib').hidden = true; paused = false; }
  function startMvp(mk) { if (INV.mvpDay === dayN()) return; net('mvpgo', { mk, from: mapKey, by: me.nick }); goMvp(mk, me.nick); }
  function goMvp(mk, by) { const M = MVPS[mk]; if (!M || !MAPS[M.map]) return; INV.mvpBack = { map: mapKey, x: Math.round(P.x / WS), y: Math.round(P.y / WS) }; persist(); banner(M.n, by === me.nick ? 'Abriste la libreta…' : by + ' abrió la libreta…', 2400, '#ff5a6a'); SND.mob('roar', .4); setTimeout(() => warpTo(M.map), 900); }
  function mvpBack(msg) { const b = INV.mvpBack || { map: LIBS[MVPS[MVP_BY_MAP[mapKey]] ? MVPS[MVP_BY_MAP[mapKey]].lib : 'pablo'].map }; if (P.dead) { P.dead = false; P.hp = maxHp(lvlOf(P.xp)); $('#ov-dead').hidden = true; } P.hp = Math.max(P.hp, maxHp(lvlOf(P.xp)) * .6); if (msg) toast(msg); mvpEv = null; warpTo(b.map, b.x, b.y); }
  /* al entrar a un mapa de MVP */
  function mvpEnter() { mvpObjs = []; mvpEv = MAP.mvp ? { mk: MVP_BY_MAP[mapKey], t: 0, spawned: false, over: false } : null; if (mvpEv) { const M = MVPS[mvpEv.mk]; setTimeout(() => banner(M.n, M.txt, 4200, '#ff5a6a'), 700); } }
  function fxOn(pl, fx) { if (pl.me) applyPfx(fx); else net('pfx', { to: pl.id, fx }); }
  function applyPfx(fx) { if (P.dead) return; if (fx.stun) { P.stunT = Math.max(P.stunT || 0, fx.stun); P.slow = Math.max(P.slow || 0, fx.stun); if (fx.k === 'frz') { toast('¡Congelado!'); window.__fxP = { k: 'hielo_piso', x: P.x, y: P.y, t: 0, T: fx.stun, ang: 0, grow: 0, w: 200 }; fxs.push(window.__fxP); } else toast('¡Aturdido!'); }
    if (fx.burn) P.burn = Math.max(P.burn || 0, fx.burn); if (fx.slow) P.slow = Math.max(P.slow || 0, fx.slow);
    if (fx.half) { const mh = maxHp(lvlOf(P.xp)); if (P.hp < mh * .3) hitPlayer(99999, null, 0, null, fx.mk || 'mvp_dama'); else { const d = Math.round(P.hp / 2); P.hp -= d; floats.push({ x: P.x, y: P.y - 200, t: 1, txt: '-' + d + ' HIELO', c: '#bfefff' }); hud(); } } }
  const objNet = () => net('mvpo', { o: mvpObjs.map(o => [o.id, o.t, Math.round(o.x), Math.round(o.y), o.hp || 0]) });
  function addObj(t, x, y, hp) { const o = { id: (Math.random() * 1e9) | 0, t, x, y, hp }; mvpObjs.push(o); objNet(); return o; }
  /* romper galeras: cualquier golpe cerca */
  function hitObjs(range) { mvpObjs.filter(o => o.t === 'galera').forEach(o => { if (Math.hypot(o.x - P.x, (o.y - P.y) * 1.3) < range + 40) { floats.push({ x: o.x, y: o.y - 60, t: .6, txt: '¡CRAC!', c: '#d8c8ff' }); if (isHost) breakObj(o.id); else net('mvpx', { id: o.id }); } }); }
  function breakObj(id) { const o = mvpObjs.find(q => q.id === id); if (!o) return; o.hp = (o.hp || 1) - 1; if (o.hp <= 0) { mvpObjs.splice(mvpObjs.indexOf(o), 1); for (let i = 0; i < 12; i++) parts.push({ x: o.x, y: o.y - 20, vx: rnd(-90, 90), vy: rnd(-120, -20), life: .6, s: 4, c: 40 }); } objNet(); }
  const near2 = (a, b, r) => Math.hypot(a.x - b.x, (a.y - b.y) * 1.2) < r;
  function behindCamilla(p, o) { return CAMILLAS.some(([cx, cy]) => { const bx = cx * WS, by = cy * WS; if (Math.hypot(p.x - bx, p.y - by) > 190) return false;
      const vx = p.x - o.x, vy = p.y - o.y, L2 = vx * vx + vy * vy || 1, tt = Math.max(0, Math.min(1, ((bx - o.x) * vx + (by - o.y) * vy) / L2)); return Math.hypot(o.x + vx * tt - bx, o.y + vy * tt - by) < 120 && tt > .35; }); }
  function moveMob(o, tx, ty, sp, dt) { const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy) || 1; if (d < 6) { o.moving = false; return; } const nx = o.x + dx / d * sp * dt, ny = o.y + dy / d * sp * dt; let mv = false;
    if (mobWalk(nx, o.y)) { o.x = nx; mv = true; } if (mobWalk(o.x, ny)) { o.y = ny; mv = true; } o.moving = mv; if (Math.abs(dx) > 8) o.face = dx < 0 ? -1 : 1; }
  /* IA de los MVPs (solo el anfitrión) */
  function mvpAI(o, dt, live, strikeOn_) { const T = o.T; o.t += dt; o.alpha = Math.min(1, o.alpha + dt); o.hurt = Math.max(0, o.hurt - dt); o.cd = Math.max(0, o.cd - dt); o.lunge = Math.max(0, o.lunge - dt * 3); o.chasing = true;
    o.A = o.A || { t1: 6, t2: 12, t3: 20, act: null, at: 0 }; const A = o.A; A.t1 -= dt; A.t2 -= dt; A.t3 -= dt; if (A.at > 0) A.at -= dt;
    let tg = null, bd = 1e9; live.forEach(p => { const d = Math.hypot(p.x - o.x, p.y - o.y); if (d < bd) { bd = d; tg = p; } });
    const hpK = o.hp / (o.mhp || T.hp), hit = (p, d, kn) => strikeOn_(p, d, o, kn), melee = () => { if (!tg) return; if (bd < T.reach + 30) { if (o.cd <= 0) { o.cd = T.cd; o.lunge = 1; SND.mob('roar', .15); hit(tg, T.dmg, 40); } o.moving = false; } else moveMob(o, tg.x, tg.y, T.sp * (A.fast > 0 ? 1.7 : 1), dt); };
    if (A.fast > 0) A.fast -= dt;
    o.sk = null;
    if (!live.length) { o.moving = false; return; }
    if (o.kind === 'mvp_cs') {
      if (A.act === 'grito') { o.sk = SKN[1]; o.moving = false; if (A.at <= 0) { A.act = null; shake = .6; SND.mob('roar', .6); fx('onda', o.x + 60, o.y - 140, { w: 520, T: .7, grow: .5 }); net('mvpban', { t: '¡GRITO!', c: '#ffb070' });
          live.forEach(p => { if (behindCamilla(p, o)) { if (p.me) floats.push({ x: P.x, y: P.y - 220, t: 1.2, txt: 'A SALVO', c: '#9fe0b0' }); return; } fxOn(p, { stun: 3.2, vuln: 1 }); }); A.fast = 5; } return; }
      if (A.act === 'salto') { o.sk = SKN[2]; const k = 1 - A.at / .8; o.x = A.x0 + (A.x1 - A.x0) * k; o.y = A.y0 + (A.y1 - A.y0) * k; if (A.at <= 0) { A.act = null; shake = .5; for (let i = 0; i < 30; i++) parts.push({ x: o.x + rnd(-60, 60), y: o.y, vx: rnd(-160, 160), vy: rnd(-120, -10), life: .6, s: 5, c: 70 }); live.forEach(p => { if (near2(p, o, 190)) hit(p, T.dmg * 1.4, 120); }); } return; }
      if (A.t2 <= 0) { A.t2 = hpK < .5 ? 9 : 13; A.act = 'grito'; A.at = 1.6; net('mvpban', { t: '¡VA A GRITAR!', s: 'Escondete detrás de una camilla', c: '#ffb070' }); banner('¡VA A GRITAR!', 'Escondete detrás de una camilla', 1600, '#ffb070'); return; }
      if (A.t1 <= 0 && tg && bd > 160) { A.t1 = rnd(5, 8); A.act = 'salto'; A.at = .8; A.x0 = o.x; A.y0 = o.y; let x1 = tg.x, y1 = tg.y; if (!mobWalk(x1, y1)) { x1 = o.x; y1 = o.y; } A.x1 = x1; A.y1 = y1; return; }
      return melee(); }
    if (o.kind === 'mvp_galera') { o.vis = .55;
      const hats = mvpObjs.filter(q => q.t === 'galera');
      if (A.act === 'finale') { o.sk = SKN[3]; o.vis = .2; o.moving = false; if (A.at <= 0) { A.act = null; const v = A.vic; if (v) { const bx = v.x - 70, by_ = v.y; if (mobWalk(bx, by_)) { o.x = bx; o.y = by_; } o.sk = SKN[4]; hit(v, 99999, 60); } mvpObjs = mvpObjs.filter(q => q.t !== 'galera'); objNet(); } return; }
      if (hats.length >= 3) { A.act = 'finale'; A.at = 1.4; A.vic = live[(Math.random() * live.length) | 0]; net('mvpban', { t: 'FINALE!', c: '#d080ff', big: 1 }); banner('FINALE!', null, 1800, '#d080ff'); SND.mob('roar', .7); shake = .4; return; }
      if (A.t1 <= 0) { A.t1 = hpK < .5 ? 5 : 7; const p = live[(Math.random() * live.length) | 0], q = randomNear(p.x, p.y, 420); if (q && mobWalk(q[0], q[1])) { addObj('galera', q[0], q[1], 2); SND.mob('whisper', .3); } }
      if (A.t2 <= 0 && tg) { A.t2 = 9; o.sk = SKN[3]; const q = randomNear(tg.x, tg.y, 200); if (q && mobWalk(q[0], q[1])) { o.x = q[0]; o.y = q[1]; } }
      return melee(); }
    if (o.kind === 'mvp_bruja') {
      const goo = goos.length > 0, groups = live.filter(p => live.some(q => q !== p && near2(p, q, 300)));
      if (A.act === 'poder') { o.sk = SKN[5]; o.moving = false; if (A.at <= 0) { const cand = live.filter(p => live.some(q => q !== p && near2(p, q, 300)));
          if (cand.length) { const v = cand[(Math.random() * cand.length) | 0]; A.act = 'salto'; A.at = .6; A.x0 = o.x; A.y0 = o.y; A.x1 = v.x; A.y1 = v.y; A.vic = v; net('mvpban', { t: 'TE ROBA EL ALMA', c: '#a0ff60' }); }
          else { A.act = null; net('mvpban', { t: 'SE LE ESCAPÓ EL ALMA', c: '#a0ff60' }); banner('SE LE ESCAPÓ EL ALMA', null, 1400, '#a0ff60'); } } return; }
      if (A.act === 'salto') { o.sk = SKN[6]; const k = 1 - A.at / .6; o.x = A.x0 + (A.x1 - A.x0) * k; o.y = A.y0 + (A.y1 - A.y0) * k; if (A.at <= 0) { A.act = null; if (A.vic && near2(A.vic, o, 140)) hit(A.vic, 99999, 0); } return; }
      if (A.t3 <= 0 && goo && groups.length >= 2) { A.t3 = 18; A.act = 'poder'; A.at = groups.length >= 3 ? 1.6 : 2.4; net('mvpban', { t: '¡SE ESTÁ CARGANDO!', s: '¡Sepárense!', c: '#a0ff60' }); banner('¡SE ESTÁ CARGANDO!', '¡Sepárense!', 1800, '#a0ff60'); SND.mob('hiss', .5); return; }
      if (A.t1 <= 0 && tg) { A.t1 = hpK < .5 ? 1.6 : 2.4; o.lunge = .6; fireMob(o, tg, 'moco'); if (hpK < .6) fireMob(o, tg, 'moco', .25); }
      return melee(); }
    if (o.kind === 'mvp_dama') {
      if (A.mode == null) { A.mode = 'azul'; A.sw = 10; } A.sw -= dt; if (A.sw <= 0 && !A.act) { A.mode = A.mode === 'azul' ? 'roja' : 'azul'; A.sw = 10; net('mvpban', { t: A.mode === 'azul' ? 'LLORA…' : 'SE ENOJA', c: A.mode === 'azul' ? '#8fd0ff' : '#ff6060' }); }
      o.sk = A.mode === 'azul' ? SKN[7] : SKN[8];
      if (A.act === 'robo') { o.sk = SKN[9]; o.moving = false; if (A.at <= 0) { const v = A.vic; A.act = 'hielo'; A.at = 1.3; if (v) { const q = [v.x + 80, v.y]; if (mobWalk(q[0], q[1])) { o.x = q[0]; o.y = q[1]; } hit(v, T.dmg * 2.2, 0); o.hp = Math.min(o.mhp || T.hp, o.hp + T.dmg * 4); floats.push({ x: o.x, y: o.y - 260, t: 1, txt: '+VIDA', c: '#ff8080' }); } A.mode = 'azul'; A.sw = 8; net('mvpban', { t: 'VA A CONGELAR', s: 'Júntense de a 3', c: '#8fd0ff' }); } return; }
      if (A.act === 'hielo') { o.sk = SKN[7]; o.moving = false; if (A.at <= 0) { A.act = null; const v = A.vic || tg; if (v) { const n = live.filter(p => near2(p, v, 170)).length; shake = .3;
            if (n >= 3) { net('mvpban', { t: 'HIELO BLOQUEADO', c: '#bfefff' }); banner('HIELO BLOQUEADO', null, 1200, '#bfefff'); } else fxOn(v, { half: 1, stun: 3, k: 'frz', mk: o.kind }); } } return; }
      const burning = live.find(p => p.me ? P.burn > 0 : (others.get(p.id) || {}).burn);
      if (A.t3 <= 0 && burning) { A.t3 = 14; A.act = 'robo'; A.at = .7; A.vic = burning; return; }
      if (A.t2 <= 0 && tg && A.mode === 'azul') { A.t2 = 11; A.act = 'hielo'; A.at = 1.4; A.vic = tg; net('mvpban', { t: 'VA A CONGELAR', s: 'Júntense de a 3', c: '#8fd0ff' }); banner('VA A CONGELAR', 'Júntense de a 3', 1400, '#8fd0ff'); return; }
      if (tg && bd < T.reach + 30 && o.cd <= 0) { o.cd = T.cd; o.lunge = 1; hit(tg, T.dmg, 30); fxOn(tg, A.mode === 'roja' ? { burn: 5 } : { slow: 2 }); o.moving = false; return; }
      if (tg) moveMob(o, tg.x, tg.y, T.sp, dt); return; }
    if (o.kind === 'mvp_demonio') {
      A.au = (A.au || 0) - dt; if (A.au <= 0) { A.au = .5; live.forEach(p => { if (near2(p, o, 210)) hit(p, 9, 0); }); }
      if (A.act === 'humo') { o.sk = SKN[10]; o.vis = Math.max(0, o.vis - dt * 2); o.moving = false; if (A.at <= 0) { A.act = A.boom ? 'cuenta' : null; A.at = 5; o.vis = A.boom ? 0 : 1; if (A.boom) { net('mvpban', { t: '¡SUBITE A UN FUEGO!', s: '5 segundos', c: '#ffa040', big: 1 }); banner('¡SUBITE A UN FUEGO!', '5 segundos', 2200, '#ffa040'); } } return; }
      if (A.act === 'cuenta') { o.vis = 0; o.moving = false; const s = Math.ceil(A.at); if (s !== A.ls) { A.ls = s; net('mvpban', { t: String(s), c: '#ffa040', big: 1 }); banner(String(s), null, 900, '#ffa040'); }
        if (A.at <= 0) { A.act = null; o.vis = 1; o.sk = SKN[11]; shake = .9; SND.shot(); const fires = mvpObjs.filter(q => q.t === 'fuego'); live.forEach(p => { if (!fires.some(f => near2(p, f, 95))) hit(p, 99999, 0); }); mvpObjs = mvpObjs.filter(q => q.t !== 'fuego'); objNet(); for (let i = 0; i < 60; i++) parts.push({ x: o.x + rnd(-600, 600), y: o.y + rnd(-300, 300), vx: rnd(-40, 40), vy: rnd(-200, -60), life: rnd(.4, 1), s: rnd(4, 8), c: 220, fire: 1 }); } return; }
      if (A.t3 <= 0) { A.t3 = hpK < .5 ? 16 : 22; A.act = 'humo'; A.at = 1.2; A.boom = Math.random() < .55; mvpObjs = mvpObjs.filter(q => q.t !== 'fuego'); live.forEach(p => { const q = randomNear(p.x, p.y, 380) || [p.x, p.y]; addObj('fuego', q[0], q[1], 0); }); return; }
      if (A.t2 <= 0 && tg) { A.t2 = 12; [-1, 1].forEach(s => { const c_ = spawnMob('mvp_clon', 0, [o.x + s * 120, o.y]); if (c_) { c_.ttl = 4; c_.chasing = true; c_.alpha = .8; } }); }
      return melee(); }
  }
  function mvpTick(dt) { if (!mvpEv || !MAP.mvp) return; mvpEv.t += dt;
    const boss = mobs.find(o => o.T.mvp);
    if (isHost && !mvpEv.spawned && mvpEv.t > 3 && roomReady !== false) { mvpEv.spawned = true; if (!boss) { const M = MVPS[mvpEv.mk]; const [sx, sy] = MAP.spawn, q = [sx * WS, (sy - 160) * WS]; const o = spawnMob(M.kind, 0, mobWalk(q[0], q[1]) ? q : null); if (o) { o.chasing = true; o.alpha = 0; } } }
    if (boss) mvpEv.seen = true;
    /* clones: duran 4 segundos */
    if (isHost) mobs.slice().forEach(o => { if (o.T.clon) { o.ttl = (o.ttl || 4) - dt; if (o.ttl <= 0) { const i = mobs.indexOf(o); if (i >= 0) mobs.splice(i, 1); } } });
    /* fuegos del Demonio: queman si los pisás fuera de la cuenta */
    mvpObjs.forEach(f => { if (f.t === 'fuego' && Math.random() < dt * 14) parts.push({ x: f.x + rnd(-40, 40), y: f.y + rnd(-14, 14), vx: rnd(-10, 10), vy: rnd(-140, -60), life: rnd(.3, .6), s: rnd(3, 6), c: 220, fire: 1 }); });
    /* todos caídos: se termina */
    if (P.dead && !mvpEv.over) { const anyAlive = [...others.values()].some(o => !o.dead); mvpEv.deadT = (mvpEv.deadT || 0) + dt; if (!anyAlive && mvpEv.deadT > 3) { mvpEv.over = true; banner('CAYERON TODOS', 'La libreta los devuelve…', 3000, '#ff5a6a'); setTimeout(() => mvpBack('El MVP ganó esta vez.'), 3200); } } else if (!P.dead) mvpEv.deadT = 0;
    /* revivir: botón cuando estás al lado de un caído */
    const dn = [...others.entries()].find(([id, o]) => o.dead && Math.hypot(o.x - P.x, (o.y - P.y) * 1.2) < 140); mvpEv.rev = dn ? dn[0] : null; }
  function mvpWon(kind) { if (!mvpEv || mvpEv.over) return; const mk = Object.keys(MVPS).find(k => MVPS[k].kind === kind); if (!mk) return; mvpEv.over = true; const M = MVPS[mk];
    INV.mvpDay = dayN(); INV.mvpWon = INV.mvpWon || {}; INV.mvpWon[mk] = (INV.mvpWon[mk] || 0) + 1;
    banner('¡VENCIERON!', M.n + ' cayó', 3500, '#ffd860'); SND.level(); buzz([60, 40, 120]);
    if (P.dead) { P.dead = false; P.hp = maxHp(lvlOf(P.xp)) * .5; $('#ov-dead').hidden = true; }
    /* premio para todos los que estén: oro + 2 cosas comunes */
    const ORO = 200; INV.coins += ORO; const got = [ORO + ' monedas'];
    for (let i = 0; i < 2; i++) { const k = resolveLoot(pickW([['W', 2], ['C', 2], ['A', 2], ['V', 3], ['P', 2], ['M', 2]]), 'evento'); const g = takeItem(k); if (g) got.push(ITEMS[g].n); }
    hud(); quickBtns();
    /* ítem único: lo tira una sola vez el host. 10%: si sale, le toca a uno de los presentes al azar; si no, a nadie */
    if (isHost) { const ids = [me.id].concat([...others.keys()]); if (Math.random() < MVP_UNICO) { const k = M.drops[(Math.random() * M.drops.length) | 0][0], to = ids[(Math.random() * ids.length) | 0];
        const nick = to === me.id ? me.nick : (others.get(to) || {}).nick || 'alguien'; net('mvploot', { to, k, nick }); mvpLoot({ to, k, nick }); } else net('mvploot', { none: 1 }), mvpLoot({ none: 1 }); }
    if (M.pista) { INV.mvpPistas = INV.mvpPistas || []; if (!INV.mvpPistas.includes(M.pista)) INV.mvpPistas.push(M.pista); }
    setTimeout(() => { toast('Ganaste: ' + got.join(' · ') + (M.pista ? ' · PISTA: "' + M.pista + '"' : '')); }, 1500);
    if (M.pista) setTimeout(() => banner('PISTA', '"' + M.pista + '"', 4000, '#e8c070'), 7200);
    persist(); setTimeout(() => mvpBack(), 11000); }
  const MVP_UNICO = .10;
  function mvpLoot(p) { if (p.none) return setTimeout(() => toast('Esta vez no cayó ningún objeto único.'), 2600);
    const it = ITEMS[p.k]; if (!it) return; if (p.to === me.id) { addItem(p.k); persist(); quickBtns(); SND.level(); buzz([80, 40, 160]); }
    setTimeout(() => banner(p.to === me.id ? '¡OBJETO ÚNICO!' : 'OBJETO ÚNICO', (p.to === me.id ? 'Te tocó: ' : p.nick + ' se llevó: ') + it.n, 4200, '#ff3b5c'), 2600); }
  function revive(id) { if (!hasItem('suero') && !hasItem('kit')) return toast('Para revivir necesitás un maletín de curación total o un kit de curación.'); const k = hasItem('suero') ? 'suero' : 'kit'; INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; if (k === 'suero') sueroTaken();
    net('revive', { to: id, by: me.nick }); SND.level(); toast('Lo reviviste.'); persist(); quickBtns(); }
  /* al morir quedás limpio: sin veneno, fuego, lentitud, aturdimiento ni habilidades */
  function cleanse(lostAb) { if (INV) INV.cont = 0; P.inmune = 0; P.contFin = 0; P.poison = 0; P.poisonK = 0; P.burn = 0; P.slow = 0; P.stunT = 0; P.goo = 0; P.regen = null; P.fast = 0; P.potion = 0; P.furia = 0; P.jefe = 0; P.smoke = 0; P.gorro = 0; P.ghost = 0; P.clone = null;
    if (lostAb && INV && INV.ab && INV.ab.length) { const had = INV.ab.map(a => AB[a] ? AB[a].n : a).join(', '); INV.ab = []; try { abButtons(); } catch (e) {} setTimeout(() => toast('Perdiste tus habilidades: ' + had + '.'), 1200); } }
  function gotRevived(by) { cleanse(false); if (!P.dead) return; P.dead = false; P.hp = Math.round(maxHp(lvlOf(P.xp)) * .5); P.inv = 3; $('#ov-dead').hidden = true; SND.level(); banner('TE REVIVIERON', by, 1800, '#9fe0b0'); hud(); sendPos(true); }
  function mvpDraw(c, W2S, zoom, t) { if (!MAP || !MAP.mvp) return;
    mvpObjs.forEach(o => { const [x, y] = W2S(o.x, o.y);
      if (o.t === 'galera') { const im = iconOf('gorro_desap'), w = 70 * zoom; c.globalAlpha = .95; c.save(); c.shadowColor = '#b080ff'; c.shadowBlur = 18; try { c.drawImage(im, x - w / 2, y - w * .9 + Math.sin(t * 3 + o.id) * 4, w, w); } catch (e) {} c.restore(); c.globalAlpha = 1; for (let i = 0; i < (o.hp || 1); i++) { c.fillStyle = '#d8c8ff'; c.fillRect(x - 10 + i * 12, y + 6, 8, 4); } }
      if (o.t === 'fuego') { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, 90 * zoom); g.addColorStop(0, 'rgba(255,200,80,.6)'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 90 * zoom, 38 * zoom, 0, 0, 7); c.fill(); c.restore(); c.strokeStyle = 'rgba(255,190,90,.9)'; c.lineWidth = 2 * zoom; c.beginPath(); c.ellipse(x, y, 80 * zoom, 32 * zoom, 0, 0, 7); c.stroke(); } });
    if (mapKey === 'mvp_hospital' && mobs.some(o => o.kind === 'mvp_cs' && o.A && o.A.act === 'grito')) CAMILLAS.forEach(([cx, cy]) => { const [x, y] = W2S(cx * WS, cy * WS); c.strokeStyle = 'rgba(160,255,170,.55)'; c.lineWidth = 3 * zoom; c.beginPath(); c.ellipse(x, y, 120 * zoom, 50 * zoom, 0, 0, 7); c.stroke(); });
    others.forEach((o, id) => { if (!o.dead) return; const [x, y] = W2S(o.x, o.y); c.font = 'bold ' + Math.round(13 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#ff8a7c'; c.fillText('CAÍDO', x, y - 200 * zoom * .5); });
  }
  /* MAPA: el dibujo del lugar con vos, tu grupo, las salidas y a dónde llevan */
  function openMapa() { if (!running || !MAP) return; paused = true; const ov = $('#ov-map'); ov.hidden = false; ov.querySelector('h2').textContent = MAP.name; drawMapa(); }
  function drawMapa() { const cv = $('#map-cv'), W0 = MW, H0 = MH, k = Math.min((innerWidth - 40) / W0, (innerHeight - 130) / H0); cv.width = Math.round(W0 * k); cv.height = Math.round(H0 * k); const g = cv.getContext('2d');
    const im = img(MAP.img); if (ok(im)) g.drawImage(im, 0, 0, cv.width, cv.height); g.fillStyle = 'rgba(0,10,12,.35)'; g.fillRect(0, 0, cv.width, cv.height);
    (MAP.exits || []).forEach(e => { const x = (e.r[0] + e.r[2]) / 2 * k, y = (e.r[1] + e.r[3]) / 2 * k; g.fillStyle = e.to ? '#7ff6f2' : '#ff5a4a'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
      if (e.to) { g.font = '11px TechMono, monospace'; g.textAlign = x < 60 ? 'left' : x > cv.width - 60 ? 'right' : 'center'; const ty = y < 20 ? y + 16 : y - 9; g.fillStyle = 'rgba(0,0,0,.7)'; const w = g.measureText(e.label).width + 8; const tx = g.textAlign === 'left' ? x : g.textAlign === 'right' ? x - w : x - w / 2; g.fillRect(tx - (g.textAlign === 'center' ? 0 : 0), ty - 10, w, 14); g.fillStyle = '#c8faf8'; g.fillText(e.label, g.textAlign === 'center' ? x : g.textAlign === 'left' ? x + 4 : x - 4, ty); } });
    npcsHere().forEach(n => { if (n.obj && !n.lib) return; g.fillStyle = '#e8c070'; g.beginPath(); g.arc(n.x * k, n.y * k, 3, 0, 7); g.fill(); });
    others.forEach(o => { g.fillStyle = o.fac === me.faction ? '#6ab0ff' : '#ff6a5c'; g.beginPath(); g.arc(o.x / WS * k, o.y / WS * k, 4, 0, 7); g.fill(); });
    const px = P.x / WS * k, py = P.y / WS * k; g.strokeStyle = '#fff'; g.lineWidth = 2; g.fillStyle = '#ffd860'; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill(); g.stroke(); g.font = 'bold 12px TechMono, monospace'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('VOS', px, py - 12); }
  /* ===== efectos dibujados (golpes, proyectiles, impactos) ===== */
  const FXI = {}; ['tajo_corto', 'tajo_largo', 'impacto', 'impacto_pesado', 'estocada', 'cadena', 'bala', 'bala_chica', 'perdigon', 'perdigones', 'virote', 'llamarada', 'bola_fuego', 'hielo', 'moco', 'cuchillo', 'chispa', 'explosion', 'fuego_piso', 'charco_moco', 'hielo_piso', 'onda', 'g_madera', 'g_madera2', 'g_acero', 'g_sangre', 'g_naranja', 'g_azul', 'g_violeta', 'g_verde', 'g_celeste', 'g_fuego', 'g_veneno', 'g_rayo'].forEach(k => { const i = new Image(); i.src = '/a/fx/' + k + '.webp'; FXI[k] = i; });
  const fxOk = k => FXI[k] && FXI[k].complete && FXI[k].naturalWidth;
  const fxs = [];
  /* CAMINAR: ciclo de 4 tiempos (paso · parado · el otro paso · parado), al ritmo de lo que te movés, con un rebote suave del cuerpo */
  const WALK4 = [1, 0, 2, 0];
  const walkPose = (wt, moving) => { if (!moving) return { fr: 0, bob: 0 }; const b = (wt || 0) / 1.3; return { fr: WALK4[(b | 0) % 4], bob: -Math.abs(Math.sin(b * Math.PI / 2)) * 3.4 }; };
  let LBL = []; const LBL_H = 15.5; /* nombres: se dibujan al final, a la altura de la cabeza */
  function fx(k, x, y, o) { if (fxs.length > 60) fxs.shift(); fxs.push(Object.assign({ k, x, y, t: 0, T: .3, ang: 0, s: 1, grow: .25, flip: false }, o || {})); }
  function drawFxImg(c, k, x, y, w, ang, alpha, flip) { if (!fxOk(k)) return false; const im = FXI[k], h = w * im.naturalHeight / im.naturalWidth; c.save(); c.globalAlpha = Math.max(0, Math.min(1, alpha)); c.translate(x, y); c.rotate(ang); if (flip) c.scale(1, -1); c.drawImage(im, -w / 2, -h / 2, w, h); c.restore(); return true; }
  function shotSprite(b) { if (b.enemy) return false; if (b.knife) return ['cuchillo', 70, 1]; if (b.tear) return ['hielo', 80, 1]; if (b.moco) return ['moco', 80, 1]; if (b.boom) return ['bola_fuego', 80, 0];
    if (b.flame) return ['llamarada', 90, 1]; if (b.fire) return ['bola_fuego', 70, 0]; if (b.bolt) return ['virote', 110, 0]; const w = b.wk || '';
    if (w === 'escopeta') return ['perdigon', 58, 0]; if (w === 'metralleta') return ['bala', 52, 0]; return ['bala', 70, 0]; }
  function fxTick(dt) { for (let i = fxs.length - 1; i >= 0; i--) { fxs[i].t += dt; if (fxs[i].t >= fxs[i].T) fxs.splice(i, 1); } }
  function fxDraw(c, W2S, zoom) { fxs.forEach(f => { const k = f.t / f.T, [x, y] = W2S(f.x, f.y); drawFxImg(c, f.k, x, y, f.w * zoom * (1 + f.grow * k), f.ang, k < .25 ? .6 + k * 1.6 : (1 - k) / .75, f.flip); }); }
  /* golpe cuerpo a cuerpo según el arma */
  const SWING = { cuchillo: ['tajo_corto', 110, 70], daga_demonio: ['tajo_corto', 110, 70], katana: ['tajo_largo', 175, 85], machete: ['tajo_largo', 160, 80], espada_lamentos: ['tajo_largo', 185, 90],
    lanza: ['estocada', 190, 105], baston: ['estocada', 170, 95], cadena: ['cadena', 200, 85], hacha: ['tajo_largo', 170, 90], martillo: ['tajo_largo', 175, 90], bate: ['tajo_largo', 165, 90], baston_oscuro: ['tajo_largo', 170, 90], barra: ['tajo_largo', 170, 95], tubo: ['tajo_largo', 160, 90] };
  const ARC = { palo: 'g_madera', bate: 'g_madera2', barra: 'g_acero', tubo: 'g_sangre', martillo: 'g_acero', hacha: 'g_sangre', cadena: null, machete: 'g_sangre',
    baston_oscuro: 'g_rayo', baston_resina: 'g_veneno', palo_destino: 'g_fuego', daga_demonio: 'g_fuego', espada_lamentos: 'g_celeste' }, ARC_T = { a: 'g_azul', p: 'g_violeta', n: 'g_naranja' };
  function swingFx(wk) { const it = ITEMS[wk] || {}, b0 = baseOf(wk), arc = (ARC[wk] && it.epic) ? ARC[wk] : ARC_T[it.r] || (b0 === 'cadena' || b0 === 'lanza' || b0 === 'baston' ? null : ARC[b0]);
    if (arc && fxOk(arc)) { const v = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir]; fx(arc, P.x + v[0] * 85, P.y - 95 + v[1] * 60, { w: 170, ang: Math.atan2(v[1], v[0]) - .35, flip: P.dir === 'l', T: .24, grow: .15 }); return; }
    const b = b0, [k, w, d] = SWING[b] || ['tajo_corto', 130, 85], v = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir], ang = Math.atan2(v[1], v[0]);
    const ground = k === 'impacto' || k === 'impacto_pesado'; fx(k, P.x + v[0] * d, P.y - (ground ? 40 : 95) + v[1] * d * .7, { w, ang: ground ? 0 : ang, flip: !ground && P.dir === 'l', T: ground ? .32 : .24, grow: ground ? .35 : .15 }); }
  function slot_is_weapon(k) { return !!WEAP[k]; }
  $('#inv-b').onclick = openInv; $('#inv-close').onclick = closeInv; $('#lib-close').onclick = closeLib; $('#inv-x').onclick = closeInv; $('#map-b').onclick = openMapa; $('#map-close').onclick = () => { $('#ov-map').hidden = true; paused = false; };

  /* ---------- Oscuros compartidos: el anfitrión de la sala los mueve, todos ven los mismos ---------- */
  let isHost = true, hostId = null, roomReady = false, mobSeq = 0, snapT = 0, maintT = 0, unlocks = {}; const lastDeath = {};
  const MKEYS = Object.keys(MOB), STC = ['idle', 'chase', 'aim', 'run', 'rest', 'fadeout', 'fadein', 'strike', 'tele', 'volley'];
  const mshots = [], clouds = [], goos = [];
  /* la Dama / el Galán: fase 1 y 2 piden 100 monedas; a la segunda se transforman */
  const DAMA_TXT = { chica: [['Hola, lindo... ¿me invitás algo? Son 100 monedas.', 'Gracias, corazón... ahora estoy más cómoda.'], ['Me quedé con ganas... dame 100 más.', '¿Más plata? Vení que te muestro lo que soy de verdad...']],
    chico: [['Hola, linda... ¿me invitás algo? Son 100 monedas.', 'Gracias... ahora estoy más cómodo.'], ['Me quedé con ganas... dame 100 más.', '¿Más plata? Vení que te muestro lo que soy de verdad...']] };
  function damaTalk(n) { const o = mobs.find(m => m.id === n.dama); if (!o) return; const g = o.T.passive, ph = /_b$/.test(o.kind) ? 1 : 0, [ask, after] = DAMA_TXT[g][ph], sk = o.T.sheet;
    const go = () => { if (isHost) damaNext(o.id, me.id); else net('dama', { id: o.id, by: me.id }); };
    const talk = (lines, cb) => (STORY && window.CZ_STORY && CZ_STORY.say) ? CZ_STORY.say(lines, cb) : (toast(o.T.name + ': "' + lines[lines.length - 1][1] + '"'), cb && cb());
    if (ph === 0) { if (INV.coins < 100) return talk([[sk, ask], ['VOS', 'No tengo tanta plata.'], [sk, 'Entonces volvé cuando tengas, bombón.']]); return talk([[sk, ask], ['VOS', 'Tomá.'], [sk, after]], () => { INV.coins -= 100; hud(); persist(); go(); }); }
    const pay = INV.coins >= 100; talk([[sk, ask], ['VOS', pay ? 'Bueno... tomá.' : 'No me queda nada.'], [sk, after]], () => { if (pay) { INV.coins -= 100; hud(); persist(); } go(); }); }
  function damaNext(id, by) { const o = mobs.find(m => m.id === id); if (!o || !o.T.passive) return; const nk = /_b$/.test(o.kind) ? o.kind.replace(/_b$/, '_c') : o.kind + '_b'; const x = o.x, y = o.y;
    const fam = o.kind.replace(/_[bc]$/, ''); for (let j = mobs.length - 1; j >= 0; j--) if (mobs[j].kind.replace(/_[bc]$/, '') === fam) mobs.splice(j, 1); const id0 = me.id.slice(0, 4) + '-' + (mobSeq++) + '-' + ((Math.random() * 1e4) | 0); const n = newMob(nk, id0 + '~' + (mobLevel(id0, nk) || 0), x, y); mobs.push(n);
    if (/_c$/.test(nk)) { n.chasing = true; shake = .6; SND.mob('roar', 1); for (let k = 0; k < 40; k++) parts.push({ x, y: y - 90, vx: rnd(-220, 220), vy: rnd(-200, 40), life: .8, s: 5, c: 200, fire: 1 }); net('boss', { k: nk }); } }
  function stun(t) { fx('onda', P.x, P.y - 110, { w: 320, T: .5, grow: .5 }); if (!(P.slow > 0)) toast('¡Aturdido! Te movés más lento.'); P.slow = Math.max(P.slow || 0, t); P.stunT = t; }
  const AB = { invis: { n: 'INVISIBLE', d: 'Botón HUIR: 3 segundos invisible para escapar.' }, rapido: { n: 'GOLPE RÁPIDO', d: 'Pegás 30% más rápido.' }, cuchillos: { n: 'CUCHILLOS', d: 'Cada golpe también tira un cuchillo hacia adelante.' } };
  const hashStr = s_ => { let h = 2166136261; for (let i = 0; i < s_.length; i++) { h ^= s_.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  /* nivel que la historia espera que tengas al arrancar la misión i (termina en 90) */
  const tgtLv = (i, N) => i < 0 ? 1 : Math.min(90, Math.round(3 + 87 * Math.pow((i + 1) / N, 1.15)));
  function storyLv() { if (!STORY || !INV || !INV.story) return 1; const D_ = window.CZ_STORY_DATA, N = ((D_ && D_[me && me.faction === 'ork' ? 'ork' : 'rebel']) || []).length || 16; return tgtLv((INV.story.m || 0) - 1, N); }
  function mobLevel(id, kind) { const T = MOB[kind]; if (!T) return 0; const tag = /~(\d+)$/.exec(String(id)); if (tag) return +tag[1];
    if (T.boss) { if (!STORY) return 0; const top = ((MAP && MAP.lv) || [1, 3])[1]; return Math.min(100, Math.max(8, top + 4)); } if (T.lv1) return 1;
    const [a, b] = (MAP && MAP.lv) || [1, 3], h = hashStr(String(id)); return Math.min(100, Math.max(T.human && T.fac && MAP && (MAP.base || HUMAN_AT[mapKey]) ? 45 : 1, a + h % (b - a + 1))); }
  const lvHp = L => 1 + (L - 1) * .28, lvDmg = L => 1 + (L - 1) * .075, lvXp = L => .3 + L * .05;
  function auraOf(L) { return L >= 75 ? '255,40,40' : L >= 50 ? '255,140,0' : L >= 25 ? '240,215,80' : null; }
  function newMob(kind, id, x, y) { const T = MOB[kind], L = mobLevel(id, kind), mhp = L ? Math.round(T.hp * (T.boss ? (1 + (L - 1) * .07) * (.6 + .4 * Math.min(4, 1 + (others ? others.size : 0))) : lvHp(L))) : T.hp; return { id, kind, T, lv: L, lvK: L ? (T.boss ? 1 + (L - 1) * .035 : lvDmg(L)) : 1, mhp, au: L ? auraOf(L) : null, x, y, tx: x, ty: y, hp: mhp, face: 1, vx: 0, vy: 0, t: Math.random() * 9, hurt: 0, wind: 0, cd: 0, wx: x, wy: y, wt: 0, alpha: 0, chasing: false, stuck: 0, lx: x, ly: y, lunge: 0,
    st: 'idle', stT: 0, side: Math.random() < .5 ? -1 : 1, vis: T.ai === 'blink' ? .2 : 1, dx: 0, dy: 0, hitDone: false, combo: 0, hitters: new Set(), ab: rnd(5, 8), shotT: 0, volleys: 0 }; }
  function spawnMob(kind, minDist, at) { if (!isHost || !MOB[kind]) return null; const p = at || randomMobCell(minDist); if (!p) return null; const id0 = me.id.slice(0, 4) + '-' + (mobSeq++) + '-' + ((Math.random() * 1e4) | 0); const o = newMob(kind, id0 + '~' + (mobLevel(id0, kind) || 0), p[0], p[1]); mobs.push(o);
    if (o.T.boss) { toast('⚠ ' + o.T.name + ' está en ' + MAP.name.toLowerCase()); net('boss', { k: kind }); } if (kind === 'yuki') toast('Yuki anda suelta por las ruinas. Si la alcanzás, deja su brazalete.'); return o; }
  const dayN = () => Math.floor((Date.now() - 3 * 3600e3) / 864e5), minOfDay = () => Math.floor(((Date.now() - 3 * 3600e3) % 864e5) / 6e4);
  function hordeOn(k) { const m = MAPS[k]; if (!m || m.safeAll || m.base) return false; const d = dayN(), now = minOfDay();
    return ['a', 'b', 'c', 'd'].some(x => { const a = hashStr(k + d + x) % 1440; return now >= a && now < a + 6; }); }
  const hourlyDead = {};
  /* los 3 jefes del día y dónde están (todos ven lo mismo porque sale de la fecha) */
  function bossesToday() { const d = dayN(); if (bossesToday.d === d) return bossesToday.v; const mix = x => { let h = hashStr(x); h = Math.imul(h ^ (h >>> 16), 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16; return h >>> 0; }; const ks = Object.keys(BOSS_POOL).sort((a, b) => mix(a + ':' + d) - mix(b + ':' + d)); const v = {}, used = new Set();
    for (const k of ks) { if (Object.keys(v).length >= 3) break; const l = BOSS_POOL[k].filter(m => MAPS[m] && !used.has(m)); if (!l.length) continue; const m = l[mix(k + '@' + d) % l.length]; v[m] = k; used.add(m); }
    /* la dama y el galán: un día ella en el Bar de Humo, al otro él en el Bar de Luz Roja, todo el día */
    if (d % 2) { if (MAPS.bar_humo) v.bar_humo = 'chica'; } else if (MAPS.bar_rojo) v.bar_rojo = 'chico';
    bossesToday.d = d; bossesToday.v = v; return v; }
  const dayStart = () => (dayN() * 864e5) + 3 * 3600e3;
  const bossAlive = k => (hourlyDead[k] || 0) < dayStart() && (!/^chic[ao]$/.test(k) || (hourlyDead[k + '_c'] || 0) < dayStart());
  function loadHourly(k) { const b = bossesToday()[k]; if (!b) return; try { sb.from('game_state').select('v').eq('k', 'jefe_' + b).maybeSingle().then(r => { const v = r && r.data && r.data.v; if (v && v.t) hourlyDead[b] = Math.max(hourlyDead[b] || 0, v.t); }, () => {}); } catch (e) {} }
  /* Yuki en PvP: 20 minutos de cada hora, a una hora distinta cada día */
  const yukiPvp = () => { const m = (minOfDay() + hashStr('yuki' + dayN()) % 60) % 60; return m < 35; };
  const bossOn = k => { const b = BOSS_AT[k]; if (!b || EXP) return false; const m = (minOfDay() + hashStr(b) % 120) % 120; return m < 20; };
  function wantMobs() { const w = Object.assign({}, MAP.mobs || {}); if (hordeOn(mapKey)) Object.keys(w).forEach(k => w[k] *= 2); if (!EXP && !MAP.base && !MAP.mvp && (MAP.dark || 0) >= .45 && !INV.eq.luz) w.ojo = (w.ojo || 0) + 2;
    if (!MAP.base && !MAP.mvp && !MAP.safeAll && w.errante) w.contagiado = Math.max(1, Math.round(w.errante / 2)); /* donde hay Errantes, también Contagiados */ if (EXP) { if (mapKey === 'pvp_centro' && yukiPvp()) w.yuki = 1; return w; } Object.keys(EXTRA).forEach(k => { if (EXTRA[k][mapKey]) w[k] = (w[k] || 0) + EXTRA[k][mapKey]; }); const hb = bossesToday()[mapKey]; if (hb && bossAlive(hb)) { const ph = mobs.find(o => o.kind === hb + '_c') || mobs.find(o => o.kind === hb + '_b'); if (ph) { w[ph.kind] = 1; delete w[hb]; } else w[hb] = 1; }
    /* nunca dos de la misma dama/galán a la vez */
    ['chica', 'chico'].forEach(f => { const here = mobs.filter(o => o.kind.replace(/_[bc]$/, '') === f); if (here.length > 1) { const keep = here.find(o => /_c$/.test(o.kind)) || here.find(o => /_b$/.test(o.kind)) || here[0]; here.forEach(o => { if (o !== keep) { const i = mobs.indexOf(o); if (i >= 0) mobs.splice(i, 1); } }); } });
    /* nunca dos jefes juntos: queda el que ya está en el mapa, si no el primero */
    const bk = Object.keys(w).filter(k => MOB[k] && MOB[k].boss && w[k] > 0); if (bk.length > 1) { const here = bk.find(k => mobs.some(o => o.kind === k)) || bk[0]; bk.forEach(k => { if (k !== here) delete w[k]; }); }
    return w; }
  function maintainMobs() { if (!isHost || !roomReady || (MAP.safeAll && !MAP.safeFac)) return; const w = wantMobs(), now = Date.now();
    Object.entries(w).forEach(([k, n]) => { let have = mobs.filter(o => o.kind === k).length; const wait = MOB[k].respawn || 12000;
      if (!lastDeath[k]) { while (have < n) { if (!spawnMob(k, 560)) break; have++; } lastDeath[k] = 1; }
      else if (have < n && now - lastDeath[k] > wait) spawnMob(k, 560); }); }
  function mobHit(o, dmg, kx, ky, byId, lc) { if (!o || o.hp <= 0 || o.T.passive) return; if (o.T.ai === 'angel' && o.st !== 'strike' && !lc) return; /* La Quieta: quieta solo la lastiman lanza y cadena */ o.hp -= dmg; o.hurt = .2; o.hitters.add(byId); o.lastBy = byId; o.chasing = true;
    if (!o.T.heavy) { o.wind = Math.max(0, o.wind - .12); const nx = o.x + kx, ny = o.y + ky; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; } }
    if (o.st === 'run') { o.st = 'rest'; o.stT = 1.1; } if (o.hp <= 0) killMob(o); }
  function hitMob(o, dmg, kx, ky, fx_) { if (o && o.T) { const hy = o.y - (o.T.h || 150) * .45; fxs.length < 60 && fxs.push({ k: 'chispa', x: o.x + rnd(-14, 14), y: hy, t: 0, T: .18, ang: rnd(0, 6), s: 1, grow: .4, w: 70 }); } const fx = fx_; if (o.T.passive) { floats.push({ x: o.x, y: o.y - o.T.h - 30, t: .7, txt: 'HABLALE', c: '#ffb0c8' }); return; } const lc = /^(lanza|cadena)/.test(curW()); if (o.T.ai === 'angel' && o.st !== 'strike' && !lc) { floats.push({ x: o.x, y: o.y - o.T.h - 30, t: .7, txt: 'NO SE DEJA', c: '#b8b2a8' }); return; } if (o.T.fac && o.T.fac === me.faction) { floats.push({ x: o.x, y: o.y - o.T.h - 30, t: .6, txt: 'ALIADO', c: '#8fd0ff' }); return; } if (INV.eq.luz && !o.T.human && Math.hypot(o.x - P.x, o.y - P.y) < 520) dmg = Math.round(dmg * 1.25); o.hurt = .2; floats.push({ x: o.x + rnd(-10, 10), y: o.y - o.T.h * .8, t: .8, txt: '-' + dmg, c: '#ffffff' });
    for (let i = 0; i < 10; i++) parts.push({ x: o.x, y: o.y - o.T.h * .6, vx: rnd(-140, 140), vy: rnd(-110, -30), life: .6, s: rnd(2, 4), c: 25 });
    if (isHost) { mobHit(o, dmg, kx, ky, me.id, lc); if (fx) applyMobFx(o, fx, me.id); } else net('mhit', { id: o.id, d: dmg, kx: Math.round(kx), ky: Math.round(ky), by: me.id, fx: fx || undefined, lc: lc ? 1 : undefined }); }
  function killMob(o) { const i = mobs.indexOf(o); if (i >= 0) mobs.splice(i, 1); lastDeath[o.kind] = Date.now();
    if (o.T.world || o.T.hourly) { const bk = o.kind.replace(/_[bc]$/, ''); hourlyDead[bk] = Date.now(); try { sb.from('game_state').upsert({ k: 'jefe_' + bk, v: { t: Date.now() }, updated_at: new Date().toISOString() }).then(() => {}, () => {}); } catch (e) {} }
    if (o.drop) spawnPickup(o.drop, [o.x, o.y + 20]);
    const pl = { id: o.id, kind: o.kind, x: Math.round(o.x), y: Math.round(o.y), f: o.face, by: [...o.hitters] }; if (o.cid) { pl.cid = o.cid; pl.kb = o.lastBy; pl.cn = o.cn; }
    net('mdie', pl); onMobDie(pl); }
  function onMobDie(p) { const T = MOB[p.kind]; if (!T) return; if (p.cid) { toast('Cayó el clon de ' + (p.cn || 'alguien') + '.'); if (p.kb === me.id) claimClone(p.cid, p.cn); } const i = mobs.findIndex(o => o.id === p.id); if (i >= 0) mobs.splice(i, 1); SND.dissolve();
    const art = artOf(T, 0, false), g = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
    /* ceniza corta y liviana: pocas partículas (máx. 45), se apagan rápido */
    const st = Math.max(1, Math.round(art.width / 14)), pts = []; for (let y = 0; y < art.height; y += st) for (let x = 0; x < art.width; x += st) if (g[(y * art.width + x) * 4 + 3] >= 10) pts.push([x, y]);
    const want = T.boss ? 45 : 22, hgt = art.hd ? T.ph * PXS * HD_K / (220 / art.height) : T.ph * PXS;
    for (let n = 0; n < Math.min(want, pts.length); n++) { const [x, y] = pts[(Math.random() * pts.length) | 0], ks = hgt / art.height;
      parts.push({ x: p.x + (p.f < 0 ? art.width / 2 - x : x - art.width / 2) * ks, y: p.y - (art.height - y) * ks * (art.hd ? 240 / 256 : 1), vx: rnd(-30, 50), vy: rnd(-90, -20), life: rnd(.35, .7), s: PXS * .9, c: Math.random() < .8 ? 40 : 150 }); }
    if (T.boss) { shake = .6; toast(T.name + ' cayó.'); }
    if (T.mvp) mvpWon(p.kind);
    if (!p.by.includes(me.id)) return;
    INV.racha = 0; if (window.CZ_STORY && STORY) CZ_STORY.kill(p.kind, p.x, p.y);
    const lvBefore = lvlOf(P.xp), mL = mobLevel(p.id, p.kind), gx = Math.round(T.xp * (T.boss ? 1.5 + (mL || 10) / 15 : mL ? lvXp(mL) : .4) * (EXP ? 3 : 1)), gc = (T.coins || 1) + Math.floor((T.boss ? 0 : mL) / 8); P.kills++; P.xp += gx; INV.coins += gc; buzz(30);
    floats.push({ x: p.x, y: p.y - T.h - 10, t: 1.4, txt: '+' + gx + ' XP · +' + gc + ' $', c: '#e8e4da' });
    const r = Math.random() / (me.faction === 'rebel' ? 1.5 : 1), at = [p.x, p.y];
    if (p.kind === 'denso' && r < .35) spawnPickup(Math.random() < .5 ? 'b_contencion' : 'b_resonancia', at);
    else if (p.kind === 'sombra' && r < .2) spawnPickup('pagina', at);
    else if (p.kind === 'mole' && r < .5) spawnPickup(pickW([['armadura', 1], ['C', 2]]), at);
    else if (r < .15) spawnPickup('V', at);
    else if (r < .19) spawnPickup(pickW([['pilas', 3], ['campera', 1], ['C', .5], ['M', 1.2], ['X', .3]]), at);
    if (T.fac && T.fac !== me.faction) { const rj = Math.random(); if (rj < .04) spawnPickup('jeringa_max', [p.x - 30, p.y + 10]); else if (rj < .3) spawnPickup('jeringa', [p.x - 30, p.y + 10]); } /* vacunas: las tiran los del otro bando */
    if (T.boss && !T.mvp) { const n_ = T.world ? 3 : 2; for (let j = 0; j < n_; j++) spawnPickup(pickW([['W', 3], ['C', 2], ['A', 2], ['G', 1], ['V', 1.5], ['P', 1], ['X', 1]]), [p.x + rnd(-80, 80), p.y + rnd(-40, 40)], 'jefe'); }
    const r2 = Math.random();
    if (r2 < .05) spawnPickup(pickW(mL >= 10 ? [['W', 4], ['G', 1], ['A', 1]] : [['W', 4], ['A', .5]]), [p.x + 30, p.y]); /* armas cuerpo a cuerpo: se rompen rápido, que aparezcan más */
    else if (r2 < .021) spawnPickup('pista', [p.x - 30, p.y]);
    else if (r2 < .044) spawnPickup(pickW([['venda_q', T.burn || mL >= 15 ? 1.2 : .3], ['antiveneno', T.poison || mL >= 15 ? 1.2 : .3], ['trampa', .5], ['fragmento', mL >= 10 ? .25 : 0], ['metralleta', mL >= 25 ? .05 : 0], ['cigarrillo', 2], ['manzana', 1.5], ['receptor', mL >= 18 ? .5 : 0], ['fragmento', mL >= 40 ? .3 : 0], ['credencial', p.kind === 'corredor' ? 1.5 : 0], ['linterna', .3]]), [p.x, p.y + 30]);
    /* ganzúas: antes solo caían de Oscuros nivel 30+; ahora en todos los niveles (los jefes siempre dejan una) */
    if (T.boss || Math.random() < (mL >= 15 ? .07 : .05)) spawnPickup('ganzuas', [p.x - 30, p.y + 20]);
    if (p.kind === 'jefe') grantSkins(['renzo', 'sam']);
    if (p.kind === 'yuki') { addItem('brz_jefe'); quickBtns(); toast('¡Alcanzaste a Yuki! Te dejó su brazalete: activalo desde ESPECIAL.'); persist(); }
    if (p.kind === 'sofia' && STORY && window.CZ_STORY && CZ_STORY.say && Math.hypot(P.x - p.x, P.y - p.y) < 1400) setTimeout(() => CZ_STORY.say([['sofia_mala2', 'Solo quería...'], ['sofia_mala2', '...vivir feliz...']]), 900);
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
    mobs.forEach(o => { const row = [o.id, Math.round(o.x), Math.round(o.y), STC.indexOf(o.st), Math.ceil(o.hp), MKEYS.indexOf(o.kind), o.face, flagsOf(o), Math.round(o.vis * 10), o.combo % 3, Math.max(0, SKN.indexOf(o.sk)), o.cl ? JSON.stringify([o.cl, o.cn, o.cid || null]) : 0];
      const l = lastEnemy.get(o.id); if (full || !l || Math.abs(l[1] - row[1]) > NET.POS_EPSILON || Math.abs(l[2] - row[2]) > NET.POS_EPSILON || l.slice(3).join() !== row.slice(3).join()) { e.push(row); lastEnemy.set(o.id, row); } });
    if (!full && !e.length) return; if (full) { lastFull = now; needFull = false; [...lastEnemy.keys()].forEach(id => { if (!mobs.some(o => o.id === id)) lastEnemy.delete(id); }); }
    net('enemies', { t: now, full, e, pk: full ? pickups.filter(q => q.k !== 'suero').map(q => [q.pid, q.k, Math.round(q.x), Math.round(q.y)]) : undefined }); }
  /* cliente: guarda los estados con la hora de llegada para interpolar */
  function pushBuf(o, x, y) { const now = performance.now(); o.buf = o.buf || []; const last = o.buf[o.buf.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) > 260) o.buf.length = 0; else if (last && now - last.t > 250) o.buf.push({ t: now - 1000 / NET.NET_TICK_HZ, x: last.x, y: last.y });
    o.buf.push({ t: now, x, y }); while (o.buf.length > 5) o.buf.shift(); }
  function applyEnemies(p) { if (netMode !== 'MULTI_CLIENT') return;
    if (p.pk) { const keep = pickups.filter(q => q.k === 'suero' || (q.cool > 0)); const have = new Set(keep.map(q => q.pid)); pickups.length = 0; keep.forEach(q => pickups.push(q)); p.pk.forEach(([pid, k, x, y]) => { if (!have.has(pid) && ITEMS[k]) pickups.push({ k, x, y, t: Math.random() * 6, pid }); }); } const seen = p.full ? new Set() : null;
    p.e.forEach(([id, x, y, sti, hp, ki, face, fl, vis, combo, ski, cli]) => { if (seen) seen.add(id); const kind = MKEYS[ki]; if (!kind) return; let o = mobs.find(m => m.id === id);
      if (!o) { o = newMob(kind, id, x, y); o.alpha = 1; mobs.push(o); } pushBuf(o, x, y);
      const wasWind = o.wind > 0, wasChase = o.chasing; o.hp = hp; o.face = face; o.moving = !!(fl & 1); o.wind = fl & 2 ? Math.max(o.wind, .01) : 0; if (fl & 4) o.lunge = 1; o.chasing = !!(fl & 8); o.vis = vis / 10; o.st = STC[sti] || 'idle'; o.combo = combo; o.sk = SKN[ski || 0] || null; if (cli && !o.cl) { try { const q = JSON.parse(cli); o.cl = q[0]; o.cn = q[1]; o.cid = q[2] || null; } catch (e) {} }
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
  function fireMob(o, tg, kind, spread) { const T = o.T, ang = Math.atan2(tg.y - o.y, tg.x - o.x) + (spread || 0), sp = (T.pspeed || 400) * (kind === 'rayo' ? 1.3 : 1);
    const b = { x: o.x + Math.cos(ang) * 30, y: o.y + Math.sin(ang) * 20, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, k: kind, d: T.fdmg || T.dmg, life: 2.2, mk: o.kind }; b.d = Math.round(b.d * (o.lvK || 1));
    mshots.push(b); net('mfire', { x: Math.round(b.x), y: Math.round(b.y), vx: Math.round(b.vx), vy: Math.round(b.vy), k: kind, d: b.d, mk: o.kind }); SND.fireball(kind); }
  function addCloud(x, y) { const c0 = { x, y, r: 150, ttl: 4.5, tick: 0 }; clouds.push(c0); net('mcloud', { x: Math.round(x), y: Math.round(y) }); }
  function updateMobShots(dt) {
    for (let i = mshots.length - 1; i >= 0; i--) { const b = mshots[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; let gone = b.life <= 0 || !walkable(b.x, b.y);
      if (b.k === 'fire' && Math.random() < .7) parts.push({ x: b.x + rnd(-6, 6), y: b.y - 70 + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-40, -10), life: .4, s: rnd(3, 6), c: 200, fire: 1 });
      if (!gone && !P.dead && Math.abs(b.x - P.x) < 40 && Math.abs(b.y - P.y) < 34) { gone = true; hitPlayer(b.d, { x: b.x - b.vx * .1, y: b.y - b.vy * .1 }, b.k === 'fire' || b.k === 'vacio' ? 40 : 0, null, b.mk || 'oscuro'); if (b.k === 'fire') for (let j = 0; j < 14; j++) parts.push({ x: P.x, y: P.y - 80, vx: rnd(-90, 90), vy: rnd(-90, 0), life: .5, s: 4, c: 200, fire: 1 }); }
      if (gone) { if (b.k === 'moco') goos.push({ x: b.x, y: b.y, r: 95, ttl: 6 }); mshots.splice(i, 1); } }
    for (let i = goos.length - 1; i >= 0; i--) { const g_ = goos[i]; g_.ttl -= dt; if (g_.ttl <= 0) { goos.splice(i, 1); continue; } if (!P.dead && Math.hypot(P.x - g_.x, (P.y - g_.y) * 1.5) < g_.r) { if (!(P.goo > 0)) toast('¡Pisaste moco! Vas lento y te pegan el doble.'); P.goo = .3; P.slow = Math.max(P.slow || 0, .3); } }
    if (P.goo > 0) P.goo -= dt;
    for (let i = clouds.length - 1; i >= 0; i--) { const c0 = clouds[i]; c0.ttl -= dt; if (c0.ttl <= 0) { clouds.splice(i, 1); continue; }
      if (!P.dead && Math.hypot(P.x - c0.x, (P.y - c0.y) * 1.4) < c0.r) { c0.tick -= dt; if (c0.tick <= 0) { c0.tick = .5; hitPlayer(6, null, 0, null, 'sofia'); } } } }
  /* ataque de un Oscuro sobre un jugador: si soy yo me pega acá; si es otro, le aviso */
  function strikeOn(pl, d, from, knock) { if (from && from.kind === 'mole') fx('impacto_pesado', pl.x, pl.y - 30, { w: 210, T: .45, grow: .3 }); d = Math.round(d * (from.lvK || 1)); if (pl.me) hitPlayer(d, from, knock, null, from.kind, true); else net('mstrike', { to: pl.id, d, x: Math.round(from.x), y: Math.round(from.y), k: knock || 0, mk: from.kind }); }
  /* desbloqueos de jefes: los calcula Supabase con el mejor nivel de cada uno */
  let unlockT = 0;
  async function checkUnlocks() { if (EXP) return; try { await persist(); const { data, error } = await sb.rpc('game_unlocks'); if (error || !data) return; const before = Object.assign({}, unlocks); unlocks = data;
      TIER.forEach(([k, txt]) => { if (unlocks[k] && !before[k] && unlockT) { toast('SE DESBLOQUEÓ ' + txt); SND.zone(); } }); unlockT = 1; } catch (e) {} }

  /* ---------- online: salas de 10 por mapa ---------- */
  function trackMe() { if (!ch) return; ch.track({ nick: me.nick, fac: me.faction, look, lvl: lvlOf(P.xp), x: Math.round(P.x), y: Math.round(P.y), at: myAt, joinedAt: myAt }); tracked = true; }
  function leaveRoom() { if (!ch) return; const c = ch; ch = null; try { c.untrack(); } catch (e) {} try { sb.removeChannel(c); } catch (e) {} tracked = false; peers = 0; netMode = 'SOLO'; }
  function joinRoom(n) {
    leaveRoom(); others.clear(); room = n; const myMap = mapKey; netMode = 'SOLO'; gotFull = true; lastEnemy.clear();
    $('#h-sala').textContent = window.CZ_OFFLINE ? 'offline · solo' : 'sala ' + n + ' · conectando…';
    const c = sb.channel((EXP ? 'gpvp:' : 'game:') + myMap + '-' + n, { config: { presence: { key: me.id }, broadcast: { self: false, ack: false } } }); ch = c;
    const onPresence = () => { if (ch !== c) return; const st = c.presenceState(); const ids = Object.keys(st); const before = peers;
      for (const id of [...others.keys()]) if (!ids.includes(id)) others.delete(id);
      ids.forEach(id => { if (id === me.id) return; const m = st[id][0] || {}; const o = others.get(id) || { x: m.x || P.x, y: m.y || P.y, tx: m.x || P.x, ty: m.y || P.y, face: 1, walkT: 0, say: '', sayT: 0 };
        Object.assign(o, { look: m.look, nick: m.nick, fac: m.fac, lvl: m.lvl }); others.set(id, o); });
      electHost(st); if (peers > before) { lastPlayerSent = null; if (netMode === 'MULTI_HOST') needFull = true; }
      $('#h-sala').textContent = window.CZ_OFFLINE ? 'offline · solo' : (EXP ? 'EXP · ' : '') + 'sala ' + n + ' · ' + (peers + 1) + '/10 acá' + (netMode === 'SOLO' ? ' · solo' : ''); };
    ['sync', 'join', 'leave'].forEach(ev => c.on('presence', { event: ev }, onPresence));
    const H = {
      trap: p => { if (p && p.id && !ptraps.some(t => t.id === p.id)) ptraps.push(Object.assign({}, p, { t: Date.now() })); },
      trapx: p => { const i = ptraps.findIndex(t => t.id === (p && p.id)); if (i >= 0) ptraps.splice(i, 1); },
      player: p => { const o = others.get(p.id); if (!o) return; pushBuf(o, p.x, p.y); o.tx = p.x; o.ty = p.y; o.face = p.f || o.face; o.dir = p.d || o.dir; o.mv = !!(p.a & 1); if (p.a & 2) o.atk = .25; o.dead = !!(p.a & 4); o.iv = !!(p.a & 8); o.gh = !!(p.a & 32); o.hp = p.h; },
      enemies: p => applyEnemies(p),
      req: () => { if (netMode === 'MULTI_HOST') needFull = true; lastPlayerSent = null; },
      say: p => { const o = others.get(p.id); if (o) { o.say = p.t; o.sayT = 6; } },
      hit: p => { const a = others.get(p.id); if (p.to === me.id) { if (!a || a.fac === me.faction || MAP.mvp) return; if (hitPlayer(p.d, { x: p.ax, y: p.ay }, 40, p.id)) floats.push({ x: P.x, y: P.y - 215, t: 1, txt: a.nick, c: '#ff7a70' }); } else { const v = others.get(p.to); if (v) v.hurt = .2; } },
      died: p => { const v = others.get(p.id); if (v) { v.dead = true; v.hp = 0; }
        if (p.by === me.id) { const lvB = lvlOf(P.xp); P.xp += 40; P.pvp = (P.pvp || 0) + 1; SND.level(); buzz([40, 40, 90]); toast('Derribaste a ' + (v ? v.nick : 'un enemigo') + ' · +40 XP'); if (lvlOf(P.xp) > lvB) P.hp += maxHp(lvlOf(P.xp)) - maxHp(lvB); hud(); persist(); }
        else if (v) toast(v.nick + ' cayó.'); },
      mhit: p => { if (netMode !== 'MULTI_HOST') return; const o = mobs.find(m => m.id === p.id); if (o) { mobHit(o, p.d, p.kx, p.ky, p.by, !!p.lc); if (p.fx) applyMobFx(o, p.fx, p.by); } },
      throw: p => { throws.push({ k: p.k, x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1, t: 0, T: .75, dmg: 0, remote: 1 }); },
      mvpgo: p => { if (p.from === mapKey) goMvp(p.mk, p.by); },
      mvploot: p => { if (MAP.mvp) mvpLoot(p); },
      pfx: p => { if (p.to === me.id) applyPfx(p.fx); },
      mvpo: p => { if (isHost) return; mvpObjs = p.o.map(([id, t, x, y, hp]) => ({ id, t, x, y, hp })); },
      mvpx: p => { if (isHost) breakObj(p.id); },
      mvpban: p => { banner(p.t, p.s, p.big ? 1400 : 1800, p.c); if (p.t === 'FINALE!') SND.mob('roar', .7); },
      revive: p => { if (p.to === me.id) gotRevived(p.by); },
      mfx: p => { if (!isHost) return; const o = mobs.find(m => m.id === p.id); if (o) applyMobFx(o, p.fx, p.by); },
      mdie: p => onMobDie(p),
      clon: p => { if (isHost) spawnClon(p); },
      mstrike: p => { if (p.mk === 'mole') fx('impacto_pesado', p.to === me.id ? P.x : p.x, (p.to === me.id ? P.y : p.y) - 30, { w: 210, T: .45, grow: .3 }); if (p.to === me.id) hitPlayer(p.d, { x: p.x, y: p.y }, p.k, null, p.mk || 'oscuro', true); },
      mfire: p => { mshots.push({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, k: p.k, d: p.d, life: 2.2, mk: p.mk }); SND.fireball(p.k); },
      mcloud: p => clouds.push({ x: p.x, y: p.y, r: 150, ttl: 4.5, tick: 0 }),
      mslow: p => { if (p.to === me.id) stun(p.t || 3); },
      mring: p => { const o = mobs.find(m => m.id === p.id); if (o) o.ring = .6; },
      dama: p => { if (isHost) damaNext(p.id, p.by); },
      boss: p => { if (MOB[p.k]) toast('⚠ ' + MOB[p.k].name + ' está en ' + MAP.name.toLowerCase()); },
      shot: p => { shots.push({ x: p.x, y: p.y, vx: p.vx * 1100, vy: p.vy * 1100 * .8, life: .6, fake: true }); SND.shot(.35); },
      suero: p => { if (p.slot === suero.slot) { suero.taken = p.slot; suero.map = null; clearSuero(); hud(); } },
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
  const damaNpcs = () => mobs.filter(o => o.T.passive && o.hp > 0).map(o => ({ k: o.T.sheet, nm: o.T.name, line: '…', x: o.x / WS, y: o.y / WS, dama: o.id }));
  const npcsHere = () => CAS.concat(libNpcs(), NPCS[mapKey] || [], damaNpcs()).filter(n => !n.cada || ((minOfDay() + hashStr(n.k) % 60) % 60) < 20 || (STORY && window.CZ_STORY && CZ_STORY.wants && CZ_STORY.wants(n.k))).concat(STORY && window.CZ_STORY ? CZ_STORY.npcs(mapKey) : []);
  function nearNpc() { let best = null, bd = 150; npcsHere().forEach(n => { const d = Math.hypot(n.x * WS - P.x, (n.y * WS - P.y) * 1.2); if (d < bd) { bd = d; best = n; } }); return best; }
  const healCd = {};
  /* el bando contrario no te atiende: te maldicen, te insultan o te lastiman */
  function hostil(n) { const r = Math.random(), L = n.fac === 'ork' ? ['"Rata rebelde."', '"Andate antes de que llame a los guardias."', '"No te debo nada."'] : ['"Fuera de acá, perro de ORK."', '"Que la ceniza te trague."', '"Traidor."'];
    if (r < .35) { const d = 10; P.hp = Math.max(1, P.hp - d); P.hurtT = .3; SND.hurt(); buzz(40); floats.push({ x: P.x, y: P.y - 190, t: .9, txt: '-' + d, c: '#ff6a5c' }); toast(n.nm + ' te empuja contra la pared.'); hud(); }
    else npcSay(n, L[(Math.random() * L.length) | 0].replace(/"/g, '')); }
  /* 3 pistas del bando → brazalete (Mercedes para ORK, Jota para rebeldes) */
  const PISTA = () => me.faction === 'ork' ? 'pista_ork' : 'pista_reb', BRZ = () => me.faction === 'ork' ? 'brz_ork' : 'brz_reb';
  function tryBrazalete(n) { const have = INV.items[PISTA()] || 0; if (have < 3) { if (n.act === null && !n.heal) npcSay(n, 'Traeme 3 pistas y te doy algo que vale la pena. Tenés ' + have + '.'); return false; }
    INV.items[PISTA()] -= 3; if (!INV.items[PISTA()]) delete INV.items[PISTA()]; addItem(BRZ()); SND.level(); toast(n.nm + ' te da el ' + ITEMS[BRZ()].n.toLowerCase() + '.'); persist(); return true; }
  /* misiones de búsqueda: te piden algo, lo traés, te dan algo (una sola vez por cuenta) */
  /* trueques que se repiten: Claudia (3 puchos → chaleco) y Pablo (3 manzanas → venda azul) */
  const TRADES = { claudia: ['cigarrillo', 3, () => Math.random() < .25 ? 'chaleco_a' : 'chaleco', 'Traeme 3 puchos y te doy un chaleco.', 'Tomá, abrigate. Y no me mires así.'],
    pablo: ['manzana', 3, () => 'vendas_a', 'Si me traés 3 manzanas te doy una venda azul.', 'Gracias. Tomá, esta venda cura bien.'] };
  function npcTrade(n) { const t = TRADES[n.k] || TRADES[(n.k || '').replace(/_\d+$/, '')]; if (!t || EXP) return false; const [need, c, give, ask, thx] = t;
    if ((INV.items[need] || 0) < c) { npcSay(n, ask + ' (tenés ' + (INV.items[need] || 0) + '/' + c + ')'); return true; }
    INV.items[need] -= c; if (!INV.items[need]) delete INV.items[need]; const g = give(); takeItem(g); SND.level(); npcSay(n, thx); toast('Recibiste: ' + ITEMS[g].n + '.'); quickBtns(); hud(); persist(); return true; }
  function questTalk(n) { const q = n.quest; INV.quests = INV.quests || {};
    if (INV.quests[q.id]) { if (n.shop) return openShop(n); if (npcTrade(n)) return; return npcSay(n, q.done); }
    const falta = Object.entries(q.need).filter(([k, c]) => (INV.items[k] || 0) < c);
    if (falta.length) { INV.quests_seen = INV.quests_seen || {}; INV.quests_seen[q.id] = n.nm; npcSay(n, q.txt + ' (' + Object.entries(q.need).map(([k, c]) => ITEMS[k].n + ' ' + Math.min(c, INV.items[k] || 0) + '/' + c).join(' · ') + ')'); return; }
    Object.entries(q.need).forEach(([k, c]) => { INV.items[k] -= c; if (INV.items[k] <= 0) delete INV.items[k]; });
    const g = q.give || {}; Object.entries(g.items || {}).forEach(([k, c]) => addItem(k === 'pista' ? PISTA() : k, c)); if (g.coins) INV.coins += g.coins;
    if (g.xp) { const lb = lvlOf(P.xp); P.xp += g.xp; if (lvlOf(P.xp) > lb) { P.hp = maxHp(lvlOf(P.xp)); SND.level(); } }
    if (g.ab) { const can = Object.keys(AB).filter(a => !INV.ab.includes(a)); if (can.length) { INV.ab.push(can[(Math.random() * can.length) | 0]); abButtons(); } }
    INV.quests[q.id] = 1; SND.level(); buzz([30, 40, 60]); toast('MISIÓN CUMPLIDA · ' + n.nm + ': "' + q.done + '"'); hud(); persist(); }
  /* lo que dicen los personajes: en la caja de diálogo con su retrato (como en las misiones) */
  /* ALIADOS: los personajes de mapa con bando le pegan a los Oscuros y a los enemigos de su bando que tengan cerca */
  /* Si estás peleando cerca de un aliado (personaje de mapa con bando), se acerca, le pega al mismo monstruo y después vuelve a su lugar.
     Cada celular mueve a los aliados por su cuenta (siguen a los monstruos, que son los mismos para todos); el daño lo pone solo el host. */
  const ALLY_VE = 650, ALLY_SP = 230;
  function allyTick(dt) { npcsHere().forEach(n => { if (n.obj || n.dama || !n.fac) return; const hx = n.x * WS, hy = n.y * WS; n.ox = n.ox || 0; n.oy = n.oy || 0; const ax = hx + n.ox, ay = hy + n.oy;
      const fighters = [[P.x, P.y, !P.dead]].concat([...others.values()].map(o => [o.x, o.y, !o.dead]));
      let tg = n.tgId && mobs.find(m => m.id === n.tgId && m.hp > 0);
      if (!tg || Math.hypot(tg.x - hx, tg.y - hy) > ALLY_VE) { tg = mobs.filter(m => m.hp > 0 && !m.T.passive && !m.cl && !m.T.npc && (!m.T.fac || m.T.fac !== n.fac) && Math.hypot(m.x - hx, (m.y - hy) * 1.2) < ALLY_VE && fighters.some(([fx_, fy_, al]) => al && Math.hypot(m.x - fx_, m.y - fy_) < 320))
          .sort((a, b) => Math.hypot(a.x - ax, a.y - ay) - Math.hypot(b.x - ax, b.y - ay))[0]; n.tgId = tg ? tg.id : null; }
      let gx = hx, gy = hy; if (tg) { gx = tg.x + (ax < tg.x ? -85 : 85); gy = tg.y; }
      const dx = gx - ax, dy = gy - ay, d = Math.hypot(dx, dy); n.mv = d > 14;
      if (n.mv) { const st = Math.min(d, ALLY_SP * (tg ? 1 : .8) * dt), mx = dx / d * st, my = dy / d * st; if (walkable(ax + mx, ay + my)) { n.ox += mx; n.oy += my; } else if (walkable(ax + mx, ay)) n.ox += mx; else if (walkable(ax, ay + my)) n.oy += my; n.face = dx < 0 ? 'l' : 'r'; n.walkT = (n.walkT || 0) + st * .03; }
      else if (!tg) { n.face = null; }
      if (n.atkT > 0) n.atkT -= dt;
      if (tg && Math.hypot(tg.x - (hx + n.ox), (tg.y - (hy + n.oy)) * 1.3) < 130) { n.face = tg.x < hx + n.ox ? 'l' : 'r'; n.cd = (n.cd || 0) - dt;
        if (n.cd <= 0) { n.cd = 1; n.atkT = .3; fx(['tajo_corto', 'estocada', 'impacto'][(Math.random() * 3) | 0], tg.x, tg.y - 70, { w: 150, T: .3, flip: tg.x < hx + n.ox });
          if (isHost) { const lv = (MAP.lv || [1, 3])[1], dmg = Math.round((14 + lv * 2.2) * (tg.T.boss ? .5 : 1)); floats.push({ x: tg.x, y: tg.y - (tg.T.h || 150) * .8, t: .7, txt: '-' + dmg, c: '#ffd27a' }); mobHit(tg, dmg, tg.x < hx + n.ox ? -18 : 18, 0, 'npc:' + n.k); } } } }); }
  /* algunos personajes te hablan solos cuando te acercás (n.near), como mucho cada 90 s */
  const nearSaid = {}; let nearT = 0;
  function nearTalk(dt) { if ((nearT += dt) < .5 || P.dead) return; nearT = 0; const n = nearNpc(); if (!n || !n.near) return; const now = Date.now(); if (nearSaid[n.k] && now - nearSaid[n.k] < 90000) return; nearSaid[n.k] = now; npcSay(n, n.near); }
  function npcSay(n, txt) { if (window.CZ_STORY && CZ_STORY.say && !EXP) CZ_STORY.say([[n.k, String(txt), n.nm]]); else toast(n.nm + ': "' + txt + '"'); }
  function talkNpc(n) { SND.pick();
    if ((n.k === 'mary' && me.faction !== 'ork') || (n.k === 'mercedes' && me.faction === 'ork')) { if (giveKit(n)) return; }
    if (n.dama) return damaTalk(n);
    if (n.lib) return openLib(n.lib);
    if (n.bot) return openBotin(n);
    if (n.pod) return usePod();
    if (n.caps) { INV.cas = INV.cas || {}; if (INV.cas[n.id] === dayN()) return toast('La cápsula está vacía. Se vuelve a cargar mañana.'); INV.cas[n.id] = dayN(); const jk = mapKey === 'lab_cuarentena' && Math.random() < .3 ? 'jeringa_max' : 'jeringa'; addItem(jk); SND.pick(); buzz(30); toast('Abriste la cápsula: ' + ITEMS[jk].n + '.'); quickBtns(); persist(); return; }
    if (n.cas) { const op = INV.cas && INV.cas[n.id] === dayN(); if (op) return toast('Casillero abierto. Ya no queda nada (vuelve a llenarse mañana).'); if (!hasItem('ganzuas')) return toast('Casillero cerrado. Necesitás ganzúas para forzarlo.'); return useItem('ganzuas', 'use'); }
    if (n.story && window.CZ_STORY) return CZ_STORY.talk(n);
    if (n.act === 'kit') return n.fac !== me.faction ? hostil(n) : openKit(n);
    if (STORY && window.CZ_STORY && CZ_STORY.talkHook(n)) return;
    if (n.fac && n.fac !== me.faction && !n.heal && !n.brz) return hostil(n);
    if (n.quest && !(n.heal && (INV.quests || {})[n.quest.id])) { if (n.heal && P.hp < maxHp(lvlOf(P.xp)) * .5) {} else return questTalk(n); }
    if (n.shop && !n.heal) return openShop(n);
    if (!n.quest && /^pablo/.test(n.k || '') && npcTrade(n)) return;
    if (!n.heal && !n.brz && n.act !== 'shop') return npcSay(n, n.line);
    if (n.brz && !n.heal) { if (me.faction !== n.brz) return hostil(n); if (!tryBrazalete(n)) npcSay(n, n.line + ' Necesito 3 pistas, tenés ' + (INV.items[PISTA()] || 0) + '.'); return; }
    if (n.act === 'shop') return openShop();
    if (n.heal) { const lv = lvlOf(P.xp);
      if (n.heal !== 'any' && me.faction !== n.heal) return hostil(n);
      if (n.brz && tryBrazalete(n)) return;
      if ((healCd[n.k] || 0) > Date.now()) return npcSay(n, 'Todavía no. Volvé en ' + Math.ceil((healCd[n.k] - Date.now()) / 1000) + ' segundos.');
      if (P.hp >= maxHp(lv)) return toast('Estás entero. ' + n.nm + ' te deja ir.');
      P.hp = maxHp(lv); healCd[n.k] = Date.now() + 90000; SND.level(); floats.push({ x: P.x, y: P.y - 200, t: 1.2, txt: 'vida completa', c: '#9fe0b0' }); hud(); persist(); } }
  /* ---------- controles ---------- */
  const keys = {}; let joy = { on: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
  addEventListener('keydown', e => { if (document.activeElement === $('#say-in')) return; keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.toLowerCase() === 'j') attack(); if (e.key === 'Enter' || e.key.toLowerCase() === 'k') pressA(); if (e.key === 'Escape') openMenu(); if (e.key.toLowerCase() === 'q') cycleWeapon(); if (e.key.toLowerCase() === 'h') quickUse('cura'); if (e.key.toLowerCase() === 'e') quickUse('esp'); if (e.key.toLowerCase() === 'x') goGhost(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const cv = $('#cv');
  /* joystick 2.1: base fija abajo a la izquierda; si tocás en otro lado de la mitad izquierda, se mueve ahí. Zona muerta, captura del dedo y se suelta solo si algo lo interrumpe */
  const stickHome = () => [Math.max(96, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sal')) || 0) + 96), innerHeight - 128];
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
  $('#btn-k').addEventListener('pointerdown', e => { e.preventDefault(); useHab(); });
  $('#btn-e').addEventListener('pointerdown', e => { e.preventDefault(); quickUse('x'); });
  $('#say-b').onclick = () => { if (!P || P.dead) return; const s_ = $('#say'); s_.hidden = false; const i = $('#say-in'); i.value = ''; i.focus(); };
  let runHeld = false; const rb = $('#btn-r');
  rb.addEventListener('pointerdown', e => { e.preventDefault(); runHeld = true; rb.classList.add('on'); try { rb.setPointerCapture(e.pointerId); } catch (x) {} });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => rb.addEventListener(ev, () => { runHeld = false; rb.classList.remove('on'); }));
  $('#btn-x').addEventListener('pointerdown', e => { e.preventDefault(); goGhost(); });
  /* tienda de Plaza de Mayo */
  const SHOP = [['kit', 100, 'Vida completa'], ['vendas', 3, 'Cura el 22% de tu vida (3 s)'], ['pilas', 2, 'Recargan la linterna'], ['lanza', 8, 'Llega lejos y atraviesa · 30 golpes'], ['kitsune', 10, 'Desaparecés 3 segundos · 2 usos'], ['ganzuas', 6, 'Abren un casillero · se gastan']];
  let curShop = null; function openShop(n) { if (!n || !n.nm) n = npcsHere().find(x => x.act === 'shop' || x.shop); if (!n || P.dead) return; curShop = (n.shop ? n.shop.map(([k, p]) => [k, p, ITEMS[k].d]) : SHOP.slice()); [['venda_q', 6], ['antiveneno', 6], ['trampa', 12], ['fragmento', 45], ['balas', 6], ['cart_itaka', 9], ['cargador', 14], ['virotes', 8], ['molotov', 15], ['vendas_a', 8]].concat(n.k === 'rosa' ? [['jeringa', 30]] : []).concat(n.shop && n.shop.some(([k]) => ITEMS[k] && ITEMS[k].eq === 'arma' && WEAP[k] && WEAP[k].gun) ? [['metralleta', 110]] : []).forEach(([k, p]) => { if (!curShop.some(r => r[0] === k)) curShop.push([k, p, ITEMS[k].d]); });
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
  const playerDmg = () => Math.round(Math.max(1, dmgOf(lvlOf(P.xp)) + (INV ? WEAP[curW()].dmg : 0) - (INV && INV.eq.brazo === 'b_contencion' ? 1 : 0)) * (P.furia > 0 ? 2 : 1) * (P.jefe > 0 ? 1.6 : 1) * (WEAP[curW()].mul || 1) * (1 + gearSum('dmg')) * (WEAP[curW()].gun ? 1 + gearSum('gdmg') : 1) * (gearSum('fauno') && P.running ? 2 : 1) * 10) / 10;
  function attack() { if (!P || P.dead || paused || P.cd > 0) return; const wk = curW(), W = WEAP[wk], EI = ITEMS[wk] || {}; if (W.gun && !gunReady(wk)) return; P.atk = .3; P.cd = W.cd * (INV.ab.includes('rapido') ? .7 : 1); P.wk = wk;
    if (P.gorro) { P.gorro = 0; P.ghost = 0; }
    const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir], dmg = playerDmg(), range = W.range; let hitAny = false; const hitList = [];
    if (MAP.mvp && mvpObjs.length) hitObjs(W.gun ? 300 : range);
    if (W.gun) { shoot(fx, dmg, W); return; }
    swingFx(wk);
    if (EI.lamento) { if (P.lamC % 3 === 2 && P.lamTg && !mobs.some(m => m.id === P.lamTg && m.hp > 0)) { const nx = mobs.filter(m => m.hp > 0 && !m.T.passive && Math.hypot(m.x - P.x, m.y - P.y) < 700).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
        if (nx) { for (let i = 0; i < 16; i++) parts.push({ x: P.x + rnd(-20, 20), y: P.y - rnd(0, 150), vx: rnd(-50, 50), vy: rnd(-80, -10), life: .6, s: 4, c: 10 }); const bx = nx.x - (nx.face || 1) * 90; if (walkable(bx, nx.y)) { P.x = bx; P.y = nx.y; } else { P.x = nx.x; P.y = nx.y + 40; } P.dir = (nx.x - P.x) < 0 ? 'l' : 'r'; P.lamTg = nx.id; floats.push({ x: P.x, y: P.y - 220, t: 1, txt: 'SOMBRA', c: '#b080ff' }); } } }
    sendPos(true); SND.swing(); buzz(12);
    mobs.slice().forEach(o => { if (o.vis < .5) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range + (o.T.heavy ? 30 : 0)) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      hitAny = true; const kb = o.T.heavy ? (wk === 'bate' && !o.T.boss ? 14 : 0) : (o.st === 'run' ? 8 : W.kb); hitList.push(o); hitMob(o, dmg, fx[0] * kb, fx[1] * kb, EI.lamento && P.lamC % 3 === 2 ? { stun: 5, k: 'para' } : null);
      if (EI.empuje && !o.T.heavy) { const lx = o.x + fx[0] * 170, ly = o.y + fx[1] * 130, other = mobs.find(m => m !== o && m.hp > 0 && Math.hypot(m.x - lx, m.y - ly) < 110); if (other) { mobFx(o, { stun: 5 }); mobFx(other, { stun: 5 }); floats.push({ x: lx, y: ly - 150, t: 1, txt: '¡PLAF!', c: '#ffe070' }); } } });
    if (P.clone && P.clone.t > 0) { const cx = P.clone.x, cy = P.clone.y; mobs.slice().forEach(o => { if (o.vis < .5 || o.hp <= 0) return; const d_ = Math.hypot(o.x - cx, (o.y - cy) * 1.3); if (d_ < range + 20) { hitAny = true; hitMob(o, dmg, 0, 0); } }); }
    if (hitList.length) { if (EI.lamento) { P.lamC = (P.lamC || 0) + 1; P.lamTg = hitList[0].id; } if (EI.boom && (P.boomC = (P.boomC || 0) + 1) % 2 === 0) shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 760, vy: fx[1] * 760 * .8, life: 1.3, dmg: dmg * 1.4, fire: 1, boom: 1, t0: 0, fx: { dot: 3, dps: dmg, c: 'f' } });
      if (EI.moco && (P.mocoC = (P.mocoC || 0) + 1) % 3 === 0) shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 560, vy: fx[1] * 560 * .8, life: 1, dmg: dmg, moco: 1, fx: { dot: 5, dps: dmg * .8, c: 'p', slow: 5 } }); }
    if (INV.ab.includes('cuchillos')) throwKnife(fx, dmg);
    others.forEach((o, id) => { if (!enemy(o)) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      const d = dmg * 8; hitAny = true; o.hurt = .2; floats.push({ x: o.x + rnd(-10, 10), y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' });
      net('hit', { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) }); });
    if (hitAny) { SND.hit(); buzz(25); wearWeapon(); } }
  /* pistola: la bala viaja y pega al primero que encuentra */
  function shoot(fx, dmg, W) { const wkS = baseOf(curW()); const n0 = shots.length; setTimeout(() => { for (let i = n0; i < shots.length; i++) if (!shots[i].wk) shots[i].wk = wkS; }, 0); if (W && W.flame) { const ox = P.x + fx[0] * 40, oy = P.y - 90 + fx[1] * 20; for (let i = 0; i < 3; i++) { const a = rnd(-.22, .22), c_ = Math.cos(a), s_ = Math.sin(a), vx = fx[0] * c_ - fx[1] * s_, vy = fx[0] * s_ + fx[1] * c_; shots.push({ x: ox, y: oy, vx: vx * 620, vy: vy * 620 * .8, life: .32, dmg: Math.max(1, Math.round(dmg * .6)), fire: 1, flame: 1 }); }
      if ((P.flameS = (P.flameS || 0) + 1) % 3 === 0) SND.shot(); wearWeapon(); buzz(8); sendPos(true); net('shot', { x: Math.round(ox), y: Math.round(oy), vx: fx[0], vy: fx[1] }); return; }
    const ox = P.x + fx[0] * 40, oy = P.y - 95 + fx[1] * 20, sp = W && W.fire ? 650 : 1100;
    const dirs = W && W.spread ? [-.13, .13] : [0]; dirs.forEach(a => { const c_ = Math.cos(a), s_ = Math.sin(a), vx = fx[0] * c_ - fx[1] * s_, vy = fx[0] * s_ + fx[1] * c_; shots.push({ x: ox, y: oy, vx: vx * sp, vy: vy * sp * .8, life: W && W.fire ? 1.1 : W && W.bolt ? .8 : .6, dmg, fire: W && W.fire ? 1 : 0, bolt: W && W.bolt ? 1 : 0, hitIds: W && W.bolt ? [] : null }); });
    SND.shot(); buzz(30); shake = Math.max(shake, .12); sendPos(true); net('shot', { x: Math.round(ox), y: Math.round(oy), vx: fx[0], vy: fx[1] }); wearWeapon(); }
  function throwKnife(fx, dmg) { shots.push({ x: P.x + fx[0] * 30, y: P.y - 95, vx: fx[0] * 820, vy: fx[1] * 820 * .8, life: .55, dmg, knife: 1 }); }
  /* vendas: 3 segundos entre una y otra */
  function useVenda(k) { k = k && ITEMS[k] && ITEMS[k].use === 'venda' && hasItem(k) ? k : ['vendas', 'vendas_a', 'vendas_p', 'vendas_n'].find(hasItem); if (!k) return toast(EXP ? 'No tenés vendas. Buscalas en los mapas de Haedo.' : 'No tenés vendas. Rosa las vende en Plaza de Mayo.'); const lv = lvlOf(P.xp);
    if (P.dead) return; if ((P.vendaCd || 0) > 0) return; if (P.hp >= maxHp(lv)) return toast('Ya estás con la vida completa.');
    const v = Math.max(30, Math.round(maxHp(lv) * (ITEMS[k].pct || .22))); P.regen = { left: 3, rate: v / 3 }; P.vendaCd = .8; INV.items[k]--; if (!INV.items[k]) delete INV.items[k]; SND.pick(); quickBtns(); floats.push({ x: P.x, y: P.y - 200, t: 1.2, txt: '+' + v + ' en 3 s', c: '#9fe0b0' }); hud(); healBtn(); }
  const QUICK_HEAL = ['venda', 'heal', 'comer', 'vida', 'vendaq', 'antiveneno', 'jeringa'];
  const LORE = ['Lucía, 34 años. La vieron entrar al subte de Once. Nunca salió.', 'El que vuelve no siempre recuerda. El que recuerda no siempre vuelve.', 'VIREX repartió la vacuna gratis. Después vinieron los Oscuros.', 'Si escuchás un chillido, no corras: el ruido los llama.', 'Hay un viajero que regresa sin mutar. Lo buscan todos.', 'En el puerto hay un refugio que parece normal. No lo es.', 'Mariano anota nombres. Dice que mientras alguien los nombre, no se pierden.', 'Refugio Norte: tachado. Puerto Madero: subrayado dos veces.'];
  function healBtn() { quickBtns(); }
  function quickBtns() { if (!INV) return; const q = INV.q = INV.q || {}; if (q.cura && !hasItem(q.cura)) q.cura = null; if (!q.cura) q.cura = ['vendas', 'vendas_a', 'vendas_p', 'vendas_n', 'manzana', 'kit', 'suero'].find(k => hasItem(k)) || null; if (q.hab && !habOk(q.hab)) q.hab = null; if (!q.hab) q.hab = habAuto(); if (q.x && !hasItem(q.x)) q.x = null; if (!q.x) q.x = ['granada', 'molotov', 'pocion', 'pocion_a', 'pocion_p', 'pocion_n', 'antiveneno', 'venda_q', 'filtro', 'manzana'].find(k => hasItem(k) && k !== q.cura && k !== q.hab) || null; if (q.esp && !hasItem(q.esp)) q.esp = null; if (!q.esp) q.esp = ['brz_jefe', 'brz_ork', 'brz_reb', 'kitsune', 'linterna'].find(k => hasItem(k)) || null;
    const put = (id, k) => { const b = $(id); if (!b) return; const cv = b.querySelector('canvas'), n = b.querySelector('i'); if (cv) { const g_ = cv.getContext('2d'); g_.clearRect(0, 0, 48, 48); if (k) { const ic = iconOf(k); g_.imageSmoothingEnabled = !!ic.naturalWidth; try { g_.drawImage(ic, 4, 4, 40, 40); } catch (e) {} } } if (n) n.textContent = k ? (INV.items[k] || 0) : ''; b.classList.toggle('off', !k); };
    put('#btn-h', q.cura); put('#btn-s', q.esp); put('#btn-k', q.hab); put('#btn-e', q.x); { const kb = $('#btn-k'); if (kb) { const it = q.hab && ITEMS[q.hab]; const cd = it && it.act ? Math.max(0, ((INV.habT || {})[q.hab] || 0) - Date.now()) : 0; const n = kb.querySelector('i'); if (n && it && it.act) n.textContent = cd ? Math.ceil(cd / 1000) + 's' : '∞'; kb.classList.toggle('cd', cd > 0); } } const w = $('#btn-w'); if (w) { put('#btn-w', INV.eq.arma === 'palo' ? 'palo' : INV.eq.arma); const n = w.querySelector('i'); if (n) n.textContent = weaponLabel(); } }
  function quickUse(slot) { if (!INV || !P || P.dead || paused) return; const k = (INV.q || {})[slot]; if (!k || !hasItem(k)) return toast(slot === 'cura' ? 'No tenés nada para curarte. Elegí uno en la MOCHILA.' : slot === 'x' ? 'El 4º acceso está vacío. Elegí algo en la MOCHILA (PONER EN 4º ACCESO).' : 'No tenés objeto especial. Elegí uno en la MOCHILA.');
    const it = ITEMS[k]; if (it.use === 'venda') return useVenda(k); if (it.use === 'kitsune') return useKitsune(); useItem(k, 'use'); paused = false; $('#ov-inv').hidden = true; quickBtns(); }
  function abButtons() { $('#btn-x').hidden = !INV.ab.includes('invis') && !hasItem('kitsune'); }
  function useKitsune() { if (!hasItem('kitsune') || P.dead) return; if ((P.ghost || 0) > 0) return; P.ghost = 3; if (INV.dur.kitsune == null) INV.dur.kitsune = 2; INV.dur.kitsune--; SND.mob('whisper', .3); sendPos(true);
    if (INV.dur.kitsune <= 0) { INV.items.kitsune--; if (INV.items.kitsune > 0) INV.dur.kitsune = 2; else { delete INV.items.kitsune; delete INV.dur.kitsune; } toast('Desaparecés 3 segundos. La máscara kitsune se partió.'); } else toast('Desaparecés 3 segundos. A la máscara le queda 1 uso.'); abButtons(); hud(); persist(); }
  function goGhost() { if (P.dead) return; if (!INV.ab.includes('invis') || ((P.ghostCd || 0) > 0 && hasItem('kitsune'))) return useKitsune(); if ((P.ghostCd || 0) > 0) return toast('HUIR vuelve en ' + Math.ceil(P.ghostCd) + ' s.'); P.ghost = 3; P.ghostCd = 20; SND.mob('whisper', .3); sendPos(true); toast('Invisible por 3 segundos.'); }
  function updateShots(dt) { for (let i = shots.length - 1; i >= 0; i--) { const b = shots[i]; const steps = 4; let hit = false;
      for (let k = 0; k < steps && !hit; k++) { b.x += b.vx * dt / steps; b.y += b.vy * dt / steps; const gy = b.y + 95;
        if (!walkable(b.x, gy) && !b.fake) { hit = true; break; }
        if (b.fake) continue;
        for (const o of mobs) { if (o.vis < .5 || b.enemy) continue; if (b.hitIds && b.hitIds.includes(o.id)) continue; if (Math.abs(o.x - b.x) < o.T.pw * PXS * .45 && gy > o.y - 40 && gy < o.y + 40) { if (b.hitIds) b.hitIds.push(o.id); else hit = true; const l = Math.hypot(b.vx, b.vy) || 1, kb = o.T.heavy ? 0 : 14; SND.hit(); hitMob(o, b.dmg, b.vx / l * kb, b.vy / l * kb, b.fx || null);
          if (b.heal) { const mh = maxHp(lvlOf(P.xp)); P.hp = Math.min(mh, P.hp + mh * b.heal); floats.push({ x: P.x, y: P.y - 200, t: .9, txt: '+' + Math.round(mh * b.heal), c: '#9fe0b0' }); hud(); } if (b.tear) o.frzBy = me.id; break; } }
        if (!hit) others.forEach((o, id) => { if (hit || !enemy(o)) return; if (Math.abs(o.x - b.x) < 40 && gy > o.y - 40 && gy < o.y + 40) { hit = true; const d = b.dmg * 6; o.hurt = .2; floats.push({ x: o.x, y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' }); SND.hit();
            net('hit', { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) }); } }); }
      if (b.boom) { b.t0 += dt; if (b.t0 > .55 && !b.back) { b.back = 1; b.vx = -b.vx; b.vy = -b.vy; } }
      b.life -= dt; if (hit || b.life <= 0) { for (let j = 0; j < 6; j++) parts.push({ x: b.x, y: b.y + 95 - 95, vx: rnd(-80, 80), vy: rnd(-80, 0), life: .3, s: 2, c: 200 }); shots.splice(i, 1); } } }
  function pressA() { if (!P || P.dead || paused) return; if (mvpEv && mvpEv.rev) return revive(mvpEv.rev); const n = nearNpc(); if (n) return talkNpc(n); }
  function sendSay() { const t = $('#say-in').value.trim(); $('#say').hidden = true; $('#say-in').blur(); if (!t) return; P.say = t; P.sayT = 6; net('say', { id: me.id, t }); }
  $('#say-go').onclick = sendSay; $('#say-in').addEventListener('keydown', e => { if (e.key === 'Enter') sendSay(); if (e.key === 'Escape') { $('#say').hidden = true; $('#say-in').blur(); } });

  /* ---------- menú / salir ---------- */
  function openMenu() { if (!running) return; paused = true; $('#ov-menu').hidden = false; }
  $('#menu-b').onclick = openMenu; $('#m-back').onclick = () => { paused = false; $('#ov-menu').hidden = true; };
  $('#m-snd').onclick = () => { SND.init(); $('#m-snd').textContent = 'SONIDO: ' + (SND.toggle() ? 'SÍ' : 'NO'); $('#snd-b').classList.toggle('off', !SND.on); };
  $('#snd-b').onclick = () => { SND.init(); const on = SND.toggle(); $('#snd-b').classList.toggle('off', !on); $('#m-snd').textContent = 'SONIDO: ' + (on ? 'SÍ' : 'NO'); toast(on ? 'Sonido prendido.' : 'Sonido apagado.'); };
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
    setTimeout(() => { cleanse(false); P.hp = maxHp(lvlOf(P.xp)); P.dead = false; hud(); const [hz, hp_] = home(); if (mapKey !== hz) enterMap(hz, hp_[0] * WS, hp_[1] * WS); else { P.x = hp_[0] * WS; P.y = hp_[1] * WS; P.inv = 4; } hud(); sendPos(true); persist(); $('#fade').classList.remove('on'); }, 600); };

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
    if (P.mv) { const sp = 175 * Math.min(1, mag) * (P.slow > 0 ? .45 : 1) * (P.fast > 0 ? (P.potion ? 1.6 : 1.3) : 1) * (1 + gearSum('spd')) * (P.smoke > 0 ? .75 : 1) * (wantRun ? (me.faction === 'rebel' ? 1.9 : 1.65) : 1); const vx = ix / mag * sp * dt, vy = iy / mag * sp * dt;
      if (walkable(P.x + vx, P.y)) P.x += vx; if (walkable(P.x, P.y + vy)) P.y += vy;
      P.dir = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'l' : 'r') : (iy < 0 ? 'u' : 'd'); if (Math.abs(ix) > .2) P.face = ix < 0 ? -1 : 1;
      P.walkT += dt * 9 * Math.min(1, mag) * (wantRun ? 1.6 : 1); P.stepT -= dt; if (P.stepT <= 0) { P.stepT = wantRun ? .22 : .36; SND.step(); } if (wantRun && Math.random() < .5) parts.push({ x: P.x + rnd(-14, 14), y: P.y - rnd(0, 10), vx: rnd(-30, 30), vy: rnd(-30, -5), life: .4, s: rnd(2, 4), c: 120 }); }
    P.atk = Math.max(0, P.atk - dt); P.cd = Math.max(0, P.cd - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.inv = Math.max(0, P.inv - dt); if (P.sayT > 0) P.sayT -= dt;
    if (P.furia > 0) { P.furia -= dt; if ((t % .2) < dt) parts.push({ x: P.x + rnd(-20, 20), y: P.y - rnd(40, 160), vx: 0, vy: -60, life: .5, s: 4, c: 200, fire: 1 }); if (P.furia <= 0) { P.furia = 0; P.hp = Math.min(P.hp, 10); SND.hurt(); toast('La furia se terminó. Quedaste agotado: 10 de vida.'); hud(); } }
    if (P.jefe > 0) { P.jefe -= dt; if ((t % .25) < dt) parts.push({ x: P.x + rnd(-24, 24), y: P.y - rnd(30, 180), vx: 0, vy: -50, life: .6, s: 4, c: 200, fire: 1 }); if (P.jefe <= 0) { P.jefe = 0; P.hp = Math.min(P.hp, maxHp(lvlOf(P.xp))); toast('El poder de jefe se apagó.'); hud(); } }
    if (P.slow > 0) P.slow -= dt; if (P.stunT > 0) P.stunT -= dt; if (P.fast > 0) P.fast -= dt; if (P.smoke > 0) P.smoke -= dt;
    if (P.burn > 0 && !P.dead) { P.burn -= dt; P.dotT = (P.dotT || 0) + dt; if (Math.random() < dt * 8) parts.push({ x: P.x + rnd(-18, 18), y: P.y - rnd(20, 150), vx: rnd(-10, 10), vy: -60, life: .5, s: 4, c: 200, fire: 1 }); }
    if (P.poison > 0 && !P.dead) { P.poison -= dt; P.dotT = (P.dotT || 0) + dt; if (Math.random() < dt * 4) parts.push({ x: P.x + rnd(-14, 14), y: P.y - rnd(40, 150), vx: 0, vy: -30, life: .7, s: 3, c: 120 }); }
    if ((P.burn > 0 || P.poison > 0) && P.dotT >= 1 && !P.dead) { P.dotT = 0; const dd = (P.burn > 0 ? 3 : 0) + (P.poison > 0 ? (P.poisonK || 2) : 0); if (!(P.poison > 1)) P.poisonK = 0; P.hp -= dd; floats.push({ x: P.x, y: P.y - 200, t: .7, txt: (P.burn > 0 ? 'QUEMADO ' : '') + (P.poison > 0 ? 'VENENO ' : '') + '-' + dd, c: P.burn > 0 ? '#ff9a50' : '#9fe070' }); hud(); if (P.hp <= 0) { P.hp = 1; hitPlayer(999, null, 0, null, P.burn > 0 ? 'incinerario' : 'insecto'); } }
    { const fx = $('#fx-st'); if (fx) { const tx = (P.burn > 0 ? '🔥 QUEMADO · venda para quemaduras  ' : '') + (P.poison > 0 ? '☠ ENVENENADO · antiveneno' : '') + (P.smoke > 0 ? ' · sin aire' : '') + (P.fast > 0 ? ' · veloz' : '') + (P.goo > 0 ? ' · 🟢 EN EL MOCO: te pegan el doble' : P.stunT > 0 ? ' · 💫 ATURDIDO' : ''); if (fx.textContent !== tx) fx.textContent = tx; fx.hidden = !tx; } }
    contTick(dt); nearTalk(dt); allyTick(dt); if ((P.inmune > 0 || INV.cont > 0) && (t % .5) < dt) hudCont(); pvpTick(dt); if (STORY && window.CZ_STORY) CZ_STORY.tick(dt);
    const fireD = MAP.fire ? Math.hypot(P.x - MAP.fire[0] * WS, P.y - MAP.fire[1] * WS) : 9999;
    SND.fire(Math.max(0, 1 - fireD / 700));
    const lv = lvlOf(P.xp);
    if (INV.eq.luz) { INV.bat = Math.max(0, INV.bat - dt * .8); if (INV.bat <= 0) { if (hasItem('pilas')) { INV.items.pilas--; if (!INV.items.pilas) delete INV.items.pilas; INV.bat = 100; toast('Cambiaste las pilas de la linterna.'); } else { INV.eq.luz = null; toast('La linterna se quedó sin pilas.'); } } if ((t % 1) < dt) hud(); }
    shake = Math.max(0, shake - dt); updateShots(dt); updateMobShots(dt); sueroTick(false);
    gearTick(dt); mvpTick(dt); fxTick(dt); P.vendaCd = Math.max(0, (P.vendaCd || 0) - dt); P.ghost = Math.max(0, (P.ghost || 0) - dt); P.ghostCd = Math.max(0, (P.ghostCd || 0) - dt);
    $('#shop-b').hidden = true; const nn = nearNpc(); const rv = mvpEv && mvpEv.rev; const al = $('#a-lab'); if (al) { const want = rv ? 'REVIVIR' : nn ? nn.nm : 'HABLAR'; if (al.textContent !== want) al.textContent = want; } $('#btn-a').hidden = !nn && !rv; npcsHere().forEach(n => { if (n.sayT > 0) n.sayT -= dt; });
    for (let i = pickups.length - 1; i >= 0; i--) { const q = pickups[i]; q.t += dt; if (q.cool > 0) { q.cool -= dt; continue; } if (!P.dead && Math.hypot(q.x - P.x, (q.y - P.y) * 1.2) < 70) { pickups.splice(i, 1); if (q.k === 'pista') q.k = PISTA(); q.k = resolveLoot(q.k); if (!ITEMS[q.k]) continue; const got = takeItem(q.k); if (got) q.k = got; SND.pick(); buzz(20);
        if (EXP && /^pista_/.test(q.k) && INV.items[q.k] >= 3) { INV.items[q.k] -= 3; if (!INV.items[q.k]) delete INV.items[q.k]; addItem(BRZ()); setTimeout(() => toast('Juntaste 3 pistas: tenés el ' + ITEMS[BRZ()].n.toLowerCase() + '. Usalo desde la MOCHILA.'), 1200); } if (q.k === 'suero') sueroTaken(); if (q.pid) net('took', { pid: q.pid });
        if (got === q.k && !(ITEMS[q.k].gun && INV.items[q.k] > 1)) toast('Encontraste: ' + ITEMS[q.k].n + (ITEMS[q.k].r && ITEMS[q.k].r !== 'g' ? ' (' + RAR[ITEMS[q.k].r][0] + ')' : '') + (ITEMS[q.k].eq ? ' · equipalo desde la MOCHILA' : ITEMS[q.k].hab ? ' · va en HABILIDAD' : ''));
        if (q.k === 'pagina') { const n = INV.items.pagina; floats.push({ x: P.x, y: P.y - 210, t: 1.6, txt: 'página ' + n, c: '#e8e4da' }); }
        if (q.k === 'suero') net('suero', { slot: suero.slot, by: me.nick }); abButtons();
        if (q.loc) { const mk = mapKey; setTimeout(() => { if (mapKey === mk && pickups.length < (MAP.safeAll ? 1 : 2)) spawnPickup(); }, rnd(120000, 240000)); } persist(); } }
    if (yuki) { yuki.t += dt; yukiTouch(); }
    // salidas
    const ix0 = P.x / WS, iy0 = P.y / WS; let inExit = null;
    (MAP.exits || []).forEach(e => { if (ix0 >= e.r[0] - 4 && ix0 <= e.r[2] + 4 && iy0 >= e.r[1] - 4 && iy0 <= e.r[3] + 4) inExit = e; });
    P.exitT = Math.max(0, (P.exitT || 0) - dt); if (!inExit) exitLock = false; else if (!exitLock && !P.dead && P.exitT <= 0) warp(inExit);
    // otros jugadores
    others.forEach(o => { if (o.buf) { const sx = o.x, sy = o.y; interp(o, o.mv); if (o.sm) { const k = Math.min(1, dt * 14), jx = o.x - sx, jy = o.y - sy; if (Math.hypot(jx, jy) < 220) { o.x = sx + jx * k; o.y = sy + jy * k; } } o.sm = 1; } else { o.x += (o.tx - o.x) * Math.min(1, dt * 10); o.y += (o.ty - o.y) * Math.min(1, dt * 10); } { const dd = Math.min(60, Math.hypot(o.x - (o.lpx ?? o.x), o.y - (o.lpy ?? o.y))); o.lpx = o.x; o.lpy = o.y; o.walkT = (o.walkT || 0) + dd * .03; } if (o.sayT > 0) o.sayT -= dt; if (o.atk > 0) o.atk -= dt; });
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
    mobs.slice().forEach(o => { const T = o.T; if (mobStatus(o, dt)) { o.t += dt; o.hurt = Math.max(0, o.hurt - dt); return; } if (T.ai === 'mvp') { mvpAI(o, dt, live, strikeOn); return; } o.t += dt; o.alpha = Math.min(1, o.alpha + dt * .8); o.hurt = Math.max(0, o.hurt - dt); o.cd = Math.max(0, o.cd - dt); o.lunge = Math.max(0, o.lunge - dt * 3); o.stT -= dt; o.ab -= dt; o.shotT -= dt;
      // objetivo: el jugador vivo más cercano que lo pueda ver
      let tg = null, best = 1e9; live.forEach(p => { if (T.fac && p.fac === T.fac) return; const d = Math.hypot(p.x - o.x, p.y - o.y); if (d < T.sight * p.sm * (o.chasing ? 1.4 : 1) && d < best) { best = d; tg = p; } });
      if (T.eyes && (INV.eq.luz || (tg && tg.me && INV.eq.luz))) { o.vis = Math.max(0, o.vis - dt * 2.5); if (o.vis <= 0) { const ii = mobs.indexOf(o); if (ii >= 0) mobs.splice(ii, 1); lastDeath[o.kind] = Date.now(); return; } tg = null; }
      if (T.passive) tg = null;
      if (o.give > 0) { o.give -= dt; tg = null; }
      if (tg && !T.boss && !o.chasing && mobs.filter(m => m.chasing && !m.T.boss).length >= 4) tg = null;
      if (o.chasing && tg && !T.boss) { o.chT = (o.chT || 0) + dt; if (o.chT > 16 && Math.hypot(tg.x - o.x, tg.y - o.y) > 280) { o.give = 7; o.chT = 0; tg = null; } } else if (!tg) o.chT = 0;
      const dx = tg ? tg.x - o.x : 0, dy = tg ? tg.y - o.y : 0, dist = tg ? (Math.hypot(dx, dy) || 1) : 1e9;
      if (tg && !o.chasing) { o.chasing = true; SND.mob(T.snd, Math.max(.08, .35 - Math.hypot(P.x - o.x, P.y - o.y) / 2000)); }
      if (!tg) { o.chasing = false; if (o.st !== 'idle' && T.ai !== 'blink' && !T.boss) o.st = 'idle'; }
      let mx = 0, my = 0, sp = T.wsp;
      const strike = () => { o.lunge = 1; o.cd = T.cd;
        if (T.ai === 'slam') { if (Math.hypot(P.x - o.x, P.y - o.y) < 700) shake = .4; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; parts.push({ x: o.x + Math.cos(a) * 30, y: o.y + Math.sin(a) * 12, vx: Math.cos(a) * 160, vy: Math.sin(a) * 60 - 20, life: .7, s: 4, c: 60 }); }
          live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.aoe) strikeOn(p, T.dmg, o, 110); }); }
        else if (T.ai === 'ranged') { if (tg) fireMob(o, tg, T.shot || 'fire'); }
        else if (T.ai === 'mole') { o.combo++; const big = o.combo % 3 === 0; if (big) { shake = Math.max(shake, Math.hypot(P.x - o.x, P.y - o.y) < 700 ? .5 : 0); for (let i = 0; i < 30; i++) parts.push({ x: o.x + o.face * 50, y: o.y - 20, vx: o.face * rnd(60, 220), vy: rnd(-120, -20), life: .6, s: 5, c: 70 }); }
          live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.reach + 30) strikeOn(p, big ? T.big : T.dmg, o, big ? T.bigKnock : 30); }); }
        else if (tg && dist < T.reach + 28) strikeOn(tg, T.dmg, o, T.knock || (T.boss ? 30 : 0)); };
      if (o.wind > 0) { o.wind -= dt; if (o.wind <= 0) { strike(); if (T.ai === 'blink') { o.st = 'fadeout'; o.stT = .45; o.far = Math.random() < .35; } } }
      else if (T.ai === 'angel' && tg) {
        const od = tg.me ? P.dir : ((others.get(tg.id) || {}).d || 'd'), fx_ = od === 'l' ? -1 : od === 'r' ? 1 : 0, fy_ = od === 'u' ? -1 : od === 'd' ? 1 : 0;
        const seen = (-dx * fx_ + -dy * fy_) > dist * .3 && dist < 1000;
        if (o.st === 'strike') { if (o.stT <= 0) { o.st = 'idle'; o.cd = T.cd; } else if (!seen) { sp = T.sp * .35; [mx, my] = steer(o, dx, dy, dist); } }
        else if (seen) { o.st = 'idle'; o.moving = false; }
        else if (dist < T.reach && o.cd <= 0) { strikeOn(tg, T.dmg, o, 70); o.lunge = 1; o.st = 'strike'; o.stT = 4; SND.mob('shriek', .3); }
        else { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); o.face = dx < 0 ? -1 : 1; } }
      else if (T.ai === 'scream' && tg) { o.face = dx < 0 ? -1 : 1;
        if (o.st === 'aim') { if (o.stT <= 0) { o.st = 'idle'; o.cd = T.cd; SND.mob('shriek', .9); if (Math.hypot(P.x - o.x, P.y - o.y) < 900) shake = .35; o.ring = .6;
            live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.reach) { strikeOn(p, T.dmg, o, 0); if (p.me) stun(3); else net('mslow', { to: p.id, t: 3 }); } }); net('mring', { id: o.id }); } }
        else if (dist < T.reach * .85 && o.cd <= 0) { o.st = 'aim'; o.stT = T.wind; }
        else if (dist > T.reach * .6) { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); } }
      else if (T.ai === 'boom' && tg) { o.face = dx < 0 ? -1 : 1;
        if (o.st === 'aim') { if (o.stT <= 0) { if (Math.hypot(P.x - o.x, P.y - o.y) < 700) shake = .5; for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283; parts.push({ x: o.x + Math.cos(a) * 20, y: o.y - 40, vx: Math.cos(a) * 260, vy: Math.sin(a) * 140 - 40, life: .7, s: 5, c: 200, fire: 1 }); }
            live.forEach(p => { if (Math.hypot(p.x - o.x, p.y - o.y) < T.aoe) strikeOn(p, T.dmg, o, 150); }); SND.fireball('fire'); o.hp = 0; killMob(o); return; } }
        else if (dist < T.reach) { o.st = 'aim'; o.stT = T.wind; SND.mob('shriek', .3); }
        else { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); } }
      else if (T.ai === 'flee') { if (tg) { o.face = dx < 0 ? 1 : -1; sp = dist < 560 ? T.sp : T.wsp; mx = -dx / dist; my = -dy / dist; if (!mobWalk(o.x + mx * 60, o.y + my * 60)) { mx = -dy / dist * o.side; my = dx / dist * o.side; if (!mobWalk(o.x + mx * 60, o.y + my * 60)) o.side *= -1; } if (Math.random() < dt * .6) o.side *= -1; }
        else { o.wt -= dt; if (o.wt <= 0) { o.wt = rnd(2, 4); const p = randomNear(o.x, o.y, 300); o.wx = p[0]; o.wy = p[1]; } const wd = Math.hypot(o.wx - o.x, o.wy - o.y); if (wd > 10) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; sp = T.wsp; } } }
      else if (T.ai === 'boss' && tg) {
        if (o.st === 'tele') { o.vis = Math.max(0, o.vis - dt * 3); if (o.stT <= 0) { blinkTo(o, tg, false, 520); o.vis = 1; o.st = 'volley'; o.stT = 1.6; o.volleys = 0; o.shotT = .2; SND.mob('roar', .3); } }
        else if (o.st === 'volley') { o.face = dx < 0 ? -1 : 1; if (o.shotT <= 0 && o.volleys < 4) { o.shotT = .32; o.volleys++; fireMob(o, tg, T.shot || 'fire', rnd(-.12, .12)); } if (o.stT <= 0) { o.st = 'chase'; o.ab = rnd(6, 9); } }
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
      /* salida: una flechita chica en el borde; el nombre solo si estás cerca (y completo en el MAPA) */
      const dir_ = e.side || (e.r[1] <= 30 ? 'u' : e.r[3] >= MH - 30 ? 'd' : e.r[0] <= 30 ? 'l' : e.r[2] >= MW - 30 ? 'r' : 'd'), ang = { u: -Math.PI / 2, d: Math.PI / 2, l: Math.PI, r: 0 }[dir_];
      const ax = Math.max(18, Math.min(VW - 18, mx)), ay = Math.max(18, Math.min(VH - 18, my)), bob = Math.sin(t * 4) * 4;
      c.save(); c.translate(ax + Math.cos(ang) * bob, ay + Math.sin(ang) * bob); c.rotate(ang); c.fillStyle = 'rgba(127,246,242,' + (.55 + a * .4) + ')'; c.shadowColor = '#7ff6f2'; c.shadowBlur = 8;
      c.beginPath(); c.moveTo(9, 0); c.lineTo(-5, -7); c.lineTo(-2, 0); c.lineTo(-5, 7); c.closePath(); c.fill(); c.restore();
      const [px_, py_] = W2S(P.x, P.y); if (Math.hypot(px_ - mx, py_ - my) < 260 * zoom + 120) { c.font = '10px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = 'rgba(0,0,0,.55)'; const w = c.measureText(e.label).width + 8, ly = ay - Math.sin(ang) * 22 - (dir_ === 'l' || dir_ === 'r' ? 18 : 0), lx = Math.max(w / 2 + 4, Math.min(VW - w / 2 - 4, ax - Math.cos(ang) * 30));
        c.fillRect(lx - w / 2, ly - 9, w, 13); c.fillStyle = 'rgba(200,250,248,.85)'; c.fillText(e.label, lx, ly + 1); } });
    (MAP.tiles || []).forEach(p => { const [sx, sy] = W2S(p[0] * WS, p[1] * WS), a = .35 + Math.sin(t * 4 + p[0]) * .2; c.strokeStyle = 'rgba(120,220,255,' + a + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(sx, sy, 46 * zoom, 18 * zoom, 0, 0, 7); c.stroke(); });
    traps.forEach(tp => { const [sx, sy] = W2S(tp.x, tp.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return; c.save(); c.translate(sx, sy); c.scale(zoom, zoom * .5); c.strokeStyle = tp.cd > 0 ? 'rgba(120,110,100,.6)' : 'rgba(210,190,160,.9)'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283, r = i % 2 ? 18 : 34; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); c.stroke(); c.restore(); });
    // entidades
    const ents = []; LBL = [];
    /* la capa de adelante (techos, toldos) se vuelve medio transparente si tapa a alguien que está atrás */
    const who = [[P.x, P.y]].concat([...others.values()].filter(o => o.look).map(o => [o.x, o.y]), npcsHere().filter(n => !n.obj).map(n => [n.x * WS, n.y * WS]), mobs.filter(o => o.cl || o.T.boss).map(o => [o.x, o.y]));
    const behind = (sx, sy, w, h, base) => who.some(([wx, wy]) => { if (!MAP.occTop && wy >= base) return false; const [qx, qy] = W2S(wx, wy), hw = 45 * zoom, hh = 175 * zoom; return qx + hw > sx && qx - hw < sx + w && qy > sy && qy - hh < sy + h; });
    const occIm = MAP.occ && MAP.occ.length ? img('/a/m/' + mapKey + '-occ.png') : null;
    if (occIm && ok(occIm)) MAP.occ.forEach(o => { const [sx, sy] = W2S(o[0] * WS, o[1] * WS), w = o[2] * WS * zoom, h = o[3] * WS * zoom; if (sx > VW || sy > VH || sx + w < 0 || sy + h < 0) return; ents.push({ y: MAP.occTop ? 1e12 : o[4] * WS, occ: [sx, sy, w, h], draw: () => { const tr = behind(sx, sy, w, h, o[4] * WS); if (tr) c.globalAlpha = .42; c.drawImage(occIm, 0, o[5], o[2], o[3], sx, sy, w, h); c.globalAlpha = 1; } }); });
    if (STORY && window.CZ_STORY) CZ_STORY.ents(ents, W2S, c, zoom, WS);
    ents.push({ y: P.y, draw: () => drawChar(P, look, me.nick, me.faction, true) });
    if (P.clone && P.clone.t > 0) ents.push({ y: P.clone.y, draw: () => { c.globalAlpha = .55; drawChar({ x: P.clone.x, y: P.clone.y, tx: P.clone.x, ty: P.clone.y, mv: false, walkT: P.walkT, atk: P.atk, dir: P.dir, iv: 0 }, look, '', me.faction, false); c.globalAlpha = 1; } });
    others.forEach(o => { if (o.look) ents.push({ y: o.y, draw: () => drawChar(o, o.look, o.nick, o.fac, false) }); });
    if (gotFull) mobs.forEach(o => ents.push({ y: o.y, draw: () => drawMob(o) }));
    pickups.forEach(q => ents.push({ y: q.y - 30, draw: () => drawPickup(q) }));
    npcsHere().forEach(n => ents.push({ y: n.y * WS + (n.oy || 0), draw: () => drawNpc(n) }));
    if (yuki) ents.push({ y: yuki.y, draw: () => { const [sx, sy] = W2S(yuki.x, yuki.y), S = 6.4 * zoom; const sp = HD && HD.sheet('yuki', Math.sin(yuki.t * 2) > 0 ? 'l' : 'r', (yuki.t * 6 | 0) % 3, false); shadow(sx, sy, 18); if (sp) blitChar(c, sp, sx, sy, S, HD_K * .36);
      c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#e8c070'; c.fillText('YUKI', sx, sy - 120 * zoom); } });
    ptraps.forEach(tp => { if (tp.m !== mapKey) return; const [tx, ty] = W2S(tp.x, tp.y); if (tx < -60 || tx > VW + 60 || ty < -60 || ty > VH + 60) return;
      if (tp.fac === me.faction) { const im = img('/a/it/peligro.png'), w = 44 * zoom; c.globalAlpha = .9; if (ok(im)) c.drawImage(im, tx - w / 2, ty - w * .8, w, w); c.globalAlpha = 1; c.strokeStyle = 'rgba(255,170,80,.7)'; c.lineWidth = 2; c.beginPath(); c.ellipse(tx, ty, 34 * zoom, 11 * zoom, 0, 0, 7); c.stroke(); }
      else { c.fillStyle = 'rgba(20,14,10,.38)'; c.beginPath(); c.ellipse(tx, ty, 9 * zoom, 3.5 * zoom, .3, 0, 7); c.fill(); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw()); LBL.forEach(f => f()); LBL = []; /* los nombres van arriba de todo */
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
      const wp = walkPose(o.walkT, moving), frame = wp.fr, bob = wp.bob * zoom; const dir = mine ? P.dir : (o.dir || 'd');
      const S = 6.4 * zoom; shadow(sx, sy, 28);
      c.imageSmoothingEnabled = false; if (mine && (P.hurtT > 0 || P.inv > 0)) c.globalAlpha = .7 + Math.sin(t * 30) * .25; if (mine && P.dead) c.globalAlpha = .35; if (mine && P.ghost > 0) c.globalAlpha = .25;
      if (!mine && o.dead) c.globalAlpha = .3; else if (!mine && o.gh) c.globalAlpha = .1; else if (!mine && o.iv) c.globalAlpha = .6;
      const spr = charSprite(lk, dir, frame, (o.atk || 0) > 0); blitChar(c, spr, sx, sy + bob, S);
      if (!mine && (o.hurt || 0) > 0) { o.hurt -= 1 / 60; c.globalCompositeOperation = 'lighter'; c.globalAlpha = .6; blitChar(c, spr, sx, sy + bob, S); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if (!mine && fac !== me.faction && o.hp != null && !o.dead) { const bw = 46 * zoom, by = sy - 27 * S - 24; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 4); c.fillStyle = '#ff6a5c'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / 100), 4); }
      if ((o.atk || 0) > 0) { const a = { d: Math.PI / 2, u: -Math.PI / 2, l: Math.PI, r: 0 }[dir]; const k = 1 - (o.atk / .3), wk = baseOf(mine ? (P.wk || 'palo') : (o.wk || 'palo')), cy0 = sy - 80 * zoom, al = 1 - k;
        const rc = mine && ITEMS[P.wk] && ITEMS[P.wk].r && ITEMS[P.wk].r !== 'g' && ITEMS[P.wk].r !== 'v' ? RAR[ITEMS[P.wk].r][1] : null;
        const tint = (c0, A) => rc ? rc + Math.round(A * 255).toString(16).padStart(2, '0') : 'rgba(' + c0 + ',' + A + ')';
        const arc_ = (rad, w, col, a0, a1) => { c.strokeStyle = col; c.lineWidth = w * zoom; c.lineCap = 'round'; c.beginPath(); c.arc(sx, cy0, rad * zoom, a + a0, a + a1); c.stroke(); };
        if (WEAP[mine ? P.wk : wk] && WEAP[mine ? P.wk : wk].gun || ['pistola', 'escopeta', 'metralleta', 'ballesta', 'lanzallamas'].includes(wk)) { const mx = sx + Math.cos(a) * 50 * zoom, my = sy - 95 * zoom + Math.sin(a) * 30 * zoom; c.fillStyle = wk === 'ballesta' ? 'rgba(220,200,160,' + al + ')' : wk === 'lanzallamas' ? 'rgba(255,140,40,' + al + ')' : 'rgba(255,220,140,' + al + ')'; c.beginPath(); c.arc(mx, my, (wk === 'escopeta' ? 20 : 13) * zoom * al, 0, 7); c.fill(); }
        else if (mine && fxOk('impacto')) { /* el golpe se dibuja con los efectos (fxDraw) */ }
        else if (wk === 'lanza' || wk === 'baston') { /* estocada: línea recta que sale y vuelve */ const r0 = 30 * zoom, r1 = (110 + 80 * Math.sin(k * Math.PI)) * zoom; c.strokeStyle = tint('210,210,215', al); c.lineWidth = 4 * zoom; c.beginPath(); c.moveTo(sx + Math.cos(a) * r0, cy0 + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * r1, cy0 + Math.sin(a) * r1); c.stroke(); c.fillStyle = tint('255,255,255', al); c.beginPath(); c.arc(sx + Math.cos(a) * r1, cy0 + Math.sin(a) * r1, 5 * zoom, 0, 7); c.fill(); }
        else if (wk === 'cuchillo' || wk === 'daga_demonio') { /* dos tajos cortos y rápidos */ arc_(62, 3, tint('235,240,255', .85 * al), -.9 + k * .4, -.1 + k * .6); arc_(76, 2, tint('235,240,255', .6 * al), .1 - k * .3, .8 - k * .3); }
        else if (wk === 'katana' || wk === 'machete' || wk === 'espada_lamentos') { /* tajo largo y fino, con brillo */ arc_(112, 3, tint('220,235,255', .9 * al), -1.4 + k * .5, .5 + k * 1.1); arc_(104, 7, tint('150,190,255', .25 * al), -1.2 + k * .5, .4 + k * 1.1); }
        else if (wk === 'cadena') { /* barrido amplio, eslabones */ c.setLineDash([6 * zoom, 5 * zoom]); arc_(135, 5, tint('190,170,140', .9 * al), -1.7 + k * .8, 1.2 + k * .8); c.setLineDash([]); }
        else if (wk === 'hacha') { arc_(98, 9, tint('255,230,200', .75 * al), -1 + k * .7, .2 + k * .9); }
        else { /* golpe contundente (palo, barra, bate, martillo, tubo, bastones): arco grueso y onda de impacto */
          const heavy = wk === 'martillo' || wk === 'bate' || wk === 'baston_oscuro', rad = wk === 'barra' ? 115 : heavy ? 102 : 92;
          arc_(rad, heavy ? 10 : 6, tint('255,255,255', .7 * al), -1.1 + k * .6, .2 + k * .9);
          if (k > .45) { const ix = sx + Math.cos(a) * rad * zoom * .9, iy = cy0 + Math.sin(a) * rad * zoom * .6 + 60 * zoom, R = (heavy ? 60 : 36) * zoom * (k - .45) * 2; c.strokeStyle = tint('255,230,180', (1 - k) * 1.4); c.lineWidth = (heavy ? 4 : 2) * zoom; c.beginPath(); c.ellipse(ix, iy, R, R * .4, 0, 0, 7); c.stroke(); } } }
      if (!mine && !o.gh) LBL.push(() => { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = (o.lvl >= lvlOf(P.xp) + 10 && fac !== me.faction ? '☠ ' : '') + nick; const ic = img(fac === 'ork' ? '/a/ui/fac_ork.webp' : '/a/ui/fac_rebel.webp'), isz = 18 * Math.max(.85, zoom), tw = c.measureText(nm).width, w = tw + isz + 14; const ny = sy - LBL_H * S, x0 = sx - w / 2;
        c.fillStyle = 'rgba(0,0,0,.62)'; c.fillRect(x0, ny - isz + 2, w, isz + 2); c.fillStyle = fac === 'ork' ? '#c9302a' : '#2f7fe0'; c.fillRect(x0, ny + 2, w, 2); /* bando: azul rebeldes · rojo ORK */
        if (ok(ic)) c.drawImage(ic, x0 + 4, ny - isz + 2, isz, isz); c.textAlign = 'left'; c.fillStyle = fac === 'ork' ? '#ff7a70' : '#8fc4ff'; c.fillText(nm, x0 + isz + 9, ny - 2); c.textAlign = 'center'; });
      if (o.sayT > 0 && o.say) bubble(sx, sy - 27 * S - (mine ? 6 : 24), o.say); }
    function drawMob(o) { const T = o.T; const [sx, sy] = W2S(o.x, o.y); if (sx < -300 || sx > VW + 300 || sy < -50 || sy > VH + 400) return; if (T.eyes) return;
      if (o.cl) return drawClon(o, sx, sy);
      let vis = o.vis; if (T.ai === 'blink' && (INV.eq.brazo === 'b_resonancia' || INV.eq.luz)) vis = Math.max(vis, .55);
      if (vis < .03) return;
      /* paso al ritmo de lo que se mueve en pantalla (igual que los jugadores): ciclo de 4 tiempos y rebote */
      const mdd = Math.min(60, Math.hypot(o.x - (o.lpx ?? o.x), o.y - (o.lpy ?? o.y))); o.lpx = o.x; o.lpy = o.y; o.wph = (o.wph || 0) + mdd * .045; o.wmv = mdd > .25 ? .15 : Math.max(0, (o.wmv || 0) - 1 / 60);
      const mwp = walkPose(o.wph, o.wmv > 0 && !(o.lunge > 0)), frame = mwp.fr, mbob = T.fly ? 0 : mwp.bob * zoom * Math.max(.6, Math.min(1.4, (T.ph || 26) / 26));
      const TT = o.sk ? (o.Tsk && o.Tsk.sheet === o.sk ? o.Tsk : (o.Tsk = Object.assign({}, T, { sheet: o.sk }))) : T, f4 = Math.floor(o.t * 7) % 4;
      const art = o.sk ? artOf(TT, f4 % 3, o.hurt > 0, false, f4 === 3) : artOf(T, frame, o.hurt > 0, o.wmv > 0, o.lunge > 0 || o.st === 'aim'), S = PXS * zoom, W = T.pw * S, H = T.ph * S;
      const AX = art.hd ? CELL_HD * H * HD_K / 220 : W, AY = art.hd ? 240 * H * HD_K / 220 : H, AW = art.hd ? AX : W, AH = art.hd ? AX : H; // HD: celda cuadrada con pies en 240
      let lx = 0, jx = 0; if (o.lunge > 0) lx = o.face * 26 * o.lunge * zoom; if (o.wind > 0 || o.st === 'aim') jx = Math.sin(t * 60) * 2 * zoom;
      shadow(sx, sy, Math.max(22, T.pw * 1.6));
      c.save(); c.translate(Math.round(sx + lx + jx), Math.round(sy + mbob)); if (o.face < 0) c.scale(-1, 1);
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
    /* clon contagiado: tu personaje oscurecido, con brillo violeta y tu nombre */
    function drawClon(o, sx, sy) { const S = 6.4 * zoom, frame = o.moving ? (Math.floor(o.t * 9) % 2 ? 1 : 2) : 0, dir = o.face < 0 ? 'l' : 'r';
      const spr = charSprite(o.cl, dir, frame, o.lunge > 0 || o.wind > 0); shadow(sx, sy, 28);
      const ar = 80 * zoom; c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(sx, sy - 70 * zoom, 0, sx, sy - 70 * zoom, ar); gr.addColorStop(0, 'rgba(150,60,255,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(sx - ar, sy - 70 * zoom - ar, ar * 2, ar * 2); c.globalCompositeOperation = 'source-over';
      c.save(); c.globalAlpha = o.alpha || 1; c.filter = 'brightness(.38) saturate(.3) contrast(1.3)'; blitChar(c, spr, sx, sy, S); c.restore(); c.filter = 'none';
      if (o.hurt > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .4; blitChar(c, spr, sx, sy, S); c.restore(); }
      if (o.wind > 0) { c.fillStyle = 'rgba(255,90,70,.95)'; c.font = 'bold ' + Math.round(22 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillText('!', sx, sy - 27 * S - 30); }
      const by = sy - 27 * S - 24, bw = 48 * zoom; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 5); c.fillStyle = '#b070ff'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / o.mhp), 5);
      c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = '☣ ' + (o.cn || 'Contagiado') + (o.lv ? ' · NV ' + o.lv : ''), w = c.measureText(nm).width + 10, ny = sy - 27 * S - 6; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - w / 2, ny - 12, w, 15); c.fillStyle = '#c99bff'; c.fillText(nm, sx, ny); c.globalAlpha = 1; }
    function drawNpc(n) { if (n.dama) return; /* el mob ya se dibuja: el NPC de la chica/el chico es solo para hablarle */
      if (n.obj) { const [ox, oy] = W2S(n.x * WS, n.y * WS); if (n.lib) { const im = img(LIBS[n.lib].img), h = 70 * zoom; if (ok(im)) { const w = im.naturalWidth / im.naturalHeight * h; shadow(ox, oy, 26); c.save(); c.shadowColor = n.lib === 'pablo' ? '#ff4060' : '#ff9ad0'; c.shadowBlur = 16 + Math.sin(t * 3) * 8; c.drawImage(im, ox - w / 2, oy - h - 10 + Math.sin(t * 2) * 3, w, h); c.restore(); } } if (n.cas) { const im = img('/a/ob/casillero.png'), h = 150 * zoom; if (ok(im)) { const w = im.naturalWidth / im.naturalHeight * h; shadow(ox, oy, 30); if (INV.cas && INV.cas[n.id] === dayN()) c.globalAlpha = .55; c.drawImage(im, ox - w / 2, oy - h, w, h); c.globalAlpha = 1; } }
        if (!n.cas && !n.lib && n.k) { const im = img('/a/ob/' + (n.bot && BOT_IMG[n.bot] && ok(img('/a/ob/' + BOT_IMG[n.bot] + '.png')) ? BOT_IMG[n.bot] : n.k) + '.png'), h = (n.bot || n.caps ? 66 : n.pod ? 150 : 170) * zoom; if (ok(im)) { const w = im.naturalWidth / im.naturalHeight * h; shadow(ox, oy, n.bot || n.caps ? 24 : 40); if ((n.quest && (INV.quests || {})[n.quest.id]) || ((n.bot || n.caps) && INV.cas && INV.cas[n.id] === dayN())) c.globalAlpha = .45; c.drawImage(im, ox - w / 2, oy - h, w, h); c.globalAlpha = 1; } }
        if (nearNpc() === n) { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#e8c070'; c.fillText(n.nm + ' · A', ox, oy - 40 * zoom); } return; } const [sx, sy] = W2S(n.x * WS + (n.ox || 0), n.y * WS + (n.oy || 0)); if (sx < -200 || sx > VW + 200 || sy < -50 || sy > VH + 300) return; const S = 6.4 * zoom; shadow(sx, sy, 28);
      const dir = n.face || (Math.abs(P.x - n.x * WS) > 120 ? (P.x < n.x * WS ? 'l' : 'r') : 'd'), wp = walkPose(n.walkT, n.mv), fr = wp.fr; blitChar(c, charSprite({ npc: n.k }, dir, fr, n.atkT > 0), sx, sy + wp.bob * zoom, S, n.sc ? HD_K * n.sc : undefined); c.imageSmoothingEnabled = true;
      const near = nearNpc() === n; LBL.push(() => { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = n.nm + (near ? ' · A' : ''); const w = c.measureText(nm).width + 10, ny = sy - LBL_H * S;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sx - w / 2, ny - 12, w, 15); c.fillStyle = '#e8c070'; c.fillText(nm, sx, ny); });
      }
    function drawPickup(q) { const [sx, sy] = W2S(q.x, q.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return; const b = Math.sin(q.t * 3) * 4 * zoom, S = 4.2 * zoom;
      const gl = c.createRadialGradient(sx, sy - 20 * zoom, 0, sx, sy - 20 * zoom, 46 * zoom); gl.addColorStop(0, 'rgba(255,240,200,' + (.25 + Math.sin(q.t * 4) * .1) + ')'); gl.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gl; c.fillRect(sx - 50 * zoom, sy - 70 * zoom, 100 * zoom, 100 * zoom);
      shadow(sx, sy, 14); c.imageSmoothingEnabled = false; c.drawImage(iconOf(q.k), Math.round(sx - 6 * S), Math.round(sy - 14 * S + b), Math.round(12 * S), Math.round(12 * S)); c.imageSmoothingEnabled = true;
      if ((q.t % 2.4) < .25) { c.fillStyle = 'rgba(255,255,255,.9)'; const k = (q.t % 2.4) / .25; c.fillRect(sx + 10 * zoom - 1, sy - 30 * zoom - 6 * k, 2, 12 * k); c.fillRect(sx + 10 * zoom - 6 * k, sy - 30 * zoom - 1, 12 * k, 2); } }
    function bubble(x, y, text) { c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const words = text.split(' '); const lines = []; let ln = '';
      words.forEach(w => { if (c.measureText(ln + ' ' + w).width > 170 && ln) { lines.push(ln); ln = w; } else ln = ln ? ln + ' ' + w : w; }); lines.push(ln);
      const w = Math.max(...lines.map(l => c.measureText(l).width)) + 16, h = lines.length * 16 + 10; c.fillStyle = 'rgba(240,238,232,.94)'; c.fillRect(x - w / 2, y - h, w, h); c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x, y + 6); c.fill();
      c.fillStyle = '#111'; lines.forEach((l, i) => c.fillText(l, x, y - h + 18 + i * 16)); }
    // nubes tóxicas
    goos.forEach(g_ => { const [x, y] = W2S(g_.x, g_.y), a = Math.min(1, g_.ttl) * .75; if (drawFxImg(c, 'charco_moco', x, y, g_.r * 2.4 * zoom, 0, a + .2, false)) return; c.fillStyle = 'rgba(110,140,40,' + a + ')'; c.beginPath(); c.ellipse(x, y, g_.r * zoom, g_.r * .55 * zoom, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(190,220,90,' + a * .6 + ')'; c.beginPath(); c.ellipse(x - 12 * zoom, y - 6 * zoom, g_.r * .4 * zoom, g_.r * .18 * zoom, 0, 0, 7); c.fill(); });
    mobs.forEach(o => { if (!(o.ring > 0)) return; o.ring -= 1 / 60; const [x, y] = W2S(o.x, o.y - o.T.h * .7), r_ = (1 - o.ring / .6) * 330 * zoom; c.strokeStyle = 'rgba(230,220,255,' + (o.ring / .6) + ')'; c.lineWidth = 6 * zoom; c.beginPath(); c.ellipse(x, y, r_, r_ * .6, 0, 0, 7); c.stroke(); });
    clouds.forEach(c0 => { const [x, y] = W2S(c0.x, c0.y); const a = Math.min(1, c0.ttl) * .5; const gr = c.createRadialGradient(x, y, 0, x, y, c0.r * zoom); gr.addColorStop(0, 'rgba(120,150,90,' + a + ')'); gr.addColorStop(.7, 'rgba(80,100,60,' + a * .6 + ')'); gr.addColorStop(1, 'rgba(60,70,50,0)');
      c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, c0.r * zoom, c0.r * .7 * zoom, 0, 0, 7); c.fill(); });
    // fuego y cuchillos de los Oscuros
    mshots.forEach(b => { const [x, y] = W2S(b.x, b.y - 70);
      const ORB = { piedra: ['230,225,215', '140,130,120', '60,55,50', 16], moco: ['230,255,190', '150,190,60', '70,90,20', 20], fire: ['255,240,180', '255,140,40', '200,40,10', 26], orbe: ['220,240,255', '90,160,255', '20,60,200', 24], acido: ['230,255,200', '120,220,70', '30,120,20', 22], vacio: ['250,220,255', '180,80,255', '70,10,140', 28] };
      if (ORB[b.k]) { const [c1, c2, c3, R_] = ORB[b.k]; c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 0, x, y, R_ * zoom); gr.addColorStop(0, 'rgba(' + c1 + ',1)'); gr.addColorStop(.4, 'rgba(' + c2 + ',.9)'); gr.addColorStop(1, 'rgba(' + c3 + ',0)'); c.fillStyle = gr; c.fillRect(x - R_ * zoom, y - R_ * zoom, R_ * 2 * zoom, R_ * 2 * zoom); c.globalCompositeOperation = 'source-over'; }
      else if (b.k === 'rayo') { const l = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / l, uy = b.vy / l; c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(120,190,255,.55)'; c.lineWidth = 10 * zoom; c.beginPath(); c.moveTo(x - ux * 90 * zoom, y - uy * 90 * zoom); c.lineTo(x, y); c.stroke(); c.strokeStyle = '#eaf6ff'; c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x - ux * 90 * zoom, y - uy * 90 * zoom); for (let q = 1; q <= 4; q++) c.lineTo(x - ux * (90 - q * 22) * zoom + rnd(-5, 5) * zoom, y - uy * (90 - q * 22) * zoom + rnd(-5, 5) * zoom); c.stroke(); c.globalCompositeOperation = 'source-over'; }
      else if (b.k === 'bala') { const l = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / l, uy = b.vy / l; c.strokeStyle = 'rgba(255,225,140,.95)'; c.lineWidth = 2.5 * zoom; c.beginPath(); c.moveTo(x - ux * 26 * zoom, y - uy * 26 * zoom); c.lineTo(x, y); c.stroke(); }
      else { const l = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / l, uy = b.vy / l; c.strokeStyle = '#e8ecf0'; c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x - ux * 18 * zoom, y - uy * 18 * zoom); c.lineTo(x + ux * 12 * zoom, y + uy * 12 * zoom); c.stroke(); } });
    // balas
    shots.forEach(b => { b.sp = b.sp == null ? shotSprite(b) : b.sp; if (b.sp && fxOk(b.sp[0])) { const [x, y] = W2S(b.x, b.y); drawFxImg(c, b.sp[0], x, y, b.sp[1] * zoom, Math.atan2(b.vy, b.vx), 1, b.vx < 0 && b.sp[2]); b.drawn = 1; } else b.drawn = 0; });
    shots.forEach(b => { if (!b.fire || b.drawn) return; const [x, y] = W2S(b.x, b.y); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(x, y, 0, x, y, 24 * zoom); gr.addColorStop(0, 'rgba(255,245,200,1)'); gr.addColorStop(.4, 'rgba(255,150,50,.9)'); gr.addColorStop(1, 'rgba(200,40,10,0)'); c.fillStyle = gr; c.fillRect(x - 24 * zoom, y - 24 * zoom, 48 * zoom, 48 * zoom); c.globalCompositeOperation = 'source-over'; });
    gearDraw(c, W2S, zoom, t); mvpDraw(c, W2S, zoom, t);
    fxDraw(c, W2S, zoom);
    shots.forEach(b => { if (b.fire || b.drawn) return; const [x, y] = W2S(b.x, b.y); const [x2, y2] = W2S(b.x - b.vx * .03, b.y - b.vy * .03); c.strokeStyle = b.tear ? '#bfefff' : b.moco ? '#7fe060' : b.bolt ? '#d8c8a0' : b.knife ? '#e8ecf0' : 'rgba(255,230,160,.9)'; if (b.tear || b.moco) { c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(x, y, 9 * zoom, 0, 7); c.fill(); } c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x, y); c.stroke(); });
    // partículas
    parts.forEach(p => { const [x, y] = W2S(p.x, p.y); const v = p.c || 30; c.fillStyle = p.fire ? 'rgba(255,' + (120 + (Math.random() * 100 | 0)) + ',40,' + Math.min(1, p.life * 2) + ')' : 'rgba(' + v + ',' + v + ',' + (v + 2) + ',' + Math.min(1, p.life) * .85 + ')'; c.fillRect(x, y, p.s * zoom, p.s * zoom); });
    // oscuridad
    const dw = dark.width, dh = dark.height; dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, dw, dh); dg.fillStyle = 'rgba(4,4,8,' + Math.min(.9, (MAP.dark || .5) * ((MAP.dark || .5) >= .42 && !INV.eq.luz ? 1.75 : 1)) + ')'; dg.fillRect(0, 0, dw, dh);
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { const gg = dg.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2); gg.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gg; dg.fillRect(x / 2 - r / 2, y / 2 - r / 2, r, r); };
    const [px_, py_] = W2S(P.x, P.y - 80); hole(px_, py_, (INV.eq.luz ? 980 : (MAP.dark || .4) >= .42 ? 300 : 520) * zoom, .97); if (MAP.fire) hole(fx, fy, 520 * zoom * fl, 1);
    others.forEach(o => { const [ox, oy] = W2S(o.x, o.y - 80); hole(ox, oy, 280 * zoom, .7); });
    c.drawImage(dark, 0, 0, VW, VH);
    mobs.forEach(o => { if (!o.T.eyes) return; const [ex_, ey_] = W2S(o.x + (o.lunge > 0 ? o.face * 20 * o.lunge : 0), o.y - o.T.h * .82); const blink = Math.sin(o.t * 1.7 + o.x) > .97 ? .15 : 1, a_ = o.alpha * o.vis * blink, gap = 13 * zoom, r_ = 5 * zoom;
      c.globalCompositeOperation = 'lighter'; [-1, 1].forEach(sd => { const gx_ = ex_ + sd * gap, gr = c.createRadialGradient(gx_, ey_, 0, gx_, ey_, r_ * 4); gr.addColorStop(0, 'rgba(255,250,210,' + a_ + ')'); gr.addColorStop(.35, 'rgba(255,190,60,' + (a_ * .8) + ')'); gr.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = gr; c.fillRect(gx_ - r_ * 4, ey_ - r_ * 4, r_ * 8, r_ * 8); });
      c.globalCompositeOperation = 'source-over'; });
    // números flotantes
    floats.forEach(f => { const [x, y] = W2S(f.x, f.y); c.globalAlpha = Math.min(1, f.t * 2); c.font = 'bold ' + Math.round(15 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(f.txt, x + 1, y + 1); c.fillStyle = f.c; c.fillText(f.txt, x, y); c.globalAlpha = 1; });
    // ceniza
    ash.forEach(a => { c.fillStyle = 'rgba(220,216,206,' + a.o + ')'; c.fillRect(a.x, a.y, a.s, a.s); });
    let g = c.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    if (P.hurtT > 0) { c.fillStyle = 'rgba(160,20,10,' + P.hurtT * .8 + ')'; c.fillRect(0, 0, VW, VH); }
    if (P.ghost > 0) { c.fillStyle = 'rgba(180,200,220,.08)'; c.fillRect(0, 0, VW, VH); }
    // barra del jefe
    const boss = gotFull && mobs.find(o => o.T.boss); const bb = $('#boss'); if (boss) { bb.hidden = false; $('#boss-n').textContent = boss.T.name + (boss.lv ? ' · NV ' + boss.lv : ''); $('#boss-hp').style.width = Math.max(0, Math.min(100, boss.hp / (boss.mhp || boss.T.hp) * 100)) + '%'; } else bb.hidden = true;
    const lv = lvlOf(P.xp); if (!P.dead && P.hp < maxHp(lv) * .25) { c.fillStyle = 'rgba(120,10,5,' + (.12 + Math.sin(t * 5) * .08) + ')'; c.fillRect(0, 0, VW, VH); }
  }

    window.__cz = { EXP, npcs: () => npcsHere(), talk: () => { const n = nearNpc(); if (n) talkNpc(n); return n && n.k; }, get skins() { return mySkins; }, get look() { return look; }, get net() { return { mode: netMode, peers, sent: NETC.sent, recv: NETC.recv, gotFull }; }, get host() { return isHost; }, get hostId() { return hostId; }, set unlocks(v) { unlocks = v; }, get unlocks() { return unlocks; }, mshots, clouds, killMob, get suero() { return suero; }, get P() { return P; }, get INV() { return INV; }, pickups, mobs, ITEMS, ICONS, walkable: (x, y) => walkable(x, y), othersMap: others, spawnMob, spawnPickup, useItem, useHab, attack, takeItem, get map() { return mapKey; }, warp: k => enterMap(k, 0, 0) };
  boot().catch(e => { $('#load-t').textContent = 'Error al cargar: ' + (e.message || e); });
})();
