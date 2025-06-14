// src/types/resource.types.ts
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
  coverImageUrl?: string;    // ✅ CORRECCIÓN: usar coverImageUrl
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
  coverImageUrl?: string;    // ✅ CORRECCIÓN: usar coverImageUrl
}

// ===== ENTIDADES AUXILIARES =====
export interface ResourceType {
  _id: string;
  name: 'book' | 'game' | 'map' | 'bible';
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
  };
}

export interface CreateResourceFromGoogleBooksRequest {
  googleBooksId: string;
  categoryId: string;
  locationId: string;
  volumes?: number;
  notes?: string;
}

// ===== FILTROS Y BÚSQUEDA =====
export interface ResourceFilters {
  search?: string;
  categoryId?: string;
  typeId?: string;
  locationId?: string;
  availability?: 'available' | 'borrowed';
  authorId?: string;
  available?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== RESPUESTAS DE LA API =====
export type ResourceResponse = ApiResponse<Resource>;
export type ResourceListResponse = ApiResponse<Resource[]>;
export type CategoryListResponse = ApiResponse<Category[]>;
export type AuthorListResponse = ApiResponse<Author[]>;
export type PublisherListResponse = ApiResponse<Publisher[]>;
export type LocationListResponse = ApiResponse<Location[]>;
export type ResourceTypeListResponse = ApiResponse<ResourceType[]>;
export type ResourceStateListResponse = ApiResponse<ResourceState[]>;
export type GoogleBooksSearchResponse = ApiResponse<GoogleBooksVolume[]>;