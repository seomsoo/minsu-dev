import { asset } from './constants';

/**
 * 체스 소리. 실제 나무 말을 판에 놓는 녹음(public/chess/sounds)을 Web Audio로 재생한다.
 * 같은 녹음이 기계처럼 반복되지 않도록 재생할 때마다 높낮이·크기를 조금씩 흔든다.
 *
 * 브라우저는 사용자가 누르기 전에는 소리를 막는다. 판을 눌러 다가갈 때 unlockSound()로 켠다.
 */

const FILES = {
  move: [1, 2, 3, 4, 5, 6, 7].map((n) => `sounds/move-${n}.wav`),
  capture: [1, 2].map((n) => `sounds/capture-${n}.wav`),
};

type Bank = { move: AudioBuffer[]; capture: AudioBuffer[] };

let context: AudioContext | null = null;
let master: GainNode | null = null;
let bank: Bank | null = null;
let loading: Promise<void> | null = null;

/* ---------- 재생 ---------- */

async function load(ctx: AudioContext) {
  const fetchOne = async (path: string) => {
    const response = await fetch(asset(path));
    return ctx.decodeAudioData(await response.arrayBuffer());
  };
  const [move, capture] = await Promise.all([
    Promise.all(FILES.move.map(fetchOne)),
    Promise.all(FILES.capture.map(fetchOne)),
  ]);
  bank = { move, capture };
}

/** 사용자가 누른 순간(클릭 핸들러 안)에 불러야 브라우저가 소리를 허락한다 */
export function unlockSound() {
  if (typeof window === 'undefined') return;
  if (!context) {
    context = new AudioContext({ latencyHint: 'interactive' });
    master = context.createGain();
    master.gain.value = 0.7;
    master.connect(context.destination);
  }
  // 'suspended'뿐 아니라 아이폰의 'interrupted'(전화·다른 앱 소리 뒤)도 다시 켠다
  if (context.state !== 'running') void context.resume();
  loading ??= load(context).catch(() => {
    loading = null; // 다음에 다시 시도
  });
}

const vary = (base: number, spread: number) =>
  base * (1 + (Math.random() - 0.5) * spread);

function play(
  buffer: AudioBuffer,
  {
    volume = 1,
    rate = 1,
    delay = 0,
  }: { volume?: number; rate?: number; delay?: number },
) {
  if (!context || !master) return;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(master);
  source.start(context.currentTime + delay);
}

const pick = (list: AudioBuffer[]) =>
  list[Math.floor(Math.random() * list.length)];

function ready() {
  return context?.state === 'running' && bank ? bank : null;
}

/** 말이 칸에 내려앉음. soft: 들었던 말을 제자리에 내려놓을 때 */
export function playMove(soft = false) {
  const b = ready();
  if (!b) return;
  play(pick(b.move), {
    volume: vary(soft ? 0.3 : 0.65, 0.3),
    rate: vary(1, 0.08),
  });
}

/** 상대 말을 잡으며 내려앉음: 조금 더 묵직하게 */
export function playCapture() {
  const b = ready();
  if (!b) return;
  play(pick(b.capture), { volume: vary(0.85, 0.15), rate: vary(0.97, 0.06) });
}

/** 킹이 쪼개지는 순간: 묵직한 소리 둘을 낮게 겹친다 */
export function playCrack() {
  const b = ready();
  if (!b) return;
  play(b.capture[1], { volume: 1, rate: 0.72 });
  play(b.capture[0], { volume: 0.8, rate: 0.55, delay: 0.012 });
}

let lastChip = 0;
/**
 * 조각이 판에 부딪힘. strength 0~1(부딪힌 속도), size 0~1(조각 크기).
 * 작은 조각일수록 높고 가볍게 들린다. 한꺼번에 몰리면 지저분해서 간격을 둔다.
 */
export function playChip(strength: number, size: number) {
  const b = ready();
  if (!b || !context) return;
  const now = context.currentTime;
  if (now - lastChip < 0.03) return;
  lastChip = now;
  play(pick(b.move), {
    volume: Math.min(1, strength) * 0.45,
    rate: vary(2.1 - size * 0.9, 0.15),
  });
}
