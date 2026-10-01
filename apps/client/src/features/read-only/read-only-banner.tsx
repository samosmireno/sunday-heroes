import { useReadOnly } from "./use-read-only";

/**
 * Shown on every screen of the frozen copy. One line from `md` up, the width
 * where the sidebar appears, so `AppSidebar` can start below it at `top-10`.
 */
export function ReadOnlyBanner() {
  const readOnly = useReadOnly();
  if (!readOnly) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-20 flex min-h-10 items-center justify-center border-b-2 border-accent/60 bg-panel-bg px-4 py-2 text-center font-retro text-sm text-gray-200 md:h-10 md:py-0"
    >
      <p>
        Sunday Heroes has moved to{" "}
        <a
          href="https://sunday-heroes.app"
          className="font-bold text-accent underline-offset-4 hover:underline"
        >
          sunday-heroes.app
        </a>
        . This copy is read-only.
      </p>
    </div>
  );
}
