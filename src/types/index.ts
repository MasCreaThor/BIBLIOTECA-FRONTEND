// types/index.ts - ACTUALIZADO para evitar conflictos de exportación

// Exportar tipos base de API
export type {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  User,
  PersonType,
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
  SearchFilters,
  QuantityUpdate,
  StockAlert,
  ResourceStats
} from './api.types';

// Exportar tipos específicos de recursos
export type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceType,
  Category,
  Author,
  Publisher,
  Location,
  ResourceState,
  GoogleBooksVolume,
  CreateResourceFromGoogleBooksRequest,
  ResourceFilters,
  ResourceSearchFilters,
  ResourceManagementFilters,
  ResourceResponse,
  ResourceListResponse,
  CategoryResponse,
  CategoryListResponse,
  AuthorResponse,
  AuthorListResponse,
  PublisherResponse,
  PublisherListResponse,
  LocationResponse,
  LocationListResponse,
  ResourceTypeResponse,
  ResourceTypeListResponse,
  ResourceStateResponse,
  ResourceStateListResponse,
  GoogleBooksSearchResponse,
  GoogleBooksVolumeResponse,
  BulkResourceImport,
  BulkImportResult,
  AvailabilityUpdate,
  AvailabilityCheck,
  ResourceReport,
  ResourceUsageStats,
  GoogleBooksIntegration,
  GoogleBooksSearchParams,
  ResourceValidation,
  ResourceModuleConfig
} from './resource.types';

// Exportar tipos de préstamos
export type {
  Loan,
  CreateLoanRequest,
  ReturnLoanRequest
} from './loan.types';

// Exportar tipos de reportes
export * from './reports.types';

// Exportar tipos del dashboard
export * from './dashboard.types';
