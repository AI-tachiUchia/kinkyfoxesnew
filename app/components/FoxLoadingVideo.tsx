'use client';
import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const VIDEO_SRC = '/fox-assets/Game-Related/Video_Animation_Request_and_Generation.mp4';

const TIPS: Record<string, string[]> = {
  de: [
    'Die Füchse schnüren schon die Seile...',
    'Irgendjemand wird heute Abend büßen...',
    'Das Regelwerk für Ungehorsam wird verfasst...',
    'Wir fragen kurz das Universum um Erlaubnis... abgelehnt.',
    'Die Rollen werden verteilt — wer gewinnt, entscheidet sich gleich.',
    'Safewort wird festgelegt. Vorsorglich.',
    'Etwas Böses braut sich zusammen...',
    'Der Fuchs reibt sich die Pfoten...',
    'Verbotene Ideen werden sorgfältig geprüft und trotzdem genommen.',
    'Das Spiel kennt kein Erbarmen. Nur Spaß.',
    'Wer zuletzt lacht, hat offenbar die Regeln nicht gelesen.',
    'Das Knisterband wird vorbereitet...',
    'Mehr Eskalation. Immer mehr Eskalation.',
    'Fünf-Sekunden-Countdown bis zur Schamlosigkeit...',
    'Der Fuchs hat definitiv zu viele Bücher gelesen.',
  ],
  en: [
    'The fox is getting into character...',
    'Selecting the finest scenarios...',
    'Warming up the imagination...',
    'Consulting the book of mischief...',
    'Tying up loose ends... literally.',
    'Shuffling the naughty deck...',
    'Fox is putting on the outfit...',
    'Almost ready to play...',
    'Choosing the perfect vibe...',
    'Setting the mood lighting...',
  ],
};

export default function FoxLoadingVideo() {
  const { language } = useLanguage();
  const tips = TIPS[language] || TIPS.en;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));
  const [fade, setFade] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % tips.length);
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto">
      {/* Dual pulsing glow */}
      <div className="absolute -inset-12 pointer-events-none">
        <div className="absolute inset-0 bg-[#d97757]/10 rounded-full blur-[100px] pulse-glow" />
        <div className="absolute inset-4 bg-[#c06040]/8 rounded-full blur-[60px] pulse-glow" style={{ animationDelay: '-1.2s' }} />
      </div>

      {/* Video card */}
      <div className={`relative w-full rounded-2xl overflow-hidden transition-all duration-1000 ${videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ boxShadow: '0 4px 60px rgba(217,119,87,0.12), 0 0 1px rgba(217,119,87,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px z-20 shimmer" style={{
          background: 'linear-gradient(90deg, transparent, rgba(217,119,87,0.4), transparent)',
        }} />

        <video
          ref={videoRef}
          src={VIDEO_SRC}
          loop
          muted
          playsInline
          onCanPlay={() => setVideoReady(true)}
          className="w-full block"
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-24 z-10 bg-gradient-to-t from-[#121418] via-[#121418]/80 to-transparent" />

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,1) 3px, rgba(0,0,0,1) 4px)' }} />
      </div>

      {/* Text area below video */}
      <div className="relative z-10 w-full mt-6 space-y-5">
        {/* Tip text */}
        <p className={`text-center text-[15px] font-serif text-gray-300/90 font-light italic transition-all duration-500 ${
          fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`} style={{ minHeight: '1.5em' }}>
          {tips[tipIndex]}
        </p>

        {/* Progress bar */}
        <div className="mx-auto w-48 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#d97757] to-[#e8956e] shimmer"
            style={{ width: `${Math.min(95, elapsed * 8)}%`, transition: 'width 1s ease-out' }} />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#d97757]/70"
              style={{ animation: `bounce 1.4s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
