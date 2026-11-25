export function formatRub(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))}\u00A0₽`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function calcDiscountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatDateRu(isoOrStr: string): string {
  if (!isoOrStr) return '—';
  const d = new Date(isoOrStr);
  if (Number.isNaN(d.getTime())) return isoOrStr;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}
