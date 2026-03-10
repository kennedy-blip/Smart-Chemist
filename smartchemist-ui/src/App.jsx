import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// --- PRODUCTION CONFIG ---
const RENDER_BACKEND_URL = "https://smart-chemist.onrender.com";

function App() {
  const [mode, setMode] = useState('medical'); 
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('connecting');
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, isLoading]);

  // Health check to ensure the Render backend is awake
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(RENDER_BACKEND_URL);
        if (res.ok) setStatus('online');
        else setStatus('offline');
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
      // Determine the correct API endpoint and payload based on mode
      const path = mode === 'medical' ? 'medical/analyze' : 'therapy/session';
      const payload = mode === 'medical' ? { symptoms: input } : { message: input };

      const response = await fetch(`${RENDER_BACKEND_URL}/api/v1/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Backend failed to respond');

      const result = await response.json();
      
      // We assume your FastAPI returns { "data": "AI Response Text" }
      setChat(prev => [...prev, { role: 'bot', content: result.data }]);
      setStatus('online');
    } catch (error) {
      console.error("Connection Error:", error);
      setStatus('offline');
      setChat(prev => [...prev, { 
        role: 'bot', 
        content: "### ⚠️ System Connection Error\nI cannot reach the SmartChemist server at Render. Please wait a moment while the server spins up (Render 'Free Tier' sleeps after inactivity)." 
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
              {status === 'online' ? 'Production Online' : 'Connecting to Render...'}
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
            <span className="text-2xl">🩺</span>
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
            Target: {RENDER_BACKEND_URL}
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#0f172a]">
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8"
        >
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                <span className="text-4xl">{mode === 'medical' ? '⚕️' : '✨'}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">
                {mode === 'medical' ? 'Medical Symptom Analyzer' : 'Therapy Support Bot'}
              </h2>
              <p className="text-slate-500 max-w-sm text-sm">
                Powered by Llama 3.3. {mode === 'medical' ? 'Describe your symptoms.' : 'How are you feeling today?'}
              </p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[80%] p-5 rounded-2xl
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}
              `}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 animate-pulse text-xs text-slate-400">
                SmartChemist is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-[#0f172a] border-t border-slate-800">
          <form 
            onSubmit={handleSend}
            className="max-w-3xl mx-auto flex gap-2"
          >
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              placeholder={mode === 'medical' ? "Enter symptoms..." : "Type your message..."}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-8 rounded-xl font-bold transition-all"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;