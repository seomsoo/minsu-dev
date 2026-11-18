"""메인 체스판의 3D 모델과 텍스처를 Apple Chess.app 소스에서 만든다.

결과물은 apps/web/public/chess/ 에 들어간다. 사용법은 README.md.

usage: python build_assets.py <Apple Chess 저장소 경로> <출력 경로(public/chess)>
"""
import json
import re
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

CHESS = Path(sys.argv[1])
OUT = Path(sys.argv[2])
MESHES = CHESS / 'Resources' / 'Meshes'
MTL = CHESS / 'Resources' / 'MTL'
TEXTURES = OUT / 'textures'

SCALE = 0.1  # Apple 원본은 칸 한 변 = 10. 웹에서는 칸 한 변 = 1
PIECES = ('pawn', 'rook', 'knight', 'bishop', 'queen', 'king')

# ── 흑백 톤 ───────────────────────────────────────────────
# 원본 나무 스킨을 블로그 톤으로 다시 칠한다. 나뭇결(밝기 변화)은 살린다.
# 각 값은 (가장 어두운 결, 가장 밝은 결)의 밝기 0~1
LIGHT_SQUARE = (0.84, 0.95)
DARK_SQUARE = (0.09, 0.17)
FRAME = (0.1, 0.26)
GROOVE = (0.04, 0.07)
WHITE_PIECE = (0.64, 0.8)
BLACK_PIECE = (0.07, 0.15)
# 흰색에는 블로그 라이트 배경 oklch(0.97 0.008 90) ≈ #f7f5ef 의 따뜻한 기운만 빌린다
WARM = np.array([247, 245, 239]) / 247
NEUTRAL = np.array([1.0, 1.0, 1.0])


# ── 메시: USD → GLB ───────────────────────────────────────

def read_usda(name):
    """macOS 기본 도구 usdcat으로 바이너리 USD를 텍스트로 바꿔 읽는다."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / f'{name}.usda'
        subprocess.run(['usdcat', str(MESHES / f'{name}.usdc'), '-o', str(out)], check=True)
        text = out.read_text()
    return text[text.index('def Mesh'):]


def read_array(text, kind, name, width):
    m = re.search(rf'{re.escape(kind)}\[\] {re.escape(name)} = \[(.*?)\]', text, re.S)
    if not m:
        raise ValueError(f'{name} not found')
    body = m.group(1)
    if width == 1:
        return np.array([int(v) for v in body.replace('\n', '').split(',') if v.strip()])
    tuples = re.findall(r'\(([^)]*)\)', body)
    return np.array([[float(x) for x in t.split(',')] for t in tuples], dtype=np.float64)


def convert_mesh(name):
    text = read_usda(name)
    points = read_array(text, 'point3f', 'points', 3)
    counts = read_array(text, 'int', 'faceVertexCounts', 1)
    indices = read_array(text, 'int', 'faceVertexIndices', 1)
    normals = read_array(text, 'normal3f', 'normals', 3)  # faceVarying
    uvs = read_array(text, 'texCoord2f', 'primvars:UVMap', 2)  # faceVarying

    vertex_of, pos, nor, tex, tris = {}, [], [], [], []

    def vertex(corner):
        p = points[indices[corner]] * SCALE
        n, t = normals[corner], uvs[corner]
        key = (tuple(np.round(p, 5)), tuple(np.round(n, 4)), tuple(np.round(t, 5)))
        if key not in vertex_of:
            vertex_of[key] = len(pos)
            pos.append(p)
            nor.append(n / (np.linalg.norm(n) or 1))
            tex.append(t)
        return vertex_of[key]

    corner = 0
    for count in counts:
        face = [vertex(corner + i) for i in range(count)]
        for i in range(1, count - 1):  # 사각형·다각형을 삼각형 부채꼴로
            tris.extend([face[0], face[i], face[i + 1]])
        corner += count

    index_type = np.uint32 if len(pos) > 65535 else np.uint16
    write_glb(OUT / f'{name}.glb', np.array(pos, np.float32), np.array(nor, np.float32),
              np.array(tex, np.float32), np.array(tris, index_type))
    print(f'{name}.glb: {len(pos)} verts, {len(tris) // 3} tris')


def write_glb(path, pos, nor, tex, idx):
    blobs, views, accessors, offset = [], [], [], 0

    def add(arr, component, kind, target, minmax=False):
        nonlocal offset
        data = arr.tobytes()
        pad = (-len(data)) % 4
        blobs.append(data + b'\x00' * pad)
        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(data), 'target': target})
        acc = {'bufferView': len(views) - 1, 'componentType': component, 'count': len(arr), 'type': kind}
        if minmax:
            acc['min'], acc['max'] = arr.min(axis=0).tolist(), arr.max(axis=0).tolist()
        accessors.append(acc)
        offset += len(data) + pad
        return len(accessors) - 1

    attributes = {
        'POSITION': add(pos, 5126, 'VEC3', 34962, True),
        'NORMAL': add(nor, 5126, 'VEC3', 34962),
        'TEXCOORD_0': add(tex, 5126, 'VEC2', 34962),
    }
    indices = add(idx, 5125 if idx.dtype == np.uint32 else 5123, 'SCALAR', 34963)
    gltf = {
        'asset': {'version': '2.0', 'generator': 'minsu-dev scripts/chess/build_assets.py',
                  'copyright': 'Derived from Apple Chess.app (Apple Sample Code License)'},
        'scene': 0, 'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0, 'name': path.stem}],
        'meshes': [{'name': path.stem, 'primitives': [{'attributes': attributes, 'indices': indices}]}],
        'buffers': [{'byteLength': offset}], 'bufferViews': views, 'accessors': accessors,
    }
    js = json.dumps(gltf, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    body = b''.join(blobs)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(body)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
        f.write(struct.pack('<II', len(body), 0x004E4942) + body)


# ── 텍스처 ────────────────────────────────────────────────

def save_jpg(img, path, size=None, quality=88):
    img = img.convert('RGB')
    if size and img.width > size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(path, 'JPEG', quality=quality, optimize=True, progressive=True)


def save_webp(img, path, size=None, quality=85):
    """판 텍스처는 가장 커서(1536px) WebP로 저장한다. 같은 화질에서 JPEG의 절반 이하다"""
    img = img.convert('RGB')
    if size and img.width > size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(path, 'WEBP', quality=quality, method=6)


def luminance(path):
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(float)
    return rgb @ [0.299, 0.587, 0.114]


def paint(out, lum, mask, tone, tint):
    """영역 안의 밝기를 0~1로 정규화해 나뭇결만 남기고 tone 범위로 다시 칠한다."""
    lo, hi = np.percentile(lum[mask], 2), np.percentile(lum[mask], 98)
    grain = np.clip((lum - lo) / max(hi - lo, 1e-3), 0, 1)
    value = (tone[0] + (tone[1] - tone[0]) * grain)[..., None] * 255 * tint
    out[mask] = np.clip(value[mask], 0, 255)


def board_texture():
    lum = luminance(MTL / 'Board' / 'BoardWood.jpg')  # 2048×2048
    h, w = lum.shape
    y, x = np.mgrid[0:h, 0:w]
    start, size = 271, 188  # 칸 영역 271~1775px, 칸 한 변 188px (UV 0.133~0.867 = 메시 ±40)
    inside = (x >= start) & (x < start + 8 * size) & (y >= start) & (y < start + 8 * size)
    cell = np.clip((y - start) // size, 0, 7) * 8 + np.clip((x - start) // size, 0, 7)
    # 흰 칸/검은 칸은 원본 칸의 평균 밝기로 가른다
    means = np.array([lum[inside & (cell == i)].mean() for i in range(64)])
    light_cells = means > np.median(means)
    light = inside & light_cells[cell]
    dark = inside & ~light_cells[cell]
    groove = ~inside & (x >= 255) & (x < 1791) & (y >= 255) & (y < 1791)
    frame = ~inside & ~groove

    out = np.zeros((h, w, 3))
    paint(out, lum, light, LIGHT_SQUARE, WARM)
    paint(out, lum, dark, DARK_SQUARE, NEUTRAL)
    paint(out, lum, frame, FRAME, NEUTRAL)
    paint(out, lum, groove, GROOVE, NEUTRAL)
    save_webp(Image.fromarray(out.astype(np.uint8)), TEXTURES / 'board.webp', 1536)


def piece_texture(color, tone, tint):
    name = color.capitalize()
    lum = luminance(MTL / f'Pieces{name}' / f'{name}PieceWood.jpg')
    out = np.zeros((*lum.shape, 3))
    paint(out, lum, np.ones_like(lum, bool), tone, tint)
    save_jpg(Image.fromarray(out.astype(np.uint8)), TEXTURES / f'{color}.jpg')


def piece_maps(piece):
    maps = MTL / 'Piece PBR Maps'
    save_jpg(Image.open(maps / f'{piece}N.jpg'), TEXTURES / f'{piece}-normal.jpg', 512, 90)
    # Apple은 R=거칠기, G=AO. three.js는 R=AO, G=거칠기라서 채널을 바꾼다
    r, g, _ = Image.open(maps / f'{piece}R_AO.jpg').convert('RGB').split()
    save_jpg(Image.merge('RGB', (g, r, Image.new('L', r.size, 0))), TEXTURES / f'{piece}-orm.jpg', 256, 85)


if __name__ == '__main__':
    TEXTURES.mkdir(parents=True, exist_ok=True)
    for name in (*PIECES, 'board'):
        convert_mesh(name)
    for piece in PIECES:
        piece_maps(piece)
    board_texture()
    piece_texture('white', WHITE_PIECE, WARM)
    piece_texture('black', BLACK_PIECE, NEUTRAL)
    print('textures done')
