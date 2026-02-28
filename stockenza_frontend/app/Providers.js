'use client';

import { CurrencyProvider } from '../context/CurrencyContext';

export default function Providers({ children }) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
}