'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, bypassAuthForDev, user, isDevBypassed } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user || isDevBypassed) {
    router.push('/');
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Google authentication was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBypass = () => {
    bypassAuthForDev();
    router.push('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-studio-900 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-md bg-white text-studio-950 flex items-center justify-center font-black text-sm tracking-tighter mx-auto shadow-sm">
            FM
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Flick Media • Panel Access
          </h2>
          <p className="text-xs text-studio-400 font-mono">
            PANEL.BUILDWITHREX.ME • AUTHENTICATION
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        {/* Google Sign-in */}
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-hairline bg-studio-950 hover:bg-studio-850 text-xs font-semibold text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-studio-800 flex-1" />
          <span className="text-[10px] font-mono text-studio-500 uppercase">OR EMAIL</span>
          <div className="h-px bg-studio-800 flex-1" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="text-[10px] font-mono uppercase text-studio-400 block mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="producer@flickmedia.com"
              required
              className="w-full px-3 py-2 text-xs bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-studio-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-xs bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-white hover:bg-zinc-200 text-studio-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Log In to Control Panel</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick Studio Access Button */}
        <div className="pt-2 border-t border-hairline">
          <button
            onClick={handleQuickBypass}
            className="w-full py-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Developer / Studio Quick Pass (1-Click)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
