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
import {
  fetchFormByIdOrHash,
  fetchSubmissions,
  updateSubmission,
  removeSubmission,
} from '@/lib/firestoreService';

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

export default function ManageClient({ formId: propFormId }: { formId?: string }) {
  const params = useParams();
  const formId =
    propFormId ||
    (params?.id as string) ||
    (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '') ||
    'flick-crew-tracker';

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
      const formData = await fetchFormByIdOrHash(formId);
      if (formData) {
        setForm(formData);
        const subData = await fetchSubmissions(formData.id);
        setSubmissions(subData);
      }
    } catch (err) {
      console.error('Error fetching form data from Firestore:', err);
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
      if (form) {
        await updateSubmission(form.id, submissionId, { status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeSubmission || !form) return;
    try {
      setSavingNotes(true);
      await updateSubmission(form.id, activeSubmission.id, {
        status: activeSubmission.status,
        followUpNotes: notesInput,
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
    if (!confirm('Are you sure you want to delete this applicant entry?') || !form) return;
    try {
      await removeSubmission(form.id, submissionId);
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      if (activeSubmission?.id === submissionId) {
        setActiveSubmission(null);
      }
    } catch (err) {
      alert('Failed to delete submission');
    }
  };

  const handleExportCSV = () => {
    if (!form || !submissions.length) {
      alert('No submissions to export');
      return;
    }
    const headers = ['ID', 'Submitted At', 'Status', 'Follow-up Notes', ...form.fields.map((f) => f.label)];
    const rows = submissions.map((sub) => {
      const fieldValues = form.fields.map((f) => {
        const val = sub.data[f.id];
        if (Array.isArray(val)) return `"${val.join('; ')}"`;
        if (val === undefined || val === null) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [
        sub.id,
        sub.submittedAt,
        sub.status,
        `"${(sub.followUpNotes || '').replace(/"/g, '""')}"`,
        ...fieldValues,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.slug || form.id}-submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-studio-400">
        LOADING PRODUCTION CALL SHEET...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-rose-400">
        FORM NOT FOUND: {formId}
      </div>
    );
  }

  // Active applicant media preview in drawer
  const activeMediaUrl = activeSubmission?.data?.portfolio_link || '';
  const activeEmbedUrl = getEmbedUrl(activeMediaUrl);
  const activeMediaProvider = getMediaProvider(activeMediaUrl);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Editorial Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-studio-400">
            <Link href="/" className="hover:text-white transition-colors">
              PANEL
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-400 uppercase font-bold">PRODUCTION TRACKER</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-studio-800 text-studio-300 border border-studio-700">
              HASH: {form.hash || form.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {form.title}
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
              LIVE
            </span>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Share Modal Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>Share & QR ({form.hash || 'forms.buildwithrex.me'})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-studio-400" />
            <span>Export CSV</span>
          </button>

          <Link
            href={`/builder/${form.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-studio-900 hover:bg-studio-850 text-studio-200 border border-studio-800 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-studio-400" />
            <span>Edit Fields</span>
          </Link>
        </div>
      </div>

      {/* Production Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-1">
          <span className="font-mono text-[11px] text-studio-400 uppercase tracking-wider block">Total Submissions</span>
          <span className="text-2xl font-mono font-bold text-white">{submissions.length}</span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-1">
          <span className="font-mono text-[11px] text-amber-400 uppercase tracking-wider block">In Review</span>
          <span className="text-2xl font-mono font-bold text-amber-300">
            {submissions.filter((s) => s.status === 'under_review').length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-1">
          <span className="font-mono text-[11px] text-rose-400 uppercase tracking-wider block">Shortlisted</span>
          <span className="text-2xl font-mono font-bold text-rose-300">
            {submissions.filter((s) => s.status === 'shortlisted').length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-1">
          <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider block">Confirmed Crew</span>
          <span className="text-2xl font-mono font-bold text-emerald-300">
            {submissions.filter((s) => s.status === 'selected').length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-1 col-span-2 sm:col-span-1">
          <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider block">Tentative Shoot</span>
          <span className="text-sm font-mono font-bold text-zinc-200 block pt-1">24–29 OCT</span>
        </div>
      </div>

      {/* Search, Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-hairline bg-studio-900/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-studio-500" />
            <input
              type="text"
              placeholder="Search artist name, city, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-studio-950 border border-studio-800 rounded-lg text-white placeholder-studio-500 focus:outline-none w-56 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-studio-950 border border-studio-800 rounded-lg text-studio-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="under_review">Reel Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Confirmed Crew</option>
            <option value="rejected">Passed</option>
          </select>

          {/* Role Filter */}
          {availableRoles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-studio-950 border border-studio-800 rounded-lg text-studio-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles ({availableRoles.length})</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Mode Toggle: Production Call Sheet vs Kanban Board */}
        <div className="flex items-center gap-1 border border-studio-800 rounded-lg p-0.5 bg-studio-950">
          <button
            onClick={() => setViewMode('sheet')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'sheet'
                ? 'bg-studio-800 text-white shadow-sm'
                : 'text-studio-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Call Sheet Grid</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'kanban'
                ? 'bg-studio-800 text-white shadow-sm'
                : 'text-studio-400 hover:text-white'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span>Casting Kanban</span>
          </button>
        </div>
      </div>

      {/* Main Content: Sheet vs Kanban */}
      {viewMode === 'sheet' ? (
        /* Call Sheet Table View */
        <div className="rounded-xl border border-hairline bg-studio-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-studio-950/80 font-mono text-[11px] text-studio-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref / Applicant</th>
                  <th className="py-3 px-4">Department / Role</th>
                  <th className="py-3 px-4">Availability (24-29 Oct)</th>
                  <th className="py-3 px-4">Portfolio Reel</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">WhatsApp Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-studio-400 font-mono">
                      NO APPLICANT RECORDS FOUND MATCHING CURRENT FILTER
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.applied;
                    const mediaProvider = getMediaProvider(sub.data.portfolio_link || '');
                    const cleanPhone = cleanPhoneNumber(sub.data.whatsapp_number || '');
                    const waMessage = generateWhatsAppMessage(
                      sub.data.full_name || 'Artist',
                      sub.data.department_role || 'Crew'
                    );

                    return (
                      <tr
                        key={sub.id}
                        onClick={() => openDetail(sub)}
                        className="hover:bg-studio-850/60 cursor-pointer transition-colors group"
                      >
                        {/* Applicant details */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] text-studio-500 block">
                              {sub.id} • {formatDate(sub.submittedAt)}
                            </span>
                            <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {sub.data.full_name || 'Untitled Candidate'}
                            </span>
                            <span className="text-[11px] text-studio-400 block">
                              {sub.data.city_location || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Department / Role */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-medium text-studio-200">
                              {sub.data.department_role || '—'}
                            </span>
                            {sub.data.other_skills && (
                              <span className="text-[10px] text-studio-400 block line-clamp-1">
                                {sub.data.other_skills}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Availability */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="text-[11px] text-studio-300 font-medium block">
                              {sub.data.availability_dates || 'Flexible'}
                            </span>
                            {Array.isArray(sub.data.available_shoot_days) && (
                              <div className="flex flex-wrap gap-1">
                                {sub.data.available_shoot_days.map((day: string) => (
                                  <span
                                    key={day}
                                    className="font-mono text-[9px] px-1 py-0.2 rounded bg-studio-800 text-amber-300/90 border border-studio-700"
                                  >
                                    {day.replace(' (', '•').replace(')', '')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Portfolio */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          {sub.data.portfolio_link ? (
                            <a
                              href={sub.data.portfolio_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-studio-950 border border-studio-800 text-studio-300 hover:text-white hover:border-studio-700 transition-all font-mono text-[11px]"
                            >
                              {mediaProvider === 'spotify' ? (
                                <Music2 className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Film className="h-3 w-3 text-amber-400" />
                              )}
                              <span className="capitalize">{mediaProvider}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </a>
                          ) : (
                            <span className="text-studio-600">—</span>
                          )}
                        </td>

                        {/* Stage Selector */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={sub.status}
                            onChange={(e) =>
                              handleStatusChange(sub.id, e.target.value as ApplicationStatus)
                            }
                            className={`text-[11px] font-mono font-semibold px-2 py-1 rounded border appearance-none cursor-pointer bg-studio-950 ${statusInfo.badgeClass}`}
                          >
                            <option value="applied">Applied</option>
                            <option value="under_review">Reel Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="selected">Confirmed Crew</option>
                            <option value="rejected">Passed</option>
                          </select>
                        </td>

                        {/* Direct WhatsApp Pitch Generator */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          {sub.data.whatsapp_number ? (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25 border border-emerald-500/30 transition-colors font-mono text-[11px]"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>Pitch ({sub.data.whatsapp_number})</span>
                            </a>
                          ) : (
                            <span className="text-studio-600 font-mono text-[11px]">No phone</span>
                          )}
                        </td>

                        {/* View / Delete */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openDetail(sub)}
                            className="p-1.5 text-studio-400 hover:text-white rounded hover:bg-studio-800 transition-colors"
                            title="Inspect application & portfolio"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Casting Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['applied', 'under_review', 'shortlisted', 'selected'] as ApplicationStatus[]).map(
            (colStatus) => {
              const colConfig = STATUS_CONFIG[colStatus];
              const colSubmissions = filteredSubmissions.filter((s) => s.status === colStatus);

              return (
                <div
                  key={colStatus}
                  className="rounded-xl border border-hairline bg-studio-900/80 p-3 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${colConfig.dotClass}`} />
                      <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                        {colConfig.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-studio-400 px-2 py-0.5 rounded bg-studio-800">
                      {colSubmissions.length}
                    </span>
                  </div>

                  {/* Kanban Cards */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {colSubmissions.map((sub) => {
                      const cleanPhone = cleanPhoneNumber(sub.data.whatsapp_number || '');
                      const waMessage = generateWhatsAppMessage(
                        sub.data.full_name || 'Artist',
                        sub.data.department_role || 'Crew'
                      );

                      return (
                        <div
                          key={sub.id}
                          onClick={() => openDetail(sub)}
                          className="p-3.5 rounded-lg border border-hairline bg-studio-950/90 hover:border-amber-400/50 cursor-pointer transition-all space-y-2.5 shadow-sm group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                              {sub.data.full_name || 'Candidate'}
                            </span>
                            <span className="font-mono text-[9px] text-studio-500 shrink-0">
                              {sub.id}
                            </span>
                          </div>

                          <div className="text-[11px] text-studio-300 font-medium">
                            {sub.data.department_role}
                          </div>

                          {sub.data.city_location && (
                            <div className="text-[10px] text-studio-400 font-mono">
                              LOC: {sub.data.city_location}
                            </div>
                          )}

                          {sub.data.availability_dates && (
                            <div className="text-[10px] text-amber-300/80 font-mono line-clamp-1">
                              • {sub.data.availability_dates}
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div
                            className="flex items-center justify-between pt-2 border-t border-hairline text-[10px] font-mono text-studio-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sub.data.whatsapp_number ? (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>
                            ) : (
                              <span>No phone</span>
                            )}

                            <select
                              value={sub.status}
                              onChange={(e) =>
                                handleStatusChange(sub.id, e.target.value as ApplicationStatus)
                              }
                              className="bg-studio-900 border border-studio-800 text-studio-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                            >
                              <option value="applied">Applied</option>
                              <option value="under_review">Review</option>
                              <option value="shortlisted">Shortlist</option>
                              <option value="selected">Confirmed</option>
                              <option value="rejected">Pass</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Applicant Detail Drawer Slate */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-full bg-studio-950 border-l border-hairline p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-amber-400 font-bold">
                    CANDIDATE SLATE: {activeSubmission.id}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-semibold ${
                      STATUS_CONFIG[activeSubmission.status]?.badgeClass
                    }`}
                  >
                    {STATUS_CONFIG[activeSubmission.status]?.label}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  {activeSubmission.data.full_name || 'Anonymous Applicant'}
                </h3>

                <p className="text-xs text-studio-400 font-mono">
                  Applied {formatDate(activeSubmission.submittedAt)}
                </p>
              </div>

              <button
                onClick={() => setActiveSubmission(null)}
                className="p-2 rounded-lg text-studio-400 hover:text-white hover:bg-studio-850 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Embedded Portfolio Player Preview */}
            {activeEmbedUrl && (
              <div className="space-y-2 p-4 rounded-xl border border-hairline bg-studio-900">
                <div className="flex items-center justify-between text-xs font-mono text-studio-400 pb-1">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Headphones className="h-3.5 w-3.5" />
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
