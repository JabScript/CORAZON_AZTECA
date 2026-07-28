// app/usuario/layout.tsx
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";

const navItems = [
  {
    label: "Dashboard", href: "/Usuario",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: "Historial Deportivo", href: "/Usuario/Historial",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  },
  {
    label: "Entrenamientos", href: "/Usuario/Entrenamientos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 15 12 21 12 21z"/></svg>,
  },
  {
    label: "Mi Progreso", href: "/Usuario/Progreso",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="17 7 21 7 21 11"/></svg>,
  },
  {
    label: "Alimentación", href: "/Usuario/Alimentacion",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v16"/><path d="M4 12h4c2 0 3-1 3-4s-1-4-3-4H4"/><path d="M15 4v16"/><path d="M15 4c0 0 5 0 5 4s-5 4-5 4"/></svg>,
  },
  {
    label: "Modo Campamento", href: "/Usuario/Campamento",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 20h12"/><path d="M12 4v2"/><path d="M8 8l1 1"/><path d="M16 8l-1 1"/><circle cx="12" cy="14" r="4"/><path d="M12 10v4"/><path d="M10 14h4"/></svg>,
  },
  {
    label: "Buscar Contrincante", href: "/Usuario/Contrincante",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  },
  {
    label: "Mis Artículos", href: "/Usuario/mis-articulos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    label: "Editar Perfil", href: "/Usuario/Perfil",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
];

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="usuario" navItems={navItems} sidebarWidthPx={220}>
      {children}
    </DashboardLayout>
  );
}
