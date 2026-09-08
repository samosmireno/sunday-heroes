import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import Background from "@/components/ui/background";

interface AppLayoutProps {
  sidebarActive?: boolean;
  children: ReactNode;
}

export function AppLayout({ sidebarActive = true, children }: AppLayoutProps) {
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
              "group toast font-retro group-[.toaster]:bg-panel-bg group-[.toaster]:text-gray-200 group-[.toaster]:border-2 group-[.toaster]:border-yellow-500/40 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm",
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
      <Background />
      {sidebarActive && <AppSidebar />}
      {/* Both this row and its page share the flex default `min-width: auto`,
          which refuses to shrink below the content's intrinsic width: the row
          would keep its full width beside the sidebar, and a page would keep
          its widest table. `min-w-0` on each lets them shrink, so the inner
          `overflow-x-auto` wrappers scroll instead of the whole document. */}
      <div className="flex min-h-screen w-full min-w-0 bg-bg font-retro text-gray-100 [&>*]:min-w-0">
        {children}
      </div>
    </SidebarProvider>
  );
}
