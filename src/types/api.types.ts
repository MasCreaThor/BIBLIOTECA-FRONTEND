// src/types/api.types.ts - VERSIÓN ACTUALIZADA PARA GESTIÓN DE CANTIDADES
// ================================================================
// TIPOS BASE PARA RESPUESTAS DE API - CORREGIDO PARA PRÉSTAMOS
// ================================================================

// ===== TIPOS BASE DE RESPUESTA =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ===== TIPOS DE AUTENTICACIÓN =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    lastLogin: Date;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'librarian';
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TIPOS PARA PERSONAS =====
export interface PersonType {
  _id: string;
  name: 'student' | 'teacher';
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentNumber?: string;
  grade?: string;
  personTypeId: string;
  personType?: PersonType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  documentNumber?: string;
  grade?: string;
  personTypeId: string;
}

export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  grade?: string;
  personTypeId?: string;
  active?: boolean;
}

// ===== TIPOS PARA ENTIDADES AUXILIARES DE RECURSOS =====
export type ResourceTypeName = 'book' | 'game' | 'map' | 'bible' | (string & {});

export interface ResourceType {
  _id: string;
  name: ResourceTypeName;
  description: string;
  active: boolean;
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

// ===== TIPOS PARA RECURSOS - CORREGIDOS CON CAMPOS DE CANTIDAD =====
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

// ===== TIPOS DE RESPUESTA DE RECURSOS =====
export type ResourceResponse = ApiResponse<Resource>;
export type ResourceListResponse = ApiResponse<PaginatedResponse<Resource>>;

// ===== GOOGLE BOOKS INTEGRATION =====
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
  totalQuantity: number;           // ✅ Cantidad obligatoria
  volumes?: number;
  notes?: string;
  stateId?: string;
}

// ===== TIPOS PARA OPERACIONES ESPECÍFICAS =====

// Para importación masiva de recursos
export interface BulkResourceImport {
  resources: CreateResourceRequest[];
  options: {
    skipDuplicates: boolean;
    validateOnly: boolean;
    createMissingEntities: boolean;
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

// ✅ NUEVOS TIPOS PARA GESTIÓN DE DISPONIBILIDAD Y CANTIDADES
export interface AvailabilityUpdate {
  resourceId: string;
  available: boolean;
  reason?: string;
  updatedBy?: string;
}

// ✅ INTERFAZ ALTERNATIVA PARA COMPATIBILIDAD CON CÓDIGO EXISTENTE
export interface AvailabilityUpdateWithId {
  id: string;
  available: boolean;
  reason?: string;
  updatedBy?: string;
}

export interface QuantityUpdate {
  resourceId: string;
  newTotalQuantity: number;
  reason?: string;
  updatedBy?: string;
}

export interface StockAlert {
  resourceId: string;
  title: string;
  currentStock: number;
  totalQuantity: number;
  alertType: 'low_stock' | 'no_stock' | 'high_demand';
  threshold?: number;
}

// ===== TIPOS AUXILIARES DE RESPUESTA =====
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

// ===== ESTADÍSTICAS Y REPORTES =====
export interface ResourceStats {
  total: number;
  available: number;
  borrowed: number;
  byType: Array<{ type: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  stockStatus: {
    withStock: number;
    lowStock: number;
    noStock: number;
  };
  totalUnits: number;
  loanedUnits: number;
  availableUnits: number;
}

// ===== CONFIGURACIÓN DEL MÓDULO =====
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

// ===== FILTROS DE BÚSQUEDA =====
export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  active?: boolean;
  status?: 'active' | 'inactive' | 'all';
  personType?: string;
}