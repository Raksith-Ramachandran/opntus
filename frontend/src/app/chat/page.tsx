"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Msg { id:string; text:string; sender:"user"|"listener"; ts:Date; status:"sending"|"sent"|"read"; }

const LISTENER_REPLIES = [
  "That sounds really hard. I hear you.",
  "Thank you for sharing that with me. How long have you been feeling this way?",
  "I understand. That takes a lot of courage to say.",
  "You don't have to carry that alone.",
  "Tell me more — I'm right here with you.",
  "I'm listening. Take all the time you need.",
  "That makes a lot of sense. How are you feeling right now?",
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id:"welcome", text:"Hi there. I'm here and I'm listening. Take your time — there's no rush.",
    sender:"listener", ts:new Date(), status:"read"
  }]);
  const [input,setInput]           = useState("");
  const [listenerTyping,setLTyping]= useState(false);
  const [sessionSecs,setSecs]      = useState(0);
  const [showEnd,setShowEnd]       = useState(false);
  const [connected]                = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef     = useRef<HTMLTextAreaElement>(null);
  const typTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const [anonName] = useState("CalmRiver21");

  useEffect(()=>{ const t=setInterval(()=>setSecs(s=>s+1),1000); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,listenerTyping]);

  const fmt  = (s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const fmtT = (d:Date)=>d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

  const send = useCallback(()=>{
    if(!input.trim()) return;
    const id = Date.now().toString();
    const m:Msg = {id, text:input.trim(), sender:"user", ts:new Date(), status:"sending"};
    setMsgs(p=>[...p,m]);
    setInput("");
    if(taRef.current){ taRef.current.style.height="auto"; }
    setTimeout(()=>setMsgs(p=>p.map(x=>x.id===id?{...x,status:"sent"}:x)),500);
    setTimeout(()=>setLTyping(true),900);
    setTimeout(()=>{
      setLTyping(false);
      const reply:Msg={id:(Date.now()+1).toString(),text:LISTENER_REPLIES[Math.floor(Math.random()*LISTENER_REPLIES.length)],sender:"listener",ts:new Date(),status:"read"};
      setMsgs(p=>[...p,reply]);
    },2800);
  },[input]);

  const onKey=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  return (
    <div className="flex flex-col h-screen bg-[#F8F7FF] dark:bg-[#12111A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A1928] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">L</div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1A1928] ${connected?"bg-green-400":"bg-slate-400"}`}/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Listener</p>
            <p className="text-xs text-slate-400">{connected?"Online":"Reconnecting..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400">Session</p>
            <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{fmt(sessionSecs)}</p>
          </div>
          <button onClick={()=>setShowEnd(true)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors">End</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <p className="text-center text-xs text-slate-400 mb-6">You are <span className="font-mono font-semibold text-blue-500">{anonName}</span>. This session is private and anonymous.</p>
        {msgs.map(m=>(
          <motion.div key={m.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.25}}
            className={`flex ${m.sender==="user"?"justify-end":"justify-start"}`}>
            <div className={`max-w-[75%] md:max-w-[60%] px-4 py-3 ${
              m.sender==="user"
                ?"bg-blue-600 text-white rounded-2xl rounded-br-sm"
                :"bg-white dark:bg-[#1A1928] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-sm"
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.sender==="user"?"justify-end":"justify-start"}`}>
                <span className={`text-[10px] ${m.sender==="user"?"text-blue-200":"text-slate-400"}`}>{fmtT(m.ts)}</span>
                {m.sender==="user" && <span className="text-[10px] text-blue-200">{m.status==="sending"?"◌":m.status==="sent"?"✓":"✓✓"}</span>}
              </div>
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {listenerTyping && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} className="flex justify-start">
              <div className="bg-white dark:bg-[#1A1928] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i=>(
                    <motion.span key={i} className="w-2 h-2 rounded-full bg-slate-400"
                      animate={{y:[0,-4,0]}} transition={{duration:0.6,delay:i*0.15,repeat:Infinity}}/>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-[#1A1928] border-t border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea ref={taRef} value={input}
            onChange={e=>{setInput(e.target.value);if(typTimer.current)clearTimeout(typTimer.current);typTimer.current=setTimeout(()=>{},1000);}}
            onKeyDown={onKey}
            onInput={e=>{const el=e.currentTarget;el.style.height="auto";el.style.height=`${Math.min(el.scrollHeight,128)}px`;}}
            placeholder="Type something… (Enter to send, Shift+Enter for new line)"
            rows={1} aria-label="Message"
            className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#F8F7FF] dark:bg-[#12111A] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors max-h-32 overflow-y-auto"/>
          <button onClick={send} disabled={!input.trim()} aria-label="Send"
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* End Confirm Modal */}
      <AnimatePresence>
        {showEnd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-4xl mb-4">🌸</div>
              <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">End this session?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">You can always come back. This session will be closed.</p>
              <div className="flex gap-3">
                <button onClick={()=>setShowEnd(false)} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Keep Talking</button>
                <a href="/post-session" className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors text-center">End Session</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
