import BuilderClient from './BuilderClient';

export function generateStaticParams() {
  return [
    { id: 'flick-crew-tracker' },
    { id: 'flk2026' },
    { id: 'flick-media-crew' },
  ];
}

export default function EditFormPage({ params }: { params: { id: string } }) {
  return <BuilderClient formId={params.id} />;
}
