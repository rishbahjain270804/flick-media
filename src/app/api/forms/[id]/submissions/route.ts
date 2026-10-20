import { NextResponse } from 'next/server';
import { getForm, getSubmissions, createSubmission } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const form = getForm(params.id);
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    const submissions = getSubmissions(form.id);
    return NextResponse.json({ success: true, form, submissions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const form = getForm(params.id);
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = body.data || body;

    // Validate required fields
    const missingFields: string[] = [];
    form.fields.forEach((field) => {
      if (field.required) {
        const val = data[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          missingFields.push(field.label);
        }
      }
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Please fill in required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newSub = createSubmission(form.id, data);
    return NextResponse.json({
      success: true,
      submission: newSub,
      message: form.successMessage || 'Form submitted successfully!',
    });
  } catch (error) {
    console.error('Submission failed', error);
    return NextResponse.json({ success: false, error: 'Failed to submit form' }, { status: 500 });
  }
}
