'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    ],
  },
  {
    section: 'People',
    items: [
      { href: '/dashboard/companies', label: 'Security Companies', icon: '🛡' },
      { href: '/dashboard/drivers', label: 'Drivers', icon: '🚗' },
      { href: '/dashboard/clients', label: 'Clients', icon: '👤' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/dashboard/orders', label: 'All Orders', icon: '📋' },
      { href: '/dashboard/map', label: 'Live Map', icon: '📍' },
      { href: '/dashboard/danger-zones', label: 'Danger Zones', icon: '⚠' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    document.cookie = 'admin_email=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">S</div>
          <div>
            <div className="sidebar-logo-name">Salema</div>
            <div className="sidebar-logo-sub">ADMIN PORTAL</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          onClick={handleLogout}
        >
          <span style={{ fontSize: 15 }}>→</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
