import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

const NutriAI = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: string; text: string; timestamp: Date}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const conversationContext = useRef({
    lastTopic: '',
    userGoals: '',
    dietaryPreferences: '',
    userGender: 'male' // Default
  });

  // ✅ EXTRAIR PRIMEIRO NOME
  const getFirstName = (nameOrEmail: string | undefined) => {
    if (!nameOrEmail) return 'Amigo';
    
    // Se contém @, é um email - extrair a parte antes do @
    if (nameOrEmail.includes('@')) {
      const emailPrefix = nameOrEmail.split('@')[0];
      // Capitalizar primeira letra
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
    }
    
    // Se é um nome, pegar só o primeiro nome
    return nameOrEmail.split(' ')[0];
  };

  const firstName = getFirstName(user?.user_metadata?.name || user?.email);

  // ✅ CONFIGURAÇÃO DE VOZ POR GÊNERO
  const getVoiceSettings = () => {
    const isMale = conversationContext.current.userGender === 'male';
    
    return {
      rate: isMale ? 0.95 : 1.05,       // Homem mais grave, mulher mais agudo
      pitch: isMale ? 0.9 : 1.2,        // Tom masculino mais baixo
      volume: 1.0
    };
  };

  // ✅ CONFIGURAÇÃO AVANÇADA DE VOZ
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true; // ✅ CONVERSA CONTÍNUA
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Microfone ativo - ouvindo continuamente');
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('🔇 Microfone pausado');
        setIsListening(false);
        // ✅ RECONECTAR AUTOMATICAMENTE
        if (isActive && !isSpeaking) {
          setTimeout(() => {
            if (recognitionRef.current && isActive) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Reconhecimento já ativo');
              }
            }
          }, 500);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          console.log('👤 Usuário disse:', finalTranscript);
          handleUserMessage(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('❌ Erro no microfone:', event.error);
        if (event.error === 'not-allowed') {
          alert('Permissão de microfone negada. Ative o microfone para conversar com o NutriAI.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isActive, isSpeaking]);

  // ✅ FALA PERSONALIZADA POR GÊNERO
  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // ✅ CONFIGURAÇÃO DE VOZ POR GÊNERO
      const voiceSettings = getVoiceSettings();
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onstart = () => {
        console.log('🔊 NutriAI falando...');
        setIsSpeaking(true);
        // ✅ PAUSAR OUVIR ENQUANTO FALA
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      utterance.onend = () => {
        console.log('🔇 NutriAI terminou de falar');
        setIsSpeaking(false);
        // ✅ VOLTAR A OUVIR APÓS FALAR
        if (isActive && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Reconhecimento já ativo');
            }
          }, 800);
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Erro na fala:', event);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // ✅ ATIVAÇÃO COM SAUDAÇÃO PERSONALIZADA
  const activateNutriAI = async () => {
    setIsActive(true);
    
    // ✅ SAUDAÇÃO EXATA SOLICITADA
    const welcomeText = `Oi, eu sou seu NutriAI me chamo ${firstName}, e vamos focar na sua alimentação e nutrição. No que posso te ajudar hoje?`;
    
    setConversation([{
      type: 'ai', 
      text: welcomeText,
      timestamp: new Date()
    }]);
    
    await speakText(welcomeText);
    
    // ✅ INICIAR OUVIR AUTOMATICAMENTE APÓS SAUDAÇÃO
    if (recognitionRef.current) {
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Reconhecimento já ativo');
        }
      }, 1000);
    }
  };

  // ✅ DESATIVAR CORRETAMENTE
  const deactivateNutriAI = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setConversation([]);
  };

  // ✅ IA CONVERSACIONAL MELHORADA
  const generateHumanResponse = (userMessage: string, context: any) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detectar gênero do usuário pelo nome (simplificado)
    const maleNames = ['carlos', 'joão', 'pedro', 'marcos', 'lucas', 'josiel'];
    const femaleNames = ['ana', 'maria', 'julia', 'carla', 'patricia', 'fernanda'];
    
    if (!context.userGender && firstName) {
      const isMaleName = maleNames.includes(firstName.toLowerCase());
      const isFemaleName = femaleNames.includes(firstName.toLowerCase());
      
      if (isMaleName) context.userGender = 'male';
      else if (isFemaleName) context.userGender = 'female';
    }

    // Respostas contextuais melhoradas
    if (lowerMessage.includes('ensopado') || lowerMessage.includes('carne') || lowerMessage.includes('receita')) {
      context.lastTopic = 'receitas';
      return `Perfeito ${firstName}! Ensopado de carne é uma ótima opção. Para deixar mais saudável, use carne magra e muitos legumes. Quer que eu detalhe os ingredientes e o preparo?`;
    }

    if (lowerMessage.includes('emagrecer') || lowerMessage.includes('perder peso')) {
      context.lastTopic = 'emagrecimento';
      return `Entendo ${firstName}! Emagrecer de forma saudável é um ótimo objetivo. Vamos criar um plano que se adapte à sua rotina. Me conta um pouco sobre seus hábitos atuais...`;
    }

    if (lowerMessage.includes('proteína') || lowerMessage.includes('musculação')) {
      context.lastTopic = 'proteínas';
      return `Certo ${firstName}! Proteínas são essenciais para seus músculos. Posso te ajudar a calcular suas necessidades e sugerir as melhores fontes. Tem preferência por proteínas animais ou vegetais?`;
    }

    if (lowerMessage.includes('frango') || lowerMessage.includes('peito de frango')) {
      return `Ótima escolha ${firstName}! O peito de frango é excelente. Rico em proteína e versátil. Como você costuma preparar? Posso dar dicas para variar o sabor!`;
    }

    if (lowerMessage.includes('salada') || lowerMessage.includes('folhas')) {
      return `Adoro saladas ${firstName}! Para deixar mais nutritiva, sugiro misturar cores e texturas. Tem alguma verdura preferida ou que não gosta?`;
    }

    if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada')) {
      return `De nada ${firstName}! Fico feliz em ajudar. Estou aqui sempre que precisar de orientação nutricional!`;
    }

    // Resposta conversacional personalizada
    const conversationalResponses = [
      `Interessante ${firstName}! Sobre isso, posso te orientar de forma prática. O que especificamente gostaria de saber?`,
      `Entendi ${firstName}! Vamos explorar juntos como isso pode melhorar sua alimentação. Tem alguma dúvida em particular?`,
      `Certo ${firstName}! Posso te ajudar a incorporar isso na sua rotina de forma equilibrada. Me conta mais...`,
      `Perfeito ${firstName}! Esse é um ótimo ponto de partida. Como posso te auxiliar com isso?`
    ];

    return conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)];
  };

  const handleUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage = { 
      type: 'user', 
      text: userText, 
      timestamp: new Date() 
    };
    setConversation(prev => [...prev, userMessage]);

    // ✅ RESPOSTA INTELIGENTE
    const aiResponse = generateHumanResponse(userText, conversationContext.current);
    
    const aiMessage = { 
      type: 'ai', 
      text: aiResponse, 
      timestamp: new Date() 
    };
    setConversation(prev => [...prev, aiMessage]);
    
    await speakText(aiResponse);
  };

  return (
    <div className="nutri-ai-container">
      {!isActive && (
        <button 
          onClick={activateNutriAI}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
        >
          <span className="flex items-center gap-2 text-lg font-semibold">
            🧠 NutriAI
          </span>
        </button>
      )}

      {isActive && (
        <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 z-50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">NutriAI - {firstName}</h3>
                <p className="text-sm opacity-90">
                  {conversationContext.current.userGender === 'male' ? 'Nutricionista Masculino' : 'Nutricionista Feminina'}
                </p>
              </div>
              <button 
                onClick={deactivateNutriAI}
                className="text-white hover:text-green-200 text-lg bg-green-600 hover:bg-green-700 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="h-80 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {conversation.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-green-200 dark:border-green-700'
                }`}>
                  {msg.text}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {/* ✅ INDICADOR DE STATUS */}
            {(isListening || isSpeaking) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {isListening && '🎤 Ouvindo... Fale agora!'}
                {isSpeaking && '🔊 NutriAI falando...'}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              💡 Conversa fluida ativa - Fale naturalmente
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriAI;
