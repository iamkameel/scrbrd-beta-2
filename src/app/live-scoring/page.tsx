'use client';

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, ShieldAlert, Sparkles, Trophy } from "lucide-react";

export default function LiveScoringPage() {
  const [runs, setRuns] = useState(142);
  const [wickets, setWickets] = useState(3);
  const [overs, setOvers] = useState(14.2);
  const [ballHistory, setBallHistory] = useState<string[]>(["1", "4", "·", "W", "2", "1"]);
  const [commentary, setCommentary] = useState("Whitfield cuts cleanly behind point for a single. Running between the wickets has been sharp and decisive.");
  const [mode, setMode] = useState<"focus" | "pro">("focus");

  const addBall = (val: string, runVal: number, isWicket = false) => {
    setBallHistory(prev => [val, ...prev.slice(0, 7)]);
    setRuns(r => r + runVal);
    if (isWicket) setWickets(w => Math.min(10, w + 1));
    setOvers(o => {
      const whole = Math.floor(o);
      const dec = Math.round((o - whole) * 10);
      if (dec >= 5) return whole + 1;
      return parseFloat((whole + (dec + 1) / 10).toFixed(1));
    });

    if (val === "6") setCommentary("MAXIMUM! Smashed high over deep mid-wicket into the pavilion!");
    else if (val === "4") setCommentary("FOUR! Pure timing through extra cover. Sweeper had no chance.");
    else if (val === "W") setCommentary("WICKET! Caught at mid-on! Big breakthrough for the bowling attack.");
    else setCommentary(`Pushed into the gap for ${runVal} run${runVal !== 1 ? 's' : ''}. Strike rotated smoothly.`);
  };

  return (
    <div className="min-h-screen bg-[#060910] text-[#f0f4ff] p-4 sm:p-6 flex flex-col font-sans">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to SCRBRD OS
          </Link>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE BROADCAST SCORER
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("focus")}
            className={`px-3 py-1 text-xs font-bold rounded-full transition ${mode === "focus" ? "bg-indigo-600 text-white" : "bg-white/5 text-white/60"}`}
          >
            Focus Pad
          </button>
          <button
            onClick={() => setMode("pro")}
            className={`px-3 py-1 text-xs font-bold rounded-full transition ${mode === "pro" ? "bg-indigo-600 text-white" : "bg-white/5 text-white/60"}`}
          >
            Pro Mode
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Scoreboard Banner */}
        <div className="bg-gradient-to-br from-[#0f1621] to-[#151d2e] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
              KZN Schools T20 League · Bowden's Field
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Westville Boys' High U19A <span className="text-white/40 font-normal">vs</span> Kearsney College
            </h1>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
                {runs}/{wickets}
              </span>
              <span className="text-xl text-white/50 font-mono">
                ({overs} ov)
              </span>
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-1">
              Current Run Rate: {(runs / Math.max(overs, 1)).toFixed(2)}
            </div>
          </div>

          <div className="bg-[#1c2640] p-4 rounded-xl text-right">
            <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">Target</div>
            <div className="text-3xl font-black text-amber-400 font-mono">187</div>
            <div className="text-xs text-amber-300/80 font-mono mt-0.5">
              Need {Math.max(0, 187 - runs)} off {(20 * 6) - Math.floor(overs * 6)}b
            </div>
          </div>
        </div>

        {/* Batsmen & Bowler Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0f1621] border border-white/10 p-4 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">At the Crease</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>● James Whitfield (c)</span>
                <span className="font-mono text-sky-400">67* (44b)</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/70">
                <span>Ethan Solomons</span>
                <span className="font-mono text-white/60">31* (29b)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1621] border border-white/10 p-4 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Current Bowler</div>
            <div className="mt-2 flex justify-between items-center text-sm font-semibold">
              <span>⚡ T. Smith (Kearsney)</span>
              <span className="font-mono text-orange-400">2.2-0-18-1</span>
            </div>
            <div className="text-xs text-white/50 font-mono mt-1">Econ: 7.71 · R/A Fast Medium</div>
          </div>
        </div>

        {/* Ball History Over Strip */}
        <div className="bg-[#0f1621] border border-white/10 p-4 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">Over {Math.floor(overs) + 1}:</span>
          <div className="flex items-center gap-2">
            {ballHistory.map((b, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm border ${
                  b === "W"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : b === "6"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : b === "4"
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                    : "bg-white/5 text-white/80 border-white/10"
                }`}
              >
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* AI Commentary Bubble */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">AI Broadcast Commentary</div>
            <p className="text-sm text-white/80 italic mt-0.5">"{commentary}"</p>
          </div>
        </div>

        {/* One-Tap Scoring Pad */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {[
            { label: "·", run: 0, str: "·" },
            { label: "1", run: 1, str: "1" },
            { label: "2", run: 2, str: "2" },
            { label: "3", run: 3, str: "3" },
            { label: "4", run: 4, str: "4", color: "text-sky-400 border-sky-500/40 bg-sky-500/10" },
            { label: "6", run: 6, str: "6", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => addBall(btn.str, btn.run)}
              className={`h-16 rounded-xl font-mono text-2xl font-bold border transition active:scale-95 flex items-center justify-center ${
                btn.color || "bg-[#151d2e] border-white/10 text-white hover:bg-[#1c2640]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Extras & Wicket Controls */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => addBall("Wd", 1)}
            className="h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs sm:text-sm active:scale-95 transition"
          >
            +1 WIDE
          </button>
          <button
            onClick={() => addBall("Nb", 1)}
            className="h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm active:scale-95 transition"
          >
            +1 NO BALL
          </button>
          <button
            onClick={() => addBall("W", 0, true)}
            className="h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs sm:text-sm active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" /> WICKET
          </button>
        </div>
      </div>
    </div>
  );
}
