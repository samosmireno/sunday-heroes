interface LoadingProps {
  text: string;
}

export default function Loading({ text }: LoadingProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      <p className="text-accent" aria-live="polite">
        {text}
      </p>
    </div>
  );
}
