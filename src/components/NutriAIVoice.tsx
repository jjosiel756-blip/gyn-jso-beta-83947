import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';

export function NutriAIVoice() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Clique no mic para falar');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [userName, setUserName] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus('🎤 Ouvindo... Fale agora!');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
          }
        }
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Erro de voz:', event.error);
        setStatus('❌ Erro ao ouvir. Tente novamente.');
      };

      recognition.onend = () => {
        if (isListening) {
          setTimeout(() => recognition.start(), 100);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isListening) {
      recognitionRef.current?.start();
      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('Clique no mic para falar');
    }
  };

  const processVoiceCommand = (text: string) => {
    console.log('Comando de voz:', text);
    setTranscript(`Você: "${text}"`);
    
    const aiResponse = generateAIResponse(text);
    setResponse(`NutriAI: ${aiResponse}`);
    speakResponse(aiResponse);
    
    setTimeout(() => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    }, 3000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (!userName && lowerMsg.length > 2) {
      const newName = userMessage.split(' ')[0];
      setUserName(newName);
      return `Prazer, ${newName}! Sou seu NutriAI por voz! 🎤 Como posso ajudar sua nutrição hoje?`;
    }
    
    if (/(oi|olá|ola|e aí|eai)/.test(lowerMsg)) {
      return `E aí, ${userName || 'amigo'}! No que posso ajudar sua alimentação?`;
    }
    
    if (/(emagrecer|perder peso|secar|dieta)/.test(lowerMsg)) {
      return `Para emagrecer: salmão com aspargos ou salada de grão-de-bico! Ambos aceleram o metabolismo!`;
    }
    
    if (/(massa|muscular|ganhar|forte)/.test(lowerMsg)) {
      return `Para ganhar massa: frango com batata doce e ovos! Proteína máxima!`;
    }
    
    if (/(energia|força|cansado|fadiga)/.test(lowerMsg)) {
      return `Energia? Aveia com banana e whey! Combustível perfeito!`;
    }
    
    return `Entendi! Vamos focar na sua nutrição. Conte mais sobre seus objetivos!`;
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const brazilianVoice = voices.find(voice => 
        voice.lang.includes('pt') && !voice.localService
      );
      
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-background border-2 border-primary rounded-3xl p-4 shadow-lg min-w-[250px] max-w-[350px]">
      <div className="text-center mb-3">
        <div className="font-bold text-primary mb-1">
          🎤 NutriAI por Voz
        </div>
        <div className="text-xs text-muted-foreground min-h-5">
          {status}
        </div>
      </div>
      
      <div className="flex gap-3 items-center mb-3">
        <Button
          onClick={toggleListening}
          size="icon"
          className={`rounded-full w-12 h-12 text-xl transition-all ${
            isListening ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        
        <div className="flex-1 text-sm text-foreground min-h-5">
          {transcript}
        </div>
      </div>

      {response && (
        <div className="mt-3 p-3 bg-muted rounded-xl text-sm min-h-10 border-l-4 border-primary">
          {response}
        </div>
      )}
    </div>
  );
}
