import { NextResponse } from 'next/server';
import { getForm, upsertForm, deleteForm, getSubmissions } from '@/lib/storage';

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
    return NextResponse.json({ success: true, form, totalSubmissions: submissions.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = getForm(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = upsertForm({
      ...existing,
      ...body,
      id: existing.id, // keep stable ID
    });
    return NextResponse.json({ success: true, form: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteForm(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
}
