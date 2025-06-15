// src/types/api.types.ts - VERSIÓN CORREGIDA
// Tipos base para respuestas de API
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

// Tipos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    lastLogin: Date;
  };
}

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'librarian';
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para personas
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

// Tipos para recursos
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
  googleBooksId?: string;
  available: boolean;
  isbn?: string;
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

// Tipos para préstamos
export interface LoanStatus {
  _id: string;
  name: 'active' | 'returned' | 'overdue' | 'lost';
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  _id: string;
  personId: string;
  resourceId: string;
  quantity: number;
  loanDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  statusId: string;
  loanedBy: string;
  returnedBy?: string;
  observations?: string;
  
  // Datos populados (cuando están disponibles)
  person?: Person;
  resource?: Resource;
  status?: LoanStatus;
  loanedByUser?: User;
  returnedByUser?: User;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoanRequest {
  personId: string;
  resourceId: string;
  quantity?: number;
  observations?: string;
}

export interface ReturnLoanRequest {
  loanId: string;
  observations?: string;
  resourceCondition?: 'good' | 'deteriorated' | 'damaged';
}

// Tipos para verificación de préstamos
export interface CanBorrowResult {
  canBorrow: boolean;
  reason?: string;
  activeLoans?: number;
  maxLoans?: number;
  overdueLoans?: number;
}

// Tipos para solicitudes
export interface RequestStatus {
  _id: string;
  name: 'pending' | 'approved' | 'acquired' | 'rejected';
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Priority {
  _id: string;
  name: 'low' | 'medium' | 'high';
  value: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  _id: string;
  title: string;
  authorIds: string[];
  categoryId: string;
  subjectId: string;
  requestDate: Date;
  priorityId: string;
  statusId: string;
  googleBooksInfo?: object;
  requestedBy: string;
  
  // Datos populados
  category?: Category;
  priority?: Priority;
  status?: RequestStatus;
  requestedByUser?: User;
  
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para búsqueda y filtros
export interface SearchFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  personType?: 'student' | 'teacher';
  resourceType?: 'book' | 'game' | 'map' | 'bible';
  availability?: 'available' | 'borrowed';
  grade?: string;
  documentNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos específicos para diferentes búsquedas
export interface PersonSearchFilters extends Omit<SearchFilters, 'availability' | 'resourceType'> {
  personType?: 'student' | 'teacher';
  grade?: string;
  documentNumber?: string;
}

export interface ResourceSearchFilters extends Omit<SearchFilters, 'personType' | 'grade' | 'documentNumber'> {
  categoryId?: string;
  typeId?: string;
  locationId?: string;
  availability?: 'available' | 'borrowed';
  authorId?: string;
}

export interface LoanSearchFilters extends SearchFilters {
  personId?: string;
  resourceId?: string;
  statusId?: string;
  isOverdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// Google Books API types
export interface GoogleBookInfo {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookInfo[];
}

// Tipos para errores
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

// Tipos para estadísticas y dashboard
export interface DashboardStats {
  totalResources: number;
  activeLoans: number;
  overdueLoans: number;
  totalPeople: number;
  recentActivity: {
    loans: number;
    returns: number;
    newResources: number;
    newPeople: number;
  };
}

export interface UsageStats {
  period: string;
  loans: number;
  returns: number;
  newResources: number;
  newPeople: number;
}

export interface DetailedStats {
  people: {
    total: number;
    students: number;
    teachers: number;
    byGrade: Array<{ grade: string; count: number }>;
  };
  resources: {
    total: number;
    available: number;
    borrowed: number;
    byType: Array<{ type: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
  loans: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
    byMonth: Array<{ month: string; count: number }>;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    librarians: number;
  };
}

export interface SystemHealth {
  backend: boolean;
  database: boolean;
  apis: {
    people: boolean;
    resources: boolean;
    loans: boolean;
    users: boolean;
    googleBooks?: boolean;
  };
  lastCheck: Date;
}

// Tipos para operaciones comunes
export interface BulkOperation<T> {
  items: T[];
  operation: 'create' | 'update' | 'delete';
  options?: {
    validateOnly?: boolean;
    skipDuplicates?: boolean;
    continueOnError?: boolean;
  };
}

export interface BulkOperationResult<T> {
  success: T[];
  errors: Array<{
    item: T;
    error: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

// Tipos para validaciones
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para configuración del sistema
export interface SystemConfiguration {
  library: {
    name: string;
    maxLoansPerPerson: number;
    loanDurationDays: number;
    allowRenewals: boolean;
    maxRenewals: number;
  };
  notifications: {
    emailEnabled: boolean;
    overdueReminders: boolean;
    daysBeforeOverdue: number;
  };
  features: {
    googleBooksEnabled: boolean;
    requestsEnabled: boolean;
    reportsEnabled: boolean;
  };
}