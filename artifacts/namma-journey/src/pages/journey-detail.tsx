import { useEffect } from "react"
import { useLocation, useParams } from "wouter"
import { useGetJourneyOptions, getGetJourneyOptionsQueryKey, useConfirmJourney } from "@workspace/api-client-react"
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LegIcon } from "@/components/leg-icon"
import { cn, formatMoney, formatTime, getErrorMessage } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"
import { getGetActiveJourneyQueryKey, getGetWalletQueryKey } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"

export default function JourneyDetail() {
  const [, setLocation] = useLocation()
  const params = useParams()
  const id = params.id

  const searchParams = new URLSearchParams(window.location.search)
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const { data: options, error, isError, isLoading } = useGetJourneyOptions(
    { from, to },
    { query: { enabled: !!from && !!to, queryKey: getGetJourneyOptionsQueryKey({ from, to }) } }
  )

  const option = options?.find(o => o.id === id)
  const { toast } = useToast()

  const queryClient = useQueryClient()
  const confirm = useConfirmJourney({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetActiveJourneyQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() })
        setLocation("/active")
      },
      onError: (error) => {
        toast({
          title: "Couldn’t confirm journey",
          description: getErrorMessage(error, "Check your wallet and try again."),
          variant: "destructive",
        })
      },
    }
  })

  useEffect(() => {
    if (!from || !to || (!isLoading && !option)) setLocation("/")
  }, [from, isLoading, option, setLocation, to])

  if (!from || !to || (!isLoading && !option)) {
    return null
  }

  const handleConfirm = () => {
    if (!id) return
    confirm.mutate({ data: { optionId: id } })
  }

  return (
    <div className="flex flex-col gap-6 animate-in">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation(`/options?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)} className="rounded-full h-12 w-12 shrink-0 bg-background border">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">Review Journey</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-[1.5rem]" />
          <Skeleton className="h-64 w-full rounded-[1.5rem]" />
        </div>
      ) : isError ? (
        <Card className="p-6 text-center">
          <h2 className="font-bold">Journey details unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {getErrorMessage(error, "Return to route planning and try again.")}
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setLocation("/")}>
            Plan again
          </Button>
        </Card>
      ) : option ? (
        <>
          <Card className="p-6 bg-foreground text-background border-none overflow-hidden relative shadow-lg shadow-foreground/10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-background/60 font-semibold text-sm uppercase tracking-wider">Total Fare</span>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-extrabold tabular-money">{formatMoney(option.totalFarePaise)}</span>
                <span className="text-background/80 text-sm font-medium">incl. {formatMoney(option.holdPaise)} hold</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 bg-background/10 rounded-full px-3 py-1.5 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary-foreground" />
                  {option.durationMinutes} min
                </div>
                <div className="flex items-center gap-1.5 bg-background/10 rounded-full px-3 py-1.5 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Arrival {formatTime(option.arrivalTime)}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Route Details</h2>
            <div className="relative pl-6 pb-4">
              <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-border -translate-x-1/2" />
              
              <div className="space-y-8">
                {option.legs.map((leg, i) => (
                  <div key={leg.id} className="relative">
                    <div className="absolute top-0 -left-[1.5rem] -translate-x-1/2 bg-background p-1 rounded-full">
                      <LegIcon mode={leg.mode} className="h-8 w-8" active={leg.mode !== 'WALK'} />
                    </div>
                    
                    <Card className="ml-4 p-4 shadow-sm border-2 border-transparent transition-colors hover:border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{leg.provider}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">{leg.mode}</span>
                        </div>
                        <span className="font-bold tabular-money">{formatMoney(leg.farePaise)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full border-2 border-foreground shrink-0" />
                          <span className="truncate text-foreground">{leg.from}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                          <div className="h-6 w-0.5 bg-border rounded" />
                          <span className="text-xs">{leg.durationMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full border-2 border-primary bg-primary shrink-0" />
                          <span className="truncate text-foreground">{leg.to}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t z-50 md:relative md:bg-transparent md:border-none md:p-0">
            <Button 
              className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/30" 
              onClick={handleConfirm}
              disabled={confirm.isPending}
            >
              {confirm.isPending ? "Confirming..." : "Confirm & Pay"}
              {!confirm.isPending && <ChevronRight className="h-5 w-5 ml-2" />}
            </Button>
          </div>
          {/* Spacer for fixed mobile bottom button */}
          <div className="h-20 md:hidden" />
        </>
      ) : null}
    </div>
  )
}
