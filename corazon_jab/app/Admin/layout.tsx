import './admin-theme.css';
import AdminNav from './AdminNav';
import RequireRole from '../components/RequireRole/RequireRole';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole rolPermitido="admin">
      <div className="adminModulo">
        <AdminNav />
        {children}
      </div>
    </RequireRole>
  );
}
