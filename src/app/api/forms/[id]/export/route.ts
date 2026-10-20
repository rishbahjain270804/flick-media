import { NextResponse } from 'next/server';
import { getForm, getSubmissions } from '@/lib/storage';

function escapeCsvCell(val: any): string {
  if (val === undefined || val === null) return '""';
  if (Array.isArray(val)) {
    val = val.join(', ');
  }
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

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

    // CSV Headers: App ID, Submitted At, Status, [Form Field Labels...], Follow-up Notes
    const headers = [
      'Application ID',
      'Date Received',
      'Status',
      ...form.fields.map((f) => f.label),
      'Follow-up Notes',
    ];

    const rows = submissions.map((sub) => {
      const fieldValues = form.fields.map((field) => {
        const val = sub.data[field.id];
        return escapeCsvCell(val);
      });

      return [
        escapeCsvCell(sub.id),
        escapeCsvCell(new Date(sub.submittedAt).toLocaleString('en-IN')),
        escapeCsvCell(sub.status.toUpperCase().replace('_', ' ')),
        ...fieldValues,
        escapeCsvCell(sub.followUpNotes || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');

    const filename = `${form.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_submissions.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
