// src/components/resources/index.ts
// Barrel export para todos los componentes de recursos

// Formularios
export { ResourceForm } from './ResourceForm';
export { BasicInfoSection, AuthorsSection, PublisherSection, MetadataSection } from './ResourceForm';

// Listas
export { ResourceList, ResourceCard, ResourceFilters } from './ResourceList';
export type { ResourceFiltersState } from './ResourceList/ResourceFilters';

// Google Books
export { GoogleBooksSearch, BookPreviewModal } from './GoogleBooks';
