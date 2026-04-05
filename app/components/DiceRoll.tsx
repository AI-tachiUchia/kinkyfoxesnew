"use client";

import { useState, useEffect } from "react";

type DiceRollProps = {
  label: string;
  options: string[];
  id?: string; // for sync across partners
};

export default function DiceRoll({ label, options, id }: DiceRollProps) {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);

  const handleRoll = () => {
    if (isRolling || options.length === 0) return;
    setIsRolling(true);
    setResult(null);

    // Quick shuffle animation — cycle through options rapidly
    let ticks = 0;
    const maxTicks = 12 + Math.floor(Math.random() * 6); // 12-17 ticks
    const interval = setInterval(() => {
      setDisplayIdx(Math.floor(Math.random() * options.length));
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * options.length);
        setDisplayIdx(finalIdx);
        setResult(finalIdx);
        setIsRolling(false);
      }
    }, 80 + ticks * 8); // starts fast, slows down slightly
  };

  const handleReset = () => {
    setResult(null);
    setDisplayIdx(0);
  };

  if (options.length === 0) return null;

  return (
    <div className="my-4 bg-[#181c22] border border-white/[0.1] rounded-xl overflow-hidden">
      {/* Label */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm text-gray-300 font-medium">{label}</p>
        <p className="text-[10px] text-gray-600 mt-0.5">
          {options.length} {options.length === 1 ? 'Option' : 'Optionen'}
        </p>
      </div>

      {/* Roll area */}
      <div className="px-4 pb-4">
        {result === null && !isRolling ? (
          /* Not rolled yet — show button */
          <button
            onClick={handleRoll}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#d97757]/20 to-[#d97757]/10 hover:from-[#d97757]/30 hover:to-[#d97757]/20 border border-[#d97757]/30 hover:border-[#d97757]/50 text-[#d97757] rounded-xl py-4 px-6 transition-all group"
            style={{ boxShadow: '0 2px 12px rgba(217,119,87,0.1)' }}
          >
            <span className="text-2xl group-hover:animate-bounce">🎲</span>
            <span className="text-sm font-semibold tracking-wide uppercase">Würfeln</span>
          </button>
        ) : isRolling ? (
          /* Rolling animation */
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-3xl animate-spin">🎲</div>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-5 py-3 min-h-[48px] flex items-center justify-center w-full">
              <p className="text-sm text-gray-400 text-center animate-pulse font-medium">
                {options[displayIdx]}
              </p>
            </div>
          </div>
        ) : result !== null ? (
          /* Result revealed */
          <div className="space-y-3">
            <div 
              className="bg-[#d97757]/10 border border-[#d97757]/30 rounded-xl px-5 py-4 flex items-start gap-3 animate-fade-in"
              style={{ boxShadow: '0 2px 16px rgba(217,119,87,0.15)' }}
            >
              <span className="text-xl mt-0.5">🎯</span>
              <p className="text-[15px] text-gray-200 leading-relaxed font-medium">
                {options[result]}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-[10px] text-gray-600 hover:text-gray-400 tracking-widest uppercase transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Nochmal würfeln
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Parse dice roll blocks from markdown content.
 * Format in AI output:
 * :::dice{label="Pick a punishment..."}
 * - Option A
 * - Option B
 * - Option C
 * :::
 * 
 * Returns { before, diceRolls: [{label, options}], segments }
 */
export function parseDiceRolls(content: string): { 
  segments: Array<{ type: 'text'; content: string } | { type: 'dice'; label: string; options: string[] }> 
} {
  const diceRegex = /:::dice\{label="([^"]*?)"\}\n([\s\S]*?):::/g;
  const segments: Array<{ type: 'text'; content: string } | { type: 'dice'; label: string; options: string[] }> = [];
  
  let lastIndex = 0;
  let match;

  while ((match = diceRegex.exec(content)) !== null) {
    // Add text before this dice block
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    const label = match[1];
    const optionsRaw = match[2].trim();
    const options = optionsRaw
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0);

    if (options.length > 0) {
      segments.push({ type: 'dice', label, options });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last dice block
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim();
    if (remaining) {
      segments.push({ type: 'text', content: remaining });
    }
  }

  // If no dice blocks found, return whole content as text
  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return { segments };
}

/** Check if content contains any dice roll blocks */
export function hasDiceRolls(content: string): boolean {
  return /:::dice\{label="[^"]*?"\}/.test(content);
}
