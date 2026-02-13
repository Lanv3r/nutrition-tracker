import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type TabId = "dashboard" | "add-meal" | "profile" | "diet-overview";

type MainPageProps = {
  userId: number;
  username: string;
  onLogout?: () => void;
};

export default function MainPage({ username, onLogout }: MainPageProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname.split("/").pop() as TabId;
  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        activeTab={active}
        onSelect={(tab) => navigate(`/${tab}`)}
        username={username}
        onLogOutClick={onLogout}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
