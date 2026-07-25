// app/page.tsx
import Inicio from "./components/Inicio/Inicio";
import Secciones from "./components/Secciones/Secciones";
import Funcionalidades from "./components/Funcionalidades/Funcionalidades";
import CTA from "./components/CTA/CTA";

export default function Home() {
  return (
    <>
      <Inicio />
      <Secciones />
      <Funcionalidades />
      <CTA />
    </>
  );
}
