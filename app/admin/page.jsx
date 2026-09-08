'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored || !stored.group?.id) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
      return;
    }
    setUser(stored);

    fetch('/api/events').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });

    fetch(`/api/teams/group/${stored.group.id}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTeams(data);
      });
  }, [router]);

  useEffect(() => {
    if (selectedEvent && teams.length > 0) {
      fetch(`/api/scores/event/${selectedEvent}`, { headers: getHeaders() })
        .then(r => r.json())
        .then(data => {
          const map = {};
          if (Array.isArray(data)) {
            data.forEach(s => { if (s.team) map[s.team._id] = s.points; });
          }
          setScores(map);
        });
    }
  }, [selectedEvent, teams.length]);

  const loadEvents = () => {
    fetch('/api/events').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newEventName, date: newEventDate })
      });
      if (!res.ok) throw new Error('Failed');
      setNewEventName('');
      setNewEventDate('');
      loadEvents();
      setMessage('Event created!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error creating event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE', headers: getHeaders() });
    loadEvents();
    if (selectedEvent === id) setSelectedEvent('');
  };

  const handleScoreChange = (teamId, value) => {
    const num = parseInt(value) || 0;
    setScores(prev => ({ ...prev, [teamId]: Math.min(100, Math.max(0, num)) }));
  };

  const handleSaveScores = async () => {
    const scoreArray = teams.map(t => ({
      teamId: t._id,
      points: scores[t._id] || 0
    }));
    try {
      const res = await fetch('/api/scores/bulk', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ eventId: selectedEvent, scores: scoreArray })
      });
      const data = await res.json();
      setMessage(`Scores saved! (${data.count} tribes updated)`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error saving scores');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const workingDates = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-15'];
  const selectedEventName = events.find(e => e._id === selectedEvent)?.name || '';

  if (!user) return null;

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-extrabold text-white">L</div>
          <span className="text-base font-bold text-white tracking-tight">LEADERBOARD</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition no-underline">Rankings</Link>
          <Link href="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-orange-400 no-underline">Dashboard</Link>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition cursor-pointer border-none bg-transparent">Sign Out</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-16 md:py-20 overflow-hidden">
        <div className="absolute -top-48 -right-24 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-glow border border-orange-500/20 text-xs font-semibold text-orange-500 uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Dashboard
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            {user.group?.name}<br />
            <span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">{user.group?.venue}</span>
          </h1>
          <p className="text-dark-400 text-base">Manage events and score your {teams.length} tribes</p>
        </div>
      </section>

      {/* Stats */}
      <div className="flex gap-6 px-6 md:px-12 mb-6 flex-wrap">
        <div className="flex-1 min-w-[160px] bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="text-[0.65rem] text-dark-500 uppercase tracking-widest font-bold mb-2">Your Tribes</div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{teams.length}</div>
        </div>
        <div className="flex-1 min-w-[160px] bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="text-[0.65rem] text-dark-500 uppercase tracking-widest font-bold mb-2">Events</div>
          <div className="text-3xl font-extrabold text-orange-500 tracking-tight">{events.length}</div>
        </div>
        <div className="flex-1 min-w-[160px] bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="text-[0.65rem] text-dark-500 uppercase tracking-widest font-bold mb-2">Selected</div>
          <div className="text-xl font-extrabold text-white tracking-tight truncate">{selectedEvent ? selectedEventName : '—'}</div>
        </div>
      </div>

      {message && (
        <div className="mx-6 md:mx-12 mb-5">
          <p className="text-center text-green-400 text-sm font-medium py-3 bg-green-500/8 rounded-xl border border-green-500/15">{message}</p>
        </div>
      )}

      {/* Create Event */}
      <div className="mx-6 md:mx-12 mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-7">
        <h3 className="text-white font-bold text-base mb-5">Create Event</h3>
        <form onSubmit={handleCreateEvent} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 text-xs font-semibold text-dark-300 uppercase tracking-wider">Event Name</label>
            <input
              type="text"
              value={newEventName}
              onChange={e => setNewEventName(e.target.value)}
              required
              placeholder="e.g. Quiz Round 1"
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] text-white text-sm outline-none transition focus:border-orange-500 placeholder:text-dark-600"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 text-xs font-semibold text-dark-300 uppercase tracking-wider">Date</label>
            <select
              value={newEventDate}
              onChange={e => setNewEventDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-dark-800 text-white text-sm outline-none transition focus:border-orange-500"
            >
              <option value="">Select date</option>
              {workingDates.map(d => (
                <option key={d} value={d}>{formatDate(d)}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-7 py-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold text-sm cursor-pointer transition shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border-none">
            Create
          </button>
        </form>
      </div>

      {/* Events */}
      <div className="mx-6 md:mx-12 mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-7">
        <h3 className="text-white font-bold text-base mb-5">Events</h3>
        {events.length === 0 ? (
          <p className="text-dark-600 text-center py-12">No events created yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {events.map(ev => (
              <div key={ev._id} className={`flex items-center justify-between gap-4 min-w-[240px] flex-1 rounded-xl px-5 py-4 border transition ${selectedEvent === ev._id ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 bg-white/[0.03] hover:border-white/10'}`}>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-white">{ev.name}</span>
                  <span className="text-xs text-dark-500">{formatDate(ev.date)}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setSelectedEvent(ev._id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition ${selectedEvent === ev._id ? 'bg-white/10 text-white border-white/15' : 'bg-transparent text-dark-400 border-white/8 hover:bg-white/[0.06] hover:text-white'}`}>
                    {selectedEvent === ev._id ? '✓ Active' : 'Select'}
                  </button>
                  <button onClick={() => handleDeleteEvent(ev._id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/15 cursor-pointer transition hover:bg-red-500/20">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Entry */}
      {selectedEvent && (
        <div className="mx-6 md:mx-12 mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-7">
          <h3 className="text-white font-bold text-base mb-5 flex items-center gap-3">
            Score: {selectedEventName}
            <span className="text-[0.65rem] text-dark-400 font-normal bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">max 100 per tribe</span>
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2 max-h-[420px] overflow-y-auto pr-1">
            {teams.map(team => (
              <div key={team._id} className="flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.02] rounded-lg border border-white/[0.04] hover:border-white/10 transition">
                <label className="text-sm text-dark-300 font-medium min-w-[70px]">{team.name}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores[team._id] || ''}
                  onChange={e => handleScoreChange(team._id, e.target.value)}
                  placeholder="0"
                  className="w-[70px] px-2.5 py-1.5 rounded-md border border-white/8 bg-white/[0.04] text-white text-sm text-center outline-none transition focus:border-orange-500 focus:bg-orange-500/5 placeholder:text-dark-600"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button onClick={handleSaveScores} className="px-12 py-3.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold text-[0.9rem] cursor-pointer transition shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border-none">
              Save All Scores
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 px-6 md:px-12 py-6 border-t border-white/5 flex justify-between text-dark-600 text-xs">
        <span>Leaderboard System 2026</span>
        <span>{user.group?.name} &middot; {user.group?.venue}</span>
      </footer>
    </>
  );
}
