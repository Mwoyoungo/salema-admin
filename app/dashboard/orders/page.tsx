'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../_lib/api';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-yellow',
  approved: 'badge-blue',
  en_route: 'badge-blue',
  arrived: 'badge-blue',
  'in-progress': 'badge-blue',
  completed: 'badge-green',
  rejected: 'badge-red',
};

const SERVICE_LABEL: Record<string, string> = {
  'vehicle-escort': 'Ride Along',
  'my-ride': 'My Ride',
  'walk-escort': 'Walk Escort',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiFetch('/service-request/v1/')
      .then(data => {
        setOrders(data?.serviceRequests ?? data?.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const dest = (o.destination ?? '').toLowerCase();
    const num = String(o.requestNumber ?? '');
    const matchSearch = dest.includes(search.toLowerCase()) || num.includes(search);
    const matchFilter = filter === 'all' || o.requestStatus === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading">Loading orders…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">All Orders</div>
          <div className="page-sub">{orders.length} total orders</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input placeholder="Search by destination or order #…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['all', 'pending', 'en_route', 'in-progress', 'completed', 'rejected'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.replace('-', ' ').replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Service</th>
                <th>Tier</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No orders found</div></div></td></tr>
              ) : filtered.map((o: any) => {
                const services = (o.requestedServices ?? []).map((s: string) => SERVICE_LABEL[s] ?? s).join(', ');
                return (
                  <tr key={o._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted-light)' }}>
                      #{o.requestNumber ?? o._id?.slice(-6)}
                    </td>
                    <td>{services || '—'}</td>
                    <td>
                      {o.escortTier ? (
                        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{o.escortTier}</span>
                      ) : '—'}
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                        {o.destination ?? '—'}
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[o.requestStatus] ?? 'badge-gray'}`}>{o.requestStatus ?? '—'}</span></td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{o.price ? `R${o.price}` : '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {o.requestedDateTime ? new Date(o.requestedDateTime).toLocaleDateString() : '—'}
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
