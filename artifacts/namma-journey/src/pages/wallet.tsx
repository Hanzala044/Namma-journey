import { useGetWallet, getGetWalletQueryKey, useGetWalletLedger, getGetWalletLedgerQueryKey, useTopUpWallet } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { WalletCards, Plus, ArrowDownToLine, ShieldAlert, ArrowUpFromLine, RefreshCw } from "lucide-react"
import { formatMoney, cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Wallet() {
  const { data: wallet, isLoading: isWalletLoading } = useGetWallet({
    query: { queryKey: getGetWalletQueryKey() }
  })

  const { data: ledger, isLoading: isLedgerLoading } = useGetWalletLedger({
    query: { queryKey: getGetWalletLedgerQueryKey() }
  })

  const queryClient = useQueryClient()
  const topUp = useTopUpWallet({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetWalletLedgerQueryKey() })
      }
    }
  })

  const handleTopUp = () => {
    topUp.mutate({ data: { amountPaise: 50000 } }) // Add ₹500
  }

  const getLedgerIcon = (type: string) => {
    switch (type) {
      case 'CREDIT': return <ArrowDownToLine className="h-4 w-4 text-accent" />
      case 'DEBIT': return <ArrowUpFromLine className="h-4 w-4 text-foreground" />
      case 'HOLD': return <ShieldAlert className="h-4 w-4 text-amber-500" />
      case 'RELEASE': return <RefreshCw className="h-4 w-4 text-primary" />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in pb-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Wallet</h1>
      </header>

      {isWalletLoading ? (
        <Skeleton className="h-48 w-full rounded-[2rem]" />
      ) : wallet ? (
        <Card className="bg-foreground text-background border-none overflow-hidden relative shadow-xl shadow-foreground/20 p-8">
          <div className="absolute right-[-20%] top-[-20%] h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute left-[-10%] bottom-[-10%] h-48 w-48 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <WalletCards className="h-6 w-6 text-background/80" />
                <span className="font-semibold text-background/80 tracking-wide uppercase text-sm">Namma Balance</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-background/10 text-background">INR</span>
            </div>
            
            <h2 className="text-5xl font-extrabold tabular-money tracking-tight mb-8">
              {formatMoney(wallet.balancePaise)}
            </h2>

            <div className="flex justify-between items-end border-t border-background/10 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-background/60 text-xs font-semibold uppercase tracking-wider">Available</span>
                <span className="font-bold tabular-money">{formatMoney(wallet.availablePaise)}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-background/60 text-xs font-semibold uppercase tracking-wider">On Hold</span>
                <span className="font-bold tabular-money">{formatMoney(wallet.heldPaise)}</span>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="flex gap-4">
        <Button 
          className="flex-1 h-14 rounded-2xl text-base shadow-md shadow-primary/20" 
          onClick={handleTopUp}
          disabled={topUp.isPending}
        >
          <Plus className="h-5 w-5 mr-2" />
          {topUp.isPending ? "Processing..." : "Add ₹500 (Sandbox)"}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
        
        {isLedgerLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : ledger?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ledger?.map((entry) => (
              <Card key={entry.id} className="p-4 flex items-center gap-4 hover:border-foreground/20 transition-colors shadow-sm">
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                  entry.type === 'CREDIT' && "bg-accent/10",
                  entry.type === 'DEBIT' && "bg-muted",
                  entry.type === 'HOLD' && "bg-amber-500/10",
                  entry.type === 'RELEASE' && "bg-primary/10"
                )}>
                  {getLedgerIcon(entry.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{entry.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>

                <div className={cn(
                  "font-bold tabular-money text-right",
                  entry.type === 'CREDIT' ? "text-accent" : "text-foreground"
                )}>
                  {entry.type === 'CREDIT' ? '+' : entry.type === 'RELEASE' ? '+' : '-'}{formatMoney(entry.amountPaise)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
