'use client';
import { useEffect, useRef, useState } from 'react';

interface Provider {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  psiraGrade?: string;
  isArmed?: boolean;
  vehicleType?: string;
  latitude: number;
  longitude: number;
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProviders = async () => {
    try {
      const token = document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/v1/providers/online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'OK') {
        setProviders(data.providers ?? []);
        setLastUpdated(new Date());
      }
    } catch {}
  };

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      leafletMap.current = L.map(mapRef.current!, {
        center: [-29.0, 25.0], // Center of South Africa
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap.current);
    });

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers whenever providers change
  useEffect(() => {
    if (!leafletMap.current) return;

    import('leaflet').then(L => {
      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      providers.forEach(p => {
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background: #00ff88;
              border: 3px solid #ffffff;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              box-shadow: 0 0 0 3px rgba(0,255,136,0.35), 0 2px 8px rgba(0,0,0,0.4);
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([p.latitude, p.longitude], { icon })
          .addTo(leafletMap.current)
          .bindPopup(`
            <div style="min-width:180px; font-family: sans-serif;">
              <div style="font-weight:800; font-size:14px; margin-bottom:6px;">${p.companyName}</div>
              <div style="font-size:12px; color:#555; margin-bottom:4px;">👤 ${p.contactPerson}</div>
              <div style="font-size:12px; color:#555; margin-bottom:4px;">📞 ${p.phone}</div>
              <hr style="margin: 6px 0; border-color:#eee;"/>
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                ${p.psiraGrade ? `<span style="background:#1a1a2e;color:#00ff88;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">Grade ${p.psiraGrade}</span>` : ''}
                ${p.isArmed ? `<span style="background:#ff4444;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">Armed</span>` : ''}
                ${p.vehicleType ? `<span style="background:#333;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${p.vehicleType}</span>` : ''}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      // Auto-fit to markers if any
      if (providers.length > 0) {
        const group = L.featureGroup(markersRef.current);
        leafletMap.current.fitBounds(group.getBounds().pad(0.3));
      }
    });
  }, [providers]);

  // Initial fetch + poll every 10s
  useEffect(() => {
    fetchProviders();
    const interval = setInterval(fetchProviders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-heading">Live Provider Map</div>
          <div className="page-sub">
            {providers.length} provider{providers.length !== 1 ? 's' : ''} online
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchProviders}>
          ↻ Refresh
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#00ff88', border: '2px solid #fff',
          boxShadow: '0 0 0 2px rgba(0,255,136,0.4)',
        }} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Online provider — click marker to view details</span>
      </div>

      {/* Map */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div ref={mapRef} style={{ height: 560, width: '100%' }} />
      </div>

      {/* Provider list below map */}
      {providers.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <div className="card-title">Online Providers</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Grade</th>
                  <th>Armed</th>
                  <th>Vehicle</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: 'var(--white)' }}>{p.companyName}</td>
                    <td style={{ color: 'var(--muted-light)' }}>{p.contactPerson}</td>
                    <td>{p.psiraGrade ? <span className="badge badge-green">Grade {p.psiraGrade}</span> : '—'}</td>
                    <td>{p.isArmed ? <span className="badge badge-red">Armed</span> : <span className="badge badge-gray">Unarmed</span>}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--muted-light)' }}>{p.vehicleType ?? '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)' }}>
                      {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {providers.length === 0 && (
        <div className="card" style={{ marginTop: 16, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
          <div style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 6 }}>No providers online</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Map will update automatically when providers go online</div>
        </div>
      )}
    </div>
  );
}
