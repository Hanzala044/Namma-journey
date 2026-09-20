import { createHash } from "node:crypto";

export type TransitMode = "WALK" | "BUS" | "METRO" | "CAB";
export type LegStatus = "PLANNED" | "HELD" | "ACTIVE" | "COMPLETED" | "SKIPPED";

export interface JourneyLeg {
  id: string;
  mode: TransitMode;
  provider: string;
  from: string;
  to: string;
  durationMinutes: number;
  farePaise: number;
  holdPaise: number;
  status: LegStatus;
  accent: string;
}

export interface JourneyOption {
  id: string;
  label: string;
  durationMinutes: number;
  arrivalTime: string;
  totalFarePaise: number;
  holdPaise: number;
  confidence: number;
  recommended: boolean;
  legs: JourneyLeg[];
}

interface ActiveJourney {
  id: string;
  from: string;
  to: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
  totalFarePaise: number;
  heldPaise: number;
  currentLegIndex: number;
  confirmedAt: string;
  legs: JourneyLeg[];
  ticket: {
    id: string;
    code: string;
    expiresInSeconds: number;
  };
}

interface LedgerEntry {
  id: string;
  type: "CREDIT" | "HOLD" | "RELEASE" | "DEBIT";
  label: string;
  amountPaise: number;
  createdAt: string;
  status: string;
}

const SIM_ANCHOR = new Date("2026-08-29T08:00:00+05:30");
const wallAnchor = Date.now();

export function simulationNow(): Date {
  return new Date(SIM_ANCHOR.getTime() + (Date.now() - wallAnchor));
}

const ledger: LedgerEntry[] = [
  {
    id: "led-seed",
    type: "CREDIT",
    label: "Demo wallet seed",
    amountPaise: 50_000,
    createdAt: new Date(SIM_ANCHOR.getTime() - 86_400_000).toISOString(),
    status: "SETTLED",
  },
];

let activeJourney: ActiveJourney | null = null;
const optionCache = new Map<string, JourneyOption>();

function nextTime(minutes: number): string {
  return new Date(simulationNow().getTime() + minutes * 60_000).toISOString();
}

function leg(
  id: string,
  mode: TransitMode,
  provider: string,
  from: string,
  to: string,
  durationMinutes: number,
  farePaise: number,
  accent: string,
): JourneyLeg {
  const holdPaise = farePaise === 0 ? 0 : Math.ceil(farePaise * 1.12);
  return {
    id,
    mode,
    provider,
    from,
    to,
    durationMinutes,
    farePaise,
    holdPaise,
    status: "PLANNED",
    accent,
  };
}

function option(
  id: string,
  label: string,
  recommended: boolean,
  confidence: number,
  legs: JourneyLeg[],
): JourneyOption {
  const durationMinutes = legs.reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalFarePaise = legs.reduce((sum, item) => sum + item.farePaise, 0);
  const holdPaise = legs.reduce((sum, item) => sum + item.holdPaise, 0);
  return {
    id,
    label,
    durationMinutes,
    arrivalTime: nextTime(durationMinutes),
    totalFarePaise,
    holdPaise,
    confidence,
    recommended,
    legs,
  };
}

export function planJourneys(from: string, to: string): JourneyOption[] {
  const origin = from.trim() || "Electronic City";
  const destination = to.trim() || "Whitefield";
  const options = [
    option("balanced", "Best balance", true, 94, [
      leg("b1", "WALK", "Namma Journey", origin, "Konappana Agrahara", 8, 0, "#667085"),
      leg("b2", "BUS", "BMTC-Sim", "Konappana Agrahara", "Silk Board", 26, 2500, "#1565C0"),
      leg("b3", "METRO", "Metro-Sim", "Silk Board", "Kadugodi Tree Park", 39, 5500, "#7B2CBF"),
      leg("b4", "CAB", "RideX", "Kadugodi Tree Park", destination, 12, 8900, "#E85D04"),
    ]),
    option("budget", "Lowest fare", false, 88, [
      leg("l1", "WALK", "Namma Journey", origin, "Electronic City", 11, 0, "#667085"),
      leg("l2", "BUS", "BMTC-Sim", "Electronic City", "Tin Factory", 58, 4200, "#1565C0"),
      leg("l3", "BUS", "BMTC-Sim", "Tin Factory", destination, 28, 2500, "#1565C0"),
    ]),
    option("fast", "Fastest", false, 91, [
      leg("f1", "CAB", "RideX", origin, "Bommanahalli", 15, 9900, "#E85D04"),
      leg("f2", "METRO", "Metro-Sim", "Bommanahalli", "Kadugodi Tree Park", 42, 6000, "#7B2CBF"),
      leg("f3", "CAB", "RideX", "Kadugodi Tree Park", destination, 9, 7400, "#E85D04"),
    ]),
  ];

  for (const item of options) optionCache.set(item.id, item);
  return options;
}

function walletBalance(): number {
  return ledger.reduce((sum, entry) => {
    if (entry.type === "CREDIT") return sum + entry.amountPaise;
    if (entry.type === "DEBIT") return sum - entry.amountPaise;
    return sum;
  }, 0);
}

function heldBalance(): number {
  return activeJourney?.heldPaise ?? 0;
}

export function getWallet() {
  const balancePaise = walletBalance();
  const heldPaise = heldBalance();
  return {
    balancePaise,
    heldPaise,
    availablePaise: balancePaise - heldPaise,
    currency: "INR",
  };
}

export function getLedger(): LedgerEntry[] {
  return [...ledger].reverse();
}

export function topUp(amountPaise: number) {
  ledger.push({
    id: `led-${ledger.length + 1}`,
    type: "CREDIT",
    label: "PayBridge sandbox top-up",
    amountPaise,
    createdAt: simulationNow().toISOString(),
    status: "SETTLED",
  });
  return getWallet();
}

function rotatingCode(ticketId: string, legId: string): string {
  const counter = Math.floor(simulationNow().getTime() / 30_000);
  return createHash("sha256")
    .update(`${ticketId}:${counter}:${legId}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
}

function refreshTicket(journey: ActiveJourney): ActiveJourney {
  const currentLeg = journey.legs[journey.currentLegIndex] ?? journey.legs.at(-1);
  if (!currentLeg) return journey;
  journey.ticket.code = rotatingCode(journey.ticket.id, currentLeg.id);
  journey.ticket.expiresInSeconds = 30 - (Math.floor(simulationNow().getTime() / 1000) % 30);
  return journey;
}

export function confirmJourney(optionId: string): ActiveJourney | null {
  const selected = optionCache.get(optionId) ?? planJourneys("Electronic City", "Whitefield").find((item) => item.id === optionId);
  if (!selected || selected.holdPaise > getWallet().availablePaise) return null;
  const id = `journey-${simulationNow().getTime()}`;
  const legs = selected.legs.map((item, index) => ({
    ...item,
    status: index === 0 ? ("ACTIVE" as const) : ("HELD" as const),
  }));
  activeJourney = {
    id,
    from: legs[0]?.from ?? "Electronic City",
    to: legs.at(-1)?.to ?? "Whitefield",
    status: "IN_PROGRESS",
    totalFarePaise: selected.totalFarePaise,
    heldPaise: selected.holdPaise,
    currentLegIndex: 0,
    confirmedAt: simulationNow().toISOString(),
    legs,
    ticket: {
      id: `ticket-${id}`,
      code: "",
      expiresInSeconds: 30,
    },
  };
  ledger.push({
    id: `led-${ledger.length + 1}`,
    type: "HOLD",
    label: `Fare ceiling for ${activeJourney.from} → ${activeJourney.to}`,
    amountPaise: selected.holdPaise,
    createdAt: simulationNow().toISOString(),
    status: "ACTIVE",
  });
  return refreshTicket(activeJourney);
}

export function getActiveJourney(): ActiveJourney | null {
  return activeJourney ? refreshTicket(activeJourney) : null;
}

export function validateLeg(journeyId: string, legId: string): ActiveJourney | null {
  if (!activeJourney || activeJourney.id !== journeyId) return null;
  const index = activeJourney.legs.findIndex((item) => item.id === legId);
  if (index < 0 || index !== activeJourney.currentLegIndex) return activeJourney;
  const current = activeJourney.legs[index];
  if (!current || current.status === "COMPLETED") return refreshTicket(activeJourney);

  current.status = "COMPLETED";
  if (current.farePaise > 0) {
    ledger.push({
      id: `led-${ledger.length + 1}`,
      type: "DEBIT",
      label: `${current.provider} · ${current.from} → ${current.to}`,
      amountPaise: current.farePaise,
      createdAt: simulationNow().toISOString(),
      status: "SETTLED",
    });
    activeJourney.heldPaise = Math.max(0, activeJourney.heldPaise - current.holdPaise);
  }

  const next = activeJourney.legs[index + 1];
  if (next) {
    next.status = "ACTIVE";
    activeJourney.currentLegIndex = index + 1;
  } else {
    activeJourney.status = "COMPLETED";
    activeJourney.heldPaise = 0;
  }
  return refreshTicket(activeJourney);
}

export function getDashboardSummary() {
  return {
    greeting: "Good morning, Bengaluru",
    balancePaise: getWallet().balancePaise,
    activeJourney: getActiveJourney(),
    recentJourneys: [
      {
        id: "recent-1",
        from: "Indiranagar",
        to: "Majestic",
        completedAt: new Date(SIM_ANCHOR.getTime() - 86_400_000).toISOString(),
        totalFarePaise: 3500,
        modes: ["METRO", "WALK"],
      },
      {
        id: "recent-2",
        from: "Koramangala",
        to: "Cubbon Park",
        completedAt: new Date(SIM_ANCHOR.getTime() - 172_800_000).toISOString(),
        totalFarePaise: 6200,
        modes: ["BUS", "METRO"],
      },
    ],
    simTime: simulationNow().toISOString(),
  };
}