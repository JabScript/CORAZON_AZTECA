import './admin-theme.css';
import AdminNav from './AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="adminModulo">
      <AdminNav />
      {children}
    </div>
  );
}
