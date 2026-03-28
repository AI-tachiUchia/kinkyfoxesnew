"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
        <h1 className="text-3xl font-light text-center text-gray-200 mb-2 font-serif tracking-wide">
          Private Access
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8 tracking-widest uppercase font-light">
          Partner Portal Login
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded border border-red-400/20">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-white text-[#121418] font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
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

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room');

  const [distance, setDistance] = useState("");
  const [customDistance, setCustomDistance] = useState("");
  const [toys, setToys] = useState("");
  const [vibe, setVibe] = useState("");
  const [game, setGame] = useState<GeneratedGame | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplicating, setIsComplicating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineText, setRefineText] = useState("");

  const [channel, setChannel] = useState<any>(null);

  const stateRef = useRef({ distance, customDistance, toys, vibe, game });
  useEffect(() => {
    stateRef.current = { distance, customDistance, toys, vibe, game };
  }, [distance, customDistance, toys, vibe, game]);

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
        if (payload.game !== undefined) setGame(payload.game);
      })
      .on('broadcast', { event: 'request-sync' }, () => {
        const currentState = stateRef.current;
        if (currentState.distance || currentState.customDistance || currentState.toys || currentState.vibe || currentState.game) {
          newChannel.send({
            type: 'broadcast',
            event: 'state-sync',
            payload: currentState
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGame(null);
    setRefineText("");
    broadcastState({ game: null });
    
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
          toys,
          vibe,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate game');

      const data = await response.json();
      setGame(data);
      broadcastState({ game: data });
    } catch (error) {
      console.error(error);
      alert('Error generating game. Please check the console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplicate = async () => {
    if (!game) return;
    setIsComplicating(true);

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
      broadcastState({ game: data });
    } catch (error) {
      console.error(error);
      alert('Error complicating game.');
    } finally {
      setIsComplicating(false);
    }
  };

  const handleRefine = async () => {
    if (!game || !refineText.trim()) return;
    setIsRefining(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "refine",
          currentGame: game,
          refinement: refineText
        }),
      });

      if (!response.ok) throw new Error('Failed to refine game');

      const data = await response.json();
      setGame(data);
      broadcastState({ game: data });
      setRefineText("");
    } catch (error) {
      console.error(error);
      alert('Error refining game.');
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-[#121418] relative overflow-hidden font-sans">
      <button 
        onClick={() => supabase.auth.signOut()}
        className="absolute top-6 right-8 text-xs text-gray-500 hover:text-gray-300 transition-colors z-50 tracking-widest uppercase"
      >
        Sign Out
      </button>

      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-[#d97757]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-[#b87363]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="z-10 max-w-2xl w-full flex flex-col items-center gap-10">
        
        <div className="text-center space-y-4 animate-fade-in-down">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-300 to-[#d97757] font-serif">
              Kinky Fox
            </h1>
            {roomId && (
              <button
                onClick={handleCopyLink}
                className="text-xs tracking-widest uppercase text-[#d97757] bg-[#d97757]/10 hover:bg-[#d97757]/20 px-4 py-2 rounded-full border border-[#d97757]/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Partner Link
              </button>
            )}
          </div>
          <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase font-light">
            Curated experiences for you
          </p>
        </div>

        <div className="w-full bg-[#1e2126]/60 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-white/[0.05] space-y-8 relative overflow-hidden">
          
          <div className="space-y-3">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Distance / Setup</label>
            <select 
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              value={distance}
              onChange={handleChange(setDistance, 'distance')}
            >
              <option value="" disabled>Select your setup...</option>
              <option value="same-room">Same Room</option>
              <option value="tied-up">One Partner Restrained</option>
              <option value="long-distance">Long Distance (Video/Text)</option>
              <option value="public">Public / Discreet</option>
              <option value="custom">Custom</option>
            </select>
            
            {distance === "custom" && (
              <input 
                type="text" 
                placeholder="Enter custom setup..." 
                className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all mt-3"
                value={customDistance}
                onChange={handleChange(setCustomDistance, 'customDistance')}
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Available Items</label>
            <input 
              type="text" 
              placeholder="e.g., blindfold, ice..." 
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
              value={toys}
              onChange={handleChange(setToys, 'toys')}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Atmosphere</label>
            <textarea 
              placeholder="e.g., slow tease, intense, sensory deprivation..." 
              className="w-full bg-[#121418] border border-white/[0.08] rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all h-28 resize-none"
              value={vibe}
              onChange={handleChange(setVibe, 'vibe')}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !distance || (distance === 'custom' && !customDistance)}
            className="w-full flex justify-center items-center gap-2 bg-[#d97757] hover:bg-[#c66849] text-[#121418] font-medium text-sm tracking-wide uppercase py-4 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#121418]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Curating experience...</span>
              </>
            ) : (
              <span>Create Experience</span>
            )}
          </button>
        </div>

        {game && (
          <div className="w-full bg-[#1e2126]/80 backdrop-blur-xl p-8 sm:p-12 rounded-2xl shadow-2xl border border-white/[0.08] animate-[slide-up_0.5s_ease-out] relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-white/[0.05] pb-6">
              <h2 className="text-2xl md:text-3xl font-light text-gray-100 font-serif">
                {game.title}
              </h2>
              <span className="shrink-0 text-xs tracking-widest uppercase text-[#d97757] bg-[#d97757]/10 px-3 py-1 rounded-full border border-[#d97757]/20">
                {game.duration}
              </span>
            </div>
            
            <div className="font-sans leading-relaxed space-y-4">
              {game.sections ? (
                game.sections.map((section, idx) => (
                  <details 
                    key={idx} 
                    className="group bg-[#121418]/50 border border-white/[0.08] rounded-xl overflow-hidden mb-4 transition-all duration-300 open:bg-[#121418]/80 open:border-white/[0.15]"
                    open={idx === 0}
                  >
                    <summary className="cursor-pointer p-5 font-serif text-lg text-gray-200 hover:text-[#d97757] transition-colors flex justify-between items-center select-none">
                      {section.title}
                      <span className="text-[#d97757] transform group-open:rotate-180 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </summary>
                    <div className="p-5 pt-2 border-t border-white/[0.02]">
                      <ReactMarkdown components={markdownComponents}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </details>
                ))
              ) : (
                <div className="text-gray-300">
                  <ReactMarkdown components={markdownComponents}>
                    {game.description || ""}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-white/[0.05]">
              <button 
                onClick={handleComplicate}
                disabled={isComplicating}
                className="flex-1 flex justify-center items-center gap-2 bg-[#121418] hover:bg-[#1a1d24] border border-[#d97757]/50 hover:border-[#d97757] text-[#d97757] font-medium text-sm tracking-wide uppercase py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isComplicating ? 'Complicating...' : 'Complicate Game'}
              </button>
              
              <button 
                onClick={handleSaveGame}
                className="flex-1 flex justify-center items-center gap-2 bg-[#121418] hover:bg-[#1a1d24] border border-white/[0.1] hover:border-white/[0.2] text-gray-300 font-medium text-sm tracking-wide uppercase py-3 px-4 rounded-lg transition-all duration-300"
              >
                Save as JSON
              </button>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.05] space-y-4">
              <label className="text-xs font-medium tracking-[0.15em] text-gray-400 uppercase">Tweak & Refine</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder='e.g., "Make it more about blindfolds" or "Shorter duration"' 
                  className="flex-1 bg-[#121418] border border-white/[0.08] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d97757] focus:border-[#d97757] transition-all"
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRefine();
                  }}
                />
                <button 
                  onClick={handleRefine}
                  disabled={isRefining || !refineText.trim()}
                  className="bg-[#d97757] hover:bg-[#c66849] text-[#121418] font-medium text-sm tracking-wide uppercase px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefining ? '...' : 'Send'}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
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
