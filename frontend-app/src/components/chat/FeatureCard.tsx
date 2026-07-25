
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Feature } from "@/types/chat";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const Icon = feature.icon;
  
  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 backdrop-blur-xl border-white/10 transition-all duration-300 hover:scale-105">
      <CardHeader className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-75" />
          <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary relative z-10 transform transition-transform duration-300" />
        </div>
        <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-white via-primary-light to-accent bg-clip-text text-transparent">
          {feature.title}
        </CardTitle>
        <CardDescription className="text-white/70 text-sm md:text-base">
          {feature.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default FeatureCard;
