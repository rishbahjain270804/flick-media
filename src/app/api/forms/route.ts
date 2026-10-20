import { NextResponse } from 'next/server';
import { getForms, upsertForm, getSubmissions, generateFormHash } from '@/lib/storage';
import { Form } from '@/types';

export async function GET() {
  try {
    const forms = getForms();
    const submissions = getSubmissions();

    // Attach summary stats to each form
    const formsWithStats = forms.map((form) => {
      const formSubs = submissions.filter((s) => s.formId === form.id);
      return {
        ...form,
        stats: {
          totalSubmissions: formSubs.length,
          applied: formSubs.filter((s) => s.status === 'applied').length,
          underReview: formSubs.filter((s) => s.status === 'under_review').length,
          shortlisted: formSubs.filter((s) => s.status === 'shortlisted').length,
          selected: formSubs.filter((s) => s.status === 'selected').length,
          rejected: formSubs.filter((s) => s.status === 'rejected').length,
          lastSubmission: formSubs[0]?.submittedAt || null,
        },
      };
    });

    return NextResponse.json({ success: true, forms: formsWithStats });
  } catch (error) {
    console.error('Failed to get forms', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Form title is required' }, { status: 400 });
    }

    const id = body.id || `form_${Date.now()}`;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const hash = body.hash || generateFormHash();

    const newForm: Form = {
      id,
      slug,
      hash,
      title: body.title,
      description: body.description || '',
      category: body.category || 'General',
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      fields: body.fields || [],
      themeColor: body.themeColor || '#e11d48',
      submitButtonText: body.submitButtonText || 'Submit',
      successMessage: body.successMessage || 'Thank you for your submission!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = upsertForm(newForm);
    return NextResponse.json({ success: true, form: saved }, { status: 201 });
  } catch (error) {
    console.error('Failed to create form', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
}
