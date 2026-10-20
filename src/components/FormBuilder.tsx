'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Save,
  Eye,
  Check,
  Smartphone,
  Monitor,
  ChevronRight,
  Layers,
  X,
  SlidersHorizontal,
  Film
} from 'lucide-react';
import { Form, FormField, FormFieldType } from '@/types';
import { generateId } from '@/lib/utils';
import { FORMS_DOMAIN } from '@/lib/urls';

const FIELD_GROUPS = [
  {
    category: 'Text & Details',
    types: [
      { type: 'text' as FormFieldType, label: 'Single-line Text', desc: 'Candidate name, city, handle' },
      { type: 'textarea' as FormFieldType, label: 'Long Text / Rider', desc: 'Equipment list, expectations' },
      { type: 'number' as FormFieldType, label: 'Numeric Value', desc: 'Age, years experience' },
    ],
  },
  {
    category: 'Contact & Media',
    types: [
      { type: 'tel' as FormFieldType, label: 'WhatsApp / Phone', desc: 'Direct mobile with +91' },
      { type: 'email' as FormFieldType, label: 'Email Address', desc: 'Electronic mail' },
      { type: 'url' as FormFieldType, label: 'Portfolio / Audio Link', desc: 'Spotify, YouTube, Vimeo, Drive' },
    ],
  },
  {
    category: 'Choices & Logistics',
    types: [
      { type: 'select' as FormFieldType, label: 'Dropdown Menu', desc: 'Department / Role selection' },
      { type: 'radio' as FormFieldType, label: 'Radio Cards', desc: 'Pick one option' },
      { type: 'checkbox' as FormFieldType, label: 'Multi Checkboxes', desc: 'Shoot day availability' },
      { type: 'date' as FormFieldType, label: 'Calendar Date', desc: 'Specific availability day' },
    ],
  },
];

interface FormBuilderProps {
  initialForm?: Form;
  isNew?: boolean;
}

export default function FormBuilder({ initialForm, isNew = false }: FormBuilderProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialForm?.title || 'New Intake Slate');
  const [hash, setHash] = useState(initialForm?.hash || '');
  const [description, setDescription] = useState(
    initialForm?.description || 'Please provide your details below for production review.'
  );
  const [category, setCategory] = useState(initialForm?.category || 'Crew Call');
  const [isPublished, setIsPublished] = useState(initialForm ? initialForm.isPublished : true);
  const [submitButtonText, setSubmitButtonText] = useState(initialForm?.submitButtonText || 'Submit Application');
  const [successMessage, setSuccessMessage] = useState(
    initialForm?.successMessage || 'Thank you! Your entry has been logged for production review.'
  );

  const [fields, setFields] = useState<FormField[]>(
    initialForm?.fields && initialForm.fields.length > 0
      ? initialForm.fields
      : [
          {
            id: 'full_name',
            label: 'Full Name / Artist Name',
            type: 'text',
            placeholder: 'e.g. Rishabh Bothra',
            required: true,
          },
          {
            id: 'whatsapp_number',
            label: 'WhatsApp Number',
            type: 'tel',
            placeholder: '+91 98765 43210',
            required: true,
          },
          {
            id: 'department_role',
            label: 'Primary Role / Department',
            type: 'select',
            required: true,
            options: ['Lyricist & Rapper', 'Music Producer', 'Cinematographer / DOP', 'Editor', 'Director'],
          },
          {
            id: 'portfolio_link',
            label: 'Spotify / Showreel Link',
            type: 'url',
            placeholder: 'https://open.spotify.com/track/...',
            required: true,
          },
        ]
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: generateId('field'),
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type,
      required: false,
      placeholder: '',
      helpText: '',
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setFields(copy);
  };

  const duplicateField = (field: FormField) => {
    const cloned: FormField = {
      ...field,
      id: generateId('field'),
      label: `${field.label} (Copy)`,
    };
    setFields([...fields, cloned]);
  };

  const handleOptionChange = (fieldId: string, optIndex: number, newVal: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;
    const opts = [...field.options];
    opts[optIndex] = newVal;
    updateField(fieldId, { options: opts });
  };

  const addOptionToField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const opts = field.options ? [...field.options] : [];
    opts.push(`Option ${opts.length + 1}`);
    updateField(fieldId, { options: opts });
  };

  const removeOptionFromField = (fieldId: string, optIndex: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;
    const opts = field.options.filter((_, i) => i !== optIndex);
    updateField(fieldId, { options: opts });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please provide a title for the form');
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<Form> = {
        title,
        hash: hash.trim() || undefined,
        description,
        category,
        isPublished,
        submitButtonText,
        successMessage,
        fields,
      };

      const endpoint = isNew ? '/api/forms' : `/api/forms/${initialForm?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        if (isNew) {
          router.push(`/forms/${data.form.id}/manage`);
        }
      } else {
        alert(data.error || 'Failed to save form');
      }
    } catch (err) {
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Architect Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-studio-400 mb-1">
            <Link href="/" className="hover:text-white transition-colors">
              SLATES
            </Link>
            <ChevronRight className="h-3 w-3 text-studio-600" />
            <span className="text-amber-400 uppercase">SCHEMA BUILDER</span>
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            {isNew ? 'Create New Intake Slate' : `Edit: ${title}`}
          </h1>
        </div>

        {/* View Switcher & Save Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-studio-900 border border-studio-800 rounded">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'editor' ? 'bg-studio-800 text-white' : 'text-studio-400 hover:text-white'
              }`}
            >
              Schema Fields ({fields.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-studio-800 text-white' : 'text-studio-400 hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Live Test</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded bg-amber-400 hover:bg-amber-300 text-studio-950 transition-all disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Saved</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Slate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slate Questions (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Details */}
            <div className="p-5 rounded-xl border border-hairline bg-studio-900 space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-studio-400 block mb-1">
                  Slate Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flick Media Casting Call"
                  className="w-full text-base font-bold px-3 py-2 bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-studio-400 block mb-1">
                  Production Instructions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain dates, requirements, roles..."
                  className="w-full text-xs px-3 py-2 bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 rounded-xl border border-hairline bg-studio-900/80 hover:border-studio-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-400">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-mono text-[10px] uppercase font-semibold text-studio-300">
                        {field.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-studio-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        className="p-1 text-studio-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => duplicateField(field)}
                        className="p-1 text-studio-400 hover:text-white"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-1 text-studio-400 hover:text-rose-400"
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Field Label & Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono uppercase text-studio-500 block mb-1">
                        Question Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-1.5 bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-studio-500 block mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="e.g. Type here..."
                        className="w-full text-xs px-3 py-1.5 bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-studio-500 block mb-1">
                        Help Hint
                      </label>
                      <input
                        type="text"
                        value={field.helpText || ''}
                        onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                        placeholder="Clarification..."
                        className="w-full text-xs px-3 py-1.5 bg-studio-950 border border-studio-800 rounded text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div className="p-3 rounded bg-studio-950 border border-hairline space-y-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-studio-400 block">
                        Options List
                      </span>
                      <div className="space-y-1">
                        {field.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-studio-500 w-4">{oIdx + 1}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(field.id, oIdx, e.target.value)}
                              className="flex-1 text-xs px-2.5 py-1 bg-studio-900 border border-studio-800 rounded text-white focus:outline-none"
                            />
                            <button
                              onClick={() => removeOptionFromField(field.id, oIdx)}
                              className="p-1 text-studio-500 hover:text-rose-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addOptionToField(field.id)}
                        className="text-[11px] font-mono text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  )}

                  {/* Required Switch */}
                  <div className="flex items-center justify-between pt-1 border-t border-hairline text-xs font-mono">
                    <span className="text-studio-400">Required Parameter</span>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="accent-amber-400 h-4 w-4 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Palette */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-hairline bg-studio-900 space-y-4 sticky top-20">
              <h3 className="font-mono text-xs uppercase font-bold text-studio-400">
                Add Field Type
              </h3>

              <div className="space-y-3">
                {FIELD_GROUPS.map((group) => (
                  <div key={group.category} className="space-y-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-studio-500">
                      {group.category}
                    </span>
                    <div className="space-y-1">
                      {group.types.map((t) => (
                        <button
                          key={t.type}
                          onClick={() => addField(t.type)}
                          className="w-full text-left p-2 rounded border border-hairline bg-studio-950/60 hover:bg-studio-850 hover:border-studio-700 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {t.label}
                            </span>
                            <span className="text-[10px] text-studio-500 block">
                              {t.desc}
                            </span>
                          </div>
                          <Plus className="h-3 w-3 text-studio-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Slate Settings */}
              <div className="pt-3 border-t border-hairline space-y-2">
                <span className="font-mono text-xs uppercase font-bold text-studio-400 block">
                  Slate Settings & Domain
                </span>

                <div>
                  <label className="text-[10px] font-mono uppercase text-studio-500 block mb-0.5">
                    Custom URL Hash ({FORMS_DOMAIN}/...)
                  </label>
                  <div className="flex items-center gap-1 bg-studio-950 border border-studio-800 rounded px-2 py-1">
                    <span className="text-[10px] font-mono text-studio-500">/</span>
                    <input
                      type="text"
                      value={hash}
                      onChange={(e) => setHash(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="e.g. audition26 or auto-hash"
                      className="w-full text-xs font-mono bg-transparent text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-studio-500 block mb-0.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-1 bg-studio-950 border border-studio-800 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-studio-500 block mb-0.5">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    className="w-full text-xs px-2.5 py-1 bg-studio-950 border border-studio-800 rounded text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-studio-300">Intake Active (Public)</span>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="accent-amber-400 h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Device Preview */
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between p-2 rounded bg-studio-900 border border-hairline">
            <span className="font-mono text-xs text-studio-400">DEVICE FRAME:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded text-xs flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-studio-800 text-white' : 'text-studio-500'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded text-xs flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-studio-800 text-white' : 'text-studio-500'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>iPhone / Mobile</span>
              </button>
            </div>
          </div>

          <div
            className={`mx-auto transition-all ${
              previewDevice === 'mobile'
                ? 'w-[375px] rounded-[36px] border-4 border-studio-700 p-4 bg-studio-950 shadow-2xl space-y-4'
                : 'w-full space-y-4'
            }`}
          >
            <div className="rounded-xl border border-hairline bg-studio-900 p-6 space-y-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">
                {category}
              </span>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-xs text-studio-300">{description}</p>
            </div>

            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={f.id} className="p-4 rounded-xl border border-hairline bg-studio-900/70 space-y-1.5">
                  <label className="text-xs font-semibold text-white block">
                    <span className="font-mono text-studio-500 mr-1">{i + 1}.</span>
                    {f.label}
                    {f.required && <span className="text-amber-400 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder={f.placeholder || 'Answer...'}
                    className="w-full text-xs px-3 py-1.5 bg-studio-950 border border-studio-800 rounded text-studio-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
