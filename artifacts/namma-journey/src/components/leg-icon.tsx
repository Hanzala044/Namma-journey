import { Bus, Train, Navigation, Car } from "lucide-react"
import { JourneyLegMode } from "@workspace/api-client-react"
import { cn } from "@/lib/utils"

export function LegIcon({ mode, className, active }: { mode: JourneyLegMode | string, className?: string, active?: boolean }) {
  const baseClasses = cn("flex items-center justify-center rounded-full shrink-0", className)
  
  switch (mode) {
    case 'BUS':
      return (
        <div className={cn(baseClasses, "bg-accent/10 text-accent", active && "bg-accent text-accent-foreground shadow-md shadow-accent/20")}>
          <Bus className="h-1/2 w-1/2" />
        </div>
      )
    case 'METRO':
      return (
        <div className={cn(baseClasses, "bg-primary/10 text-primary", active && "bg-primary text-primary-foreground shadow-md shadow-primary/20")}>
          <Train className="h-1/2 w-1/2" />
        </div>
      )
    case 'CAB':
      return (
        <div className={cn(baseClasses, "bg-amber-500/10 text-amber-600 dark:text-amber-400", active && "bg-amber-500 text-white shadow-md shadow-amber-500/20")}>
          <Car className="h-1/2 w-1/2" />
        </div>
      )
    case 'WALK':
    default:
      return (
        <div className={cn(baseClasses, "bg-muted text-muted-foreground", active && "bg-muted-foreground text-background shadow-md")}>
          <Navigation className="h-1/2 w-1/2" />
        </div>
      )
  }
}
