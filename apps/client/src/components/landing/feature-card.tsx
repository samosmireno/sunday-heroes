import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-lg border-2 border-accent/60 bg-panel-bg p-6 shadow-lg">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
        <Icon className="h-10 w-10 text-accent" />
      </div>
      <h3 className="mb-3 font-bold text-accent">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
