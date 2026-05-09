'use client';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--muted)' }}>
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  return <MapClient />;
}
