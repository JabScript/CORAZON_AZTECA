// app/Inicio/Inicio.tsx
import Image from "next/image";
import Link from "next/link";
import { Anton, Oswald } from "next/font/google";
import styles from "./Inicio.module.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function Inicio() {
  return (
    <section className={`${styles.hero} ${anton.variable} ${oswald.variable}`}>
      <div className={styles.frame}>
        <div className={styles.decorTop} aria-hidden />

        <div className={styles.content}>
          {/* Columna izquierda: texto + CTA */}
          <div className={styles.left}>
            <h1 className={styles.headline}>
              <span className={styles.gold}>DISCIPLINA.</span>
              <span className={styles.gold}>FUERZA.</span>
              <span className={styles.red}>CORAZÓN.</span>
            </h1>
            <p className={styles.subtext}>
              Más que un deporte,
              <br />
              una forma de vida.
            </p>
            <Link href="/Entrenador" className={styles.cta}>Entrenador</Link>

            <div className={styles.divider} aria-hidden>
              <span className={styles.dividerLineGreen} />
              <span className={styles.dividerDot} />
              <span className={styles.dividerLineRed} />
            </div>
          </div>

          {/* Centro: logo (el que ya diseñaron) */}
          <div className={styles.center}>
            <Image
              src="/corazon-azteca_icon.png"
              alt="Corazón Azteca"
              width={540}
              height={660}
              priority
              className={styles.logo}
            />
          </div>

          {/* Derecha: foto del boxeador */}
          <div className={styles.right}>
            <Image
              src="/boxeador-hero.png"
              alt="Boxeador Corazón Azteca"
              width={700}
              height={900}
              priority
              className={styles.fighterImg}
            />
            <div className={styles.fighterGlow} aria-hidden />
          </div>
        </div>

        <div className={styles.decorBottom} aria-hidden />
      </div>
    </section>
  );
}