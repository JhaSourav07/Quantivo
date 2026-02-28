/**
 * lib/currencies.js
 * Central list of supported currencies + Intl-based formatter.
 *
 * Add or remove entries here to change what appears in the picker.
 * `locale` drives Intl.NumberFormat so symbol placement, spacing, and
 * decimal rules are all handled correctly per-currency automatically.
 */

export const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar',          locale: 'en-US',    flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   name: 'Euro',               locale: 'de-DE',    flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',      locale: 'en-GB',    flag: '🇬🇧' },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',       locale: 'en-IN',    flag: '🇮🇳' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',       locale: 'ja-JP',    flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',    locale: 'en-CA',    flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',  locale: 'en-AU',    flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',   locale: 'en-SG',    flag: '🇸🇬' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',         locale: 'ar-AE',    flag: '🇦🇪' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real',     locale: 'pt-BR',    flag: '🇧🇷' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',       locale: 'es-MX',    flag: '🇲🇽' },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',        locale: 'de-CH',    flag: '🇨🇭' },
];

export const DEFAULT_CURRENCY_CODE = 'USD';

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatCurrency(value, currencyCode = DEFAULT_CURRENCY_CODE) {
  const { locale, code } = getCurrency(currencyCode);
  try {
    return new Intl.NumberFormat(locale, {
      style:    'currency',
      currency: code,
      // Trim trailing zeros only for JPY-style zero-decimal currencies
      minimumFractionDigits: code === 'JPY' ? 0 : 2,
      maximumFractionDigits: code === 'JPY' ? 0 : 2,
    }).format(value);
  } catch {
    // Graceful fallback if Intl fails in an unusual environment
    return `${getCurrency(currencyCode).symbol}${value.toFixed(2)}`;
  }
}