import { ReactNode } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/features/sidebar/app-sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-repeat"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)",
        }}
      ></div>

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
          backgroundSize: "10px 10px",
        }}
      ></div>
      <AppSidebar />
      <div className="flex min-h-screen w-full overflow-x-hidden bg-bg font-retro text-gray-100">
        {children}
      </div>
    </SidebarProvider>
  );
}
