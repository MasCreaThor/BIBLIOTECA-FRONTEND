// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook para hacer debounce de valores
 * Útil para búsquedas en tiempo real y optimización de rendimiento
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}