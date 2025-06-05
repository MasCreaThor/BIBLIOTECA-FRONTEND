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
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Category {
    _id: string;
    name: string;
    description: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Location {
    _id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ResourceState {
    _id: string;
    name: 'good' | 'deteriorated' | 'damaged' | 'lost';
    description: string;
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
    type?: ResourceType;
    category?: Category;
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
    observations?: string;
    person?: Person;
    resource?: Resource;
    status?: LoanStatus;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateLoanRequest {
    personId: string;
    resourceId: string;
    quantity: number;
    observations?: string;
  }
  
  export interface ReturnLoanRequest {
    observations?: string;
    resourceCondition: 'good' | 'deteriorated' | 'damaged';
  }
  
  // Tipos para solicitudes
  export interface RequestStatus {
    _id: string;
    name: 'pending' | 'approved' | 'acquired' | 'rejected';
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Priority {
    _id: string;
    name: 'low' | 'medium' | 'high';
    value: number;
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
    category?: Category;
    priority?: Priority;
    status?: RequestStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface UsageStats {
    period: string;
    loans: number;
    returns: number;
    newResources: number;
    newPeople: number;
  }
  
  // Tipos para búsqueda y filtros
  export interface SearchFilters {
    search?: string;
    category?: string;
    status?: string;
    personType?: 'student' | 'teacher';
    resourceType?: 'book' | 'game' | 'map' | 'bible';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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
    apis: {
      people: boolean;
      resources: boolean;
      users: boolean;
    };
  }