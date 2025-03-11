import {
  BarChart,
  Calendar,
  CheckSquare,
  Home,
  Trophy,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { Link } from "react-router-dom";

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Competitions",
    url: "#",
    icon: Trophy,
  },
  {
    title: "Teams",
    url: "#",
    icon: Users,
  },
  {
    title: "Matches",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Voting",
    url: "#",
    icon: CheckSquare,
  },
  {
    title: "Stats",
    url: "#",
    icon: BarChart,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sunday Heroes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
