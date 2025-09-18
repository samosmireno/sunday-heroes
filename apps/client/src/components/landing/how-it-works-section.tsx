interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
          {number}
        </div>
      </div>
      <h3 className="mb-3 text-xl font-bold text-accent">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

const steps = [
  {
    title: "Sign In & Create",
    description:
      "Sign in with Google and create your first football competition in minutes.",
  },
  {
    title: "Invite Friends",
    description:
      "Invite your friends, set up teams, and configure your competition rules.",
  },
  {
    title: "Play & Track",
    description:
      "Play your matches, record results, and watch the standings update automatically.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2
          className="mb-12 text-center font-oswald text-3xl font-bold uppercase tracking-wider text-accent sm:text-4xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
