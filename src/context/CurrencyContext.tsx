
'use client';

import React, { createContext, useState, ReactNode } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR';

interface CurrencyContextProps {
    globalCurrency: Currency;
    setGlobalCurrency: (currency: Currency) => void;
}

export const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [globalCurrency, setGlobalCurrency] = useState<Currency>('INR');

    return (
        <CurrencyContext.Provider value={{ globalCurrency, setGlobalCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};
