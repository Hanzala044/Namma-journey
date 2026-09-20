import React from "react"
import { useLocation } from "wouter"
import { useGetJourneyOptions, getGetJourneyOptionsQueryKey } from "@workspace/api-client-react"
import { ArrowLeft, Clock, Zap, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LegIcon } from "@/components/leg-icon"
import { formatMoney, formatTime, cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function Options() {
  const [location, setLocation] = useLocation()
  
  const searchParams = new URLSearchParams(window.location.search)
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const { data: options, isLoading } = useGetJourneyOptions(
    { from, to },
    { query: { enabled: !!from && !!to, queryKey: getGetJourneyOptionsQueryKey({ from, to }) } }
  )

  if (!from || !to) {
    setLocation("/")
    return null
  }

  return (
    <div className="flex flex-col gap-6 animate-in">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full h-12 w-12 shrink-0 bg-background border">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{to}</h1>
          <p className="text-sm text-muted-foreground truncate">From {from}</p>
        </div>
      </header>

      <div className="space-y-4 pb-8">
        {isLoading && (
          <>
            <Skeleton className="h-40 w-full rounded-[1.5rem]" />
            <Skeleton className="h-40 w-full rounded-[1.5rem]" />
            <Skeleton className="h-40 w-full rounded-[1.5rem]" />
          </>
        )}

        {!isLoading && options?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No routes found between these locations.
          </div>
        )}

        {!isLoading && options?.map((opt, index) => (
          <Card 
            key={opt.id} 
            className={cn(
              "p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
              opt.recommended ? "border-primary/40 shadow-md shadow-primary/5 bg-primary/5" : "hover:border-foreground/20"
            )}
            onClick={() => setLocation(`/journey/${opt.id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{opt.durationMinutes} min</span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(opt.arrivalTime)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xl tabular-money text-foreground tracking-tight">
                  {formatMoney(opt.totalFarePaise)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center mb-4 overflow-x-auto hide-scrollbar">
              {opt.legs.map((leg, i) => (
                <React.Fragment key={leg.id}>
                  <div className="flex items-center gap-1.5 shrink-0 bg-background rounded-full pl-1 pr-3 py-1 border shadow-sm">
                    <LegIcon mode={leg.mode} className="h-6 w-6" />
                    <span className="text-xs font-bold">{leg.provider}</span>
                  </div>
                  {i < opt.legs.length - 1 && (
                    <div className="h-0.5 w-3 bg-border shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex gap-2">
              {opt.recommended && (
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 gap-1 px-3">
                  <Zap className="h-3 w-3" /> Recommended
                </Badge>
              )}
              {opt.legs.every(l => l.mode === 'WALK' || l.mode === 'METRO') && (
                <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 gap-1 px-3">
                  <Leaf className="h-3 w-3" /> Eco Friendly
                </Badge>
              )}
              <div className="flex-1" />
              <div className="text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded border">
                {opt.confidence}% match
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
