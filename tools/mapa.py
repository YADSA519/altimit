#!/usr/bin/env python3
"""THE O|F · herramienta de mapas.

Uso:
  python3 tools/mapa.py DIBUJO.png MASCARA.png ID [--salida www]

Hace tres cosas:
  1. Revisa la máscara contra el instructivo (6 colores, mismo tamaño,
     salidas pegadas al borde, todo conectado, punto azul).
  2. Guarda el dibujo como www/a/m/ID.jpg (1672x941) y una vista
     de control ID_control.png con la máscara encima del dibujo.
  3. Imprime el bloque para pegar en cenizas-maps.js (grilla, spawn, salidas).

Colores: blanco caminar · negro obstáculo · rojo salida · amarillo escalera
         verde refugio · azul aparición. Los grises/bordes suaves se
         redondean al color más cercano y se avisa cuántos había.
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

BASE_W, BASE_H, C = 1672, 941, 16          # tiene que coincidir con cenizas.js
GW, GH = -(-BASE_W // C), -(-BASE_H // C)
PAL = {'blanco': (255, 255, 255), 'negro': (0, 0, 0), 'rojo': (255, 0, 0),
       'amarillo': (255, 255, 0), 'verde': (0, 255, 0), 'azul': (0, 85, 255)}
NAMES = list(PAL)
PAL_A = np.array([PAL[n] for n in NAMES])


def clasificar(m):
    d = ((m[..., None, :].astype(int) - PAL_A[None, None]) ** 2).sum(-1)
    idx = d.argmin(-1)
    exactos = (d.min(-1) == 0)
    return idx, exactos


def rle(cells):
    out, prev, n = [], cells[0], 0
    for v in cells:
        if v == prev: n += 1
        else: out.append(f'{prev}{n}'); prev, n = v, 1
    out.append(f'{prev}{n}')
    return '.'.join(out)


def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(a) < 3: print(__doc__); sys.exit(1)
    dib_p, mas_p, mid = a[:3]
    outdir = sys.argv[sys.argv.index('--salida') + 1] if '--salida' in sys.argv else 'www'
    errores, avisos = [], []

    dib = Image.open(dib_p).convert('RGB'); mas = Image.open(mas_p).convert('RGB')
    if dib.size != mas.size: errores.append(f'Tamaños distintos: dibujo {dib.size} vs máscara {mas.size}')
    r = dib.size[0] / dib.size[1]
    if abs(r - 16 / 9) > .02: avisos.append(f'No es 16:9 (proporción {r:.2f})')
    mas = mas.resize(dib.size, Image.NEAREST)

    m = np.array(mas)
    idx, exactos = clasificar(m)
    raros = (~exactos).sum()
    if raros: avisos.append(f'{raros} píxeles fuera de los 6 colores ({100*raros/idx.size:.1f}%), redondeados al más cercano')
    H, W = idx.shape
    I = {n: i for i, n in enumerate(NAMES)}
    caminable = np.isin(idx, [I['blanco'], I['rojo'], I['amarillo'], I['verde'], I['azul']])

    # spawn
    az = idx == I['azul']
    if not az.any(): errores.append('Falta el punto azul de aparición'); spawn = None
    else:
        ys, xs = np.where(az); spawn = [int(xs.mean() * BASE_W / W), int(ys.mean() * BASE_H / H)]

    # salidas
    lab, n = ndimage.label(idx == I['rojo'])
    salidas = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < 30: continue
        lado = 'l' if xs.min() == 0 else 'r' if xs.max() == W - 1 else 'u' if ys.min() == 0 else 'd' if ys.max() == H - 1 else None
        rect = [int(xs.min() * BASE_W / W), int(ys.min() * BASE_H / H), int((xs.max() + 1) * BASE_W / W), int((ys.max() + 1) * BASE_H / H)]
        if not lado: errores.append(f'Salida roja que no toca el borde en {rect}')
        salidas.append({'r': rect, 'side': lado})
    if not salidas: avisos.append('No hay salidas rojas')

    # conexión
    lab2, n2 = ndimage.label(caminable)
    if spawn:
        ys, xs = np.where(az); sid = lab2[ys[0], xs[0]]
        for s in salidas:
            x0, y0, x1, y1 = [int(v * W / BASE_W) if k % 2 == 0 else int(v * H / BASE_H) for k, v in enumerate(s['r'])]
            if not (lab2[y0:y1, x0:x1] == sid).any(): errores.append(f'La salida {s["r"]} no está conectada al punto azul')
        sueltas = [k for k in range(1, n2 + 1) if k != sid and (lab2 == k).sum() > W * H * .002]
        if sueltas: avisos.append(f'{len(sueltas)} zonas caminables sueltas, no se llega desde el punto azul')

    lab3, n3 = ndimage.label(idx == I['verde'])
    if n3 > 3: avisos.append(f'{n3} manchas verdes: el verde es REFUGIO (no entran Oscuros). Canteros y árboles van en negro')

    # grilla para el juego: 0 pared, 1 caminar, 2 refugio
    small = np.zeros((GH, GW), dtype=np.uint8)
    for j in range(GH):
        for i in range(GW):
            x0, x1 = int(i * C * W / BASE_W), max(int(i * C * W / BASE_W) + 1, int(min(BASE_W, (i + 1) * C) * W / BASE_W))
            y0, y1 = int(j * C * H / BASE_H), max(int(j * C * H / BASE_H) + 1, int(min(BASE_H, (j + 1) * C) * H / BASE_H))
            blk = caminable[y0:y1, x0:x1]
            if blk.size and blk.mean() >= .5:
                small[j, i] = 2 if (idx[y0:y1, x0:x1] == I['verde']).mean() >= .5 else 1

    os.makedirs(os.path.join(outdir, 'a', 'm'), exist_ok=True)
    dib.resize((BASE_W, BASE_H), Image.LANCZOS).save(os.path.join(outdir, 'a', 'm', mid + '.jpg'), quality=88)
    ctrl = Image.blend(dib, Image.fromarray(PAL_A[idx].astype(np.uint8)), .45).resize((BASE_W, BASE_H))
    ctrl.save(mid + '_control.png')

    print('=== ' + mid)
    for e in errores: print('ERROR  ', e)
    for w in avisos: print('AVISO  ', w)
    print('OK' if not errores else f'{len(errores)} errores')
    print(f'\n  {mid}: {{ name: \'{mid.upper()}\', img: \'/a/m/{mid}.jpg\', dark: .38, spawn: {json.dumps(spawn)},')
    print(f'    cells: \'{rle(small.flatten().tolist())}\',')
    print('    exits: [' + ', '.join(f"{{ r: {json.dumps(s['r'])}, side: '{s['side']}', to: '?', at: [0, 0], label: '?' }}" for s in salidas) + '],')
    print('    mobs: {} },')
    sys.exit(1 if errores else 0)


if __name__ == '__main__':
    main()
