'use client';
import { useEffect, useRef, useCallback } from 'react';

const S = 3; // pixel scale

const PAL: Record<string, string> = {
  'O': '#f97316', 'o': '#fdba74', 'W': '#fef3c7', 'b': '#0f172a',
  'P': '#fb7185', 'C': '#a855f7', 'R': '#ef4444', 'K': '#334155',
  'G': '#86efac', 'Y': '#fde68a',
};

// --- SPRITES (8-10 wide, 12 tall) ---

const STAND = [
  'O_____O_',
  'OoO__OoO',
  'OOOOOOOO',
  'ObOOOObO',
  'OOOOOOOO',
  '_OOPPOO_',
  '_OOOOOO_',
  '_CCCCCC_',
  '_OWWWWO_',
  '_OO__OO_',
  '_OO__OO_',
  '_____Ooo',
];

const KNEEL = [
  'O_____O_',
  'OoO__OoO',
  'OOOOOOOO',
  'ObOOOObO',
  'OOOOOOOO',
  '_OOPPOO_',
  '_OOOOOO_',
  '_CCCCCC_',
  '_OWWWWO_',
  '__OOOO__',
];

const BLINDFOLD = [
  'O_____O_',
  'OoO__OoO',
  'OOOOOOOO',
  'KKKKKKKK',
  'OOOOOOOO',
  '_OOPPOO_',
  '_OOOOOO_',
  '_CCCCCC_',
  '_OWWWWO_',
  '_OO__OO_',
  '_OO__OO_',
  '_____Ooo',
];

const TIED = [
  'O_____O_',
  'OoO__OoO',
  'OOOOOOOO',
  'ObOOOObO',
  'OOOOOOOO',
  '_OOPPOO_',
  '_OOOOOO_',
  '_CCCCCC_',
  'ROWWWWOR',
  '_ROOOOR_',
  '_OO__OO_',
  '_____Ooo',
];

const ARM_UP = [
  'O_____O_RR',
  'OoO__OoO__',
  'OOOOOOOO__',
  'ObOOOObO__',
  'OOOOOOOO__',
  '_OOPPOO___',
  '_OOOOOO___',
  '_CCCCCC___',
  '_OWWWWO___',
  '_OO__OO___',
  '_OO__OO___',
  '_____Ooo__',
];

const ARM_DOWN = [
  'O_____O___',
  'OoO__OoO__',
  'OOOOOOOO__',
  'ObOOOObO__',
  'OOOOOOOO__',
  '_OOPPOO___',
  '_OOOOOO___',
  '_CCCCCC___',
  '_OWWWOORR_',
  '_OO__OO_R_',
  '_OO__OO___',
  '_____Ooo__',
];

const LEASH_HOLD = [
  'O_____O___',
  'OoO__OoO__',
  'OOOOOOOO__',
  'ObOOOObO__',
  'OOOOOOOO__',
  '_OOPPOO___',
  '_OOOOOO___',
  '_CCCCCC___',
  '_OWWWOORR_',
  '_OO__OORR_',
  '_OO__OO___',
  '_____Ooo__',
];

const COLLARED = [
  'O_____O_',
  'OoO__OoO',
  'OOOOOOOO',
  'ObOOOObO',
  'OOOOOOOO',
  '_OOPPOO_',
  '_OOOOOO_',
  'RCCCCCCR',
  '_OWWWWO_',
  '_OO__OO_',
  '_OO__OO_',
  '_____Ooo',
];

// --- PROP SHAPES ---

const HEART: [number, number][] = [
  [1,0],[2,0],[4,0],[5,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],
  [2,4],[3,4],[4,4],
  [3,5],
];

const CHAIN: [number, number][] = [
  [1,0],[2,0],[0,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[3,3],[1,4],[2,4],
];

const STAR: [number, number][] = [
  [2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4],
];

const QMARK: [number, number][] = [
  [1,0],[2,0],[3,0],[0,1],[4,1],[3,2],[2,3],[2,5],
];

// --- DRAW HELPERS ---

function drawSprite(ctx: CanvasRenderingContext2D, spr: string[], ox: number, oy: number, flip = false) {
  const w = spr[0].length;
  spr.forEach((row, ri) => {
    row.split('').forEach((ch, ci) => {
      const col = PAL[ch];
      if (!col) return;
      ctx.fillStyle = col;
      const x = flip ? ox + (w - 1 - ci) * S : ox + ci * S;
      ctx.fillRect(x, oy + ri * S, S, S);
    });
  });
}

function drawShape(ctx: CanvasRenderingContext2D, px: [number, number][], ox: number, oy: number, s: number, col: string) {
  ctx.fillStyle = col;
  px.forEach(([x, y]) => ctx.fillRect(ox + x * s, oy + y * s, s, s));
}

// --- SCENE DETECTION ---

type SceneKey = 'idle' | 'bondage' | 'blindfold' | 'punishment' | 'tease' | 'dare' | 'worship' | 'leash' | 'default';

function detectScene(game: any): SceneKey {
  if (!game) return 'idle';
  const t = JSON.stringify(game).toLowerCase();
  if (t.includes('blindfold') || t.includes('sensory deprivation')) return 'blindfold';
  if (t.includes('tied') || t.includes('rope') || t.includes('restrain') || t.includes('bond') || t.includes('cuff')) return 'bondage';
  if (t.includes('leash') || t.includes('collar') || t.includes('lead') || t.includes('pet')) return 'leash';
  if (t.includes('punish') || t.includes('spank') || t.includes('paddle') || t.includes('discipline')) return 'punishment';
  if (t.includes('tease') || t.includes('denial') || t.includes('edge') || t.includes('torment')) return 'tease';
  if (t.includes('truth') || t.includes('dare') || t.includes('question')) return 'dare';
  if (t.includes('worship') || t.includes('kneel') || t.includes('submit') || t.includes('obey') || t.includes('beg')) return 'worship';
  return 'default';
}

type SceneCfg = {
  left: string[]; right: string[];
  leftAlt?: string[]; // alternate frame
  prop: [number, number][]; propCol: string;
  gap: number; // how close the characters are (offset from edge)
  speed: number;
  dialogue: string;
};

function sceneCfg(key: SceneKey, title?: string): SceneCfg {
  const d = title ? `"${title.length > 32 ? title.slice(0, 30) + '...' : title}"` : '';
  switch (key) {
    case 'bondage': return { left: STAND, right: TIED, prop: CHAIN, propCol: '#94a3b8', gap: 60, speed: 0.6, dialogue: d || 'Tied up and nowhere to go...' };
    case 'blindfold': return { left: STAND, right: BLINDFOLD, prop: STAR, propCol: '#fbbf24', gap: 55, speed: 0.5, dialogue: d || "Can't see, but can feel everything..." };
    case 'punishment': return { left: ARM_UP, right: KNEEL, leftAlt: ARM_DOWN, prop: STAR, propCol: '#f87171', gap: 45, speed: 1.8, dialogue: d || "Someone's been naughty..." };
    case 'tease': return { left: STAND, right: KNEEL, prop: HEART, propCol: '#ef4444', gap: 55, speed: 0.7, dialogue: d || 'Patience is a virtue... right?' };
    case 'dare': return { left: STAND, right: STAND, prop: QMARK, propCol: '#c084fc', gap: 70, speed: 1.0, dialogue: d || 'Truth or dare? Choose wisely.' };
    case 'worship': return { left: KNEEL, right: STAND, prop: HEART, propCol: '#ec4899', gap: 50, speed: 0.5, dialogue: d || 'On your knees.' };
    case 'leash': return { left: LEASH_HOLD, right: COLLARED, prop: HEART, propCol: '#ec4899', gap: 40, speed: 0.6, dialogue: d || 'Good pet.' };
    case 'default': return { left: STAND, right: STAND, prop: HEART, propCol: '#ef4444', gap: 70, speed: 0.9, dialogue: d || 'Game on.' };
    default: return { left: STAND, right: STAND, prop: HEART, propCol: '#ef4444', gap: 70, speed: 1.0, dialogue: 'Ready when you are...' };
  }
}

// --- FLOATING PROP PARTICLES ---
type Particle = { x: number; y: number; opacity: number; speed: number; size: number; drift: number };

function spawnParticle(cx: number): Particle {
  return {
    x: cx - 30 + Math.random() * 60,
    y: 55 + Math.random() * 20,
    opacity: 0,
    speed: 0.25 + Math.random() * 0.4,
    size: Math.random() < 0.4 ? 2 : 1,
    drift: (Math.random() - 0.5) * 0.3,
  };
}

// --- COMPONENT ---

const W = 320;
const H = 100;
const FLOOR = H - 10;

type Props = {
  isGenerating: boolean;
  game: { title: string; duration: string; description?: string; sections?: { title: string; content: string }[] } | null;
  heatLevel: number;
};

export default function PixelScene({ isGenerating, game, heatLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const lastTs = useRef(0);
  const particles = useRef<Particle[]>([]);
  const prevScene = useRef<SceneKey>('idle');

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const scene = isGenerating ? 'idle' : detectScene(game);
    const cfg = sceneCfg(scene, game?.title);

    // Reset particles on scene change
    if (scene !== prevScene.current) {
      const cx = W / 2;
      const count = Math.max(2, heatLevel);
      particles.current = Array.from({ length: count }, () => spawnParticle(cx));
      prevScene.current = scene;
    }

    // BG
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, W, H);

    // Dot grid
    ctx.fillStyle = '#12161f';
    for (let gx = 6; gx < W; gx += 14)
      for (let gy = 6; gy < FLOOR; gy += 14)
        ctx.fillRect(gx, gy, 1, 1);

    // Floor
    ctx.fillStyle = '#151a28';
    ctx.fillRect(0, FLOOR, W, H - FLOOR);
    for (let x = 0; x < W; x += 8) { ctx.fillStyle = '#1c2238'; ctx.fillRect(x, FLOOR, 4, 2); }

    // Rope line between leash holder and collared fox
    if (scene === 'leash') {
      const lW = cfg.left[0].length * S;
      const rW = cfg.right[0].length * S;
      const lx = cfg.gap + lW - 2 * S;
      const rx = W - cfg.gap - rW + 2 * S;
      const ry = FLOOR - cfg.right.length * S + 8 * S;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ry);
      const sag = 8 + Math.sin(t * 0.002) * 3;
      ctx.quadraticCurveTo((lx + rx) / 2, ry + sag, rx, ry);
      ctx.stroke();
    }

    // Character animation
    const spd = cfg.speed;
    const leftBob = isGenerating
      ? Math.sin(t * 0.018) * 4
      : Math.sin(t * 0.002 * spd) * 2.5;
    const rightBob = isGenerating
      ? Math.sin(t * 0.018 + Math.PI) * 4
      : Math.sin(t * 0.002 * spd + 2) * 2.5;

    // Pick sprite (alternate for punishment)
    let leftSpr = cfg.left;
    if (cfg.leftAlt && !isGenerating) {
      const frame = Math.floor(t / 600) % 2;
      leftSpr = frame === 0 ? cfg.left : cfg.leftAlt;
    }

    const lH = leftSpr.length * S;
    const rH = cfg.right.length * S;
    const rW = cfg.right[0].length * S;

    // Draw left fox (faces right by default)
    drawSprite(ctx, leftSpr, cfg.gap, FLOOR - lH + leftBob);

    // Draw right fox (flipped to face left)
    drawSprite(ctx, cfg.right, W - cfg.gap - rW, FLOOR - rH + rightBob, true);

    // Floating props
    const cx = W / 2;
    const propScale = Math.max(1, Math.min(2, heatLevel > 3 ? 2 : 1));

    particles.current.forEach(p => {
      p.y -= p.speed * 0.2 * (0.5 + heatLevel * 0.2);
      p.x += p.drift;
      p.opacity += 0.014;
      if (p.opacity > 1.3 || p.y < 5) Object.assign(p, spawnParticle(cx));

      const alpha = Math.min(1, p.opacity) * (1 - Math.max(0, (p.opacity - 1) / 0.3));
      if (alpha < 0.02) return;

      ctx.globalAlpha = alpha;
      drawShape(ctx, cfg.prop, p.x, p.y, p.size * propScale, cfg.propCol);
      ctx.globalAlpha = 1;
    });

    // Generating sparkles
    if (isGenerating) {
      for (let i = 0; i < 5; i++) {
        const sx = cx - 50 + Math.sin(t * 0.011 + i * 1.1) * 50;
        const sy = 25 + Math.cos(t * 0.008 + i * 0.9) * 20;
        ctx.fillStyle = i % 2 === 0 ? '#d97757' : '#22d3ee';
        ctx.globalAlpha = 0.5 + Math.sin(t * 0.02 + i) * 0.4;
        ctx.fillRect(Math.round(sx), Math.round(sy), 3, 3);
      }
      ctx.globalAlpha = 1;
    }

    // Blush marks at high heat (pink dots on cheeks)
    if (heatLevel >= 4 && !isGenerating) {
      ctx.globalAlpha = 0.4 + Math.sin(t * 0.003) * 0.2;
      ctx.fillStyle = '#fb7185';
      // Left fox blush
      const lx = cfg.gap;
      const ly = FLOOR - lH + leftBob;
      ctx.fillRect(lx + 1 * S, ly + 4 * S, S, S);
      ctx.fillRect(lx + 6 * S, ly + 4 * S, S, S);
      // Right fox blush
      const rx2 = W - cfg.gap - rW;
      const ry2 = FLOOR - rH + rightBob;
      ctx.fillRect(rx2 + 1 * S, ry2 + 4 * S, S, S);
      ctx.fillRect(rx2 + 6 * S, ry2 + 4 * S, S, S);
      ctx.globalAlpha = 1;
    }

  }, [isGenerating, game, heatLevel]);

  useEffect(() => {
    function loop(ts: number) {
      tRef.current += ts - (lastTs.current || ts);
      lastTs.current = ts;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const scene = isGenerating ? 'idle' : detectScene(game);
  const cfg = sceneCfg(scene, game?.title);
  const dialogue = isGenerating ? 'Creating your scene...' : cfg.dialogue;

  return (
    <div className="w-full relative select-none">
      <div className="relative rounded-lg overflow-hidden"
        style={{ boxShadow: '0 0 20px rgba(217,119,87,0.12), 0 0 2px rgba(217,119,87,0.3)' }}>
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />
        <canvas ref={canvasRef} width={W} height={H}
          style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }} />
      </div>
      <div className="mt-1.5 bg-[#121418]/80 border border-white/[0.06] rounded-lg px-4 py-2 flex items-center gap-2">
        <span className="text-[#d97757]/50 text-xs shrink-0" style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '8px' }}>▶</span>
        <span className="text-gray-400 text-xs italic tracking-wide truncate">{dialogue}</span>
      </div>
    </div>
  );
}
