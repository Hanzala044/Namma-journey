import { Link, useLocation } from "wouter"
import { Compass, History, Home, User, WalletCards } from "lucide-react"
import { useGetActiveJourney } from "@workspace/api-client-react"
import { getGetActiveJourneyQueryKey } from "@workspace/api-client-react"
import { cn } from "@/lib/utils"

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  const { data: activeJourney } = useGetActiveJourney({
    query: {
      queryKey: getGetActiveJourneyQueryKey(),
      refetchInterval: 10_000,
    },
  })

  const hasActive = activeJourney && activeJourney.status !== "COMPLETED"

  const navItems = [
    { icon: Home, label: "Plan", path: "/" },
    { 
      icon: Compass, 
      label: "Active", 
      path: "/active",
      badge: hasActive
    },
    { icon: WalletCards, label: "Wallet", path: "/wallet" },
    { icon: History, label: "History", path: "/history" },
  ]

  const isNavItemActive = (path: string) => {
    if (path === "/") {
      return location === "/" || location.startsWith("/options") || location.startsWith("/journey/")
    }
    return location === path || location.startsWith(`${path}/`)
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-muted/30">
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[88px] md:pb-0 md:pl-[240px]">
        <div className="mx-auto max-w-lg md:max-w-4xl w-full p-4 md:p-8 min-h-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[88px] items-center justify-around border-t bg-background/80 px-4 pb-safe pt-2 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.path)
          return (
            <Link key={item.path} href={item.path} className="group relative flex flex-col items-center justify-center w-16 h-14">
              <div className={cn(
                "flex h-8 w-16 items-center justify-center rounded-full transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && !isActive && (
                  <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <span className={cn(
                "mt-1 text-[10px] font-semibold transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-[240px] flex-col border-r bg-background md:flex">
        <div className="flex h-20 items-center px-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Namma</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.path)
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-colors relative",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
                {item.badge && (
                  <span className="absolute right-4 h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t">
          <Link href="/sign-in" className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
            Account
          </Link>
        </div>
      </aside>
    </div>
  )
}
