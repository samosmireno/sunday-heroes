import { Trophy, Users, BarChart3, Vote } from "lucide-react";
import FeatureCard from "./feature-card";

const features = [
  {
    icon: Trophy,
    title: "Create Any Competition",
    description:
      "Set up leagues, tournaments, or head-to-head duels with custom rules and formats.",
  },
  {
    icon: Users,
    title: "Invite Your Squad",
    description:
      "Easy friend invitations, team management, and player tracking all in one place.",
  },
  {
    icon: BarChart3,
    title: "Track Everything",
    description:
      "Automatic standings, detailed stats, match history, and performance analytics.",
  },
  {
    icon: Vote,
    title: "Social Voting",
    description:
      "Cast your vote for the standout players in each match using an easy-to-use voting system.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-12 text-center font-oswald text-3xl font-bold uppercase tracking-wider text-accent sm:text-4xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Everything You Need for Football Competitions
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
