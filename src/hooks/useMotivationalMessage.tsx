import { useState, useEffect } from 'react';

interface MotivationalMessage {
  id: number;
  short: string;
  full: string;
  category: string;
}

const motivationalMessages: MotivationalMessage[] = [
  {
    id: 1,
    short: "Cada repetição te aproxima dos seus objetivos! 💪",
    full: "Cada repetição realizada com técnica correta estimula as fibras musculares, promovendo microlesões que, quando recuperadas, resultam em crescimento muscular. A consistência nas repetições é fundamental para o princípio da sobrecarga progressiva.",
    category: "motivação"
  },
  {
    id: 2, 
    short: "1kg de músculo queima 3x mais calorias que gordura! 🔥",
    full: "Estudos mostram que 1kg de massa muscular queima aproximadamente 13 calorias por dia em repouso, enquanto 1kg de gordura queima apenas 4-5 calorias. Isso significa que aumentar sua massa muscular acelera seu metabolismo basal permanentemente.",
    category: "ciência"
  },
  {
    id: 3,
    short: "Descanso é tão importante quanto o treino! 💤",
    full: "Durante o descanso ocorre a síntese proteica muscular. Sem períodos adequados de recuperação (24-48h para cada grupo muscular), o corpo não consegue reparar as microlesões do treino, impedindo o crescimento muscular e aumentando risco de overtraining.",
    category: "recuperação"
  },
  {
    id: 4,
    short: "A consistência é o segredo do progresso! 🔥",
    full: "Resultados duradouros vêm da repetição consistente de bons hábitos. Treinar 3-4x por semana regularmente é mais efetivo que treinar intensamente por 1 mês e parar. O corpo responde à constância, não a esforços esporádicos.",
    category: "motivação"
  },
  {
    id: 5,
    short: "Proteína é essencial para reparo muscular! 🥚",
    full: "Consumir 1.6-2.2g de proteína por kg de peso corporal é ideal para hipertrofia. A proteína fornece os aminoácidos necessários para reparar e construir novo tecido muscular após o treino. Distribua o consumo ao longo do dia para melhor absorção.",
    category: "nutrição"
  },
  {
    id: 6,
    short: "Beber água acelera o metabolismo em 30%! 💧",
    full: "Estudos mostram que beber 500ml de água pode aumentar o metabolismo em até 30% por cerca de 1 hora. A hidratação adequada também melhora o desempenho no treino, a recuperação muscular e a eliminação de toxinas.",
    category: "ciência"
  },
  {
    id: 7,
    short: "Foco no processo, os resultados virão! 🎯",
    full: "Concentre-se em melhorar 1% a cada dia ao invés de obsessão com resultados imediatos. Progressão de carga, técnica aperfeiçoada, alimentação consistente - esses pequenos avanços compostos geram transformações significativas ao longo do tempo.",
    category: "motivação"
  },
  {
    id: 8,
    short: "Musculação fortalece os ossos! 🦴",
    full: "O treino de força com cargas progressivas estimula a formação óssea através de células chamadas osteoblastos. Isso aumenta a densidade mineral óssea, prevenindo osteoporose e reduzindo risco de fraturas, especialmente importante com o envelhecimento.",
    category: "ciência"
  },
  {
    id: 9,
    short: "Carboidratos são combustível para treinos intensos! 🍠",
    full: "Carboidratos são armazenados como glicogênio muscular, a principal fonte de energia para exercícios de alta intensidade. Consumir carboidratos complexos 2-3h antes do treino maximiza performance e evita fadiga precoce.",
    category: "nutrição"
  },
  {
    id: 10,
    short: "Sono adequado aumenta força em até 20%! 😴",
    full: "Durante o sono profundo, o corpo libera hormônio do crescimento (GH) essencial para recuperação muscular. Dormir 7-9h por noite melhora força, velocidade de reação, cognição e reduz cortisol (hormônio catabólico).",
    category: "recuperação"
  },
  {
    id: 11,
    short: "Alongamento previne lesões e melhora desempenho! 🤸",
    full: "Alongamento dinâmico antes do treino prepara músculos e articulações, aumentando amplitude de movimento. Alongamento estático pós-treino reduz tensão muscular, melhora flexibilidade e acelera recuperação.",
    category: "prevenção"
  },
  {
    id: 12,
    short: "Variação de exercícios estimula crescimento! 🔄",
    full: "Mudar ângulos, pegadas e exercícios a cada 6-8 semanas evita adaptação muscular (platô). Diferentes estímulos ativam fibras musculares variadas, promovendo desenvolvimento mais completo e simétrico.",
    category: "treino"
  },
  {
    id: 13,
    short: "Alimentação pós-treino é crucial! 🍗",
    full: "A janela anabólica de 30-60min após o treino é ideal para consumir proteína (20-40g) + carboidratos. Isso repõe glicogênio, reduz cortisol e maximiza síntese proteica quando os músculos estão mais receptivos.",
    category: "nutrição"
  },
  {
    id: 14,
    short: "Treino pesado aumenta testosterona naturalmente! 💉",
    full: "Exercícios compostos (agachamento, levantamento terra, supino) com 80-90% da carga máxima estimulam maior liberação de testosterona e GH comparado a exercícios isolados. Esses hormônios são essenciais para ganho de massa.",
    category: "ciência"
  },
  {
    id: 15,
    short: "Técnica correta > Carga alta! ⚖️",
    full: "Executar movimentos com amplitude completa e controle muscular ativa mais fibras e previne lesões. Ego lifting (carga excessiva com técnica ruim) compromete resultados e aumenta risco de lesões graves.",
    category: "treino"
  },
  {
    id: 16,
    short: "Gorduras saudáveis são essenciais! 🥑",
    full: "Ômega-3 (peixes, castanhas) reduz inflamação pós-treino e melhora recuperação. Gorduras também são necessárias para produção de hormônios anabólicos como testosterona. Consuma 20-30% das calorias de fontes saudáveis.",
    category: "nutrição"
  },
  {
    id: 17,
    short: "Aquecimento adequado melhora performance! 🔥",
    full: "5-10 minutos de aquecimento cardiovascular + séries progressivas de aquecimento aumentam temperatura muscular, fluxo sanguíneo e lubrificação articular, melhorando força e reduzindo lesões em até 50%.",
    category: "prevenção"
  },
  {
    id: 18,
    short: "Exercícios compostos são mais eficientes! 🏋️",
    full: "Movimentos multi-articulares (agachamento, levantamento terra, remada) recrutam múltiplos grupos musculares simultaneamente, gerando maior gasto calórico, resposta hormonal e ganhos de força funcional comparado a isolados.",
    category: "treino"
  },
  {
    id: 19,
    short: "Overtraining prejudica resultados! ⚠️",
    full: "Treinar em excesso sem recuperação adequada aumenta cortisol, suprime sistema imunológico e impede crescimento muscular. Sinais: fadiga crônica, insônia, perda de força. Respeite dias de descanso.",
    category: "recuperação"
  },
  {
    id: 20,
    short: "Mindfulness melhora conexão mente-músculo! 🧠",
    full: "Focar mentalmente no músculo trabalhado durante o exercício aumenta ativação neural em até 20%, resultando em maior recrutamento de fibras e melhores ganhos. Evite distrações durante séries.",
    category: "treino"
  }
];

export const useMotivationalMessage = () => {
  const [currentMessage, setCurrentMessage] = useState<MotivationalMessage>(motivationalMessages[0]);
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set([1]));
  const [showPopup, setShowPopup] = useState(false);

  const getRandomMessage = () => {
    const availableMessages = motivationalMessages.filter(msg => !usedIds.has(msg.id));
    
    if (availableMessages.length === 0) {
      // Reset quando todas as mensagens foram usadas
      setUsedIds(new Set());
      return motivationalMessages[0];
    }
    
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const newMessage = availableMessages[randomIndex];
    
    setUsedIds(prev => new Set([...prev, newMessage.id]));
    return newMessage;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(getRandomMessage());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [usedIds]);

  const handleMessageClick = () => {
    setShowPopup(true);
  };

  return { currentMessage, showPopup, setShowPopup, handleMessageClick };
};
