// src/hooks/usePeople.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { personService } from '@/services/person.service';
import type { 
  Person, 
  PersonType, 
  CreatePersonRequest, 
  UpdatePersonRequest, 
  PaginatedResponse,
  SearchFilters 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// Query keys para React Query
export const PEOPLE_QUERY_KEYS = {
  people: ['people'] as const,
  peopleList: (filters: SearchFilters) => ['people', 'list', filters] as const,
  person: (id: string) => ['people', 'detail', id] as const,
  personByDocument: (document: string) => ['people', 'document', document] as const,
  personTypes: ['people', 'types'] as const,
  personStats: ['people', 'stats'] as const,
} as const;

/**
 * Utilidad para construir nombre completo con fallback
 */
const getPersonFullName = (person: { fullName?: string; firstName: string; lastName: string }): string => {
  return person.fullName || `${person.firstName} ${person.lastName}`;
};

/**
 * Utilidad para enriquecer personas con tipos cuando falla el populate
 */
const enrichPeopleWithTypes = (people: Person[], personTypes: PersonType[]): Person[] => {
  return people.map(person => {
    // Si ya tiene personType poblado, devolverlo tal como está
    if (person.personType) return person;
    
    // Si no, buscar el tipo por personTypeId
    if (person.personTypeId && personTypes) {
      const personType = personTypes.find(type => type._id === person.personTypeId);
      if (personType) {
        return { 
          ...person, 
          personType
        };
      }
    }
    
    return person;
  });
};

/**
 * Hook para obtener lista de personas con filtros y manejo de errores mejorado
 */
export function usePeople(
  filters: SearchFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Person>>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.peopleList(filters),
    queryFn: async () => {
      try {
        return await personService.getPeople(filters);
      } catch (error: any) {
        // Si hay error de populate, intentar obtener tipos por separado
        if (error?.response?.status === 500 && 
            error?.response?.data?.message?.includes('populate')) {
          
          console.warn('Error de populate detectado, enriqueciendo datos manualmente...');
          
          // Obtener personas sin populate si es posible
          const basicResponse = await personService.getPeople({ ...filters, populate: false } as any);
          
          // Obtener tipos de persona por separado
          const personTypes = queryClient.getQueryData(PEOPLE_QUERY_KEYS.personTypes) as PersonType[];
          
          if (personTypes) {
            const enrichedData = enrichPeopleWithTypes(basicResponse.data, personTypes);
            return {
              ...basicResponse,
              data: enrichedData,
            };
          }
          
          return basicResponse;
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // No reintentar en errores 400-499 (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

/**
 * Hook para obtener una persona por ID
 */
export function usePerson(
  id: string,
  options?: Omit<UseQueryOptions<Person>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.person(id),
    queryFn: async () => {
      try {
        return await personService.getPersonById(id);
      } catch (error: any) {
        // Si hay error de populate, intentar enriquecer manualmente
        if (error?.response?.status === 500) {
          const personTypes = queryClient.getQueryData(PEOPLE_QUERY_KEYS.personTypes) as PersonType[];
          
          if (personTypes) {
            // Intentar obtener datos básicos de la persona
            const basicPerson = await personService.getPersonById(id);
            const enrichedPeople = enrichPeopleWithTypes([basicPerson], personTypes);
            return enrichedPeople[0];
          }
        }
        
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para buscar persona por documento
 */
export function usePersonByDocument(
  documentNumber: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<Person>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.personByDocument(documentNumber),
    queryFn: () => personService.getPersonByDocument(documentNumber),
    enabled: enabled && !!documentNumber && documentNumber.length >= 6,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Hook para obtener tipos de persona con precarga automática
 */
export function usePersonTypes(
  options?: Omit<UseQueryOptions<PersonType[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.personTypes,
    queryFn: personService.getPersonTypes,
    staleTime: 30 * 60 * 1000, // 30 minutos - datos que cambian poco
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnMount: false, // No refetch automático ya que son datos estables
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de personas con manejo de errores mejorado
 */
export function usePersonStats(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof personService.getPersonStats>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.personStats,
    queryFn: async () => {
      try {
        return await personService.getPersonStats();
      } catch (error: any) {
        // Si hay error, devolver estadísticas básicas
        console.error('Error obteniendo estadísticas de personas:', error);
        
        // Intentar calcular estadísticas básicas desde el cache
        const queryClient = useQueryClient();
        const allPeopleQueries = queryClient.getQueriesData({ 
          queryKey: ['people', 'list'] 
        });
        
        if (allPeopleQueries.length > 0) {
          // Usar datos del cache para calcular estadísticas aproximadas
          const cachedResponse = allPeopleQueries[0][1] as PaginatedResponse<Person> | undefined;
          if (cachedResponse) {
            const people = cachedResponse.data;
            const students = people.filter(p => 
              p.personType?.name === 'student' || 
              (!p.personType && p.grade) // Fallback para estudiantes
            ).length;
            const teachers = people.filter(p => 
              p.personType?.name === 'teacher' ||
              (!p.personType && !p.grade) // Fallback para docentes
            ).length;
            
            return {
              total: cachedResponse.pagination.total,
              students,
              teachers,
              byGrade: [], // No calculamos byGrade desde cache por simplicidad
            };
          }
        }
        
        // Fallback final
        return {
          total: 0,
          students: 0,
          teachers: 0,
          byGrade: [],
        };
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear una nueva persona
 */
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonRequest) => personService.createPerson(data),
    onSuccess: (newPerson) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.personStats });
      
      // Agregar a cache si es posible
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(newPerson._id),
        newPerson
      );

      // Construir nombre completo para el toast
      const fullName = getPersonFullName(newPerson);
      toast.success(`${fullName} registrado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al registrar persona';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar una persona
 */
export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonRequest }) => 
      personService.updatePerson(id, data),
    onSuccess: (updatedPerson) => {
      // Actualizar queries específicas
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(updatedPerson._id),
        updatedPerson
      );

      // Invalidar listas para refrescar
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      // Construir nombre completo para el toast
      const fullName = getPersonFullName(updatedPerson);
      toast.success(`${fullName} actualizado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar persona';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para activar una persona
 */
export function useActivatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personService.activatePerson(id),
    onSuccess: (activatedPerson) => {
      // Actualizar cache
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(activatedPerson._id),
        activatedPerson
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      // Construir nombre completo para el toast
      const fullName = getPersonFullName(activatedPerson);
      toast.success(`${fullName} activado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al activar persona';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para desactivar una persona
 */
export function useDeactivatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personService.deactivatePerson(id),
    onSuccess: (deactivatedPerson) => {
      // Actualizar cache
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(deactivatedPerson._id),
        deactivatedPerson
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      // Construir nombre completo para el toast
      const fullName = getPersonFullName(deactivatedPerson);
      toast.success(`${fullName} desactivado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al desactivar persona';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar una persona permanentemente
 */
export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personService.deletePerson(id),
    onSuccess: (_, deletedId) => {
      // Remover de cache
      queryClient.removeQueries({ queryKey: PEOPLE_QUERY_KEYS.person(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.personStats });
      
      toast.success('Persona eliminada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar persona';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para búsqueda simple de personas
 */
export function useSearchPeople(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ['people', 'search', query, limit],
    queryFn: () => personService.searchPeople(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}

/**
 * Hook para validar documento único
 */
export function useValidateDocument(documentNumber: string, excludeId?: string) {
  return useQuery({
    queryKey: ['people', 'validate-document', documentNumber, excludeId],
    queryFn: () => personService.validateDocumentNumber(documentNumber, excludeId),
    enabled: !!documentNumber && documentNumber.length >= 6,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}