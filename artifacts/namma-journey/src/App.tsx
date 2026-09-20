import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { Shell } from '@/components/shell';
import Home from '@/pages/home';
import Options from '@/pages/options';
import JourneyDetail from '@/pages/journey-detail';
import ActiveJourney from '@/pages/active';
import Wallet from '@/pages/wallet';
import History from '@/pages/history';
import SignIn from '@/pages/sign-in';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/options" component={Options} />
          <Route path="/journey/:id" component={JourneyDetail} />
          <Route path="/active" component={ActiveJourney} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/history" component={History} />
          <Route path="/sign-in" component={SignIn} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
