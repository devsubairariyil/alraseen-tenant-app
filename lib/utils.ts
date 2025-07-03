import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common currency formatting function
export function formatCurrency(amount: number, currency = "AED"): string {
  return `${currency} ${amount.toLocaleString()}`
}

// Format date consistently
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Get display identifier for payments/refunds
export function getDisplayId(item: { receiptNumber?: string; voucherNumber?: string; paymentId?: string }): string {
  return item.receiptNumber || item.voucherNumber || item.paymentId || "N/A"
}
