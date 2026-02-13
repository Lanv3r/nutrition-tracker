import { type Icon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  active,
  onSelect,
}: {
  items: {
    title: string
    id: "dashboard" | "add-meal" | "profile" | "diet-overview"
    icon?: Icon
  }[]
  active: "dashboard" | "add-meal" | "profile" | "diet-overview"
  onSelect: (tab: "dashboard" | "add-meal" | "profile" | "diet-overview") => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => onSelect(item.id)}
                className={item.id === active ? "bg-muted font-semibold" : ""}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
