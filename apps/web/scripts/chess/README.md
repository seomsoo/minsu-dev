# 메인 체스판 에셋

메인 페이지의 3D 체스판과 말(`public/chess/`)은 Apple Chess.app 소스에서 만든다. 이 스크립트가 그 변환을 한다.

- 메시: `Resources/Meshes/*.usdc` → `public/chess/*.glb` (칸 한 변 = 1로 축소)
- 말 노멀맵·거칠기맵: `Resources/MTL/Piece PBR Maps` → `public/chess/textures/<piece>-normal.jpg`, `<piece>-orm.jpg`
- 판·말 색: 원본 나무 스킨을 블로그의 흑백 톤으로 다시 칠한다 → `board.webp`, `white.jpg`, `black.jpg`

출처와 라이선스는 `public/chess/LICENSE.txt`에 있다.

## 다시 만들기

macOS가 필요하다(`usdcat`이 기본으로 들어 있다).

```bash
git clone --depth 1 https://github.com/apple-oss-distributions/Chess /tmp/apple-chess

python3 -m venv /tmp/chess-venv
/tmp/chess-venv/bin/pip install numpy pillow

/tmp/chess-venv/bin/python apps/web/scripts/chess/build_assets.py /tmp/apple-chess apps/web/public/chess
```

## 톤 조정

흰 칸이 너무 차갑거나 검은 칸이 너무 어두우면 `build_assets.py` 위쪽의 상수를 바꾸고 다시 실행한다.

| 상수 | 대상 |
| --- | --- |
| `LIGHT_SQUARE`, `DARK_SQUARE` | 흰 칸, 검은 칸 |
| `FRAME`, `GROOVE` | 테두리, 칸과 테두리 사이 홈 |
| `WHITE_PIECE`, `BLACK_PIECE` | 백 말, 흑 말 |
| `WARM` | 흰색에 섞는 따뜻한 기운 |

각 값은 `(가장 어두운 결, 가장 밝은 결)`의 밝기(0~1)다. 범위를 좁히면 나뭇결이 옅어지고, 넓히면 진해진다.

에셋을 다시 만들었으면 `src/components/chess/ChessHero.tsx`의 `ASSET_VERSION`을 1 올린다. 파일 이름이 그대로라 올리지 않으면 브라우저가 캐시된 예전 파일을 쓴다.

## 소리

`public/chess/sounds/*.wav`는 Pixabay의 "chess pieces" 녹음(freesound_community, 60890, Pixabay Content License: 출처 표시 없이 무료 사용 가능)에서 말을 놓는 순간 9개를 잘라 낸 것이다.

```bash
ffmpeg -i chess-pieces-60890.mp3 -ac 1 -ar 24000 -f s16le raw.pcm
python3 scripts/chess/cut_sounds.py raw.pcm public/chess/sounds
```

각 소리는 시작(어택) 3ms 앞에서 잘라 0.38초 길이로, 크기를 맞추고 끝을 부드럽게 줄인다. 자를 위치는 스크립트의 `hits`에 있다.
