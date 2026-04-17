'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../_lib/api';

export default function DangerZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('500');
  const [severity, setSeverity] = useState('medium');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    apiFetch('/danger-zone/v1/')
      .then(data => {
        setZones(data?.dangerZones ?? data?.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await apiFetch('/danger-zone/v1/', {
        method: 'POST',
        body: JSON.stringify({ name, latitude: parseFloat(lat), longitude: parseFloat(lng), radius: parseInt(radius), severity }),
      });
      if (res.status === 'ERROR') { setError(res.message); return; }
      setName(''); setLat(''); setLng(''); setRadius('500'); setSeverity('medium');
      load();
    } catch { setError('Failed to create danger zone.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/danger-zone/v1/${id}`, { method: 'DELETE' });
    setZones(prev => prev.filter(z => z._id !== id));
  };

  if (loading) return <div className="loading">Loading danger zones…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Danger Zones</div>
          <div className="page-sub">{zones.length} active zones</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Severity</th>
                  <th>Coordinates</th>
                  <th>Radius</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">⚠</div><div className="empty-state-text">No danger zones yet</div></div></td></tr>
                ) : zones.map((z: any) => (
                  <tr key={z._id}>
                    <td style={{ fontWeight: 600, color: 'var(--white)' }}>{z.name ?? '—'}</td>
                    <td><SeverityBadge severity={z.severity} /></td>
                    <td style={{ fontSize: 12, color: 'var(--muted-light)', fontFamily: 'monospace' }}>
                      {z.latitude?.toFixed(4)}, {z.longitude?.toFixed(4)}
                    </td>
                    <td style={{ color: 'var(--muted-light)' }}>{z.radius}m</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(z._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Create Danger Zone</div>
          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Zone Name</label>
              <input className="form-input" placeholder="e.g. CBD Hotspot" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" placeholder="-26.2041" value={lat} onChange={e => setLat(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" placeholder="28.0473" value={lng} onChange={e => setLng(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Radius (meters)</label>
              <input className="form-input" placeholder="500" value={radius} onChange={e => setRadius(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-input" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={creating}>
              {creating ? 'Creating…' : 'Create Zone'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-blue' };
  return <span className={`badge ${map[severity] ?? 'badge-gray'}`}>{severity ?? '—'}</span>;
}
