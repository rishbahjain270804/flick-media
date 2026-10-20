'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FormBuilder from '@/components/FormBuilder';
import { Form } from '@/types';
import { fetchFormByIdOrHash } from '@/lib/firestoreService';

export default function BuilderClient({ formId }: { formId?: string }) {
  const params = useParams();
  const id =
    formId ||
    (params?.id as string) ||
    (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : '') ||
    'flick-crew-tracker';

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        const data = await fetchFormByIdOrHash(id);
        if (data) {
          setForm(data);
        }
      } catch (err) {
        console.error('Error loading form for builder:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadForm();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-studio-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-studio-brand animate-ping" />
          <span>LOADING SLATE ARCHITECT...</span>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-studio-400 font-mono text-sm space-y-3">
        <span className="text-rose-400">SLATE NOT FOUND: {id}</span>
      </div>
    );
  }

  return <FormBuilder initialForm={form} isNew={false} />;
}
