import ManageClient from './ManageClient';

export function generateStaticParams() {
  return [
    { id: 'flick-crew-tracker' },
    { id: 'flk2026' },
    { id: 'flick-media-crew' },
  ];
}

export default function ManageFormPage({ params }: { params: { id: string } }) {
  return <ManageClient formId={params.id} />;
}
