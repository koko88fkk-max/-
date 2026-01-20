
import React, { useState, useRef, useEffect } from 'react';
import { Message, BotStatus, Product } from './types';
import { Icons } from './constants';
import { sendMessage, initChat, textToSpeech, decodeBase64, decodeAudioData } from './services/gemini';
import ProductCard from './components/ProductCard';
import InstructionGuide from './components/InstructionGuide';

const PRODUCTS: Product[] = [
  {
    name: "فك باند فورت (Spoofer)",
    price: "49.99 ريال",
    features: ["يفك باند البطولات", "نسبة نجاح 100%", "يدعم جميع اللوحات بلا استثناء", "فك نهائي (PERM)"],
    support: "ويندوز 10/11 - جميع المذربوردات",
    delivery: "فوري (كود) إيميل/SMS",
    image: "https://cdn-icons-png.flaticon.com/512/9440/9440333.png",
    link: "https://salla.sa/t3nn/BpwOKQa"
  },
  {
    name: "T3N PERM SPOOFER",
    price: "30 ريال",
    features: ["إصلاح سيريالات نهائي", "يدعم FiveM, Valorant, Rust", "متوافق حتى إصدار 25H2", "استعمال مرة واحدة فقط"],
    support: "ويندوز 10/11 - فك نهائي",
    delivery: "فوري (كود) إيميل/SMS",
    image: "https://cdn-icons-png.flaticon.com/512/903/903417.png",
    link: "https://salla.sa/t3nn/EXGRXdv"
  }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'يا هلا ومرحبا بك في متجر T3N! أبشر بسعدك، معك المساعد الذكي وجاهز لأي استفسار بخصوص السبوفر وفك الباند. وش ودك تسأل عنه؟ إذا عندك خطأ صور الشاشة (Win+Shift+S) وألصقها هنا مباشرة (Ctrl+V). إذا تبي تشوف شرح التشغيل بالصور اضغط على زر "دليل التشغيل" تحت.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<BotStatus>(BotStatus.IDLE);
  const [showGuide, setShowGuide] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // حالات الصوت
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    initChat();
    return () => {
      stopSpeaking();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const stopSpeaking = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // تجاهل الأخطاء إذا كان الصوت متوقفاً بالفعل
      }
      currentSourceRef.current = null;
    }
    setSpeakingMsgId(null);
    setIsAudioLoading(false);
  };

  const handleSpeak = async (msgId: string, text: string) => {
    // إذا كان نفس المقطع يشتغل حالياً، وقفه (Toggle Off)
    if (speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    // وقف أي صوت شغال قبل تبدأ الجديد
    stopSpeaking();
    setSpeakingMsgId(msgId);
    setIsAudioLoading(true);

    try {
      // إنشاء AudioContext عند الحاجة فقط
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // طلب الصوت من الـ API
      const base64Audio = await textToSpeech(text);
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);

      setIsAudioLoading(false);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        // لا تمسح الـ ID إلا إذا كان هو نفسه المقطع الحالي
        setSpeakingMsgId(current => current === msgId ? null : current);
      };

      currentSourceRef.current = source;
      source.start(0);
    } catch (error) {
      console.error("Speech Logic Error:", error);
      stopSpeaking();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || status === BotStatus.THINKING) return;

    stopSpeaking(); // وقف الصوت إذا المستخدم أرسل رسالة جديدة
    const currentImage = selectedImage;
    const currentInput = input;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput || (currentImage ? "(أرسل صورة)" : ""),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setStatus(BotStatus.THINKING);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const base64Data = currentImage ? currentImage.split(',')[1] : undefined;
      const stream = await sendMessage(currentInput, base64Data);
      let fullText = '';
      
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => 
            prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m)
          );
        }
      }
      setStatus(BotStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(BotStatus.ERROR);
      setMessages(prev => 
        prev.map(m => m.id === assistantMsgId ? { ...m, content: 'يا غالي السموحة، واجهت مشكلة تقنية بسيطة. جرب ترسل مرة ثانية أو تواصل معنا ديسكورد.' } : m)
      );
    }
  };

  const formatMessage = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s<>()[\]{}|\\^`"']+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
      if (part.startsWith('http')) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 font-bold break-all">{part}</a>;
      }
      return part;
    });
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Icons.Robot />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">مساعد T3N</h1>
          <p className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-wider">متجر الحلول النهائية</p>
        </div>
      </div>
      <button onClick={() => { setShowGuide(true); setIsSidebarOpen(false); }} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-amber-400 py-4 rounded-2xl font-bold transition-all group">
        <Icons.Book /> <span>دليل التشغيل (بالصور)</span>
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
      </button>
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">المنتجات المميزة</h2>
        {PRODUCTS.map((p, i) => <ProductCard key={i} product={p} />)}
      </div>
      <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
        <a href="https://discord.gg/T3N" target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#5865F2] py-3 rounded-xl font-bold shadow-lg"><Icons.Discord /> ديسكورد المتجر</a>
        <a href="https://salla.sa/t3nn" target="_blank" className="flex items-center justify-center gap-2 w-full bg-zinc-900 py-3 rounded-xl font-bold"><Icons.Store /> رابط المتجر</a>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#020408] relative overflow-hidden text-white selection:bg-[#1e3a5f]/30">
      {showGuide && <InstructionGuide onClose={() => setShowGuide(false)} />}
      
      <aside className="hidden md:flex w-80 lg:w-88 bg-black border-l border-white/5 p-6 flex-col gap-6 overflow-y-auto custom-scrollbar relative z-10">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-50 transition-all md:hidden ${isSidebarOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/80" onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`absolute top-0 right-0 w-80 h-full bg-black p-6 flex flex-col gap-6 transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <SidebarContent />
        </aside>
      </div>

      <main className="flex-1 flex flex-col relative h-full z-10 bg-[#05070a] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-black border-b border-white/5 md:bg-transparent md:border-none">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-zinc-900 rounded-lg text-zinc-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <div dir="ltr" className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1e3a5f]/30 bg-[#05070a]"><span className="text-[#1e3a5f] font-black text-[10px] tracking-tighter">T</span><span className="text-white font-black text-[10px] tracking-tighter">3N</span></div>
             <span className="font-bold text-sm md:text-base">مساعد متجر T3N</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                <div className={`max-w-[95%] md:max-w-[85%] flex gap-2 md:gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="mt-1 shrink-0">
                    {msg.role === 'assistant' ? (
                      <div dir="ltr" className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg border border-[#1e3a5f]/30 bg-[#05070a]">
                         <span className="text-[#1e3a5f] font-black text-[8px] md:text-[10px] tracking-tighter">T</span><span className="text-white font-black text-[8px] md:text-[10px] tracking-tighter">3N</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#0f172a] border border-white/10 flex items-center justify-center text-zinc-500">
                        <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className={`relative p-4 md:p-5 rounded-xl md:rounded-2xl text-[13px] md:text-[15px] leading-relaxed shadow-2xl transition-all ${msg.role === 'user' ? 'bg-[#0f172a] border border-white/5 text-zinc-200 rounded-tr-none' : 'bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 text-zinc-100 rounded-tl-none hover:bg-[#1e3a5f]/15'}`}>
                    <div className="whitespace-pre-wrap">{formatMessage(msg.content)}</div>
                    
                    {msg.role === 'assistant' && msg.content !== '' && (
                      <div className="absolute -bottom-3 -left-2 flex gap-1">
                        <button 
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          disabled={isAudioLoading && speakingMsgId === msg.id}
                          className={`p-2 rounded-xl border transition-all shadow-xl flex items-center justify-center min-w-[36px] min-h-[36px] ${speakingMsgId === msg.id ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-[#1e3a5f]/50'}`}
                          title={speakingMsgId === msg.id ? "إيقاف الصوت" : "تشغيل الصوت بصوت رجالي"}
                        >
                          {isAudioLoading && speakingMsgId === msg.id ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : speakingMsgId === msg.id ? (
                            <Icons.Stop />
                          ) : (
                            <Icons.Speaker animate={false} />
                          )}
                        </button>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.content === '' && (
                      <div className="flex gap-1.5 py-1"><div className="w-1.5 h-1.5 bg-[#1e3a5f] rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-[#1e3a5f] rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-1.5 h-1.5 bg-[#1e3a5f] rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 md:p-8 lg:px-12 bg-gradient-to-t from-[#020408] to-transparent shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto relative group">
            {selectedImage && (
              <div className="absolute bottom-full left-0 mb-4 animate-fade-in">
                <div className="relative inline-block">
                  <img src={selectedImage} alt="Preview" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-[#1e3a5f] shadow-2xl" />
                  <button onClick={() => setSelectedImage(null)} type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">X</button>
                </div>
              </div>
            )}
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="اسأل هنا أو ألصق صورة..." 
              disabled={status === BotStatus.THINKING}
              className="w-full bg-[#0a0f1a] border border-white/5 text-white pl-24 md:pl-32 pr-4 md:pr-6 py-4 md:py-6 rounded-xl md:rounded-2xl focus:outline-none focus:border-[#1e3a5f]/40 transition-all shadow-2xl"
            />
            <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 bg-zinc-900/30 text-zinc-500 hover:text-white rounded-lg transition-all border border-white/5"><Icons.Image /></button>
              <button type="submit" disabled={(!input.trim() && !selectedImage) || status === BotStatus.THINKING} className="p-2 md:p-3 bg-[#1e3a5f]/80 hover:bg-[#1e3a5f] text-white rounded-lg shadow-xl disabled:opacity-20"><Icons.Send /></button>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if(file){ const r = new FileReader(); r.onloadend = () => setSelectedImage(r.result as string); r.readAsDataURL(file); } }} accept="image/*" className="hidden" />
          </form>
          <div className="flex justify-center items-center gap-4 md:gap-8 mt-4 md:mt-6 opacity-10 text-[7px] md:text-[9px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
             <span>T3N STORE</span> <div className="w-1 h-1 bg-zinc-700 rounded-full"></div> <span>ULTIMATE SOLUTIONS</span> <div className="w-1 h-1 bg-zinc-700 rounded-full"></div> <span>PREMIUM SUPPORT</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
