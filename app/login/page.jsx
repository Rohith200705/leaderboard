'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

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
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-orange-400 no-underline">Group Login</Link>
        </div>
      </nav>

      <div className="flex justify-center items-center min-h-[calc(100vh-65px)] px-6">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <h2 className="text-center text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-center text-dark-500 text-sm mb-8">Sign in to manage your venue&apos;s tribes</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block mb-2 text-xs font-semibold text-dark-300 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="leader@venue.com"
                className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] text-white text-[0.95rem] outline-none transition focus:border-orange-500 focus:bg-orange-500/[0.03] focus:ring-2 focus:ring-orange-500/10 placeholder:text-dark-600"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-xs font-semibold text-dark-300 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] text-white text-[0.95rem] outline-none transition focus:border-orange-500 focus:bg-orange-500/[0.03] focus:ring-2 focus:ring-orange-500/10 placeholder:text-dark-600"
              />
            </div>
            {error && <p className="text-red-500 text-xs mb-4 p-3 bg-red-500/8 rounded-lg border border-red-500/15 text-center">{error}</p>}
            <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold text-[0.9rem] cursor-pointer transition shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
