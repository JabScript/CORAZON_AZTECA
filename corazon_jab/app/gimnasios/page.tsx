// app/gimnasios/page.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Playfair_Display, Oswald } from "next/font/google";
import { useGeolocation, distanceKm } from "../hooks/useGeolocation";
import styles from "./Gimnasios.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const categories = ["Boxeo amateur", "Boxeo profesional", "Kickboxing", "MMA"];

const gyms = [
  {
    name: "Gimnasio Rompiendo Barreras",
    address: "Av. Insurgentes Sur 1234, CDMX",
    image: "/1.jpg",
    rating: 4.8,
    reviews: 254,
    tags: ["Boxeo amateur", "Boxeo profesional", "Kickboxing"],
    hours: "06:00 – 22:00",
    price: "Desde $100/mes",
    status: "ABIERTO",
    lat: 19.3714,
    lng: -99.1653,
  },
  {
    name: "Nuevo Jordan Gym",
    address: "Calzada de Tlalpan 450, CDMX",
    image: "/2.jpg",
    rating: 4.6,
    reviews: 189,
    tags: ["Boxeo amateur", "MMA", "Acond. físico"],
    hours: "07:00 – 21:00",
    price: "Desde $400/mes",
    status: "ABIERTO",
    lat: 19.3467,
    lng: -99.1345,
  },
  {
    name: "Boxeo de Campeones",
    address: "Av. Revolución 789, CDMX",
    image: "/3.webp",
    rating: 4.9,
    reviews: 112,
    tags: ["Boxeo profesional", "Sparring", "Nutrición"],
    hours: "08:30 – 22:00",
    price: "Desde $600/mes",
    status: "CERRADO",
    lat: 19.4034,
    lng: -99.1715,
  },
];

export default function GimnasiosPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { coords, loading, error, requestLocation } = useGeolocation();

  const gymsWithDistance = useMemo(() => {
    return gyms.map((gym) => ({
      ...gym,
      distance: coords ? distanceKm(coords, { lat: gym.lat, lng: gym.lng }) : null,
    }));
  }, [coords]);

  const filteredGyms = gymsWithDistance
    .filter((gym) => {
      const matchesSearch = gym.name.toLowerCase().includes(search.toLowerCase()) ||
        gym.address.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || gym.tags.includes(activeCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
    });

  const mapSrc = coords
    ? `https://www.google.com/maps?q=gimnasios+de+box+cerca+de+${coords.lat},${coords.lng}&output=embed`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60219.93938487009!2d-99.18!3d19.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f93a1ea6f7e7%3A0x466b39e5c4b4db0!2sCiudad%20de%20M%C3%A9xico!5e0!3m2!1ses-419!2smx!4v1";

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.tag}>ENCUENTRA TU LUGAR</span>
        <h1 className={styles.title}>Gimnasios</h1>
      </div>

      {/* Ubicación */}
      <div className={styles.locationBar}>
        {!coords && !loading && (
          <button className={styles.locationBtn} onClick={requestLocation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
            Usar mi ubicación para ver gimnasios cercanos
          </button>
        )}
        {loading && (
          <span className={styles.locationStatus}>Obteniendo tu ubicación...</span>
        )}
        {coords && (
          <span className={styles.locationStatusActive}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
            Mostrando gimnasios ordenados por cercanía a tu ubicación
          </span>
        )}
        {error && (
          <span className={styles.locationError}>{error}</span>
        )}
      </div>

      {/* Ubicación */}
      <div className={styles.locationBar}>
        <button
          type="button"
          className={styles.locationBtn}
          onClick={requestLocation}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/>
            <circle cx="12" cy="10" r="2.5"/>
          </svg>
          {loading ? "Buscando tu ubicación…" : coords ? "Ubicación activada" : "Usar mi ubicación"}
        </button>
        {coords && (
          <span className={styles.locationStatus}>Mostrando gimnasios ordenados por cercanía</span>
        )}
        {error && <span className={styles.locationError}>{error}</span>}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por ciudad, nombre o código postal..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de gimnasios */}
      <div className={styles.grid}>
        {filteredGyms.map((gym) => (
          <article key={gym.name} className={styles.card}>
            <div className={styles.cardImage}>
              <Image
                src={gym.image}
                alt={gym.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.cardImg}
              />
              <span
                className={styles.cardStatus}
                data-open={gym.status === "ABIERTO"}
              >
                {gym.status}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <div>
                  <h3 className={styles.cardName}>{gym.name}</h3>
                  <p className={styles.cardAddress}>📍 {gym.address}</p>
                  {gym.distance !== null && (
                    <p className={styles.cardDistance}>{gym.distance.toFixed(1)} km de ti</p>
                  )}
                </div>
                <div className={styles.cardRating}>
                  <span className={styles.ratingStar}>★</span>
                  <span className={styles.ratingValue}>{gym.rating}</span>
                  <span className={styles.ratingCount}>({gym.reviews})</span>
                </div>
              </div>

              <div className={styles.cardTags}>
                {gym.tags.map((tag) => (
                  <span key={tag} className={styles.cardTagPill}>{tag}</span>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardMeta}>🕐 {gym.hours}</span>
                <span className={styles.cardMeta}>{gym.price}</span>
                {gym.distance !== null && (
                  <span className={styles.cardDistance}>{gym.distance.toFixed(1)} km</span>
                )}
                <button type="button" className={styles.cardLink} onClick={() => alert(`Más información de ${gym.name} próximamente.`)}>Ver más →</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Mapa */}
      <div className={styles.mapSection}>
        <iframe
          src={mapSrc}
          className={styles.map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de gimnasios de box cercanos"
          allowFullScreen
        />
      </div>
    </main>
  );
}
