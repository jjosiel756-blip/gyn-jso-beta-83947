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
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    const fullMessage = motivationalMessages[currentMessageIndex];
    let currentIndex = 0;
    setIsTyping(true);
    setDisplayedMessage("");
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setDisplayedMessage(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // Velocidade de digitação (50ms por caractere)
    
    const changeMessageTimeout = setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 60000); // Muda a mensagem a cada 60 segundos
    
    return () => {
      clearInterval(typingInterval);
      clearTimeout(changeMessageTimeout);
    };
  }, [currentMessageIndex]);
  
  return displayedMessage;
};
