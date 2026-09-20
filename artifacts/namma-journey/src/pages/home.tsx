import { useState } from "react"
import { useLocation } from "wouter"
import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Clock, ArrowRight, WalletCards, BellRing } from "lucide-react"
import { formatMoney } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { LegIcon } from "@/components/leg-icon"

export default function Home() {
  const [, setLocation] = useLocation()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  })

  const handleSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!from || !to) return
    const params = new URLSearchParams({ from, to })
    setLocation(`/options?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-8 animate-in pb-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isLoading ? <Skeleton className="h-8 w-48 mb-2" /> : summary?.greeting || "Namaskara"}
          </h1>
          <div className="text-muted-foreground font-medium flex items-center gap-2">
            {isLoading ? <Skeleton className="h-4 w-32" /> : summary?.simTime}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
            <BellRing className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Wallet Snippet */}
      {!isLoading && summary && (
        <Card className="bg-foreground text-background border-none overflow-hidden relative p-6 cursor-pointer hover:scale-[0.98] transition-transform active:scale-95" onClick={() => setLocation('/wallet')}>
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-background/70 text-sm font-medium mb-1">Namma Wallet</p>
              <h2 className="text-3xl font-extrabold tabular-money tracking-tight">
                {formatMoney(summary.balancePaise)}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-background/10 flex items-center justify-center">
              <WalletCards className="h-6 w-6 text-background" />
            </div>
          </div>
        </Card>
      )}
      {isLoading && <Skeleton className="h-28 w-full rounded-[1.5rem]" />}

      {/* Active Journey Banner */}
      {!isLoading && summary?.activeJourney && summary.activeJourney.status !== "COMPLETED" && (
        <Card className="border-2 border-primary/20 bg-primary/5 p-4 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setLocation('/active')}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Active Journey</p>
              <div className="flex items-center gap-2 text-sm font-bold truncate">
                <span className="truncate">{summary.activeJourney.from}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{summary.activeJourney.to}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Form */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Where to?</h2>
        <Card className="p-2 border-2 border-input focus-within:border-primary/50 transition-colors shadow-none">
          <form onSubmit={handleSearch} className="flex flex-col relative">
            <div className="relative">
              <Input 
                icon={<MapPin className="h-5 w-5" />} 
                placeholder="From (e.g. Majestic)" 
                className="border-none bg-transparent h-14 rounded-xl focus-visible:ring-0 px-12"
                value={from}
                onChange={e => setFrom(e.target.value)}
                required
              />
            </div>
            <div className="absolute left-[1.65rem] top-[3.5rem] bottom-[3.5rem] w-0.5 bg-border z-10" />
            <div className="h-[1px] w-full bg-border ml-12" />
            <div className="relative">
              <Input 
                icon={<Navigation className="h-5 w-5" />} 
                placeholder="To (e.g. Indiranagar)" 
                className="border-none bg-transparent h-14 rounded-xl focus-visible:ring-0 px-12"
                value={to}
                onChange={e => setTo(e.target.value)}
                required
              />
            </div>
          </form>
        </Card>
        <Button onClick={handleSearch} className="w-full h-14 text-lg rounded-2xl" disabled={!from || !to}>
          Find Routes
        </Button>
      </section>

      {/* Recent Journeys */}
      {!isLoading && summary?.recentJourneys && summary.recentJourneys.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Recent</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {summary.recentJourneys.map(journey => (
              <Card 
                key={journey.id} 
                className="shrink-0 w-64 p-4 cursor-pointer hover:border-primary/40 transition-colors shadow-sm"
                onClick={() => {
                  setFrom(journey.from)
                  setTo(journey.to)
                }}
              >
                <div className="flex gap-2 mb-3">
                  {journey.modes.map((mode, i) => (
                    <LegIcon key={i} mode={mode} className="h-6 w-6" />
                  ))}
                </div>
                <p className="font-semibold text-sm truncate">{journey.to}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">From {journey.from}</p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="tabular-money text-foreground">{formatMoney(journey.totalFarePaise)}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(journey.completedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
