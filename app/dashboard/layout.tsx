import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Providers } from "@/components/Providers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="py-4">
                    {children}
                </div>
            </main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  )
}
