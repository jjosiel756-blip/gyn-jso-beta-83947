import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Nutrition = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState("Josiel");

  useEffect(() => {
    const loadUserName = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && 'name' in data) {
          const firstName = (data.name as string).split(' ')[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.log('Profile not found, using default name');
      }
    };

    loadUserName();
  }, [user]);

  const stats = [
    { value: "+15%", label: "Desempenho" },
    { value: "420", label: "Calorias Queimadas" },
    { value: "1.8L", label: "Água Consumida" },
    { value: "+12%", label: "Progresso" }
  ];

  return (
    <Layout>
      <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="text-center p-8 mb-8 shadow-elevated">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Alimentação Pós-Treino
          </h1>
          <p className="text-2xl font-bold mb-4" style={{ color: 'hsl(var(--secondary))' }}>
            Olá, {userName}!
          </p>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Foco no processo, os resultados virão! 😊
          </p>
        </Card>

        {/* Content Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <Card className="p-6 transition-smooth hover:-translate-y-2 hover:shadow-elevated">
            <h2 className="text-xl font-bold mb-4 pb-3 border-b-2 flex items-center gap-2" 
                style={{ borderColor: 'hsl(var(--primary))' }}>
              <span style={{ color: 'hsl(var(--primary))' }}>💪</span>
              <span style={{ color: 'hsl(var(--foreground))' }}>Importância da Nutrição Pós-Treino</span>
            </h2>
            <p className="mb-4 text-muted-foreground">
              A alimentação após o exercício é fundamental para:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-muted-foreground">
              <li>Recuperação muscular</li>
              <li>Reposição de glicogênio</li>
              <li>Redução da fadiga</li>
              <li>Preparação para o próximo treino</li>
            </ul>
            <p className="text-muted-foreground">
              O momento ideal para se alimentar é dentro de 30 a 60 minutos após o treino.
            </p>
          </Card>

          {/* Card 2 - Highlight */}
          <Card className="p-6 gradient-nutrition text-white transition-smooth hover:-translate-y-2 hover:shadow-elevated">
            <h2 className="text-xl font-bold mb-4 pb-3 border-b-2 border-white flex items-center gap-2">
              <span>🍗</span>
              <span>Alimentos Recomendados</span>
            </h2>
            <p className="mb-4 opacity-95">
              Combine proteínas e carboidratos de qualidade:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 opacity-90">
              <li>Proteínas: Frango, peixe, ovos, whey protein</li>
              <li>Carboidratos: Batata-doce, arroz integral, frutas</li>
              <li>Hidratação: Água e bebidas eletrolíticas</li>
            </ul>
            <p className="opacity-95">
              Evite alimentos processados e ricos em gordura saturada.
            </p>
          </Card>

          {/* Card 3 */}
          <Card className="p-6 transition-smooth hover:-translate-y-2 hover:shadow-elevated">
            <h2 className="text-xl font-bold mb-4 pb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: 'hsl(var(--primary))' }}>
              <span style={{ color: 'hsl(var(--primary))' }}>⏱️</span>
              <span style={{ color: 'hsl(var(--foreground))' }}>Timing e Quantidade</span>
            </h2>
            <p className="mb-4 text-muted-foreground">
              O timing e a quantidade variam conforme:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-muted-foreground">
              <li>Intensidade do treino</li>
              <li>Objetivos (ganho muscular, perda de peso)</li>
              <li>Características individuais</li>
            </ul>
            <p className="text-muted-foreground">
              Consulte um nutricionista para um plano personalizado.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center shadow-lg">
              <div className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--primary))' }}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-muted-foreground">
          <p>{userName} Fitness App &copy; 2025 - Foco no processo, os resultados virão!</p>
        </footer>
      </div>
    </Layout>
  );
};

export default Nutrition;
