// src/hooks/index.ts - ÍNDICE DE HOOKS
// ================================================================
// EXPORTACIÓN CENTRALIZADA DE TODOS LOS HOOKS PERSONALIZADOS
// ================================================================

// ===== RECURSOS =====
export * from './useResources';

// ===== ENTIDADES AUXILIARES =====
export * from './useCategories';
export * from './useAuthors';
export * from './usePublishers';
export * from './useLocations';
export * from './useResourceTypes';
export * from './useResourceStates';

// ===== TIPOS ESPECÍFICOS =====
export type {
  // Resources - desde resource.types.ts
  Resource,
  ResourceFilters,
  ResourceSearchFilters,
  ResourceManagementFilters,
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
  BulkResourceImport,
  BulkImportResult,
  ResourceReport,
  ResourceUsageStats,
  GoogleBooksIntegration,
  GoogleBooksSearchParams,
  ResourceValidation,
  ResourceModuleConfig,
} from '@/types/resource.types';

// Tipos adicionales desde api.types.ts
export type {
  QuantityUpdate,
  StockAlert,
  ResourceStats,
  AvailabilityUpdate,
} from '@/types/api.types';

export type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
} from './useCategories';

export type {
  CreateAuthorRequest,
  UpdateAuthorRequest,
  AuthorFilters,
} from './useAuthors';

export type {
  CreatePublisherRequest,
  UpdatePublisherRequest,
  PublisherFilters,
} from './usePublishers';

export type {
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationFilters,
} from './useLocations';

export type {
  CreateResourceTypeRequest,
  UpdateResourceTypeRequest,
  ResourceTypeFilters,
} from './useResourceTypes';

export type {
  CreateResourceStateRequest,
  UpdateResourceStateRequest,
  ResourceStateFilters,
} from './useResourceStates';

// ===== QUERY KEYS PARA USO EXTERNO =====
export {
  RESOURCE_QUERY_KEYS,
} from './useResources';

export {
  CATEGORY_QUERY_KEYS,
} from './useCategories';

export {
  AUTHOR_QUERY_KEYS,
} from './useAuthors';

export {
  PUBLISHER_QUERY_KEYS,
} from './usePublishers';

export {
  LOCATION_QUERY_KEYS,
} from './useLocations';

export {
  RESOURCE_TYPE_QUERY_KEYS,
} from './useResourceTypes';

export {
  RESOURCE_STATE_QUERY_KEYS,
} from './useResourceStates';

// Export hooks
export {
  useAuth,
} from './useAuth';

export {
  useChangePasswordModal,
} from './useChangePasswordModal';

export {
  useResources,
  useResource,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useResourceTypes,
  useCategories,
  useLocations,
  useAuthors,
  useResourceStats,
  useResourceByISBN,
  useResourcesForLoan,
  useResourceAvailability,
  useLowStockResources,
  useNoStockResources,
  useAdvancedResourceSearch,
  useUpdateResourceQuantity,
  useUpdateResourceAvailability,
  useCanResourceBeLent,
  useResourceStockManagement,
  useStockAlerts,
  usePrefetchResourceData,
} from './useResources';

export {
  usePeople,
  usePerson,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from './usePeople';

export {
  useLoans,
  useLoan,
} from './useLoans';

export {
  useGoogleBooks,
} from './useGoogleBooks';

// Export types
export type {
  PaginatedResponse,
  ApiResponse,
  SearchFilters,
} from '@/types/api.types';

export type {
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
  PersonType,
} from '@/types/api.types';

export type {
  Loan,
  CreateLoanRequest,
  UpdateLoanRequest,
} from '@/types/loan.types';