'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  Plus,
  Share2,
  Film,
  Disc3,
  SlidersHorizontal,
  ChevronRight,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-studio-950/95 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Studio Identity & Current Production */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-7 w-7 rounded-md bg-white text-studio-950 flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:bg-amber-400 transition-colors">
                FM
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  Flick Media
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-studio-800 text-studio-400 border border-studio-700/60 hidden sm:inline-block">
                  v2.0
                </span>
              </div>
            </Link>

            <span className="h-4 w-px bg-studio-800 hidden md:block" />

            {/* Production Status Pill */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-studio-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-studio-300">
                PROD CALL: 24–29 OCT
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              <Link
                href="/"
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-studio-800 text-white'
                    : 'text-studio-400 hover:text-white hover:bg-studio-900'
                }`}
              >
                Intake Forms
              </Link>

              <Link
                href="/forms/flick-crew-tracker/manage"
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  pathname.includes('flick-crew-tracker')
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-studio-400 hover:text-white hover:bg-studio-900'
                }`}
              >
                <Film className="h-3 w-3 text-amber-400" />
                <span>Crew & Reel Slate</span>
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/f/flick-media-crew"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-studio-300 hover:text-white bg-studio-900 hover:bg-studio-850 border border-studio-700/70 rounded transition-colors"
            >
              <Share2 className="h-3 w-3 text-studio-400" />
              <span className="hidden sm:inline">Open Public Form</span>
              <span className="sm:hidden">Share</span>
            </Link>

            <Link
              href="/builder/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-studio-950 bg-white hover:bg-zinc-200 rounded transition-all shadow-sm active:scale-98"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Create Form</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
