// PROTOTYPE — throwaway. The page Header with a right-hand slot.
import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ProtoHeaderProps {
  title: string;
  hasSidebar: boolean;
  right?: ReactNode;
  subtitle?: ReactNode;
}

export default function ProtoHeader({ title, hasSidebar, right, subtitle }: ProtoHeaderProps) {
  return (
    <header className="relative mb-8 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center">
          {hasSidebar && <SidebarTrigger className="mr-3" />}
          <div className="min-w-0">
            <h1
              className="truncate text-xl font-bold uppercase tracking-wider text-accent md:text-2xl lg:text-3xl"
              style={{ textShadow: "2px 2px 0 #000" }}
            >
              {title}
            </h1>
            {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
          </div>
        </div>
        {right && <div className="shrink-0 sm:ml-4">{right}</div>}
      </div>
    </header>
  );
}
