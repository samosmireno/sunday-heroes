// PROTOTYPE — throwaway. Floating variant switcher; never renders in production.
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PrototypeVariant {
  key: string;
  name: string;
}

interface PrototypeSwitcherProps {
  variants: PrototypeVariant[];
  current: string;
  extra?: string;
}

export const PROTOTYPE_ENABLED = !import.meta.env.PROD;

export function usePrototypeVariant(variants: PrototypeVariant[]) {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("variant") ?? variants[0].key;
  return variants.find((v) => v.key === key) ?? variants[0];
}

export default function PrototypeSwitcher({ variants, current, extra }: PrototypeSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const index = Math.max(0, variants.findIndex((v) => v.key === current));

  const go = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length];
    const params = new URLSearchParams(searchParams);
    params.set("variant", next.key);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!PROTOTYPE_ENABLED) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-fuchsia-400 bg-fuchsia-950/95 px-2 py-1.5 font-sans text-sm text-fuchsia-100 shadow-2xl backdrop-blur">
      <button type="button" onClick={() => go(-1)} className="rounded-full p-1 hover:bg-fuchsia-800" aria-label="Previous variant">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-1 font-semibold tracking-wide">
        PROTOTYPE · {variants[index].key} — {variants[index].name}
        {extra && <span className="ml-2 font-normal text-fuchsia-300">{extra}</span>}
      </span>
      <button type="button" onClick={() => go(1)} className="rounded-full p-1 hover:bg-fuchsia-800" aria-label="Next variant">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
