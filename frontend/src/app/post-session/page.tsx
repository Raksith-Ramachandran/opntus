"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PostSession() {
  const [rating, setRating]   = useState<number | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedback, setFbk]    = useState("");
  const [done, setDone]       = useState(false);
  const [isListener, setIsListener] = useState(false);

  useEffect(() => {
    // Check if this person was a listener
    const token = localStorage.getItem("opntus_token");
    setIsListener(!!token);

    // Clean up session storage
    localStorage.removeItem("opntus_room");
    localStorage.removeItem("opntus_session_id");
    localStorage.removeItem("opntus_session");
    localStorage.removeItem("opntus_name");
    localStorage.removeItem("opntus_mood");
  }, []);

  async function handleSubmit() {
    // TODO: POST feedback to API
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-[#E8F4F0] dark:from-[#12111A] dark:to-[#111820] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6"
          >
            {isListener ? "🎧" : "🌸"}
          </motion.div>

          {isListener ? (
            <>
              <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4">
                Thank you for listening.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You made a difference today. Your support means the world to someone.
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                Return to Dashboard
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4">
                Thank you for opening up today.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                It takes courage to reach out. You should be proud of yourself.
                Whenever you need to talk again, we&apos;re here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/#talk"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
                >
                  Talk Again
                </Link>
                <Link
                  href="/"
                  className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-[#E8F4F0] dark:from-[#12111A] dark:to-[#111820] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">{isListener ? "🎧" : "💙"}</div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
            Session Complete
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isListener
              ? "How did the session go?"
              : "Thank you for being here. Your feedback helps us improve."
            }
          </p>
        </div>

        {/* Was the session helpful? */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {isListener ? "Was this a positive session?" : "Was the listener helpful?"}
          </p>
          <div className="flex gap-3">
            {[{ l: "Yes", v: true, i: "👍" }, { l: "No", v: false, i: "👎" }].map(o => (
              <button
                key={o.l}
                onClick={() => setHelpful(o.v)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  helpful === o.v
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>{o.i}</span>
                <span className="text-sm font-medium">{o.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Star rating — only for users */}
        {!isListener && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Rate your experience (1–5)
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  aria-label={`${s} stars`}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    rating !== null && s <= rating ? "opacity-100" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional feedback */}
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Optional feedback
          </p>
          <textarea
            value={feedback}
            onChange={e => setFbk(e.target.value)}
            rows={3}
            placeholder="What went well? What could be better?"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8F7FF] dark:bg-[#12111A] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setDone(true)}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-4 transition-colors"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
}