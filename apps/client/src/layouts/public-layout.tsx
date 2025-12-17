import { ReactNode } from "react";
import { AppLayout } from "./app-layout";
import { useAuth } from "@/context/auth-context";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <AppLayout sidebarActive={!!user}>{children}</AppLayout>;
}
