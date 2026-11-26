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

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugifyLatin(input: string, maxLength = 50): string {
  const transliterated = input
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('');

  const cleaned = transliterated
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  const base = cleaned || `item-${Date.now().toString(36)}`;
  return base.slice(0, maxLength).replace(/[-_]+$/g, '') || 'item';
}
