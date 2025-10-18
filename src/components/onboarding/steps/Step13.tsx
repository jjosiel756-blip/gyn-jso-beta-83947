import { Button } from "@/components/ui/button";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step13 = ({ nextStep }: StepProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in text-center">
      <h2 className="text-3xl font-bold">Placeholder Step 13</h2>
      <Button onClick={nextStep} className="w-full">
        Finalizar
      </Button>
    </div>
  );
};

export default Step13;
