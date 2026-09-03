import { ReactNode } from "react";
import { SidebarTrigger } from "./sidebar";

interface HeaderProps {
  title: string;
  hasSidebar: boolean;
  /** Rendered right of the title, or under it on a phone. */
  actions?: ReactNode;
}

export default function Header({ title, hasSidebar, actions }: HeaderProps) {
  return (
    <header className="relative mb-8 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center">
          {hasSidebar && <SidebarTrigger className="mr-3" />}
          <h1
            className="truncate text-xl font-bold uppercase tracking-wider text-accent md:text-2xl lg:text-3xl"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            {title}
          </h1>
        </div>
        {actions && <div className="shrink-0 sm:ml-4">{actions}</div>}
      </div>
    </header>
  );
}
