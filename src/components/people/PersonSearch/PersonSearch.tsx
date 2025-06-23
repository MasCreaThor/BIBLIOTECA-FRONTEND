// src/components/people/PersonSearch/PersonSearch.tsx - VERSIÓN CORREGIDA
'use client';

import {
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Avatar,
  Box,
  List,
  ListItem,
  Spinner,
  useColorModeValue,
  Badge,
  Alert,
  AlertIcon,
  Icon,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Person, SearchFilters } from '@/types/api.types';
import { PersonService } from '@/services/person.service';
import { useDebounce } from '@/hooks/useDebounce';
import { getPersonTypeLabel } from '@/utils/personType.utils';

interface PersonSearchProps {
  onPersonSelected: (person: Person | null) => void;
  selectedPerson: Person | null;
  placeholder?: string;
  isDisabled?: boolean;
  filterActive?: boolean;
}

export function PersonSearch({
  onPersonSelected,
  selectedPerson,
  placeholder = "Buscar persona (mínimo 2 caracteres)...",
  isDisabled = false,
  filterActive = true,
}: PersonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMouseInList, setIsMouseInList] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // 🔧 SOLUCIÓN: Agregar ref para controlar el timeout del blur
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const errorBorderColor = useColorModeValue('red.300', 'red.500');

  // Inicializar con persona seleccionada si existe
  useEffect(() => {
    if (selectedPerson && !searchTerm) {
      const fullName = selectedPerson.fullName || `${selectedPerson.firstName} ${selectedPerson.lastName}`;
      setSearchTerm(fullName);
    }
  }, [selectedPerson]);

  // 🔧 SOLUCIÓN: Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Búsqueda de personas con manejo de errores mejorado
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      
      const filters: SearchFilters = {
        search: debouncedSearchTerm,
        limit: 10,
      };
      
      if (filterActive) {
        filters.status = 'active';
      }

      console.log('🔍 PersonSearch: Iniciando búsqueda:', { 
        term: debouncedSearchTerm, 
        filters 
      });

      PersonService.getPeople(filters)
        .then((response) => {
          console.log('✅ PersonSearch: Resultados obtenidos:', {
            count: response.data?.length || 0,
            total: response.pagination?.total || 0
          });
          
          setResults(response.data || []);
          setIsOpen(true);
          setSelectedIndex(-1);
          setError(null);
        })
        .catch((error) => {
          console.error('❌ PersonSearch: Error en búsqueda:', error);
          setResults([]);
          setIsOpen(false);
          
          let errorMessage = 'Error al buscar personas.';
          
          if (!error.response) {
            errorMessage = 'Error de conexión. Verifica que el servidor esté disponible.';
          } else if (error.response.status === 500) {
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
          } else if (error.response.status === 403) {
            errorMessage = 'No tienes permisos para buscar personas.';
          } else if (error.response.status === 404) {
            errorMessage = 'Servicio de personas no disponible.';
          }
          
          setError(errorMessage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      setError(null);
      if (debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 2) {
        setError('Escribe al menos 2 caracteres para buscar');
      }
    }
  }, [debouncedSearchTerm, filterActive]);

  const handleSelect = (person: Person) => {
    console.log('✅ PersonSearch: Persona seleccionada:', {
      id: person._id,
      name: person.fullName || `${person.firstName} ${person.lastName}`
    });
    
    // 🔧 SOLUCIÓN: Cancelar timeout pendiente
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    onPersonSelected(person);
    const fullName = person.fullName || `${person.firstName} ${person.lastName}`;
    setSearchTerm(fullName);
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
    setError(null);
    // 🔧 NUEVO: Resetear hasSearched para evitar mensaje de error
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 🔧 SOLUCIÓN: Mejorar handleBlur con control de timeout
  const handleBlur = () => {
    // Limpiar timeout anterior si existe
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Aumentar el delay y usar ref para poder cancelarlo
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
      blurTimeoutRef.current = null;
    }, 150); // Reducido a 150ms para mejor UX
  };

  // 🔧 SOLUCIÓN: Agregar función para cancelar blur cuando se hace hover
  const handleMouseEnterList = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    setHasSearched(false);
    onPersonSelected(null);
    inputRef.current?.focus();
  };

  const handleRetry = () => {
    setError(null);
    if (debouncedSearchTerm.length >= 2) {
      const event = new Event('input', { bubbles: true });
      if (inputRef.current) {
        inputRef.current.dispatchEvent(event);
      }
    }
  };

  const getInputBorderColor = () => {
    if (error) return errorBorderColor;
    if (selectedPerson) return 'green.300';
    return borderColor;
  };

  return (
    <Box position="relative">
      <InputGroup>
        <InputLeftElement>
          {isLoading ? (
            <Spinner size="sm" color="blue.500" />
          ) : (
            <Icon as={FiSearch} color="gray.400" />
          )}
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          isDisabled={isDisabled}
          borderColor={getInputBorderColor()}
          _hover={{
            borderColor: error ? errorBorderColor : 'gray.300'
          }}
          _focus={{
            borderColor: error ? errorBorderColor : 'blue.500',
            boxShadow: error ? '0 0 0 1px red' : '0 0 0 1px blue'
          }}
        />
      </InputGroup>

      {/* Botón de limpiar cuando hay persona seleccionada */}
      {selectedPerson && (
        <Button
          position="absolute"
          right={2}
          top="50%"
          transform="translateY(-50%)"
          size="xs"
          variant="ghost"
          onClick={handleClear}
          zIndex={2}
        >
          ✕
        </Button>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert status="error" size="sm" mt={2} borderRadius="md">
          <AlertIcon />
          <VStack spacing={1} align="start" flex={1}>
            <Text fontSize="sm">{error}</Text>
            {(error.includes('conexión') || error.includes('servidor')) && (
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={handleRetry}
                colorScheme="red"
              >
                Reintentar
              </Button>
            )}
          </VStack>
        </Alert>
      )}

      {/* Mensaje cuando no hay resultados */}
      {hasSearched && !isLoading && results.length === 0 && !error && debouncedSearchTerm.length >= 2 && !selectedPerson && (
        <Alert status="info" size="sm" mt={2} borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            No se encontraron personas que coincidan con "{debouncedSearchTerm}"
          </Text>
        </Alert>
      )}

      {/* Persona seleccionada */}
      {selectedPerson && !isOpen && (
        <Box
          mt={2}
          p={2}
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          borderRadius="md"
        >
          <HStack spacing={2}>
            <Avatar 
              size="xs" 
              name={selectedPerson.fullName || `${selectedPerson.firstName} ${selectedPerson.lastName}`}
              bg="green.500"
            />
            <VStack spacing={0} align="start" flex={1}>
              <Text fontSize="sm" fontWeight="medium" color="green.700">
                Persona seleccionada
              </Text>
              <Text fontSize="xs" color="green.600">
                {selectedPerson.documentNumber} • {selectedPerson.grade || 'Sin grado'}
              </Text>
            </VStack>
            <Badge colorScheme="green" size="sm">
              ✓ Seleccionada
            </Badge>
          </HStack>
        </Box>
      )}

      {/* Lista de resultados */}
      {isOpen && results.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          mt={1}
          // 🔧 SOLUCIÓN: Agregar onMouseEnter para cancelar blur
          onMouseEnter={handleMouseEnterList}
        >
          <List ref={listRef}>
            {results.map((person, index) => (
              <ListItem
                key={person._id}
                p={3}
                cursor="pointer"
                bg={index === selectedIndex ? selectedBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                // 🔧 SOLUCIÓN: Usar onMouseDown en lugar de onClick
                onMouseDown={(e) => {
                  e.preventDefault(); // Evitar que el input pierda foco
                  handleSelect(person);
                }}
                borderBottom={index < results.length - 1 ? '1px solid' : 'none'}
                borderBottomColor={borderColor}
              >
                <HStack spacing={3}>
                  <Avatar 
                    size="sm" 
                    name={person.fullName || `${person.firstName} ${person.lastName}`}
                    bg="blue.500"
                  />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontWeight="medium" fontSize="sm">
                      {person.fullName || `${person.firstName} ${person.lastName}`}
                    </Text>
                    <HStack spacing={2} fontSize="xs" color="gray.600">
                      <Text>{person.documentNumber}</Text>
                      {person.grade && (
                        <>
                          <Text color="gray.400">•</Text>
                          <Text>{person.grade}</Text>
                        </>
                      )}
                      {person.personType && (
                        <>
                          <Text color="gray.400">•</Text>
                          <Text>{getPersonTypeLabel(person.personType.name)}</Text>
                        </>
                      )}
                    </HStack>
                  </VStack>
                  <VStack spacing={1}>
                    <Badge 
                      colorScheme={person.active ? 'green' : 'red'} 
                      size="sm"
                      variant="subtle"
                    >
                      {person.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </VStack>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}