import { NextResponse } from 'next/server';
import { updateSubmissionStatus, deleteSubmission } from '@/lib/storage';
import { ApplicationStatus } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const status: ApplicationStatus = body.status;
    const notes: string | undefined = body.followUpNotes;

    const updated = updateSubmissionStatus(params.id, status, notes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteSubmission(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete submission' }, { status: 500 });
  }
}
