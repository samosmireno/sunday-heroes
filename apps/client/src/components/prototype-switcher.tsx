/** PROTOTYPE — throwaway. Floating variant switcher; never rendered in a production build. */
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface PrototypeSwitcherProps {
  variants: string[];
  names: Record<string, string>;
  current: string;
}

export default function PrototypeSwitcher({
  variants,
  names,
  current,
}: PrototypeSwitcherProps) {
  const [, setSearchParams] = useSearchParams();

  const step = (delta: number) => {
    const i = variants.indexOf(current);
    const next = variants[(i + delta + variants.length) % variants.length];
    setSearchParams({ variant: next }, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-2xl ring-2 ring-black/20">
      <button
        onClick={() => step(-1)}
        aria-label="Previous variant"
        className="rounded-full p-1.5 text-gray-700 hover:bg-gray-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[13rem] text-center text-sm font-semibold text-gray-900">
        {current} — {names[current]}
      </span>
      <button
        onClick={() => step(1)}
        aria-label="Next variant"
        className="rounded-full p-1.5 text-gray-700 hover:bg-gray-200"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
