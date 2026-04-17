'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../_lib/api';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiFetch('/admin/v1/drivers')
      .then(data => {
        setDrivers(data?.drivers ?? data?.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleVerify = async (id: string, action: 'verify' | 'decline') => {
    await apiFetch(`/admin/v1/drivers/${id}/${action}`, { method: 'POST' });
    setDrivers(prev => prev.map(d =>
      (d._id === id || d.profile?._id === id)
        ? { ...d, verificationStatus: action === 'verify' ? 'verified' : 'declined', profile: { ...d.profile, verificationStatus: action === 'verify' ? 'verified' : 'declined' } }
        : d
    ));
  };

  const filtered = drivers.filter(d => {
    const profile = d.profile ?? d;
    const name = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (d.email ?? '').toLowerCase().includes(search.toLowerCase());
    const status = profile.verificationStatus ?? d.verificationStatus ?? 'unverified';
    const matchFilter = filter === 'all' || status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading">Loading drivers…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Drivers</div>
          <div className="page-sub">{drivers.length} registered drivers</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['all', 'unverified', 'verified', 'declined'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Licence</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🚗</div><div className="empty-state-text">No drivers found</div></div></td></tr>
              ) : filtered.map((d: any) => {
                const profile = d.profile ?? d;
                const status = profile.verificationStatus ?? d.verificationStatus ?? 'unverified';
                const id = profile._id ?? d._id;
                const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || d.userName || '—';
                const vehicle = profile.carMake ? `${profile.carMake} ${profile.carModel ?? ''} (${profile.carYear ?? ''})` : '—';
                return (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
                          {fullName[0]?.toUpperCase() ?? 'D'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--white)' }}>{fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{profile.idNumber ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted-light)' }}>{d.email ?? '—'}</td>
                    <td style={{ color: 'var(--muted-light)' }}>{profile.phoneNumber ?? '—'}</td>
                    <td style={{ color: 'var(--muted-light)', fontSize: 12 }}>{vehicle}</td>
                    <td style={{ color: 'var(--muted-light)', fontFamily: 'monospace', fontSize: 12 }}>{profile.licenceNumber ?? '—'}</td>
                    <td><VerifyBadge status={status} /></td>
                    <td style={{ color: 'var(--muted)' }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {status !== 'verified' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleVerify(id, 'verify')}>Verify</button>
                        )}
                        {status !== 'declined' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleVerify(id, 'decline')}>Decline</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VerifyBadge({ status }: { status: string }) {
  const map: Record<string, string> = { verified: 'badge-green', unverified: 'badge-yellow', declined: 'badge-red' };
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>;
}
