// src/utils/imageUtils.ts
import type { Resource, GoogleBooksVolume } from '@/types/resource.types';

/**
 * Utilidades para manejo de imágenes de recursos y Google Books
 */
export class ImageUtils {
  /**
   * Obtener la mejor URL de imagen para un recurso
   * Prioriza: imagen guardada en BD > imagen de Google Books
   */
  static getResourceImageUrl(resource: Resource, fallbackVolume?: GoogleBooksVolume): string | undefined {
    // 1. Priorizar imagen guardada en la base de datos
    if (resource.coverImageUrl) {
      return this.processImageUrl(resource.coverImageUrl);
    }

    // 2. Si hay un volumen de Google Books como fallback
    if (fallbackVolume?.imageLinks) {
      return this.getBestGoogleBooksImageUrl(fallbackVolume);
    }

    // 3. Si el recurso tiene googleBooksId pero no imagen guardada,
    // podríamos hacer una llamada a la API, pero por ahora retornamos undefined
    return undefined;
  }

  /**
   * Obtener la mejor URL de imagen de Google Books
   * Prioriza: large > medium > small > thumbnail
   */
  static getBestGoogleBooksImageUrl(volume: GoogleBooksVolume): string | undefined {
    if (!volume.imageLinks) {
      return undefined;
    }

    const { imageLinks } = volume;
    
    // Priorizar calidad de imagen de mayor a menor
    if (imageLinks.large) {
      return this.processImageUrl(imageLinks.large);
    }
    
    if (imageLinks.medium) {
      return this.processImageUrl(imageLinks.medium);
    }
    
    if (imageLinks.small) {
      return this.processImageUrl(imageLinks.small);
    }
    
    if (imageLinks.thumbnail) {
      return this.processImageUrl(imageLinks.thumbnail);
    }

    return undefined;
  }

  /**
   * Procesar URL de imagen para obtener mejor calidad y seguridad
   */
  static processImageUrl(url: string): string {
    if (!url) return url;

    let processedUrl = url;

    // Forzar HTTPS para seguridad
    if (processedUrl.startsWith('http://')) {
      processedUrl = processedUrl.replace('http://', 'https://');
    }

    // Si es una imagen de Google Books, optimizar
    if (processedUrl.includes('books.google.com')) {
      // Remover restricciones de tamaño para obtener mejor calidad
      processedUrl = processedUrl.replace(/&zoom=\d+/g, '');
      processedUrl = processedUrl.replace(/&w=\d+/g, '');
      processedUrl = processedUrl.replace(/&h=\d+/g, '');
      processedUrl = processedUrl.replace(/&edge=curl/g, '');
      
      // Asegurar que tenga el parámetro de portada
      if (!processedUrl.includes('&printsec=frontcover')) {
        processedUrl += '&printsec=frontcover';
      }
    }

    return processedUrl;
  }

  /**
   * Obtener URL de imagen de placeholder cuando no hay imagen disponible
   */
  static getPlaceholderImageUrl(type: 'book' | 'game' | 'map' | 'bible' = 'book'): string {
    // Usar un servicio de placeholder o imágenes estáticas
    const placeholders = {
      book: 'https://via.placeholder.com/150x200/e2e8f0/64748b?text=Libro',
      game: 'https://via.placeholder.com/150x200/fef3c7/d97706?text=Juego',
      map: 'https://via.placeholder.com/150x200/dcfce7/16a34a?text=Mapa',
      bible: 'https://via.placeholder.com/150x200/fce7f3/be185d?text=Biblia',
    };

    return placeholders[type] || placeholders.book;
  }

  /**
   * Validar si una URL de imagen es válida
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;

    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Obtener configuración de imagen responsiva para Chakra UI Image
   */
  static getResponsiveImageProps(coverImageUrl: string | undefined, alt: string) {
    return {
      src: coverImageUrl || undefined,
      alt,
      loading: 'lazy' as const,
      objectFit: 'cover' as const,
      fallback: undefined, // Se manejará con fallbackSrc
      fallbackSrc: this.getPlaceholderImageUrl(),
      onError: (e: any) => {
        console.warn('Error loading image:', coverImageUrl);
        // El fallbackSrc se activará automáticamente
      },
    };
  }

  /**
   * Crear srcSet para imágenes responsivas (si la fuente lo soporta)
   */
  static createSrcSet(baseUrl: string): string | undefined {
    if (!baseUrl || !baseUrl.includes('books.google.com')) {
      return undefined;
    }

    // Para Google Books, podemos crear diferentes tamaños
    const sizes = [
      { width: 150, suffix: '&w=150' },
      { width: 200, suffix: '&w=200' },
      { width: 300, suffix: '&w=300' },
    ];

    return sizes
      .map(size => `${baseUrl}${size.suffix} ${size.width}w`)
      .join(', ');
  }
}