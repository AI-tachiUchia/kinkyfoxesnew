"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../lib/translations";
import FoxImage from "./FoxImage";

export default function GameMasterSetup({
  distance, setDistance,
  customDistance, setCustomDistance,
  heatLevel, setHeatLevel,
  vibe, setVibe,
  template, setTemplate,
  // Toybox
  toys, setToys,
  savedToys, partnerToys,
  selectedToyIds, handleToggleToy, handleDeleteToy,
  newToyName, setNewToyName, handleAddToy, isAddingToy,
  toyItems, handleRemoveToyItem, handleAddToyItem, toysInputRef, toyComment,
  // UI toggles
  showToybox, setShowToybox,
  // Actions
  onGenerate, isGenerating, onSurprise,
  // Safety rails
  hardLimits, setHardLimits,
}: any) {
  const { language } = useLanguage();
  const t = translations[language];
  const [step, setStep] = useState(0);

  const inputCls = "w-full bg-[#181c22] border border-white/[0.13] rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757]/60 focus:border-[#d97757]/40 transition-all duration-300 hover:border-white/[0.2] placeholder-gray-600";
  const labelCls = "text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase";

  const heatColors = ["#60a5fa", "#a78bfa", "#d97757", "#ef4444", "#dc2626"];
  const heatLabels = t.setup.heatLevels as string[];

  const steps = [
    {
      id: "distance",
      foxText: "Lass uns ein Spiel spielen... Wo seid ihr gerade?",
      render: () => (
        <div className="flex flex-col gap-3">
          {[
            { val: "same-room", emoji: "🛋️", label: "Im selben Raum" },
            { val: "video",     emoji: "📹", label: "Videochat / Long-Distance" },
            { val: "text",      emoji: "💬", label: "Text-Only / Chat" },
            { val: "custom",    emoji: "✏️", label: t.login.optCustom },
          ].map(({ val, emoji, label }) => (
            <button key={val} onClick={() => { setDistance(val); if (val !== "custom") setStep(1); }}
              className={`p-4 border rounded-xl transition-all text-left flex items-center gap-3 ${distance === val ? 'bg-[#d97757]/20 border-[#d97757] text-white' : 'bg-[#181c22] border-white/10 hover:border-[#d97757]/50 text-gray-300'}`}>
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
          {distance === 'custom' && (
            <div className="mt-2 animate-fade-in">
              <input type="text" placeholder={t.login.customSetupPlaceholder} className={inputCls}
                value={customDistance} onChange={e => setCustomDistance(e.target.value)} />
              <button onClick={() => setStep(1)} className="mt-3 w-full p-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl">Weiter</button>
            </div>
          )}
        </div>
      )
    },
    {
      id: "heat",
      foxText: "Und wie heiß soll es heute werden?",
      render: () => {
        const idx = Math.max(1, Math.min(5, heatLevel || 3)) - 1;
        const color = heatColors[idx];
        return (
          <div className="flex flex-col gap-6 items-center pt-2">
            <div className="text-center">
              <div className="font-bold text-lg uppercase tracking-widest" style={{ color }}>
                {idx + 1} — {heatLabels[idx]}
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-[280px]">
                {(t.setup.heatLegend as string[][])[idx]?.[1]}
              </div>
            </div>
            <input type="range" min={1} max={5} value={heatLevel || 3}
              onChange={e => setHeatLevel(Number(e.target.value))}
              className="w-full heat-slider"
              style={{ '--heat-color': color } as React.CSSProperties} />
            <div className="flex justify-between w-full text-[10px] tracking-wide px-0.5 -mt-3">
              {heatColors.map((c, i) => (
                <span key={i} style={{ color: (heatLevel || 3) >= i + 1 ? c : '#4b5563', fontWeight: (heatLevel || 3) === i + 1 ? 600 : 400 }}>
                  {i + 1}
                </span>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full p-3 bg-[#d97757] hover:bg-[#e08568] text-[#121418] font-bold rounded-xl transition-all mt-2 shadow-[0_2px_10px_rgba(217,119,87,0.2)]">Weiter</button>
          </div>
        );
      }
    },
    {
      id: "toys",
      foxText: "Was haben wir heute in der Spielkiste?",
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>{t.setup.toyboxLabel}</label>
              <button type="button" onClick={() => setShowToybox((v: boolean) => !v)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors tracking-widest uppercase">
                {showToybox ? t.setup.toyboxToggleHide : t.setup.toyboxToggleShow}
              </button>
            </div>
            {showToybox && (
              <div className="bg-[#121418] border border-white/[0.08] rounded-xl p-3 space-y-3">
                {savedToys.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {savedToys.map((toy: any) => (
                      <div key={toy.id} className="flex items-center gap-0.5">
                        <button type="button" onClick={() => handleToggleToy(toy.id)}
                          className={`px-4 py-2 rounded-l-full text-xs font-medium tracking-wide transition-all border-y border-l ${
                            selectedToyIds.has(toy.id)
                              ? 'bg-[#d97757]/20 border-[#d97757]/50 text-[#d97757]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                          }`}>
                          {toy.name}
                        </button>
                        <button type="button" onClick={() => handleDeleteToy(toy.id)}
                          className={`px-3 py-2 rounded-r-full text-xs transition-all border-y border-r ${
                            selectedToyIds.has(toy.id)
                              ? 'bg-[#d97757]/10 border-[#d97757]/50 text-[#d97757]/50 hover:text-red-400 hover:border-red-400/50'
                              : 'bg-white/5 border-white/10 text-gray-600 hover:text-red-400 hover:border-red-400/30'
                          }`}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs">{t.login.noItemsSaved}</p>
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder={t.setup.addToyPlaceholder}
                    value={newToyName} onChange={e => setNewToyName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddToy(); } }}
                    className="flex-1 bg-[#1e2126] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all" />
                  <button type="button" onClick={handleAddToy} disabled={isAddingToy || !newToyName.trim()}
                    className="px-4 py-2 bg-[#d97757] hover:bg-[#e08568] text-[#0e1015] rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ boxShadow: '0 2px 10px rgba(217,119,87,0.3)' }}>
                    {isAddingToy ? '...' : t.setup.addToyButton}
                  </button>
                </div>
              </div>
            )}
            {partnerToys.length > 0 && (
              <div className="bg-[#121418] border border-white/[0.08] rounded-xl p-3 space-y-2">
                <label className={labelCls}>{t.login.partnersItems}</label>
                <div className="flex flex-wrap gap-2">
                  {partnerToys.map((toy: any) => (
                    <span key={toy.id}
                      className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-purple-500/15 border border-purple-400/30 text-purple-300">
                      {toy.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2 pt-1">
              <label className={labelCls}>{t.login.availableItemsLabel}</label>
              <div className="flex flex-wrap gap-2 bg-[#181c22] border border-white/[0.13] rounded-xl p-3 min-h-[52px] items-center hover:border-white/[0.2] transition-all duration-300">
                {toyItems.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/8 border border-white/15 text-gray-300">
                    <span>{item}</span>
                    <button type="button" onClick={() => handleRemoveToyItem(i)} className="ml-1 text-gray-500 hover:text-red-400 transition-colors leading-none">×</button>
                  </div>
                ))}
                <input
                  ref={toysInputRef}
                  type="text"
                  placeholder={toyItems.length ? '+ mehr...' : 'blindfold, eis...'}
                  className="flex-1 min-w-[80px] bg-transparent text-gray-200 text-sm outline-none placeholder-gray-600 py-1 px-1"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddToyItem(); }
                  }}
                />
              </div>
              {toyComment && (
                <p className="text-xs text-[#d97757] italic pt-1 px-1 animate-pulse">
                  {toyComment}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setStep(3)} className="w-full p-3 bg-[#d97757] hover:bg-[#e08568] text-[#121418] font-bold rounded-xl transition-all mt-2 shadow-[0_2px_10px_rgba(217,119,87,0.2)]">Weiter</button>
        </div>
      )
    },
    {
      id: "wishes",
      foxText: "Gibt es besondere Wünsche — oder Grenzen, die ich respektieren soll?",
      render: () => (
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className={labelCls}>{t.login.atmosphereLabel}</label>
            <textarea
              value={vibe || ""}
              onChange={e => setVibe(e.target.value)}
              placeholder={t.login.atmospherePlaceholder}
              className={`${inputCls} h-24 resize-none`}
            />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Hard Limits / Lines</label>
            <p className="text-[11px] text-gray-500">Themen, die niemals generiert werden sollen. (z.B. "Keine Demütigung", "Kein Schmerz")</p>
            <textarea
              value={hardLimits || ""}
              onChange={e => setHardLimits(e.target.value)}
              placeholder="z.B. Keine Demütigung, kein Wachs..."
              className={`${inputCls} h-20 resize-none`}
            />
          </div>
          <button onClick={() => setStep(4)} className="w-full p-3 bg-[#d97757] hover:bg-[#e08568] text-[#121418] font-bold rounded-xl transition-all shadow-[0_2px_10px_rgba(217,119,87,0.2)]">Weiter</button>
        </div>
      )
    },
    {
      id: "summary",
      foxText: "Alles klar. Ich habe alles, was ich brauche. Bereit?",
      render: () => {
        const idx = Math.max(1, Math.min(5, heatLevel || 3)) - 1;
        return (
          <div className="space-y-4 pt-2">
            {/* Summary pills */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              {distance && <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">{distance === "same-room" ? "Im selben Raum" : distance === "video" ? "Videochat" : distance === "text" ? "Text-Only" : customDistance || distance}</span>}
              <span className="px-3 py-1 bg-[#d97757]/10 rounded-full border border-[#d97757]/20 text-[#d97757]">
                {heatLabels[idx]}
              </span>
              {toyItems?.length > 0 && <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">{toyItems.length} Toys</span>}
            </div>

            <button onClick={onGenerate} disabled={isGenerating}
              className="w-full p-4 bg-[#d97757] hover:bg-[#e08568] text-[#121418] font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,87,0.4)] disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? (
                <svg className="animate-spin h-5 w-5 text-[#121418]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : '🔥'}
              {isGenerating ? t.setup.generatingButton : t.setup.generateButton}
            </button>

            <button onClick={onSurprise} disabled={isGenerating}
              className="w-full p-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
              🎲 {t.setup.surpriseMeButton}
            </button>
          </div>
        );
      }
    }
  ];

  const current = steps[step];

  return (
    <div className="w-full space-y-6 animate-fade-in bg-gradient-to-b from-[#1c1f25]/80 to-[#181b20]/80 backdrop-blur-xl p-7 sm:p-9 rounded-2xl shadow-2xl border border-white/[0.06]"
         style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 1px rgba(217,119,87,0.1), inset 0 1px 0 rgba(255,255,255,0.03)' }}>

      {/* ProgressBar */}
      <div className="flex gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s.id}
               onClick={() => { if (i < step) setStep(i); }}
               className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#d97757]' : 'bg-white/10'} ${i < step ? 'cursor-pointer hover:bg-[#e08568]' : ''}`} />
        ))}
      </div>

      {/* Fox Dialog Box */}
      <div className="flex items-start gap-4 bg-[#121418]/80 p-4 rounded-xl border border-white/5 shadow-inner">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#181c22]">
          <FoxImage game={null} className="w-full h-full object-cover" />
        </div>
        <div className="mt-1">
          <p className="text-gray-200 text-sm font-medium italic leading-relaxed">"{current.foxText}"</p>
        </div>
      </div>

      {/* Interactive area */}
      <div className="pt-2 transition-all duration-300">
        {current.render()}
      </div>

      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)} className="mt-6 text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Zurück
        </button>
      )}
    </div>
  );
}
