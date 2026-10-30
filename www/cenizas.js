/* CENIZAS 0.3 · Oscuros en pixel, items y mochila */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const CAP = window.Capacitor, NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform()), PL = NATIVE && CAP.Plugins ? CAP.Plugins : {};
  const CFG = window.THEOF_CONFIG || window.ALTIMIT_CONFIG || {};
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  const MAPS = window.CZ_MAPS;
  let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* =================== IMÁGENES =================== */
  const IMG = {}; function img(src) { if (!IMG[src]) { const i = new Image(); i.src = src; IMG[src] = i; } return IMG[src]; }
  const ok = i => i && i.complete && i.naturalWidth > 0;
  /* ---------- avatares pixel (los de la 0.5) ---------- */
  const SKIN = ['#e3d6c8', '#c9ab92', '#9a7860', '#6a4c3c'];
  const HCOL = [['Negro', '#1d1b1a'], ['Castaño', '#4b3a2e'], ['Gris', '#8b8680'], ['Blanco', '#d6d2cc']];
  const HAIR = ['Corto', 'Rapado', 'Largo', 'Revuelto', 'Rodete'];
  const TOPS = { rebel: [['Campera de jean', '#56606c', '#3e4650', '#7a8592'], ['Buzo con capucha', '#6a6a6a', '#4e4e4e', '#868686'], ['Campera negra', '#2c2c2c', '#1c1c1c', '#454545']],
    ork: [['Uniforme gris', '#5a5a5a', '#3f3f3f', '#787878'], ['Chaqueta táctica', '#363636', '#232323', '#4d4d4d'], ['Bata de VIREX', '#b9b2a6', '#8f897e', '#d8d1c4']] };
  const ACC = ['Nada', 'Gorro', 'Capucha', 'Bufanda', 'Máscara'];
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
    const fac = look.fac === 'ork' ? 'ork' : 'rebel', top = TOPS[fac][look.top] || TOPS[fac][0], skin = SKIN[look.skin] || SKIN[0], hair = (HCOL[look.hcol] || HCOL[0])[1];
    const fem = look.body === 1, tx0 = fem ? 5 : 4, tw = fem ? 6 : 8;
    if (d === 'l') { const a = frame === 1 ? [4, 9] : frame === 2 ? [9, 4] : [6, 7];
      px(a[1], 16, 3, 5, '#2c2c2e'); px(a[1], 21, 3, 2, BOOT); px(a[0], 16, 3, 5, PANTS); px(a[0] - (frame ? 1 : 0), 21, 4, 2, BOOT); }
    else { const lu = frame === 1 ? 1 : 0, ru = frame === 2 ? 1 : 0; px(5, 16, 3, 5 - lu, PANTS); px(5, 21 - lu, 3, 2, BOOT); px(8, 16, 3, 5 - ru, PANTS); px(8, 21 - ru, 3, 2, BOOT); }
    if (d === 'l') { px(5, 9, 6, 7, top[1]); px(5, 9, 2, 7, top[3]); px(10, 9, 1, 7, top[2]); }
    else { px(tx0, 9, tw, 7, top[1]); px(tx0 + tw - 1, 9, 1, 7, top[2]); if (d === 'd') { if (look.top === 0 && fac === 'rebel') px(7, 10, 2, 6, top[3]); if (fac === 'ork' && look.top === 2) px(7, 10, 2, 6, '#e8e2d6'); } }
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
      if (d === 'u') { px(5, 1, 6, 7, hair); if (hs === 2 || fem) px(5, 8, 6, 3, hair); }
      if (hs === 0) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 3, hair); px(11, 2, 1, 3, hair); } if (d === 'l') { px(8, 1, 3, 5, hair); px(11, 2, 1, 3, hair); } }
      if (hs === 1) { px(6, 1, 4, 1, hair); px(5, 2, 6, 1, hair); if (d === 'l') px(9, 2, 2, 3, hair); }
      if (hs === 2) { px(5, 1, 6, 2, hair); if (d === 'd') { px(4, 2, 1, 9, hair); px(11, 2, 1, 9, hair); } if (d === 'l') { px(8, 1, 4, 10, hair); } }
      if (hs === 3) { px(4, 1, 8, 2, hair); px(5, 0, 1, 1, hair); px(7, 0, 1, 1, hair); px(10, 0, 1, 1, hair); if (d !== 'u') { px(4, 3, 1, 2, hair); px(11, 3, 1, 2, hair); } if (d === 'l') px(9, 1, 3, 5, hair); }
      if (hs === 4) { px(5, 1, 6, 2, hair); px(6, 0, 4, 1, hair); px(7, -1, 3, 2, hair); if (d === 'l') px(9, 1, 2, 4, hair); }
      if (fem && hs !== 2 && hs !== 4 && d === 'd') { px(4, 2, 1, 7, hair); px(11, 2, 1, 7, hair); } }
    if (look.acc === 1) { px(4, 0, 8, 3, '#3d3d3d'); px(4, 3, 8, 1, '#5a5a5a'); }
    if (look.acc === 2) { const c = top[1]; px(4, 1, 8, 2, c); px(4, 2, 1, 7, c); px(11, 2, 1, 7, c); px(5, 0, 6, 1, c); if (d === 'u') px(5, 2, 6, 6, c); if (d === 'l') px(8, 1, 4, 8, c); }
    if (look.acc === 3) { px(5, 8, 6, 2, '#4a4a4a'); px(6, 8, 1, 2, '#5e5e5e'); if (d === 'd') px(9, 10, 2, 3, '#4a4a4a'); }
    if (look.acc === 4 && d !== 'u') { if (d === 'd') { px(5, 6, 6, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); px(10, 7, 1, 1, '#5a5a5a'); } else { px(5, 6, 3, 2, '#262626'); px(5, 7, 1, 1, '#5a5a5a'); } }
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

  /* tipos de Oscuro: h = altura en mundo; las imágenes laterales miran a la derecha */
  /* Oscuros en pixel: PXS = tamaño de cada pixel en el mundo (igual que los avatares) */
  const PIX = window.CZ_PIX, PXS = 6.4;
  const MOB = {
    errante: { name: 'Errante', art: 'errante', pw: 18, ph: 30, hp: 6, sp: 88, wsp: 30, dmg: 13, reach: 58, sight: 360, wind: .4, cd: 1.0, xp: 15, ai: 'chase', snd: 'growl' },
    corredor: { name: 'Corredor', art: 'corredor', pw: 26, ph: 24, hp: 5, sp: 125, dash: 400, wsp: 0, dmg: 16, reach: 62, sight: 500, wind: .45, cd: 1.3, xp: 26, ai: 'dash', snd: 'shriek' },
    perro: { name: 'Perro Oscuro', art: 'perro', pw: 27, ph: 17, hp: 4, sp: 235, wsp: 60, dmg: 10, reach: 52, sight: 540, wind: .18, cd: .55, xp: 14, ai: 'flank', snd: 'bark' },
    denso: { name: 'Denso', art: 'denso', pw: 26, ph: 34, hp: 24, sp: 58, wsp: 22, dmg: 32, reach: 96, aoe: 140, sight: 320, wind: .85, cd: 1.7, xp: 80, ai: 'slam', snd: 'roar', heavy: true },
    sombra: { name: 'Sombra', art: 'sombra', pw: 16, ph: 32, hp: 5, sp: 70, wsp: 25, dmg: 18, reach: 64, sight: 440, wind: .32, cd: .9, xp: 32, ai: 'blink', snd: 'whisper' },
    rastrero: { name: 'Rastrero', art: 'rastrero', pw: 25, ph: 15, hp: 4, sp: 195, wsp: 45, dmg: 11, reach: 56, sight: 420, wind: .22, cd: .8, xp: 18, ai: 'zigzag', snd: 'hiss' }
  };
  Object.values(MOB).forEach(T => { T.h = T.ph * PXS; });

  /* items del Documento Maestro */
  const ITEMS = {
    botiquin: { n: 'Botiquín de campaña', t: 'Consumible · común', d: 'Recupera 45 de vida. No cura la transformación de los Oscuros.', use: 'heal', v: 45 },
    vendas: { n: 'Vendas', t: 'Consumible · común', d: 'Recupera 18 de vida.', use: 'heal', v: 18 },
    pilas: { n: 'Pilas', t: 'Común', d: 'Recargan la linterna al máximo.', use: 'pilas' },
    linterna: { n: 'Linterna de servicio', t: 'Objeto · común', d: 'Ves mucho más lejos en la oscuridad. Gasta pilas, y algunos Oscuros ven la luz de lejos.', eq: 'luz' },
    barra: { n: 'Barra reforzada', t: 'Arma · común', d: 'Pega 1 más que el palo y llega más lejos. Un poco más lenta. No se rompe.', eq: 'arma' },
    cuchillo: { n: 'Cuchillo', t: 'Arma · poco común', d: 'Muy rápido y de cerca. Se rompe después de 40 golpes.', eq: 'arma', uses: 40 },
    bate: { n: 'Bate', t: 'Arma · poco común', d: 'Pega fuerte y empuja lejos. Se rompe después de 30 golpes.', eq: 'arma', uses: 30 },
    lanza: { n: 'Lanza', t: 'Arma · rara', d: 'Llega lejísimo hacia adelante y atraviesa a todos los de la línea. Se rompe después de 30 golpes.', eq: 'arma', uses: 30 },
    pistola: { n: 'Pistola', t: 'Arma · rara', d: 'Dispara a distancia. Tiene 10 tiros y cuando se terminan, se descarta.', eq: 'arma', uses: 10 },
    mascara: { n: 'Máscara de filtrado', t: 'Equipo · poco común', d: 'En el subte y el complejo recibís 20% menos de daño.', eq: 'cara' },
    b_contencion: { n: 'Brazalete de contención', t: 'Brazalete · raro', d: 'A favor: recibís 30% menos de daño. En contra: tu arma pega 1 menos.', eq: 'brazo' },
    b_resonancia: { n: 'Brazalete de resonancia', t: 'Brazalete · raro', d: 'A favor: ves a las Sombras aunque se escondan. En contra: los Oscuros te detectan desde más lejos.', eq: 'brazo' },
    credencial: { n: 'Credencial de contención', t: 'Llave · poco común', d: 'Abre puertas de mantenimiento del complejo. Va a servir en las misiones.' },
    receptor: { n: 'Receptor de señales', t: 'Objeto · poco común', d: 'Capta transmisiones ocultas. Va a servir en las misiones.' },
    ganzuas: { n: 'Juego de ganzúas', t: 'Herramienta · poco común', d: 'Abre cerraduras mecánicas. Va a servir en las misiones.' },
    filtro: { n: 'Filtro portátil', t: 'Objeto · poco común', d: 'Hace utilizable el agua de ciertos puntos. Va a servir en las misiones.' },
    suero: { n: 'Suero de ceniza', t: 'Único · rota cada 3 minutos', d: 'La única cura que existe en las cenizas. Te deja la vida completa. Hay uno solo en todo el mundo y cambia de lugar cada 3 minutos si nadie lo agarra.', use: 'heal', v: 9999 },
    campera: { n: 'Campera reforzada', t: 'Ropa · escudo 35', d: 'Absorbe 35 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 35 },
    chaleco: { n: 'Chaleco antibalas', t: 'Ropa · escudo 70', d: 'Absorbe 70 de daño antes que tu vida. Cuando se gasta, se rompe y aparece otro en algún mapa.', eq: 'ropa', shield: 70 },
    armadura: { n: 'Armadura improvisada', t: 'Ropa · escudo 120 · rara', d: 'Chapas y correas. Absorbe 120 de daño. Cuando se gasta, se rompe y aparece otra en algún mapa.', eq: 'ropa', shield: 120 },
    pagina: { n: 'Página del cuaderno', t: 'Narrativo · raro', d: 'Hojas sueltas del Cuaderno de desaparecidos. Nombres, lugares, testimonios. Juntalas todas.' },
    fragmento: { n: 'Fragmento temporal', t: 'Especial · épico', d: 'Residuo anómalo de las instalaciones. Vibra cuando lo tocás.' }
  };
  const LOOT = {
    parque: [['pilas', 3], ['campera', 1.2], ['chaleco', .4], ['linterna', 1], ['barra', 1], ['pagina', .8], ['cuchillo', .7], ['bate', .5]],
    barrio: [['pilas', 3], ['campera', 1.2], ['chaleco', .7], ['barra', 1.5], ['ganzuas', 1], ['receptor', 1], ['linterna', 1], ['pagina', 1], ['bate', .8], ['cuchillo', .6], ['lanza', .35]],
    plaza: [['pilas', 2], ['campera', .6]],
    subte: [['pilas', 4], ['chaleco', 1], ['armadura', .3], ['mascara', 2], ['linterna', 1.5], ['pagina', 1], ['b_resonancia', .5], ['lanza', .6], ['pistola', .3]],
    complejo: [['chaleco', 1.2], ['armadura', .5], ['credencial', 2], ['mascara', 1.5], ['filtro', 1], ['pagina', 1], ['b_contencion', .5], ['pistola', .5], ['lanza', .4]],
    inferior: [['armadura', .8], ['chaleco', 1], ['pilas', 2], ['fragmento', 1], ['b_contencion', .8], ['b_resonancia', .8], ['pagina', 1], ['pistola', .6]],
    santuario: [['campera', .8], ['pagina', .6]]
  };
  /* armas: daño extra, alcance, velocidad, empuje */
  const WEAP = { palo: { n: 'PALO', dmg: 0, range: 112, cd: .38, kb: 24 }, barra: { n: 'BARRA', dmg: 1, range: 140, cd: .44, kb: 26 },
    cuchillo: { n: 'CUCHILLO', dmg: 1, range: 92, cd: .2, kb: 12 }, bate: { n: 'BATE', dmg: 2, range: 128, cd: .5, kb: 70 },
    lanza: { n: 'LANZA', dmg: 2, range: 185, cd: .55, kb: 30, line: true }, pistola: { n: 'PISTOLA', dmg: 4, range: 650, cd: .35, kb: 10, gun: true } };
  const WEAPON_KEYS = ['palo', 'barra', 'cuchillo', 'bate', 'lanza', 'pistola'];
  /* dónde despierta cada bando: Rebeldes en el fogón del parque, ORK en su base del complejo */
  const home = () => me && me.faction === 'ork' ? ['complejo', MAPS.complejo.home] : ['parque', MAPS.parque.spawn];
  const homeText = () => me && me.faction === 'ork' ? 'Despertás en la base de ORK, en el Complejo de Contención.' : 'Despertás junto al fogón del nogal, en el parque.';
  const pickW = list => { const tot = list.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot; for (const [k, w] of list) { if ((r -= w) <= 0) return k; } return list[0][0]; };

  /* =================== MAPA ACTUAL =================== */
  const WS = 1.8, C = 16, GW = Math.ceil(1672 / C), GH = Math.ceil(941 / C), WORLD_W = 1672 * WS, WORLD_H = 941 * WS, CW = C * WS;
  let MAP = null, mapKey = '', grid = null, mgrid = null, flow = null, flowT = 0;
  function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function loadMap(k) {
    MAP = MAPS[k]; mapKey = k; img(MAP.img);
    const g = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const x = i * C + C / 2, y = j * C + C / 2; g[j * GW + i] = MAP.walk.some(p => inPoly(x, y, p)) && !MAP.block.some(p => inPoly(x, y, p)) ? 1 : 0; }
    // sólo lo conectado al punto de inicio
    grid = new Uint8Array(GW * GH); const s = cellOf(MAP.spawn[0] * WS, MAP.spawn[1] * WS); const q = [s]; grid[s] = 1;
    while (q.length) { const c = q.pop(), x = c % GW, y = (c / GW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const n = ny * GW + nx; if (g[n] && !grid[n]) { grid[n] = 1; q.push(n); } } }
    // por donde pueden andar los Oscuros: sin zonas seguras
    mgrid = new Uint8Array(grid); if (MAP.safeAll) mgrid.fill(0);
    (MAP.safe || []).forEach(([sx, sy, r]) => { for (let c = 0; c < mgrid.length; c++) { const x = (c % GW) * C + C / 2, y = ((c / GW) | 0) * C + C / 2; if (Math.hypot(x - sx, y - sy) < r) mgrid[c] = 0; } });
    flow = new Int16Array(GW * GH);
  }
  const cellOf = (x, y) => Math.max(0, Math.min(GH - 1, Math.floor(y / CW))) * GW + Math.max(0, Math.min(GW - 1, Math.floor(x / CW)));
  const walkable = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && grid[cellOf(x, y)] === 1;
  const mobWalk = (x, y) => x > 0 && y > 0 && x < WORLD_W && y < WORLD_H && mgrid[cellOf(x, y)] === 1;
  const inSafe = (x, y) => MAP.safeAll || (MAP.safe || []).some(([sx, sy, r]) => Math.hypot(x - sx * WS, y - sy * WS) < r * WS);
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
    return {
      init, get on() { return on; },
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
  let INV = null, noInvCol = false, shake = 0; const shots = [];
  let room = 0, ch = null, lastSent = 0, lastPos = '', running = false, paused = false, warping = false, exitLock = true;
  const lvlOf = xp => Math.floor(Math.sqrt(xp / 50)) + 1, xpFor = lv => 50 * (lv - 1) * (lv - 1), maxHp = lv => 100 + (lv - 1) * 12, dmgOf = lv => 1 + Math.floor((lv - 1) / 3);

  /* =================== ARRANQUE =================== */
  async function boot() {
    const { data: s } = await sb.auth.getSession(); if (!s.session) return location.replace('/index.html');
    const uid = s.session.user.id;
    const { data: prof } = await sb.from('profiles').select('id,nick,status,faction').eq('id', uid).maybeSingle();
    if (!prof || prof.status !== 'approved' || !prof.faction) return location.replace('/index.html');
    me = prof; document.documentElement.dataset.fac = me.faction;
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) {}
    const { data: gc, error } = await sb.from('game_chars').select('*').eq('user_id', uid).maybeSingle();
    if (error) { $('#load-t').textContent = /relation|does not exist/i.test(error.message) ? 'Falta preparar la base del juego (03_cenizas.sql). Avisale al admin.' : 'No se pudo leer tu personaje: ' + error.message; return; }
    $('#ov-load').hidden = true;
    if (!gc || !gc.look || gc.look.body == null || gc.look.fac !== me.faction) { creator(gc); return; }
    look = gc.look; startGame(gc);
  }

  /* =================== CREADOR =================== */
  function creator(prev) {
    const pl = prev && prev.look && prev.look.body != null ? prev.look : {};
    look = Object.assign({ body: 0, skin: 1, hair: 0, hcol: 1, top: 0, acc: 0 }, pl, { fac: me.faction }); delete look.char;
    const cre = $('#cre'); cre.hidden = false; let rot = 0; const dirs = ['d', 'l', 'u', 'r'];
    const opts = [['CUERPO', 'body', BODY], ['PIEL', 'skin', ['Tono 1', 'Tono 2', 'Tono 3', 'Tono 4']], ['PELO', 'hair', HAIR], ['COLOR', 'hcol', HCOL.map(h => h[0])], ['ROPA', 'top', TOPS[me.faction].map(t => t[0])], ['ACCESORIO', 'acc', ACC]];
    const box = $('#opts'); box.innerHTML = '';
    opts.forEach(([lab, k, list]) => { const r = document.createElement('div'); r.className = 'opt';
      r.innerHTML = '<span>' + lab + '</span><button aria-label="anterior">‹</button><b></b><button aria-label="siguiente">›</button>';
      const b = r.querySelector('b'); const upd = () => b.textContent = list[look[k]];
      r.children[1].onclick = () => { look[k] = (look[k] + list.length - 1) % list.length; upd(); draw(); };
      r.children[3].onclick = () => { look[k] = (look[k] + 1) % list.length; upd(); draw(); };
      upd(); box.appendChild(r); });
    const go = document.createElement('button'); go.className = 'btn solid go'; go.textContent = 'ENTRAR'; box.appendChild(go);
    const pv = $('#pv'), pg = pv.getContext('2d'); pg.imageSmoothingEnabled = false;
    let f = 0; function draw() { pg.clearRect(0, 0, 48, 64); pg.drawImage(sprite(look, dirs[rot], f, false), 15, 19, 18, 26); }
    const iv = setInterval(() => { f = (f + 1) % 3; draw(); }, 260); draw();
    $('#pv-rot').onclick = () => { rot = (rot + 1) % 4; draw(); };
    go.onclick = async () => { go.disabled = true; clearInterval(iv);
      const [hz, hp_] = home(); const fresh = !(prev && MAPS[prev.zone] && prev.x); const zone = fresh ? hz : prev.zone;
      const row = { user_id: me.id, look, zone, x: fresh ? hp_[0] * WS : prev.x, y: fresh ? hp_[1] * WS : prev.y, hp: prev && prev.hp || 100, xp: prev ? prev.xp || 0 : 0, kills: prev ? prev.kills || 0 : 0, updated_at: new Date().toISOString() };
      const { error } = await sb.from('game_chars').upsert(row); if (error) { go.disabled = false; return toast('No se pudo guardar: ' + error.message); }
      cre.hidden = true; startGame(row); };
  }

  /* =================== JUEGO =================== */
  function startGame(gc) {
    const lv = lvlOf(gc.xp || 0);
    P = { x: 0, y: 0, dir: 'd', face: 1, mv: false, walkT: 0, stepT: 0, atk: 0, cd: 0, hp: maxHp(lv), xp: gc.xp || 0, kills: gc.kills || 0, hurtT: 0, inv: 0, say: '', sayT: 0, dead: false };
    let inv = gc.inv && gc.inv.items ? gc.inv : null; if (!inv) { try { inv = JSON.parse(store.get('cz-inv-' + me.id) || 'null'); } catch (e) {} }
    INV = Object.assign({ items: { vendas: 2 }, eq: { arma: 'palo', luz: null, cara: null, brazo: null }, bat: 0 }, inv || {}); INV.eq = Object.assign({ arma: 'palo', luz: null, cara: null, brazo: null }, INV.eq || {}); INV.items = INV.items || {}; INV.dur = INV.dur || {}; INV.lost = INV.lost || {}; INV.eq.ropa = INV.eq.ropa || null; delete INV.items.vendas; delete INV.items.botiquin;
    $('#h-nick').textContent = me.nick; ['#hud', '#topr', '#pads', '#hintL'].forEach(s => $(s).hidden = false);
    document.body.classList.add('playing'); $('#m-snd').textContent = 'SONIDO: ' + (SND.on ? 'SÍ' : 'NO');
    for (let i = 0; i < 90; i++) ash.push(newAsh(true));
    const zone = MAPS[gc.zone] ? gc.zone : 'parque';
    enterMap(zone, gc.x, gc.y, true);
    running = true; last = performance.now(); requestAnimationFrame(loop);
    setInterval(persist, 20000);
  }
  function enterMap(k, x, y, first) {
    loadMap(k);
    const okPos = x && y && walkable(x, y);
    P.x = okPos ? x : MAP.spawn[0] * WS; P.y = okPos ? y : MAP.spawn[1] * WS; P.inv = 4; exitLock = true;
    mobs.length = 0; parts.length = 0; floats.length = 0; pickups.length = 0;
    const nPick = MAP.safeAll ? 2 : 6; for (let i = 0; i < nPick; i++) spawnPickup();
    sueroTick(true);
    Object.keys(INV.lost).forEach(w => { if (INV.lost[w] === k) { spawnPickup(w); delete INV.lost[w]; } }); shots.length = 0;
    Object.entries(MAP.mobs || {}).forEach(([kind, n]) => { for (let i = 0; i < n; i++) spawnMob(kind, 520); });
    buildFlow(); hud();
    const z = $('#zone'); $('#zone-n').textContent = MAP.name; $('#zone-s').textContent = MAP.safeAll ? 'zona segura · acá no entran los Oscuros' : (Object.keys(MAP.mobs).length ? 'Oscuros: ' + Object.keys(MAP.mobs).map(m => MOB[m].name).join(' · ') : '');
    z.classList.add('on'); setTimeout(() => z.classList.remove('on'), 2600); if (!first) SND.zone();
    joinRoom(1);
  }
  function warp(e) { if (warping) return; warping = true; $('#fade').classList.add('on'); persist();
    setTimeout(() => { enterMap(e.to, e.at[0] * WS, e.at[1] * WS); sendPos(true); persist(); $('#fade').classList.remove('on'); warping = false; }, 650); }
  function hud() { const lv = lvlOf(P.xp), a = xpFor(lv), b = xpFor(lv + 1); $('#h-hp').style.width = Math.max(0, P.hp / maxHp(lv) * 100) + '%'; $('#h-xp').style.width = ((P.xp - a) / (b - a) * 100) + '%';
    $('#h-lv').textContent = 'NV ' + lv + ' · ' + (INV ? weaponLabel() : 'PALO') + ' · ' + Math.ceil(P.hp) + '/' + maxHp(lv) + (INV && INV.eq.luz ? ' · LUZ ' + Math.ceil(INV.bat) + '%' : '') + (INV && INV.eq.ropa ? ' · ESCUDO ' + (INV.dur[INV.eq.ropa] != null ? INV.dur[INV.eq.ropa] : ITEMS[INV.eq.ropa].shield) : '') + (suero.map ? ' · SUERO: ' + MAPS[suero.map].name : ''); }
  async function persist() { if (!P || !me || !look) return; store.set('cz-inv-' + me.id, JSON.stringify(INV));
    const row = { user_id: me.id, look, zone: mapKey, x: Math.round(P.x), y: Math.round(P.y), hp: Math.max(1, Math.round(P.hp)), xp: P.xp, kills: P.kills, updated_at: new Date().toISOString() };
    if (!noInvCol) row.inv = INV;
    try { const { error } = await sb.from('game_chars').upsert(row); if (error && /inv/.test(error.message || '')) { noInvCol = true; delete row.inv; await sb.from('game_chars').upsert(row); } } catch (e) {} }

  /* ---------- el suero: uno solo en todo el mundo, cambia de lugar cada 3 minutos ---------- */
  const SLOT_MS = 180000, MAP_KEYS = Object.keys(MAPS); const suero = { slot: -1, map: null, taken: -1 };
  function seeded(n) { let a = (n * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function clearSuero() { for (let i = pickups.length - 1; i >= 0; i--) if (pickups[i].k === 'suero') pickups.splice(i, 1); }
  function sueroTick(force) { const slot = Math.floor(Date.now() / SLOT_MS); if (slot === suero.slot && !force) return;
    const changed = slot !== suero.slot; suero.slot = slot; const r = seeded(slot); suero.map = MAP_KEYS[(r() * MAP_KEYS.length) | 0]; clearSuero();
    if (suero.taken === slot) { suero.map = null; hud(); return; }
    try { sb.from('game_state').select('v').eq('k', 'suero').maybeSingle().then(res => { const v = res && res.data && res.data.v; if (v && v.slot === slot) { suero.taken = slot; suero.map = null; clearSuero(); hud(); } }, () => {}); } catch (e) {}
    if (suero.map === mapKey) { for (let k = 0; k < 3000; k++) { const c = (r() * grid.length) | 0; if (grid[c]) { pickups.push({ k: 'suero', x: (c % GW + .5) * CW, y: (((c / GW) | 0) + .5) * CW, t: 0, pid: 'suero-' + slot }); break; } } }
    if (changed && running) toast('Rumor en la red: hay un suero en ' + MAPS[suero.map].name.toLowerCase() + '.'); hud(); }
  function sueroTaken() { suero.taken = suero.slot; suero.map = null; try { sb.from('game_state').upsert({ k: 'suero', v: { slot: suero.slot, by: me.nick }, updated_at: new Date().toISOString() }).then(() => {}, () => {}); } catch (e) {} hud(); }

  /* ---------- items ---------- */
  const curW = () => WEAP[INV && INV.eq.arma] ? INV.eq.arma : 'palo';
  function weaponLabel() { const w = curW(), it = ITEMS[w]; return WEAP[w].n + (it && it.uses ? ' ' + (INV.dur[w] != null ? INV.dur[w] : it.uses) + (w === 'pistola' ? ' tiros' : '') : ''); }
  function ownedWeapons() { return WEAPON_KEYS.filter(w => w === 'palo' || hasItem(w)); }
  function cycleWeapon() { if (!P || P.dead) return; const list = ownedWeapons(); if (list.length < 2) return toast('Solo tenés el palo. Buscá armas en los mapas.'); const i = list.indexOf(curW()); setWeapon(list[(i + 1) % list.length]); }
  function setWeapon(w) { INV.eq.arma = w; const it = ITEMS[w]; if (it && it.uses && INV.dur[w] == null) INV.dur[w] = it.uses; SND.pick(); toast('En la mano: ' + (w === 'palo' ? 'Palo' : it.n)); hud(); }
  function breakItem(k) { const it = ITEMS[k]; INV.items[k] = (INV.items[k] || 1) - 1;
    if (INV.items[k] > 0) INV.dur[k] = it.shield || it.uses; else { delete INV.items[k]; delete INV.dur[k]; if (it.eq === 'ropa') INV.eq.ropa = null; }
    const ms = Object.keys(MAPS).filter(m => m !== mapKey); const where = ms[(Math.random() * ms.length) | 0]; INV.lost[k] = where;
    SND.hurt(); toast('Se rompió: ' + it.n + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); hud(); persist(); }
  function wearWeapon() { const w = curW(), it = ITEMS[w]; if (!it || !it.uses) return; if (INV.dur[w] == null) INV.dur[w] = it.uses; INV.dur[w]--;
    if (INV.dur[w] <= 0) { INV.items[w] = (INV.items[w] || 1) - 1; if (INV.items[w] > 0) INV.dur[w] = it.uses; else { delete INV.items[w]; delete INV.dur[w]; INV.eq.arma = 'palo'; }
      const others_ = Object.keys(MAPS).filter(m => m !== mapKey && !MAPS[m].safeAll); const where = others_[(Math.random() * others_.length) | 0]; INV.lost[w] = where;
      SND.hurt(); buzz([30, 30, 30]); toast((w === 'pistola' ? 'La pistola se quedó sin tiros' : 'Se rompió ' + (w === 'lanza' || w === 'pistola' ? 'la ' : 'el ') + it.n.toLowerCase()) + '. Dicen que apareció otra en ' + MAPS[where].name.toLowerCase() + '.'); persist(); }
    hud(); }
  function randomWalkCell(minDist) { for (let k = 0; k < 400; k++) { const c = (Math.random() * grid.length) | 0; if (!grid[c]) continue; const x = (c % GW + .5) * CW, y = (((c / GW) | 0) + .5) * CW; if (Math.hypot(x - P.x, y - P.y) > minDist && !(MAP.exits || []).some(e => x / WS >= e.r[0] - 40 && x / WS <= e.r[2] + 40 && y / WS >= e.r[1] - 40 && y / WS <= e.r[3] + 40)) return [x, y]; } return null; }
  function spawnPickup(k, at) { const p = at || randomWalkCell(300); if (!p) return; pickups.push({ k: k || pickW(LOOT[mapKey] || LOOT.parque), x: p[0], y: p[1], t: Math.random() * 6 }); }
  function addItem(k, n) { INV.items[k] = (INV.items[k] || 0) + (n || 1); }
  function hasItem(k) { return (INV.items[k] || 0) > 0; }
  const dmgMult = () => { let m = 1 / (1 + .09 * (lvlOf(P.xp) - 1)); if (INV.eq.brazo === 'b_contencion') m *= .7; if (INV.eq.cara === 'mascara' && /subte|complejo|inferior/.test(mapKey)) m *= .8; return m; };
  function hitPlayer(d, knockFrom, knock, byId) { if (P.dead || P.inv > 0 || (!byId && inSafe(P.x, P.y))) return false;
    d = Math.max(1, Math.round(d * dmgMult()));
    const rk = INV.eq.ropa; if (rk && ITEMS[rk]) { if (INV.dur[rk] == null) INV.dur[rk] = ITEMS[rk].shield; const take = Math.min(INV.dur[rk], d); INV.dur[rk] -= take; d -= take;
      floats.push({ x: P.x + 26, y: P.y - 210, t: .8, txt: 'escudo -' + take, c: '#a9b4c0' }); if (INV.dur[rk] <= 0) breakItem(rk); }
    P.hp -= d; P.hurtT = .3; SND.hurt(); buzz(knock ? [60, 30, 60] : 40); shake = Math.max(shake, knock ? .35 : .15);
    floats.push({ x: P.x, y: P.y - 190, t: .9, txt: '-' + d, c: '#ff6a5c' });
    if (knock && knockFrom) { const dx = P.x - knockFrom.x, dy = P.y - knockFrom.y, l = Math.hypot(dx, dy) || 1; for (let i = 0; i < 6; i++) { const nx = P.x + dx / l * knock / 6, ny = P.y + dy / l * knock / 6; if (walkable(nx, ny)) { P.x = nx; P.y = ny; } } }
    if (P.hp <= 0) { P.hp = 0; P.dead = true; buzz([80, 60, 160]); P.lostLv = lvlOf(P.xp); P.xp = 0;
      if (byId) { const who = (others.get(byId) || {}).nick || 'alguien'; $('#ov-dead').querySelector('p').textContent = 'Te derribó ' + who + '. ' + homeText(); pvpDrop(); if (ch) ch.send({ type: 'broadcast', event: 'died', payload: { id: me.id, by: byId } }); }
      else $('#ov-dead').querySelector('p').textContent = 'La ceniza te cubrió. ' + homeText();
      $('#d-lv').textContent = P.lostLv > 1 ? 'Perdiste todo tu nivel: estabas en el ' + P.lostLv + ', volvés al 1.' : 'Volvés al nivel 1.';
      sendPos(true); persist(); setTimeout(() => $('#ov-dead').hidden = false, 700); }
    hud(); return true; }

  /* PvP: al morir a manos de otro jugador se te cae un objeto común */
  function pvpDrop() { const k = ['suero', 'pilas', 'campera', 'chaleco'].find(k => hasItem(k) && INV.eq.ropa !== k); if (!k) return; INV.items[k]--; if (!INV.items[k]) delete INV.items[k];
    const pid = me.id.slice(0, 6) + Date.now(); pickups.push({ k, x: P.x, y: P.y, t: 0, pid }); if (ch) ch.send({ type: 'broadcast', event: 'drop', payload: { pid, k, x: Math.round(P.x), y: Math.round(P.y) } }); persist(); }
  const enemy = o => o && o.fac && o.fac !== me.faction && !o.dead && !o.iv;

  /* mochila */
  let invSel = null;
  function openInv() { if (!running || P.dead) return; paused = true; $('#ov-inv').hidden = false; renderInv(); }
  function closeInv() { paused = false; $('#ov-inv').hidden = true; persist(); }
  function renderInv() {
    const eqName = k => k ? (k === 'palo' ? 'Palo' : ITEMS[k].n) : '—';
    $('#inv-eq').innerHTML = '<span>ARMA <b>' + eqName(INV.eq.arma) + '</b></span><span>LUZ <b>' + (INV.eq.luz ? 'Linterna ' + Math.ceil(INV.bat) + '%' : '—') + '</b></span><span>ROPA <b>' + eqName(INV.eq.ropa) + '</b></span><span>CARA <b>' + eqName(INV.eq.cara) + '</b></span><span>BRAZO <b>' + eqName(INV.eq.brazo) + '</b></span>';
    const box = $('#inv-slots'); box.innerHTML = ''; const keys = Object.keys(ITEMS).filter(k => hasItem(k));
    if (!keys.length) box.innerHTML = '<div class="empty">La mochila está vacía. Buscá cosas brillando en el piso.</div>';
    keys.forEach(k => { const b = document.createElement('button'); b.setAttribute('aria-pressed', invSel === k); if (Object.values(INV.eq).includes(k)) b.classList.add('on');
      const cv = document.createElement('canvas'); cv.width = 12; cv.height = 12; cv.getContext('2d').drawImage(PIX.icon(k), 0, 0); b.appendChild(cv);
      if (INV.items[k] > 1) { const i = document.createElement('i'); i.textContent = INV.items[k]; b.appendChild(i); }
      b.onclick = () => { invSel = k; renderInv(); }; box.appendChild(b); });
    const det = $('#inv-det'); if (!invSel || !hasItem(invSel)) { det.innerHTML = '<p>Tocá un objeto para ver qué hace.</p>'; return; }
    const it = ITEMS[invSel]; let act = '';
    if (it.use === 'heal') act = '<button class="btn solid" data-a="use">USAR</button>';
    if (it.use === 'pilas') act = '<button class="btn solid" data-a="use">CARGAR LINTERNA</button>';
    if (it.eq) { const on = INV.eq[it.eq] === invSel; act = '<button class="btn solid" data-a="eq">' + (on ? (it.eq === 'arma' ? 'GUARDAR Y USAR EL PALO' : it.eq === 'luz' ? 'APAGAR' : 'SACAR') : (it.eq === 'luz' ? 'PRENDER' : it.eq === 'arma' ? 'TENER EN LA MANO' : 'EQUIPAR')) + '</button>'; }
    det.innerHTML = '<b>' + it.n + (INV.items[invSel] > 1 ? ' ×' + INV.items[invSel] : '') + '</b><small>' + it.t.toUpperCase() + (it.uses ? ' · ' + (invSel === 'pistola' ? 'TIROS ' : 'USOS ') + (INV.dur[invSel] != null ? INV.dur[invSel] : it.uses) + '/' + it.uses : '') + (it.shield ? ' · QUEDA ' + (INV.dur[invSel] != null ? INV.dur[invSel] : it.shield) + '/' + it.shield : '') + '</small><p>' + it.d + '</p>' + (act ? '<div class="row">' + act + '</div>' : '');
    det.querySelectorAll('[data-a]').forEach(b => b.onclick = () => useItem(invSel, b.dataset.a)); }
  function useItem(k, a) { const it = ITEMS[k]; const lv = lvlOf(P.xp);
    if (a === 'use' && it.use === 'heal') { if (P.hp >= maxHp(lv)) return toast('Ya estás con la vida completa. Guardalo.'); P.hp = maxHp(lv); INV.items[k]--; SND.level(); toast('Te inyectaste el suero. Vida completa.'); }
    if (a === 'use' && it.use === 'pilas') { if (!hasItem('linterna')) return toast('Primero necesitás una linterna.'); INV.bat = 100; INV.items[k]--; toast('Linterna cargada.'); }
    if (a === 'eq' && slot_is_weapon(k)) { if (INV.eq.arma === k) setWeapon('palo'); else setWeapon(k); }
    else if (a === 'eq') { const slot = it.eq; if (INV.eq[slot] === k) INV.eq[slot] = slot === 'arma' ? 'palo' : null; else { INV.eq[slot] = k; if (ITEMS[k].shield && INV.dur[k] == null) INV.dur[k] = ITEMS[k].shield; if (k === 'linterna' && INV.bat <= 0) { if (hasItem('pilas')) { INV.items.pilas--; INV.bat = 100; } else { INV.eq.luz = null; toast('La linterna no tiene pilas.'); } } } }
    if (!INV.items[k]) { delete INV.items[k]; if (invSel === k) invSel = null; }
    hud(); renderInv(); }
  function slot_is_weapon(k) { return !!WEAP[k]; }
  $('#inv-b').onclick = openInv; $('#inv-close').onclick = closeInv;

  /* ---------- Oscuros ---------- */
  function spawnMob(kind, minDist, at) { const T = MOB[kind]; const p = at || randomMobCell(minDist); if (!p) return;
    mobs.push({ kind, T, x: p[0], y: p[1], hp: T.hp, face: 1, vx: 0, vy: 0, t: Math.random() * 9, hurt: 0, wind: 0, cd: 0, wx: p[0], wy: p[1], wt: 0, alpha: 0, chasing: false, stuck: 0, lx: p[0], ly: p[1], lunge: 0,
      st: 'idle', stT: 0, side: Math.random() < .5 ? -1 : 1, vis: T.ai === 'blink' ? .2 : 1, dx: 0, dy: 0, hitDone: false }); }
  function killMob(o) {
    const lvBefore = lvlOf(P.xp); P.kills++; P.xp += o.T.xp; SND.dissolve(); buzz(30);
    // se deshace en ceniza: una partícula por cada pixel del dibujo
    const art = PIX[o.T.art](0, false), g = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
    for (let y = 0; y < art.height; y += 1) for (let x = 0; x < art.width; x += 1) { if (g[(y * art.width + x) * 4 + 3] < 10 || Math.random() < .35) continue;
      const wx = o.x + (o.face < 0 ? art.width / 2 - x : x - art.width / 2) * PXS, wy = o.y - (art.height - y) * PXS;
      parts.push({ x: wx, y: wy, vx: rnd(-25, 45), vy: rnd(-70, -5) - (art.height - y) * 1.5, life: rnd(.9, 2), s: PXS * .9, c: Math.random() < .8 ? 40 : 150 }); }
    floats.push({ x: o.x, y: o.y - o.T.h - 10, t: 1.4, txt: '+' + o.T.xp + ' XP', c: '#e8e4da' });
    const i = mobs.indexOf(o); if (i >= 0) mobs.splice(i, 1);
    const r = Math.random(), dropAt = [o.x, o.y];
    if (o.kind === 'denso' && r < .35) spawnPickup(Math.random() < .5 ? 'b_contencion' : 'b_resonancia', dropAt);
    else if (o.kind === 'sombra' && r < .2) spawnPickup('pagina', dropAt);
    else if (r < .18) spawnPickup(pickW([['pilas', 3], ['campera', 1], ['chaleco', .4]]), dropAt);
    const mk = mapKey; setTimeout(() => { if (mapKey === mk && MAP && (MAP.mobs || {})[o.kind]) spawnMob(o.kind, 640); }, rnd(10000, 18000));
    if (lvlOf(P.xp) > lvBefore) { P.hp += maxHp(lvlOf(P.xp)) - maxHp(lvBefore); SND.level(); buzz([40, 40, 90]); setTimeout(() => toast('SUBISTE A NIVEL ' + lvlOf(P.xp) + ' · pegás ' + playerDmg()), 500); }
    hud(); }

  /* ---------- online: salas de 10 por mapa ---------- */
  function joinRoom(n) {
    if (ch) { sb.removeChannel(ch); ch = null; } others.clear(); room = n; const myMap = mapKey;
    $('#h-sala').textContent = 'sala ' + n + ' · conectando…';
    const c = sb.channel('cenizas-' + myMap + '-' + n, { config: { presence: { key: me.id }, broadcast: { self: false } } }); ch = c;
    c.on('presence', { event: 'sync' }, () => { if (ch !== c) return; const st = c.presenceState(); const ids = Object.keys(st);
        for (const id of [...others.keys()]) if (!ids.includes(id)) others.delete(id);
        ids.forEach(id => { if (id === me.id) return; const m = st[id][0] || {}; const o = others.get(id) || { x: m.x || P.x, y: m.y || P.y, tx: m.x || P.x, ty: m.y || P.y, face: 1, walkT: 0, say: '', sayT: 0 };
          Object.assign(o, { look: m.look, nick: m.nick, fac: m.fac, lvl: m.lvl }); others.set(id, o); });
        $('#h-sala').textContent = 'sala ' + n + ' · ' + ids.length + '/10 acá'; })
      .on('broadcast', { event: 'pos' }, ({ payload: p }) => { const o = others.get(p.id); if (!o) return; o.tx = p.x; o.ty = p.y; o.face = p.f || o.face; o.dir = p.d || o.dir; o.mv = p.mv; o.hp = p.hp; o.dead = !!p.dd; o.iv = !!p.iv; if (p.atk) o.atk = .25; })
      .on('broadcast', { event: 'say' }, ({ payload: p }) => { const o = others.get(p.id); if (o) { o.say = p.t; o.sayT = 6; } })
      .on('broadcast', { event: 'hit' }, ({ payload: p }) => { const a = others.get(p.id);
        if (p.to === me.id) { if (!a || a.fac === me.faction) return; if (hitPlayer(p.d, { x: p.ax, y: p.ay }, 40, p.id)) { floats.push({ x: P.x, y: P.y - 215, t: 1, txt: a.nick, c: '#ff7a70' }); } }
        else { const v = others.get(p.to); if (v) v.hurt = .2; } })
      .on('broadcast', { event: 'died' }, ({ payload: p }) => { const v = others.get(p.id); if (v) { v.dead = true; v.hp = 0; }
        if (p.by === me.id) { const lvB = lvlOf(P.xp); P.xp += 40; P.pvp = (P.pvp || 0) + 1; SND.level(); buzz([40, 40, 90]); toast('Derribaste a ' + (v ? v.nick : 'un enemigo') + ' · +40 XP'); if (lvlOf(P.xp) > lvB) P.hp += maxHp(lvlOf(P.xp)) - maxHp(lvB); hud(); persist(); }
        else if (v) toast(v.nick + ' cayó.'); })
      .on('broadcast', { event: 'shot' }, ({ payload: p }) => { shots.push({ x: p.x, y: p.y, vx: p.vx * 1100, vy: p.vy * 1100 * .8, life: .6, fake: true }); SND.shot(.35); })
      .on('broadcast', { event: 'suero' }, ({ payload: p }) => { if (p.slot === suero.slot) { suero.taken = p.slot; suero.map = null; clearSuero(); toast(p.by + ' agarró el suero.'); hud(); } })
      .on('broadcast', { event: 'drop' }, ({ payload: p }) => { if (!pickups.some(q => q.pid === p.pid)) pickups.push({ k: p.k, x: p.x, y: p.y, t: 0, pid: p.pid }); })
      .on('broadcast', { event: 'took' }, ({ payload: p }) => { const i = pickups.findIndex(q => q.pid === p.pid); if (i >= 0) pickups.splice(i, 1); })
      .subscribe(async status => { if (ch !== c) return;
        if (status !== 'SUBSCRIBED') { if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') $('#h-sala').textContent = 'sin conexión · jugando solo'; return; }
        await c.track({ nick: me.nick, fac: me.faction, look, lvl: lvlOf(P.xp), x: P.x, y: P.y, at: Date.now() });
        setTimeout(() => { if (ch !== c) return; const st = c.presenceState(); const list = Object.entries(st).map(([id, v]) => ({ id, at: (v[0] && v[0].at) || 0 })).sort((a, b) => a.at - b.at);
          const idx = list.findIndex(e => e.id === me.id); if (list.length > 10 && idx >= 10 && n < 50) { toast('Sala ' + n + ' llena · pasando a la ' + (n + 1)); joinRoom(n + 1); } }, 900); });
  }
  function sendPos(force) { if (!ch) return; const now = performance.now(); const hpP = Math.round(P.hp / maxHp(lvlOf(P.xp)) * 100); const k = Math.round(P.x) + ',' + Math.round(P.y) + P.dir + (P.mv ? 1 : 0) + hpP + (P.dead ? 'x' : '') + (P.inv > 0 ? 'i' : '');
    if (!force && (k === lastPos ? now - lastSent < 1500 : now - lastSent < 100)) return; lastPos = k; lastSent = now;
    ch.send({ type: 'broadcast', event: 'pos', payload: { id: me.id, x: Math.round(P.x), y: Math.round(P.y), f: P.face, d: P.dir, mv: P.mv, atk: P.atk > .2, hp: hpP, dd: P.dead ? 1 : 0, iv: P.inv > 0 ? 1 : 0 } }); }

  /* ---------- controles ---------- */
  const keys = {}; let joy = { on: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
  addEventListener('keydown', e => { if (document.activeElement === $('#say-in')) return; keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.toLowerCase() === 'j') attack(); if (e.key === 'Enter' || e.key.toLowerCase() === 'k') pressA(); if (e.key === 'Escape') openMenu(); if (e.key.toLowerCase() === 'q') cycleWeapon(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const cv = $('#cv');
  cv.addEventListener('pointerdown', e => { if (!running || paused) return; if (e.clientX > innerWidth * .55) return; joy = { on: true, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; const s = $('#stick'); s.hidden = false; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; $('#knob').style.transform = ''; $('#hintL').hidden = true; });
  addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const d = Math.hypot(dx, dy), m = 50; if (d > m) { dx = dx / d * m; dy = dy / d * m; } joy.dx = dx / m; joy.dy = dy / m; $('#knob').style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; });
  const endJoy = e => { if (e.pointerId !== joy.id) return; joy.on = false; joy.dx = joy.dy = 0; $('#stick').hidden = true; };
  addEventListener('pointerup', endJoy); addEventListener('pointercancel', endJoy);
  $('#btn-b').addEventListener('pointerdown', e => { e.preventDefault(); attack(); $('#btn-b').classList.add('on'); setTimeout(() => $('#btn-b').classList.remove('on'), 120); });
  $('#btn-a').addEventListener('pointerdown', e => { e.preventDefault(); pressA(); });
  $('#btn-w').addEventListener('pointerdown', e => { e.preventDefault(); cycleWeapon(); });
  const playerDmg = () => Math.max(1, dmgOf(lvlOf(P.xp)) + (INV ? WEAP[curW()].dmg : 0) - (INV && INV.eq.brazo === 'b_contencion' ? 1 : 0));
  function attack() { if (!P || P.dead || paused || P.cd > 0) return; const wk = curW(), W = WEAP[wk]; P.atk = .3; P.cd = W.cd; P.wk = wk;
    const fx = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[P.dir], dmg = playerDmg(), range = W.range; let hitAny = false;
    if (W.gun) { shoot(fx, dmg); return; }
    sendPos(true); SND.swing(); buzz(12);
    mobs.slice().forEach(o => { if (o.vis < .5) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range + (o.T.heavy ? 30 : 0)) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      hitAny = true; o.hp -= dmg; o.hurt = .2; if (!o.T.heavy) o.wind = Math.max(0, o.wind - .12); const kb = o.T.heavy ? (wk === 'bate' ? 14 : 0) : (o.st === 'run' ? 8 : W.kb);
      if (o.st === 'run') { o.st = 'rest'; o.stT = 1.1; }
      const nx = o.x + fx[0] * kb, ny = o.y + fx[1] * kb; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; }
      floats.push({ x: o.x + rnd(-10, 10), y: o.y - o.T.h * .8, t: .8, txt: '-' + dmg, c: '#ffffff' });
      for (let i = 0; i < 10; i++) parts.push({ x: o.x, y: o.y - o.T.h * .6, vx: rnd(-140, 140), vy: rnd(-110, -30), life: .6, s: rnd(2, 4), c: 25 });
      if (!o.chasing) { o.chasing = true; SND.mob(o.T.snd, .25); }
      if (o.hp <= 0) killMob(o); });
    others.forEach((o, id) => { if (!enemy(o)) return; const dx = o.x - P.x, dy = (o.y - P.y) * 1.3, dist = Math.hypot(dx, dy); if (dist > range) return;
      const dot = (dx * fx[0] + dy * fx[1]) / (dist || 1); if (W.line ? (dot < .75 && dist > 36) : (dot < .1 && dist > 36)) return;
      const d = dmg * 8; hitAny = true; o.hurt = .2; floats.push({ x: o.x + rnd(-10, 10), y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' });
      if (ch) ch.send({ type: 'broadcast', event: 'hit', payload: { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) } }); });
    if (hitAny) { SND.hit(); buzz(25); wearWeapon(); } }
  /* pistola: la bala viaja y pega al primero que encuentra */
  function shoot(fx, dmg) { const ox = P.x + fx[0] * 40, oy = P.y - 95 + fx[1] * 20; shots.push({ x: ox, y: oy, vx: fx[0] * 1100, vy: fx[1] * 1100 * .8, life: .6, dmg });
    SND.shot(); buzz(30); shake = Math.max(shake, .12); sendPos(true); if (ch) ch.send({ type: 'broadcast', event: 'shot', payload: { x: Math.round(ox), y: Math.round(oy), vx: fx[0], vy: fx[1] } }); wearWeapon(); }
  function updateShots(dt) { for (let i = shots.length - 1; i >= 0; i--) { const b = shots[i]; const steps = 4; let hit = false;
      for (let k = 0; k < steps && !hit; k++) { b.x += b.vx * dt / steps; b.y += b.vy * dt / steps; const gy = b.y + 95;
        if (!walkable(b.x, gy) && !b.fake) { hit = true; break; }
        if (b.fake) continue;
        for (const o of mobs) { if (o.vis < .5) continue; if (Math.abs(o.x - b.x) < o.T.pw * PXS * .45 && gy > o.y - 40 && gy < o.y + 40) { hit = true; o.hp -= b.dmg; o.hurt = .2; const l = Math.hypot(b.vx, b.vy) || 1, kb = o.T.heavy ? 0 : 14, nx = o.x + b.vx / l * kb, ny = o.y + b.vy / l * kb; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; }
            floats.push({ x: o.x, y: o.y - o.T.h * .8, t: .8, txt: '-' + b.dmg, c: '#ffffff' }); if (!o.chasing) o.chasing = true; SND.hit(); if (o.hp <= 0) killMob(o); break; } }
        if (!hit) others.forEach((o, id) => { if (hit || !enemy(o)) return; if (Math.abs(o.x - b.x) < 40 && gy > o.y - 40 && gy < o.y + 40) { hit = true; const d = b.dmg * 6; o.hurt = .2; floats.push({ x: o.x, y: o.y - 170, t: .8, txt: '-' + d, c: '#ffffff' }); SND.hit();
            if (ch) ch.send({ type: 'broadcast', event: 'hit', payload: { id: me.id, to: id, d, ax: Math.round(P.x), ay: Math.round(P.y) } }); } }); }
      b.life -= dt; if (hit || b.life <= 0) { for (let j = 0; j < 6; j++) parts.push({ x: b.x, y: b.y + 95 - 95, vx: rnd(-80, 80), vy: rnd(-80, 0), life: .3, s: 2, c: 200 }); shots.splice(i, 1); } } }
  function pressA() { if (!P || P.dead || paused) return; const s = $('#say'); s.hidden = false; const i = $('#say-in'); i.value = ''; i.focus(); }
  function sendSay() { const t = $('#say-in').value.trim(); $('#say').hidden = true; $('#say-in').blur(); if (!t) return; P.say = t; P.sayT = 6; if (ch) ch.send({ type: 'broadcast', event: 'say', payload: { id: me.id, t } }); }
  $('#say-go').onclick = sendSay; $('#say-in').addEventListener('keydown', e => { if (e.key === 'Enter') sendSay(); if (e.key === 'Escape') { $('#say').hidden = true; $('#say-in').blur(); } });

  /* ---------- menú / salir ---------- */
  function openMenu() { if (!running) return; paused = true; $('#ov-menu').hidden = false; }
  $('#menu-b').onclick = openMenu; $('#m-back').onclick = () => { paused = false; $('#ov-menu').hidden = true; };
  $('#m-snd').onclick = () => { SND.init(); $('#m-snd').textContent = 'SONIDO: ' + (SND.toggle() ? 'SÍ' : 'NO'); };
  $('#m-exit').onclick = async () => { $('#m-exit').disabled = true; $('#m-exit').textContent = 'GUARDANDO…'; await persist(); if (ch) sb.removeChannel(ch);
    try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'portrait' }); } catch (e) {} location.replace('/index.html#theof'); };
  if (PL.App && PL.App.addListener) PL.App.addListener('backButton', () => { if (!$('#say').hidden) { $('#say').hidden = true; return; } if (!$('#ov-inv').hidden) { closeInv(); return; } if (paused) { paused = false; $('#ov-menu').hidden = true; } else openMenu(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  $('#d-fac').onclick = async () => { const b = $('#d-fac'); b.disabled = true; b.textContent = 'REINICIANDO…'; await persist();
    const { error } = await sb.rpc('game_reset_faction'); if (error) { b.disabled = false; b.textContent = 'ELEGIR BANDO DE NUEVO'; return toast('No se pudo: falta correr 05_reglas.sql en Supabase.'); }
    if (ch) sb.removeChannel(ch); try { if (PL.ScreenOrientation) await PL.ScreenOrientation.lock({ orientation: 'portrait' }); } catch (e) {} location.replace('/index.html'); };
  $('#d-ok').onclick = () => { $('#ov-dead').hidden = true; $('#fade').classList.add('on');
    setTimeout(() => { P.hp = maxHp(lvlOf(P.xp)); P.dead = false; hud(); const [hz, hp_] = home(); if (mapKey !== hz) enterMap(hz, hp_[0] * WS, hp_[1] * WS); else { P.x = hp_[0] * WS; P.y = hp_[1] * WS; P.inv = 4; buildFlow(); } hud(); sendPos(true); persist(); $('#fade').classList.remove('on'); }, 600); };

  /* =================== LOOP =================== */
  const ctx = cv.getContext('2d'); let DPR = 1, VW = 0, VH = 0, zoom = 1, last = 0, t = 0;
  const dark = document.createElement('canvas'), dg = dark.getContext('2d');
  const tint = document.createElement('canvas'), tg = tint.getContext('2d');
  function resize() { DPR = Math.min(2, devicePixelRatio || 1); VW = innerWidth; VH = innerHeight; cv.width = VW * DPR; cv.height = VH * DPR; dark.width = Math.ceil(VW / 2); dark.height = Math.ceil(VH / 2); zoom = Math.max(.55, Math.min(1.35, VH / 600)); }
  addEventListener('resize', resize); resize();
  function newAsh(any) { return { x: Math.random() * VW, y: any ? Math.random() * VH : -10, v: 12 + Math.random() * 26, w: Math.random() * 6.28, s: .8 + Math.random() * 1.8, o: .2 + Math.random() * .45 }; }
  function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; if (!paused && !warping) update(dt); render(); requestAnimationFrame(loop); }

  function update(dt) {
    // jugador
    let ix = joy.dx, iy = joy.dy;
    if (keys.arrowleft || keys.a) ix = -1; if (keys.arrowright || keys.d) ix = 1; if (keys.arrowup || keys.w) iy = -1; if (keys.arrowdown || keys.s) iy = 1;
    const mag = Math.hypot(ix, iy); P.mv = !P.dead && mag > .18;
    if (P.mv) { const sp = 175 * Math.min(1, mag); const vx = ix / mag * sp * dt, vy = iy / mag * sp * dt;
      if (walkable(P.x + vx, P.y)) P.x += vx; if (walkable(P.x, P.y + vy)) P.y += vy;
      P.dir = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'l' : 'r') : (iy < 0 ? 'u' : 'd'); if (Math.abs(ix) > .2) P.face = ix < 0 ? -1 : 1;
      P.walkT += dt * 9 * Math.min(1, mag); P.stepT -= dt; if (P.stepT <= 0) { P.stepT = .36; SND.step(); } }
    P.atk = Math.max(0, P.atk - dt); P.cd = Math.max(0, P.cd - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.inv = Math.max(0, P.inv - dt); if (P.sayT > 0) P.sayT -= dt;
    const fireD = MAP.fire ? Math.hypot(P.x - MAP.fire[0] * WS, P.y - MAP.fire[1] * WS) : 9999;
    SND.fire(Math.max(0, 1 - fireD / 700));
    const lv = lvlOf(P.xp);
    if (INV.eq.luz) { INV.bat = Math.max(0, INV.bat - dt * .8); if (INV.bat <= 0) { INV.eq.luz = null; toast('La linterna se quedó sin pilas.'); } if ((t % 1) < dt) hud(); }
    shake = Math.max(0, shake - dt); updateShots(dt); sueroTick(false);
    for (let i = pickups.length - 1; i >= 0; i--) { const q = pickups[i]; q.t += dt; if (!P.dead && Math.hypot(q.x - P.x, (q.y - P.y) * 1.2) < 70) { pickups.splice(i, 1); addItem(q.k); SND.pick(); buzz(20); if (q.k === 'suero') sueroTaken(); if (q.pid && ch) ch.send({ type: 'broadcast', event: 'took', payload: { pid: q.pid } });
        toast('Encontraste: ' + ITEMS[q.k].n + (ITEMS[q.k].eq ? ' · equipalo desde la MOCHILA' : ''));
        if (q.k === 'pagina') { const n = INV.items.pagina; floats.push({ x: P.x, y: P.y - 210, t: 1.6, txt: 'página ' + n, c: '#e8e4da' }); }
        if (q.k === 'suero' && ch) ch.send({ type: 'broadcast', event: 'suero', payload: { slot: suero.slot, by: me.nick } });
        if (!q.pid) { const mk = mapKey; setTimeout(() => { if (mapKey === mk && pickups.length < (MAP.safeAll ? 2 : 6)) spawnPickup(); }, rnd(40000, 75000)); } persist(); } }
    sendPos(false);
    // salidas
    const ix0 = P.x / WS, iy0 = P.y / WS; let inExit = null;
    (MAP.exits || []).forEach(e => { if (ix0 >= e.r[0] - 4 && ix0 <= e.r[2] + 4 && iy0 >= e.r[1] - 4 && iy0 <= e.r[3] + 4) inExit = e; });
    if (!inExit) exitLock = false; else if (!exitLock && !P.dead) warp(inExit);
    // otros jugadores
    others.forEach(o => { const dx = o.tx - o.x, dy = o.ty - o.y; o.x += dx * Math.min(1, dt * 10); o.y += dy * Math.min(1, dt * 10); if (Math.hypot(dx, dy) > 2 || o.mv) o.walkT = (o.walkT || 0) + dt * 9; if (o.sayT > 0) o.sayT -= dt; if (o.atk > 0) o.atk -= dt; });
    // Oscuros
    flowT -= dt; if (flowT <= 0) { flowT = .3; buildFlow(); }
    const pSafe = inSafe(P.x, P.y);
    const sightMul = (INV.eq.brazo === 'b_resonancia' ? 1.4 : 1) * (INV.eq.luz && MAP.dark > .45 ? 1.2 : 1);
    function steer(o, dx, dy, dist) { const c = cellOf(o.x, o.y), d0 = flow[c];
      if (dist < CW * 2.2 || d0 < 0) return [dx / dist, dy / dist];
      let best = d0, bx = 0, by = 0; const cx = c % GW, cy = (c / GW) | 0;
      for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = cx + ddx, ny = cy + ddy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const v = flow[ny * GW + nx]; if (v >= 0 && v < best) { best = v; bx = ddx; by = ddy; } }
      if (bx || by) { const tx = (cx + bx + .5) * CW, ty = (cy + by + .5) * CW, l = Math.hypot(tx - o.x, ty - o.y) || 1; return [(tx - o.x) / l, (ty - o.y) / l]; } return [dx / dist, dy / dist]; }
    function blinkTo(o, near) { let p = null; if (near) for (let k = 0; k < 25 && !p; k++) { const a = Math.random() * 6.283, r = rnd(110, 175), nx = P.x + Math.cos(a) * r, ny = P.y + Math.sin(a) * r * .7; if (mobWalk(nx, ny)) p = [nx, ny]; }
      if (!p) p = randomMobCell(500); if (p) { for (let i = 0; i < 18; i++) parts.push({ x: o.x + rnd(-20, 20), y: o.y - rnd(0, o.T.h), vx: rnd(-40, 40), vy: rnd(-60, -10), life: rnd(.4, .9), s: rnd(2, 5), c: 20 }); o.x = p[0]; o.y = p[1]; } }
    mobs.slice().forEach(o => { const T = o.T; o.t += dt; o.alpha = Math.min(1, o.alpha + dt * .8); o.hurt = Math.max(0, o.hurt - dt); o.cd = Math.max(0, o.cd - dt); o.lunge = Math.max(0, o.lunge - dt * 3); o.stT -= dt;
      const dx = P.x - o.x, dy = P.y - o.y, dist = Math.hypot(dx, dy) || 1;
      const sees = !P.dead && !pSafe && P.inv <= 0 && dist < T.sight * sightMul;
      if (sees && !o.chasing) { o.chasing = true; SND.mob(T.snd, Math.max(.08, .35 - dist / 2000)); }
      if (!sees && dist > T.sight * sightMul * 1.4) { o.chasing = false; if (o.st !== 'idle' && T.ai !== 'blink') o.st = 'idle'; }
      let mx = 0, my = 0, sp = T.wsp;
      const strike = () => { o.lunge = 1; o.cd = T.cd;
        if (T.ai === 'slam') { shake = .4; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; parts.push({ x: o.x + Math.cos(a) * 30, y: o.y + Math.sin(a) * 12, vx: Math.cos(a) * 160, vy: Math.sin(a) * 60 - 20, life: .7, s: 4, c: 60 }); }
          if (dist < T.aoe) hitPlayer(T.dmg, o, 110); }
        else if (dist < T.reach + 28) hitPlayer(T.dmg, o, 0); };
      if (o.wind > 0) { o.wind -= dt; if (o.wind <= 0) { strike(); if (T.ai === 'blink') { o.st = 'fadeout'; o.stT = .45; o.far = Math.random() < .35; } } }
      else if (T.ai === 'dash' && o.chasing && !P.dead) {
        if (o.st === 'idle' || o.st === 'chase') { if (dist > 150 && o.cd <= 0) { o.st = 'aim'; o.stT = T.wind; SND.mob('shriek', .22); } else if (dist < T.reach && o.cd <= 0) { o.wind = .3; SND.warn(); } else { sp = T.sp; [mx, my] = steer(o, dx, dy, dist); } }
        else if (o.st === 'aim') { o.face = dx < 0 ? -1 : 1; if (o.stT <= 0) { const lead = .25, tx = P.x + (P.mv ? (joy.dx || 0) * 175 * lead : 0) - o.x, ty = P.y + (P.mv ? (joy.dy || 0) * 175 * lead : 0) - o.y, l = Math.hypot(tx, ty) || 1; o.dx = tx / l; o.dy = ty / l; o.st = 'run'; o.stT = .85; o.hitDone = false; } }
        else if (o.st === 'run') { const nx = o.x + o.dx * T.dash * dt, ny = o.y + o.dy * T.dash * dt; if (mobWalk(nx, ny)) { o.x = nx; o.y = ny; } else o.stT = 0; o.face = o.dx < 0 ? -1 : 1; o.moving = true; o.vx = o.dx; o.vy = o.dy;
          if (Math.random() < .8) parts.push({ x: o.x - o.dx * 30, y: o.y - rnd(20, 120), vx: -o.dx * 60, vy: rnd(-30, 0), life: .5, s: rnd(2, 5), c: 50 });
          if (!o.hitDone && dist < T.reach) { o.hitDone = true; hitPlayer(T.dmg, o, 60); }
          if (o.stT <= 0) { o.st = 'rest'; o.stT = 1.0; o.cd = T.cd; } }
        else if (o.st === 'rest') { if (o.stT <= 0) o.st = 'chase'; } }
      else if (T.ai === 'blink' && !P.dead) {
        if (o.st === 'idle') { o.vis = Math.max(.18, o.vis - dt); if (o.chasing) { o.st = 'fadeout'; o.stT = .4; o.far = false; SND.mob('whisper', .25); } else { o.wt -= dt; if (o.wt <= 0) { o.wt = rnd(3, 6); const p = randomNear(o.x, o.y, 300); o.wx = p[0]; o.wy = p[1]; } const wd = Math.hypot(o.wx - o.x, o.wy - o.y); if (wd > 10) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; } } }
        else if (o.st === 'fadeout') { o.vis = Math.max(0, o.vis - dt * 3); if (o.stT <= 0) { blinkTo(o, !o.far && o.chasing); o.st = o.chasing && !o.far ? 'fadein' : 'idle'; o.stT = .3; o.face = (P.x - o.x) < 0 ? -1 : 1; } }
        else if (o.st === 'fadein') { o.vis = Math.min(1, o.vis + dt * 4); if (o.stT <= 0) { o.vis = 1; o.st = 'strike'; o.stT = 1.6; } }
        else if (o.st === 'strike') { o.face = dx < 0 ? -1 : 1; if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; SND.warn(); } else { sp = T.sp * 1.6; [mx, my] = steer(o, dx, dy, dist); } if (o.stT <= 0) { o.st = 'fadeout'; o.stT = .45; o.far = Math.random() < .3; } } }
      else if (o.chasing && !P.dead) {
        if (dist < T.reach && o.cd <= 0) { o.wind = T.wind; if (T.heavy) SND.mob('roar', .25); else SND.warn(); }
        else if (dist > T.reach * .7) { sp = T.sp;
          if (T.ai === 'flank' && dist < 320) { const px = -dy / dist, py = dx / dist, k = Math.min(1, dist / 260) * o.side; const tx = P.x + px * 90 * k - o.x, ty = P.y + py * 90 * k - o.y, l = Math.hypot(tx, ty) || 1; mx = tx / l; my = ty / l; if (!mobWalk(o.x + mx * 30, o.y + my * 30)) [mx, my] = steer(o, dx, dy, dist); }
          else [mx, my] = steer(o, dx, dy, dist);
          if (T.ai === 'zigzag') { const z = Math.sin(o.t * 7) * .9, px = -my, py = mx; mx += px * z; my += py * z; const l = Math.hypot(mx, my) || 1; mx /= l; my /= l; if (dist < 170 && o.cd <= 0 && Math.random() < dt * 3) { o.wind = T.wind; SND.mob('hiss', .2); } } } }
      else { o.wt -= dt; const wd = Math.hypot(o.wx - o.x, o.wy - o.y);
        if (T.ai !== 'dash' && (o.wt <= 0 || wd < 10)) { o.wt = rnd(2.5, 5.5); const p = randomNear(o.x, o.y, 380); o.wx = p[0]; o.wy = p[1]; }
        if (T.ai !== 'dash' && wd > 10 && o.wt < 4.2) { mx = (o.wx - o.x) / wd; my = (o.wy - o.y) / wd; } }
      if (o.st !== 'run') { if (mx || my) { const nx = o.x + mx * sp * dt, ny = o.y + my * sp * dt; let moved = false;
          if (mobWalk(nx, o.y)) { o.x = nx; moved = true; } if (mobWalk(o.x, ny)) { o.y = ny; moved = true; }
          if (!moved) { o.stuck += dt; } if (Math.abs(mx) > .15) o.face = mx < 0 ? -1 : 1; o.vx = mx; o.vy = my; o.moving = true; } else o.moving = false; }
      if (o.t % 2 < dt) { if (Math.hypot(o.x - o.lx, o.y - o.ly) < 8 && (mx || my)) { o.stuck += 2; o.wt = 0; } else o.stuck = 0; o.lx = o.x; o.ly = o.y; }
      if (o.stuck > 6 || !mgrid[cellOf(o.x, o.y)]) { const p = randomMobCell(600); if (p) { o.x = p[0]; o.y = p[1]; o.stuck = 0; o.alpha = 0; o.chasing = false; o.st = 'idle'; } }
      if (o.vis > .5 && Math.random() < dt * 5) parts.push({ x: o.x + rnd(-.25, .25) * T.pw * PXS, y: o.y - rnd(.2, .9) * T.h, vx: rnd(5, 25), vy: rnd(-40, -15), life: rnd(.8, 1.6), s: rnd(1.5, 3.5), c: 30 }); });
    // separar Oscuros entre sí
    for (let i = 0; i < mobs.length; i++) for (let j = i + 1; j < mobs.length; j++) { const a = mobs[i], b = mobs[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, min = 40;
      if (d < min) { const push = (min - d) / 2, ux = dx / d * push, uy = dy / d * push; if (mobWalk(a.x - ux, a.y - uy)) { a.x -= ux; a.y -= uy; } if (mobWalk(b.x + ux, b.y + uy)) { b.x += ux; b.y += uy; } } }
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 10 * dt; p.vx *= .99; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
    for (let i = floats.length - 1; i >= 0; i--) { floats[i].t -= dt; floats[i].y -= 40 * dt; if (floats[i].t <= 0) floats.splice(i, 1); }
    ash.forEach((a, i) => { a.y += a.v * dt; a.x += Math.sin(t * .8 + a.w) * 12 * dt + 6 * dt; if (a.y > VH + 10) ash[i] = newAsh(false); });
  }
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
      c.fillStyle = 'rgba(240,236,226,' + a * .25 + ')'; c.fillRect(x0, y0, Math.max(6, x1 - x0), Math.max(6, y1 - y0));
      const lx = Math.max(90, Math.min(VW - 90, mx)), ly = Math.max(60, Math.min(VH - 40, my)); const arrow = { l: '◀ ', r: '', u: '▲ ', d: '▼ ' }[e.side] || '', arrowR = e.side === 'r' ? ' ▶' : '';
      c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const txt = arrow + e.label + arrowR; const w = c.measureText(txt).width + 14;
      c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(lx - w / 2, ly - 12, w, 20); c.fillStyle = 'rgba(240,236,226,' + (.6 + a * .4) + ')'; c.fillText(txt, lx, ly + 3); });
    // entidades
    const ents = [];
    ents.push({ y: P.y, draw: () => drawChar(P, look, me.nick, me.faction, true) });
    others.forEach(o => { if (o.look) ents.push({ y: o.y, draw: () => drawChar(o, o.look, o.nick, o.fac, false) }); });
    mobs.forEach(o => ents.push({ y: o.y, draw: () => drawMob(o) }));
    pickups.forEach(q => ents.push({ y: q.y - 30, draw: () => drawPickup(q) }));
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
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
      c.imageSmoothingEnabled = false; if (mine && (P.hurtT > 0 || P.inv > 0)) c.globalAlpha = .7 + Math.sin(t * 30) * .25; if (mine && P.dead) c.globalAlpha = .35;
      if (!mine && o.dead) c.globalAlpha = .3; else if (!mine && o.iv) c.globalAlpha = .6;
      const spr = sprite(lk, dir, frame, (o.atk || 0) > 0); c.drawImage(spr, Math.round(sx - 9 * S), Math.round(sy - 25 * S), Math.round(18 * S), Math.round(26 * S));
      if (!mine && (o.hurt || 0) > 0) { o.hurt -= 1 / 60; c.globalCompositeOperation = 'lighter'; c.globalAlpha = .6; c.drawImage(spr, Math.round(sx - 9 * S), Math.round(sy - 25 * S), Math.round(18 * S), Math.round(26 * S)); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if (!mine && fac !== me.faction && o.hp != null && !o.dead) { const bw = 46 * zoom, by = sy - 27 * S - 24; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 4); c.fillStyle = '#ff6a5c'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / 100), 4); }
      if ((o.atk || 0) > 0) { const a = { d: Math.PI / 2, u: -Math.PI / 2, l: Math.PI, r: 0 }[dir]; const k = 1 - (o.atk / .3), wk = mine ? (P.wk || 'palo') : 'palo';
        if (wk === 'pistola') { const mx = sx + Math.cos(a) * 50 * zoom, my = sy - 95 * zoom + Math.sin(a) * 30 * zoom; c.fillStyle = 'rgba(255,220,140,' + (1 - k) + ')'; c.beginPath(); c.arc(mx, my, 14 * zoom * (1 - k), 0, 7); c.fill(); }
        else if (wk === 'lanza') { const r0 = 30 * zoom, r1 = (110 + 70 * Math.sin(k * Math.PI)) * zoom; c.strokeStyle = 'rgba(200,200,205,' + (1 - k * .6) + ')'; c.lineWidth = 4 * zoom; c.beginPath(); c.moveTo(sx + Math.cos(a) * r0, sy - 80 * zoom + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * r1, sy - 80 * zoom + Math.sin(a) * r1); c.stroke(); }
        else { const rad = (wk === 'cuchillo' ? 70 : wk === 'bate' ? 105 : 95) * zoom; c.strokeStyle = 'rgba(255,255,255,' + (.75 * (1 - k)) + ')'; c.lineWidth = (wk === 'bate' ? 8 : 5) * zoom; c.beginPath(); c.arc(sx, sy - 80 * zoom, rad, a - 1.1 + k * .6, a + .2 + k * .9); c.stroke(); } }
      if (!mine) { c.font = Math.round(12 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; const nm = nick + (fac !== me.faction ? ' ✕' : ''); const w = c.measureText(nm).width + 10; const ny = sy - 27 * S - 6; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sx - w / 2, ny - 12, w, 15); c.fillStyle = fac === 'ork' ? '#ff7a70' : '#eeeeee'; c.fillText(nm, sx, ny); }
      if (o.sayT > 0 && o.say) bubble(sx, sy - 27 * S - (mine ? 6 : 24), o.say); }
    function drawMob(o) { const T = o.T; const [sx, sy] = W2S(o.x, o.y); if (sx < -300 || sx > VW + 300 || sy < -50 || sy > VH + 400) return;
      let vis = o.vis; if (T.ai === 'blink' && INV.eq.brazo === 'b_resonancia') vis = Math.max(vis, .55);
      if (vis < .03) return;
      const fast = o.st === 'run' ? 20 : o.chasing ? 9 : 5, frame = o.moving ? (Math.floor(o.t * fast) % 2 ? 1 : 2) : 0;
      const art = PIX[T.art](frame, o.hurt > 0), S = PXS * zoom, W = T.pw * S, H = T.ph * S;
      let lx = 0, jx = 0; if (o.lunge > 0) lx = o.face * 26 * o.lunge * zoom; if (o.wind > 0 || o.st === 'aim') jx = Math.sin(t * 60) * 2 * zoom;
      shadow(sx, sy, Math.max(22, T.pw * 1.6));
      c.save(); c.translate(Math.round(sx + lx + jx), Math.round(sy)); if (o.face < 0) c.scale(-1, 1);
      c.globalAlpha = o.alpha * vis * (T.ai === 'blink' ? (.75 + Math.sin(t * 12 + o.x) * .2) : 1); c.imageSmoothingEnabled = false;
      c.filter = 'drop-shadow(0 0 ' + Math.max(2, 3 * zoom).toFixed(1) + 'px rgba(230,225,215,.75))'; c.drawImage(art, Math.round(-W / 2), Math.round(-H), Math.round(W), Math.round(H)); c.filter = 'none';
      if (o.wind > 0 || o.st === 'aim') { c.globalAlpha = .25 + Math.sin(t * 40) * .15; c.globalCompositeOperation = 'lighter'; c.drawImage(art, Math.round(-W / 2), Math.round(-H), Math.round(W), Math.round(H)); c.globalCompositeOperation = 'source-over'; }
      c.restore(); c.globalAlpha = 1; c.imageSmoothingEnabled = true;
      if (o.hp < T.hp && vis > .5) { const bw = 48 * zoom, by = sy - H - 14; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(sx - bw / 2, by, bw, 5); c.fillStyle = '#d8d6d0'; c.fillRect(sx - bw / 2, by, bw * Math.max(0, o.hp / T.hp), 5); }
      if (o.wind > 0 || o.st === 'aim') { c.fillStyle = 'rgba(255,90,70,.95)'; c.font = 'bold ' + Math.round(22 * Math.max(.8, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillText(o.st === 'aim' ? '!!' : '!', sx, sy - H - 22); }
      if (T.ai === 'slam' && o.wind > 0) { const k = 1 - o.wind / T.wind; c.strokeStyle = 'rgba(255,90,70,' + (.25 + k * .5) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx, sy, T.aoe * zoom * k, T.aoe * .35 * zoom * k, 0, 0, 7); c.stroke(); } }
    function drawPickup(q) { const [sx, sy] = W2S(q.x, q.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return; const b = Math.sin(q.t * 3) * 4 * zoom, S = 4.2 * zoom;
      const gl = c.createRadialGradient(sx, sy - 20 * zoom, 0, sx, sy - 20 * zoom, 46 * zoom); gl.addColorStop(0, 'rgba(255,240,200,' + (.25 + Math.sin(q.t * 4) * .1) + ')'); gl.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gl; c.fillRect(sx - 50 * zoom, sy - 70 * zoom, 100 * zoom, 100 * zoom);
      shadow(sx, sy, 14); c.imageSmoothingEnabled = false; c.drawImage(PIX.icon(q.k), Math.round(sx - 6 * S), Math.round(sy - 14 * S + b), Math.round(12 * S), Math.round(12 * S)); c.imageSmoothingEnabled = true;
      if ((q.t % 2.4) < .25) { c.fillStyle = 'rgba(255,255,255,.9)'; const k = (q.t % 2.4) / .25; c.fillRect(sx + 10 * zoom - 1, sy - 30 * zoom - 6 * k, 2, 12 * k); c.fillRect(sx + 10 * zoom - 6 * k, sy - 30 * zoom - 1, 12 * k, 2); } }
    function bubble(x, y, text) { c.font = '13px TechMono, monospace'; c.textAlign = 'center'; const words = text.split(' '); const lines = []; let ln = '';
      words.forEach(w => { if (c.measureText(ln + ' ' + w).width > 170 && ln) { lines.push(ln); ln = w; } else ln = ln ? ln + ' ' + w : w; }); lines.push(ln);
      const w = Math.max(...lines.map(l => c.measureText(l).width)) + 16, h = lines.length * 16 + 10; c.fillStyle = 'rgba(240,238,232,.94)'; c.fillRect(x - w / 2, y - h, w, h); c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.lineTo(x, y + 6); c.fill();
      c.fillStyle = '#111'; lines.forEach((l, i) => c.fillText(l, x, y - h + 18 + i * 16)); }
    // balas
    shots.forEach(b => { const [x, y] = W2S(b.x, b.y); const [x2, y2] = W2S(b.x - b.vx * .03, b.y - b.vy * .03); c.strokeStyle = 'rgba(255,230,160,.9)'; c.lineWidth = 3 * zoom; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x, y); c.stroke(); });
    // partículas
    parts.forEach(p => { const [x, y] = W2S(p.x, p.y); const v = p.c || 30; c.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 2) + ',' + Math.min(1, p.life) * .85 + ')'; c.fillRect(x, y, p.s * zoom, p.s * zoom); });
    // oscuridad
    const dw = dark.width, dh = dark.height; dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, dw, dh); dg.fillStyle = 'rgba(4,4,8,' + (MAP.dark || .5) + ')'; dg.fillRect(0, 0, dw, dh);
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { const gg = dg.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2); gg.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gg; dg.fillRect(x / 2 - r / 2, y / 2 - r / 2, r, r); };
    const [px_, py_] = W2S(P.x, P.y - 80); hole(px_, py_, (INV.eq.luz ? 860 : 520) * zoom, .95); if (MAP.fire) hole(fx, fy, 520 * zoom * fl, 1);
    others.forEach(o => { const [ox, oy] = W2S(o.x, o.y - 80); hole(ox, oy, 280 * zoom, .7); });
    c.drawImage(dark, 0, 0, VW, VH);
    // números flotantes
    floats.forEach(f => { const [x, y] = W2S(f.x, f.y); c.globalAlpha = Math.min(1, f.t * 2); c.font = 'bold ' + Math.round(15 * Math.max(.85, zoom)) + 'px TechMono, monospace'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(f.txt, x + 1, y + 1); c.fillStyle = f.c; c.fillText(f.txt, x, y); c.globalAlpha = 1; });
    // ceniza
    ash.forEach(a => { c.fillStyle = 'rgba(220,216,206,' + a.o + ')'; c.fillRect(a.x, a.y, a.s, a.s); });
    let g = c.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    if (P.hurtT > 0) { c.fillStyle = 'rgba(160,20,10,' + P.hurtT * .8 + ')'; c.fillRect(0, 0, VW, VH); }
    const lv = lvlOf(P.xp); if (!P.dead && P.hp < maxHp(lv) * .25) { c.fillStyle = 'rgba(120,10,5,' + (.12 + Math.sin(t * 5) * .08) + ')'; c.fillRect(0, 0, VW, VH); }
  }

  window.__cz = { get suero() { return suero; }, get P() { return P; }, get INV() { return INV; }, pickups, mobs, spawnMob, spawnPickup, get map() { return mapKey; }, warp: k => enterMap(k, 0, 0) };
  boot().catch(e => { $('#load-t').textContent = 'Error al cargar: ' + (e.message || e); });
})();
