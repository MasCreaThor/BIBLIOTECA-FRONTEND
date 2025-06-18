// src/components/resources/index.ts
// Barrel export para todos los componentes de recursos

// Formularios
export { ResourceForm } from './ResourceForm';
export { BasicInfoSection, AuthorsSection, PublisherSection, MetadataSection } from './ResourceForm';

// Listas
export { ResourceList, ResourceCard, ResourceFiltersComponent } from './ResourceList';
export type { ResourceFiltersState } from './ResourceList/ResourceFilters';

// Google Books
export { GoogleBooksSearch, BookPreviewModal } from './GoogleBooks';

// Búsqueda de recursos
export { ResourceSearch } from './ResourceSearch/ResourceSearch';
0
// Dashboard de recursos
export { ResourceDashboard } from './ResourceDashboard';

// StockAlert
export { StockAlerts } from './StockAlerts';

// StockManagement
export { StockManagement } from './StockManagement';