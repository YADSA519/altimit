/* CENIZAS · pixel art de Oscuros e items (se dibuja con código, sin imágenes) */
(function () {
  'use strict';
  const cache = {};
  function make(w, h, draw, key) {
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    draw((x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); });
    cache[key] = c; return c;
  }
  const pal = hurt => hurt ? { B: '#d8d4cc', H: '#f2efe8', D: '#a9a59d', E: '#000' } : { B: '#2b2b2c', H: '#3e3e40', D: '#1a1a1b', E: '#000' };

  /* Oscuro Errante: el original de la 0.1, tal cual */
  function errante(frame, hurt) {
    return make(18, 30, px => {
      const B = hurt ? '#d8d4cc' : '#2b2b2c', H = hurt ? '#f2efe8' : '#3e3e40', D = '#1a1a1b';
      px(6, 1, 6, 6, B); px(7, 0, 4, 1, B); px(7, 3, 1, 2, '#000'); px(10, 3, 1, 2, '#000'); px(7, 6, 4, 1, D);
      px(8, 7, 2, 1, B); px(5, 8, 8, 10, B); px(5, 8, 2, 10, H); px(4, 17, 1, 2, B); px(13, 16, 1, 3, B); px(6, 18, 1, 1, B); px(11, 18, 1, 2, B);
      const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(3, 9 + sw, 2, 11, B); px(3, 20 + sw, 1, 2, D); px(13, 9 - sw, 2, 11, B); px(14, 20 - sw, 1, 2, D);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(6, 18, 2, 10 - l, B); px(10, 18, 2, 10 - r, B); px(5, 28 - l, 3, 1, D); px(10, 28 - r, 3, 1, D);
    }, 'e' + frame + (hurt ? 'h' : ''));
  }
  /* Corredor: inclinado hacia adelante, brazos largos, estela de ceniza (mira a la derecha) */
  function corredor(frame, hurt) {
    return make(26, 24, px => { const { B, H, D, E } = pal(hurt);
      px(17, 5, 6, 5, B); px(18, 4, 4, 1, B); px(16, 4, 3, 1, D); px(21, 6, 1, 1, E); px(22, 8, 1, 1, D); px(20, 9, 3, 1, D);
      px(14, 8, 4, 3, B); px(10, 9, 6, 4, B); px(7, 11, 6, 4, B); px(10, 9, 5, 1, H); px(7, 11, 3, 1, H);
      px(6, 14, 5, 3, B);
      px(2, 10, 3, 1, '#4a4a4c'); px(0, 12, 3, 1, '#3a3a3c'); px(3, 14, 2, 1, '#4a4a4c'); px(1, 16, 2, 1, '#333');
      const a = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(15, 11 + a, 7, 1, B); px(22, 11 + a, 1, 3, D); px(23, 12 + a, 1, 2, D);
      px(13, 13 - a, 8, 1, B); px(21, 13 - a, 1, 3, D); px(22, 14 - a, 1, 2, D);
      if (frame === 0) { px(6, 17, 2, 6, B); px(9, 17, 2, 6, B); px(5, 23, 3, 1, D); px(9, 23, 3, 1, D); }
      if (frame === 1) { px(9, 17, 2, 3, B); px(11, 19, 2, 4, B); px(11, 23, 3, 1, D); px(5, 17, 2, 3, B); px(3, 19, 2, 3, B); px(1, 21, 3, 1, D); }
      if (frame === 2) { px(8, 17, 2, 6, B); px(8, 23, 3, 1, D); px(5, 17, 2, 2, B); px(3, 18, 2, 3, B); px(1, 20, 3, 1, D); }
    }, 'c' + frame + (hurt ? 'h' : ''));
  }
  /* Perro Oscuro: cuadrúpedo, mandíbula abierta (mira a la derecha) */
  function perro(frame, hurt) {
    return make(27, 17, px => { const { B, H, D, E } = pal(hurt);
      px(6, 5, 13, 5, B); px(6, 5, 13, 1, H); px(9, 7, 1, 2, D); px(11, 7, 1, 2, D); px(13, 7, 1, 2, D);
      px(18, 3, 4, 5, B); px(21, 4, 4, 3, B); px(19, 1, 1, 2, B); px(21, 1, 1, 2, B); px(21, 4, 1, 1, E);
      px(22, 7, 3, 1, D); px(23, 6, 2, 1, '#8a8780'); px(25, 5, 1, 1, B);
      const tw = frame === 1 ? -1 : 0; px(2, 3 + tw, 4, 1, B); px(1, 2 + tw, 1, 1, B); px(4, 4, 2, 1, B);
      if (frame === 0) { px(7, 10, 2, 5, B); px(10, 10, 2, 5, B); px(15, 10, 2, 5, B); px(18, 10, 2, 5, B); }
      if (frame === 1) { px(5, 10, 2, 3, B); px(4, 13, 2, 2, B); px(10, 10, 2, 5, B); px(16, 10, 2, 3, B); px(18, 13, 2, 2, B); px(19, 10, 2, 4, B); }
      if (frame === 2) { px(8, 10, 2, 5, B); px(11, 10, 2, 3, B); px(12, 13, 2, 2, B); px(14, 10, 2, 5, B); px(20, 10, 2, 3, B); px(21, 13, 2, 2, B); }
      px(3, 15, 22, 1, 'rgba(0,0,0,0)');
    }, 'p' + frame + (hurt ? 'h' : ''));
  }
  /* Denso: ancho, hombros de ceniza, puños enormes (de frente) */
  function denso(frame, hurt) {
    return make(26, 34, px => { const { B, H, D, E } = pal(hurt);
      px(10, 3, 6, 5, B); px(11, 2, 4, 1, B); px(11, 5, 1, 1, E); px(14, 5, 1, 1, E); px(12, 7, 2, 1, D);
      px(4, 7, 18, 6, B); px(4, 7, 18, 1, H); px(5, 13, 1, 2, B); px(20, 13, 1, 3, B); px(8, 13, 1, 1, B);
      px(6, 13, 14, 9, B); px(6, 18, 14, 1, D); px(7, 13, 3, 5, H);
      const s = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(1, 9 + s, 4, 14, B); px(0, 22 + s, 6, 5, B); px(0, 26 + s, 6, 1, D); px(1, 9 + s, 1, 14, H);
      px(21, 9 - s, 4, 14, B); px(20, 22 - s, 6, 5, B); px(20, 26 - s, 6, 1, D);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(7, 22, 5, 10 - l, B); px(14, 22, 5, 10 - r, B); px(6, 32 - l, 7, 2, D); px(13, 32 - r, 7, 2, D);
    }, 'd' + frame + (hurt ? 'h' : ''));
  }
  /* Sombra: flaca, deshilachada, ojos que brillan (de frente) */
  function sombra(frame, hurt) {
    return make(16, 32, px => { const B = hurt ? '#d8d4cc' : '#121213', T = hurt ? '#bdb8ae' : '#1d1d1f', EY = hurt ? '#000' : '#ece8de';
      px(5, 1, 6, 6, B); px(6, 0, 4, 1, B); px(6, 3, 1, 1, EY); px(9, 3, 1, 1, EY);
      px(4, 7, 8, 14, B); px(7, 7, 2, 1, T);
      const a = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(2, 8 + a, 1, 15, B); px(1, 22 + a, 1, 2, T); px(13, 8 - a, 1, 15, B); px(14, 22 - a, 1, 2, T);
      px(3, 21, 10, 3, T);
      const st = [[3, 4 + a], [5, 6 - a], [7, 5], [9, 7 + a], [11, 4 - a]];
      st.forEach(([x, l]) => px(x, 24, 1, l, T));
    }, 's' + frame + (hurt ? 'h' : ''));
  }
  /* Rastrero: humano en cuatro patas, pegado al piso (mira a la derecha) */
  function rastrero(frame, hurt) {
    return make(25, 15, px => { const { B, H, D, E } = pal(hurt);
      px(17, 4, 5, 5, B); px(16, 3, 5, 1, D); px(15, 4, 2, 4, D); px(20, 6, 1, 1, E); px(21, 8, 1, 1, D);
      px(7, 5, 11, 4, B); px(7, 5, 11, 1, H); px(10, 9, 5, 1, B);
      if (frame === 0) { px(18, 9, 1, 4, B); px(18, 13, 2, 1, D); px(15, 9, 1, 4, B); px(15, 13, 2, 1, D); px(5, 7, 4, 2, B); px(3, 9, 2, 4, B); px(2, 13, 3, 1, D); px(7, 9, 1, 4, B); px(7, 13, 2, 1, D); }
      if (frame === 1) { px(19, 9, 3, 1, B); px(21, 10, 1, 3, B); px(21, 13, 2, 1, D); px(14, 9, 1, 4, B); px(14, 13, 2, 1, D); px(5, 7, 4, 2, B); px(2, 8, 3, 2, B); px(1, 10, 1, 3, B); px(0, 13, 2, 1, D); px(8, 9, 1, 4, B); px(8, 13, 2, 1, D); }
      if (frame === 2) { px(17, 9, 1, 4, B); px(17, 13, 2, 1, D); px(15, 9, 3, 1, B); px(12, 10, 1, 3, B); px(12, 13, 2, 1, D); px(5, 7, 4, 2, B); px(4, 9, 2, 4, B); px(4, 13, 3, 1, D); px(9, 9, 2, 1, B); px(10, 10, 1, 3, B); px(10, 13, 2, 1, D); }
    }, 'r' + frame + (hurt ? 'h' : ''));
  }


  /* Incinerario: Oscuro que arde por dentro (de frente) */
  function incinerario(frame, hurt) {
    return make(20, 30, px => { const { B, H, D } = pal(hurt); const F1 = hurt ? '#fff' : '#ff8a2a', F2 = hurt ? '#ffe' : '#ffd36a', F3 = '#c9302a';
      const fl = frame === 1 ? 1 : 0;
      px(8, 0 - fl, 4, 2, F3); px(7, 1, 6, 2, F1); px(8, 1, 4, 1, F2);
      px(6, 3, 8, 6, B); px(7, 5, 2, 1, F2); px(11, 5, 2, 1, F2); px(8, 7, 4, 1, F1);
      px(5, 9, 10, 10, B); px(5, 9, 2, 10, H); px(9, 10, 2, 7, F1); px(8, 12, 4, 2, F2); px(7, 15, 1, 2, F1); px(12, 11, 1, 3, F1);
      const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(3, 10 + sw, 2, 10, B); px(3, 19 + sw, 2, 2, F1); px(15, 10 - sw, 2, 10, B); px(15, 19 - sw, 2, 2, F1);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(6, 19, 3, 9 - l, B); px(11, 19, 3, 9 - r, B); px(5, 28 - l, 4, 2, D); px(11, 28 - r, 4, 2, D); px(7, 22, 1, 2, F3); px(12, 23, 1, 2, F3);
    }, 'n' + frame + (hurt ? 'h' : ''));
  }
  /* La Mole: enorme, cabeza chica, brazos como columnas (de frente) */
  function mole(frame, hurt) {
    return make(36, 40, px => { const { B, H, D, E } = pal(hurt);
      px(14, 4, 8, 6, B); px(15, 3, 6, 1, B); px(16, 6, 1, 1, '#c9302a'); px(19, 6, 1, 1, '#c9302a'); px(16, 8, 4, 1, D);
      px(5, 8, 26, 9, B); px(5, 8, 26, 2, H); px(7, 10, 3, 2, H); px(26, 10, 3, 2, H);
      px(8, 17, 20, 11, B); px(9, 17, 6, 6, H); px(8, 22, 20, 1, D); px(12, 25, 12, 1, D);
      const s = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(0, 10 + s, 6, 18, B); px(0, 27 + s, 8, 6, B); px(0, 32 + s, 8, 1, D); px(1, 10 + s, 1, 18, H);
      px(30, 10 - s, 6, 18, B); px(28, 27 - s, 8, 6, B); px(28, 32 - s, 8, 1, D);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(9, 28, 7, 10 - l, B); px(20, 28, 7, 10 - r, B); px(8, 38 - l, 9, 2, D); px(19, 38 - r, 9, 2, D);
    }, 'm' + frame + (hurt ? 'h' : ''));
  }
  /* Mercedes, el Oscuro Negro: negro puro, ojos rojos, corona de ceniza, garras largas (de frente) */
  function jefe(frame, hurt) {
    return make(24, 36, px => { const B = hurt ? '#d8d4cc' : '#050505', H = hurt ? '#fff' : '#161618', R = '#ff2a1a', C = hurt ? '#bbb' : '#2a2a2c';
      px(9, 0, 1, 3, C); px(11, 0, 1, 2, C); px(13, 0, 1, 3, C); px(15, 1, 1, 2, C); px(7, 1, 1, 2, C);
      px(8, 2, 8, 7, B); px(9, 5, 2, 1, R); px(13, 5, 2, 1, R); px(10, 7, 4, 1, H);
      px(6, 9, 12, 13, B); px(7, 9, 2, 12, H); px(11, 11, 2, 9, H);
      const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(3, 10 + sw, 3, 14, B); px(2, 24 + sw, 1, 4, C); px(4, 24 + sw, 1, 4, C); px(3, 24 + sw, 1, 5, C);
      px(18, 10 - sw, 3, 14, B); px(19, 24 - sw, 1, 5, C); px(21, 24 - sw, 1, 4, C); px(18, 24 - sw, 1, 4, C);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(8, 22, 3, 12 - l, B); px(13, 22, 3, 12 - r, B); px(7, 34 - l, 4, 2, H); px(13, 34 - r, 4, 2, H);
      px(5, 21, 1, 3, C); px(18, 20, 1, 4, C);
    }, 'j' + frame + (hurt ? 'h' : ''));
  }
  /* Sofía: pelo largo negro, cara pálida, abrigo oscuro, bufanda roja, cuchillos (de frente) */
  function sofia(frame, hurt) {
    return make(20, 34, px => { const HAIR = hurt ? '#ddd' : '#0e0e10', SK = hurt ? '#fff' : '#d9d2c8', COAT = hurt ? '#ccc' : '#1c1c20', CO2 = hurt ? '#eee' : '#2c2c32', RED = '#b8231c', KN = '#d8dce0';
      px(6, 1, 8, 3, HAIR); px(5, 3, 10, 9, HAIR); px(7, 4, 6, 6, SK); px(8, 6, 1, 1, '#000'); px(11, 6, 1, 1, '#000'); px(9, 8, 2, 1, '#8a6a6a');
      px(4, 10, 2, 10, HAIR); px(14, 10, 2, 10, HAIR);
      px(7, 10, 6, 2, RED); px(12, 11, 2, 5, RED);
      px(6, 12, 8, 12, COAT); px(6, 12, 2, 12, CO2); px(9, 13, 1, 10, '#0a0a0c');
      const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      px(4, 13 + sw, 2, 9, COAT); px(4, 22 + sw, 2, 1, SK); px(3, 23 + sw, 1, 4, KN);
      px(14, 13 - sw, 2, 9, COAT); px(14, 22 - sw, 2, 1, SK); px(16, 23 - sw, 1, 4, KN);
      px(5, 24, 10, 3, COAT);
      const l = frame === 1 ? 1 : 0, r = frame === 2 ? 1 : 0;
      px(7, 27, 2, 6 - l, '#141416'); px(11, 27, 2, 6 - r, '#141416'); px(6, 33 - l, 3, 1, '#000'); px(11, 33 - r, 3, 1, '#000');
    }, 'f' + frame + (hurt ? 'h' : ''));
  }
  /* ---------- items (12×12) ---------- */
  const ICON = {
    botiquin: px => { px(1, 3, 10, 8, '#d8d4cc'); px(1, 3, 10, 1, '#f2efe8'); px(4, 1, 4, 2, '#8a8780'); px(5, 5, 2, 5, '#c9302a'); px(3, 6, 6, 2, '#c9302a'); px(1, 10, 10, 1, '#8a8780'); },
    vendas: px => { px(2, 3, 8, 6, '#e8e4da'); px(2, 4, 8, 1, '#bdb8ae'); px(2, 6, 8, 1, '#bdb8ae'); px(4, 4, 4, 4, '#cfcac0'); px(5, 5, 2, 2, '#8a8780'); px(9, 7, 3, 2, '#e8e4da'); },
    pilas: px => { px(2, 2, 3, 9, '#5a5a5a'); px(3, 1, 1, 1, '#bdb8ae'); px(2, 2, 3, 2, '#d8a03a'); px(7, 2, 3, 9, '#5a5a5a'); px(8, 1, 1, 1, '#bdb8ae'); px(7, 2, 3, 2, '#d8a03a'); },
    linterna: px => { px(1, 5, 7, 3, '#4a4a4c'); px(1, 5, 7, 1, '#6a6a6c'); px(8, 4, 2, 5, '#8a8780'); px(10, 3, 2, 7, '#f4e7a8'); px(3, 6, 1, 1, '#c9302a'); },
    barra: px => { for (let i = 0; i < 9; i++) px(1 + i, 10 - i, 2, 2, i < 2 ? '#3a3a3a' : '#7a7d82'); px(9, 0, 2, 3, '#7a7d82'); px(11, 0, 1, 1, '#7a7d82'); },
    mascara: px => { px(3, 2, 6, 6, '#3a3a3c'); px(4, 3, 2, 2, '#9fb4b8'); px(7, 3, 2, 2, '#9fb4b8'); px(5, 7, 2, 3, '#2a2a2c'); px(1, 7, 3, 3, '#4a4a4c'); px(8, 7, 3, 3, '#4a4a4c'); px(2, 8, 1, 1, '#6a6a6c'); px(9, 8, 1, 1, '#6a6a6c'); },
    b_contencion: px => { px(2, 4, 8, 5, '#4a4a4c'); px(2, 4, 8, 1, '#7a7a7c'); px(3, 6, 6, 1, '#2a2a2c'); px(5, 5, 2, 3, '#c9302a'); px(1, 5, 1, 3, '#5a5a5a'); px(10, 5, 1, 3, '#5a5a5a'); },
    b_resonancia: px => { px(2, 4, 8, 5, '#4a4a4c'); px(2, 4, 8, 1, '#7a7a7c'); px(3, 6, 6, 1, '#2a2a2c'); px(5, 5, 2, 3, '#e8f4ff'); px(4, 6, 4, 1, '#bfe2ff'); px(1, 5, 1, 3, '#5a5a5a'); px(10, 5, 1, 3, '#5a5a5a'); },
    credencial: px => { px(1, 3, 10, 7, '#d8d4cc'); px(1, 3, 10, 2, '#c9302a'); px(2, 6, 3, 3, '#8a8780'); px(6, 6, 4, 1, '#5a5a5a'); px(6, 8, 3, 1, '#5a5a5a'); px(5, 1, 2, 2, '#5a5a5a'); },
    receptor: px => { px(2, 4, 7, 7, '#3a3a3c'); px(3, 5, 5, 2, '#9fb4b8'); px(3, 8, 1, 1, '#c9302a'); px(5, 8, 1, 1, '#8a8780'); px(7, 8, 1, 1, '#8a8780'); px(8, 0, 1, 4, '#8a8780'); px(8, 0, 2, 1, '#8a8780'); },
    ganzuas: px => { px(2, 8, 4, 3, '#6b5c4c'); px(5, 9, 6, 1, '#9a9a9a'); px(10, 8, 1, 1, '#9a9a9a'); px(5, 7, 6, 1, '#7a7a7a'); px(10, 6, 1, 1, '#7a7a7a'); px(3, 2, 2, 5, '#8a8a8a'); px(2, 2, 4, 1, '#8a8a8a'); },
    filtro: px => { px(4, 1, 4, 2, '#5a5a5a'); px(3, 3, 6, 8, '#7c9fa6'); px(3, 3, 6, 1, '#a9c6cc'); px(4, 6, 4, 4, '#5d8189'); px(3, 10, 6, 1, '#4a5f63'); },
    pagina: px => { px(2, 1, 8, 10, '#e8e4da'); px(8, 1, 2, 2, '#bdb8ae'); px(3, 3, 5, 1, '#5a5a5a'); px(3, 5, 6, 1, '#5a5a5a'); px(3, 7, 4, 1, '#5a5a5a'); px(3, 9, 5, 1, '#5a5a5a'); },
    fragmento: px => { px(5, 0, 2, 2, '#fff6e0'); px(4, 2, 4, 3, '#ffd79a'); px(3, 5, 6, 3, '#ff9b4a'); px(4, 8, 4, 2, '#d8662a'); px(5, 10, 2, 2, '#8a3a1a'); px(5, 3, 1, 4, '#ffffff'); },
    cuchillo: px => { px(1, 9, 3, 2, '#3a2a20'); px(2, 8, 2, 1, '#6b5c4c'); for (let i = 0; i < 6; i++) px(4 + i, 7 - i, 2, 2, i < 5 ? '#c9ccd0' : '#e8ecf0'); px(4, 8, 1, 2, '#8a8780'); },
    bate: px => { for (let i = 0; i < 10; i++) px(1 + i, 10 - i, i > 5 ? 3 : 2, i > 5 ? 3 : 2, i < 2 ? '#3a2a20' : '#9a7a52'); px(9, 0, 3, 2, '#b08a5c'); px(3, 7, 1, 1, '#5a4030'); },
    lanza: px => { for (let i = 0; i < 9; i++) px(1 + i, 11 - i, 1, 1, '#6b5c4c'); px(9, 2, 2, 2, '#c9ccd0'); px(10, 0, 2, 2, '#e8ecf0'); px(8, 3, 1, 1, '#c9302a'); },
    pistola: px => { px(2, 3, 9, 3, '#3a3a3c'); px(2, 3, 9, 1, '#5a5a5c'); px(10, 4, 2, 1, '#1a1a1a'); px(3, 6, 3, 5, '#2a2a2c'); px(6, 6, 2, 2, '#2a2a2c'); px(6, 7, 1, 1, '#5a5a5c'); }
,
    kitsune: px => { px(2, 1, 8, 9, '#ece8e0'); px(1, 0, 2, 3, '#ece8e0'); px(9, 0, 2, 3, '#ece8e0'); px(2, 1, 1, 1, '#c9302a'); px(9, 1, 1, 1, '#c9302a'); px(3, 4, 2, 1, '#c9302a'); px(7, 4, 2, 1, '#c9302a'); px(3, 5, 2, 1, '#111'); px(7, 5, 2, 1, '#111'); px(5, 7, 2, 1, '#c9302a'); px(4, 9, 4, 1, '#c9302a'); px(3, 10, 6, 1, '#b8b2a6'); },
    suero: px => { px(4, 1, 4, 2, '#3a3a3a'); px(5, 2, 2, 1, '#111'); px(1, 3, 10, 8, '#d8d4cc'); px(1, 3, 10, 1, '#f2efe8'); px(1, 10, 10, 1, '#8a8780'); px(5, 4, 2, 6, '#c9302a'); px(3, 6, 6, 2, '#c9302a'); px(1, 6, 1, 1, '#8a8780'); px(10, 6, 1, 1, '#8a8780'); },
    campera: px => { px(2, 2, 8, 9, '#5a4a3c'); px(1, 3, 2, 6, '#5a4a3c'); px(9, 3, 2, 6, '#5a4a3c'); px(5, 2, 2, 9, '#3a2e24'); px(3, 2, 2, 1, '#7a6a5a'); px(7, 2, 2, 1, '#7a6a5a'); px(2, 10, 8, 1, '#3a2e24'); },
    chaleco: px => { px(2, 2, 8, 9, '#3a3d40'); px(2, 2, 2, 2, '#1e2022'); px(8, 2, 2, 2, '#1e2022'); px(3, 5, 6, 4, '#4a4e52'); px(3, 6, 6, 1, '#2a2c2e'); px(3, 8, 6, 1, '#2a2c2e'); px(5, 4, 2, 1, '#c9302a'); },
    armadura: px => { px(2, 1, 8, 10, '#6a6d72'); px(1, 2, 2, 4, '#7a7d82'); px(9, 2, 2, 4, '#7a7d82'); px(3, 3, 6, 1, '#9a9da2'); px(3, 6, 6, 1, '#4a4d52'); px(3, 9, 6, 1, '#4a4d52'); px(4, 4, 1, 1, '#c9ccd0'); px(7, 4, 1, 1, '#c9ccd0'); }
,
    vendas: px => { px(2, 3, 8, 6, '#e8e4da'); px(2, 4, 8, 1, '#bdb8ae'); px(2, 6, 8, 1, '#bdb8ae'); px(4, 4, 4, 4, '#cfcac0'); px(5, 5, 2, 2, '#c9302a'); px(9, 7, 3, 2, '#e8e4da'); },
    moneda: px => { px(3, 1, 6, 10, '#c9a24a'); px(2, 2, 8, 8, '#c9a24a'); px(3, 2, 6, 1, '#f0d488'); px(2, 3, 1, 3, '#f0d488'); px(5, 3, 2, 6, '#8a6a20'); px(4, 4, 4, 1, '#8a6a20'); px(4, 7, 4, 1, '#8a6a20'); }
  };
  function icon(k) { return make(12, 12, ICON[k] || ICON.pagina, 'i' + k); }

  window.CZ_PIX = { errante, corredor, perro, denso, sombra, rastrero, incinerario, mole, jefe, sofia, icon };
})();
