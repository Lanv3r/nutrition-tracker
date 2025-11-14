import { useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import Dashboard from './Dashboard'
import AddMeal from './AddMeal'
import Profile from './Profile'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type TabId = "dashboard" | "add-meal" | "profile"

type MainPageProps = { userId: number }

export default function MainPage({ userId }: MainPageProps) {
  const [tab, setTab] = useState<TabId>("dashboard");
  return (
    <SidebarProvider>
      <AppSidebar activeTab={tab} onSelect={setTab}/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {tab === 'dashboard' && <Dashboard userId={userId} />}
          {tab === 'add-meal' && <AddMeal userId={userId} />}
          {tab === 'profile' && <Profile userId={userId} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )

  /*const [tab, setTab] = useState<'summary' | 'add-meal' | 'profile'>('summary');
		
  return (
    <main className="flex min-h-svh flex-col items-center gap-6 bg-slate-50 p-8">
			<header className="flex w-full max-w-5xl items-center justify-between">
				<h1 className="flex items-center gap-3 self-center font-medium">Eatr</h1>
				<Avatar className="size-10 rounded-lg">
					<AvatarImage
						src="https://github.com/Lanv3r/nutrition-tracker/blob/main/Eatr_logo1.png?raw=true"
						alt="Eatr logo"
					/>
					<AvatarFallback>Eatr logo</AvatarFallback>
				</Avatar>
			</header>
      <NavBar onSelect={setTab} … />
      <section>
        {tab === 'summary' && <Summary userId={userId} />}
        {tab === 'add-meal' && <AddMeal userId={userId} />}
        {tab === 'profile' && <Profile userId={userId} />}
      </section>
    </main>
  )*/
}