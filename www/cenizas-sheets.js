/* CENIZAS · personajes en planillas PNG (1024×768: 4 poses × 3 direcciones, celdas de 256, pies en y=240).
   Columnas: 0 parado · 1 paso A · 2 paso B · 3 golpe.  Filas: 0 frente · 1 espalda · 2 costado izquierdo (derecha = espejo).
   Si una planilla todavía no cargó, el juego usa el dibujo pixel de siempre. */
(function () {
  'use strict';
  const CELL = 256, ROW = { d: 0, u: 1, l: 2, r: 2 };
  const imgs = {}, cuts = new Map(), tints = new Map();
  /* personajes de la historia (NPC y skins) → su planilla */
  const NPC_SHEET = { esteban: 'teby', pablo2: 'pablo_2', pablo3: 'pablo_3', polAlter: 'pol_alter', pablo: 'pablo_1', renzo: 'renzo', mary: 'mary_futuro', rosa: 'rosa', mercedes: 'mercedes', mercedesMala: 'mercedes', sam: 'sam', pol: 'pol_futuro', sofia: 'sofia_mala' };
  /* Oscuros → su planilla (los que no están acá siguen con el dibujo pixel) */
  const MOB_SHEET = { errante: 'oscuro_hombre', perro: 'sabueso', rastrero: 'gato', corredor: 'corredor_final', sombra: 'espectro', mole: 'mole', denso: 'le_cape', incinerario: 'corredor_incinerario' };
  const load = src => { if (!imgs[src]) { const i = new Image(); i.src = src; imgs[src] = i; } const i = imgs[src]; return i.complete && i.naturalWidth ? i : null; };
  function cut(src, dir, col, id) {
    const k = (id || src) + '|' + dir + col; if (cuts.has(k)) return cuts.get(k);
    const im = typeof src === 'string' ? load(src) : src; if (!im) return null;
    const cv = document.createElement('canvas'); cv.width = cv.height = CELL; const g = cv.getContext('2d');
    if (dir === 'r') { g.translate(CELL, 0); g.scale(-1, 1); }
    g.drawImage(im, col * CELL, ROW[dir] * CELL, CELL, CELL, 0, 0, CELL, CELL); cv.hd = true; cuts.set(k, cv); return cv;
  }
  /* un sobreviviente que ya no existe (se sacaron los modelos mal cortados) → vuelve al dibujo pixel */
  const sheet = (name, dir, frame, atk) => (/^sel\d/.test(name) && !SEL.includes(name)) ? null : cut('/a/pj/' + name + '.png', dir || 'd', atk ? 3 : (frame || 0));
  /* personaje base teñible: base_h / base_m. El PNG _reg guarda en R la parte (1 pelo · 2 piel · 3 ropa · 4 pantalón · 5 calzado; 0 = fija)
     y en G la luz relativa (128 = el tono medio), así se cambia el color sin perder sombras ni detalles. */
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  function tinted(base, colors) {
    const key = base + '|' + colors.join(','); if (tints.has(key)) return tints.get(key);
    const im = load('/a/pj/' + base + '.png'), rg = load('/a/pj/' + base + '_reg.png'); if (!im || !rg) return null;
    const W = im.naturalWidth, H = im.naturalHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.drawImage(im, 0, 0); const px = g.getImageData(0, 0, W, H);
    const t = document.createElement('canvas'); t.width = W; t.height = H; const tg = t.getContext('2d'); tg.drawImage(rg, 0, 0); const r = tg.getImageData(0, 0, W, H).data;
    const cols = colors.map(c => c ? hex(c) : null), d = px.data;
    for (let i = 0; i < d.length; i += 4) { const part = Math.round(r[i] / 40); if (!part || !cols[part - 1] || !r[i + 3]) continue;
      const L = r[i + 1] / 128, c = cols[part - 1]; d[i] = Math.min(255, c[0] * L); d[i + 1] = Math.min(255, c[1] * L); d[i + 2] = Math.min(255, c[2] * L); }
    g.putImageData(px, 0, 0); cv.key = key; tints.set(key, cv); return cv;
  }
  const MODELS = { h: ['base_h1', 'base_h2'], m: ['base_m1', 'base_m2'] };
  const base = (fem, model, colors, dir, frame, atk) => { const l = MODELS[fem ? 'm' : 'h'], s = tinted(l[model] || l[0], colors); return s ? cut(s, dir || 'd', atk ? 3 : (frame || 0), s.key) : null; };
  /* dibuja una celda HD con los pies en (x, y); h = alto que debe ocupar el personaje en pantalla */
  function blit(ctx, cv, x, y, h) { const k = h / 220, s = CELL * k; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, Math.round(x - 128 * k), Math.round(y - 240 * k), Math.round(s), Math.round(s)); }
  /* precarga lo que se usa siempre */
  ['base_h1', 'base_h2', 'base_m1', 'base_m2'].flatMap(b => [b, b + '_reg']).concat(Object.values(NPC_SHEET), Object.values(MOB_SHEET)).forEach(n => load('/a/pj/' + n + '.png'));
  const SEL = ["sel01", "sel02", "sel03", "sel04", "sel05", "sel07", "sel08", "sel09", "sel11", "sel12", "sel13", "sel14", "sel15", "sel16", "sel17", "sel18", "sel20", "sel21", "sel22", "sel23", "sel24", "sel25", "sel26", "sel27", "sel29", "sel31", "sel34", "sel35"];
  const ALL = ["agente_patrulla_ork", "ani", "anita", "anixa", "arshi", "azu", "bong", "carolina", "cin", "civil_anciano", "civil_hombre", "civil_m", "civil_mujer", "civil_nene", "civil_trabajador", "claudia", "corredor_final", "corredor_incinerario", "cyn", "dario", "ding", "doctor_ork", "el_sabio", "espectro", "ex01", "ex02", "ex03", "ex04", "ex05", "ex06", "ex07", "ex08", "ex09", "ex10", "ex11", "ex12", "ex13", "ex14", "ex15", "ex16", "ex17", "ex18", "ex19", "ex20", "ex21", "ex22", "ex23", "ex24", "ex25", "ex26", "ex27", "ex28", "ex29", "ex30", "ex31", "ex32", "ex33", "ex34", "ex35", "ex36", "ex37", "ex38", "ex39", "ex40", "ex41", "eze", "gato", "giuliana", "gusty", "ignacio", "instructor_ork", "irene", "jaqui", "jem", "joaco", "jota", "jota_viejo", "julieta", "kamikaze", "laura", "le_cape", "lean", "leti", "lilia", "lucas", "lucas_hermano", "luis", "mariano", "mariela", "marta", "mary_futuro", "maxi", "mercedes", "mole", "natsume", "norbert", "oficial_ork", "oscuro_hombre", "oscuro_mujer", "pablo_1", "pablo_2", "pablo_3", "pol_alter", "pol_futuro", "raul", "renzo", "rocio", "romina", "rosa", "ruben", "sabueso", "sam", "sasha", "sel01", "sel02", "sel03", "sel04", "sel05", "sel07", "sel08", "sel09", "sel11", "sel12", "sel13", "sel14", "sel15", "sel16", "sel17", "sel18", "sel20", "sel21", "sel22", "sel23", "sel24", "sel25", "sel26", "sel27", "sel29", "sel31", "sel34", "sel35", "sofia_buena", "sofia_mala", "teby", "tecnico_ork", "tincho", "toby", "tomy", "vanesa", "viajero", "yuki"];
  window.CZ_SHEETS = { SEL, CELL, MODELS, ALL, NPC_SHEET, MOB_SHEET, sheet, base, blit, load };
})();
