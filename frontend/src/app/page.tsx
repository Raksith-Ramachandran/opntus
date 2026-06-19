"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const moods = [
  { label: "Stressed",          emoji: "😤", value: "stressed"      },
  { label: "Lonely",            emoji: "🌧",  value: "lonely"       },
  { label: "Anxious",           emoji: "😰", value: "anxious"       },
  { label: "Overthinking",      emoji: "🌀", value: "overthinking"  },
  { label: "Relationship",      emoji: "💔", value: "relationship"  },
  { label: "Academic Stress",   emoji: "📚", value: "academic"      },
  { label: "Work Stress",       emoji: "💼", value: "work"          },
  { label: "Need to Talk",      emoji: "💬", value: "general"       },
];

const steps = [
  { n:1, title:"Choose how you feel",      desc:"Pick the mood that matches where you are right now." },
  { n:2, title:"Get matched",              desc:"We pair you with an available, trained listener instantly." },
  { n:3, title:"Talk anonymously",         desc:"No names. No accounts. Just honest conversation." },
  { n:4, title:"Leave feeling heard",      desc:"Walk away lighter, with someone having truly listened." },
];

const features = [
  { icon:"🎭", title:"Fully Anonymous",      desc:"Generated identity. No email, phone or social media required." },
  { icon:"🧑‍🤝‍🧑", title:"Human Support",     desc:"Real, trained listeners — not bots. Every session is human." },
  { icon:"🔒", title:"Safe Environment",    desc:"Encrypted sessions, strict moderation, zero data sold." },
  { icon:"🕊",  title:"Private Conversations", desc:"Sessions never recorded or shared. What you say stays here." },
];

const testimonials = [
  { quote:"I didn't want therapy. I just needed someone to actually listen. This was that.", name:"CalmRiver21" },
  { quote:"The anonymity made it so much easier to be honest. I said things I've never told anyone.", name:"SilentSky88" },
  { quote:"My listener was so patient. I rambled for an hour and they never rushed me.", name:"BlueLeaf42" },
];

const faqs = [
  { q:"Is OPNTUS a therapy service?",      a:"No. OPNTUS provides anonymous peer emotional support. We are not a substitute for professional therapy, psychiatry, or emergency services. If you are in crisis, please contact emergency services." },
  { q:"Do I need to create an account?",   a:"No. You can start talking immediately without any sign-up. We generate an anonymous identity for each session automatically." },
  { q:"Who are the listeners?",            a:"Listeners are verified volunteers trained in active listening and emotional support. They are not licensed therapists but are trained to provide empathetic, non-judgmental support." },
  { q:"Is my conversation private?",       a:"Yes. Sessions are encrypted and private. OPNTUS staff may review flagged conversations reported for safety reasons only." },
  { q:"What if I need emergency help?",    a:"OPNTUS is not an emergency service. If you or someone you know is in immediate danger, please call your local emergency number (e.g. 911, 112) or a crisis helpline." },
];

const fUp = { hidden:{opacity:0,y:28}, visible:{opacity:1,y:0,transition:{duration:0.55,ease:"easeOut"}} };
const stagger = { visible:{transition:{staggerChildren:0.11}} };

/* ── Navbar ── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled?"bg-white/90 dark:bg-[#12111A]/90 backdrop-blur-md shadow-sm":""}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
    <Image src="/logo-icon.png" alt="OPNTUS logo" width={36} height={36} className="w-9 h-9" priority />
    <span className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</span>
  </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#why" className="hover:text-blue-600 transition-colors">Why OPNTUS</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          <Link href="/listener/login" className="hover:text-blue-600 transition-colors">Listener Login</Link>
          <a href="#talk" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold transition-colors">Talk Now</a>
        </div>
        <button className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={()=>setOpen(!open)} aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                 :<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            className="md:hidden bg-white dark:bg-[#1A1928] border-t border-slate-100 dark:border-slate-800 px-6 pb-6 space-y-4">
            <a href="#how"  className="block pt-4 text-slate-700 dark:text-slate-200 font-medium" onClick={()=>setOpen(false)}>How It Works</a>
            <a href="#why"  className="block text-slate-700 dark:text-slate-200 font-medium" onClick={()=>setOpen(false)}>Why OPNTUS</a>
            <a href="#faq"  className="block text-slate-700 dark:text-slate-200 font-medium" onClick={()=>setOpen(false)}>FAQ</a>
            <a href="#talk" className="block bg-blue-600 text-white px-5 py-2 rounded-full text-center font-semibold" onClick={()=>setOpen(false)}>Talk Now</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F7FF] via-[#EEF0FF] to-[#E8F4F0] dark:from-[#12111A] dark:via-[#16132A] dark:to-[#111820]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div className="w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
          style={{background:"radial-gradient(circle at center,#A78FD4 0%,#6B8FD4 40%,#8FD4A7 80%,transparent 100%)"}}
          animate={{scale:[1,1.08,1],opacity:[0.18,0.26,0.18]}}
          transition={{duration:6,repeat:Infinity,ease:"easeInOut"}}/>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="flex justify-center mb-6"
  >
    <Image src="/logo-icon.png" alt="OPNTUS" width={88} height={88} className="w-20 h-20 md:w-24 md:h-24" priority />
  </motion.div>

        <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="text-blue-500 dark:text-blue-400 text-sm font-semibold uppercase tracking-[0.15em] mb-6">
          Anonymous Emotional Support
        </motion.p>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35,duration:0.7}}
          className="text-5xl md:text-7xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight mb-6">
          Open Up.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400">
            We&rsquo;re Listening.
          </span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
          className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A safe, anonymous space where you can share thoughts, feelings, and struggles
          without fear of judgment. Real humans. Real listening.
        </motion.p>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.65}}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#talk" className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            Talk Now — It&apos;s Free
          </a>
          <Link href="/listener/register" className="border border-slate-300 dark:border-slate-600 hover:border-blue-400 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-full text-base font-semibold transition-all bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            Become a Listener
          </Link>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 dark:text-slate-500">
          <span>🔒 No account needed</span>
          <span>🎭 Fully anonymous</span>
          <span>🧑‍🤝‍🧑 Human listeners</span>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{y:[0,8,0]}} transition={{duration:2,repeat:Infinity}}>
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </motion.div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-white dark:bg-[#12111A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-80px"}}>
          <motion.div variants={fUp} className="text-center mb-16">
            <p className="text-blue-500 text-xs font-semibold uppercase tracking-[0.15em] mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100">How It Works</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map(s => (
              <motion.div key={s.n} variants={fUp} className="relative">
                <div className="mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/30">{s.n}</div>
                </div>
                {s.n < 4 && <div className="hidden md:block absolute top-6 left-14 w-full h-px bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900"/>}
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Why ── */
function WhyOpntus() {
  return (
    <section id="why" className="py-24 bg-[#F8F7FF] dark:bg-[#16132A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-80px"}}>
          <motion.div variants={fUp} className="text-center mb-16">
            <p className="text-purple-500 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Our Promise</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100">Why OPNTUS</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <motion.div key={f.title} variants={fUp}
                className="bg-white dark:bg-[#1A1928] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Talk Now Widget ── */
function TalkNow() {
  const [step, setStep] = useState<"mood"|"type"|"queue">("mood");
  const [mood, setMood] = useState<string|null>(null);
  const [pos, setPos] = useState(0);
  const selectedMood = mood;
  const [anonName] = useState(() => {
    const adjs = ["Calm","Silent","Blue","Gentle","Soft","Still","Clear","Warm"];
    const nouns = ["River","Sky","Leaf","Wave","Stone","Star","Cloud","Rain"];
    const n = Math.floor(Math.random()*90)+10;
    return `${adjs[Math.floor(Math.random()*adjs.length)]}${nouns[Math.floor(Math.random()*nouns.length)]}${n}`;
  });

  function pickMood(v:string){ setMood(v); setStep("type"); }
 async function pickType(v:string){
  if(v!=="text") return;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";
    const res = await fetch(`${apiUrl}/auth/user/start`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ mood: selectedMood || "general" })
    });
    const data = await res.json();
    localStorage.setItem("opntus_session", data.sessionId);
    localStorage.setItem("opntus_name", data.anonymousName);
    localStorage.setItem("opntus_mood", selectedMood || "general");
    setPos(Math.floor(Math.random()*5)+1);
    setStep("queue");
  } catch(err) {
    console.error("Failed to start session", err);
    setPos(1);
    setStep("queue");
  }
}

  return (
    <section id="talk" className="py-24 bg-white dark:bg-[#12111A]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div variants={fUp} initial="hidden" whileInView="visible" viewport={{once:true}} className="text-center mb-12">
          <p className="text-teal-500 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Start Here</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100">Talk Now</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">No account. No name. Just you.</p>
        </motion.div>
        <AnimatePresence mode="wait">
          {step==="mood" && (
            <motion.div key="mood" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.35}}>
              <p className="text-center text-slate-600 dark:text-slate-300 font-medium mb-6">How are you feeling right now?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {moods.map(m => (
                  <button key={m.value} onClick={()=>pickMood(m.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group active:scale-95">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step==="type" && (
            <motion.div key="type" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.35}}>
              <p className="text-center text-slate-600 dark:text-slate-300 font-medium mb-6">How would you like to connect?</p>
              <div className="grid grid-cols-3 gap-4">
                {[{icon:"💬",label:"Text Chat",v:"text",ok:true},{icon:"🎙",label:"Voice",v:"voice",ok:false},{icon:"📹",label:"Video",v:"video",ok:false}].map(o=>(
                  <button key={o.v} onClick={()=>pickType(o.v)} disabled={!o.ok}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${o.ok?"border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-95":"border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed"}`}>
                    <span className="text-3xl">{o.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{o.label}</span>
                    {!o.ok && <span className="absolute top-2 right-2 text-[10px] font-semibold text-purple-500 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded-full">Soon</span>}
                  </button>
                ))}
              </div>
              <button onClick={()=>setStep("mood")} className="mt-6 mx-auto block text-sm text-slate-400 hover:text-blue-500 transition-colors">← Back</button>
            </motion.div>
          )}
          {step==="queue" && (
            <motion.div key="queue" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.35}} className="text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <motion.div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20"
                  animate={{scale:[1,1.2,1]}} transition={{duration:2,repeat:Infinity}}/>
                <div className="absolute text-4xl">🌊</div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">You&rsquo;re in the queue</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Hold on — a listener is on their way.</p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                <div className="bg-[#F8F7FF] dark:bg-[#1A1928] rounded-2xl p-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">#{pos}</div>
                  <div className="text-xs text-slate-500 mt-1">Position</div>
                </div>
                <div className="bg-[#F8F7FF] dark:bg-[#1A1928] rounded-2xl p-4">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">~{pos*2}m</div>
                  <div className="text-xs text-slate-500 mt-1">Est. wait</div>
                </div>
                <div className="bg-[#F8F7FF] dark:bg-[#1A1928] rounded-2xl p-4">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">3</div>
                  <div className="text-xs text-slate-500 mt-1">Listeners</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">Your identity: <span className="font-mono font-semibold text-blue-500">{anonName}</span></p>
              <a href="/chat" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors">Enter Chat Room</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#EEF0FF] to-[#E8F4F0] dark:from-[#16132A] dark:to-[#111820]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-80px"}}>
          <motion.div variants={fUp} className="text-center mb-16">
            <p className="text-blue-500 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Real Voices</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100">People Who Opened Up</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fUp} className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
                <div className="text-blue-400 text-3xl mb-4">&ldquo;</div>
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">{t.name[0]}</div>
                  <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Safety Banner ── */
function Safety() {
  return (
    <section className="py-16 bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-900/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="text-2xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">Safety Notice</h3>
        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed max-w-2xl mx-auto">
          OPNTUS provides peer emotional support and is <strong>not</strong> a substitute for professional medical,
          psychiatric, or emergency services. If you or someone you know is in immediate danger,
          please contact your local emergency services or a crisis helpline.
        </p>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQ() {
  const [open,setOpen] = useState<number|null>(null);
  return (
    <section id="faq" className="py-24 bg-white dark:bg-[#12111A]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-80px"}}>
          <motion.div variants={fUp} className="text-center mb-16">
            <p className="text-purple-500 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Questions</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100">FAQ</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f,i)=>(
              <motion.div key={i} variants={fUp} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button onClick={()=>setOpen(open===i?null:i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="font-medium text-slate-800 dark:text-slate-100 pr-4">{f.q}</span>
                  <motion.span animate={{rotate:open===i?45:0}} transition={{duration:0.2}} className="text-slate-400 flex-shrink-0 text-lg">+</motion.span>
                </button>
                <AnimatePresence>
                  {open===i && (
                    <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} transition={{duration:0.25}} className="overflow-hidden">
                      <p className="px-5 pb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Contact ── */
function Contact() {
  const [sent,setSent] = useState(false);
  return (
    <section id="contact" className="py-24 bg-[#F8F7FF] dark:bg-[#16132A]">
      <div className="max-w-xl mx-auto px-6 text-center">
        <motion.div variants={fUp} initial="hidden" whileInView="visible" viewport={{once:true}}>
          <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4">Get in Touch</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">Questions, feedback, or want to partner with us?</p>
          {sent ? (
            <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">Message sent!</p>
              <p className="text-slate-500 text-sm mt-2">We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 space-y-4 text-left">
              <input type="text" placeholder="Your name (optional)" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors"/>
              <input type="email" placeholder="Email address" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors"/>
              <textarea rows={4} placeholder="Your message..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"/>
              <button onClick={()=>setSent(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">Send Message</button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-[#12111A] py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          <div>
    <div className="flex items-center gap-2 mb-3">
      <Image src="/logo-icon.png" alt="OPNTUS logo" width={32} height={32} className="w-8 h-8" />
      <span className="text-2xl font-serif font-bold text-white">OPNTUS</span>
    </div>
    <p className="text-slate-500 text-sm max-w-xs">Open To Us. A safe, anonymous space for everyone who needs to be heard.</p>
  </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-slate-400 font-semibold mb-3">Platform</p>
              <div className="space-y-2 text-slate-500">
                <a href="#how"  className="block hover:text-blue-400 transition-colors">How It Works</a>
                <a href="#why"  className="block hover:text-blue-400 transition-colors">Why OPNTUS</a>
                <a href="#faq"  className="block hover:text-blue-400 transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-3">Listeners</p>
              <div className="space-y-2 text-slate-500">
                <Link href="/listener/register" className="block hover:text-blue-400 transition-colors">Apply</Link>
                <Link href="/listener/login"    className="block hover:text-blue-400 transition-colors">Log In</Link>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-3">Legal</p>
              <div className="space-y-2 text-slate-500">
                <a href="#" className="block hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">Terms of Use</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">Safety Policy</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} OPNTUS. All rights reserved.</p>
          <p className="text-center">OPNTUS is not a crisis service. In an emergency, call your local emergency number.</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Main ── */
export default function HomePage() {
  return (
    <main>
      <NavBar/>
      <Hero/>
      <HowItWorks/>
      <WhyOpntus/>
      <TalkNow/>
      <Testimonials/>
      <Safety/>
      <FAQ/>
      <Contact/>
      <Footer/>
    </main>
  );
}
