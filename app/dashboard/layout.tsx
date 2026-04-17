import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '../_components/Sidebar';
import Topbar from '../_components/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token) redirect('/login');

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}
