// src/hooks/usePeople.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { PersonService } from '@/services/person.service';
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
 * Hook para obtener lista de personas con filtros
 */
export function usePeople(
  filters: SearchFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Person>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.peopleList(filters),
    queryFn: () => PersonService.getPeople(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
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
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.person(id),
    queryFn: () => PersonService.getPersonById(id),
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
    queryFn: () => PersonService.getPersonByDocument(documentNumber),
    enabled: enabled && !!documentNumber && documentNumber.length >= 6,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Hook para obtener tipos de persona
 */
export function usePersonTypes(
  options?: Omit<UseQueryOptions<PersonType[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.personTypes,
    queryFn: PersonService.getPersonTypes,
    staleTime: 30 * 60 * 1000, // 30 minutos - datos que cambian poco
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de personas
 */
export function usePersonStats(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof PersonService.getPersonStats>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEYS.personStats,
    queryFn: PersonService.getPersonStats,
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
    mutationFn: (data: CreatePersonRequest) => PersonService.createPerson(data),
    onSuccess: (newPerson) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.personStats });
      
      // Agregar a cache si es posible
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(newPerson._id),
        newPerson
      );

      toast.success(`${newPerson.fullName} registrado exitosamente`);
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
      PersonService.updatePerson(id, data),
    onSuccess: (updatedPerson) => {
      // Actualizar queries específicas
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(updatedPerson._id),
        updatedPerson
      );

      // Invalidar listas para refrescar
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      toast.success(`${updatedPerson.fullName} actualizado exitosamente`);
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
    mutationFn: (id: string) => PersonService.activatePerson(id),
    onSuccess: (activatedPerson) => {
      // Actualizar cache
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(activatedPerson._id),
        activatedPerson
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      toast.success(`${activatedPerson.fullName} activado exitosamente`);
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
    mutationFn: (id: string) => PersonService.deactivatePerson(id),
    onSuccess: (deactivatedPerson) => {
      // Actualizar cache
      queryClient.setQueryData(
        PEOPLE_QUERY_KEYS.person(deactivatedPerson._id),
        deactivatedPerson
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEYS.people });
      
      toast.success(`${deactivatedPerson.fullName} desactivado exitosamente`);
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
    mutationFn: (id: string) => PersonService.deletePerson(id),
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
    queryFn: () => PersonService.searchPeople(query, limit),
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
    queryFn: () => PersonService.validateDocumentNumber(documentNumber, excludeId),
    enabled: !!documentNumber && documentNumber.length >= 6,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}