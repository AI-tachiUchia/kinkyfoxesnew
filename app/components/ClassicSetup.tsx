"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../lib/translations";

export default function ClassicSetup({
  distance, setDistance,
  customDistance, setCustomDistance,
  heatLevel, setHeatLevel,
  vibe, setVibe,
  template, setTemplate,
  toys, setToys,
  savedToys, partnerToys,
  selectedToyIds, handleToggleToy, handleDeleteToy,
  newToyName, setNewToyName, handleAddToy, isAddingToy,
  toyItems, handleRemoveToyItem, handleAddToyItem, toysInputRef, toyComment,
  showToybox, setShowToybox,
  onGenerate, isGenerating, onSurprise,
  showHeatLegend, setShowHeatLegend,
  broadcastState,
  hardLimits, setHardLimits,
}: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const inputCls = "w-full bg-[#181c22] border border-white/[0.13] rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757]/60 focus:border-[#d97757]/40 transition-all duration-300 hover:border-white/[0.2] placeholder-gray-600";
  const labelCls = "text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase";
  const heatColors = ['#60a5fa', '#a78bfa', '#d97757', '#ef4444', '#dc2626'];
  const heatColor = heatColors[heatLevel - 1];

  const handleChange = (setter: any, field: string) => (e: any) => {
    setter(e.target.value);
    broadcastState({ [field]: e.target.value });
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#1c1f25]/80 to-[#181b20]/80 backdrop-blur-xl p-7 sm:p-9 rounded-2xl shadow-2xl border border-white/[0.06] space-y-7 animate-fade-in"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 1px rgba(217,119,87,0.1), inset 0 1px 0 rgba(255,255,255,0.03)' }}>

      <div className="space-y-3">
        <label className={labelCls}>{t.setup.distanceLabel}</label>
        <select className={inputCls} value={distance} onChange={handleChange(setDistance, 'distance')}>
          <option value="" disabled>{t.login.selectSetup}</option>
          <option value="same-room">Im selben Raum</option>
          <option value="video">Videochat / Long-Distance</option>
          <option value="text">Text-Only / Chat</option>
          <option value="custom">{t.login.optCustom}</option>
        </select>
        {distance === 'custom' && (
          <input type="text" placeholder={t.login.customSetupPlaceholder} className={inputCls}
            value={customDistance} onChange={handleChange(setCustomDistance, 'customDistance')} />
        )}
      </div>

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

      <div className="space-y-3">
        <label className={labelCls}>{t.login.atmosphereLabel}</label>
        <textarea placeholder={t.login.atmospherePlaceholder}
          className={`${inputCls} h-20 resize-none`}
          style={{ padding: '14px 16px' }}
          value={vibe} onChange={handleChange(setVibe, 'vibe')} />
      </div>

      <div className="space-y-3">
        <label className={labelCls}>{t.login.gameTemplateLabel}</label>
        <select className={inputCls} value={template} onChange={handleChange(setTemplate, 'template')}>
          <option value="">{t.login.tplNone}</option>
          <option value="Classic Truth or Dare">{t.login.tplTruthDare}</option>
          <option value="Roleplay Scenario">{t.login.tplRoleplay}</option>
          <option value="Maid Roleplay">{t.login.tplMaid}</option>
          <option value="Police Roleplay">{t.login.tplPolice}</option>
          <option value="Stewardess Roleplay">{t.login.tplStewardess}</option>
          <option value="King and Slave Roleplay">{t.login.tplKingSlave}</option>
          <option value="Tease & Denial">{t.login.tplTeaseDenial}</option>
          <option value="Sensory Deprivation">{t.login.tplSensory}</option>
          <option value="Punishment & Reward">{t.login.tplPunishment}</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelCls}>
            Heat Level — <span style={{ color: heatColor, transition: 'color 0.3s' }}>{t.setup.heatLevels[heatLevel - 1]}</span>
          </label>
          <button type="button" onClick={() => setShowHeatLegend((v: boolean) => !v)}
            className="text-xs text-gray-500 hover:text-[#d97757] transition-colors tracking-widest uppercase">
            {showHeatLegend ? t.setup.toyboxToggleHide : t.login.whatDoesThisMean}
          </button>
        </div>
        <input type="range" min={1} max={5} value={heatLevel}
          onChange={e => { const v = Number(e.target.value); setHeatLevel(v); broadcastState({ heatLevel: v }); }}
          className="heat-slider w-full"
          style={{ '--heat-color': heatColor } as React.CSSProperties} />
        <div className="flex justify-between text-[10px] tracking-wide px-0.5 -mt-0.5">
          {heatColors.map((c, i) => (
            <span key={i} style={{ color: heatLevel >= i + 1 ? c : '#4b5563', transition: 'color 0.3s', fontWeight: heatLevel === i + 1 ? 600 : 400 }}>
              {i + 1}
            </span>
          ))}
        </div>
        {showHeatLegend && (
          <div className="bg-[#121418] border border-white/[0.08] rounded-xl p-4 space-y-2 text-xs text-gray-400">
            {(t.setup.heatLegend as string[][]).map(([label, desc]) => (
              <div key={label} className="flex gap-3">
                <span className="text-[#d97757] font-medium shrink-0 w-24">{label}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hard Limits */}
      <div className="space-y-3">
        <label className={labelCls}>Hard Limits / Lines</label>
        <textarea placeholder="z.B. Keine Demütigung, kein Wachs..."
          className={`${inputCls} h-16 resize-none`} style={{ padding: '10px 14px' }}
          value={hardLimits || ""}
          onChange={e => { setHardLimits(e.target.value); broadcastState({ hardLimits: e.target.value }); }} />
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex gap-3">
          <button onClick={onGenerate}
            disabled={isGenerating || !distance || (distance === 'custom' && !customDistance)}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#d97757] to-[#c66849] hover:from-[#e0856a] hover:to-[#d97757] text-[#0e1015] font-semibold text-sm tracking-wide uppercase py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 20px rgba(217,119,87,0.25), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            {t.setup.generateButton}
          </button>
          <button onClick={onSurprise} disabled={isGenerating}
            className="flex-shrink-0 flex justify-center items-center gap-2 bg-[#0e1015] hover:bg-[#161920] border border-[#d97757]/20 hover:border-[#d97757]/50 text-[#d97757]/75 hover:text-[#d97757] font-medium text-sm tracking-wide uppercase py-4 px-5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 20px rgba(217,119,87,0.05), inset 0 0 20px rgba(217,119,87,0.03)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            {t.setup.surpriseMeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
