import { ReactNode } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/features/sidebar/app-sidebar";
import { Toaster } from "../components/ui/sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <Toaster
        position="top-right"
        closeButton
        duration={4000}
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "group toast font-retro group-[.toaster]:bg-panel-bg group-[.toaster]:text-gray-200 group-[.toaster]:border-2 group-[.toaster]:border-tellow-500/40 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm",
            description: "group-[.toast]:text-gray-300 group-[.toast]:text-sm",
            cancelButton:
              "group-[.toast]:bg-bg/30 group-[.toast]:text-gray-300 group-[.toast]:hover:bg-bg/50 group-[.toast]:border-accent/30 group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
            closeButton:
              "group-[.toast]:bg-red-500/20 group-[.toast]:text-red-400 group-[.toast]:border-red-500/30 group-[.toast]:hover:bg-red-500/30 group-[.toast]:rounded group-[.toast]:p-1",
            error:
              "group-[.toaster]:bg-panel-bg group-[.toaster]:border-red-500/60 group-[.toaster]:text-red-200",
          },
        }}
      />
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
