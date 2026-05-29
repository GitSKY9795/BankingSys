import { format } from "date-fns";

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export function formatDate(date?: string | number | Date | null) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy • HH:mm");
}

export function formatRelativeDay(date?: string | number | Date | null) {
  if (!date) return "—";
  return format(new Date(date), "MMM dd");
}

export function shortId(value?: string | null) {
  if (!value) return "—";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
