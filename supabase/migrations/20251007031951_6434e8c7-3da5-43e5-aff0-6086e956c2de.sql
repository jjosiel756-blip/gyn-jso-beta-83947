-- Tabela para armazenar refeições analisadas
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  image_url TEXT,
  foods JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein NUMERIC NOT NULL DEFAULT 0,
  total_carbs NUMERIC NOT NULL DEFAULT 0,
  total_fat NUMERIC NOT NULL DEFAULT 0,
  is_estimated BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policies para acesso às refeições
CREATE POLICY "Users can view their own meals"
ON public.meals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
ON public.meals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
ON public.meals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
ON public.meals
FOR DELETE
USING (auth.uid() = user_id);

-- Índice para melhorar performance de queries por data
CREATE INDEX idx_meals_user_timestamp ON public.meals(user_id, timestamp DESC);