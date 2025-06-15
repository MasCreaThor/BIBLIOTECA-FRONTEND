// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook para implementar debounce en valores
 * Útil para búsquedas y prevenir llamadas excesivas a APIs
 * 
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar el timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timer si value cambia antes del delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para implementar debounce con callback
 * Útil cuando necesitas ejecutar una función con debounce
 * 
 * @param callback - Función a ejecutar
 * @param delay - Delay en milisegundos
 * @param deps - Dependencias del callback
 * @returns Función con debounce aplicado
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback;
}

/**
 * Hook para buscar con debounce
 * Combina el debounce con estado de búsqueda
 * 
 * @param searchFunction - Función de búsqueda
 * @param delay - Delay en milisegundos (default: 300ms)
 * @returns Objeto con función de búsqueda, estado y resultados
 */
export function useDebouncedSearch<TResult, TQuery = string>(
  searchFunction: (query: TQuery) => Promise<TResult>,
  delay: number = 300
) {
  const [query, setQuery] = useState<TQuery | null>(null);
  const [results, setResults] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (debouncedQuery === null) {
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Error en la búsqueda');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  const search = (newQuery: TQuery) => {
    setQuery(newQuery);
  };

  const clearSearch = () => {
    setQuery(null);
    setResults(null);
    setError(null);
  };

  return {
    search,
    clearSearch,
    results,
    isLoading,
    error,
    query: debouncedQuery,
  };
}