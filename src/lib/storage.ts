import fs from 'fs';
import path from 'path';
import { Form, FormSubmission, ApplicationStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FORMS_FILE = path.join(DATA_DIR, 'forms.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function generateFormHash(): string {
  // Generates 6-7 char clean alphanumeric hash, e.g. "x8k2m9"
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let hash = '';
  for (let i = 0; i < 6; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Initial Seed Form: Flick Media Indie Artists & Crew
const SEED_FORM: Form = {
  id: 'flick-crew-tracker',
  slug: 'flick-media-crew',
  hash: 'flk2026', // forms.buildwithrex.me/flk2026
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

// Seed sample submissions
const SEED_SUBMISSIONS: FormSubmission[] = [
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
      portfolio_link: 'https://vimeo.com/aakashsharmadop',
      instagram_website: '@aakash_cinematography',
      equipment_resources: 'Sony FX6 with Sony G Master T1.5 prime lens set, Tilta Mirage matte box',
      collaboration_expectations: 'High cinematic quality indie production',
      notes_special_reqs: 'Requires 1 focus puller assistant',
    },
  },
  {
    id: 'APP-003',
    formId: 'flick-crew-tracker',
    submittedAt: '2026-10-20T12:05:00.000Z',
    status: 'applied',
    followUpNotes: 'Just submitted, awaiting review by director.',
    data: {
      full_name: 'Priya Deshmukh',
      whatsapp_number: '+91 97690 98765',
      email: 'priya.styling@outlook.com',
      city_location: 'Pune / Traveling to Mumbai',
      department_role: 'Costume Designer / Wardrobe Stylist',
      other_skills: 'Mood boarding, fabric sourcing, hair styling',
      availability_dates: 'Fully Available for all dates (24-29 Oct)',
      available_shoot_days: ['Day 1 (24 Oct)', 'Day 2 (25 Oct)', 'Day 3 (26 Oct)', 'Day 4 (27 Oct)', 'Day 5 (28 Oct)', 'Day 6 (29 Oct)'],
      can_attend_preprod: 'Yes (In-person & Online)',
      experience_level: '1-2 years Indie / Freelance Projects',
      portfolio_link: 'https://behance.net/priyadeshmukh_style',
      instagram_website: '@styled.by.priya',
      equipment_resources: 'Portable steamer, wardrobe rack, alteration kit',
      collaboration_expectations: 'Creative indie styling portfolio piece',
      notes_special_reqs: '',
    },
  },
  {
    id: 'APP-004',
    formId: 'flick-crew-tracker',
    submittedAt: '2026-10-20T13:45:00.000Z',
    status: 'selected',
    followUpNotes: 'Finalized for production coordination. Sent confirmation email.',
    data: {
      full_name: 'Vikram Mehta',
      whatsapp_number: '+91 99112 33445',
      email: 'vikram.lineprod@gmail.com',
      city_location: 'Mumbai',
      department_role: 'Production Manager / Line Producer',
      other_skills: 'Location scouting, permits, crew budgeting',
      availability_dates: 'Fully Available for all dates (24-29 Oct)',
      available_shoot_days: ['Day 1 (24 Oct)', 'Day 2 (25 Oct)', 'Day 3 (26 Oct)', 'Day 4 (27 Oct)', 'Day 5 (28 Oct)', 'Day 6 (29 Oct)'],
      can_attend_preprod: 'Yes (In-person & Online)',
      experience_level: '5+ years Industry Veteran / Commercial Productions',
      portfolio_link: 'https://linkedin.com/in/vikram-mehta-prod',
      instagram_website: '',
      equipment_resources: 'Production walkie-talkies (x8), emergency kit',
      collaboration_expectations: 'Smooth on-time execution',
      notes_special_reqs: 'Needs final shoot schedule by 22 Oct',
    },
  },
];

// Helper to read forms and ensure hashes exist
export function getForms(): Form[] {
  ensureDataDir();
  if (!fs.existsSync(FORMS_FILE)) {
    fs.writeFileSync(FORMS_FILE, JSON.stringify([SEED_FORM], null, 2), 'utf-8');
    return [SEED_FORM];
  }
  try {
    const data = fs.readFileSync(FORMS_FILE, 'utf-8');
    let forms: Form[] = JSON.parse(data);

    let needsSave = false;
    if (forms.length === 0) {
      forms = [SEED_FORM];
      needsSave = true;
    } else {
      // Ensure all forms have a unique hash
      forms = forms.map((f) => {
        if (!f.hash) {
          f.hash = f.id === 'flick-crew-tracker' ? 'flk2026' : generateFormHash();
          needsSave = true;
        }
        return f;
      });
    }

    if (needsSave) {
      fs.writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2), 'utf-8');
    }

    return forms;
  } catch {
    return [SEED_FORM];
  }
}

export function saveForms(forms: Form[]): void {
  ensureDataDir();
  fs.writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2), 'utf-8');
}

// Get form by hash, slug, or ID
export function getForm(query: string): Form | null {
  if (!query) return null;
  const forms = getForms();
  const qLower = query.toLowerCase().trim();

  return (
    forms.find(
      (f) =>
        (f.hash && f.hash.toLowerCase() === qLower) ||
        (f.slug && f.slug.toLowerCase() === qLower) ||
        (f.id && f.id.toLowerCase() === qLower)
    ) || null
  );
}

export function upsertForm(form: Form): Form {
  const forms = getForms();
  const index = forms.findIndex((f) => f.id === form.id);
  const now = new Date().toISOString();

  // Ensure hash is preserved or generated
  const hash = form.hash || (index >= 0 && forms[index].hash ? forms[index].hash : generateFormHash());

  const updatedForm: Form = {
    ...form,
    hash,
    updatedAt: now,
  };

  if (index >= 0) {
    forms[index] = updatedForm;
  } else {
    forms.unshift({ ...updatedForm, createdAt: now });
  }

  saveForms(forms);
  return index >= 0 ? forms[index] : forms[0];
}

export function deleteForm(id: string): boolean {
  const forms = getForms();
  const filtered = forms.filter((f) => f.id !== id);
  if (filtered.length !== forms.length) {
    saveForms(filtered);
    return true;
  }
  return false;
}

// Submissions helpers
export function getSubmissions(formId?: string): FormSubmission[] {
  ensureDataDir();
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(SEED_SUBMISSIONS, null, 2), 'utf-8');
    return formId ? SEED_SUBMISSIONS.filter((s) => s.formId === formId) : SEED_SUBMISSIONS;
  }
  try {
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const subs: FormSubmission[] = JSON.parse(data);
    return formId ? subs.filter((s) => s.formId === formId) : subs;
  } catch {
    return [];
  }
}

export function saveSubmissions(submissions: FormSubmission[]): void {
  ensureDataDir();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}

export function createSubmission(formId: string, data: Record<string, any>): FormSubmission {
  const all = getSubmissions();
  const count = all.filter((s) => s.formId === formId).length + 1;
  const newSubmission: FormSubmission = {
    id: `APP-${String(count).padStart(3, '0')}`,
    formId,
    submittedAt: new Date().toISOString(),
    status: 'applied',
    followUpNotes: '',
    data,
  };
  all.unshift(newSubmission);
  saveSubmissions(all);
  return newSubmission;
}

export function updateSubmissionStatus(
  id: string,
  status: ApplicationStatus,
  followUpNotes?: string
): FormSubmission | null {
  const all = getSubmissions();
  const item = all.find((s) => s.id === id);
  if (!item) return null;
  item.status = status;
  if (followUpNotes !== undefined) {
    item.followUpNotes = followUpNotes;
  }
  saveSubmissions(all);
  return item;
}

export function deleteSubmission(id: string): boolean {
  const all = getSubmissions();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length !== all.length) {
    saveSubmissions(filtered);
    return true;
  }
  return false;
}
