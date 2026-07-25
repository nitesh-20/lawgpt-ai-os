import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Briefcase, Search, HardDrive, FileEdit, Users, Shield, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

interface PlanFeature {
  name: string;
  basic: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
  icon: React.ReactNode;
}

const PricingModal = ({ isOpen, onClose, feature }: PricingModalProps) => {
  const { toast } = useToast();
  
  const features: PlanFeature[] = [
    {
      name: "Case Tracking & Reminders",
      basic: true,
      pro: true,
      premium: true,
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "AI Legal Research",
      basic: "Limited",
      pro: "50 Searches",
      premium: "Unlimited",
      icon: <Search className="w-5 h-5" />,
    },
    {
      name: "Document Storage",
      basic: "10GB",
      pro: "100GB",
      premium: "Unlimited + Blockchain",
      icon: <HardDrive className="w-5 h-5" />,
    },
    {
      name: "AI Document Drafting",
      basic: false,
      pro: "20 Docs",
      premium: "Unlimited",
      icon: <FileEdit className="w-5 h-5" />,
    },
    {
      name: "Multi-User Access",
      basic: false,
      pro: "10 Users",
      premium: "Unlimited",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Compliance Checker",
      basic: false,
      pro: "Basic",
      premium: "AI-Powered",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      name: "Chatbot for Client Queries",
      basic: false,
      pro: false,
      premium: true,
      icon: <Bot className="w-5 h-5" />,
    },
  ];

  const handlePlanSelection = (plan: string) => {
    // For testing period, reset limits when selecting any plan
    if (plan === 'basic') {
      localStorage.setItem('searchCount', '0');
      localStorage.setItem('storageUsed', '0');
      localStorage.setItem('storedFiles', '[]');
    } else if (plan === 'pro') {
      localStorage.setItem('searchCount', '0');
      localStorage.setItem('storageUsed', '0');
      localStorage.setItem('storedFiles', '[]');
    } else if (plan === 'premium') {
      localStorage.setItem('searchCount', '0');
      localStorage.setItem('storageUsed', '0');
      localStorage.setItem('storedFiles', '[]');
    }

    toast({
      title: "Plan Selected",
      description: `You've selected the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Limits have been reset for testing.`,
    });
    
    onClose();
  };

  const renderValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            {feature ? `Upgrade to Access ${feature}` : "Choose Your Plan"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4 p-4">
          {/* Features Column */}
          <div className="font-medium">
            <div className="h-20 flex items-end pb-4">Feature</div>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 py-4 border-t"
              >
                {feature.icon}
                {feature.name}
              </div>
            ))}
          </div>

          {/* Basic Plan */}
          <div className="text-center border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="h-20">
              <h3 className="text-xl font-bold">Basic</h3>
              <p className="text-2xl font-bold mt-2">₹2999</p>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="py-4 border-t flex justify-center">
                {renderValue(feature.basic)}
              </div>
            ))}
            <Button 
              className="mt-4 w-full"
              onClick={() => handlePlanSelection('basic')}
            >
              Choose Basic
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="text-center bg-primary/5 border-2 border-primary rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="h-20">
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-2xl font-bold mt-2">₹5999</p>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="py-4 border-t flex justify-center">
                {renderValue(feature.pro)}
              </div>
            ))}
            <Button 
              className="mt-4 w-full" 
              variant="default"
              onClick={() => handlePlanSelection('pro')}
            >
              Choose Pro
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="text-center border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="h-20">
              <h3 className="text-xl font-bold">Premium</h3>
              <p className="text-2xl font-bold mt-2">₹9999</p>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="py-4 border-t flex justify-center">
                {renderValue(feature.premium)}
              </div>
            ))}
            <Button 
              className="mt-4 w-full"
              onClick={() => handlePlanSelection('premium')}
            >
              Choose Premium
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;