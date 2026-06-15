"use client";
import { useState } from "react";
import { motion } from "framer-motion";

type Tab = "overview"|"listeners"|"reports";

const metrics = [
  {label:"Total Users",value:"2,847",icon:"👥",change:"+12%",pos:true},
  {label:"Active Users",value:"143",icon:"🟢",change:"+5%",pos:true},
  {label:"Active Listeners",value:"18",icon:"🎧",change:"-2",pos:false},
  {label:"Active Sessions",value:"31",icon:"💬",change:"+8",pos:true},
  {label:"Completed Today",value:"204",icon:"✅",change:"+23%",pos:true},
  {label:"Reports Pending",value:"3",icon:"🚩",change:"+1",pos:false},
];
const listeners=[
  {id:"l1",name:"Priya M.",email:"priya@opntus.com",status:"online",sessions:142,rating:4.9},
  {id:"l2",name:"James K.",email:"james@opntus.com",status:"busy",sessions:98,rating:4.7},
  {id:"l3",name:"Sara L.",email:"sara@opntus.com",status:"offline",sessions:220,rating:4.8},
];
const reports=[
  {id:"r1",session:"sess_abc123",reason:"Inappropriate behavior",type:"User",time:"10m ago",status:"pending"},
  {id:"r2",session:"sess_def456",reason:"Spam",type:"Listener",time:"1h ago",status:"pending"},
  {id:"r3",session:"sess_ghi789",reason:"Technical issue",type:"User",time:"3h ago",status:"reviewed"},
];

export default function AdminDashboard(){
  const [tab,setTab]=useState<Tab>("overview");
  const sc=(s:string)=>s==="online"?"bg-green-400":s==="busy"?"bg-amber-400":"bg-slate-400";
  const navItems:[Tab,string,string][]=[["overview","Overview","📊"],["listeners","Listeners","🎧"],["reports","Reports","🚩"]];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7FF] dark:bg-[#12111A]">
      <aside className="w-56 bg-white dark:bg-[#1A1928] border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-lg font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</span>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(([key,label,icon])=>(
            <button key={key} onClick={()=>setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab===key?"bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300":"text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full text-sm text-red-500 hover:text-red-600 py-2 font-medium transition-colors">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 capitalize">{tab}</h1>
            <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>

          {tab==="overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {metrics.map(m=>(
                  <motion.div key={m.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                    className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{m.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.pos?"text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400":"text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400"}`}>{m.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{m.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recent Reports</h2>
                  <button onClick={()=>setTab("reports")} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
                </div>
                {reports.slice(0,2).map(r=>(
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-xs block">{r.session}</span>
                      <p className="text-slate-700 dark:text-slate-300">{r.reason}</p>
                    </div>
                    <span className="text-slate-400 text-xs">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="listeners" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">+ Add Listener</button>
              </div>
              <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {["Listener","Status","Sessions","Rating","Actions"].map(h=>(
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listeners.map(l=>(
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3"><div className="font-medium text-slate-800 dark:text-slate-100">{l.name}</div><div className="text-xs text-slate-400">{l.email}</div></td>
                        <td className="px-6 py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${sc(l.status)}`}/><span className="capitalize text-slate-600 dark:text-slate-400">{l.status}</span></div></td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{l.sessions}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">⭐ {l.rating}</td>
                        <td className="px-6 py-3"><div className="flex gap-2"><button className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Suspend</button><button className="text-xs text-red-600 dark:text-red-400 hover:underline">Remove</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab==="reports" && (
            <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Session","Reason","Reported By","Time","Status","Actions"].map(h=>(
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map(r=>(
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">{r.session}</td>
                      <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{r.reason}</td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{r.type}</td>
                      <td className="px-6 py-3 text-slate-400">{r.time}</td>
                      <td className="px-6 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status==="pending"?"bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400":"bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"}`}>{r.status}</span></td>
                      <td className="px-6 py-3"><div className="flex gap-2"><button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Review</button><button className="text-xs text-red-600 dark:text-red-400 hover:underline">Ban User</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
