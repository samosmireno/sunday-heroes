import { SidebarTrigger } from "./sidebar";

interface HeaderProps {
  title: string;
  hasSidebar: boolean;
}

export default function Header({ title, hasSidebar }: HeaderProps) {
  return (
    <header className="relative mb-8 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
      <div className="flex items-center">
        {hasSidebar && <SidebarTrigger className="mr-3" />}
        <h1
          className="text-xl font-bold uppercase tracking-wider text-accent md:text-2xl lg:text-3xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
