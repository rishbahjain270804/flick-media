'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileSpreadsheet,
  Columns3,
  Download,
  ExternalLink,
  Search,
  Check,
  Copy,
  Mail,
  Trash2,
  ChevronRight,
  X,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  Film,
  Play,
  Calendar,
  Headphones,
  Sparkles,
  Music2,
  CheckCircle2,
  Clock,
  Phone
} from 'lucide-react';
import { Form, FormSubmission, ApplicationStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { getEmbedUrl, getMediaProvider, generateWhatsAppMessage, cleanPhoneNumber } from '@/lib/media';
import { getPublicFormUrl, FORMS_DOMAIN } from '@/lib/urls';
import ShareModal from '@/components/ShareModal';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  applied: {
    label: 'Applied',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dotClass: 'bg-zinc-400',
  },
  under_review: {
    label: 'Reel Review',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  shortlisted: {
    label: 'Shortlisted',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
  selected: {
    label: 'Confirmed Crew',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  rejected: {
    label: 'Passed',
    badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    dotClass: 'bg-zinc-600',
  },
};

export default function FormManagePage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'sheet' | 'kanban'>('sheet');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Active Detail Drawer / Modal
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms/${formId}/submissions`);
      const data = await res.json();
      if (data.success) {
        setForm(data.form);
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = () => {
    if (!form) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/f/${form.slug || form.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = async (submissionId: string, newStatus: ApplicationStatus) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, status: newStatus } : sub))
    );
    if (activeSubmission && activeSubmission.id === submissionId) {
      setActiveSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeSubmission) return;
    try {
      setSavingNotes(true);
      await fetch(`/api/submissions/${activeSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: activeSubmission.status,
          followUpNotes: notesInput,
        }),
      });

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === activeSubmission.id ? { ...sub, followUpNotes: notesInput } : sub
        )
      );
      setActiveSubmission((prev) => (prev ? { ...prev, followUpNotes: notesInput } : null));
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this applicant entry?')) return;
    try {
      await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      if (activeSubmission?.id === submissionId) {
        setActiveSubmission(null);
      }
    } catch (err) {
      alert('Failed to delete submission');
    }
  };

  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    submissions.forEach((s) => {
      const r = s.data.department_role;
      if (r) roles.add(r);
    });
    return Array.from(roles);
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const dataStr = JSON.stringify(sub.data).toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        dataStr.includes(searchQuery.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesRole = roleFilter === 'all' || sub.data.department_role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [submissions, searchQuery, statusFilter, roleFilter]);

  const openDetail = (sub: FormSubmission) => {
    setActiveSubmission(sub);
    setNotesInput(sub.followUpNotes || '');
  };

  if (loading) {
    return (
      <div className="p-16 text-center font-mono text-xs text-studio-500">
        INITIALIZING STUDIO CALL SHEET...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-16 text-center">
        <p className="text-rose-400 font-mono text-xs">INTAKE SLATE NOT FOUND</p>
        <Link href="/" className="mt-3 inline-block text-xs text-studio-400 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const counts = {
    total: submissions.length,
    applied: submissions.filter((s) => s.status === 'applied').length,
    under_review: submissions.filter((s) => s.status === 'under_review').length,
    shortlisted: submissions.filter((s) => s.status === 'shortlisted').length,
    selected: submissions.filter((s) => s.status === 'selected').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  // Active submission embed URL
  const activeMediaUrl = activeSubmission?.data?.portfolio_link || '';
  const activeEmbedUrl = activeSubmission ? getEmbedUrl(activeMediaUrl) : null;
  const activeMediaProvider = getMediaProvider(activeMediaUrl);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Studio Header & Production Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono text-studio-400">
            <Link href="/" className="hover:text-white transition-colors">
              SLATES
            </Link>
            <ChevronRight className="h-3 w-3 text-studio-600" />
            <span className="text-amber-400 uppercase">{form.category || 'CALL SHEET'}</span>
            <span className="text-studio-600">/</span>
            <span className="text-studio-300">{submissions.length} SUBMISSIONS</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>{form.title}</span>
          </h1>
          <p className="text-xs text-studio-400 mt-1 max-w-3xl">
            {form.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-studio-900 border border-studio-800 rounded">
            <button
              onClick={() => setViewMode('sheet')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'sheet'
                  ? 'bg-studio-800 text-white shadow-sm'
                  : 'text-studio-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Call Sheet</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-studio-800 text-white shadow-sm'
                  : 'text-studio-400 hover:text-white'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Casting Pipeline</span>
            </button>
          </div>

          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>Share & QR ({form.hash || 'forms.buildwithrex.me'})</span>
          </button>

          <a
            href={`/api/forms/${form.id}/export`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-studio-400" />
            <span>Export CSV</span>
          </a>

          <Link
            href={`/builder/${form.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-studio-400" />
            <span>Edit Fields</span>
          </Link>
        </div>
      </div>

      {/* Production Pipeline Counts Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-studio-800 border-studio-600 ring-1 ring-studio-500'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-studio-400 block">All Entries</span>
          <span className="text-lg font-bold text-white tabular-nums">{counts.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('applied')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'applied'
              ? 'bg-zinc-800 border-zinc-500'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">Applied</span>
          <span className="text-lg font-bold text-zinc-200 tabular-nums">{counts.applied}</span>
        </button>

        <button
          onClick={() => setStatusFilter('under_review')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'under_review'
              ? 'bg-amber-950/40 border-amber-500'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-amber-400 block">Reel Review</span>
          <span className="text-lg font-bold text-amber-300 tabular-nums">{counts.under_review}</span>
        </button>

        <button
          onClick={() => setStatusFilter('shortlisted')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'shortlisted'
              ? 'bg-rose-950/40 border-rose-500'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-rose-400 block">Shortlisted</span>
          <span className="text-lg font-bold text-rose-300 tabular-nums">{counts.shortlisted}</span>
        </button>

        <button
          onClick={() => setStatusFilter('selected')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'selected'
              ? 'bg-emerald-950/40 border-emerald-500'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-emerald-400 block">Confirmed Crew</span>
          <span className="text-lg font-bold text-emerald-300 tabular-nums">{counts.selected}</span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            statusFilter === 'rejected'
              ? 'bg-zinc-800 border-zinc-600'
              : 'bg-studio-900 border-hairline hover:border-studio-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-studio-500 block">Passed</span>
          <span className="text-lg font-bold text-studio-400 tabular-nums">{counts.rejected}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-studio-900 border border-hairline">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-studio-500" />
            <input
              type="text"
              placeholder="Search candidate name, skills, WhatsApp, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-studio-950 border border-studio-800 rounded text-white placeholder-studio-500 focus:outline-none focus:border-studio-600"
            />
          </div>

          {availableRoles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-studio-950 border border-studio-800 rounded text-studio-200 focus:outline-none"
            >
              <option value="all">All Departments / Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-[11px] font-mono text-studio-400">
          SHOWING {filteredSubmissions.length} OF {submissions.length} ENTRIES
        </div>
      </div>

      {/* Main View: Call Sheet or Kanban */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-studio-800 rounded-xl bg-studio-900/30">
          <Film className="h-8 w-8 text-studio-600 mx-auto mb-2" />
          <h4 className="text-white text-xs font-semibold">No candidates match current filters</h4>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
            className="mt-3 text-xs text-amber-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'sheet' ? (
        /* ==================== DENSE STUDIO CALL SHEET GRID ==================== */
        <div className="rounded-xl border border-hairline bg-studio-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-studio-850/80 font-mono text-[11px] uppercase tracking-wider text-studio-400">
                  <th className="py-3 px-4 w-24">Slate ID</th>
                  <th className="py-3 px-4 min-w-[200px]">Candidate & Contact</th>
                  <th className="py-3 px-4 min-w-[170px]">Department / Craft</th>
                  <th className="py-3 px-4 min-w-[130px]">Base Location</th>
                  <th className="py-3 px-4 min-w-[160px]">Shoot Dates (24–29 Oct)</th>
                  <th className="py-3 px-4 min-w-[150px]">Reel / Audio Demo</th>
                  <th className="py-3 px-4 min-w-[150px]">Pipeline Stage</th>
                  <th className="py-3 px-4 min-w-[180px]">Production Notes</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-studio-300">
                {filteredSubmissions.map((sub) => {
                  const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.applied;
                  const name = sub.data.full_name || 'Anonymous';
                  const phone = sub.data.whatsapp_number || '';
                  const cleanPhone = cleanPhoneNumber(phone);
                  const email = sub.data.email || '';
                  const role = sub.data.department_role || '-';
                  const location = sub.data.city_location || '-';
                  const portfolio = sub.data.portfolio_link || '';
                  const provider = getMediaProvider(portfolio);
                  const shootDays = Array.isArray(sub.data.available_shoot_days)
                    ? sub.data.available_shoot_days
                    : [];

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => openDetail(sub)}
                      className="hover:bg-studio-850/50 transition-colors cursor-pointer group"
                    >
                      {/* Slate ID & Time */}
                      <td className="py-3 px-4 font-mono text-studio-400">
                        <div className="font-bold text-white text-[11px]">{sub.id}</div>
                        <div className="text-[10px] text-studio-500">{formatDate(sub.submittedAt)}</div>
                      </td>

                      {/* Candidate & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                          {name}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          {phone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${generateWhatsAppMessage(name, role)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-mono text-[10px]"
                              title="Message Candidate on WhatsApp with Pre-composed Pitch"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>{phone}</span>
                            </a>
                          )}
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              className="text-studio-400 hover:text-white"
                              title="Email Candidate"
                            >
                              <Mail className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Department / Craft */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white text-xs block">
                          {role}
                        </span>
                        {sub.data.other_skills && (
                          <span className="text-[10px] text-studio-400 block line-clamp-1 mt-0.5">
                            {sub.data.other_skills}
                          </span>
                        )}
                      </td>

                      {/* Base Location */}
                      <td className="py-3 px-4 text-studio-300 font-medium">
                        {location}
                      </td>

                      {/* Shoot Dates Chips */}
                      <td className="py-3 px-4">
                        {shootDays.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {shootDays.map((day: string) => {
                              const match = day.match(/Day\s*(\d+)/i);
                              const dayNum = match ? `D${match[1]}` : day;
                              return (
                                <span
                                  key={day}
                                  className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-studio-800 text-amber-300 border border-studio-700"
                                >
                                  {dayNum}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-studio-400 line-clamp-1">
                            {sub.data.availability_dates || 'Flexible'}
                          </span>
                        )}
                      </td>

                      {/* Reel / Audio Demo */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {portfolio ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openDetail(sub)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-studio-800 hover:bg-studio-750 text-amber-300 border border-studio-700 text-[10px] font-mono font-semibold"
                              title="Preview Media in Dossier"
                            >
                              {provider === 'spotify' ? (
                                <Music2 className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Play className="h-3 w-3 text-amber-400 fill-amber-400" />
                              )}
                              <span>{provider === 'spotify' ? 'Spotify Demo' : 'Play Reel'}</span>
                            </button>

                            <a
                              href={portfolio}
                              target="_blank"
                              rel="noreferrer"
                              className="text-studio-500 hover:text-white p-1"
                              title="Open External URL"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-studio-600 font-mono text-[10px]">NO REEL</span>
                        )}
                      </td>

                      {/* Pipeline Stage Dropdown */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub.id, e.target.value as ApplicationStatus)}
                          className={`font-mono text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none cursor-pointer ${statusInfo.badgeClass}`}
                        >
                          <option value="applied" className="bg-studio-950 text-zinc-300">Applied</option>
                          <option value="under_review" className="bg-studio-950 text-amber-300">Reel Review</option>
                          <option value="shortlisted" className="bg-studio-950 text-rose-300">Shortlisted</option>
                          <option value="selected" className="bg-studio-950 text-emerald-300">Confirmed Crew</option>
                          <option value="rejected" className="bg-studio-950 text-zinc-500">Passed</option>
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-xs text-studio-400">
                        {sub.followUpNotes ? (
                          <span className="line-clamp-1 italic text-studio-300">
                            "{sub.followUpNotes}"
                          </span>
                        ) : (
                          <span className="text-studio-600 text-[11px] italic">Add note...</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(sub)}
                            className="p-1 rounded text-studio-400 hover:text-white hover:bg-studio-800"
                            title="Open Dossier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1 rounded text-studio-500 hover:text-rose-400 hover:bg-rose-950/40"
                            title="Delete Entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== CASTING & CREW PIPELINE (KANBAN) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {(['applied', 'under_review', 'shortlisted', 'selected', 'rejected'] as ApplicationStatus[]).map(
            (statusKey) => {
              const config = STATUS_CONFIG[statusKey];
              const columnSubs = filteredSubmissions.filter((s) => s.status === statusKey);

              return (
                <div
                  key={statusKey}
                  className="rounded-xl border border-hairline bg-studio-900/60 p-3 flex flex-col min-w-[260px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                      <h4 className="font-mono text-xs font-bold uppercase text-white">
                        {config.label}
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-studio-800 text-studio-300">
                      {columnSubs.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 flex-1">
                    {columnSubs.length === 0 ? (
                      <div className="py-8 text-center text-studio-600 font-mono text-[11px]">
                        EMPTY STAGE
                      </div>
                    ) : (
                      columnSubs.map((sub) => {
                        const name = sub.data.full_name || 'Anonymous';
                        const role = sub.data.department_role || '-';
                        const phone = sub.data.whatsapp_number || '';
                        const cleanPhone = cleanPhoneNumber(phone);
                        const portfolio = sub.data.portfolio_link || '';
                        const provider = getMediaProvider(portfolio);

                        return (
                          <div
                            key={sub.id}
                            onClick={() => openDetail(sub)}
                            className="p-3 rounded-lg border border-hairline bg-studio-950 hover:border-studio-700 transition-all cursor-pointer group shadow-sm space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="font-mono text-[10px] text-studio-500 block">{sub.id}</span>
                                <h5 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                                  {name}
                                </h5>
                              </div>
                              <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-studio-800 text-studio-300">
                                {sub.data.city_location?.split('/')[0] || 'Remote'}
                              </span>
                            </div>

                            <p className="text-[11px] font-medium text-amber-300/90 line-clamp-1">
                              {role}
                            </p>

                            {/* Media & WhatsApp Strip */}
                            <div
                              className="flex items-center justify-between pt-2 border-t border-hairline text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {portfolio ? (
                                <button
                                  onClick={() => openDetail(sub)}
                                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                                >
                                  {provider === 'spotify' ? <Music2 className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                                  <span>Preview Demo</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-studio-600 font-mono">NO DEMO</span>
                              )}

                              {phone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}?text=${generateWhatsAppMessage(name, role)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-studio-400 hover:text-emerald-400 text-[10px] font-mono inline-flex items-center gap-1"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="h-3 w-3 text-emerald-400" />
                                  <span>Chat</span>
                                </a>
                              )}
                            </div>

                            {/* Stage Selector */}
                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={sub.status}
                                onChange={(e) => handleStatusChange(sub.id, e.target.value as ApplicationStatus)}
                                className="w-full font-mono text-[10px] bg-studio-900 border border-studio-800 rounded px-2 py-1 text-studio-300 focus:outline-none"
                              >
                                <option value="applied">Stage: Applied</option>
                                <option value="under_review">Stage: Reel Review</option>
                                <option value="shortlisted">Stage: Shortlist</option>
                                <option value="selected">Stage: Confirmed Crew</option>
                                <option value="rejected">Stage: Pass</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ==================== APPLICANT DOSSIER MODAL WITH AUDIO/VIDEO PREVIEW ==================== */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl border border-hairline-light bg-studio-950 p-6 shadow-2xl space-y-6">
            {/* Clapperboard Header */}
            <div className="flex items-start justify-between pb-4 border-b border-hairline">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-studio-400 mb-1">
                  <span className="text-amber-400 font-bold">{activeSubmission.id}</span>
                  <span>•</span>
                  <span>RECEIVED {formatDate(activeSubmission.submittedAt)}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeSubmission.data.full_name || 'Applicant'}
                </h3>
                <span className="inline-block mt-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-studio-800 text-amber-300 border border-studio-700">
                  {activeSubmission.data.department_role || 'General Role'}
                </span>
              </div>

              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1.5 rounded text-studio-400 hover:text-white hover:bg-studio-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Embedded Audio / Video Player if Spotify or YouTube */}
            {activeEmbedUrl && (
              <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-studio-400">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    {activeMediaProvider === 'spotify' ? (
                      <Music2 className="h-3.5 w-3.5" />
                    ) : (
                      <Film className="h-3.5 w-3.5" />
                    )}
                    <span className="font-bold uppercase">{activeMediaProvider} Direct Preview Player</span>
                  </span>
                  <a
                    href={activeMediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white underline flex items-center gap-1"
                  >
                    <span>Open in {activeMediaProvider}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="overflow-hidden rounded-lg">
                  <iframe
                    src={activeEmbedUrl}
                    width="100%"
                    height={activeMediaProvider === 'spotify' ? '152' : '320'}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-0 rounded-lg w-full"
                  />
                </div>
              </div>
            )}

            {/* Direct WhatsApp Call Sheet Action */}
            {activeSubmission.data.whatsapp_number && (
              <div className="p-4 rounded-xl border border-hairline bg-studio-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                    Instant WhatsApp Connection
                  </span>
                  <p className="text-xs text-studio-300">
                    Send a pre-composed producer note to coordinate availability for 24–29 Oct.
                  </p>
                </div>

                <a
                  href={`https://wa.me/${cleanPhoneNumber(activeSubmission.data.whatsapp_number)}?text=${generateWhatsAppMessage(
                    activeSubmission.data.full_name,
                    activeSubmission.data.department_role
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Launch WhatsApp ({activeSubmission.data.whatsapp_number})</span>
                </a>
              </div>
            )}

            {/* Stage Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-studio-400 block">
                Casting Decision
              </label>
              <select
                value={activeSubmission.status}
                onChange={(e) => handleStatusChange(activeSubmission.id, e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 text-xs font-mono font-semibold rounded bg-studio-900 border border-studio-700 text-white focus:outline-none"
              >
                <option value="applied">Stage: Applied (Pending Review)</option>
                <option value="under_review">Stage: Reel Review (Evaluating Audio / Reel)</option>
                <option value="shortlisted">Stage: Shortlisted (Scheduled for Alignment Call)</option>
                <option value="selected">Stage: Confirmed Crew (Production Team Member)</option>
                <option value="rejected">Stage: Passed / Archived</option>
              </select>
            </div>

            {/* Submission Answers Grid */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-studio-400 border-b border-hairline pb-1">
                Candidate Responses ({form.fields.length} Parameters)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {form.fields.map((field) => {
                  const val = activeSubmission.data[field.id];
                  let displayVal = '-';
                  if (val !== undefined && val !== null && val !== '') {
                    displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                  }
                  const isUrl = typeof displayVal === 'string' && (displayVal.startsWith('http://') || displayVal.startsWith('https://'));

                  return (
                    <div
                      key={field.id}
                      className={`p-3 rounded bg-studio-900/60 border border-hairline ${
                        field.type === 'textarea' ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <span className="font-mono text-[10px] text-studio-500 uppercase block mb-1">
                        {field.label}
                      </span>
                      {isUrl ? (
                        <a
                          href={displayVal}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline break-all inline-flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span>{displayVal}</span>
                        </a>
                      ) : (
                        <p className="text-white font-medium whitespace-pre-wrap">{displayVal}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Follow-Up Notes */}
            <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-2">
              <label className="text-xs font-mono font-bold text-white uppercase block">
                Internal Producer Notes
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Log call feedback, agreed rate/credits, shoot day call times..."
                rows={3}
                className="w-full p-2.5 text-xs bg-studio-950 border border-studio-800 rounded text-white placeholder-studio-600 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-studio-950 disabled:opacity-50"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-hairline text-xs font-mono">
              <button
                onClick={() => handleDeleteSubmission(activeSubmission.id)}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Candidate</span>
              </button>

              <button
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-1.5 rounded bg-studio-800 hover:bg-studio-700 text-white font-medium"
              >
                Close Slate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Share & Embed Modal */}
      {form && (
        <ShareModal
          form={form}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
