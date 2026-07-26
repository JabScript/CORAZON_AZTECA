// app/usuario/alimentacion/page.tsx
"use client";

import styles from "./Alimentacion.module.css";

const dailyPlan = [
  { meal: "Desayuno", time: "07:00", foods: "Avena con plátano, 3 claras, café negro", calories: 420, protein: "28g" },
  { meal: "Snack AM", time: "10:00", foods: "Manzana con crema de maní", calories: 220, protein: "7g" },
  { meal: "Comida", time: "13:30", foods: "Pechuga a la plancha, arroz integral, ensalada", calories: 650, protein: "48g" },
  { meal: "Pre-entreno", time: "16:00", foods: "Plátano con miel y avena", calories: 280, protein: "5g" },
  { meal: "Post-entreno", time: "19:00", foods: "Batido de proteína con frutas", calories: 350, protein: "35g" },
  { meal: "Cena", time: "21:00", foods: "Salmón, camote, vegetales al vapor", calories: 580, protein: "42g" },
];

const macros = [
  { label: "Calorías", value: "2,500", target: "2,600", unit: "kcal" },
  { label: "Proteína", value: "165", target: "170", unit: "g" },
  { label: "Carbohidratos", value: "280", target: "300", unit: "g" },
  { label: "Grasas", value: "72", target: "75", unit: "g" },
  { label: "Agua", value: "2.8", target: "3.0", unit: "L" },
];

export default function AlimentacionPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Alimentación</h1>
        <p className={styles.subtitle}>Plan nutricional personalizado para tu rendimiento.</p>
      </div>

      {/* Macros */}
      <div className={styles.macros}>
        {macros.map((m) => (
          <div key={m.label} className={styles.macroCard}>
            <span className={styles.macroLabel}>{m.label}</span>
            <span className={styles.macroValue}>{m.value}<small>{m.unit}</small></span>
            <span className={styles.macroTarget}>Meta: {m.target}{m.unit}</span>
          </div>
        ))}
      </div>

      {/* Plan del día */}
      <h2 className={styles.sectionTitle}>Plan de Hoy</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>COMIDA</th>
              <th>HORA</th>
              <th>ALIMENTOS</th>
              <th>CALORÍAS</th>
              <th>PROTEÍNA</th>
            </tr>
          </thead>
          <tbody>
            {dailyPlan.map((item) => (
              <tr key={item.meal}>
                <td className={styles.mealName}>{item.meal}</td>
                <td>{item.time}</td>
                <td>{item.foods}</td>
                <td className={styles.highlight}>{item.calories}</td>
                <td className={styles.highlight}>{item.protein}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
