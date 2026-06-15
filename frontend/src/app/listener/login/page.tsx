"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ListenerLogin() {
  const [email,setEmail]   = useState("");
  const [pass,setPass]     = useState("");
  const [err,setErr]       = useState("");
  const [loading,setLoad]  = useState(false);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault(); setErr(""); setLoad(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/listener/login`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email,password:pass})
      });
      const data = await res.json();
      if(!res.ok){ setErr(data.error||"Login failed"); return; }
      localStorage.setItem("opntus_token", data.token);
      window.location.href="/dashboard";
    } catch { setErr("Network error. Please try again."); }
    finally{ setLoad(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] via-[#EEF0FF] to-[#E8F4F0] dark:from-[#12111A] dark:via-[#16132A] dark:to-[#111820] p-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</Link>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mt-6 mb-2">Listener Login</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your listener account</p>
        </div>
        <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400"
                placeholder="your@email.com"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400"
                placeholder="••••••••"/>
            </div>
            {err && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{err}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
              {loading?"Signing in…":"Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Not a listener yet?{" "}
          <Link href="/listener/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Apply here</Link>
        </p>
      </motion.div>
    </div>
  );
}
