'use client';
import { useEffect, useRef, useCallback } from 'react';

const S = 3; // pixel scale

// Extended palette
const PAL: Record<string, string> = {
  'O': '#f97316', // orange fur
  'o': '#fdba74', // light orange
  'W': '#fef3c7', // white/cream (belly, muzzle)
  'w': '#fefce8', // bright white
  'b': '#1e293b', // dark (eyes)
  'B': '#0f172a', // black (nose, outlines)
  'P': '#fb7185', // pink (tongue, blush)
  'p': '#f9a8d4', // light pink
  'C': '#a855f7', // purple (collar/clothing)
  'c': '#c084fc', // light purple
  'R': '#ef4444', // red (rope, leash)
  'r': '#fca5a5', // light red
  'K': '#334155', // dark gray (blindfold)
  'k': '#475569', // medium gray
  'G': '#86efac', // green
  'Y': '#fde68a', // yellow
  'T': '#92400e', // dark brown (ear tips)
  'n': '#b45309', // dark orange
  'L': '#7c2d12', // leather brown
};

// =============================================
// LARGER FOX SPRITES (14 wide x 18 tall)
// Much more detailed with pointy ears, snout, bushy tail
// =============================================

// Standing fox facing right
const FOX_STAND = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Kneeling fox (shorter legs, body lower)
const FOX_KNEEL = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '___OOOOOOOO____',
  '___________Oooo',
];

// Blindfolded fox
const FOX_BLINDFOLD = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOKKKKKKKOO__',
  '__OOKKKKKKKOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Tied up fox (rope around wrists/body)
const FOX_TIED = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '___ROOOOOOOOR__',
  '___ROWWWWWOR___',
  '___ROWWWWWOR___',
  '____ROOOOOR____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Fox with arm raised (for spanking/punishment)
const FOX_ARM_UP = [
  '__T_______OO_T',
  '_TO_______OO_OT',
  '_TOO______OO_OOT',
  '_TOOO____OOOOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Fox with arm down (alternate frame)
const FOX_ARM_DOWN = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWOO___',
  '____OOWWWOOO___',
  '____OO__OOOO___',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Fox holding leash
const FOX_LEASH = [
  '__T_______RR_T',
  '_TO_______RR_OT',
  '_TOO______RR_OOT',
  '_TOOO____OOOOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwPwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Fox with collar
const FOX_COLLARED = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '___RRRRRRRRRR__',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
];

// Fox bowing/submitting (head down)
const FOX_BOW = [
  '_______________',
  '_______________',
  '__T__________T',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOwBwBwOOO__',
  '__OOOwwBwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '___OOOOOOOO____',
  '___________Oooo',
];

// Fox with heart eyes (tease)
const FOX_HEARTEYES = [
  '__T__________T',
  '_TO__________OT',
  '_TOO________OOT',
  '_TOOO______OOOT',
  '__OOOObbbbOOOO_',
  '__OOObwwwbOOO__',
  '__OOOPBPBpOOO__',
  '__OOOwwPwwOOO__',
  '___OOwwwwwOO___',
  '____OOOOOOOO___',
  '____OWWWWWO____',
  '____OWWWWWO____',
  '____OOWWWOO____',
  '____OO__OOO____',
  '____OO__OOO____',
  '____OO___OO____',
  '____nn___nn____',
  '________OOOooo_',
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

const FLAME: [number, number][] = [
  [2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[1,4],[2,4],[3,4],[2,5],
];

const SWIRL: [number, number][] = [
  [1,0],[2,0],[3,0],[0,1],[4,1],[0,2],[3,2],[0,3],[1,3],[2,3],
];

// --- DRAW HELPERS ---

function drawSprite(ctx: CanvasRenderingContext2D, spr: string[], ox: number, oy: number, flip = false) {
  const w = Math.max(...spr.map(r => r.length));
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
  if (t.includes('tied') || t.includes('rope') || t.includes('restrain') || t.includes('bond') || t.includes('cuff') || t.includes('fesseln')) return 'bondage';
  if (t.includes('leash') || t.includes('collar') || t.includes('lead') || t.includes('pet') || t.includes('leine') || t.includes('halsband')) return 'leash';
  if (t.includes('punish') || t.includes('spank') || t.includes('paddle') || t.includes('discipline') || t.includes('strafe') || t.includes('bestraf')) return 'punishment';
  if (t.includes('tease') || t.includes('denial') || t.includes('edge') || t.includes('torment') || t.includes('necken')) return 'tease';
  if (t.includes('truth') || t.includes('dare') || t.includes('question') || t.includes('wahrheit') || t.includes('pflicht')) return 'dare';
  if (t.includes('worship') || t.includes('kneel') || t.includes('submit') || t.includes('obey') || t.includes('beg') || t.includes('knien') || t.includes('gehorchen')) return 'worship';
  return 'default';
}

type SceneCfg = {
  left: string[]; right: string[];
  leftAlt?: string[];
  prop: [number, number][]; propCol: string;
  gap: number;
  speed: number;
  dialogue: string;
};

function sceneCfg(key: SceneKey, title?: string): SceneCfg {
  const d = title ? `"${title.length > 32 ? title.slice(0, 30) + '...' : title}"` : '';
  switch (key) {
    case 'bondage': return { left: FOX_STAND, right: FOX_TIED, prop: CHAIN, propCol: '#94a3b8', gap: 40, speed: 0.6, dialogue: d || 'Tied up and nowhere to go...' };
    case 'blindfold': return { left: FOX_HEARTEYES, right: FOX_BLINDFOLD, prop: STAR, propCol: '#fbbf24', gap: 40, speed: 0.5, dialogue: d || "Can't see, but can feel everything..." };
    case 'punishment': return { left: FOX_ARM_UP, right: FOX_KNEEL, leftAlt: FOX_ARM_DOWN, prop: FLAME, propCol: '#f87171', gap: 35, speed: 1.8, dialogue: d || "Someone's been naughty..." };
    case 'tease': return { left: FOX_HEARTEYES, right: FOX_KNEEL, prop: HEART, propCol: '#ef4444', gap: 40, speed: 0.7, dialogue: d || 'Patience is a virtue... right?' };
    case 'dare': return { left: FOX_STAND, right: FOX_STAND, prop: QMARK, propCol: '#c084fc', gap: 50, speed: 1.0, dialogue: d || 'Truth or dare? Choose wisely.' };
    case 'worship': return { left: FOX_BOW, right: FOX_STAND, prop: HEART, propCol: '#ec4899', gap: 35, speed: 0.5, dialogue: d || 'On your knees.' };
    case 'leash': return { left: FOX_LEASH, right: FOX_COLLARED, prop: HEART, propCol: '#ec4899', gap: 30, speed: 0.6, dialogue: d || 'Good pet.' };
    case 'default': return { left: FOX_STAND, right: FOX_STAND, prop: HEART, propCol: '#ef4444', gap: 50, speed: 0.9, dialogue: d || 'Game on.' };
    default: return { left: FOX_STAND, right: FOX_STAND, prop: HEART, propCol: '#ef4444', gap: 50, speed: 1.0, dialogue: 'Ready when you are...' };
  }
}

// --- FLOATING PARTICLES ---
type Particle = { x: number; y: number; opacity: number; speed: number; size: number; drift: number };

function spawnParticle(cx: number): Particle {
  return {
    x: cx - 40 + Math.random() * 80,
    y: 80 + Math.random() * 30,
    opacity: 0,
    speed: 0.25 + Math.random() * 0.4,
    size: Math.random() < 0.4 ? 2 : 1,
    drift: (Math.random() - 0.5) * 0.3,
  };
}

// --- COMPONENT ---

const W = 360;
const H = 130;
const FLOOR = H - 12;

type Props = {
  isGenerating: boolean;
  game: { title: string; duration: string; description?: string; sections?: { title: string; content: string }[] } | null;
  heatLevel: number;
  transparent?: boolean;
};

export default function PixelScene({ isGenerating, game, heatLevel, transparent = false }: Props) {
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
      const count = Math.max(3, heatLevel + 1);
      particles.current = Array.from({ length: count }, () => spawnParticle(cx));
      prevScene.current = scene;
    }

    if (transparent) {
      ctx.clearRect(0, 0, W, H);
    } else {
      // BG - subtle gradient feel
      ctx.fillStyle = '#080b12';
      ctx.fillRect(0, 0, W, H);

      // Dot grid
      ctx.fillStyle = '#10141e';
      for (let gx = 6; gx < W; gx += 12)
        for (let gy = 6; gy < FLOOR; gy += 12)
          ctx.fillRect(gx, gy, 1, 1);

      // Ambient glow behind characters
      if (!isGenerating) {
        const gradient = ctx.createRadialGradient(W / 2, FLOOR - 30, 10, W / 2, FLOOR - 30, 80);
        gradient.addColorStop(0, 'rgba(217, 119, 87, 0.06)');
        gradient.addColorStop(1, 'rgba(217, 119, 87, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
      }

      // Floor
      ctx.fillStyle = '#0e1220';
      ctx.fillRect(0, FLOOR, W, H - FLOOR);
      // Floor highlight tiles
      for (let x = 0; x < W; x += 10) {
        ctx.fillStyle = x % 20 === 0 ? '#151b30' : '#121828';
        ctx.fillRect(x, FLOOR, 5, 2);
      }
      // Floor edge line
      ctx.fillStyle = '#1a2240';
      ctx.fillRect(0, FLOOR, W, 1);
    }

    // Rope/leash line between characters
    if (scene === 'leash') {
      const lW = Math.max(...cfg.left.map(r => r.length)) * S;
      const rW = Math.max(...cfg.right.map(r => r.length)) * S;
      const lx = cfg.gap + lW - 2 * S;
      const rx = W - cfg.gap - rW + 2 * S;
      const ry = FLOOR - cfg.right.length * S + 9 * S;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ry);
      const sag = 10 + Math.sin(t * 0.002) * 4;
      ctx.quadraticCurveTo((lx + rx) / 2, ry + sag, rx, ry);
      ctx.stroke();
    }

    // Character animation
    const spd = cfg.speed;
    const leftBob = isGenerating
      ? Math.sin(t * 0.018) * 4
      : Math.sin(t * 0.002 * spd) * 2;
    const rightBob = isGenerating
      ? Math.sin(t * 0.018 + Math.PI) * 4
      : Math.sin(t * 0.002 * spd + 2) * 2;

    // Pick sprite (alternate for punishment)
    let leftSpr = cfg.left;
    if (cfg.leftAlt && !isGenerating) {
      const frame = Math.floor(t / 500) % 2;
      leftSpr = frame === 0 ? cfg.left : cfg.leftAlt;
    }

    const lH = leftSpr.length * S;
    const rH = cfg.right.length * S;
    const rSprW = Math.max(...cfg.right.map(r => r.length)) * S;

    // Draw left fox (faces right)
    drawSprite(ctx, leftSpr, cfg.gap, FLOOR - lH + leftBob);

    // Draw right fox (flipped to face left)
    drawSprite(ctx, cfg.right, W - cfg.gap - rSprW, FLOOR - rH + rightBob, true);

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
      for (let i = 0; i < 7; i++) {
        const sx = cx - 60 + Math.sin(t * 0.011 + i * 1.1) * 60;
        const sy = 30 + Math.cos(t * 0.008 + i * 0.9) * 25;
        ctx.fillStyle = i % 3 === 0 ? '#d97757' : i % 3 === 1 ? '#22d3ee' : '#c084fc';
        ctx.globalAlpha = 0.5 + Math.sin(t * 0.02 + i) * 0.4;
        ctx.fillRect(Math.round(sx), Math.round(sy), 3, 3);
      }
      ctx.globalAlpha = 1;
    }

    // Blush marks at high heat
    if (heatLevel >= 4 && !isGenerating) {
      ctx.globalAlpha = 0.5 + Math.sin(t * 0.003) * 0.2;
      ctx.fillStyle = '#fb7185';
      // Left fox blush
      const lx = cfg.gap;
      const ly = FLOOR - lH + leftBob;
      ctx.fillRect(lx + 2 * S, ly + 5 * S, S, S);
      ctx.fillRect(lx + 2 * S, ly + 6 * S, S, S);
      ctx.fillRect(lx + 11 * S, ly + 5 * S, S, S);
      ctx.fillRect(lx + 11 * S, ly + 6 * S, S, S);
      // Right fox blush
      const rx2 = W - cfg.gap - rSprW;
      const ry2 = FLOOR - rH + rightBob;
      ctx.fillRect(rx2 + 2 * S, ry2 + 5 * S, S, S);
      ctx.fillRect(rx2 + 2 * S, ry2 + 6 * S, S, S);
      ctx.fillRect(rx2 + 11 * S, ry2 + 5 * S, S, S);
      ctx.fillRect(rx2 + 11 * S, ry2 + 6 * S, S, S);
      ctx.globalAlpha = 1;
    }

    // Heat level 5: extra sweat drops
    if (heatLevel >= 5 && !isGenerating) {
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = 0.4 + Math.sin(t * 0.005) * 0.3;
      const dropY = Math.abs(((t * 0.03) % 30) - 15);
      // Left fox sweat
      ctx.fillRect(cfg.gap + 13 * S, FLOOR - lH + leftBob + 3 * S + dropY * 0.3, 2, 3);
      // Right fox sweat
      ctx.fillRect(W - cfg.gap - rSprW + 1 * S, FLOOR - rH + rightBob + 3 * S + dropY * 0.3, 2, 3);
      ctx.globalAlpha = 1;
    }

  }, [isGenerating, game, heatLevel, transparent]);

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
      <div className="relative rounded-xl overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(217,119,87,0.1), 0 0 2px rgba(217,119,87,0.25)' }}>
        {/* CRT scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)' }} />
        <canvas ref={canvasRef} width={W} height={H}
          style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }} />
      </div>
      <div className="mt-2 bg-[#0a0d14]/90 border border-white/[0.06] rounded-lg px-4 py-2.5 flex items-center gap-2">
        <span className="text-[#d97757]/60 text-xs shrink-0 animate-blink" style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '8px' }}>&#9654;</span>
        <span className="text-gray-400 text-xs italic tracking-wide truncate">{dialogue}</span>
      </div>
    </div>
  );
}
