"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useLanguage } from "./context/LanguageContext";
import { translations } from "../lib/translations";
import FoxDisplay from "./components/FoxDisplay";
import FoxImage, { detectFoxImage, FOX_IMAGES } from "./components/FoxImage";
import FoxLoadingVideo from "./components/FoxLoadingVideo";
import GameMasterSetup from "./components/GameMasterSetup";
import PartnerStatus from "./components/PartnerStatus";
import DiceRoll, { parseDiceRolls } from "./components/DiceRoll";

function Auth() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#121418] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="z-10 w-full max-w-md bg-[#1e2126]/60 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-white/[0.05]">
        <h1 className="text-3xl font-light text-center text-gray-200 mb-2 font-serif tracking-wide">{t.login.title}</h1>
        <p className="text-center text-gray-400 text-sm mb-8 tracking-widest uppercase font-light">{t.login.subtitle}</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">{t.login.email}</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              required />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">{t.login.password}</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              required />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded border border-red-400/20">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gray-200 hover:bg-white text-[#121418] font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50">
            {loading ? t.login.loading : t.login.button}
          </button>
        </form>
      </div>
    </main>
  );
}

type GameSection = {
  title: string;
  content: string;
};

type GeneratedGame = {
  title: string;
  duration: string;
  description?: string;
  sections?: GameSection[];
};

type Toy = {
  id: string;
  name: string;
  description?: string;
};

function getToyComment(toysString: string): string | null {
  if (!toysString) return null;
  const t = toysString.toLowerCase();
  
  if (t.includes('analkette') || t.includes('anal beads')) return "Eine Analkette? Ein(e) Schmuckliebhaber/in also! 📿 (Tipp: Nicht als Weihnachtsgeschenk geeignet)";
  if (t.includes('peitsche') || t.includes('whip') || t.includes('gerte') || t.includes('crop')) return "Eine Peitsche? Jemand hat wohl eine Strafe verdient... 🐎";
  if (t.includes('handschellen') || t.includes('handcuffs') || t.includes('fessel')) return "Handschellen? Hoffentlich habt ihr den Schlüssel nicht verlegt! 👮";
  if (t.includes('augenbinde') || t.includes('blindfold')) return "Augenbinde! Vertrauen ist gut, Kontrollverlust ist besser. 🫣";
  if (t.includes('vibrator') || t.includes('dildo') || t.includes('wand') || t.includes('magic wand') || t.includes('rose')) return "Der gute alte Klassiker. Kann nie schaden! 🔋";
  if (t.includes('knebel') || t.includes('gag')) return "Heute mal etwas leiser unterwegs? 🤐";
  if (t.includes('eis') || t.includes('ice') || t.includes('eiswürfel')) return "Eiswürfel? Ziemlich cool. Hoffentlich ist es warm genug im Zimmer. 🧊";
  if (t.includes('seil') || t.includes('rope') || t.includes('shibari') || t.includes('bondage')) return "Seil? Wir haben wohl einen kleinen Pfadfinder hier! 🪢";
  if (t.includes('plug') || t.includes('buttplug')) return "Das kleine Geheimnis für zwischendurch... 🤫";
  if (t.includes('kerze') || t.includes('candle') || t.includes('wachs') || t.includes('wax')) return "Wachs? Das wird heiß... wortwörtlich. 🕯️";
  if (t.includes('halsband') || t.includes('collar')) return "Ein Halsband? Wer ist hier der brave Hund? 🐕";
  if (t.includes('klammer') || t.includes('clamp') || t.includes('nipple')) return "Klammern! Ein kleiner, fieser Schmerz. 🤏";

  return null;
}

function HomeContent({ session }: { session: any }) {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room');

  const [distance, setDistance] = useState("");
  const [customDistance, setCustomDistance] = useState("");
  const [toys, setToys] = useState("");
  const [vibe, setVibe] = useState("");
  const [template, setTemplate] = useState("");
  const [heatLevel, setHeatLevel] = useState(3);
  // Safety rail — survived prompt-master-update simplification (2026-04-11)
  const [hardLimits, setHardLimits] = useState("");
  const [game, setGame] = useState<GeneratedGame | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplicating, setIsComplicating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const [savedToys, setSavedToys] = useState<Toy[]>([]);
  const [selectedToyIds, setSelectedToyIds] = useState<Set<string>>(new Set());
  const [newToyName, setNewToyName] = useState("");
  const [isAddingToy, setIsAddingToy] = useState(false);
  const [showToybox, setShowToybox] = useState(true);
  const [isSurprising, setIsSurprising] = useState(false);
  const [refinementText, setRefinementText] = useState("");
  const [showRefineInput, setShowRefineInput] = useState(false);

  // Admin panel
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const urlAdmin = searchParams.get('admin');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (urlAdmin && adminSecret && urlAdmin === adminSecret) {
      setIsAdmin(true);
      if (typeof window !== 'undefined') sessionStorage.setItem('foxAdmin', 'true');
      console.log("Admin Mode Activated via URL");
    } else if (typeof window !== 'undefined' && sessionStorage.getItem('foxAdmin') === 'true') {
      setIsAdmin(true);
    }
  }, [urlAdmin, adminSecret]);

  const [adminModel, setAdminModel] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('adminModel') || '';
    return '';
  });
  const handleAdminModelChange = (model: string) => {
    setAdminModel(model);
    if (typeof window !== 'undefined') localStorage.setItem('adminModel', model);
  };

  type ViewState = 'setup' | 'generating' | 'game';
  const [view, setView] = useState<ViewState>('setup');
  const [viewAnim, setViewAnim] = useState('');

  const [savedGames, setSavedGames] = useState<{id: string, title: string, game_data: GeneratedGame, created_at: string}[]>([]);
  const [showSavedGames, setShowSavedGames] = useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [isSavingGame, setIsSavingGame] = useState(false);

  const [partnerToys, setPartnerToys] = useState<Toy[]>([]);
  const [channel, setChannel] = useState<any>(null);

  // Presence & activity
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerActivity, setPartnerActivity] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const myDisplayName = session?.user?.email?.split('@')[0] || 'You';

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const stateRef = useRef({ distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys, heatLevel, hardLimits });
  const toysInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    stateRef.current = { distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys, heatLevel, hardLimits };
  }, [distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys, heatLevel, hardLimits]);

  // Initialize Room ID
  useEffect(() => {
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substring(2, 9);
      const params = new URLSearchParams(window.location.search);
      params.set('room', newRoomId);
      router.replace(`/?${params.toString()}`);
    }
  }, [roomId, router]);

  // Setup Supabase Realtime Channel
  useEffect(() => {
    if (!roomId) return;

    const newChannel = supabase.channel(roomId);

    newChannel
      .on('broadcast', { event: 'state-sync' }, ({ payload }) => {
        if (payload.distance !== undefined) setDistance(payload.distance);
        if (payload.customDistance !== undefined) setCustomDistance(payload.customDistance);
        if (payload.toys !== undefined) setToys(payload.toys);
        if (payload.vibe !== undefined) setVibe(payload.vibe);
        if (payload.template !== undefined) setTemplate(payload.template);
        if (payload.game !== undefined) setGame(payload.game);
        if (payload.isGenerating !== undefined) setIsGenerating(payload.isGenerating);
        if (payload.isComplicating !== undefined) setIsComplicating(payload.isComplicating);
        if (payload.isRefining !== undefined) setIsRefining(payload.isRefining);
        if (payload.heatLevel !== undefined) setHeatLevel(payload.heatLevel);
        if (payload.hardLimits !== undefined) setHardLimits(payload.hardLimits);
      })
      .on('broadcast', { event: 'toybox-sync' }, ({ payload }) => {
        if (payload.toys) setPartnerToys(payload.toys);
      })
      .on('broadcast', { event: 'request-sync' }, () => {
        const currentState = stateRef.current;
        if (currentState.distance || currentState.customDistance || currentState.toys || currentState.vibe || currentState.template || currentState.game || currentState.isGenerating || currentState.isComplicating || currentState.isRefining) {
          newChannel.send({
            type: 'broadcast',
            event: 'state-sync',
            payload: currentState
          });
        }
        if (currentState.savedToys.length > 0) {
          newChannel.send({
            type: 'broadcast',
            event: 'toybox-sync',
            payload: { toys: currentState.savedToys }
          });
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const others = Object.values(state).flat().filter(
          (p: any) => p.user_id !== session?.user?.id
        );
        
        // Use a Set to handle duplicate entries by user_id
        const uniqueOthers = Array.from(new Map(others.map((p: any) => [p.user_id, p])).values());
        
        if (uniqueOthers.length > 0) {
          const partner = uniqueOthers[0] as any;
          setPartnerName(partner.display_name);
          setPartnerOnline(true);
          setPartnerActivity(partner.activity || null);
        } else {
          setPartnerOnline(false);
          setPartnerActivity(null);
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        const partner = newPresences.find((p: any) => p.user_id !== session?.user?.id);
        if (partner) addToast(`🦊 ${partner.display_name} ist der Session beigetreten!`);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        const partner = leftPresences.find((p: any) => p.user_id !== session?.user?.id);
        if (partner) addToast(`${partner.display_name} hat die Session verlassen`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({
            user_id: session?.user?.id,
            display_name: myDisplayName,
            activity: 'adjusting settings...',
            online_at: new Date().toISOString(),
          });
          newChannel.send({
            type: 'broadcast',
            event: 'request-sync',
          });
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [roomId]);

  // Broadcast activity when view changes
  useEffect(() => {
    if (!channel) return;
    const activityMap: Record<string, string> = {
      setup: 'adjusting settings...',
      generating: 'generating a game...',
      game: 'reading the game...',
    };
    channel.track({
      user_id: session?.user?.id,
      display_name: myDisplayName,
      activity: activityMap[view] || 'browsing...',
      online_at: new Date().toISOString(),
    });
  }, [view, channel]);

  const broadcastState = (updates: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'state-sync',
        payload: updates
      });
    }
  };

  const getRoomUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const handleChange = (setter: any, field: string) => (e: any) => {
    const val = e.target.value;
    setter(val);
    broadcastState({ [field]: val });
  };

  async function authHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
    return headers;
  }

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      fetch('/api/toys', { headers }).then(r => r.ok ? r.json() : []).then(data => setSavedToys(Array.isArray(data) ? data : []));
      fetch('/api/saved-games', { headers }).then(r => r.ok ? r.json() : []).then(data => setSavedGames(Array.isArray(data) ? data : []));
    })();
  }, []);

  useEffect(() => {
    if (channel && savedToys.length > 0) {
      channel.send({
        type: 'broadcast',
        event: 'toybox-sync',
        payload: { toys: savedToys }
      });
    }
  }, [savedToys, channel]);

  function parseItemsFromText(input: string): string[] {
    return input
      .toLowerCase()
      .replace(/\b(i have|i've got|we have|we've got|there's|there is|i also have|and i have)\b/g, ',')
      .split(/,|\band\b/)
      .map(s => s.replace(/^\s*(a|an|some|my|our)\s+/i, '').trim())
      .filter(s => s.length > 0);
  }

  const handleToggleToy = (id: string) => {
    const next = new Set(selectedToyIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedToyIds(next);
    const selectedNames = savedToys.filter(t => next.has(t.id)).map(t => t.name);
    const newToys = selectedNames.join(', ');
    setToys(newToys);
    broadcastState({ toys: newToys });
  };

  const handleAddToy = async () => {
    if (!newToyName.trim()) return;
    setIsAddingToy(true);
    try {
      const headers = await authHeaders();
      const items = parseItemsFromText(newToyName);
      const added: Toy[] = [];
      for (const item of items) {
        const res = await fetch('/api/toys', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: item, description: '' }),
        });
        if (res.ok) {
          const [newToy] = await res.json();
          added.push(newToy);
        }
      }
      if (added.length > 0) {
        setSavedToys(prev => [...prev, ...added]);
        setNewToyName('');
      }
    } finally {
      setIsAddingToy(false);
    }
  };

  const handleDeleteToy = async (id: string) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/toys?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setSavedToys(prev => prev.filter(t => t.id !== id));
      const next = new Set(selectedToyIds);
      next.delete(id);
      setSelectedToyIds(next);
    }
  };

  const handleBookmarkGame = async () => {
    if (!game) return;
    setIsSavingGame(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/saved-games', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: game.title, game_data: game }),
      });
      if (res.ok) {
        const [saved] = await res.json();
        setSavedGames(prev => [saved, ...prev]);
      }
    } finally {
      setIsSavingGame(false);
    }
  };

  const handleLoadGame = (gameData: GeneratedGame) => {
    setGame(gameData);
    setOpenSections(new Set([0]));
    broadcastState({ game: gameData });
    transitionTo('game');
  };

  const handleDeleteSavedGame = async (id: string) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/saved-games?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setSavedGames(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleSurprise = async () => {
    const distances = ['same-room', 'tonight', 'virtual'];
    const vibes = ['slow tease', 'intense and commanding', 'playful and silly', 'sensory deprivation', 'power play', 'romantic and tender', 'competitive', 'confessional'];
    const templates = ['', 'Classic Truth or Dare', 'Roleplay Scenario', 'Tease & Denial', 'Sensory Deprivation', 'Punishment & Reward'];
    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const selectedNames = savedToys.filter(t => selectedToyIds.has(t.id)).map(t => t.name);
    const randomToys = selectedNames.length > 0 ? selectedNames.join(', ') : toys;

    setDistance(randomDistance);
    setVibe(randomVibe);
    setTemplate(randomTemplate);
    setIsSurprising(true);
    setIsGenerating(true);
    setGame(null);
    transitionTo('generating');
    broadcastState({ game: null, isGenerating: true, distance: randomDistance, vibe: randomVibe, template: randomTemplate });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "generate", language, distance: randomDistance, customDistance: '', toys: [randomToys, partnerToys.map(t => t.name).join(', ')].filter(Boolean).join(', '), vibe: randomVibe, template: randomTemplate, heatLevel, adminModel: adminModel || undefined, hardLimits }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setGame(data);
      setOpenSections(new Set([0]));
      setIsGenerating(false);
      setIsSurprising(false);
      transitionTo('game');
      broadcastState({ game: data, isGenerating: false });
    } catch (error) {
      console.error(error);
      addToast('Error generating surprise game.');
      setIsGenerating(false);
      setIsSurprising(false);
      transitionTo('setup');
      broadcastState({ isGenerating: false });
    }
  };

  const toggleSection = (idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const transitionTo = (target: ViewState) => {
    if (target === 'game' || target === 'generating') {
      setViewAnim('view-exit-left');
      setTimeout(() => { setView(target); setViewAnim('view-enter-right'); }, 350);
    } else {
      setViewAnim('view-exit-right');
      setTimeout(() => { setView(target); setViewAnim('view-enter-left'); }, 350);
    }
  };

  const handleBackToSetup = () => {
    transitionTo('setup');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGame(null);
    transitionTo('generating');
    broadcastState({ game: null, isGenerating: true });
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: "generate",
          language,
          distance,
          customDistance,
          toys: [toys, partnerToys.map(t => t.name).join(', ')].filter(Boolean).join(', '),
          vibe,
          template,
          heatLevel,
          adminModel: adminModel || undefined,
          hardLimits,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate game');

      const data = await response.json();
      setGame(data);
      setOpenSections(new Set([0]));
      setIsGenerating(false);
      transitionTo('game');
      broadcastState({ game: data, isGenerating: false });
    } catch (error) {
      console.error(error);
      addToast('Error generating game. Please check the console.');
      setIsGenerating(false);
      transitionTo('setup');
      broadcastState({ isGenerating: false });
    }
  };

  const handleComplicate = async () => {
    if (!game) return;
    setIsComplicating(true);
    broadcastState({ isComplicating: true });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "complicate",
          language,
          currentGame: game,
          heatLevel,
          adminModel: adminModel || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to complicate game');

      const data = await response.json();
      setGame(data);
      setOpenSections(new Set([0]));
      broadcastState({ game: data, isComplicating: false });
    } catch (error) {
      console.error(error);
      addToast('Error complicating game.');
      broadcastState({ isComplicating: false });
    } finally {
      setIsComplicating(false);
    }
  };

  const handleRefine = async () => {
    if (!game) return;
    setIsRefining(true);
    broadcastState({ isRefining: true });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "refine",
          language,
          currentGame: game,
          refinement: refinementText || undefined,
          heatLevel,
          adminModel: adminModel || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to refine game');

      const data = await response.json();
      setGame(data);
      setOpenSections(new Set([0]));
      setRefinementText("");
      setShowRefineInput(false);
      broadcastState({ game: data, isRefining: false });
    } catch (error) {
      console.error(error);
      addToast('Error refining game.');
      broadcastState({ isRefining: false });
    } finally {
      setIsRefining(false);
    }
  };

  const handleExportPdf = () => {
    if (!game) return;
    const sections = game.sections
      ? game.sections.map((s: { title: string; content: string }, i: number) =>
          `<div class="section"><div class="section-num">${String(i + 1).padStart(2, '0')}</div><div><h3>${s.title}</h3><p>${s.content.replace(/\n/g, '<br/>')}</p></div></div>`
        ).join('')
      : `<p>${(game.description || '').replace(/\n/g, '<br/>')}</p>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${game.title}</title>
<style>
  @page { margin: 20mm; }
  body { font-family: Georgia, serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 300; margin-bottom: 4px; }
  .duration { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #d97757; margin-bottom: 24px; display: inline-block; }
  hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  .section { display: flex; gap: 16px; margin-bottom: 18px; }
  .section-num { font-size: 10px; font-family: monospace; color: #d97757; padding-top: 3px; flex-shrink: 0; }
  h3 { font-size: 15px; margin: 0 0 6px; }
  p { font-size: 13px; line-height: 1.6; margin: 0; color: #333; }
  .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; }
</style></head><body>
  <h1>${game.title}</h1>
  <span class="duration">${game.duration}</span>
  <hr/>
  ${sections}
  <div class="footer">Kinky Fox Games</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  const handleSaveGame = () => {
    if (!game) return;
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportGame = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const importedGame = JSON.parse(result);
        if (importedGame && importedGame.title) {
          setGame(importedGame);
          broadcastState({ game: importedGame });
          transitionTo('game');
        } else {
          addToast('Invalid game file format.');
        }
      } catch (error) {
        addToast('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-serif text-gray-100 mt-6 mb-3 font-light" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-serif text-gray-100 mt-6 mb-3 font-light" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-serif text-gray-200 mt-4 mb-2 font-light" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-4 text-gray-300 text-[15px] leading-7" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-300" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-gray-300" {...props} />,
    li: ({node, ...props}: any) => <li className="text-[15px]" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-medium text-gray-200" {...props} />,
  };

  const inputCls = "w-full bg-[#181c22] border border-white/[0.13] rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757]/60 focus:border-[#d97757]/40 transition-all duration-300 hover:border-white/[0.2] placeholder-gray-600";
  const labelCls = "text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase";
  const heatColors = ['#60a5fa', '#a78bfa', '#d97757', '#ef4444', '#dc2626'];
  const heatColor = heatColors[heatLevel - 1];
  const toyItems = toys.split(',').map(s => s.trim()).filter(Boolean);
  const toyComment = getToyComment(toys);
  const handleRemoveToyItem = (idx: number) => {
    const next = toyItems.filter((_, i) => i !== idx).join(', ');
    setToys(next);
    broadcastState({ toys: next });
  };
  const handleAddToyItem = () => {
    if (!toysInputRef.current) return;
    const val = toysInputRef.current.value.trim().replace(/,\s*$/, '');
    if (!val) return;
    const next = toys ? `${toys}, ${val}` : val;
    setToys(next);
    broadcastState({ toys: next });
    toysInputRef.current.value = '';
  };

  return (
    <main className="min-h-screen bg-[#121418] relative overflow-hidden font-sans">
      {/* Global nav */}
      
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back button + Language */}
          <div className="flex gap-3 items-center">
            {view !== 'setup' && (
              <button onClick={handleBackToSetup}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs tracking-widest uppercase">{t.nav.settings}</span>
              </button>
            )}
            <div className="flex bg-[#121418] border border-white/[0.08] rounded-full p-1">
              <button onClick={() => setLanguage('de')} className={`text-[10px] tracking-widest uppercase px-3 py-1 rounded-full transition-all ${language === 'de' ? 'bg-[#d97757] text-[#121418] font-bold' : 'text-gray-500 hover:text-gray-300'}`}>DE</button>
              <button onClick={() => setLanguage('en')} className={`text-[10px] tracking-widest uppercase px-3 py-1 rounded-full transition-all ${language === 'en' ? 'bg-[#d97757] text-[#121418] font-bold' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
            </div>
          </div>

          {/* Center: Partner Status */}
          <PartnerStatus
            partnerOnline={partnerOnline}
            partnerName={partnerName}
            partnerActivity={partnerActivity}
            roomId={roomId}
            roomUrl={getRoomUrl()}
          />

          {/* Right: Sign Out */}
          <button onClick={() => supabase.auth.signOut()}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors tracking-widest uppercase">
            {t.nav.signOut}
          </button>
        </div>
      </div>

      {/* Ambient background */}
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-[#d97757]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-[#b87363]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ═══════ SETUP VIEW ═══════ */}
      {view === 'setup' && (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 ${viewAnim}`}>
          <div className="z-10 max-w-2xl w-full flex flex-col items-center gap-10">

            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in-down">
              <div className="flex flex-col items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-300 to-[#d97757] font-serif">
                  Kinky Fox
                </h1>
              </div>
              <p className="text-gray-400 text-sm tracking-widest uppercase font-light">{t.login.heroSubtitle}</p>
            </div>

            {/* Fox display */}
            <div className="w-full max-w-sm">
              <FoxDisplay isGenerating={isGenerating} game={game} heatLevel={heatLevel} setupText={`${vibe} ${toys} ${distance === 'custom' ? customDistance : distance}`} />
            </div>

            {/* Config card / Setup Wizard */}
            <GameMasterSetup
              distance={distance} setDistance={setDistance}
              customDistance={customDistance} setCustomDistance={setCustomDistance}
              heatLevel={heatLevel} setHeatLevel={setHeatLevel}
              vibe={vibe} setVibe={setVibe}
              template={template} setTemplate={setTemplate}
              toys={toys} setToys={setToys}
              savedToys={savedToys} partnerToys={partnerToys}
              selectedToyIds={selectedToyIds} handleToggleToy={handleToggleToy} handleDeleteToy={handleDeleteToy}
              newToyName={newToyName} setNewToyName={setNewToyName} handleAddToy={handleAddToy} isAddingToy={isAddingToy}
              toyItems={toyItems} handleRemoveToyItem={handleRemoveToyItem} handleAddToyItem={handleAddToyItem} toysInputRef={toysInputRef} toyComment={toyComment}
              showToybox={showToybox} setShowToybox={setShowToybox}
              onGenerate={handleGenerate} isGenerating={isGenerating} onSurprise={handleSurprise}
              hardLimits={hardLimits} setHardLimits={setHardLimits}
            />

            <div className="w-full pt-1 animate-fade-in">
              <label className="w-full flex justify-center items-center gap-2 bg-[#0e1015] hover:bg-[#161920] border border-white/[0.06] hover:border-white/[0.12] text-gray-400 hover:text-gray-300 font-medium text-xs tracking-widest uppercase py-4 px-6 rounded-xl transition-all duration-300 cursor-pointer shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                {t.login.importJson}
                <input type="file" accept=".json" className="hidden" onChange={handleImportGame} />
              </label>
            </div>

                          {/* Saved Games */}
              <div className="space-y-3 pt-2 bg-[#181b20]/60 backdrop-blur-xl border border-white/[0.06] p-6 rounded-2xl w-full max-w-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>{t.savedGames.title}</label>
                  <button type="button" onClick={() => setShowSavedGames(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 hover:underline transition-colors tracking-widest uppercase">
                    {showSavedGames ? t.setup.toyboxToggleHide : `${t.setup.toyboxToggleShow} (${savedGames.length})`}
                    <svg className={`w-3 h-3 transition-transform duration-200 ${showSavedGames ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {showSavedGames && (
                  <div className="bg-[#121418] border border-white/[0.08] rounded-xl p-3 space-y-2">
                    {savedGames.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {savedGames.map(sg => (
                          <div key={sg.id} className="flex items-center justify-between gap-2 bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 hover:border-white/[0.15] transition-all">
                            <button type="button" onClick={() => handleLoadGame(sg.game_data)}
                              className="flex-1 text-left text-sm text-gray-300 hover:text-white transition-colors truncate">
                              {sg.title}
                            </button>
                            <span className="text-[10px] text-gray-600 shrink-0">
                              {new Date(sg.created_at).toLocaleDateString()}
                            </span>
                            <button type="button" onClick={() => handleDeleteSavedGame(sg.id)}
                              className="text-gray-600 hover:text-red-400 transition-colors text-sm shrink-0 ml-2">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-xs">{t.login.savedGamesEmpty}</p>
                    )}
                  </div>
                )}

            </div>
          </div>
        </div>
      )}

      {/* ═══════ GENERATING VIEW ═══════ */}
      {view === 'generating' && (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${viewAnim}`}>
          <FoxLoadingVideo />
        </div>
      )}

      {/* ═══════ GAME VIEW ═══════ */}
      {view === 'game' && game && (
        <div className={`min-h-screen flex flex-col ${viewAnim}`}>
          {/* Game content — scrollable area with bottom padding for action bar */}
          <div className="flex-1 overflow-y-auto game-scroll pt-16 pb-32 px-6 sm:px-12 md:px-24">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Hero card with fox display + title */}
              <div className="float-up bg-[#1e2126]/60 backdrop-blur-md rounded-2xl border border-white/[0.06] overflow-hidden">
                {/* Compact fox display with particles */}
                <div className="px-5 pt-5">
                  <FoxDisplay isGenerating={false} game={game} heatLevel={heatLevel} />
                </div>
                {/* Title area */}
                <div className="px-6 pb-5 pt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                    <h2 className="text-2xl md:text-3xl font-light text-gray-100 font-serif leading-tight">{game.title}</h2>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {partnerOnline && (
                        <span className="text-[10px] tracking-widest uppercase text-green-400/80 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                          🦊🦊 {language === 'de' ? 'Zusammen' : 'Together'}
                        </span>
                      )}
                      <span className="text-[10px] tracking-widest uppercase text-[#d97757] bg-[#d97757]/10 px-4 py-1.5 rounded-full border border-[#d97757]/20 font-medium">
                        {game.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tree-style sections */}
              <div className="font-sans leading-relaxed relative">
                {game.sections && game.sections.length > 1 && (
                  <div className="flex justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const allOpen = game.sections!.every((_, i) => openSections.has(i));
                        if (allOpen) {
                          setOpenSections(new Set());
                        } else {
                          setOpenSections(new Set(game.sections!.map((_, i) => i)));
                        }
                      }}
                      className="text-[11px] tracking-widest uppercase text-[#d97757]/60 hover:text-[#d97757] font-medium transition-colors px-3 py-1.5 rounded-lg border border-white/[0.05] hover:border-[#d97757]/20 hover:bg-[#d97757]/5"
                    >
                      {game.sections.every((_, i) => openSections.has(i)) ? 'Alle zuklappen' : 'Alle aufklappen'}
                    </button>
                  </div>
                )}
                {game.sections ? (
                  <div className="relative">
                    {/* Vertical tree line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-[#d97757]/40 via-[#d97757]/20 to-transparent" />

                    {game.sections.map((section, idx) => {
                      const isOpen = openSections.has(idx);
                      return (
                        <div key={idx} className={`relative flex gap-4 mb-4 last:mb-0 float-up-d${Math.min(idx + 1, 3)}`}>
                          {/* Tree node dot */}
                          <div className="relative shrink-0 flex flex-col items-center pt-5">
                            <div className={`w-[10px] h-[10px] rounded-full border-2 bg-[#121418] z-10 transition-all duration-300 ${isOpen ? 'border-[#d97757] shadow-[0_0_8px_rgba(217,119,87,0.3)]' : 'border-white/20'}`} />
                          </div>

                          {/* Section card */}
                          <div className={`flex-1 bg-[#1e2126]/60 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-white/[0.10]' : 'border-white/[0.05]'}`}>
                            <button
                              type="button"
                              onClick={() => toggleSection(idx)}
                              className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors"
                            >
                              <span className="text-[10px] font-medium tracking-widest uppercase text-[#d97757]/60 px-2 py-0.5 rounded font-mono shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <h3 className={`flex-1 font-serif text-base transition-colors ${isOpen ? 'text-[#d97757]' : 'text-gray-300'}`}>
                                {section.title}
                              </h3>
                              <svg
                                className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-5 border-t border-white/[0.04]">
                                <div className="pt-4 relative">
                                  {(() => {
                                    const sectionKey = detectFoxImage({ title: section.title, content: section.content });
                                    return sectionKey !== 'default' ? (
                                      <div className="float-right ml-5 mb-4 p-2 bg-[#121418] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl" style={{ width: '130px', height: '130px' }}>
                                        <img
                                          src={FOX_IMAGES[sectionKey]}
                                          alt=""
                                          className={`w-full h-full object-center opacity-90 transition-opacity hover:opacity-100 ${FOX_IMAGES[sectionKey].includes('fox_pixel_') ? 'object-contain object-bottom' : 'object-cover rounded-lg'}`}
                                        />
                                      </div>
                                    ) : null;
                                  })()}
                                  {(() => {
                                    const { segments } = parseDiceRolls(section.content);
                                    return segments.map((seg, segIdx) => 
                                      seg.type === 'dice' ? (
                                        <DiceRoll key={`dice-${idx}-${segIdx}`} label={seg.label} options={seg.options} />
                                      ) : (
                                        <ReactMarkdown key={`md-${idx}-${segIdx}`} components={markdownComponents}>{seg.content}</ReactMarkdown>
                                      )
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-300 float-up-d1 bg-[#1e2126]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6">
                    {(() => {
                      const { segments } = parseDiceRolls(game.description || '');
                      return segments.map((seg, segIdx) => 
                        seg.type === 'dice' ? (
                          <DiceRoll key={`dice-desc-${segIdx}`} label={seg.label} options={seg.options} />
                        ) : (
                          <ReactMarkdown key={`md-desc-${segIdx}`} components={markdownComponents}>{seg.content}</ReactMarkdown>
                        )
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Refine input — inline in content area */}
              {showRefineInput && (
                <div className="float-up flex gap-2">
                  <input type="text" placeholder="e.g., make round 2 longer, add a blindfold twist..."
                    value={refinementText} onChange={e => setRefinementText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleRefine(); } }}
                    className="flex-1 bg-[#1e2126]/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-5 py-4 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
                    autoFocus
                    disabled={isRefining} />
                  <button onClick={handleRefine} disabled={isRefining}
                    className="px-6 py-4 bg-[#d97757] hover:bg-[#c66849] text-[#121418] rounded-xl text-sm font-medium tracking-wide uppercase transition-all disabled:opacity-50">
                    {isRefining ? '...' : 'Go'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating action bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="bg-gradient-to-t from-[#121418] via-[#121418]/95 to-transparent pt-8 pb-6 px-6">
              <div className="max-w-2xl mx-auto flex items-center gap-2.5">
                <button onClick={() => setShowRefineInput(v => !v)} disabled={isRefining || isComplicating}
                  className={`flex-1 flex justify-center items-center gap-2 backdrop-blur-md rounded-xl py-3.5 px-4 text-sm font-medium tracking-wide uppercase transition-all disabled:opacity-50 ${
                    showRefineInput
                      ? 'bg-[#d97757]/20 border border-[#d97757]/60 text-[#d97757]'
                      : 'bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:bg-white/[0.1] hover:text-white'
                  }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  {t.game.refineButton}
                </button>
                <button onClick={handleComplicate} disabled={isComplicating || isRefining}
                  className="flex-1 flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-[#d97757]/30 hover:border-[#d97757]/60 text-[#d97757] rounded-xl py-3.5 px-4 text-sm font-medium tracking-wide uppercase transition-all disabled:opacity-50">
                  {isComplicating ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {isComplicating ? '...' : t.game.complicateButton}
                </button>
                <button onClick={handleBookmarkGame} disabled={isSavingGame}
                  className="flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:border-[#d97757]/40 text-gray-300 hover:text-[#d97757] rounded-xl py-3.5 px-4 text-sm transition-all disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
                <button onClick={handleExportPdf}
                  className="flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:border-white/[0.15] text-gray-400 hover:text-gray-200 rounded-xl py-3.5 px-4 text-sm transition-all"
                  title={t.game.exportPdfButton}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17h6m-6-4h6m-6-4h2" /></svg>
                </button>
                <button onClick={handleSaveGame}
                  className="flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:border-white/[0.15] text-gray-400 hover:text-gray-200 rounded-xl py-3.5 px-4 text-sm transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className="animate-fade-in bg-[#1a1d23]/95 backdrop-blur-md border border-white/[0.1] rounded-xl px-5 py-3 shadow-2xl text-sm text-gray-200 pointer-events-auto"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 1px rgba(217,119,87,0.2)' }}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1a1d23] border border-[#d97757]/40 rounded-xl p-4 shadow-2xl min-w-[220px]"
          style={{ boxShadow: '0 4px 32px rgba(217,119,87,0.18), 0 0 1px rgba(217,119,87,0.4)' }}>
          <p className="text-[10px] tracking-[0.2em] text-[#d97757] uppercase font-semibold mb-3">Admin Mode 🔧</p>
          <label className="text-[10px] tracking-[0.15em] text-gray-400 uppercase font-medium block mb-1.5">Model Override</label>
          <select
            value={adminModel}
            onChange={e => handleAdminModelChange(e.target.value)}
            className="w-full bg-[#121418] border border-white/[0.12] rounded-lg px-3 py-2 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#d97757]/60 focus:border-[#d97757]/40 transition-all"
          >
            <option value="">— default —</option>
            <option value="claude-haiku-4-5-20251001">claude-haiku-4-5</option>
            <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
            <option value="opus4.6">opus4.6</option>
            <option value="gemini-2.0-flash-exp">gemini-2.0-flash</option>
            <option value="gemini-3.1-flash-preview">gemini-3.1-flash</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro</option>
            <option value="grok">grok</option>
            <option value="grok-fast">grok-fast</option>
          </select>
          {adminModel && (
            <p className="mt-2 text-[10px] text-[#d97757]/70 truncate">Active: {adminModel}</p>
          )}
        </div>
      )}
    </main>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#121418] flex items-center justify-center text-gray-400">{t.login.loading}</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121418] flex items-center justify-center text-[#d97757]">{t.login.loading}</div>}>
      <HomeContent session={session} />
    </Suspense>
  );
}
