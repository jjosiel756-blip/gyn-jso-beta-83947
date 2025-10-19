import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const NutriAI = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: string; text: string; timestamp: Date}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [profileName, setProfileName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [conversationStage, setConversationStage] = useState<'start' | 'main'>('start');
  const recognitionRef = useRef<any>(null);
  const conversationContext = useRef({
    lastTopic: '',
    userGoals: '',
    dietaryPreferences: '',
    userGender: 'male' // Default
  });

  // ✅ BUSCAR NOME DO PERFIL DO USUÁRIO
  useEffect(() => {
    const fetchProfileName = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();
      
      if (data?.name) {
        setProfileName(data.name);
      }
    };
    
    fetchProfileName();
  }, [user]);

  // ✅ EXTRAIR PRIMEIRO NOME DO PERFIL
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'Amigo';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(profileName);

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

  // ✅ EXTRAIR NOME DA FALA DO USUÁRIO
  const extractName = (userText: string): string | null => {
    const text = userText.toLowerCase().trim();
    
    // Remover saudações e palavras comuns
    const cleanText = text
      .replace(/meu nome é|eu sou|me chamo|sou o|sou a/gi, '')
      .replace(/oi|olá|ola|hey/gi, '')
      .trim();
    
    // Pegar primeira palavra como nome
    const words = cleanText.split(' ');
    return words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : null;
  };

  // ✅ ATIVAÇÃO COM SAUDAÇÃO PERSONALIZADA E HUMOR
  const activateNutriAI = async () => {
    setIsActive(true);
    setConversationStage('start');
    
    let welcomeText = '';
    if (firstName && firstName !== 'Amigo') {
      welcomeText = `Oi, eu sou seu NutriAI me chamo ${firstName}, e vamos focar na sua alimentação e nutrição. Aliás, como você se chama?`;
    } else {
      welcomeText = `Oi, eu sou seu NutriAI! Vamos focar na sua alimentação e nutrição. Primeiro, como você se chama?`;
    }
    
    setConversation([{
      type: 'ai', 
      text: welcomeText,
      timestamp: new Date()
    }]);
    
    await speakText(welcomeText);
    
    // ✅ INICIAR OUVIR PARA O NOME DO USUÁRIO
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

  // ✅ GERAR RESPOSTAS NUTRICIONAIS COM HUMOR
  const generateNutritionResponse = (userMessage: string, speakerName: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses: Record<string, string> = {
      'ensopado': `${speakerName}, ensopado de carne é minha paixão! Dica: use carne magra e muitos legumes. Quer a receita completa?`,
      'carne': `${speakerName}, ensopado de carne é minha paixão! Dica: use carne magra e muitos legumes. Quer a receita completa?`,
      'emagrecer': `Haha ${speakerName}, quer emagrecer? Vamos fazer isso com saúde! Corta os industrializados e foca nos alimentos naturais. Topa?`,
      'perder peso': `Haha ${speakerName}, quer emagrecer? Vamos fazer isso com saúde! Corta os industrializados e foca nos alimentos naturais. Topa?`,
      'proteína': `Proteína ${speakerName}? É o que há! Frango, ovos, whey... quer saber quanto você precisa por dia?`,
      'musculação': `Proteína ${speakerName}? É o que há! Frango, ovos, whey... quer saber quanto você precisa por dia?`,
      'frango': `Frango ${speakerName}? Clássico dos marombas! Grelhado é a melhor opção. Posso dar umas dicas de tempero?`,
      'água': `${speakerName}, água é vida! Bebe uns 2 litros por dia que seu corpo agradece. Trust me!`,
      'salada': `Salada ${speakerName}? Amo! Mistura cores e texturas para ficar top. Tem alguma folha favorita?`,
      'obrigado': `De nada ${speakerName}! Tamo junto nessa jornada nutricional!`,
      'obrigada': `De nada ${speakerName}! Tamo junto nessa jornada nutricional!`
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return `Interessante ${speakerName}! Sobre nutrição, posso te ajudar com receitas, cálculos ou dicas. O que te interessa?`;
  };

  const handleUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage = { 
      type: 'user', 
      text: userText, 
      timestamp: new Date() 
    };
    setConversation(prev => [...prev, userMessage]);

    let aiResponse = '';

    // ✅ FASE 1: CAPTURAR NOME DO USUÁRIO
    if (conversationStage === 'start') {
      const detectedName = extractName(userText);
      if (detectedName) {
        setUserName(detectedName);
        setConversationStage('main');
        
        // ✅ RESPOSTA COM HUMOR SE FOR O MESMO NOME
        if (firstName && firstName !== 'Amigo' && firstName.toLowerCase() === detectedName.toLowerCase()) {
          aiResponse = `Ah meu chará! Também me chamo ${detectedName}! Que coincidência fantástica! Então ${detectedName}, vamos ao que importa? O que você deseja saber sobre nutrição?`;
        } else {
          aiResponse = `Prazer, ${detectedName}! Que nome bonito! Então vamos ao que importa? O que você deseja saber sobre alimentação e nutrição?`;
        }
      } else {
        aiResponse = `Desculpe, não entendi seu nome. Pode repetir? Como você se chama?`;
      }
    }
    // ✅ FASE 2: CONVERSA PRINCIPAL
    else {
      aiResponse = generateNutritionResponse(userText, userName || 'amigo');
    }
    
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
