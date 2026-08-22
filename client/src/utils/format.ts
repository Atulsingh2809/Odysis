import { format, parseISO } from 'date-fns';
import type { Currency } from '@/types';

const symbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AED: 'د.إ',
};

export function currencySymbol(currency: string) {
  return symbols[currency as Currency] ?? currency;
}

export function formatMoney(amount: number | string | null | undefined, currency: string) {
  const value = Number(amount ?? 0);
  const symbol = currencySymbol(currency);
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
}

export function toDate(value: string | Date) {
  return typeof value === 'string' ? parseISO(value) : value;
}

export function formatDate(value: string | Date) {
  return format(toDate(value), 'd MMM yyyy');
}

export function formatDateRange(start: string | Date, end: string | Date) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
