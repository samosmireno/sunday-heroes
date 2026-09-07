/** PROTOTYPE — throwaway. Chrome around each surface, not part of the design being judged. */
import { ReactNode } from "react";

export function SurfacePanel({
  index,
  surface,
  eyes,
  children,
}: {
  index: number;
  surface: string;
  eyes: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed border-gray-500/40 pb-1">
        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-800">
          Surface {index}
        </span>
        <span className="text-sm font-bold uppercase tracking-wider text-gray-300">
          {surface}
        </span>
        <span className="text-xs italic text-gray-400">{eyes}</span>
      </div>
      {children}
    </section>
  );
}

/** The frame the real pages put their content in. */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-lg border-2 border-accent/70 bg-panel-bg p-5 shadow-lg">
      {children}
    </div>
  );
}
