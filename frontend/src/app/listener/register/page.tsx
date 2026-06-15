"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ListenerRegister() {
  const [form,setForm] = useState({name:"",email:"",password:"",adminKey:""});
  const [err,setErr]   = useState("");
  const [done,setDone] = useState(false);
  const [load,setLoad] = useState(false);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault(); setErr(""); setLoad(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/listener/register`,{
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const data = await res.json();
      if(!res.ok){ setErr(data.error||"Registration failed"); setLoad(false); return; }
      setDone(true);
    } catch { setErr("Network error. Please try again."); }
    finally { setLoad(false); }
  }

  if(done) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-[#E8F4F0] dark:from-[#12111A] dark:to-[#111820] p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🎉</div>
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4">Welcome aboard!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Your listener account has been created. You can now sign in.</p>
        <Link href="/listener/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] via-[#EEF0FF] to-[#E8F4F0] dark:from-[#12111A] dark:via-[#16132A] dark:to-[#111820] p-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</Link>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mt-6 mb-2">Become a Listener</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Join our team of trained volunteer listeners</p>
        </div>
        <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[{k:"name",t:"text",l:"Full Name",p:"Jane Doe"},{k:"email",t:"email",l:"Email",p:"jane@email.com"},
              {k:"password",t:"password",l:"Password",p:"Min 8 characters"},{k:"adminKey",t:"password",l:"Admin Key",p:"Provided by OPNTUS team"}
            ].map(f=>(
              <div key={f.k}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{f.l}</label>
                <input type={f.t} placeholder={f.p} required
                  value={form[f.k as keyof typeof form]}
                  onChange={e=>setForm(prev=>({...prev,[f.k]:e.target.value}))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400"/>
              </div>
            ))}
            {err && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{err}</p>}
            <button type="submit" disabled={load}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
              {load?"Creating account…":"Create Listener Account"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/listener/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
