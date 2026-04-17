'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../_lib/api';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiFetch('/admin/v1/security-companies')
      .then(data => {
        setCompanies(data?.companies ?? data?.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c => {
    const name = (c.profile?.companyName ?? c.companyName ?? '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.profile?.verificationStatus === filter || c.verificationStatus === filter;
    return matchSearch && matchFilter;
  });

  const handleVerify = async (id: string, action: 'verify' | 'decline') => {
    await apiFetch(`/admin/v1/security-companies/${id}/${action}`, { method: 'POST' });
    setCompanies(prev => prev.map(c =>
      (c._id === id || c.profile?._id === id)
        ? { ...c, profile: { ...c.profile, verificationStatus: action === 'verify' ? 'verified' : 'declined' }, verificationStatus: action === 'verify' ? 'verified' : 'declined' }
        : c
    ));
  };

  if (loading) return <div className="loading">Loading companies…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Security Companies</div>
          <div className="page-sub">{companies.length} registered companies</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)} />
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
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🛡</div><div className="empty-state-text">No companies found</div></div></td></tr>
              ) : filtered.map((c: any) => {
                const profile = c.profile ?? c;
                const status = profile.verificationStatus ?? 'unverified';
                const id = profile._id ?? c._id;
                return (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">{(profile.companyName ?? 'C')[0].toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--white)' }}>{profile.companyName ?? '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{profile.registrationNumber ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted-light)' }}>{c.email ?? '—'}</td>
                    <td style={{ color: 'var(--muted-light)' }}>{profile.phoneNumber ?? '—'}</td>
                    <td><VerifyBadge status={status} /></td>
                    <td style={{ color: 'var(--muted)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {status !== 'verified' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleVerify(id, 'verify')}>Verify</button>
                        )}
                        {status !== 'declined' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleVerify(id, 'decline')}>Decline</button>
                        )}
                        <Link href={`/dashboard/companies/${c._id}`} className="btn btn-ghost btn-sm">View</Link>
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
