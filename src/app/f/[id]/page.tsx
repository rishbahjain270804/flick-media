'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Calendar,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  User,
  MapPin,
  Film,
  Music2,
  Clock,
  Check,
  Disc3
} from 'lucide-react';
import { Form, FormField } from '@/types';
import { getEmbedUrl, getMediaProvider } from '@/lib/media';

export default function PublicFormPage() {
  const params = useParams();
  const formIdentifier = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSubmissionId, setSubmittedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    fetchForm();
  }, [formIdentifier]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms/${formIdentifier}`);
      const data = await res.json();
      if (data.success) {
        setForm(data.form);
        const defaults: Record<string, any> = {};
        data.form.fields.forEach((field: FormField) => {
          if (field.defaultValue) {
            defaults[field.id] = field.defaultValue;
          } else if (field.type === 'checkbox') {
            defaults[field.id] = [];
          } else {
            defaults[field.id] = '';
          }
        });
        setFormData(defaults);
      } else {
        setForm(null);
      }
    } catch (err) {
      console.error('Failed to load form', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current: string[] = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    const index = current.indexOf(option);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(option);
    }
    handleInputChange(fieldId, current);
  };

  const validate = (): boolean => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please provide a valid email';
        }
      }

      if (field.type === 'url' && formData[field.id]) {
        const urlStr: string = formData[field.id].trim();
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          newErrors[field.id] = 'Link must start with https:// or http://';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/forms/${form!.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      const resData = await res.json();
      if (resData.success) {
        setSubmittedSubmissionId(resData.submission.id);
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}
      } else {
        alert(resData.error || 'Failed to submit form');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedSubmissionId(null);
    const defaults: Record<string, any> = {};
    form?.fields.forEach((field: FormField) => {
      defaults[field.id] = field.type === 'checkbox' ? [] : '';
    });
    setFormData(defaults);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio-950 p-4">
        <div className="font-mono text-xs text-studio-400">LOADING PRODUCTION INTAKE...</div>
      </div>
    );
  }

  if (!form || !form.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio-950 p-4 text-center">
        <div className="max-w-md p-8 rounded-xl border border-hairline bg-studio-900 space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-white uppercase font-mono">Call Sheet Inactive</h2>
          <p className="text-xs text-studio-400">
            This intake slate has concluded or is set to private draft mode.
          </p>
        </div>
      </div>
    );
  }

  // Submitted Confirmation Slate
  if (submittedSubmissionId) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-xl border border-hairline-light bg-studio-900 p-8 shadow-2xl text-center space-y-6">
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="h-7 w-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold block">
              APPLICATION LOGGED: {submittedSubmissionId}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Submission Received by Production Team
            </h2>
            <p className="text-xs text-studio-300 leading-relaxed max-w-sm mx-auto">
              {form.successMessage || 'We will review your portfolio and reach out directly via WhatsApp/Email.'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-studio-950 border border-hairline text-left text-xs font-mono space-y-2 text-studio-400">
            <div className="flex justify-between border-b border-hairline pb-1.5">
              <span>PROJECT SLATE:</span>
              <span className="text-white font-bold">{form.title}</span>
            </div>
            <div className="flex justify-between border-b border-hairline pb-1.5">
              <span>EVALUATION WINDOW:</span>
              <span className="text-amber-400 font-bold">1–2 DAYS (BY 22 OCT)</span>
            </div>
            <div className="flex justify-between">
              <span>NEXT STEP:</span>
              <span className="text-studio-200">DIRECT WHATSAPP ALIGNMENT</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded bg-studio-800 hover:bg-studio-750 text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Submit Another Entry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Portfolio Link preview in form
  const portfolioVal = formData['portfolio_link'] || '';
  const detectedEmbed = getEmbedUrl(portfolioVal);
  const detectedProvider = getMediaProvider(portfolioVal);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-8">
      {/* Editorial Clapper Slate Header */}
      <div className="rounded-xl border border-hairline bg-studio-900 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider">
            <Film className="h-3.5 w-3.5" />
            <span>FLICK MEDIA • PRODUCTION CALL</span>
          </div>

          <span className="font-mono text-[10px] text-studio-400 px-2 py-0.5 rounded bg-studio-800 border border-studio-700">
            SHOOT: 24–29 OCT
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {form.title}
          </h1>

          {form.description && (
            <p className="text-xs sm:text-sm text-studio-300 mt-2 leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-studio-500 pt-2 border-t border-hairline">
          <span>* INDICATES REQUIRED PARAMETER</span>
          <span>EST. TIME: ~3 MINS</span>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((field, idx) => {
          const hasError = !!errors[field.id];
          const value = formData[field.id];

          return (
            <div
              key={field.id}
              id={`field-${field.id}`}
              className={`rounded-xl border p-5 transition-all bg-studio-900/90 ${
                hasError
                  ? 'border-rose-500/80 bg-rose-950/10'
                  : 'border-hairline hover:border-studio-700'
              }`}
            >
              {/* Question Label */}
              <div className="space-y-1 mb-3">
                <label className="block text-xs sm:text-sm font-semibold text-white">
                  <span className="font-mono text-xs text-studio-500 mr-2">{String(idx + 1).padStart(2, '0')}.</span>
                  {field.label}
                  {field.required && <span className="text-amber-400 ml-1 font-bold">*</span>}
                </label>

                {field.helpText && (
                  <p className="text-[11px] text-studio-400">{field.helpText}</p>
                )}
              </div>

              {/* Control Type */}
              <div className="mt-2">
                {/* Text / Email / Tel / Number / URL */}
                {['text', 'tel', 'email', 'number', 'url'].includes(field.type) && (
                  <input
                    type={field.type === 'url' ? 'text' : field.type}
                    value={value || ''}
                    placeholder={field.placeholder || 'Your response...'}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-studio-950 border border-studio-800 rounded-lg text-white placeholder-studio-600 focus:outline-none transition-all font-sans"
                  />
                )}

                {/* Live Spotify / YouTube Embed Validation Pill */}
                {field.id === 'portfolio_link' && portfolioVal && (
                  <div className="mt-2.5 p-3 rounded-lg border border-hairline bg-studio-950 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-studio-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        {detectedProvider === 'spotify' ? (
                          <Music2 className="h-3.5 w-3.5" />
                        ) : (
                          <Film className="h-3.5 w-3.5" />
                        )}
                        <span>{detectedProvider.toUpperCase()} LINK DETECTED</span>
                      </span>
                      <span className="text-[10px] text-studio-500">READY FOR PRODUCER REVIEW</span>
                    </div>

                    {detectedEmbed && (
                      <div className="overflow-hidden rounded">
                        <iframe
                          src={detectedEmbed}
                          width="100%"
                          height={detectedProvider === 'spotify' ? '80' : '180'}
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="border-0 rounded w-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    value={value || ''}
                    placeholder={field.placeholder || 'Provide details...'}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-studio-950 border border-studio-800 rounded-lg text-white placeholder-studio-600 focus:outline-none transition-all"
                  />
                )}

                {/* Select Dropdown */}
                {field.type === 'select' && (
                  <div className="relative">
                    <select
                      value={value || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-studio-950 border border-studio-800 rounded-lg text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} className="bg-studio-950 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-studio-500 pointer-events-none" />
                  </div>
                )}

                {/* Radio Options (Tactile Studio Style) */}
                {field.type === 'radio' && (
                  <div className="space-y-1.5">
                    {field.options?.map((option) => {
                      const isSelected = value === option;
                      return (
                        <label
                          key={option}
                          onClick={() => handleInputChange(field.id, option)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/40 text-white'
                              : 'bg-studio-950/60 border-studio-850 text-studio-300 hover:border-studio-750'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? 'border-amber-400 bg-amber-400' : 'border-studio-600'
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-studio-950" />}
                          </div>
                          <span className="font-medium">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Multi-Select Checkboxes */}
                {field.type === 'checkbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {field.options?.map((option) => {
                      const isChecked = Array.isArray(value) && value.includes(option);
                      return (
                        <label
                          key={option}
                          onClick={() => handleCheckboxToggle(field.id, option)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-amber-500/15 border-amber-500/40 text-white'
                              : 'bg-studio-950/60 border-studio-850 text-studio-300 hover:border-studio-750'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                              isChecked ? 'border-amber-400 bg-amber-400 text-studio-950' : 'border-studio-600'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="font-mono text-xs">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-studio-950 border border-studio-800 rounded-lg text-white focus:outline-none"
                  />
                )}
              </div>

              {/* Error */}
              {hasError && (
                <p className="text-xs text-rose-400 font-mono mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors[field.id]}</span>
                </p>
              )}
            </div>
          );
        })}

        {/* Submit Control */}
        <div className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-studio-400 text-center sm:text-left">
            SUBMITTING DIRECTLY TO FLICK MEDIA PRODUCTION TEAM
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-bold text-studio-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              <span>Logging Entry...</span>
            ) : (
              <>
                <span>{form.submitButtonText || 'Submit Application'}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
