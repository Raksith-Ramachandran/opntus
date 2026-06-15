"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const mockWaiting = [
  {id:"u1",mood:"Anxious",wait:3,emoji:"😰"},
  {id:"u2",mood:"Lonely",wait:7,emoji:"🌧"},
  {id:"u3",mood:"Work Stress",wait:1,emoji:"💼"},
];
const mockActive = [
  {id:"s1",userId:"SilentSky88",mood:"Stressed",dur:14,emoji:"😤"},
];
const mockHistory = [
  {user:"CalmRiver21",mood:"Anxious",dur:"18m",rating:5,date:"Today, 2:30 PM"},
  {user:"BlueLeaf42",mood:"Lonely",dur:"34m",rating:4,date:"Today, 11:15 AM"},
  {user:"SilentSky88",mood:"Stressed",dur:"22m",rating:5,date:"Yesterday, 8:00 PM"},
  {user:"GoldenMist33",mood:"Academic Stress",dur:"27m",rating:5,date:"Yesterday, 3:45 PM"},
];

export default function Dashboard() {
  const [online,setOnline] = useState(true);
  const stats = [
    {label:"Today's Sessions",value:"6",icon:"💬"},
    {label:"Avg. Duration",value:"22m",icon:"⏱"},
    {label:"Rating",value:"4.8",icon:"⭐"},
    {label:"Total Helped",value:"142",icon:"🤝"},
  ];
  const sc=(s:string)=>s==="online"?"bg-green-400":s==="busy"?"bg-amber-400":"bg-slate-400";

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#12111A]">
      <header className="bg-white dark:bg-[#1A1928] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</span>
          <span className="text-slate-400 text-sm">/ Listener Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={()=>setOnline(!online)}
              className={`relative w-12 h-6 rounded-full transition-colors ${online?"bg-green-500":"bg-slate-300 dark:bg-slate-600"}`}
              aria-label={online?"Go offline":"Go online"}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${online?"translate-x-7":"translate-x-1"}`}/>
            </button>
            <span className={`text-sm font-medium ${online?"text-green-600 dark:text-green-400":"text-slate-400"}`}>{online?"Online":"Offline"}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">L</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s=>(
            <motion.div key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
              className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Waiting */}
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Waiting Users</h2>
              <span className="text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold px-2 py-1 rounded-full">{mockWaiting.length} waiting</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockWaiting.map(u=>(
                <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{u.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{u.mood}</p>
                      <p className="text-xs text-slate-400">Waiting {u.wait}m</p>
                    </div>
                  </div>
                  <a href="/chat" className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${online?"bg-blue-600 hover:bg-blue-700 text-white":"bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"}`}>Accept</a>
                </div>
              ))}
            </div>
          </div>
          {/* Active */}
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Active Chats</h2>
              <span className="text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-semibold px-2 py-1 rounded-full">{mockActive.length} active</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockActive.map(s=>(
                <div key={s.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-xl">{s.emoji}</span>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white dark:border-[#1A1928]"/>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 font-mono">{s.userId}</p>
                      <p className="text-xs text-slate-400">{s.mood} · {s.dur}m</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href="/chat" className="text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium transition-colors">Open Chat</a>
                    <button className="text-xs bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors">End</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Recent Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["User","Mood","Duration","Rating","Date"].map(h=>(
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockHistory.map((r,i)=>(
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-600 dark:text-slate-400">{r.user}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{r.mood}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{r.dur}</td>
                    <td className="px-6 py-3">{"⭐".repeat(r.rating)}</td>
                    <td className="px-6 py-3 text-slate-400">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
