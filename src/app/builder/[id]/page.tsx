'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FormBuilder from '@/components/FormBuilder';
import { Form } from '@/types';

export default function EditFormPage() {
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        const res = await fetch(`/api/forms/${id}`);
        const data = await res.json();
        if (data.success) {
          setForm(data.form);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading form builder...</div>;
  }

  if (!form) {
    return <div className="p-12 text-center text-rose-400">Form not found</div>;
  }

  return <FormBuilder initialForm={form} isNew={false} />;
}
