import './usuario-theme.css';
import UsuarioNav from './UsuarioNav';

export default function UsuarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="usuarioModulo usuarioLayout">
      <UsuarioNav />
      <div className="usuarioContenido">
        {children}
      </div>
    </div>
  );
}
