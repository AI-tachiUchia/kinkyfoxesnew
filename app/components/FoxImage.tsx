'use client';
import { useState, useEffect, useRef } from 'react';

type FoxImageKey =
  | 'blindfold' | 'bondage' | 'bdsm_outfit' | 'costume_police' | 'costume_teacher' | 'costume_stewardess' | 'sexy_fotos'
  | 'dice_game' | 'worship' | 'leash' | 'massage' | 'interrogation' | 'tease_denial'
  | 'card_game' | 'aftercare' | 'ice_play' | 'servant'
  | 'nurse' | 'pirate' | 'selfie' | 'yoga' | 'chef' | 'vampire' | 'dance' | 'whisper' | 'throne' | 'pillow_fight'
  | 'heavy_bondage' | 'suspension' | 'collar_crawl' | 'wax_play' | 'spanking'
  | 'default';

const FOX_IMAGES: Record<FoxImageKey, string> = {
  blindfold: '/fox-assets/Game-Related/fox_bondage_2_blindfold.png',
  bondage: '/fox-assets/Game-Related/fox_bondage_shibari_rope.png',
  bdsm_outfit: '/fox-assets/Game-Related/Fox_Both_BDSM_Skirt1.jpg',
  costume_police: '/fox-assets/Game-Related/fox_costume_2_police.png',
  costume_teacher: '/fox-assets/Game-Related/fox_costume_3_teacher.png',
  costume_stewardess: '/fox-assets/Game-Related/fox-assets-approved/fox_costume_stewardess_newSubmissive.png',
  sexy_fotos: '/fox-assets/Game-Related/fox-assets-approved/fox_photographing_posing_female_fox_spicy_clothes_sub_female_dom_male.png',
  dice_game: '/fox-assets/Game-Related/fox_dice_game.png',
  worship: '/fox-assets/Game-Related/fox-assets-approved/fox_worship_kneel_rehaul_sub_male_dom_female.png',
  leash: '/fox-assets/Game-Related/fox_leash_petplay.png',
  massage: '/fox-assets/Game-Related/fox_massage_sensory.png',
  interrogation: '/fox-assets/Game-Related/fox_interrogation.png',
  tease_denial: '/fox-assets/Game-Related/fox_tease_denial.png',
  card_game: '/fox-assets/Game-Related/fox_card_game.png',
  aftercare: '/fox-assets/Game-Related/fox_aftercare_cuddle.png',
  ice_play: '/fox-assets/Game-Related/fox_ice_temperature.png',
  servant: '/fox-assets/Game-Related/fox_servant_master.png',
  nurse: '/fox-assets/Game-Related/fox-assets-approved/fox_nurse_sub_male_female_dom_roleplay.jpeg',
  pirate: '/fox-assets/Game-Related/fox_pirate_captive.png',
  selfie: '/fox-assets/Game-Related/fox-assets-approved/fox_famela_sending_spicy_photo_selfie.jpeg',
  spanking: '/fox-assets/Game-Related/fox-assets-approved/fox_spanking_punishment_for_sub_teacher_roleplay.png',
  yoga: '/fox-assets/Game-Related/fox_yoga_stretch.png',
  chef: '/fox-assets/Game-Related/fox_chef_cooking.png',
  vampire: '/fox-assets/Game-Related/fox_vampire_bite.png',
  dance: '/fox-assets/Game-Related/fox_dance_tango.png',
  whisper: '/fox-assets/Game-Related/fox_whisper_secret.png',
  throne: '/fox-assets/Game-Related/fox_throne_royal.png',
  pillow_fight: '/fox-assets/Game-Related/fox_pillow_fight.png',
  heavy_bondage: '/fox-assets/Game-Related/fox_pixel_heavy_bondage.png',
  suspension: '/fox-assets/Game-Related/fox_pixel_suspension.png',
  collar_crawl: '/fox-assets/Game-Related/fox_pixel_collar_crawl.png',
  wax_play: '/fox-assets/Game-Related/fox_pixel_wax_play.png',
  default: '/fox-assets/fox_normal_look.png',
};

function detectFoxImage(game: any): FoxImageKey {
  if (!game) return 'default';
  const t = JSON.stringify(game).toLowerCase();

  // Specific scenarios first (most specific matches)
  if (t.includes('blindfold') || t.includes('augenbinde'))
    return 'blindfold';
  if (t.includes('wax') || t.includes('wachs') || t.includes('candle') || t.includes('kerze'))
    return 'wax_play';
  if (t.includes('massage') || t.includes('sensory') || t.includes('sinne'))
    return 'massage';
  if (t.includes('ice') || t.includes('temperature') || t.includes('eis') || t.includes('temperatur') || t.includes('cold') || t.includes('kalt') || t.includes('hot') || t.includes('heiß'))
    return 'ice_play';
  if (t.includes('interrogat') || t.includes('detective') || t.includes('verhör') || t.includes('detektiv') || t.includes('spy') || t.includes('spion'))
    return 'interrogation';
  if (t.includes('maid') || t.includes('butler') || t.includes('servant') || t.includes('serve') || t.includes('dien') || t.includes('bedien') || t.includes('magd'))
    return 'servant';
  if (t.includes('cuddle') || t.includes('aftercare') || t.includes('kuschel') || t.includes('nachsorge') || t.includes('cozy') || t.includes('gemütlich'))
    return 'aftercare';
  if (t.includes('crawl') || t.includes('kriechen') || t.includes('all fours') || t.includes('allen vieren'))
    return 'collar_crawl';
  if (t.includes('leash') || t.includes('collar') || t.includes('pet') || t.includes('leine') || t.includes('halsband') || t.includes('haustier'))
    return 'leash';
  if (t.includes('worship') || t.includes('kneel') || t.includes('knien') || t.includes('submit') || t.includes('unterwer') || t.includes('devotion') || t.includes('hingabe'))
    return 'worship';
  if (t.includes('suspen') || t.includes('aerial') || t.includes('hänge') || t.includes('aufhäng') || t.includes('swing') || t.includes('schaukel'))
    return 'suspension';
  if (t.includes('shibari') || t.includes('kinbaku') || t.includes('heavy bond') || t.includes('elaborate rope') || t.includes('kunstfesseln'))
    return 'heavy_bondage';
  if (t.includes('rope') || t.includes('tied') || t.includes('bond') || t.includes('restrain') || t.includes('cuff') || t.includes('fesseln') || t.includes('seil'))
    return 'bondage';
  if (t.includes('latex') || t.includes('bdsm') || t.includes('leather skirt') || t.includes('lederjupe') || t.includes('outfit') || t.includes('harness') || t.includes('geschirr'))
    return 'bdsm_outfit';
  if (t.includes('dice') || t.includes('würfel') || t.includes('roll') || t.includes('board') || t.includes('brett'))
    return 'dice_game';
  if (t.includes('card') || t.includes('poker') || t.includes('karte') || t.includes('strip') || t.includes('bet') || t.includes('wette'))
    return 'card_game';
  if (t.includes('tease') || t.includes('denial') || t.includes('edge') || t.includes('feather') || t.includes('tickle') || t.includes('necken') || t.includes('feder') || t.includes('kitzel'))
    return 'tease_denial';
  if (t.includes('spank') || t.includes('spanking') || t.includes('bestrafen') || t.includes('klatschen') || t.includes('punishment') || t.includes('strafe'))
    return 'spanking';
  if (t.includes('police') || t.includes('officer') || t.includes('arrest') || t.includes('polizei') || t.includes('verhaft'))
    return 'costume_police';
  if (t.includes('teacher') || t.includes('lesson') || t.includes('lehrer') || t.includes('unterricht') || t.includes('school') || t.includes('schul'))
    return 'costume_teacher';
  if (t.includes('stewardess') || t.includes('flight') || t.includes('pilot') || t.includes('flug') || t.includes('travel') || t.includes('reise'))
    return 'costume_stewardess';
  if (t.includes('nurse') || t.includes('doctor') || t.includes('medical') || t.includes('krankenschwester') || t.includes('arzt') || t.includes('medizin'))
    return 'nurse';
  if (t.includes('pirate') || t.includes('captain') || t.includes('pirat') || t.includes('kapitän') || t.includes('treasure') || t.includes('schatz'))
    return 'pirate';
  if (t.includes('photo') || t.includes('selfie') || t.includes('foto') || t.includes('camera') || t.includes('kamera') || t.includes('pose'))
    return 'selfie';
  if (t.includes('yoga') || t.includes('stretch') || t.includes('flexib') || t.includes('dehn') || t.includes('exercise') || t.includes('übung'))
    return 'yoga';
  if (t.includes('cook') || t.includes('chef') || t.includes('kitchen') || t.includes('koch') || t.includes('küche') || t.includes('food') || t.includes('essen'))
    return 'chef';
  if (t.includes('vampire') || t.includes('vampir') || t.includes('bite') || t.includes('gothic') || t.includes('halloween') || t.includes('biss') || t.includes('dracula'))
    return 'vampire';
  if (t.includes('dance') || t.includes('tango') || t.includes('waltz') || t.includes('tanz') || t.includes('walzer') || t.includes('ball'))
    return 'dance';
  if (t.includes('whisper') || t.includes('secret') || t.includes('flüster') || t.includes('geheimnis') || t.includes('confess') || t.includes('geständnis'))
    return 'whisper';
  if (t.includes('throne') || t.includes('king') || t.includes('queen') || t.includes('royal') || t.includes('thron') || t.includes('könig') || t.includes('königin') || t.includes('crown') || t.includes('krone'))
    return 'throne';
  if (t.includes('pillow') || t.includes('kissen') || t.includes('pajama') || t.includes('pyjama') || t.includes('sleepover') || t.includes('slumber'))
    return 'pillow_fight';
  if (t.includes('dare') || t.includes('truth') || t.includes('wahrheit') || t.includes('pflicht'))
    return 'sexy_fotos';

  // Fallback: hash-based selection from all available images
  const hash = t.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const allKeys: FoxImageKey[] = [
    'bdsm_outfit', 'costume_police', 'costume_teacher', 'costume_stewardess', 'sexy_fotos',
    'dice_game', 'worship', 'leash', 'massage', 'interrogation', 'tease_denial',
    'card_game', 'aftercare', 'ice_play', 'servant',
    'nurse', 'pirate', 'selfie', 'yoga', 'chef', 'vampire', 'dance', 'whisper', 'throne', 'pillow_fight',
    'heavy_bondage', 'suspension', 'collar_crawl', 'wax_play', 'spanking',
  ];
  return allKeys[hash % allKeys.length];
}

type Props = {
  game: any;
  className?: string;
  overlay?: React.ReactNode;
};

export default function FoxImage({ game, className = '', overlay }: Props) {
  const key = detectFoxImage(game);
  const src = FOX_IMAGES[key];
  const isPixelArt = src.includes('fox_pixel_');
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
        <img src={prevSrc} alt="" width={512} height={492} className={`absolute inset-0 w-full h-full transition-opacity duration-700 opacity-40 ${prevSrc.includes('fox_pixel_') ? 'object-contain object-bottom p-4' : 'object-cover object-center'}`} />
      )}

      {/* Main fox image */}
      <img
        src={currentSrc}
        alt=""
        width={512}
        height={492}
        onLoad={handleLoad}
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
        } ${isPixelArt ? 'object-contain object-bottom p-4' : 'object-cover object-center'}`}
        style={{
          maskImage: isPixelArt ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)',
          WebkitMaskImage: isPixelArt ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)'
        }}
      />

      {/* Bottom fade — blends into card bg */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 z-10 bg-gradient-to-t from-[#1a1d23] via-[#1a1d23]/60 to-transparent" />

      {/* Top subtle fade */}
      <div className="absolute inset-x-0 top-0 h-12 z-10 bg-gradient-to-b from-[#1a1d23]/50 to-transparent" />

      {/* Side vignettes (stronger for non-pixel art to hide square edges) */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-700 ${isPixelArt ? 'opacity-50' : 'opacity-100'}`}
        style={{ boxShadow: isPixelArt ? 'inset 0 0 60px 20px rgba(26,29,35,0.5)' : 'inset 0 0 100px 45px #16181e' }} />

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
