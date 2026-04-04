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

type SceneKey = 'idle' | 'bondage' | 'blindfold' | 'punishment' | 'tease' | 'dare' | 'worship' | 'leash' | 'massage' | 'dice' | 'cards' | 'interrogation' | 'aftercare' | 'ice' | 'servant' | 'nurse' | 'pirate' | 'selfie' | 'yoga' | 'chef' | 'vampire' | 'dance' | 'whisper' | 'throne' | 'pillow_fight' | 'default';

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
  if (t.includes('nurse') || t.includes('doctor') || t.includes('medical') || t.includes('arzt') || t.includes('krankenschwester')) return 'nurse';
  if (t.includes('pirate') || t.includes('captain') || t.includes('pirat') || t.includes('kapitän')) return 'pirate';
  if (t.includes('selfie') || t.includes('photo') || t.includes('foto') || t.includes('camera')) return 'selfie';
  if (t.includes('yoga') || t.includes('stretch') || t.includes('dehn') || t.includes('exercise')) return 'yoga';
  if (t.includes('cook') || t.includes('chef') || t.includes('kitchen') || t.includes('koch') || t.includes('küche')) return 'chef';
  if (t.includes('vampire') || t.includes('vampir') || t.includes('gothic') || t.includes('halloween')) return 'vampire';
  if (t.includes('dance') || t.includes('tango') || t.includes('waltz') || t.includes('tanz')) return 'dance';
  if (t.includes('whisper') || t.includes('secret') || t.includes('flüster') || t.includes('geheimnis') || t.includes('confess')) return 'whisper';
  if (t.includes('throne') || t.includes('king') || t.includes('queen') || t.includes('royal') || t.includes('könig') || t.includes('krone')) return 'throne';
  if (t.includes('pillow') || t.includes('kissen') || t.includes('pajama') || t.includes('pyjama') || t.includes('sleepover')) return 'pillow_fight';
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
    case 'nurse': return { shape: HEART, color: '#f9a8d4' };
    case 'pirate': return { shape: STAR, color: '#fbbf24' };
    case 'selfie': return { shape: STAR, color: '#c084fc' };
    case 'yoga': return { shape: STAR, color: '#86efac' };
    case 'chef': return { shape: HEART, color: '#f87171' };
    case 'vampire': return { shape: FLAME, color: '#7c3aed' };
    case 'dance': return { shape: HEART, color: '#ec4899' };
    case 'whisper': return { shape: HEART, color: '#f9a8d4' };
    case 'throne': return { shape: STAR, color: '#fbbf24' };
    case 'pillow_fight': return { shape: STAR, color: '#e2e8f0' };
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
    nurse: 'Der Doktor sieht dich jetzt...',
    pirate: 'Arrr, Beute gefunden!',
    selfie: 'Sag Cheese... oder Foxie!',
    yoga: 'Atme tief ein...',
    chef: 'Das Geheimrezept? Liebe.',
    vampire: 'Zeig mir deinen Hals...',
    dance: 'Darf ich bitten?',
    whisper: 'Psst... komm näher.',
    throne: 'Verneige dich vor mir.',
    pillow_fight: 'Kissenschlacht!',
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
    nurse: 'The doctor will see you now...',
    pirate: 'Arrr, treasure found!',
    selfie: 'Say cheese... or foxie!',
    yoga: 'Breathe in deeply...',
    chef: 'The secret ingredient? Love.',
    vampire: 'Show me your neck...',
    dance: 'May I have this dance?',
    whisper: 'Psst... come closer.',
    throne: 'Bow before me.',
    pillow_fight: 'Pillow fight!',
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
      {/* Fox character image — floating, no bounding box */}
      <div className="relative w-full flex items-center justify-center" style={{ maxHeight: '180px', overflow: 'hidden' }}>
        <img
          src={foxSrc}
          alt=""
          width={512}
          height={492}
          className="w-auto h-full object-contain drop-shadow-[0_8px_24px_rgba(217,119,87,0.12)]"
          style={{ maxHeight: '180px' }}
        />

        {/* Particle canvas overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <canvas ref={canvasRef} width={CW} height={CH}
            style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Dialogue text — centered below fox */}
      <p className="mt-3 text-center text-gray-500 text-xs italic tracking-wide">
        <span className="text-[#d97757]/60 mr-1.5 animate-blink" style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '8px' }}>&#9654;</span>
        {dialogue}
      </p>
    </div>
  );
}
