/* CENIZAS · personajes en planillas PNG (1024×768: 4 poses × 3 direcciones, celdas de 256, pies en y=240).
   Columnas: 0 parado · 1 paso A · 2 paso B · 3 golpe.  Filas: 0 frente · 1 espalda · 2 costado izquierdo · 3 costado derecho (si la hoja mide 1024×1024; si no, la derecha es el espejo).
   Si una planilla todavía no cargó, el juego usa el dibujo pixel de siempre. */
(function () {
  'use strict';
  const CELL = 256, ROW = { d: 0, u: 1, l: 2, r: 2 };
  const imgs = {}, cuts = new Map(), tints = new Map();
  /* personajes de la historia (NPC y skins) → su planilla */
  const NPC_SHEET = { lucas_h: 'lucas_hermano', luna: 'gato_luna', chita: 'gato_chita', chino: 'gato_chino', bianca: 'gato_bianca', pablo4: 'pablo_4', pabloFuturo: 'pablo_futuro', sofia_mala2: 'sofia_mala2', esteban: 'teby', pablo2: 'pablo_2', pablo3: 'pablo_3', polAlter: 'pol_alter', pablo: 'pablo_1', renzo: 'renzo', mary: 'mary_futuro', rosa: 'rosa', mercedes: 'mercedes', mercedesMala: 'mercedes', sam: 'sam', pol: 'pol_futuro', sofia: 'sofia_mala' };
  /* Oscuros → su planilla (los que no están acá siguen con el dibujo pixel) */
  const MOB_SHEET = { errante: 'oscuro_hombre3', perro: 'sabueso', rastrero: 'gato', corredor: 'corredor_final', sombra: 'espectro', mole: 'mole', denso: 'le_cape', incinerario: 'corredor_incinerario' };
  const load = src => { if (!imgs[src]) { const i = new Image(); i.src = src; imgs[src] = i; } const i = imgs[src]; return i.complete && i.naturalWidth ? i : null; };
  /* hojas grandes (cuadros más anchos para que los poderes no se corten): w×h por cuadro, pies en fy, n cuadros por fila.
     fps = velocidad de la animación; once = se juega una vez y queda en el último cuadro; side = se ve de costado (mirando al objetivo) */
  const BIG = {
    corredor_sup: { w: 388, h: 289, fy: 274, n: 4 },
    corredor_run: { w: 388, h: 289, fy: 274, n: 4, fps: 12, side: 1 },
    corredor_smash: { w: 388, h: 289, fy: 274, n: 4, fps: 4, once: 1 },
    corredor_salto: { w: 388, h: 289, fy: 274, n: 6, fps: 6, once: 1 },
    corredor_zarpazo: { w: 388, h: 289, fy: 274, n: 4, fps: 11, once: 1, side: 1 },
    corredor_muerte: { w: 388, h: 289, fy: 274, n: 4, fps: 9 },
    /* Demonio del Palo: aura = brillo propio de la acción (violeta para que los poderes oscuros no se pierdan); dirs = la hoja trae una fila por dirección */
    demonio_base: { w: 326, h: 314, fy: 289, n: 4 },
    demonio_clones: { w: 326, h: 314, fy: 289, n: 4, fps: 5, once: 1, aura: '190,90,255' },
    demonio_especial_1: { w: 326, h: 314, fy: 289, n: 4, fps: 4, once: 1 },
    demonio_especial_2: { w: 326, h: 314, fy: 289, n: 4, fps: 4.5, once: 1, side: 1, aura: '190,90,255' },
    demonio_muerte: { w: 326, h: 314, fy: 289, n: 4, fps: 3.5, dirs: 1, hold: 14 },
    /* La Joker */
    joker_base: { w: 320, h: 320, fy: 300, n: 4 },
    joker_cartas: { w: 320, h: 320, fy: 300, n: 4, fps: 5, once: 1 },
    joker_cintas: { w: 320, h: 320, fy: 300, n: 4, fps: 6, once: 1, side: 1 },
    joker_muerte: { w: 320, h: 320, fy: 300, n: 4, fps: 3.5, dirs: 1, hold: 14 },
    /* Rocío (MVP) */
    rocio_base: { w: 524, h: 315, fy: 294, n: 4 },
    rocio_barrido: { w: 524, h: 315, fy: 294, n: 4, fps: 3.2, once: 1, side: 1 },
    rocio_tormenta: { w: 524, h: 315, fy: 294, n: 4, fps: 4, once: 1 },
    /* El Come Sueños */
    cs_base: { w: 326, h: 328, fy: 308, n: 4 },
    cs_rugido: { w: 326, h: 328, fy: 308, n: 4, fps: 2.6, once: 1, aura: '170,90,255' },
    cs_mordida: { w: 326, h: 328, fy: 308, n: 4, fps: 5, once: 1, side: 1, aura: '120,140,255' },
    cs_muerte: { w: 326, h: 328, fy: 308, n: 4, fps: 3.5, dirs: 1, hold: 14 }
  };
  const specOf = src => { const m = typeof src === 'string' && src.match(/\/([\w]+)\.png$/); return m ? BIG[m[1]] : null; };
  function cut(src, dir, col, id, row) {
    const k = (id || src) + '|' + dir + col + (row != null ? '#' + row : ''); if (cuts.has(k)) return cuts.get(k);
    const im = typeof src === 'string' ? load(src) : src; if (!im) return null;
    const sp = specOf(src), cw = sp ? sp.w : CELL, ch = sp ? sp.h : CELL;
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d');
    const own = dir === 'r' && (im.naturalHeight || im.height) >= ch * 4; /* hojas de 4 filas: la derecha viene dibujada */
    if (row == null && dir === 'r' && !own) { g.translate(cw, 0); g.scale(-1, 1); }
    const r = row != null ? row : (own ? 3 : ROW[dir]);
    g.drawImage(im, col * cw, r * ch, cw, ch, 0, 0, cw, ch); cv.hd = true; if (sp) cv.fy = sp.fy; cuts.set(k, cv); return cv;
  }
  /* un cuadro suelto por número (para animaciones en secuencia, como la muerte: se leen de izquierda a derecha y de arriba a abajo) */
  const frameAt = (name, i) => { const sp = BIG[name], n = sp ? sp.n : 4; return cut('/a/pj/' + name + '.png', 'd', i % n, null, Math.floor(i / n)); };
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
  function blit(ctx, cv, x, y, h) { const k = h / 220, w = cv.width * k, hh = cv.height * k; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, Math.round(x - w / 2), Math.round(y - (cv.fy || 240) * k), Math.round(w), Math.round(hh)); }
  /* precarga lo que se usa siempre */
  ['base_h1', 'base_h2', 'base_m1', 'base_m2'].flatMap(b => [b, b + '_reg']).concat(Object.values(NPC_SHEET), Object.values(MOB_SHEET)).forEach(n => load('/a/pj/' + n + '.png'));
  const SEL = ["sel01", "sel02", "sel03", "sel04", "sel05", "sel07", "sel08", "sel09", "sel11", "sel12", "sel13", "sel14", "sel15", "sel16", "sel17", "sel18", "sel20", "sel21", "sel22", "sel23", "sel24", "sel25", "sel26", "sel27", "sel29", "sel31", "sel34", "sel35"];
  const ALL = ["corredor_sup", "corredor_run", "corredor_smash", "corredor_pinchos", "sangre", "brea_a", "brea_a_charco", "brea_b", "brea_b_charco", "lich_inv", "joker", "joker_baile", "joker_oro", "joker_lazo", "baston", "baston_atk", "tiempo", "tiempo_atk", "tiempo_stop", "tiempo_stop2", "virtuoso", "virt_elec", "virt_voz", "virt_libro", "reina", "reina_nigro", "reina_rayo", "reina_sombra", "reina_hielo", "reina_fuego", "lich", "tinta", "segador", "caminante", "distorsion", "distorsion_atk", "gemela", "gemela_atk", "gemelo", "gemelo_atk", "mosca", "mosca_real", "muerte", "muerte_f2", "carbon_m", "carbon_h", "slave", "slave_rep", "slave_garra", "gordo", "gordo_atk", "flaco", "flaco_atk", "enano", "enano_atk", "rosa_mvp", "rosa_cuervos", "rosa_sombra", "rocio_mvp", "rocio_fuego", "natsume_mvp", "natsume_inv", "natsume_dash", "alba", "ricardo", "sofia_npc", "daniel", "gisella", "isa", "katy", "nata", "lucre", "lilia_f1", "lilia_f2", "lilia_f3", "mercedes_oscura", "lumen_anciana", "lumen_anciano", "lumen_samurai_urbano", "lumen_katana", "lumen_explorador", "lumen_peregrino", "lumen_samurai", "lumen_viajero", "lumen_arquera", "lumen_peregrina", "gato_luna", "gato_chita", "gato_chino", "gato_bianca", "admin_saco", "fin_ork01", "fin_ork02", "fin_ork03", "fin_ork04", "fin_ork05", "fin_ork06", "fin_ork07", "fin_ork08", "fin_ork09", "fin_ork10", "fin_ork11", "fin_ork12", "fin_ork13", "fin_ork14", "fin_reb01", "fin_reb02", "fin_reb03", "fin_reb04", "fin_reb05", "fin_reb06", "fin_reb07", "fin_reb08", "fin_reb09", "fin_reb10", "fin_reb11", "fin_reb12", "fin_reb13", "fin_reb14", "fin_reb15", "fin_reb16", "agente_patrulla_ork", "ani", "anita", "anixa", "arshi", "azu", "bong", "carolina", "cin", "civil_anciano", "civil_hombre", "civil_m", "civil_mujer", "civil_nene", "civil_trabajador", "claudia", "corredor_final", "corredor_incinerario", "cyn", "dario", "ding", "doctor_ork", "el_sabio", "espectro", "ex01", "ex02", "ex03", "ex04", "ex05", "ex06", "ex07", "ex08", "ex09", "ex10", "ex11", "ex12", "ex13", "ex14", "ex15", "ex16", "ex17", "ex18", "ex19", "ex20", "ex21", "ex22", "ex23", "ex24", "ex25", "ex26", "ex27", "ex28", "ex29", "ex30", "ex31", "ex32", "ex33", "ex34", "ex35", "ex36", "ex37", "ex38", "ex39", "ex40", "ex41", "eze", "gato", "giuliana", "gusty", "ignacio", "instructor_ork", "irene", "jaqui", "jem", "joaco", "jota", "jota_viejo", "julieta", "kamikaze", "laura", "le_cape", "lean", "leti", "lilia", "lucas", "lucas_hermano", "luis", "mariano", "mariela", "marta", "mary_futuro", "maxi", "mercedes", "mole", "natsume", "norbert", "oficial_ork", "oscuro_hombre", "oscuro_mujer", "pablo_1", "pablo_2", "pablo_3", "pablo_4", "pablo_futuro", "f_aventurera", "f_mecanica", "f_rubia", "f_urbana", "f_cientifica", "f_medica", "f_medica2", "f_hacker", "f_hacker2", "f_oficinista", "h_barbudo", "h_periodista", "h_rockero", "h_picaro", "h_explorador", "h_panuelo", "h_poncho", "h_soldado", "h_mercenario", "h_guerrero", "h_cientifico", "h_espia", "pol_alter", "pol_futuro", "raul", "renzo", "rocio", "romina", "rosa", "ruben", "sabueso", "sam", "sasha", "sel01", "sel02", "sel03", "sel04", "sel05", "sel07", "sel08", "sel09", "sel11", "sel12", "sel13", "sel14", "sel15", "sel16", "sel17", "sel18", "sel20", "sel21", "sel22", "sel23", "sel24", "sel25", "sel26", "sel27", "sel29", "sel31", "sel34", "sel35", "sofia_buena", "sofia_mala", "teby", "tecnico_ork", "tincho", "toby", "tomy", "vanesa", "viajero", "yuki"];
  /* ROSTER: personajes para elegir. cls = clase ORK fija (0 militar · 1 científico · 2 espía) → esos son solo de ORK.
     model = personaje base (sin teñir a mano). */
  /* PERSONAJES CUSTOM: 6 hombres y 6 mujeres a los que se les cambia el color de piel, pelo, ropa y pantalón */
  const CU = { h: [1, 2, 3, 4, 5, 6].map(i => 'cu_h' + i), m: [1, 2, 3, 4, 5, 6].map(i => 'cu_m' + i) };
  const CPAL = {
    piel: [['Clara', '#f2c9a4'], ['Trigueña', '#e0a878'], ['Morena', '#b9825a'], ['Oscura', '#8a5a3c'], ['Muy oscura', '#5e3c28'], ['Pálida', '#f6dccb']],
    pelo: [['Castaño', '#6b4128'], ['Negro', '#2a2523'], ['Castaño claro', '#9a6a42'], ['Rubio', '#d9b25a'], ['Colorado', '#b5482a'], ['Gris', '#8e8a86'], ['Blanco', '#e2ded8'], ['Azul', '#3a62c8'], ['Verde', '#3f9a52'], ['Rosa', '#d86aa0'], ['Violeta', '#7a4ac0']],
    ropa: [['Gris', '#5d5e58'], ['Negro', '#2b2c2e'], ['Blanco', '#d8d6d0'], ['Rojo', '#a8352e'], ['Azul', '#2f5aa0'], ['Verde', '#3f7a46'], ['Oliva', '#6a6a3c'], ['Bordó', '#6e2432'], ['Mostaza', '#c09a3a'], ['Celeste', '#6aa8d0'], ['Naranja', '#d0702e']],
    pant: [['Jean', '#6a7e98'], ['Jean oscuro', '#3a4a66'], ['Negro', '#2a2a2c'], ['Gris', '#6e6e6e'], ['Beige', '#b9a47e'], ['Verde militar', '#4f5a3a'], ['Marrón', '#6a4a32'], ['Bordó', '#5e2430']]
  };
  /* colores del custom en el orden de las partes del _reg: pelo, piel, ropa, pantalón, calzado */
  const cuColors = lk => [(CPAL.pelo[lk.ch || 0] || CPAL.pelo[0])[1], (CPAL.piel[lk.cs || 0] || CPAL.piel[0])[1], (CPAL.ropa[lk.ct || 0] || CPAL.ropa[0])[1], (CPAL.pant[lk.cp || 0] || CPAL.pant[0])[1], null];
  const custom = (lk, dir, frame, atk) => { const l = CU[lk.body === 1 ? 'm' : 'h'], s = tinted(l[(lk.cu || 1) - 1] || l[0], cuColors(lk)); return s ? cut(s, dir || 'd', atk ? 3 : (frame || 0), s.key) : null; };
  /* ROSTER: customs para todos + los de clase fija solo para ORK (0 militar · 1 científico · 2 espía) */
  const ROSTER = {
    m: [1, 2, 3, 4, 5, 6].map(i => ['', 'Custom ' + i, null, null, i]).concat([['f_cientifica', 'Científica', 1], ['f_medica', 'Médica', 1], ['f_medica2', 'Enfermera', 1], ['f_hacker', 'Hacker', 2], ['f_hacker2', 'Hacker de radio', 2], ['f_oficinista', 'Oficinista', 2]]),
    h: [1, 2, 3, 4, 5, 6].map(i => ['', 'Custom ' + i, null, null, i]).concat([['h_soldado', 'Soldado', 0], ['h_mercenario', 'Mercenario', 0], ['h_guerrero', 'Guerrero', 0], ['h_cientifico', 'Científico', 1], ['h_espia', 'Espía', 2]])
  };
  /* lista que ve cada uno. Si ya tenía un personaje que salió de la lista, se le deja como "Tu personaje" */
  const inRoster = (lk, ork) => lk.cu ? true : roster(lk.body === 1, ork).some(r => r.k && r.k === lk.pj);
  const roster = (fem, ork, lk) => { const l = ROSTER[fem ? 'm' : 'h'].filter(r => ork || r[2] == null).map(([k, nm, cls, model, cu]) => ({ k, nm, cls: cls == null ? null : cls, model: model == null ? null : model, cu: cu || null }));
    if (lk && (lk.body === 1) === fem && !lk.cu && (lk.pj || lk.model != null) && !l.some(r => r.k && r.k === lk.pj)) l.unshift({ keep: { pj: lk.pj, model: lk.model, skin: lk.skin, hair: lk.hair, hcol: lk.hcol, top: lk.top, acc: lk.acc, pant: lk.pant }, nm: 'Tu personaje', cls: null });
    return l; };
  const rosterIdx = (list, lk) => Math.max(0, list.findIndex(r => r.keep ? !lk.cu && (r.keep.pj ? r.keep.pj === lk.pj : lk.model === r.keep.model && !lk.pj) : r.cu ? lk.cu === r.cu : r.k === lk.pj));
  function pickPj(lk, r) {
    if (r.keep) { delete lk.cu; Object.entries(r.keep).forEach(([k, v]) => { if (v == null) delete lk[k]; else lk[k] = v; }); return lk; }
    if (r.cu) { lk.cu = r.cu; delete lk.pj; delete lk.model; ['cs', 'ch', 'ct', 'cp'].forEach(k => { if (lk[k] == null) lk[k] = 0; }); }
    else { lk.pj = r.k; delete lk.cu; delete lk.model; }
    if (r.cls != null) lk.cls = r.cls; ['skin', 'hair', 'hcol', 'top', 'acc', 'pant'].forEach(k => delete lk[k]); return lk; }
  window.CZ_SHEETS = { BIG, frameAt, ROSTER, roster, rosterIdx, pickPj, inRoster, CU, CPAL, custom, cuColors, SEL, CELL, MODELS, ALL, NPC_SHEET, MOB_SHEET, sheet, base, blit, load };
})();
