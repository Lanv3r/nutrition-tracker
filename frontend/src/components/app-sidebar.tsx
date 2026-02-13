import * as React from "react"
import type { Icon } from "@tabler/icons-react"
import {
  IconChartBar,
  IconDashboard,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type TabId = "dashboard" | "add-meal" | "diet-overview" | "profile"

type AppSidebarProps = {
  activeTab: TabId
  onSelect: (tab: TabId) => void
  username: string
  onLogOutClick?: () => void
} & Omit<React.ComponentProps<typeof Sidebar>, "onSelect">

const navMain: { id: TabId; title: string; icon?: Icon }[] = [
  { id: "dashboard", title: "Dashboard", icon: IconDashboard },
  { id: "add-meal", title: "Add Meal", icon: IconListDetails },
  { id: "diet-overview", title: "Diet Overview", icon: IconChartBar },
  { id: "profile", title: "Profile", icon: IconUsers },
];

export function AppSidebar({ activeTab, onSelect, username, onLogOutClick, ...sidebarProps }: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const userData = {
    name: username,
    avatar: "https://avatars.githubusercontent.com/u/64646822?v=4",
  }

  const handleSelect = (tab: TabId) => {
    onSelect(tab)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="offcanvas" {...sidebarProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Avatar className="size-5 rounded-lg">
                  <AvatarImage
                    src="https://github.com/Lanv3r/nutrition-tracker/blob/main/Eatr_logo1.png?raw=true"
                    alt="Eatr logo"
                  />
                  <AvatarFallback>Eatr logo</AvatarFallback>
                </Avatar>
                <span className="text-base font-semibold">Eatr</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} active={activeTab} onSelect={handleSelect}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={userData}
          onProfileClick={() => handleSelect("profile")}
          onLogOutClick={onLogOutClick}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
