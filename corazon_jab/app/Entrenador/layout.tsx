import './entrenador-theme.css';
import EntrenadorNav from './EntrenadorNav';

export default function EntrenadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="entrenadorModulo">
      <EntrenadorNav />
      {children}
    </div>
  );
}
