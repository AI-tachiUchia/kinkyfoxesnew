"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import PixelScene from "./components/PixelScene";

function Auth() {
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
        <h1 className="text-3xl font-light text-center text-gray-200 mb-2 font-serif tracking-wide">Private Access</h1>
        <p className="text-center text-gray-400 text-sm mb-8 tracking-widest uppercase font-light">Partner Portal Login</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              required />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded border border-red-400/20">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gray-200 hover:bg-white text-[#121418] font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign In'}
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

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room');

  const [distance, setDistance] = useState("");
  const [customDistance, setCustomDistance] = useState("");
  const [toys, setToys] = useState("");
  const [vibe, setVibe] = useState("");
  const [template, setTemplate] = useState("");
  const [heatLevel, setHeatLevel] = useState(3);
  const [game, setGame] = useState<GeneratedGame | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplicating, setIsComplicating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const [savedToys, setSavedToys] = useState<Toy[]>([]);
  const [selectedToyIds, setSelectedToyIds] = useState<Set<string>>(new Set());
  const [newToyName, setNewToyName] = useState("");
  const [isAddingToy, setIsAddingToy] = useState(false);
  const [showToybox, setShowToybox] = useState(true);
  const [showHeatLegend, setShowHeatLegend] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);
  const [refinementText, setRefinementText] = useState("");
  const [showRefineInput, setShowRefineInput] = useState(false);

  type ViewState = 'setup' | 'generating' | 'game';
  const [view, setView] = useState<ViewState>('setup');
  const [viewAnim, setViewAnim] = useState('');

  const [savedGames, setSavedGames] = useState<{id: string, title: string, game_data: GeneratedGame, created_at: string}[]>([]);
  const [showSavedGames, setShowSavedGames] = useState(false);
  const [isSavingGame, setIsSavingGame] = useState(false);

  const [partnerToys, setPartnerToys] = useState<Toy[]>([]);
  const [channel, setChannel] = useState<any>(null);

  const stateRef = useRef({ distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys });
  useEffect(() => {
    stateRef.current = { distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys };
  }, [distance, customDistance, toys, vibe, template, game, isGenerating, isComplicating, isRefining, savedToys]);

  // Initialize Room ID
  useEffect(() => {
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substring(2, 9);
      router.replace(`/?room=${newRoomId}`);
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
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

  const broadcastState = (updates: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'state-sync',
        payload: updates
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Partner link copied to clipboard!");
    }
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
    const distances = ['same-room', 'tied-up', 'long-distance', 'public'];
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
        body: JSON.stringify({ action: "generate", distance: randomDistance, customDistance: '', toys: [randomToys, partnerToys.map(t => t.name).join(', ')].filter(Boolean).join(', '), vibe: randomVibe, template: randomTemplate, heatLevel }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setGame(data);
      setIsGenerating(false);
      setIsSurprising(false);
      transitionTo('game');
      broadcastState({ game: data, isGenerating: false });
    } catch (error) {
      console.error(error);
      alert('Error generating surprise game.');
      setIsGenerating(false);
      setIsSurprising(false);
      transitionTo('setup');
      broadcastState({ isGenerating: false });
    }
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
          distance,
          customDistance,
          toys: [toys, partnerToys.map(t => t.name).join(', ')].filter(Boolean).join(', '),
          vibe,
          template,
          heatLevel,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate game');

      const data = await response.json();
      setGame(data);
      setIsGenerating(false);
      transitionTo('game');
      broadcastState({ game: data, isGenerating: false });
    } catch (error) {
      console.error(error);
      alert('Error generating game. Please check the console.');
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
          currentGame: game
        }),
      });

      if (!response.ok) throw new Error('Failed to complicate game');

      const data = await response.json();
      setGame(data);
      broadcastState({ game: data, isComplicating: false });
    } catch (error) {
      console.error(error);
      alert('Error complicating game.');
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
          currentGame: game,
          refinement: refinementText || undefined
        }),
      });

      if (!response.ok) throw new Error('Failed to refine game');

      const data = await response.json();
      setGame(data);
      setRefinementText("");
      setShowRefineInput(false);
      broadcastState({ game: data, isRefining: false });
    } catch (error) {
      console.error(error);
      alert('Error refining game.');
      broadcastState({ isRefining: false });
    } finally {
      setIsRefining(false);
    }
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
          alert('Invalid game file format.');
        }
      } catch (error) {
        alert('Error parsing JSON file.');
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

  const inputCls = "w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all";
  const labelCls = "text-xs font-medium tracking-[0.15em] text-gray-400 uppercase";

  return (
    <main className="min-h-screen bg-[#121418] relative overflow-hidden font-sans">
      {/* Global nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {view !== 'setup' && (
          <button onClick={handleBackToSetup}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs tracking-widest uppercase">Settings</span>
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => supabase.auth.signOut()}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors tracking-widest uppercase">
          Sign Out
        </button>
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
                {roomId && (
                  <button onClick={handleCopyLink}
                    className="text-xs tracking-widest uppercase text-[#d97757] bg-[#d97757]/10 hover:bg-[#d97757]/20 px-4 py-2 rounded-full border border-[#d97757]/20 transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy Partner Link
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm tracking-widest uppercase font-light">Curated experiences for you</p>
            </div>

            {/* Pixel animation */}
            <div className="w-full max-w-sm opacity-80">
              <PixelScene isGenerating={isGenerating} game={game} heatLevel={heatLevel} />
            </div>

            {/* Config card */}
            <div className="w-full bg-[#1e2126]/60 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-white/[0.05] space-y-8">

              <div className="space-y-3">
                <label className={labelCls}>Distance / Setup</label>
                <select className={inputCls} value={distance} onChange={handleChange(setDistance, 'distance')}>
                  <option value="" disabled>Select your setup...</option>
                  <option value="same-room">Same Room</option>
                  <option value="tied-up">One Partner Restrained</option>
                  <option value="long-distance">Long Distance (Video/Text)</option>
                  <option value="public">Public / Discreet</option>
                  <option value="custom">Custom</option>
                </select>
                {distance === 'custom' && (
                  <input type="text" placeholder="Enter custom setup..." className={inputCls}
                    value={customDistance} onChange={handleChange(setCustomDistance, 'customDistance')} />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Toybox</label>
                  <button type="button" onClick={() => setShowToybox(v => !v)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors tracking-widest uppercase">
                    {showToybox ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showToybox && (
                  <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-3 space-y-3">
                    {savedToys.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {savedToys.map(toy => (
                          <div key={toy.id} className="flex items-center gap-0.5">
                            <button type="button" onClick={() => handleToggleToy(toy.id)}
                              className={`px-3 py-1.5 rounded-l-full text-xs font-medium tracking-wide transition-all border-y border-l ${
                                selectedToyIds.has(toy.id)
                                  ? 'bg-[#d97757]/20 border-[#d97757]/50 text-[#d97757]'
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                              }`}>
                              {toy.name}
                            </button>
                            <button type="button" onClick={() => handleDeleteToy(toy.id)}
                              className={`px-2 py-1.5 rounded-r-full text-xs transition-all border-y border-r ${
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
                      <p className="text-gray-600 text-xs">No items saved yet.</p>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g. vibrators, rope and a camera..."
                        value={newToyName} onChange={e => setNewToyName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddToy(); } }}
                        className="flex-1 bg-[#1e2126] border border-white/[0.08] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all" />
                      <button type="button" onClick={handleAddToy} disabled={isAddingToy || !newToyName.trim()}
                        className="px-4 py-2 bg-[#d97757]/20 hover:bg-[#d97757]/30 border border-[#d97757]/30 text-[#d97757] rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                        {isAddingToy ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
                {partnerToys.length > 0 && (
                  <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-3 space-y-2">
                    <label className={labelCls}>Partner&apos;s Items</label>
                    <div className="flex flex-wrap gap-2">
                      {partnerToys.map(toy => (
                        <span key={toy.id}
                          className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-purple-500/15 border border-purple-400/30 text-purple-300">
                          {toy.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2 pt-1">
                  <label className={labelCls}>Available Items</label>
                  <input type="text" placeholder="e.g., blindfold, ice..." className={inputCls}
                    value={toys} onChange={handleChange(setToys, 'toys')} />
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelCls}>Atmosphere</label>
                <textarea placeholder="e.g., slow tease, intense, sensory deprivation..."
                  className={`${inputCls} h-28 resize-none`}
                  value={vibe} onChange={handleChange(setVibe, 'vibe')} />
              </div>

              <div className="space-y-3">
                <label className={labelCls}>Game Template</label>
                <select className={inputCls} value={template} onChange={handleChange(setTemplate, 'template')}>
                  <option value="">No Template (Freeform)</option>
                  <option value="Classic Truth or Dare">Classic Truth or Dare</option>
                  <option value="Roleplay Scenario">Roleplay Scenario</option>
                  <option value="Tease & Denial">Tease & Denial</option>
                  <option value="Sensory Deprivation">Sensory Deprivation</option>
                  <option value="Punishment & Reward">Punishment & Reward</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    Heat Level — <span className="text-[#d97757]">{['Cozy', 'Flirty', 'Heated', 'Spicy', 'Unhinged'][heatLevel - 1]}</span>
                  </label>
                  <button type="button" onClick={() => setShowHeatLegend(v => !v)}
                    className="text-xs text-gray-500 hover:text-[#d97757] transition-colors tracking-widest uppercase">
                    {showHeatLegend ? 'Hide' : 'What does this mean?'}
                  </button>
                </div>
                <input type="range" min={1} max={5} value={heatLevel}
                  onChange={e => setHeatLevel(Number(e.target.value))}
                  className="w-full accent-[#d97757] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-600 tracking-wide px-0.5">
                  {['1','2','3','4','5'].map(n => <span key={n}>{n}</span>)}
                </div>
                {showHeatLegend && (
                  <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-4 space-y-2 text-xs text-gray-400">
                    {[
                      ['1 — Cozy', 'Foot rubs and prolonged eye contact. Your grandma could watch.'],
                      ['2 — Flirty', 'Compliments that are definitely flirting. Deniable, barely.'],
                      ['3 — Heated', "Things you'd google in incognito. The sweet spot."],
                      ['4 — Spicy', 'Requires a safeword check-in. The neighbours might hear.'],
                      ['5 — Unhinged', 'Please stay hydrated. You asked for this.'],
                    ].map(([label, desc]) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-[#d97757] font-medium shrink-0 w-24">{label}</span>
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleGenerate}
                  disabled={isGenerating || !distance || (distance === 'custom' && !customDistance)}
                  className="flex-1 flex justify-center items-center gap-2 bg-[#d97757] hover:bg-[#c66849] text-[#121418] font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  Create Experience
                </button>
                <button onClick={handleSurprise} disabled={isGenerating}
                  className="flex-shrink-0 flex justify-center items-center gap-2 bg-[#121418] hover:bg-[#1a1d24] border border-[#d97757]/40 hover:border-[#d97757] text-[#d97757] font-medium text-sm tracking-wide uppercase py-4 px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Surprise
                </button>
              </div>

              <label className="w-full flex justify-center items-center gap-2 bg-[#121418] hover:bg-[#1a1d24] border border-white/[0.08] hover:border-white/[0.15] text-gray-300 font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors cursor-pointer">
                Import JSON
                <input type="file" accept=".json" className="hidden" onChange={handleImportGame} />
              </label>

              {/* Saved Games */}
              <div className="space-y-3 pt-2 border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Saved Games</label>
                  <button type="button" onClick={() => setShowSavedGames(v => !v)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors tracking-widest uppercase">
                    {showSavedGames ? 'Hide' : `Show (${savedGames.length})`}
                  </button>
                </div>
                {showSavedGames && (
                  <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-3 space-y-2">
                    {savedGames.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {savedGames.map(sg => (
                          <div key={sg.id} className="flex items-center justify-between gap-2 bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 hover:border-white/[0.15] transition-all">
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
                      <p className="text-gray-600 text-xs">No saved games yet. Bookmark a game to see it here.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ GENERATING VIEW ═══════ */}
      {view === 'generating' && (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${viewAnim}`}>
          <div className="relative flex flex-col items-center gap-8">
            {/* Pulsing glow orb */}
            <div className="absolute w-[300px] h-[300px] bg-[#d97757]/20 rounded-full blur-[100px] pulse-glow" />

            {/* Pixel scene as loading animation */}
            <div className="relative w-full max-w-xs opacity-90 z-10">
              <PixelScene isGenerating={true} game={null} heatLevel={heatLevel} />
            </div>

            {/* Loading text */}
            <div className="z-10 text-center space-y-3">
              <p className="text-lg font-serif text-gray-200 font-light breathe">
                Crafting your experience...
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#d97757]"
                    style={{ animation: `blink 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ GAME VIEW ═══════ */}
      {view === 'game' && game && (
        <div className={`min-h-screen flex flex-col ${viewAnim}`}>
          {/* Game content — scrollable area with bottom padding for action bar */}
          <div className="flex-1 overflow-y-auto game-scroll pt-16 pb-32 px-6 sm:px-12 md:px-24">
            <div className="max-w-2xl mx-auto space-y-8">

              {/* Title header */}
              <div className="float-up space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <h2 className="text-3xl md:text-4xl font-light text-gray-100 font-serif leading-tight">{game.title}</h2>
                  <span className="shrink-0 text-xs tracking-widest uppercase text-[#d97757] bg-[#d97757]/10 px-4 py-1.5 rounded-full border border-[#d97757]/20">
                    {game.duration}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-[#d97757]/40 via-[#d97757]/10 to-transparent" />
              </div>

              {/* Sections */}
              <div className="font-sans leading-relaxed space-y-4">
                {game.sections ? (
                  game.sections.map((section, idx) => (
                    <details key={idx}
                      className={`group bg-[#1e2126]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 open:bg-[#1e2126]/80 open:border-white/[0.12] float-up-d${Math.min(idx + 1, 3)}`}
                      open={idx === 0}>
                      <summary className="cursor-pointer p-6 font-serif text-lg text-gray-200 hover:text-[#d97757] transition-colors flex justify-between items-center select-none">
                        {section.title}
                        <span className="text-[#d97757]/60 group-hover:text-[#d97757] transform group-open:rotate-180 transition-all duration-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 pt-2 border-t border-white/[0.03]">
                        <ReactMarkdown components={markdownComponents}>{section.content}</ReactMarkdown>
                      </div>
                    </details>
                  ))
                ) : (
                  <div className="text-gray-300 float-up-d1 bg-[#1e2126]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6">
                    <ReactMarkdown components={markdownComponents}>{game.description || ''}</ReactMarkdown>
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
              <div className="max-w-2xl mx-auto flex items-center gap-3">
                <button onClick={() => setShowRefineInput(v => !v)} disabled={isRefining || isComplicating}
                  className={`flex-1 flex justify-center items-center gap-2 backdrop-blur-md rounded-xl py-3.5 px-4 text-sm font-medium tracking-wide uppercase transition-all disabled:opacity-50 ${
                    showRefineInput
                      ? 'bg-[#d97757]/20 border border-[#d97757]/60 text-[#d97757]'
                      : 'bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:bg-white/[0.1] hover:text-white'
                  }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Refine
                </button>
                <button onClick={handleComplicate} disabled={isComplicating || isRefining}
                  className="flex-1 flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-[#d97757]/30 hover:border-[#d97757]/60 text-[#d97757] rounded-xl py-3.5 px-4 text-sm font-medium tracking-wide uppercase transition-all disabled:opacity-50">
                  {isComplicating ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {isComplicating ? '...' : 'Escalate'}
                </button>
                <button onClick={handleBookmarkGame} disabled={isSavingGame}
                  className="flex justify-center items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:border-[#d97757]/40 text-gray-300 hover:text-[#d97757] rounded-xl py-3.5 px-4 text-sm transition-all disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
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
    </main>
  );
}

export default function Home() {
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
    return <div className="min-h-screen bg-[#121418] flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121418] flex items-center justify-center text-[#d97757]">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
