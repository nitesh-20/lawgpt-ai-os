
import { Feature } from "@/types/chat";
import FeatureCard from "./FeatureCard";

interface FeaturesProps {
  features: Feature[];
}

const Features = ({ features }: FeaturesProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12 animate-fade-in">
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
};

export default Features;
