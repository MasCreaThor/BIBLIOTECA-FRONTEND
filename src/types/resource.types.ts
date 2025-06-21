// src/types/resource.types.ts - VERSIÓN CORREGIDA
import type { ApiResponse, PaginatedResponse } from './api.types';

// ===== INTERFACES PRINCIPALES =====
export interface Resource {
  _id: string;
  typeId: string;
  categoryId: string;
  title: string;
  authorIds: string[];
  publisherId?: string;
  volumes?: number;
  stateId: string;
  locationId: string;
  notes?: string;
  available: boolean;
  isbn?: string;
  googleBooksId?: string;
  coverImageUrl?: string;
  
  // ✅ CAMPOS DE CANTIDAD PARA GESTIÓN DE PRÉSTAMOS
  totalQuantity: number;           // Cantidad total disponible
  currentLoansCount: number;       // Cantidad actualmente prestada
  availableQuantity?: number;      // Cantidad disponible (calculada en backend)
  hasStock?: boolean;              // Si tiene stock disponible (calculado)
  
  // ✅ CAMPOS ADICIONALES PARA GESTIÓN
  totalLoans: number;              // Total de préstamos históricos
  lastLoanDate?: Date;             // Fecha del último préstamo
  
  // Datos populados (cuando están disponibles)
  type?: ResourceType;
  category?: Category;
  authors?: Author[];
  publisher?: Publisher;
  location?: Location;
  state?: ResourceState;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceRequest {
  typeId: string;
  categoryId: string;
  title: string;
  authorIds?: string[];
  publisherId?: string;
  volumes?: number;
  stateId: string;
  locationId: string;
  notes?: string;
  isbn?: string;
  googleBooksId?: string;
  coverImageUrl?: string;
  
  // ✅ CAMPO OBLIGATORIO: Cantidad total
  totalQuantity: number;
}

export interface UpdateResourceRequest {
  title?: string;
  categoryId?: string;
  authorIds?: string[];
  publisherId?: string;
  volumes?: number;
  locationId?: string;
  stateId?: string;
  notes?: string;
  available?: boolean;
  coverImageUrl?: string;
  isbn?: string;
  
  // ✅ PERMITIR ACTUALIZAR CANTIDAD TOTAL
  totalQuantity?: number;
}

// ===== ENTIDADES AUXILIARES =====
export interface ResourceType {
  _id: string;
  name: string;
  description: string;
  active: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  _id: string;
  name: string;
  biography?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Publisher {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  _id: string;
  name: string;
  description: string;
  code?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceState {
  _id: string;
  name: 'good' | 'deteriorated' | 'damaged' | 'lost';
  description: string;
  color: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== GOOGLE BOOKS =====
export interface GoogleBooksVolume {
  id: string;
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  categories?: string[];
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    smallThumbnail?: string;
  };
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export interface CreateResourceFromGoogleBooksRequest {
  googleBooksId: string;
  categoryId: string;
  locationId: string;
  volumes?: number;
  notes?: string;
  stateId?: string;
  typeId?: string;
  
  // ✅ NUEVO: Campo para cantidad total
  totalQuantity?: number;
}

// ===== FILTROS Y BÚSQUEDA =====
export interface ResourceFilters {
  search?: string;
  categoryId?: string;
  typeId?: string;
  locationId?: string;
  availability?: 'available' | 'borrowed' | 'all';
  authorId?: string;
  isbn?: string;
  googleBooksId?: string;
  stateId?: string;
  publisherId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // ✅ Filtros de cantidad
  hasStock?: boolean;              // Filtro por disponibilidad de stock
  minQuantity?: number;            // Cantidad mínima disponible
  
  // Filtros adicionales para búsquedas específicas
  hasISBN?: boolean;
  hasGoogleBooksId?: boolean;
  minVolumes?: number;
  maxVolumes?: number;
  
  // Para compatibilidad con componentes antiguos
  available?: boolean; // Se mapea automáticamente a availability
}

// Filtros específicos para diferentes contextos
export interface ResourceSearchFilters extends ResourceFilters {
  // Filtros específicos para búsqueda de recursos en formularios
  onlyAvailable?: boolean;
  excludeIds?: string[];
  includeInactive?: boolean;
}

export interface ResourceManagementFilters extends ResourceFilters {
  // Filtros para gestión administrativa
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  createdBy?: string;
  lastUpdatedBy?: string;
  
  // ✅ Filtros de stock
  lowStock?: boolean;              // Recursos con poco stock
  noStock?: boolean;               // Recursos sin stock
}

// ===== RESPUESTAS DE LA API =====
export type ResourceResponse = ApiResponse<Resource>;
export type ResourceListResponse = ApiResponse<PaginatedResponse<Resource>>;
export type CategoryResponse = ApiResponse<Category>;
export type CategoryListResponse = ApiResponse<Category[]>;
export type AuthorResponse = ApiResponse<Author>;
export type AuthorListResponse = ApiResponse<Author[]>;
export type PublisherResponse = ApiResponse<Publisher>;
export type PublisherListResponse = ApiResponse<Publisher[]>;
export type LocationResponse = ApiResponse<Location>;
export type LocationListResponse = ApiResponse<Location[]>;
export type ResourceTypeResponse = ApiResponse<ResourceType>;
export type ResourceTypeListResponse = ApiResponse<ResourceType[]>;
export type ResourceStateResponse = ApiResponse<ResourceState>;
export type ResourceStateListResponse = ApiResponse<ResourceState[]>;
export type GoogleBooksSearchResponse = ApiResponse<GoogleBooksVolume[]>;
export type GoogleBooksVolumeResponse = ApiResponse<GoogleBooksVolume>;

// ===== TIPOS PARA OPERACIONES ESPECÍFICAS =====

// Para importación masiva de recursos
export interface BulkResourceImport {
  resources: CreateResourceRequest[];
  options: {
    skipDuplicates: boolean;
    validateOnly: boolean;
    createMissingEntities: boolean; // Crear autores, categorías, etc. si no existen
  };
}

export interface BulkImportResult {
  successful: Resource[];
  failed: Array<{
    resource: CreateResourceRequest;
    error: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  createdEntities: {
    authors: Author[];
    publishers: Publisher[];
    categories: Category[];
  };
}

// Para operaciones de disponibilidad
export interface AvailabilityUpdate {
  resourceId: string;
  available: boolean;
  reason?: string;
  updatedBy?: string;
}

export interface AvailabilityCheck {
  resourceId: string;
  available: boolean;
  totalQuantity: number;
  currentLoans: number;
  availableQuantity: number;
  hasStock: boolean;
  canLoan: boolean;
  maxConcurrentLoans: number;
}

// Para reportes de recursos
export interface ResourceReport {
  totalResources: number;
  availableResources: number;
  borrowedResources: number;
  resourcesByType: Array<{
    type: ResourceType;
    count: number;
    available: number;
  }>;
  resourcesByCategory: Array<{
    category: Category;
    count: number;
    available: number;
  }>;
  resourcesByLocation: Array<{
    location: Location;
    count: number;
    available: number;
  }>;
  resourcesByState: Array<{
    state: ResourceState;
    count: number;
  }>;
  topAuthors: Array<{
    author: Author;
    resourceCount: number;
    loanCount: number;
  }>;
  recentlyAdded: Resource[];
  frequentlyBorrowed: Array<{
    resource: Resource;
    loanCount: number;
    averageRating?: number;
  }>;
}

// Para estadísticas de uso
export interface ResourceUsageStats {
  resourceId: string;
  title: string;
  totalLoans: number;
  currentlyBorrowed: boolean;
  averageLoanDuration: number;
  popularityRank: number;
  lastBorrowed?: Date;
  borrowingTrends: Array<{
    period: string;
    loanCount: number;
  }>;
}

// Para integración con Google Books
export interface GoogleBooksIntegration {
  isEnabled: boolean;
  apiKey?: string;
  lastSync?: Date;
  dailyQuota: {
    used: number;
    limit: number;
    remaining: number;
  };
  statistics: {
    resourcesImported: number;
    lastImport?: Date;
    failedImports: number;
  };
}

export interface GoogleBooksSearchParams {
  query: string;
  maxResults?: number;
  startIndex?: number;
  filter?: 'ebooks' | 'free-ebooks' | 'full' | 'paid-ebooks' | 'partial';
  orderBy?: 'newest' | 'relevance';
  langRestrict?: string;
  printType?: 'all' | 'books' | 'magazines';
}

// Para validaciones específicas de recursos
export interface ResourceValidation {
  title: {
    isValid: boolean;
    minLength: number;
    maxLength: number;
  };
  isbn: {
    isValid: boolean;
    format: 'ISBN-10' | 'ISBN-13' | 'invalid';
    checksum: boolean;
  };
  authors: {
    isValid: boolean;
    minAuthors: number;
    maxAuthors: number;
    validAuthorIds: string[];
    invalidAuthorIds: string[];
  };
  category: {
    isValid: boolean;
    exists: boolean;
    active: boolean;
  };
  location: {
    isValid: boolean;
    exists: boolean;
    active: boolean;
    capacity?: {
      current: number;
      maximum: number;
      available: number;
    };
  };
}

// Para configuraciones del módulo de recursos
export interface ResourceModuleConfig {
  validation: {
    requireISBN: boolean;
    requireAuthors: boolean;
    requirePublisher: boolean;
    allowDuplicateTitles: boolean;
    maxAuthorsPerResource: number;
    minTotalQuantity: number;        // ✅ Cantidad mínima obligatoria
    maxTotalQuantity: number;        // ✅ Cantidad máxima permitida
  };
  features: {
    googleBooksEnabled: boolean;
    bulkImportEnabled: boolean;
    advancedSearchEnabled: boolean;
    reservationsEnabled: boolean;
    stockAlertsEnabled: boolean;     // ✅ Alertas de stock
  };
  defaults: {
    loanDuration: number;
    maxConcurrentLoans: number;
    defaultStateId: string;
    defaultLocationId: string;
    defaultTotalQuantity: number;    // ✅ Cantidad por defecto
    lowStockThreshold: number;       // ✅ Umbral de stock bajo
  };
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    enabledFilters: string[];
    defaultSortBy: string;
    defaultSortOrder: 'asc' | 'desc';
    showStockIndicators: boolean;    // ✅ Mostrar indicadores de stock
  };
}