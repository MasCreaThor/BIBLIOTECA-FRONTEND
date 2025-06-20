'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { theme } from './theme';

export function Providers({ children }: { children: React.ReactNode }) {
  // Crear QueryClient con configuración optimizada
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo de cache por defecto
            staleTime: 5 * 60 * 1000, // 5 minutos
            // Tiempo antes de que se considere "garbage collection"
            gcTime: 10 * 60 * 1000, // 10 minutos
            // Reintentos automáticos
            retry: (failureCount, error: any) => {
              // No reintentar en errores 4xx (errores del cliente)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Reintentar hasta 2 veces para otros errores
              return failureCount < 2;
            },
            // Configuración de refetch
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
          },
          mutations: {
            // Reintentos para mutaciones
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#ffffff',
                color: '#333333',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#48bb78',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f56565',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          
          {/* React Query DevTools - reposicionado y más pequeño */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <style jsx global>{`
                .react-query-devtools-button {
                  transform: scale(0.7) !important;
                  bottom: 20px !important;
                  left: 20px !important;
                }
                .react-query-devtools-panel {
                  transform: scale(0.9) !important;
                  transform-origin: bottom left !important;
                }
              `}</style>
              <ReactQueryDevtools 
                initialIsOpen={false} 
                position="left"
              />
            </>
          )}
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}