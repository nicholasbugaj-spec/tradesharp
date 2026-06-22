import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case "BUY":
      return "text-success";
    case "SELL":
      return "text-danger";
    case "HOLD":
      return "text-warning";
    default:
      return "text-text-secondary";
  }
}

export function getRecommendationBg(rec: string): string {
  switch (rec) {
    case "BUY":
      return "bg-success/10 text-success border-success/20";
    case "SELL":
      return "bg-danger/10 text-danger border-danger/20";
    case "HOLD":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-surface text-text-secondary border-border";
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return "text-success";
  if (confidence >= 50) return "text-warning";
  return "text-danger";
}

export function getConfidenceBarColor(confidence: number): string {
  if (confidence >= 75) return "bg-success";
  if (confidence >= 50) return "bg-warning";
  return "bg-danger";
}
