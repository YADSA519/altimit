/* CENIZAS · personajes de la historia en el mismo pixel que los avatares (16×24 + contorno) */
(function () {
  'use strict';
  const cache = new Map();
  const sh = (hex, f) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join(''); };
  const C = {
    pablo: { name: 'Pablo', skin: '#c9ab92', hair: '#141312', style: 'messy', beard: '#1e1a18', top: '#2a2a2c', type: 'hoodie', pants: '#2c2c2e', boots: '#d8d4cc', strap: '#6b4a30', bag: 'hip' },
    renzo: { name: 'Renzo', skin: '#e3d0bc', hair: '#b4471f', style: 'spiky', top: '#26304a', type: 'track', pants: '#232325', boots: '#d8d4cc', bag: 'back' },
    mary: { name: 'Mary', skin: '#b98a68', hair: '#6a3a1e', style: 'curly', top: '#d9d0bc', type: 'shirt', blood: true, pants: '#4a4e3a', boots: '#5a3a24', fem: true },
    rosa: { name: 'Rosa', skin: '#c9a48a', hair: '#9a3a1e', style: 'hood', top: '#2e2620', type: 'cloak', pants: '#2a2420', boots: '#3a2a20', staff: true, fem: true, old: true },
    mercedes: { name: 'Mercedes', skin: '#d6c0aa', hair: '#121214', style: 'short', top: '#e2ded4', type: 'coat', pants: '#1c1c1e', boots: '#202020', patch: true, fem: true },
    mercedesMala: { name: 'Mercedes (jefa)', skin: '#bfb4aa', hair: '#121214', style: 'short', top: '#d6d0c6', type: 'coat', pants: '#1c1c1e', boots: '#202020', patch: true, fem: true, stains: true, evil: true },
    sam: { name: 'Sam', skin: '#c9a080', hair: '#121212', style: 'afro', beard: '#2a1e18', top: '#26304a', type: 'track', pants: '#232325', boots: '#d8d4cc', bag: 'back' },
    pol: { name: 'Pol', skin: '#b98a68', hair: '#4a2c1a', style: 'curly-short', beard: '#3a2418', top: '#2a2826', type: 'vest', pants: '#3a2c22', boots: '#2a2018', tattoo: true, earring: true },
    sofia: { name: 'Sofía', skin: '#d9b8a0', hair: '#121214', style: 'long', top: '#1e1e22', type: 'jacket', pants: '#1a1a1c', boots: '#2a2a2a', emblem: true, fem: true }
  };
  function draw(k, dir, frame) {
    const sp = C[k]; const mirror = dir === 'r'; const d = mirror ? 'l' : dir; const key = k + d + frame + (mirror ? 'm' : '');
    if (cache.has(key)) return cache.get(key);
    const base = document.createElement('canvas'); base.width = 16; base.height = 24; const g = base.getContext('2d');
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const S = sp.skin, H = sp.hair, T = sp.top, T2 = sh(T, .75), T3 = sh(T, 1.25), fem = sp.fem, tx0 = fem ? 5 : 4, tw = fem ? 6 : 8;
    // piernas
    if (d === 'l') { const a = frame === 1 ? [4, 9] : frame === 2 ? [9, 4] : [6, 7];
      px(a[1], 16, 3, 5, sh(sp.pants, .8)); px(a[1], 21, 3, 2, sp.boots); px(a[0], 16, 3, 5, sp.pants); px(a[0] - (frame ? 1 : 0), 21, 4, 2, sp.boots); }
    else { const lu = frame === 1 ? 1 : 0, ru = frame === 2 ? 1 : 0; px(5, 16, 3, 5 - lu, sp.pants); px(5, 21 - lu, 3, 2, sp.boots); px(8, 16, 3, 5 - ru, sp.pants); px(8, 21 - ru, 3, 2, sp.boots); }
    // torso
    if (sp.type === 'cloak') { if (d === 'l') { px(4, 8, 8, 13, T); px(4, 8, 2, 13, T3); px(4, 21, 1, 1, T); px(7, 21, 1, 1, T); px(10, 21, 2, 1, T); }
      else { px(3, 8, 10, 13, T); px(3, 8, 1, 13, T3); px(12, 9, 1, 12, T2); [3, 5, 8, 11].forEach(x => px(x, 21, 1, 1, T)); if (d === 'd') { px(7, 9, 2, 3, sh(T, .6)); px(7, 10, 1, 1, '#b08a3a'); } } }
    else if (d === 'l') { px(5, 9, 6, 7, T); px(5, 9, 2, 7, T3); px(10, 9, 1, 7, T2); }
    else { px(tx0, 9, tw, 7, T); px(tx0 + tw - 1, 9, 1, 7, T2); }
    if (d === 'd' && sp.type !== 'cloak') {
      if (sp.type === 'hoodie') { px(7, 10, 2, 6, T3); px(5, 8, 6, 1, T2); }
      if (sp.type === 'track') { px(tx0, 11, tw, 1, '#c8ccd2'); px(7, 9, 2, 7, '#141414'); }
      if (sp.type === 'shirt' && sp.blood) { px(6, 11, 1, 1, '#7a1c14'); px(9, 12, 1, 2, '#7a1c14'); px(8, 14, 1, 1, '#7a1c14'); }
      if (sp.type === 'coat') { px(7, 9, 2, 6, '#1a1a1a'); px(tx0, 16, tw, 3, T); px(tx0 + tw - 1, 16, 1, 3, T2); }
      if (sp.type === 'vest') { px(7, 9, 2, 7, '#141414'); }
      if (sp.type === 'jacket') { px(7, 9, 2, 7, '#0a0a0c'); px(tx0, 15, tw, 1, '#2a2a30'); }
      if (sp.patch) px(tx0 + tw - 2, 10, 1, 2, '#c9302a');
      if (sp.stains) { px(5, 12, 1, 2, '#6a2a6a'); px(6, 13, 1, 1, '#8a1c3a'); px(10, 11, 1, 1, '#6a2a6a'); px(9, 15, 2, 1, '#7a2050'); px(5, 17, 1, 2, '#6a2a6a'); px(10, 17, 1, 1, '#8a1c3a'); }
    }
    if (d === 'u') { if (sp.emblem) { px(7, 11, 2, 2, '#8a7a6a'); px(6, 12, 1, 1, '#8a7a6a'); px(9, 12, 1, 1, '#8a7a6a'); } if (sp.type === 'coat') px(tx0, 16, tw, 3, T); if (sp.bag === 'back') { px(5, 10, 6, 5, '#6b4a30'); px(5, 10, 6, 1, '#8a6a48'); } }
    if (d === 'l' && sp.type === 'coat') { px(5, 16, 6, 3, T); if (sp.stains) { px(6, 12, 1, 2, '#6a2a6a'); px(8, 17, 1, 1, '#8a1c3a'); } }
    if (d === 'u' && sp.stains) { px(6, 12, 2, 1, '#6a2a6a'); px(9, 14, 1, 2, '#8a1c3a'); px(7, 17, 1, 1, '#6a2a6a'); }
    if (d === 'l' && sp.bag === 'back') { px(10, 10, 2, 5, '#6b4a30'); }
    if (sp.strap && d === 'd') { for (let i = 0; i < 6; i++) px(tx0 + 1 + i, 9 + i, 1, 1, sp.strap); if (sp.bag === 'hip') px(tx0 + tw - 2, 14, 3, 3, '#6b4a30'); }
    // brazos
    const armC = sp.type === 'vest' ? S : T;
    if (sp.type !== 'cloak') {
      if (d === 'l') { const ax = frame === 1 ? 5 : frame === 2 ? 9 : 7; px(ax, 10, 2, 5, armC); px(ax, 15, 2, 1, S); if (sp.tattoo) px(ax, 11, 1, 2, '#3a2a20'); }
      else { const sl = frame === 1 ? -1 : frame === 2 ? 1 : 0, lx = tx0 - 1, rx = tx0 + tw; px(lx, 10 + sl, 1, 5, armC); px(lx, 15 + sl, 1, 1, S); px(rx, 10 - sl, 1, 5, armC); px(rx, 15 - sl, 1, 1, S);
        if (sp.tattoo) { px(lx, 11 + sl, 1, 2, '#3a2a20'); px(rx, 12 - sl, 1, 1, '#3a2a20'); } if (sp.type === 'track') { px(lx, 12 + sl, 1, 1, '#c8ccd2'); px(rx, 12 - sl, 1, 1, '#c8ccd2'); } } }
    else if (d !== 'u') { px(d === 'l' ? 3 : 12, 15, 1, 1, S); }
    if (sp.staff) { const sx = d === 'l' ? 2 : 13; px(sx, 3, 1, 20, '#6b4a30'); px(sx - 0, 2, 1, 1, '#8a6a48'); px(sx - 1, 2, 3, 1, '#5a3a24'); }
    // cabeza
    px(7, 8, 2, 1, S); px(5, 2, 6, 6, S); px(5, 7, 6, 1, S);
    const EYE = sp.evil ? '#c040ff' : '#151515';
    if (d === 'd') { px(6, 5, 1, 1, EYE); px(9, 5, 1, 1, EYE); px(7, 7, 2, 1, sh(S, .82)); if (sp.old) { px(6, 6, 1, 1, sh(S, .8)); px(9, 6, 1, 1, sh(S, .8)); } }
    if (d === 'l') { px(6, 5, 1, 1, EYE); px(5, 6, 1, 1, sh(S, .82)); if (sp.earring) px(9, 6, 1, 1, '#c8c8c8'); }
    if (sp.beard && d !== 'u') { if (d === 'd') { px(5, 6, 1, 2, sp.beard); px(10, 6, 1, 2, sp.beard); px(6, 7, 4, 1, sp.beard); px(7, 6, 2, 1, sp.beard); } else { px(5, 6, 3, 2, sp.beard); } }
    // pelo
    const st = sp.style;
    if (st === 'messy') { px(4, 1, 8, 2, H); px(4, 0, 1, 1, H); px(6, 0, 2, 1, H); px(9, 0, 1, 1, H); px(11, 0, 1, 1, H); if (d === 'd') { px(3, 2, 2, 4, H); px(11, 2, 2, 4, H); px(6, 3, 1, 1, H); px(9, 3, 1, 1, H); } if (d === 'l') { px(8, 1, 4, 6, H); px(5, 3, 1, 1, H); } if (d === 'u') px(4, 1, 8, 8, H); }
    if (st === 'afro') { px(3, 0, 10, 3, H); px(2, 1, 1, 5, H); px(13, 1, 1, 5, H); if (d === 'd') { px(3, 3, 2, 3, H); px(11, 3, 2, 3, H); } if (d === 'l') px(8, 1, 5, 7, H); if (d === 'u') px(3, 1, 10, 8, H); }
    if (st === 'spiky') { px(4, 1, 8, 2, H); [4, 6, 8, 10].forEach(x => px(x, 0, 1, 1, H)); px(3, 1, 1, 1, H); px(12, 1, 1, 1, H); if (d === 'd') { px(4, 3, 1, 2, H); px(11, 3, 1, 2, H); px(7, 3, 2, 1, H); } if (d === 'l') { px(8, 1, 4, 5, H); px(12, 2, 1, 1, H); } if (d === 'u') px(4, 1, 8, 7, H); }
    if (st === 'curly') { px(3, 1, 10, 3, H); px(4, 0, 8, 1, H); if (d === 'd') { px(2, 3, 2, 10, H); px(12, 3, 2, 10, H); px(5, 3, 1, 1, H); px(10, 3, 1, 1, H); } if (d === 'l') { px(7, 1, 6, 12, H); px(4, 3, 1, 1, H); } if (d === 'u') px(2, 1, 12, 12, H); }
    if (st === 'curly-short') { px(4, 0, 8, 3, H); px(3, 1, 1, 3, H); px(12, 1, 1, 3, H); px(5, 0, 1, 1, sh(H, 1.3)); px(9, 0, 1, 1, sh(H, 1.3)); if (d === 'l') px(8, 1, 4, 5, H); if (d === 'u') px(3, 1, 10, 7, H); }
    if (st === 'short') { px(5, 1, 6, 2, H); px(4, 2, 1, 4, H); px(11, 2, 1, 4, H); if (d === 'd') px(6, 3, 3, 1, H); if (d === 'l') px(8, 1, 4, 5, H); if (d === 'u') px(4, 1, 8, 7, H); }
    if (st === 'long') { px(4, 1, 8, 2, H); if (d === 'd') { px(3, 2, 2, 11, H); px(11, 2, 2, 11, H); px(5, 3, 2, 2, H); } if (d === 'l') px(7, 1, 6, 12, H); if (d === 'u') px(3, 1, 10, 12, H); }
    if (st === 'pigtails') { px(5, 1, 6, 2, H); px(4, 2, 1, 3, H); px(11, 2, 1, 3, H); if (d === 'd') { px(2, 3, 2, 5, H); px(12, 3, 2, 5, H); px(6, 3, 4, 1, H); } if (d === 'l') { px(8, 1, 4, 4, H); px(11, 3, 2, 5, H); } if (d === 'u') { px(4, 1, 8, 7, H); px(2, 3, 2, 5, H); px(12, 3, 2, 5, H); } }
    if (st === 'hood') { const hc = T; px(4, 0, 8, 3, hc); px(3, 1, 1, 9, hc); px(12, 1, 1, 9, hc); if (d === 'd') { px(4, 2, 1, 7, hc); px(11, 2, 1, 7, hc); px(5, 3, 1, 5, H); px(10, 3, 1, 5, H); px(5, 2, 6, 1, sh(hc, .7)); } if (d === 'l') { px(7, 0, 6, 10, hc); px(6, 3, 1, 5, H); } if (d === 'u') px(3, 0, 10, 12, hc); }
    // contorno
    const out = document.createElement('canvas'); out.width = 18; out.height = 26; const o = out.getContext('2d'); const src = g.getImageData(0, 0, 16, 24).data; const od = o.createImageData(18, 26);
    const A = (x, y) => (x < 0 || y < 0 || x > 15 || y > 23) ? 0 : src[(y * 16 + x) * 4 + 3];
    for (let y = 0; y < 26; y++) for (let x = 0; x < 18; x++) { const sx = x - 1, sy = y - 1, i = (y * 18 + x) * 4;
      if (A(sx, sy)) { const j = (sy * 16 + sx) * 4; od.data[i] = src[j]; od.data[i + 1] = src[j + 1]; od.data[i + 2] = src[j + 2]; od.data[i + 3] = 255; }
      else if (A(sx - 1, sy) || A(sx + 1, sy) || A(sx, sy - 1) || A(sx, sy + 1)) { od.data[i] = 7; od.data[i + 1] = 7; od.data[i + 2] = 7; od.data[i + 3] = 235; } }
    o.putImageData(od, 0, 0);
    let res = out; if (mirror) { const m = document.createElement('canvas'); m.width = 18; m.height = 26; const mc = m.getContext('2d'); mc.translate(18, 0); mc.scale(-1, 1); mc.drawImage(out, 0, 0); res = m; }
    cache.set(key, res); return res;
  }
  window.CZ_NPC = { C, draw, SKINS: ['pablo', 'pol', 'renzo', 'sam'] };
})();
