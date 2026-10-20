import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Form, FormSubmission, ApplicationStatus } from '@/types';

export function generateFormHash(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let hash = '';
  for (let i = 0; i < 6; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export const SEED_FORM: Form = {
  id: 'flick-crew-tracker',
  slug: 'flick-media-crew',
  hash: 'flk2026',
  title: 'FLICK MEDIA | Indie Artists & Crew Application Tracker',
  description:
    'Join our upcoming indie film & music video project (tentative shoot 24-29 Oct). Please share your details, portfolio, and availability. We review all entries within 1-2 days!',
  category: 'Crew & Artist Applications',
  isPublished: true,
  themeColor: '#e11d48',
  submitButtonText: 'Submit Application',
  successMessage: 'Thank you for applying to Flick Media! We will review your portfolio and reach out via WhatsApp/Email ASAP.',
  settings: {
    isOpen: true,
    maxSubmissions: 100,
    closeMessage: 'Applications for the October cycle are now full. Stay tuned for future project calls!',
  },
  createdAt: '2026-10-20T10:00:00.000Z',
  updatedAt: '2026-10-20T10:00:00.000Z',
  fields: [
    {
      id: 'full_name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'e.g. Rishabh Bothra',
      required: true,
      helpText: 'Your legal or professional artist name',
    },
    {
      id: 'whatsapp_number',
      label: 'WhatsApp Number',
      type: 'tel',
      placeholder: '+91 98765 43210',
      required: true,
      helpText: 'Include country code for prompt WhatsApp communication',
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'artist@example.com',
      required: true,
    },
    {
      id: 'city_location',
      label: 'City / Current Location',
      type: 'text',
      placeholder: 'e.g. Mumbai, Delhi, Bengaluru, Pune',
      required: true,
    },
    {
      id: 'department_role',
      label: 'Department / Primary Role',
      type: 'select',
      required: true,
      options: [
        'Lyricist & Rapper',
        'Music Producer & Composer',
        'Singer / Vocalist',
        'Director',
        'Assistant Director (AD)',
        'Cinematographer / DOP',
        'Camera Operator / Focus Puller',
        'Sound Recordist / Audio Engineer',
        'Editor & Colorist',
        'Production Designer / Art Director',
        'Production Manager / Line Producer',
        'Choreographer / Movement Coach',
        'Costume Designer / Wardrobe Stylist',
        'Makeup & Hair Artist',
        'Actor / Performer',
        'Other Specialist',
      ],
      helpText: 'Select the role you are primarily applying for',
    },
    {
      id: 'other_skills',
      label: 'Other Skills & Secondary Roles',
      type: 'text',
      placeholder: 'e.g. Guitarist, Drone Pilot, DaVinci Resolve, Mixing, Beatbox',
      required: false,
    },
    {
      id: 'availability_dates',
      label: 'Availability (24-29 Oct, tentative)',
      type: 'radio',
      required: true,
      options: [
        'Fully Available for all dates (24-29 Oct)',
        'Available on select days only',
        'Available with prior notice / Flexible',
        'Pre-production only',
      ],
    },
    {
      id: 'available_shoot_days',
      label: 'Available Shoot Days',
      type: 'checkbox',
      required: false,
      options: [
        'Day 1 (24 Oct)',
        'Day 2 (25 Oct)',
        'Day 3 (26 Oct)',
        'Day 4 (27 Oct)',
        'Day 5 (28 Oct)',
        'Day 6 (29 Oct)',
      ],
    },
    {
      id: 'can_attend_preprod',
      label: 'Can Attend Pre-production Meetings?',
      type: 'radio',
      required: true,
      options: ['Yes (In-person & Online)', 'Online / Virtual only', 'Limited availability'],
    },
    {
      id: 'experience_level',
      label: 'Experience Level',
      type: 'select',
      required: true,
      options: [
        'Student / Emerging Talent (Passionate & eager to learn)',
        '1-2 years Indie / Freelance Projects',
        '3-5 years Professional Experience',
        '5+ years Industry Veteran / Commercial Productions',
      ],
    },
    {
      id: 'portfolio_link',
      label: 'Showreel / Portfolio / Spotify Link',
      type: 'url',
      placeholder: 'https://open.spotify.com/track/... or YouTube / Vimeo link',
      required: true,
      helpText: 'Share your best work (Spotify, YouTube, Vimeo, Behance, Google Drive)',
    },
    {
      id: 'profile_cv_link',
      label: 'Profile / CV Link',
      type: 'url',
      placeholder: 'https://linkedin.com/in/... or Google Drive PDF',
      required: false,
    },
    {
      id: 'instagram_website',
      label: 'Instagram / Website',
      type: 'text',
      placeholder: '@yourhandle or https://yourwebsite.com',
      required: false,
    },
    {
      id: 'equipment_resources',
      label: 'Equipment / Resources Owned (if any)',
      type: 'textarea',
      placeholder: 'e.g. Sony FX3 / A7SIII, Lenses, Wireless Mics, Logic Pro X Studio, Lighting kits',
      required: false,
    },
    {
      id: 'collaboration_expectations',
      label: 'Collaboration Expectations',
      type: 'textarea',
      placeholder: 'What are you looking to achieve from this project? (Credits, honorarium, networking, creative freedom)',
      required: false,
    },
    {
      id: 'notes_special_reqs',
      label: 'Notes / Special Requirements',
      type: 'textarea',
      placeholder: 'Any dietary needs, travel requirements, or notes for the production team',
      required: false,
    },
  ],
};

export const SEED_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'APP-001',
    formId: 'flick-crew-tracker',
    submittedAt: '2026-10-20T10:15:00.000Z',
    status: 'shortlisted',
    followUpNotes: 'Top priority: Great lyricist & composer. Need to coordinate for vocal recording.',
    data: {
      full_name: 'Rishabh Bothra',
      whatsapp_number: '+91 99887 76655',
      email: 'rishabh.bothra@fliokmedia.com',
      city_location: 'Mumbai',
      department_role: 'Lyricist & Rapper',
      other_skills: 'Producer, Composer, Sound Arrangement',
      availability_dates: 'Fully Available for all dates (24-29 Oct)',
      available_shoot_days: ['Day 1 (24 Oct)', 'Day 2 (25 Oct)', 'Day 3 (26 Oct)', 'Day 4 (27 Oct)'],
      can_attend_preprod: 'Yes (In-person & Online)',
      experience_level: '3-5 years Professional Experience',
      portfolio_link: 'https://open.spotify.com/track/2WcH0fdH0QTvBNUsiRlh4Q',
      instagram_website: '@rishabh_bothra',
      equipment_resources: 'Studio monitors, Neumann condenser mic, Apollo Twin interface, Logic Pro',
      collaboration_expectations: 'Looking to produce memorable title track & feature in the music video',
      notes_special_reqs: 'Ready for table reads from 22nd Oct',
    },
  },
  {
    id: 'APP-002',
    formId: 'flick-crew-tracker',
    submittedAt: '2026-10-20T11:30:00.000Z',
    status: 'under_review',
    followUpNotes: 'Strong cinematography reel. Checking camera kit availability for 25-27 Oct.',
    data: {
      full_name: 'Aakash Sharma',
      whatsapp_number: '+91 98201 12345',
      email: 'aakash.dop@gmail.com',
      city_location: 'Mumbai / Andheri West',
      department_role: 'Cinematographer / DOP',
      other_skills: 'Color grading, Drone operator',
      availability_dates: 'Available on select days only',
      available_shoot_days: ['Day 2 (25 Oct)', 'Day 3 (26 Oct)', 'Day 4 (27 Oct)'],
      can_attend_preprod: 'Online / Virtual only',
      experience_level: '3-5 years Professional Experience',
      portfolio_link: 'https://vimeo.com/76979871',
      instagram_website: '@aakash_dop',
      equipment_resources: 'Sony FX3 Cinema Line, 24-70mm GM II, DJI RS3 Pro Gimbal',
      collaboration_expectations: 'Cinematic indie credits, lighting experiments',
      notes_special_reqs: 'Has personal transport in Mumbai',
    },
  },
  {
    id: 'APP-003',
    formId: 'flick-crew-tracker',
    submittedAt: '2026-10-20T12:00:00.000Z',
    status: 'selected',
    followUpNotes: 'Confirmed for sound recording on Day 1-3. Call sheet sent.',
    data: {
      full_name: 'Priya Sundaram',
      whatsapp_number: '+91 98112 34567',
      email: 'priya.sound@outlook.com',
      city_location: 'Mumbai',
      department_role: 'Sound Recordist / Audio Engineer',
      other_skills: 'Boom operator, Foley artist, Dialogue editing',
      availability_dates: 'Fully Available for all dates (24-29 Oct)',
      available_shoot_days: ['Day 1 (24 Oct)', 'Day 2 (25 Oct)', 'Day 3 (26 Oct)', 'Day 4 (27 Oct)', 'Day 5 (28 Oct)', 'Day 6 (29 Oct)'],
      can_attend_preprod: 'Yes (In-person & Online)',
      experience_level: '5+ years Industry Veteran / Commercial Productions',
      portfolio_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      instagram_website: '@priya_sounds',
      equipment_resources: 'Sound Devices 833, Sennheiser MKH 416 boom mic, 2x Wisycom wireless lav kits',
      collaboration_expectations: 'Clean location audio for festival run',
      notes_special_reqs: 'Vegan meals requested',
    },
  },
];

export async function fetchForms(): Promise<Form[]> {
  try {
    const colRef = collection(db, 'forms');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seed default form
      await saveForm(SEED_FORM);
      // Seed submissions
      for (const sub of SEED_SUBMISSIONS) {
        await saveSubmission(SEED_FORM.id, sub);
      }
      return [SEED_FORM];
    }
    return snapshot.docs.map((doc) => doc.data() as Form);
  } catch (err) {
    console.warn('Firestore fetchForms failed, returning seed fallback:', err);
    return [SEED_FORM];
  }
}

export async function fetchFormByIdOrHash(idOrHash: string): Promise<Form | null> {
  try {
    const formsCol = collection(db, 'forms');

    // 1. Direct doc by ID
    const docRef = doc(db, 'forms', idOrHash);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Form;
    }

    // 2. Query by hash
    const hashQ = query(formsCol, where('hash', '==', idOrHash));
    const hashSnap = await getDocs(hashQ);
    if (!hashSnap.empty) {
      return hashSnap.docs[0].data() as Form;
    }

    // 3. Query by slug
    const slugQ = query(formsCol, where('slug', '==', idOrHash));
    const slugSnap = await getDocs(slugQ);
    if (!slugSnap.empty) {
      return slugSnap.docs[0].data() as Form;
    }

    // If identifier matches seed form
    if (['flk2026', 'flick-crew-tracker', 'flick-media-crew'].includes(idOrHash)) {
      await saveForm(SEED_FORM);
      return SEED_FORM;
    }

    return null;
  } catch (err) {
    console.warn('Firestore fetchFormByIdOrHash error:', err);
    if (['flk2026', 'flick-crew-tracker', 'flick-media-crew'].includes(idOrHash)) {
      return SEED_FORM;
    }
    return null;
  }
}

export async function saveForm(form: Form): Promise<Form> {
  const formToSave = {
    ...form,
    updatedAt: new Date().toISOString(),
    createdAt: form.createdAt || new Date().toISOString(),
    hash: form.hash || generateFormHash(),
  };
  await setDoc(doc(db, 'forms', formToSave.id), formToSave);
  return formToSave;
}

export async function removeForm(formId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'forms', formId));
    return true;
  } catch (err) {
    console.error('Failed to delete form from Firestore:', err);
    return false;
  }
}

export async function fetchSubmissions(formId: string): Promise<FormSubmission[]> {
  try {
    const subCol = collection(db, 'forms', formId, 'submissions');
    const snap = await getDocs(subCol);
    if (snap.empty) {
      if (formId === SEED_FORM.id || formId === 'flk2026') {
        return SEED_SUBMISSIONS;
      }
      return [];
    }
    return snap.docs.map((d) => d.data() as FormSubmission);
  } catch (err) {
    console.warn('fetchSubmissions error, using fallback:', err);
    if (formId === SEED_FORM.id || formId === 'flk2026') {
      return SEED_SUBMISSIONS;
    }
    return [];
  }
}

export async function saveSubmission(
  formId: string,
  sub: Partial<FormSubmission>
): Promise<FormSubmission> {
  const subId = sub.id || `APP-${Date.now().toString(36).toUpperCase()}`;
  const submissionData: FormSubmission = {
    id: subId,
    formId,
    submittedAt: sub.submittedAt || new Date().toISOString(),
    status: (sub.status as ApplicationStatus) || 'applied',
    followUpNotes: sub.followUpNotes || '',
    data: sub.data || {},
  };

  const docRef = doc(db, 'forms', formId, 'submissions', subId);
  await setDoc(docRef, submissionData);
  return submissionData;
}

export async function updateSubmission(
  formId: string,
  subId: string,
  updates: Partial<FormSubmission>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'forms', formId, 'submissions', subId);
    await updateDoc(docRef, updates);
    return true;
  } catch (err) {
    console.error('Failed to update submission:', err);
    return false;
  }
}

export async function removeSubmission(formId: string, subId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'forms', formId, 'submissions', subId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to remove submission:', err);
    return false;
  }
}
