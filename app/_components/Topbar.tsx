'use client';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/companies': 'Security Companies',
  '/dashboard/drivers': 'Drivers',
  '/dashboard/clients': 'Clients',
  '/dashboard/orders': 'All Orders',
  '/dashboard/danger-zones': 'Danger Zones',
};

export default function Topbar() {
  const pathname = usePathname();
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = TITLES[base] ?? 'Admin';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Salema Enterprise</span>
        <div className="topbar-avatar">A</div>
      </div>
    </header>
  );
}
