// src/components/admin/index.ts
// Barrel export para todos los componentes de administración

// Navegación de administración
export { AdminNavigation } from './AdminNavigation';
export type { AdminQuickAction } from './AdminNavigation';

// Componentes de categorías
export { CategoryList, CategoryForm } from './categories';

// Componentes de ubicaciones
export { LocationList, LocationForm } from './locations';

// Componentes de tipos de recursos
export { ResourceTypeList, ResourceTypeForm } from './resourceTypes';

// Tipos relacionados (re-export de servicios)
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