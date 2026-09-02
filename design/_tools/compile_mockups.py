# -*- coding: utf-8 -*-
"""Kompilasi template mockup -> file HTML final yang mandiri (gambar disisipkan base64).
Jalankan:  python3 design/_tools/compile_mockups.py
"""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))   # akar repositori
DESIGN = os.path.join(ROOT, 'design')

def P(rel):
    return os.path.join(ROOT, rel)

def b64(path):
    with open(path, 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()

CARD = {k: P(f'design/_tools/_img/{k}_card.jpg') for k in ('c1','c2','c3','c4','c5','c7')}
THUMB = {k: P(f'design/_tools/_img/{k}_thumb.jpg') for k in ('c1','c2','c3','c4','c5','c7')}

TOKENS = {
    '@@AM@@':  b64(P('design/img/c1.jpg')),       # detail utama (760x950)
    '@@A1@@':  b64(CARD['c1']),  '@@A2@@': b64(CARD['c2']),
    '@@A3@@':  b64(CARD['c3']),  '@@A4@@': b64(CARD['c4']),
    '@@A5@@':  b64(CARD['c5']),  '@@A6@@': b64(CARD['c7']),
    '@@AT1@@': b64(THUMB['c1']), '@@AT2@@': b64(THUMB['c2']),
    '@@AT3@@': b64(THUMB['c3']), '@@AT4@@': b64(THUMB['c4']),
    '@@AT5@@': b64(THUMB['c5']), '@@AT6@@': b64(THUMB['c7']),
}

def compile_one(tpl_name, out_name):
    tpl = os.path.join(HERE, tpl_name)
    with open(tpl, encoding='utf-8') as f:
        html = f.read()
    missing = set(re.findall(r'@@\w+@@', html))
    for tok in list(missing):
        if tok in TOKENS:
            html = html.replace(tok, TOKENS[tok])
            missing.discard(tok)
    if missing:
        raise SystemExit(f'{tpl_name}: token belum dipetakan -> {missing}')
    out = os.path.join(DESIGN, out_name)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    kb = os.path.getsize(out) // 1024
    print(f'{out_name:28s} {kb:>6} KB')

if __name__ == '__main__':
    compile_one('tpl-beranda.html', 'mockup-beranda.html')
    compile_one('tpl-katalog.html', 'mockup-katalog.html')
    compile_one('tpl-detail.html',  'mockup-detail.html')
    compile_one('tpl-admin.html',   'mockup-admin.html')
    print('Selesai. Buka file di design/ untuk melihat pratinjau.')
