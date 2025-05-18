import {
  BarChart,
  Calendar,
  CheckSquare,
  ChevronUp,
  Home,
  Trophy,
  User2,
  Users,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const sidebarItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Competitions",
    url: "/competitions",
    icon: Trophy,
  },
  {
    title: "Teams",
    url: "#/teams",
    icon: Users,
  },
  {
    title: "Matches",
    url: "/matches",
    icon: Calendar,
  },
  {
    title: "Voting",
    url: "#/voting",
    icon: CheckSquare,
  },
  {
    title: "Stats",
    url: "#/stats",
    icon: BarChart,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (url: string) => {
    return location.pathname.startsWith(url) && url !== "#";
  };

  return (
    <Sidebar
      collapsible="icon"
      className="z-10 flex h-[100dvh] flex-col border-r-2 border-accent/60 bg-sidebar-bg font-retro shadow-md transition-all duration-300 ease-in-out"
    >
      <SidebarContent className="flex flex-1 flex-col gap-3 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 flex items-center justify-center gap-2 rounded-none border-b-2 border-dashed border-accent/70 pb-3 text-center font-oswald text-xl font-bold tracking-wider text-accent">
            <Zap size={24} className="animate-pulse text-accent" />
            <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Sunday Heroes
            </span>
          </SidebarGroupLabel>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.url}
                      className="group flex w-full items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2.5 text-gray-200 transition-all duration-200 hover:border-accent/70 hover:bg-accent/50 data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-gray-200"
                      aria-current={isActive(item.url) ? "page" : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 opacity-80 group-hover:opacity-100 group-data-[active=true]:text-accent" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t-2 border-dashed border-accent/30 pt-2">
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="group w-full rounded-md border-l-4 border-transparent px-3 py-2.5 text-gray-200 transition-all duration-200 hover:border-accent/70 hover:bg-accent/50">
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                      <User2 className="h-5 w-5 text-accent opacity-80 group-hover:opacity-100" />
                    </div>
                    <span className="flex-1 truncate">
                      {user?.name || "User"}
                    </span>
                    <ChevronUp className="h-4 w-4 transform transition-transform group-data-[state=open]:-rotate-180" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-48 border-accent/60 bg-panel-bg"
              >
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-gray-200 hover:bg-accent/20 focus:bg-accent/20"
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
