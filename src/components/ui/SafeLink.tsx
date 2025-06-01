'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box } from '@chakra-ui/react';

interface SafeLinkProps {
  href?: string | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
  [key: string]: any; // Para permitir props adicionales
}

/**
 * Componente Link seguro que previene errores cuando href es undefined
 */
export function SafeLink({ href, children, fallback, ...props }: SafeLinkProps) {
  // Validar que href sea una string válida
  const isValidHref = href && typeof href === 'string' && href.trim() !== '';
  
  if (!isValidHref) {
    // Si href no es válido, renderizar fallback o children sin Link
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Renderizar children en un Box para mantener estilos
    return (
      <Box as="span" {...props}>
        {children}
      </Box>
    );
  }
  
  // Renderizar Link normal si href es válido
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

// Hook personalizado para validar hrefs
export function useValidatedHref(href?: string | null | undefined): string | null {
  if (!href || typeof href !== 'string' || href.trim() === '') {
    return null;
  }
  return href;
}