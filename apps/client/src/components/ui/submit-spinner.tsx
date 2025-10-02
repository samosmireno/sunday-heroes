export default function SubmitSpinner({
  text = "Submitting...",
}: {
  text?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col justify-center rounded-lg border-2 border-accent bg-panel-bg p-4 text-center sm:p-6">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent sm:h-12 sm:w-12"></div>
        <p className="text-base font-bold text-accent sm:text-lg">{text}</p>
      </div>
    </div>
  );
}
