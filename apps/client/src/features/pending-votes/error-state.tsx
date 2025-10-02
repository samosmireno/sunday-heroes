interface ErrorStateProps {
  message: string;
  title?: string;
}

export function ErrorState({ message, title = "Error" }: ErrorStateProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg border-2 border-red-500 bg-panel-bg p-6 text-center">
        <h2 className="mb-4 text-xl font-bold text-red-500">{title}</h2>
        <p className="text-gray-200">{message}</p>
      </div>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 text-center">
        <h2 className="mb-4 text-xl font-bold text-accent">
          Competition Not Found
        </h2>
        <p className="text-gray-200">
          The requested competition could not be found.
        </p>
      </div>
    </div>
  );
}
