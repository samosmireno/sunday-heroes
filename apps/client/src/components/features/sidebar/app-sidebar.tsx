import { Calendar, ChevronUp, Home, Trophy, User, User2 } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalizeFirstLetter } from "@/utils/utils";

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
    title: "Matches",
    url: "/matches",
    icon: Calendar,
  },
  // {
  //   title: "Teams",
  //   url: "#/teams",
  //   icon: Users,
  // },
  {
    title: "Players",
    url: "/players",
    icon: User,
  },
  // {
  //   title: "Voting",
  //   url: "/voting",
  //   icon: CheckSquare,
  // },
  // {
  //   title: "Stats",
  //   url: "#/stats",
  //   icon: BarChart,
  // },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (url: string) => {
    return location.pathname.startsWith(url) && url !== "#";
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-2 border-accent/60 bg-sidebar-bg font-exo shadow-md transition-all duration-300 ease-in-out"
    >
      <SidebarContent className="flex flex-1 flex-col overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 flex items-center justify-center gap-1 rounded-none border-b-2 border-dashed border-accent/70 pb-3 text-center font-oswald text-xl font-bold tracking-wider text-accent">
            <img
              src="/assets/logo.webp"
              alt="Sunday Heroes Logo"
              className="h-12 w-12 object-contain py-2"
            />
            <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Sunday Heroes
            </span>
          </SidebarGroupLabel>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
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
                      onClick={handleMenuItemClick}
                      className="group flex w-full items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2.5 font-exo text-sm font-medium text-gray-200 transition-all duration-200 hover:border-accent/70 hover:bg-accent/50 data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-gray-200"
                      aria-current={isActive(item.url) ? "page" : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 opacity-80 group-hover:opacity-100 group-data-[active=true]:text-accent" />
                      <span className="truncate font-retro">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t-2 border-dashed border-accent/30 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="group w-full rounded-md border-transparent py-2 text-gray-200 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                      <User2 className="h-5 w-7 text-accent opacity-80 group-hover:opacity-100" />
                    </div>
                    <span className="flex-1 truncate font-retro text-sm font-medium">
                      {capitalizeFirstLetter(user?.name || "User")}
                    </span>
                    <ChevronUp className="h-4 w-4 transform transition-transform group-data-[state=open]:-rotate-180" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-48 border-accent/60 bg-panel-bg font-exo"
              >
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    handleMenuItemClick();
                  }}
                  className="cursor-pointer font-retro text-sm text-gray-200 hover:bg-accent/20 focus:bg-accent/20"
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
