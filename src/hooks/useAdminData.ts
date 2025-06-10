// src/hooks/useAdminData.ts
// Barrel export para todos los hooks de administración

// Re-export de hooks de categorías
export {
    useCategories,
    useCategory,
    useCategoryStats,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    CATEGORY_QUERY_KEYS,
  } from './useCategories';
  
  // Re-export de hooks de ubicaciones  
  export {
    useLocations,
    useLocation,
    useCreateLocation,
    useUpdateLocation,
    useDeleteLocation,
    LOCATION_QUERY_KEYS,
  } from './useLocations';
  
  // Re-export de hooks de tipos de recursos
  export {
    useResourceTypes,
    useResourceType,
    useResourceTypeStats,
    useCreateResourceType,
    useUpdateResourceType,
    useActivateResourceType,
    useDeactivateResourceType,
    useDeleteResourceType,
    RESOURCE_TYPE_QUERY_KEYS,
  } from './useResourceTypes';
  
  // Re-export de hooks de estados de recursos
  export {
    useResourceStates,
    useResourceState,
    useCreateResourceState,
    useUpdateResourceState,
    useActivateResourceState,
    useDeactivateResourceState,
    useDeleteResourceState,
    RESOURCE_STATE_QUERY_KEYS,
  } from './useResourceStates';
  
  // Re-export de tipos relacionados
  export type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CategoryFilters,
  } from '@/services/category.service';
  
  export type {
    Location,
    CreateLocationRequest,
    UpdateLocationRequest,
    LocationFilters,
  } from '@/services/location.service';
  
  export type {
    ResourceType,
    CreateResourceTypeRequest,
    UpdateResourceTypeRequest,
    ResourceTypeFilters,
  } from '@/services/resourceType.service';
  
  export type {
    ResourceState,
    CreateResourceStateRequest,
    UpdateResourceStateRequest,
    ResourceStateFilters,
  } from '@/services/resourceState.service';