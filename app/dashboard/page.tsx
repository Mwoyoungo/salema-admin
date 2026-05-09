'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../_lib/api';
import Link from 'next/link';

interface Stats {
  companies: number;
  drivers: number;
  clients: number;
  orders: number;
  pendingCompanies: number;
  pendingDrivers: number;
  activeOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      apiFetch('/admin/v1/stats').catch(() => null),
      apiFetch('/service-request/v1/').catch(() => null),
    ]).then(([statsData, ordersData]) => {
      if (statsData && statsData.status !== 'ERROR') setStats(statsData);
      const orders = ordersData?.serviceRequests ?? ordersData?.data ?? [];
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  const statCards = [
    { label: 'Security Companies', value: stats?.companies ?? '—', icon: '🛡', color: 'var(--primary)', bg: 'var(--primary-dim)', link: '/dashboard/companies' },
    { label: 'Drivers', value: stats?.drivers ?? '—', icon: '🚗', color: 'var(--info)', bg: 'var(--info-dim)', link: '/dashboard/drivers' },
    { label: 'Clients', value: stats?.clients ?? '—', icon: '👤', color: 'var(--warning)', bg: 'var(--warning-dim)', link: '/dashboard/clients' },
    { label: 'Total Orders', value: stats?.orders ?? recentOrders.length ?? '—', icon: '📋', color: 'var(--primary)', bg: 'var(--primary-dim)', link: '/dashboard/orders' },
    { label: 'Pending Verifications', value: (stats?.pendingCompanies ?? 0) + (stats?.pendingDrivers ?? 0), icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-dim)', link: '/dashboard/companies' },
    { label: 'Active Trips', value: stats?.activeOrders ?? '—', icon: '🔴', color: 'var(--danger)', bg: 'var(--danger-dim)', link: '/dashboard/orders' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Welcome back 👋</div>
          <div className="page-sub">Here's what's happening on Salema today.</div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <Link href={s.link} key={s.label} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = s.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 20 }}>
                {s.icon}
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Orders</div>
            <div className="card-sub">Latest service requests across all types</div>
          </div>
          <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Service</th>
                <th>Status</th>
                <th>Date</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No orders yet</td></tr>
              ) : recentOrders.map((o: any) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted-light)' }}>#{o.requestNumber ?? o._id?.slice(-6)}</td>
                  <td>{(o.requestedServices ?? []).join(', ') || '—'}</td>
                  <td><StatusBadge status={o.requestStatus} /></td>
                  <td style={{ color: 'var(--muted)' }}>{o.requestedDateTime ? new Date(o.requestedDateTime).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{o.price ? `R${o.price}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    approved: 'badge-blue',
    en_route: 'badge-blue',
    arrived: 'badge-blue',
    'in-progress': 'badge-blue',
    completed: 'badge-green',
    rejected: 'badge-red',
  };
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status ?? '—'}</span>;
}
