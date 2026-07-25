// app/components/CTA/CTA.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./CTA.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export default function CTA() {
  return (
    <section className={`${styles.section} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <Image
            src="/ring-cta.jpg"
            alt="Ring de boxeo iluminado"
            width={1100}
            height={600}
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <p className={styles.subtitle}>El ring te espera.</p>
          <h2 className={styles.title}>
            Entrena con disciplina.{" "}
            <span className={styles.titleAccent}>Pelea con el corazón.</span>
          </h2>
          <Link href="/registro" className={styles.btn}>
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
