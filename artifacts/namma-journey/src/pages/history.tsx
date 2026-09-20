import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LegIcon } from "@/components/leg-icon"
import { Clock, Navigation, ArrowRight } from "lucide-react"
import { formatMoney } from "@/lib/utils"

export default function History() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  })

  return (
    <div className="flex flex-col gap-8 animate-in pb-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Journey History</h1>
        <p className="text-muted-foreground mt-1">Your recent completed trips across Namma Bengaluru.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : summary?.recentJourneys.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Navigation className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2">No history yet</h2>
          <p className="text-muted-foreground">Completed journeys will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summary?.recentJourneys.map(journey => (
            <Card key={journey.id} className="p-5 shadow-sm hover:border-foreground/20 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="truncate max-w-[120px]">{journey.from}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{journey.to}</span>
                </div>
                <span className="font-extrabold tabular-money text-foreground">{formatMoney(journey.totalFarePaise)}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                  {journey.modes.map((mode, i) => (
                    <div key={i} className="flex items-center gap-1.5 shrink-0 bg-muted/50 rounded-full pl-1 pr-2 py-0.5 border">
                      <LegIcon mode={mode} className="h-5 w-5" />
                      <span className="text-[10px] font-bold uppercase">{mode}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 ml-4">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(journey.completedAt).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
