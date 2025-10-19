import { useState, useEffect } from "react";

const motivationalMessages = [
  "Cada repetição te aproxima dos seus objetivos! 💪",
  "A consistência é o segredo do progresso! 🔥", 
  "Seu corpo reflete suas escolhas alimentares! 🥗",
  "Hoje é dia de ser melhor que ontem! 🚀",
  "Sabia que 1kg de músculo queima 3x mais calorias? 🔥",
  "Descanso é tão importante quanto o treino! 💤",
  "Proteína é essencial para reparo muscular! 🥚",
  "Beber água acelera o metabolismo em 30%! 💧",
  "Foco no processo, os resultados virão! 🎯",
  "Musculação fortalece os ossos! 🦴"
];

export const useMotivationalMessage = () => {
  const [message, setMessage] = useState(motivationalMessages[0]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setMessage(motivationalMessages[randomIndex]);
    }, 60000); // 1 minuto
    
    return () => clearInterval(interval);
  }, []);
  
  return message;
};
