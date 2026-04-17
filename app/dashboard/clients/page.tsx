'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../_lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/v1/clients')
      .then(data => {
        setClients(data?.clients ?? data?.data ?? data?.users ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const name = (c.userName ?? c.name ?? '').toLowerCase();
    const email = (c.email ?? '').toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  if (loading) return <div className="loading">Loading clients…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Clients</div>
          <div className="page-sub">{clients.length} registered clients</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-text">No clients found</div></div></td></tr>
              ) : filtered.map((c: any) => {
                const name = c.userName ?? c.name ?? '—';
                return (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}>
                          {name[0]?.toUpperCase() ?? 'C'}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--white)' }}>{name}</div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted-light)' }}>{c.email ?? '—'}</td>
                    <td style={{ color: 'var(--muted-light)' }}>{c.phoneNumber ?? c.profile?.phoneNumber ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={{ color: 'var(--muted-light)' }}>{c.totalOrders ?? '—'}</td>
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
