import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`
}

export function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}
