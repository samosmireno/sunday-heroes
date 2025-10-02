interface StatCardProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-lg border-2 border-accent/60 bg-panel-bg p-6">
      <div className="text-2xl font-bold text-accent">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

const stats = [
  { value: "500+", label: "Competitions Created" },
  { value: "2,000+", label: "Matches Played" },
  { value: "50+", label: "Active Leagues" },
];

export default function SocialProofSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2
          className="mb-8 font-oswald text-3xl font-bold uppercase tracking-wider text-accent sm:text-4xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Join the Community
        </h2>
        <p className="mb-8 text-lg text-gray-300">
          "Finally, a way to keep track of our Sunday league properly! No more
          arguments about who's winning."
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
