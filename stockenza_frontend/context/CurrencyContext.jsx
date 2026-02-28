'use client';
/**
 * context/CurrencyContext.jsx
 *
 * THE HYDRATION PROBLEM (and why isMounted fixes it):
 * ---------------------------------------------------
 * Next.js App Router renders components on the server first, then
 * hydrates on the client. On the server, localStorage doesn't exist,
 * so CurrencyProvider initialises with DEFAULT_CURRENCY_CODE ('USD').
 *
 * Without the isMounted guard:
 *   1. Server renders with 'USD'  → all consumers see '$'
 *   2. Client hydrates            → React reconciles, still 'USD' (match ✓)
 *   3. useEffect fires            → reads 'INR' from localStorage
 *   4. State updates to 'INR'    → re-render, consumers now see '₹'
 *
 * The problem in step 3/4 is that React has already committed the
 * component tree with 'USD'. The re-render happens *after* paint,
 * so there's a flash of wrong currency — and more importantly, any
 * component that cached `fmt` in a derived value or memo will have
 * stale data until the next render cycle.
 *
 * WITH the isMounted guard:
 *   - `fmt` returns '' (empty string) before mount, so nothing renders
 *   - After mount, localStorage is read and the correct currency is set
 *   - All consumers render once, with the correct value
 *   - No flash, no stale cache
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrency, formatCurrency, DEFAULT_CURRENCY_CODE } from '../lib/currencies';

const LS_KEY = 'stockenza_currency';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCodeState] = useState(DEFAULT_CURRENCY_CODE);
  // isMounted prevents the pre-hydration stale-currency flash
  const [isMounted,    setIsMounted]          = useState(false);

  useEffect(() => {
    // Read saved preference from localStorage
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setCurrencyCodeState(saved);
    } catch {}
    // Mark as mounted AFTER reading localStorage so consumers never
    // see the server-default 'USD' if the user has saved 'INR'
    setIsMounted(true);
  }, []);

  const setCurrencyCode = useCallback((code) => {
    setCurrencyCodeState(code);
    try { localStorage.setItem(LS_KEY, code); } catch {}
  }, []);

  const currency = getCurrency(currencyCode);

  const fmt = useCallback(
    (value) => {
      // Return empty string before mount so consumers don't flash wrong currency.
      // Callers should guard with `loaded` state (which they already do for data).
      if (!isMounted) return '';
      return formatCurrency(value, currencyCode);
    },
    [currencyCode, isMounted]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, fmt, isMounted }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
}