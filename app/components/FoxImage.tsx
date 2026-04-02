'use client';
import { useState, useEffect, useRef } from 'react';

type FoxImageKey = 'blindfold' | 'bondage' | 'costume_police' | 'costume_teacher' | 'costume_stewardess' | 'sexy_fotos' | 'default';

const FOX_IMAGES: Record<FoxImageKey, string> = {
  blindfold: '/fox-assets/Game-Related/fox_bondage_2_blindfold.png',
  bondage: '/fox-assets/Game-Related/fox_bondage_shibari_rope.png',
  costume_police: '/fox-assets/Game-Related/fox_costume_2_police.png',
  costume_teacher: '/fox-assets/Game-Related/fox_costume_3_teacher.png',
  costume_stewardess: '/fox-assets/Game-Related/fox_costume_stewardess.png',
  sexy_fotos: '/fox-assets/Game-Related/fox_costume_4_sexy_fotos.png',
  default: '/fox-assets/fox_normal_look.png',
};

function detectFoxImage(game: any): FoxImageKey {
  if (!game) return 'default';
  const t = JSON.stringify(game).toLowerCase();

  if (t.includes('blindfold') || t.includes('sensory') || t.includes('augenbinde') || t.includes('sinne'))
    return 'blindfold';
  if (t.includes('rope') || t.includes('tied') || t.includes('bond') || t.includes('restrain') || t.includes('cuff') || t.includes('shibari') || t.includes('fesseln') || t.includes('seil'))
    return 'bondage';
  if (t.includes('police') || t.includes('officer') || t.includes('arrest') || t.includes('polizei') || t.includes('verhaft') || t.includes('punish') || t.includes('spank') || t.includes('bestraf'))
    return 'costume_police';
  if (t.includes('teacher') || t.includes('lesson') || t.includes('lehrer') || t.includes('unterricht') || t.includes('school') || t.includes('schul'))
    return 'costume_teacher';
  if (t.includes('stewardess') || t.includes('flight') || t.includes('pilot') || t.includes('flug') || t.includes('travel') || t.includes('reise'))
    return 'costume_stewardess';
  if (t.includes('tease') || t.includes('photo') || t.includes('foto') || t.includes('strip') || t.includes('dare') || t.includes('truth') || t.includes('necken') || t.includes('wahrheit'))
    return 'sexy_fotos';

  const hash = t.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const extras: FoxImageKey[] = ['costume_police', 'costume_teacher', 'costume_stewardess', 'sexy_fotos'];
  return extras[hash % extras.length];
}

type Props = {
  game: any;
  className?: string;
  overlay?: React.ReactNode;
};

export default function FoxImage({ game, className = '', overlay }: Props) {
  const key = detectFoxImage(game);
  const src = FOX_IMAGES[key];
  const [loaded, setLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc);
      setLoaded(false);
      setCurrentSrc(src);
    }
  }, [src, currentSrc]);

  const handleLoad = () => {
    setLoaded(true);
    setTimeout(() => setPrevSrc(null), 700);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}
      style={{ background: '#16181e' }}>

      {/* Previous image crossfade */}
      {prevSrc && (
        <img src={prevSrc} alt="" width={512} height={492} className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 opacity-40" />
      )}

      {/* Main fox image */}
      <img
        src={currentSrc}
        alt=""
        width={512}
        height={492}
        onLoad={handleLoad}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
        }`}
      />

      {/* Bottom fade — blends into card bg */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 z-10 bg-gradient-to-t from-[#1a1d23] via-[#1a1d23]/60 to-transparent" />

      {/* Top subtle fade */}
      <div className="absolute inset-x-0 top-0 h-12 z-10 bg-gradient-to-b from-[#1a1d23]/50 to-transparent" />

      {/* Side vignettes */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 60px 20px rgba(26,29,35,0.5)' }} />

      {/* Warm ambient glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(217,119,87,0.08) 0%, transparent 70%)' }} />

      {/* Overlay content (pixel scene) */}
      {overlay && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {overlay}
        </div>
      )}

      {/* Film grain texture */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}

export { detectFoxImage, FOX_IMAGES };
