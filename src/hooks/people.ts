// src/hooks/people.ts
// Re-export de todos los hooks relacionados con personas
export {
    usePeople,
    usePerson,
    usePersonByDocument,
    usePersonTypes,
    usePersonStats,
    useCreatePerson,
    useUpdatePerson,
    useActivatePerson,
    useDeactivatePerson,
    useDeletePerson,
    useSearchPeople,
    useValidateDocument,
    PEOPLE_QUERY_KEYS,
  } from './usePeople';
  
  // Re-export de tipos relacionados
  export type {
    Person,
    PersonType,
    CreatePersonRequest,
    UpdatePersonRequest,
  } from '@/types/api.types';