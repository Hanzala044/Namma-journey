import { Compass, UserPlus, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in">
      <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20 -rotate-6">
        <Compass className="h-10 w-10 text-primary-foreground rotate-6" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight text-center mb-2">Welcome to Namma</h1>
      <p className="text-muted-foreground text-center mb-10 max-w-sm">
        One unified account for Metro, BMTC, and auto rickshaws across Bengaluru.
      </p>

      <Card className="w-full max-w-sm p-8 shadow-lg text-center border-2 border-primary/10">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
        <h2 className="font-bold text-lg mb-2">Authentication Ready</h2>
        <p className="text-sm text-muted-foreground mb-8">
          This project is prepared for Clerk Auth. Once the environment keys are configured, this screen will be replaced by the official Clerk sign-in flow.
        </p>
        
        <Button className="w-full h-14 rounded-2xl" disabled>
          <UserPlus className="h-5 w-5 mr-2" />
          Continue with Clerk
        </Button>
      </Card>
    </div>
  )
}
