# -*- coding: utf-8 -*-
"""Generator diagram ERD → docs/diagrams/erd.svg
Layout orthogonal manual (bukan template). Termasuk validasi geometri ringan.
Jalankan:  python3 design/_tools/gen_erd.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'docs', 'diagrams', 'erd.svg')

# ---------- palet merah bata & krem ----------
BG    = '#F7F0E2'
LIGHT = '#FDF8EC'
CREAM2= '#F4E9D5'
INK   = '#46291F'
MUTED = '#8A7A6A'
RED   = '#8F2318'
RED2  = '#B0462F'
LINE  = '#B97A5A'

# kolom: (nama, tag, tipe)
FIELDS = {
 'USERS': [('id','PK','BIGINT'),('nama','','VARCHAR(100)'),('email','UQ','VARCHAR(150)'),
           ('password_hash','','VARCHAR(255)'),
           ('last_login_at','','TIMESTAMP'),('created_at','','TIMESTAMP'),('updated_at','','TIMESTAMP')],
 'KATEGORI': [('id','PK','BIGINT'),('nama','UQ','VARCHAR(80)'),('slug','UQ','VARCHAR(90)'),
              ('deskripsi','','TEXT'),('urutan','','INT'),
              ('created_at','','TIMESTAMP'),('updated_at','','TIMESTAMP')],
 'AYAM': [('id','PK','BIGINT'),('slug','UQ','VARCHAR(120)'),('kode_ring','UQ','VARCHAR(30)'),
          ('nama','','VARCHAR(120)'),('kategori_id','FK kategori','BIGINT'),
          ('jenis_kelamin','','ENUM JANTAN/BETINA'),('tanggal_menetas','','DATE'),
          ('berat_kg','','DECIMAL(5,2)'),('warna_bulu','','VARCHAR(80)'),
          ('keunggulan','','TEXT'),('deskripsi','','TEXT'),
          ('harga','','DECIMAL(12,0)'),('status_jual','','ENUM TERSEDIA/DIPESAN/TERJUAL'),
          ('status_tampil','','ENUM DRAFT/PUBLIKASI'),('is_featured','','BOOL'),
          ('is_arsip','','BOOL'),('published_at','','TIMESTAMP'),
          ('created_at','','TIMESTAMP'),('updated_at','','TIMESTAMP')],
 'AYAM_IMAGES': [('id','PK','BIGINT'),('ayam_id','FK ayam','BIGINT'),('file_path','','VARCHAR(255)'),
                 ('file_path_thumb','','VARCHAR(255)'),('ukuran_kb','','INT'),('lebar_px','','INT'),
                 ('tinggi_px','','INT'),('alt_text','','VARCHAR(255)'),('is_primary','','BOOL'),
                 ('urutan','','INT'),('created_at','','TIMESTAMP')],
 'PERMINTAAN': [('id','PK','BIGINT'),('ayam_id','FK ayam','BIGINT'),('nama_pengunjung','','VARCHAR(120)'),
                ('no_wa','','VARCHAR(25)'),('kota','','VARCHAR(100)'),('pesan','','TEXT'),
                ('status','','ENUM BARU/DIHUBUNGI/DEAL/BATAL'),
                ('created_at','','TIMESTAMP'),('updated_at','','TIMESTAMP')],
 'AKTIVITAS_LOG': [('id','PK','BIGINT'),('user_id','FK users','BIGINT'),('aksi','','ENUM'),
                   ('entitas','','VARCHAR(50)'),('entitas_id','','BIGINT'),('detail','','JSON'),
                   ('created_at','','TIMESTAMP')],
}

def box_h(n):
    return 30 + n * 18 + 18

BOXC = 300
RECTS = {
 'users':      dict(x=610, y=40,  name='USERS',          sub='akun pemilik — login tunggal', star=False),
 'kategori':   dict(x=50,  y=330, name='KATEGORI',       sub='golongan ayam',                     star=False),
 'ayam':       dict(x=610, y=330, name='AYAM',           sub='entitas pusat katalog',             star=True),
 'images':     dict(x=1120,y=330, name='AYAM_IMAGES',    sub='galeri foto · 1 ayam → banyak',     star=False),
 'permintaan': dict(x=50,  y=600, name='PERMINTAAN',     sub='form “Saya Tertarik” · via web publik',   star=False),
 'log':        dict(x=1120,y=640, name='AKTIVITAS_LOG',  sub='jejak perubahan (untuk pemilik)',         star=False),
}
for k in RECTS:
    RECTS[k]['h'] = box_h(len(FIELDS[RECTS[k]['name']]))

W = 1530
H = max(r['y'] + r['h'] for r in RECTS.values()) + 95

def rect(k):  # (x,y,w,h)
    r = RECTS[k]
    return (r['x'], r['y'], BOXC, r['h'])

def seg_cross_box(p1, p2, box):
    """apakah segmen garis p1-p2 menembus isi kotak box (tanpa dihitung titik ujung)?"""
    x1, y1 = p1; x2, y2 = p2
    bx, by, bw, bh = box
    # arah dominan (jalur selalu vertikal/horizontal)
    if x1 == x2:  # vertikal
        if not (bx < x1 < bx + bw): return False
        lo, hi = min(y1, y2), max(y1, y2)
        # menembus jika membentang melewati isi kotak (bukan hanya ujung di tepi)
        return hi > by + 1 and lo < by + bh - 1
    if y1 == y2:  # horizontal
        if not (by < y1 < by + bh): return False
        lo, hi = min(x1, x2), max(x1, x2)
        return hi > bx + 1 and lo < bx + bw - 1
    return False  # diagonal tidak dipakai antar kotak (hanya stub kecil)

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

body = []
body.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Georgia, \'Times New Roman\', serif">')
body.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')
body.append(f'<line x1="0" y1="34" x2="{W}" y2="34" stroke="#d8c8ac" stroke-width="1"/>')
body.append(f'<text x="50" y="24" font-size="21" font-weight="bold" fill="{RED}" letter-spacing="1">ERD — “JALU” · Galeri Ayam Bangkok</text>')
body.append(f'<text x="{W-50}" y="24" font-size="12" fill="{MUTED}" text-anchor="end">v1.0 · 2 Sep 2026 · MySQL 8</text>')

def draw_box(k):
    r = RECTS[k]; x, y = r['x'], r['y']; w = BOXC; h = r['h']
    hdr = RED if r['star'] else RED2
    body.append(f'<rect x="{x+4}" y="{y+4}" width="{w}" height="{h}" rx="10" fill="#00000014"/>')
    body.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{LIGHT}" stroke="#d9c3a4" stroke-width="1.2"/>')
    body.append(f'<rect x="{x}" y="{y}" width="{w}" height="30" rx="10" fill="{hdr}"/>')
    body.append(f'<rect x="{x}" y="{y+18}" width="{w}" height="12" fill="{hdr}"/>')
    body.append(f'<text x="{x+14}" y="{y+21}" font-size="14.5" font-weight="bold" fill="#FDF3E0" letter-spacing="1.1">{esc(r["name"])}</text>')
    if r.get('sub'):
        body.append(f'<text x="{x+14}" y="{y+45}" font-size="11.5" fill="{MUTED}" font-style="italic">{esc(r["sub"])}</text>')
    yy = y + 57
    for i, (fn, tag, typ) in enumerate(FIELDS[r['name']]):
        fill = LIGHT if i % 2 == 0 else CREAM2
        body.append(f'<rect x="{x+6}" y="{yy-13}" width="{w-12}" height="17" rx="3" fill="{fill}" opacity="0.7"/>')
        col = RED if tag == 'PK' else ('#A04A2E' if tag.startswith('FK') else INK)
        wgt = 'font-weight="bold"' if tag in ('PK',) or tag.startswith('FK') else ''
        body.append(f'<text x="{x+12}" y="{yy}" font-size="12.5" fill="{col}" {wgt}>{esc(fn)}</text>')
        if tag in ('PK', 'UQ'):
            body.append(f'<text x="{x+w-12}" y="{yy}" font-size="9.5" fill="#8F2318" text-anchor="end" font-style="italic">{esc(tag)}</text>')
        elif tag.startswith('FK'):
            body.append(f'<text x="{x+w-12}" y="{yy}" font-size="9.5" fill="#A04A2E" text-anchor="end" font-style="italic">{esc(tag)}</text>')
        yy += 18
    body.append(f'<rect x="{x}" y="{y+h-1}" width="{w}" height="3" rx="2" fill="{hdr}" opacity="0.9"/>')

def anchor(k, side, frac=0.5):
    x, y, w, h = rect(k)
    return {'right': (x + w, y + frac * h), 'left': (x, y + frac * h),
            'top': (x + frac * w, y), 'bottom': (x + frac * w, y + h)}[side]

# daftar relasi: urutan titik; ujung pertama = sisi "1", terakhir = sisi "banyak"
REL = [
 ('created_by',  [anchor('users', 'bottom', 0.50), anchor('ayam', 'top', 0.18)]),
 ('memiliki',    [anchor('kategori', 'right', 0.42), anchor('ayam', 'left', 0.34)]),
 ('galeri foto', [anchor('ayam', 'right', 0.30), anchor('images', 'left', 0.42)]),
 ('diminati',    [anchor('permintaan', 'right', 0.55), anchor('ayam', 'left', 0.62)]),
 ('mencatat aksi', [anchor('users', 'right', 0.24), (1522, 95), (1522, 740), anchor('log', 'right', 0.55)]),
]

# --- validasi geometri ---
problems = []
boxes = [rect(k) for k in RECTS]
for i, (lab, pts) in enumerate(REL):
    for p1, p2 in zip(pts, pts[1:]):
        for box in boxes:
            if seg_cross_box(p1, p2, box):
                problems.append(f'relasi “{lab}” menembus kotak {box}')
if problems:
    for p in problems:
        print('GEOMETRI !', p)

# gambar relasi
def elbow(pts, label):
    d = 'M ' + ' L '.join(f'{p[0]} {p[1]}' for p in pts)
    body.append(f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="1.8" stroke-linecap="round"/>')
    # ujung “1”: dua garis pendek tegak lurus arah awal
    x0, y0 = pts[0]; x1, y1 = pts[1]
    dx, dy = x1 - x0, y1 - y0
    L = (dx * dx + dy * dy) ** 0.5 or 1
    nx, ny = -dy / L, dx / L
    for s in (1, -1):
        body.append(f'<line x1="{x0+nx*3}" y1="{y0+ny*3}" x2="{x0+nx*8.5}" y2="{y0+ny*8.5}" stroke="{LINE}" stroke-width="1.4"/>')
    # ujung “banyak”: prongs
    xa, ya = pts[-2]; xb, yb = pts[-1]
    dx, dy = xb - xa, yb - ya
    L = (dx * dx + dy * dy) ** 0.5 or 1
    nx, ny = -dy / L, dx / L
    body.append(f'<line x1="{xb-nx*4}" y1="{yb-ny*4}" x2="{xb-nx*9}" y2="{yb-ny*9}" stroke="{LINE}" stroke-width="1.4"/>')
    for s in (6, -6):
        body.append(f'<line x1="{xb-dx*10/L*6}" y1="{yb-dy*10/L*6}" x2="{xb+nx*s}" y2="{yb+ny*s}" stroke="{LINE}" stroke-width="1.4"/>')
    # label tengah
    mx = sum(p[0] for p in pts) / len(pts)
    my = sum(p[1] for p in pts) / len(pts)
    body.append(f'<text x="{mx}" y="{my}" font-size="11.5" font-style="italic" fill="#7a4a34" text-anchor="middle" paint-order="stroke" stroke="{BG}" stroke-width="5">{esc(label)}</text>')

for lab, pts in REL:
    elbow(pts, lab)

# legenda
lx, ly = 50, H - 78
body.append(f'<text x="{lx}" y="{ly}" font-size="13" font-weight="bold" fill="{INK}">Legenda</text>')
body.append(f'<text x="{lx}" y="{ly+20}" font-size="11.5" fill="{INK}">Teks tebal merah = kunci utama (PK) · teks oranye = kunci tamu (FK → tabel) · UQ = unik</text>')
body.append(f'<text x="{lx}" y="{ly+38}" font-size="11.5" fill="{INK}">Relasi 1 — N : ujung garis bergaris-garis = sisi “banyak”; ujung bertanda dua garis = sisi “satu”.</text>')
body.append(f'<text x="{lx}" y="{ly+56}" font-size="10.5" fill="{MUTED}" font-style="italic">Diagram dihasilkan dari skema — sumber definitif: docs/schema.sql · generator: design/_tools/gen_erd.py</text>')
body.append('</svg>')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write('\n'.join(body))
print('SVG tertulis:', os.path.normpath(OUT), f'({W}x{H})')
if problems:
    print('CATATAN: ada masalah geometri di atas — periksa!')
else:
    print('Validasi geometri: OK (tidak ada segmen menembus kotak)')
