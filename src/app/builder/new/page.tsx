'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormBuilder from '@/components/FormBuilder';
import { Form } from '@/types';

const TEMPLATES: Record<string, Partial<Form>> = {
  audition: {
    title: 'Music & Vocal Auditions / Demo Intake',
    description:
      'We are scouting lyricists, vocalists, and sound designers for upcoming cinematic music projects. Please submit your best demo track.',
    category: 'Music Auditions',
    fields: [
      { id: 'artist_name', label: 'Artist / Performer Name', type: 'text', required: true, placeholder: 'e.g. Rishabh Bothra' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'tel', required: true, placeholder: '+91 98765 43210' },
      { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'artist@gmail.com' },
      {
        id: 'primary_genre',
        label: 'Primary Musical Style / Genre',
        type: 'select',
        required: true,
        options: ['Hip-Hop / Rap', 'Cinematic / Film Score', 'Indie Pop / Acoustic', 'Electronic / Synthwave', 'Classical / Fusion'],
      },
      { id: 'spotify_soundcloud', label: 'Spotify / SoundCloud / Drive Link', type: 'url', required: true, placeholder: 'https://open.spotify.com/track/...' },
      { id: 'lyrics_sample', label: 'Lyrics / Concept Sample', type: 'textarea', required: false, placeholder: 'Paste sample hook or verse...' },
    ],
  },
  brief: {
    title: 'Production Creative Brief & Scoping',
    description: 'Provide project parameters, mood board references, target deliverable dates, and budget estimate.',
    category: 'Production',
    fields: [
      { id: 'client_name', label: 'Client / Director Name', type: 'text', required: true },
      { id: 'project_title', label: 'Project Title / Working Name', type: 'text', required: true },
      { id: 'deliverable_format', label: 'Deliverable Type', type: 'select', required: true, options: ['Music Video', 'Short Film', 'Commercial Ad', 'Soundtrack / EP'] },
      { id: 'target_shoot_date', label: 'Target Production Date', type: 'date', required: true },
      { id: 'budget_range', label: 'Estimated Budget Tier', type: 'select', required: true, options: ['Under 1 Lakh', '1-3 Lakhs', '3-5 Lakhs', '5+ Lakhs'] },
      { id: 'creative_notes', label: 'Creative Direction & Moodboard Links', type: 'textarea', required: false },
    ],
  },
  rsvp: {
    title: 'Production Call Sheet RSVP & Safety Check',
    description: 'Confirm your call time attendance, transport requirements, and dietary preferences for the shoot day.',
    category: 'Logistics',
    fields: [
      { id: 'crew_name', label: 'Crew / Cast Name', type: 'text', required: true },
      { id: 'phone', label: 'Emergency Contact Phone', type: 'tel', required: true },
      { id: 'call_time_confirm', label: 'Can you arrive at 06:30 AM Call Time?', type: 'radio', required: true, options: ['Yes, on time', 'Need transport assistance', 'Slight delay expected'] },
      { id: 'dietary_pref', label: 'Meal Preference', type: 'select', required: true, options: ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan'] },
    ],
  },
};

function NewFormContent() {
  const searchParams = useSearchParams();
  const templateKey = searchParams.get('template');
  const templateData = templateKey && TEMPLATES[templateKey] ? TEMPLATES[templateKey] : undefined;

  return <FormBuilder initialForm={templateData as Form} isNew={true} />;
}

export default function NewFormPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading form builder...</div>}>
      <NewFormContent />
    </Suspense>
  );
}
