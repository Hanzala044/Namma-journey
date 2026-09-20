import { useLocation } from "wouter"
import { useGetActiveJourney, getGetActiveJourneyQueryKey, useValidateJourneyLeg } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LegIcon } from "@/components/leg-icon"
import { Navigation, QrCode, ScanLine, Clock, CheckCircle2 } from "lucide-react"
import { formatMoney, cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { getGetWalletQueryKey } from "@workspace/api-client-react"

export default function ActiveJourney() {
  const [, setLocation] = useLocation()
  
  const { data: activeJourney, isLoading } = useGetActiveJourney({
    query: { queryKey: getGetActiveJourneyQueryKey(), refetchInterval: 5000 }
  })

  const queryClient = useQueryClient()
  const validate = useValidateJourneyLeg({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetActiveJourneyQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() })
      }
    }
  })

  const handleValidate = (legId: string) => {
    if (!activeJourney) return
    validate.mutate({ journeyId: activeJourney.id, data: { legId } })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full rounded-[2rem]" />
        <Skeleton className="h-64 w-full rounded-[1.5rem]" />
      </div>
    )
  }

  if (!activeJourney || activeJourney.status === "COMPLETED") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-in px-4">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Navigation className="h-10 w-10 text-primary opacity-50" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">No active journey</h2>
        <p className="text-muted-foreground mb-8">You're not currently traveling on a planned route.</p>
        <Button onClick={() => setLocation("/")} size="lg" className="rounded-full px-8">
          Plan a Journey
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in pb-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Active Journey</h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
          {activeJourney.from} <Navigation className="h-3 w-3" /> {activeJourney.to}
        </p>
      </header>

      {/* Ticket View */}
      <Card className="bg-foreground text-background border-none overflow-hidden relative shadow-xl shadow-foreground/20 p-8 flex flex-col items-center text-center">
        <div className="absolute -left-12 -top-12 h-32 w-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 h-40 w-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <p className="text-background/70 font-semibold tracking-widest uppercase text-xs mb-6 relative z-10">Current Ticket</p>
        
        <div className="bg-white p-6 rounded-2xl mb-6 relative z-10 flex flex-col items-center shadow-inner">
          <QrCode className="h-32 w-32 text-foreground mb-4" strokeWidth={1.5} />
          <div className="flex items-center gap-2 text-foreground/80 font-mono tracking-[0.2em] font-bold">
            {activeJourney.ticket.code}
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10 text-sm font-medium">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Clock className="h-4 w-4" />
            Expires in {Math.floor(activeJourney.ticket.expiresInSeconds / 60)}:{String(activeJourney.ticket.expiresInSeconds % 60).padStart(2, '0')}
          </div>
        </div>
        
        {/* Ticket Cutouts */}
        <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-8 w-8 bg-background rounded-full" />
        <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 h-8 w-8 bg-background rounded-full" />
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-px bg-background/20 border-dashed border-t-2 border-background/20" />
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Trip Progress</h2>
        
        <div className="relative pl-6 pb-4">
          <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-border -translate-x-1/2" />
          
          <div className="space-y-6">
            {activeJourney.legs.map((leg, i) => {
              const isPast = leg.status === "COMPLETED" || leg.status === "SKIPPED"
              const isActive = leg.status === "ACTIVE"
              const isNext = i === activeJourney.currentLegIndex
              
              return (
                <div key={leg.id} className="relative">
                  <div className={cn(
                    "absolute top-0 -left-[1.5rem] -translate-x-1/2 p-1 rounded-full bg-background z-10 transition-colors",
                  )}>
                    {isPast ? (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <LegIcon mode={leg.mode} className="h-8 w-8" active={isActive || isNext} />
                    )}
                  </div>
                  
                  <Card className={cn(
                    "ml-4 p-4 shadow-sm border-2 transition-all",
                    isActive ? "border-primary bg-primary/5" : "border-transparent hover:border-border",
                    isPast && "opacity-60"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold text-base", isPast && "line-through")}>{leg.provider}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          isPast && "bg-transparent border"
                        )}>
                          {leg.status}
                        </span>
                      </div>
                      <span className="font-bold tabular-money">{formatMoney(leg.farePaise)}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-3 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full border-2 shrink-0", isPast ? "border-muted-foreground bg-muted-foreground" : "border-foreground")} />
                        <span className="truncate text-foreground">{leg.from}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-1 text-xs">
                        <div className="h-4 w-0.5 bg-border rounded" />
                        {leg.durationMinutes} min
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full border-2 shrink-0", isActive ? "border-primary bg-primary" : "border-border")} />
                        <span className="truncate text-foreground">{leg.to}</span>
                      </div>
                    </div>

                    {(isNext || isActive) && leg.mode !== 'WALK' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant={isActive ? "secondary" : "default"}
                          size="sm" 
                          className={cn("w-full rounded-xl gap-2", isActive && "bg-muted hover:bg-muted/80")}
                          onClick={() => handleValidate(leg.id)}
                          disabled={validate.isPending}
                        >
                          <ScanLine className="h-4 w-4" />
                          {validate.isPending ? "Scanning..." : (isActive ? "End Leg" : "Simulate Boarding Scan")}
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
