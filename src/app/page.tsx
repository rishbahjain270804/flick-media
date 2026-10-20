'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileSpreadsheet,
  FileEdit,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Users,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  Film,
  Disc3,
  SlidersHorizontal,
  Share2,
  Calendar,
  Layers,
  ChevronRight,
  Headphones,
  Music2
} from 'lucide-react';
import { Form } from '@/types';
import { getPublicFormUrl, FORMS_DOMAIN } from '@/lib/urls';
import ShareModal from '@/components/ShareModal';
import { fetchForms as getFirestoreForms, removeForm as deleteFirestoreForm, fetchSubmissions } from '@/lib/firestoreService';

interface FormWithStats extends Form {
  stats: {
    totalSubmissions: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
    lastSubmission: string | null;
  };
}

export default function DashboardPage() {
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShareForm, setSelectedShareForm] = useState<Form | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.startsWith('forms.')) {
        const path = window.location.pathname.replace(/^\/+/, '');
        const targetHash = path || 'flk2026';
        window.location.replace(`/f/${targetHash}`);
        return;
      }
    }
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const rawForms = await getFirestoreForms();
      const formsWithStats: FormWithStats[] = await Promise.all(
        rawForms.map(async (form) => {
          const subs = await fetchSubmissions(form.id);
          const totalSubmissions = subs.length;
          const applied = subs.filter((s) => s.status === 'applied').length;
          const underReview = subs.filter((s) => s.status === 'under_review').length;
          const shortlisted = subs.filter((s) => s.status === 'shortlisted').length;
          const selected = subs.filter((s) => s.status === 'selected').length;
          const rejected = subs.filter((s) => s.status === 'rejected').length;
          const lastSubmission = subs.length > 0 ? subs[subs.length - 1].submittedAt : null;
          return {
            ...form,
            stats: {
              totalSubmissions,
              applied,
              underReview,
              shortlisted,
              selected,
              rejected,
              lastSubmission,
            },
          };
        })
      );
      setForms(formsWithStats);
    } catch (err) {
      console.error('Failed to load forms from Firestore', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = (slugOrId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/f/${slugOrId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slugOrId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const ok = await deleteFirestoreForm(id);
      if (ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      alert('Failed to delete form');
    }
  };

  const flickForm = forms.find((f) => f.id === 'flick-crew-tracker' || f.slug === 'flick-media-crew');
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.stats?.totalSubmissions || 0), 0);
  const totalShortlisted = forms.reduce((acc, f) => acc + (f.stats?.shortlisted || 0) + (f.stats?.selected || 0), 0);

  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Studio Production Top Bar */}
      <div className="border-b border-hairline pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-studio-400 mb-1">
            <span>FLICK MEDIA OPERATIONS</span>
            <span>/</span>
            <span className="text-amber-400 font-bold">OCTOBER 2026 CYCLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Production Slates & Custom Intake Forms
          </h1>
          <p className="text-sm text-studio-400 mt-1 max-w-2xl">
            Create custom intake software to collect portfolios, sound reels, and crew availability without Google permissions barriers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/builder/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-studio-950 bg-white hover:bg-zinc-200 rounded transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Custom Form</span>
          </Link>
        </div>
      </div>

      {/* Featured Production Slate: Flick Media Indie Artists & Crew */}
      {flickForm && (
        <div className="rounded-xl border border-hairline bg-studio-900/90 overflow-hidden shadow-lg">
          {/* Slate Clapper Header */}
          <div className="px-6 py-4 border-b border-hairline bg-studio-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-studio-300 font-semibold">
                ACTIVE PRODUCTION CALL: FLICK MEDIA | INDIE ARTISTS & CREW
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-studio-800 text-amber-300 border border-studio-700">
                SHOOT: 24–29 OCT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedShareForm(flickForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-800 hover:bg-studio-750 text-amber-300 border border-studio-700 transition-colors"
                title="Share & QR Code"
              >
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Share & QR (forms.buildwithrex.me/{flickForm.hash})</span>
              </button>

              <Link
                href={`/f/${flickForm.hash || flickForm.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-800 hover:bg-studio-750 text-studio-200 border border-studio-700 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-studio-400" />
                <span>Fill Entry</span>
              </Link>

              <Link
                href={`/forms/${flickForm.id}/manage`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-studio-950 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>Open Reel & Call Sheet ({flickForm.stats?.totalSubmissions || 0})</span>
              </Link>
            </div>
          </div>

          {/* Slate Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {flickForm.title}
              </h2>
              <p className="text-xs sm:text-sm text-studio-300 leading-relaxed max-w-2xl">
                {flickForm.description}
              </p>

              {/* Slate Tags */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[11px] text-studio-400 bg-studio-950 px-2.5 py-1 rounded border border-studio-800">
                  18 Tracked Parameters
                </span>
                <span className="font-mono text-[11px] text-studio-400 bg-studio-950 px-2.5 py-1 rounded border border-studio-800">
                  Spotify / Video Reels Enabled
                </span>
                <span className="font-mono text-[11px] text-studio-400 bg-studio-950 px-2.5 py-1 rounded border border-studio-800">
                  Direct WhatsApp Bridge
                </span>
              </div>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-2 gap-2 bg-studio-950/80 p-3 rounded-lg border border-studio-800 self-center">
              <div className="p-2.5 border-r border-studio-850">
                <span className="text-[10px] font-mono uppercase tracking-wider text-studio-500 block">Total Entries</span>
                <span className="text-2xl font-bold text-white tabular-nums">{flickForm.stats?.totalSubmissions || 0}</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 block">Under Review</span>
                <span className="text-2xl font-bold text-amber-400 tabular-nums">{flickForm.stats?.underReview || 0}</span>
              </div>
              <div className="p-2.5 border-r border-t border-studio-850">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block">Shortlisted</span>
                <span className="text-2xl font-bold text-rose-300 tabular-nums">{flickForm.stats?.shortlisted || 0}</span>
              </div>
              <div className="p-2.5 border-t border-studio-850">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">Confirmed Crew</span>
                <span className="text-2xl font-bold text-emerald-300 tabular-nums">{flickForm.stats?.selected || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms & Slates Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-studio-200">
              Active Intake Slates
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-studio-800 text-studio-400">
              {forms.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-studio-500" />
              <input
                type="text"
                placeholder="Search slates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-studio-900 border border-studio-800 rounded text-white placeholder-studio-500 focus:outline-none focus:border-studio-600 w-48"
              />
            </div>

            <Link
              href="/builder/new"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-studio-200 bg-studio-850 hover:bg-studio-800 border border-studio-700 rounded transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Create Form</span>
            </Link>
          </div>
        </div>

        {/* Dense Studio Data Table of Forms */}
        <div className="rounded-xl border border-hairline bg-studio-900 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-studio-850/60 font-mono text-[11px] uppercase tracking-wider text-studio-400">
                <th className="py-3 px-4">Title & Context</th>
                <th className="py-3 px-4 w-36">Category</th>
                <th className="py-3 px-4 w-28 text-center">Fields</th>
                <th className="py-3 px-4 w-32 text-center">Submissions</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 text-right w-52">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-studio-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-studio-500">
                    Loading intake forms...
                  </td>
                </tr>
              ) : filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-studio-500">
                    No intake forms found.
                  </td>
                </tr>
              ) : (
                filteredForms.map((form) => (
                  <tr key={form.id} className="hover:bg-studio-850/40 transition-colors group">
                    {/* Title */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/forms/${form.id}/manage`}
                        className="font-semibold text-white group-hover:text-amber-400 transition-colors block text-sm"
                      >
                        {form.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-amber-300/80 bg-studio-950 px-1.5 py-0.5 rounded border border-studio-800">
                          {FORMS_DOMAIN}/{form.hash || form.slug}
                        </span>
                        <p className="text-[11px] text-studio-500 line-clamp-1">
                          {form.description || 'No description provided.'}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-studio-800 text-studio-300 border border-studio-700/60">
                        {form.category || 'General'}
                      </span>
                    </td>

                    {/* Fields */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-studio-400">
                      {form.fields.length}
                    </td>

                    {/* Submissions */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-white">
                      {form.stats?.totalSubmissions || 0}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          form.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {form.isPublished ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/forms/${form.id}/manage`}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-studio-800 hover:bg-studio-750 text-studio-200 border border-studio-700 transition-colors"
                        >
                          Call Sheet
                        </Link>

                        <Link
                          href={`/builder/${form.id}`}
                          className="p-1 rounded text-studio-400 hover:text-white hover:bg-studio-800"
                          title="Edit Form Schema"
                        >
                          <FileEdit className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          onClick={() => setSelectedShareForm(form)}
                          className="p-1 rounded text-studio-400 hover:text-amber-400 hover:bg-studio-800"
                          title="Share Link & QR Code"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>

                        <Link
                          href={`/f/${form.slug || form.id}`}
                          target="_blank"
                          className="p-1 rounded text-studio-400 hover:text-white hover:bg-studio-800"
                          title="Open Form"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        {form.id !== 'flick-crew-tracker' && (
                          <button
                            onClick={() => handleDelete(form.id, form.title)}
                            className="p-1 rounded text-studio-500 hover:text-rose-400 hover:bg-rose-950/30"
                            title="Delete Form"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Intake Templates */}
      <div className="pt-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-studio-400 mb-3">
          Quick Studio Presets (One-Click Setup)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/builder/new?template=audition"
            className="p-4 rounded-xl border border-hairline bg-studio-900 hover:border-studio-700 transition-colors block group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-amber-400">
              <Headphones className="h-4 w-4" />
              <span className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                Music & Audio Demo Intake
              </span>
            </div>
            <p className="text-[11px] text-studio-400 leading-relaxed">
              Scout lyricists, composers, rappers, and sound designers with demo audio upload and Spotify embed verification.
            </p>
          </Link>

          <Link
            href="/builder/new?template=brief"
            className="p-4 rounded-xl border border-hairline bg-studio-900 hover:border-studio-700 transition-colors block group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-studio-300">
              <Film className="h-4 w-4" />
              <span className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                Commercial Project Brief
              </span>
            </div>
            <p className="text-[11px] text-studio-400 leading-relaxed">
              Capture director scope, moodboard references, deliverables, and budget milestones in one intake document.
            </p>
          </Link>

          <Link
            href="/builder/new?template=rsvp"
            className="p-4 rounded-xl border border-hairline bg-studio-900 hover:border-studio-700 transition-colors block group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-studio-300">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                Shoot Call Sheet & RSVP
              </span>
            </div>
            <p className="text-[11px] text-studio-400 leading-relaxed">
              Log daily call times (e.g. 06:30 AM), transport requirements, safety acknowledgments, and meal preferences.
            </p>
          </Link>
        </div>
      </div>
      {/* Share Modal */}
      {selectedShareForm && (
        <ShareModal
          form={selectedShareForm}
          isOpen={!!selectedShareForm}
          onClose={() => setSelectedShareForm(null)}
        />
      )}
    </div>
  );
}
