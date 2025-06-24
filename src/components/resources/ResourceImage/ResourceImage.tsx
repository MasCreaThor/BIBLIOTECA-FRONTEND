// src/components/resources/ResourceImage/ResourceImage.tsx
'use client';

import { Image, Box, Skeleton } from '@chakra-ui/react';
import { useState } from 'react';
import { ImageUtils } from '@/utils/imageUtils';
import type { Resource, GoogleBooksVolume } from '@/types/resource.types';

interface ResourceImageProps {
  /** Recurso de la biblioteca */
  resource?: Resource;
  /** Volumen de Google Books como fallback */
  googleBooksVolume?: GoogleBooksVolume;
  /** Tamaño de la imagen */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Ancho personalizado */
  width?: string | number;
  /** Alto personalizado */
  height?: string | number;
  /** Texto alternativo */
  alt?: string;
  /** Border radius */
  borderRadius?: string;
  /** Si mostrar skeleton mientras carga */
  showSkeleton?: boolean;
  /** Callback cuando falla la carga */
  onError?: () => void;
  /** Props adicionales para el componente Image */
  imageProps?: any;
}

const SIZE_CONFIGS = {
  xs: { width: '60px', height: '80px' },
  sm: { width: '80px', height: '120px' },
  md: { width: '120px', height: '160px' },
  lg: { width: '150px', height: '200px' },
  xl: { width: '200px', height: '280px' },
};

export function ResourceImage({
  resource,
  googleBooksVolume,
  size = 'md',
  width,
  height,
  alt,
  borderRadius = 'md',
  showSkeleton = true,
  onError,
  imageProps = {},
}: ResourceImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determinar dimensiones
  const sizeConfig = SIZE_CONFIGS[size];
  const finalWidth = width || sizeConfig.width;
  const finalHeight = height || sizeConfig.height;

  // Obtener URL de imagen
  const imageUrl = resource 
    ? ImageUtils.getResourceImageUrl(resource, googleBooksVolume)
    : ImageUtils.getBestGoogleBooksImageUrl(googleBooksVolume!);

  // Determinar tipo de recurso para placeholder
  const resourceType = resource?.type?.name || 'book';

  // Cast seguro para tipos permitidos
  const allowedTypes = ['book', 'game', 'map', 'bible'] as const;
  const safeResourceType = allowedTypes.includes(resourceType as any)
    ? (resourceType as 'book' | 'game' | 'map' | 'bible')
    : undefined;

  // Obtener placeholder
  const placeholderUrl = ImageUtils.getPlaceholderImageUrl(safeResourceType);

  // Texto alternativo
  const imageAlt = alt || resource?.title || googleBooksVolume?.title || 'Imagen del recurso';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <Box 
      position="relative" 
      width={finalWidth} 
      height={finalHeight}
      borderRadius={borderRadius}
      overflow="hidden"
      bg="gray.100"
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <Skeleton 
          width="100%" 
          height="100%" 
          position="absolute" 
          top={0} 
          left={0} 
          zIndex={2}
        />
      )}

      {/* Imagen principal */}
      <Image
        src={hasError ? placeholderUrl : imageUrl || placeholderUrl}
        alt={imageAlt}
        width="100%"
        height="100%"
        objectFit="cover"
        onLoad={handleLoad}
        onError={handleError}
        opacity={isLoading ? 0 : 1}
        transition="opacity 0.3s ease"
        {...imageProps}
      />
    </Box>
  );
}

// Componente específico para cartas de recursos
export function ResourceCardImage({
  resource,
  googleBooksVolume,
  size = 'sm',
  ...props
}: Omit<ResourceImageProps, 'showSkeleton'>) {
  return (
    <ResourceImage
      resource={resource}
      googleBooksVolume={googleBooksVolume}
      size={size}
      showSkeleton={true}
      borderRadius="md"
      {...props}
    />
  );
}

// Componente para vista detallada
export function ResourceDetailImage({
  resource,
  googleBooksVolume,
  size = 'lg',
  ...props
}: Omit<ResourceImageProps, 'showSkeleton'>) {
  return (
    <ResourceImage
      resource={resource}
      googleBooksVolume={googleBooksVolume}
      size={size}
      showSkeleton={true}
      borderRadius="lg"
      {...props}
    />
  );
}

// Componente minimalista para listas
export function ResourceListImage({
  resource,
  googleBooksVolume,
  size = 'xs',
  ...props
}: Omit<ResourceImageProps, 'showSkeleton' | 'borderRadius'>) {
  return (
    <ResourceImage
      resource={resource}
      googleBooksVolume={googleBooksVolume}
      size={size}
      showSkeleton={false}
      borderRadius="sm"
      {...props}
    />
  );
}