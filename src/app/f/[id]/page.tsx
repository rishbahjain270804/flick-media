import PublicFormClient from './PublicFormClient';

export function generateStaticParams() {
  return [
    { id: 'flk2026' },
    { id: 'flick-crew-tracker' },
    { id: 'flick-media-crew' },
  ];
}

export default function FormPage({ params }: { params: { id: string } }) {
  return <PublicFormClient formIdentifier={params.id} />;
}
