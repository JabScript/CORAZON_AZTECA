// app/components/DashboardLayout/EntrenadorTabs.tsx
// Componente genérico de tabs horizontales, pensado para pasarse como
// `subNav` a DashboardLayout (ver Requirements 3.6). Reutiliza las clases
// .tabs/.tab/.tabActive ya definidas en Entrenador.module.css.
//
// Nota: hoy no hay un caso de uso real de tabs a nivel de layout compartido
// en Entrenador (las tabs existentes viven de forma local en páginas hijas
// como planes/, competencias/ y Alumnos/[id]/, cada una con su propio
// estado). Este componente queda disponible como punto de extensión para
// cuando exista ese caso de uso, sin forzar su conexión en el layout.
import styles from "../../Entrenador/Entrenador.module.css";

export interface TabItem {
  key: string;
  label: string;
}

export interface EntrenadorTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function EntrenadorTabs({ tabs, activeTab, onChange }: EntrenadorTabsProps) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
