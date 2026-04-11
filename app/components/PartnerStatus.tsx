"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const statusTranslations = {
  de: {
    waitingForPartner: "Warte auf Partner...",
    online: "ist online",
    shareSession: "Session teilen",
    copyLink: "Link kopieren",
    copied: "Kopiert!",
    shareTitle: "Kinky Fox – Spiel mit mir 🦊",
    shareText: "Hey, ich hab ein Spiel für uns vorbereitet! Klick den Link um mitzumachen:",
    scanQr: "QR-Code scannen",
    orShareVia: "Oder teilen via",
    sessionCode: "Session-Code",
    close: "Schließen",
  },
  en: {
    waitingForPartner: "Waiting for partner...",
    online: "is online",
    shareSession: "Share Session",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareTitle: "Kinky Fox – Play with me 🦊",
    shareText: "Hey, I set up a game for us! Click the link to join:",
    scanQr: "Scan QR Code",
    orShareVia: "Or share via",
    sessionCode: "Session Code",
    close: "Close",
  },
};

function ShareModal({ isOpen, onClose, roomUrl, roomCode, language }: {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  roomCode: string;
  language: "de" | "en";
}) {
  const t = statusTranslations[language];
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: t.shareText,
          url: roomUrl,
        });
      } catch (e) {
        // User cancelled share
      }
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}&bgcolor=ffffff&color=1a1d23&format=png&ecc=Q`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-sm bg-[#1a1d23] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 1px rgba(217,119,87,0.2)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="text-2xl mb-2">🦊</div>
          <h3 className="text-lg font-serif text-gray-200 font-light">{t.shareSession}</h3>
        </div>

        {/* QR Code */}
        <div className="flex justify-center px-6 pb-4">
          <div className="bg-white rounded-xl p-3 shadow-inner">
            <img 
              src={qrUrl} 
              alt="QR Code" 
              width={180} 
              height={180}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Session Code */}
        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5">{t.sessionCode}</p>
          <p className="text-2xl font-mono font-bold text-[#d97757] tracking-[0.3em] select-all">
            {roomCode.toUpperCase()}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2.5">
          {/* Native Share (mobile) */}
          {canNativeShare && (
            <button 
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2.5 bg-[#d97757] hover:bg-[#e08568] text-[#121418] font-semibold text-sm tracking-wide py-3.5 px-4 rounded-xl transition-all"
              style={{ boxShadow: '0 4px 20px rgba(217,119,87,0.3)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t.orShareVia} WhatsApp, Telegram...
            </button>
          )}

          {/* Copy Link */}
          <button 
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2.5 font-medium text-sm tracking-wide py-3.5 px-4 rounded-xl transition-all border ${
              copied 
                ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                : 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.copied}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t.copyLink}
              </>
            )}
          </button>
        </div>

        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PartnerStatus({ 
  partnerOnline, 
  partnerName, 
  partnerActivity, 
  roomId,
  roomUrl,
}: {
  partnerOnline: boolean;
  partnerName: string | null;
  partnerActivity: string | null;
  roomId: string | null;
  roomUrl: string;
}) {
  const { language } = useLanguage();
  const t = statusTranslations[language as "de" | "en"];
  const [showShareModal, setShowShareModal] = useState(false);

  const roomCode = roomId || "";

  return (
    <>
      {/* Partner status bar */}
      <div className="flex items-center gap-3">
        {partnerOnline ? (
          /* Partner is connected */
          <div className="flex items-center gap-2.5 bg-[#1a1d23]/80 backdrop-blur-md border border-white/[0.08] rounded-full px-4 py-2 shadow-lg">
            {/* Pulsing green dot */}
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-40" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 font-medium leading-tight">
                {partnerName || "Partner"} {t.online}
              </span>
              {partnerActivity && (
                <span className="text-[10px] text-gray-500 leading-tight italic">
                  {partnerActivity}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* No partner – show invite button */
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2.5 bg-[#1a1d23]/80 backdrop-blur-md border border-[#d97757]/20 hover:border-[#d97757]/40 rounded-full px-4 py-2 shadow-lg transition-all group"
          >
            {/* Pulsing orange dot */}
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d97757]/60" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#d97757] animate-ping opacity-30" />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
              {t.waitingForPartner}
            </span>
            <svg className="w-3.5 h-3.5 text-[#d97757]/60 group-hover:text-[#d97757] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomUrl={roomUrl}
        roomCode={roomCode}
        language={language as "de" | "en"}
      />
    </>
  );
}
