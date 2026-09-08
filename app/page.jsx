'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filterGroup, setFilterGroup] = useState('all');

  useEffect(() => {
    fetch('/api/scores/leaderboard').then(r => r.json()).then(setLeaderboard);
  }, []);

  const getRankClass = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-orange-500 to-yellow-400 text-black shadow-lg shadow-orange-500/30';
    if (rank === 2) return 'bg-white/10 text-white border border-white/15';
    if (rank === 3) return 'bg-orange-500/15 text-orange-400 border border-orange-500/20';
    return 'bg-white/5 text-dark-400';
  };

  const display = filterGroup === 'all'
    ? leaderboard
    : leaderboard.filter(e => e.team?.group?.groupNumber === parseInt(filterGroup));

  const shown = filterGroup === 'all' ? display.slice(0, 10) : display;

  const totalTribes = leaderboard.length;
  const totalPoints = leaderboard.reduce((sum, e) => sum + (e.totalPoints || 0), 0);
  const avgPoints = totalTribes > 0 ? Math.round(totalPoints / totalTribes) : 0;

  const venueNames = {};
  leaderboard.forEach(e => {
    if (e.team?.group) venueNames[e.team.group.groupNumber] = e.team.group.name;
  });

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-extrabold text-white">L</div>
          <span className="text-base font-bold text-white tracking-tight">LEADERBOARD</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-orange-400 no-underline">Rankings</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition no-underline">Group Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        <div className="absolute -top-48 -right-24 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-glow border border-orange-500/20 text-xs font-semibold text-orange-500 uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live Rankings
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5">
            Score.<br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Compete.</span><br />
            Conquer.
          </h1>
          <p className="text-dark-400 text-lg max-w-md">September 2026 | Working Days: 8, 9, 10, 11, 15</p>
        </div>
      </section>

      {/* Stats */}
      <div className="flex gap-6 px-6 md:px-12 mb-8 flex-wrap">
        {[
          { label: 'Total Tribes', value: totalTribes },
          { label: 'Total Points', value: totalPoints, orange: true },
          { label: 'Avg Points', value: avgPoints },
          { label: 'Venues', value: 5 },
        ].map((s) => (
          <div key={s.label} className="flex-1 min-w-[160px] bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition">
            <div className="text-[0.65rem] text-dark-500 uppercase tracking-widest font-bold mb-2">{s.label}</div>
            <div className={`text-3xl font-extrabold tracking-tight ${s.orange ? 'text-orange-500' : 'text-white'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="px-6 md:px-12 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.65rem] text-dark-500 font-bold uppercase tracking-widest mr-2">Filter</span>
          {['all', '1', '2', '3', '4', '5'].map(g => (
            <button
              key={g}
              onClick={() => setFilterGroup(g)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition cursor-pointer ${
                filterGroup === g
                  ? 'bg-accent border-accent text-white font-semibold'
                  : 'bg-transparent border-white/8 text-dark-400 hover:bg-white/[0.04] hover:text-white hover:border-white/15'
              }`}
            >
              {g === 'all' ? 'All Venues' : venueNames[parseInt(g)] || `Venue ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-6 md:px-12 pb-20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-3 px-5 text-left text-[0.65rem] text-dark-500 font-bold uppercase tracking-[1.5px] w-20">Rank</th>
              <th className="py-3 px-5 text-left text-[0.65rem] text-dark-500 font-bold uppercase tracking-[1.5px]">Tribe</th>
              <th className="py-3 px-5 text-left text-[0.65rem] text-dark-500 font-bold uppercase tracking-[1.5px]">Venue</th>
              <th className="py-3 px-5 text-right text-[0.65rem] text-dark-500 font-bold uppercase tracking-[1.5px]">Points</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((entry) => (
              <tr key={entry.team?._id} className="bg-white/[0.01] hover:bg-white/[0.04] transition rounded-xl">
                <td className="py-4 px-5 first:rounded-l-xl">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-[10px] text-sm font-bold ${getRankClass(entry.rank)}`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="py-4 px-5 font-semibold text-white">{entry.team?.name}</td>
                <td className="py-4 px-5 text-dark-500 text-sm">{entry.team?.group?.name}</td>
                <td className="py-4 px-5 text-right last:rounded-r-xl">
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent-glow text-orange-500 text-sm font-bold border border-orange-500/15">
                    {entry.totalPoints}
                  </span>
                </td>
              </tr>
            ))}
            {filterGroup === 'all' && leaderboard.length > 10 && (
              <tr><td colSpan="4" className="text-center text-dark-600 py-5 text-lg tracking-[8px]">. . .</td></tr>
            )}
            {shown.length === 0 && (
              <tr><td colSpan="4" className="text-center text-dark-600 py-16">No scores recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="mt-auto px-6 md:px-12 py-6 border-t border-white/5 flex justify-between text-dark-600 text-xs">
        <span>Leaderboard System 2026</span>
        <span>90 Tribes &middot; 5 Venues</span>
      </footer>
    </>
  );
}
