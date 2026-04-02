'use client';
import { useEffect, useRef, useCallback } from 'react';
import { detectFoxImage, FOX_IMAGES } from './FoxImage';
import { useLanguage } from '../context/LanguageContext';

// Particle shapes
const HEART: [number, number][] = [
  [1,0],[2,0],[4,0],[5,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],
  [2,4],[3,4],[4,4],
  [3,5],
];

const STAR: [number, number][] = [
  [2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4],
];

const FLAME: [number, number][] = [
  [2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[1,4],[2,4],[3,4],[2,5],
];

const CHAIN: [number, number][] = [
  [1,0],[2,0],[0,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[3,3],[1,4],[2,4],
];

type SceneKey = 'idle' | 'bondage' | 'blindfold' | 'punishment' | 'tease' | 'dare' | 'worship' | 'leash' | 'massage' | 'dice' | 'cards' | 'interrogation' | 'aftercare' | 'ice' | 'servant' | 'default';

function detectScene(game: any): SceneKey {
  if (!game) return 'idle';
  const t = JSON.stringify(game).toLowerCase();
  if (t.includes('massage') || t.includes('candle') || t.includes('kerze') || t.includes('wax') || t.includes('wachs')) return 'massage';
  if (t.includes('ice') || t.includes('temperatur') || t.includes('eis') || t.includes('kalt')) return 'ice';
  if (t.includes('interrogat') || t.includes('detective') || t.includes('verhör') || t.includes('spy')) return 'interrogation';
  if (t.includes('maid') || t.includes('butler') || t.includes('servant') || t.includes('dien') || t.includes('bedien')) return 'servant';
  if (t.includes('cuddle') || t.includes('aftercare') || t.includes('kuschel') || t.includes('nachsorge')) return 'aftercare';
  if (t.includes('dice') || t.includes('würfel') || t.includes('board') || t.includes('brett')) return 'dice';
  if (t.includes('card') || t.includes('poker') || t.includes('karte') || t.includes('strip') || t.includes('bet') || t.includes('wette')) return 'cards';
  if (t.includes('blindfold') || t.includes('sensory deprivation') || t.includes('augenbinde')) return 'blindfold';
  if (t.includes('tied') || t.includes('rope') || t.includes('restrain') || t.includes('bond') || t.includes('cuff') || t.includes('fesseln')) return 'bondage';
  if (t.includes('leash') || t.includes('collar') || t.includes('pet') || t.includes('leine') || t.includes('halsband')) return 'leash';
  if (t.includes('punish') || t.includes('spank') || t.includes('paddle') || t.includes('strafe') || t.includes('bestraf')) return 'punishment';
  if (t.includes('tease') || t.includes('denial') || t.includes('edge') || t.includes('necken')) return 'tease';
  if (t.includes('truth') || t.includes('dare') || t.includes('wahrheit') || t.includes('pflicht')) return 'dare';
  if (t.includes('worship') || t.includes('kneel') || t.includes('submit') || t.includes('knien') || t.includes('gehorchen')) return 'worship';
  return 'default';
}

function getParticleConfig(scene: SceneKey): { shape: [number, number][]; color: string } {
  switch (scene) {
    case 'bondage': return { shape: CHAIN, color: '#94a3b8' };
    case 'blindfold': return { shape: STAR, color: '#fbbf24' };
    case 'punishment': return { shape: FLAME, color: '#f87171' };
    case 'tease': return { shape: HEART, color: '#ef4444' };
    case 'dare': return { shape: STAR, color: '#c084fc' };
    case 'worship': case 'leash': return { shape: HEART, color: '#ec4899' };
    case 'massage': case 'aftercare': return { shape: HEART, color: '#f9a8d4' };
    case 'dice': case 'cards': return { shape: STAR, color: '#c084fc' };
    case 'interrogation': return { shape: STAR, color: '#94a3b8' };
    case 'ice': return { shape: STAR, color: '#38bdf8' };
    case 'servant': return { shape: HEART, color: '#fbbf24' };
    default: return { shape: HEART, color: '#ef4444' };
  }
}

const DIALOGUES: Record<string, Record<SceneKey | 'generating', string>> = {
  de: {
    bondage: 'Gefesselt und kein Entkommen...',
    blindfold: 'Nichts sehen, aber alles spüren...',
    punishment: 'Jemand war ungezogen...',
    tease: 'Geduld ist eine Tugend... oder?',
    dare: 'Wahrheit oder Pflicht? Wähle weise.',
    worship: 'Auf die Knie.',
    leash: 'Braves Haustier.',
    massage: 'Entspann dich... ich übernehme.',
    dice: 'Lass die Würfel entscheiden...',
    cards: 'Wer verliert, zieht aus.',
    interrogation: 'Gesteh alles...',
    aftercare: 'Komm her, ich halt dich fest.',
    ice: 'Spürst du das? Heiß und kalt...',
    servant: 'Zu Diensten, mein Herr.',
    default: 'Spiel läuft.',
    idle: 'Bereit wenn du es bist...',
    generating: 'Deine Szene wird erstellt...',
  },
  en: {
    bondage: 'Tied up and nowhere to go...',
    blindfold: "Can't see, but can feel everything...",
    punishment: "Someone's been naughty...",
    tease: 'Patience is a virtue... right?',
    dare: 'Truth or dare? Choose wisely.',
    worship: 'On your knees.',
    leash: 'Good pet.',
    massage: 'Relax... I got you.',
    dice: 'Let the dice decide...',
    cards: 'Loser strips.',
    interrogation: 'Confess everything...',
    aftercare: 'Come here, I got you.',
    ice: 'Feel that? Hot and cold...',
    servant: 'At your service.',
    default: 'Game on.',
    idle: 'Ready when you are...',
    generating: 'Creating your scene...',
  },
};

function getDialogue(scene: SceneKey, lang: string, title?: string): string {
  const d = title ? `"${title.length > 36 ? title.slice(0, 34) + '...' : title}"` : '';
  const dict = DIALOGUES[lang] || DIALOGUES.en;
  return d || dict[scene] || dict.idle;
}

type Particle = { x: number; y: number; opacity: number; speed: number; size: number; drift: number };

const CW = 360;
const CH = 60;

type Props = {
  isGenerating: boolean;
  game: any;
  heatLevel: number;
};

export default function FoxDisplay({ isGenerating, game, heatLevel }: Props) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const lastTs = useRef(0);
  const particles = useRef<Particle[]>([]);
  const prevScene = useRef<SceneKey>('idle');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoaded = useRef(false);
  const currentSrc = useRef('');

  const scene = isGenerating ? 'idle' : detectScene(game);
  const foxKey = isGenerating ? 'default' : detectFoxImage(game);
  const foxSrc = FOX_IMAGES[foxKey];
  const dialogue = isGenerating ? getDialogue('generating' as SceneKey, language) : getDialogue(scene, language, game?.title);

  // Load fox image
  useEffect(() => {
    if (foxSrc === currentSrc.current && imgLoaded.current) return;
    currentSrc.current = foxSrc;
    imgLoaded.current = false;
    const img = new Image();
    img.onload = () => { imgRef.current = img; imgLoaded.current = true; };
    img.src = foxSrc;
  }, [foxSrc]);

  const spawnParticle = useCallback((): Particle => ({
    x: CW * 0.2 + Math.random() * CW * 0.6,
    y: CH + 5,
    opacity: 0,
    speed: 0.3 + Math.random() * 0.5,
    size: Math.random() < 0.3 ? 2 : 1,
    drift: (Math.random() - 0.5) * 0.4,
  }), []);

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scene = isGenerating ? 'idle' : detectScene(game);
    const pcfg = getParticleConfig(scene);

    if (scene !== prevScene.current) {
      const count = Math.max(4, heatLevel + 2);
      particles.current = Array.from({ length: count }, () => spawnParticle());
      prevScene.current = scene;
    }

    ctx.clearRect(0, 0, CW, CH);

    // Draw floating particles
    particles.current.forEach(p => {
      p.y -= p.speed * 0.3 * (0.5 + heatLevel * 0.15);
      p.x += p.drift + Math.sin(t * 0.003 + p.x * 0.1) * 0.2;
      p.opacity += 0.012;
      if (p.opacity > 1.4 || p.y < -5) Object.assign(p, spawnParticle());

      const alpha = Math.min(1, p.opacity) * (1 - Math.max(0, (p.opacity - 1) / 0.4));
      if (alpha < 0.02) return;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = pcfg.color;
      pcfg.shape.forEach(([sx, sy]) => {
        ctx.fillRect(p.x + sx * p.size, p.y + sy * p.size, p.size, p.size);
      });
      ctx.globalAlpha = 1;
    });

    // Generating sparkles
    if (isGenerating) {
      const cx = CW / 2;
      for (let i = 0; i < 5; i++) {
        const sx = cx - 40 + Math.sin(t * 0.011 + i * 1.3) * 50;
        const sy = 15 + Math.cos(t * 0.009 + i * 0.9) * 15;
        ctx.fillStyle = i % 3 === 0 ? '#d97757' : i % 3 === 1 ? '#22d3ee' : '#c084fc';
        ctx.globalAlpha = 0.5 + Math.sin(t * 0.02 + i) * 0.4;
        ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }, [isGenerating, game, heatLevel, spawnParticle]);

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

  return (
    <div className="w-full relative select-none">
      <div className="relative rounded-xl overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(217,119,87,0.08), 0 0 1px rgba(217,119,87,0.2)' }}>

        {/* Fox character image — contained within border box */}
        <div className="relative w-full flex items-center justify-center" style={{ maxHeight: '160px', overflow: 'hidden' }}>
          <img
            src={foxSrc}
            alt=""
            width={512}
            height={492}
            className="w-auto h-full object-contain"
            style={{ maxHeight: '160px' }}
          />
        </div>

        {/* Particle canvas overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <canvas ref={canvasRef} width={CW} height={CH}
            style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }} />
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.025]"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 3px)' }} />
      </div>

      {/* Dialogue bar */}
      <div className="mt-2 bg-[#0a0d14]/90 border border-white/[0.06] rounded-lg px-4 py-2.5 flex items-center gap-2">
        <span className="text-[#d97757]/60 text-xs shrink-0 animate-blink" style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '8px' }}>&#9654;</span>
        <span className="text-gray-400 text-xs italic tracking-wide truncate">{dialogue}</span>
      </div>
    </div>
  );
}
