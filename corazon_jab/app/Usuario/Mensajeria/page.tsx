// app/usuario/mensajeria/page.tsx
"use client";

import { useState } from "react";
import styles from "./Mensajeria.module.css";

const conversations = [
  { id: 1, name: "Coach Ricardo Mendoza", lastMsg: "Mañana sparring a las 6pm, llega 15 min antes.", time: "Hace 2h", unread: 2, avatar: "RM" },
  { id: 2, name: "Coach Diego Ramírez", lastMsg: "Buen trabajo hoy, descansa bien.", time: "Hace 5h", unread: 0, avatar: "DR" },
  { id: 3, name: "Lucía Fernández", lastMsg: "Te envié el plan de cardio para la semana.", time: "Ayer", unread: 1, avatar: "LF" },
  { id: 4, name: "Gimnasio Rompiendo Barreras", lastMsg: "Tu membresía se renueva el 1 de agosto.", time: "Hace 2 días", unread: 0, avatar: "GR" },
];

const messages = [
  { sender: "coach", text: "¿Cómo te sientes después del sparring de ayer?", time: "10:30" },
  { sender: "me", text: "Bien, un poco adolorido en el hombro izquierdo pero nada grave.", time: "10:45" },
  { sender: "coach", text: "Perfecto. Hoy descansa esa zona, mañana hacemos técnica ligera.", time: "10:47" },
  { sender: "coach", text: "Mañana sparring a las 6pm, llega 15 min antes.", time: "14:20" },
];

export default function MensajeriaPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [newMsg, setNewMsg] = useState("");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mensajería</h1>
        <p className={styles.subtitle}>Comunícate con tus entrenadores y gimnasios.</p>
      </div>

      <div className={styles.chatLayout}>
        {/* Lista de conversaciones */}
        <div className={styles.convList}>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`${styles.convItem} ${activeChat === conv.id ? styles.convItemActive : ""}`}
              onClick={() => setActiveChat(conv.id)}
            >
              <span className={styles.avatar}>{conv.avatar}</span>
              <div className={styles.convInfo}>
                <span className={styles.convName}>{conv.name}</span>
                <span className={styles.convLast}>{conv.lastMsg}</span>
              </div>
              <div className={styles.convMeta}>
                <span className={styles.convTime}>{conv.time}</span>
                {conv.unread > 0 && <span className={styles.unread}>{conv.unread}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Chat activo */}
        <div className={styles.chatArea}>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.sender === "me" ? styles.msgMe : styles.msgOther}`}>
                <span className={styles.msgText}>{msg.text}</span>
                <span className={styles.msgTime}>{msg.time}</span>
              </div>
            ))}
          </div>
          <div className={styles.inputBar}>
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className={styles.input}
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
            <button className={styles.sendBtn}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
