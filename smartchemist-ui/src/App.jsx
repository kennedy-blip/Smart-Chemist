/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [mode, setMode] = useState('medical'); 
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('online'); // online, offline, or connecting
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, isLoading]);

  // Check backend health on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('http://localhost:8080/docs');
        if (res.ok) setStatus('online');
      } catch {
        setStatus('offline');
      }
    };
    checkServer();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setChat(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const path = mode === 'medical' ? 'medical/analyze' : 'therapy/session';
      const payload = mode === 'medical' ? { symptoms: input } : { message: input };

      const response = await fetch(`http://localhost:8080/api/v1/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      setChat(prev => [...prev, { role: 'bot', content: result.data }]);
      setStatus('online');
    } catch (error) {
      setStatus('offline');
      setChat(prev => [...prev, { 
        role: 'bot', 
        content: "### ⚠️ System Connection Error\nI cannot reach the SmartChemist server. Please ensure the FastAPI backend is running on port 8080." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-80 bg-[#0b1120] border-r border-slate-800 p-6 flex flex-col shadow-2xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">🧪</span>
            <h1 className="text-2xl font-black tracking-tighter text-white">SmartChemist</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {status === 'online' ? 'System Online' : 'System Offline'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setMode('medical')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
              mode === 'medical' 
              ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
              : 'border-transparent text-slate-500 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-2xl">🏥</span>
            <div className="text-left">
              <div className="font-bold text-sm">Medical Hub</div>
              <div className="text-[10px] opacity-50 uppercase">Diagnostic Engine</div>
            </div>
          </button>

          <button 
            onClick={() => setMode('therapy')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
              mode === 'therapy' 
              ? 'bg-purple-600/10 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
              : 'border-transparent text-slate-500 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-2xl">🧠</span>
            <div className="text-left">
              <div className="font-bold text-sm">Therapy Lounge</div>
              <div className="text-[10px] opacity-50 uppercase">CBT & Wellness</div>
            </div>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tighter">
            University Project: Data Science <br/>
            Engine: Llama 3.3 (Groq)
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0f172a] to-[#0f172a]">
        
        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth"
        >
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10 animate-pulse">
                <span className="text-5xl">{mode === 'medical' ? '🩺' : '🧘'}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">
                {mode === 'medical' ? 'Medical Diagnostic Mode' : 'Mental Wellness Mode'}
              </h2>
              <p className="text-slate-500 max-w-sm text-sm">
                {mode === 'medical' 
                  ? 'Describe your symptoms clearly for a generated health analysis.' 
                  : 'Share your thoughts or stresses in a safe, non-judgmental space.'}
              </p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`
                max-w-[85%] md:max-w-[70%] p-6 rounded-3xl shadow-xl
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1e293b]/80 backdrop-blur-md text-slate-200 border border-slate-700/50 rounded-tl-none'}
              `}>
                <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:mb-2 prose-p:leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b] p-6 rounded-3xl rounded-tl-none border border-slate-700/50 flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-8">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto flex items-center gap-3 bg-[#1e293b]/50 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 focus-within:border-blue-500/50 transition-all shadow-2xl"
          >
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent p-4 outline-none text-slate-100 placeholder-slate-500 text-sm md:text-base"
              placeholder={mode === 'medical' ? "Describe symptoms..." : "Talk to me..."}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all shadow-lg active:scale-95 group"
            >
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
          <p className="text-center text-[9px] uppercase tracking-[0.3em] text-slate-600 mt-6 font-bold">
            Data Science Capstone Project • Meru University
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;