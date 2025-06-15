// src/components/resources/ResourceSearch/ResourceSearch.tsx - VERSIÓN CORREGIDA
'use client';

import {
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Box,
  List,
  ListItem,
  Spinner,
  useColorModeValue,
  Badge,
  Image,
  Alert,
  AlertIcon,
  Icon,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiBook, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Resource, ResourceFilters } from '@/types/resource.types';
import { ResourceService } from '@/services/resource.service';
import { useDebounce } from '@/hooks/useDebounce';

interface ResourceSearchProps {
  onSelect: (resource: Resource | null) => void;
  selectedResource?: Resource | null;
  placeholder?: string;
  isDisabled?: boolean;
  filterAvailable?: boolean;
  showOnlyAvailable?: boolean;
}

export function ResourceSearch({
  onSelect,
  selectedResource = null,
  placeholder = "Buscar recurso (mínimo 2 caracteres)...",
  isDisabled = false,
  filterAvailable = false,
  showOnlyAvailable = true,
}: ResourceSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  // Inicializar con recurso seleccionado si existe
  useEffect(() => {
    if (selectedResource && !searchTerm) {
      setSearchTerm(selectedResource.title);
    }
  }, [selectedResource]);

  // 🔧 SOLUCIÓN: Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Búsqueda de recursos con manejo de errores mejorado
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      
      const filters: ResourceFilters = {
        search: debouncedSearchTerm,
        limit: 10,
      };
      
      if (filterAvailable || showOnlyAvailable) {
        filters.availability = 'available';
      }

      console.log('🔍 ResourceSearch: Iniciando búsqueda:', { 
        term: debouncedSearchTerm, 
        filters 
      });

      ResourceService.getResources(filters)
        .then((response) => {
          console.log('✅ ResourceSearch: Resultados obtenidos:', {
            count: response.data?.length || 0,
            total: response.pagination?.total || 0,
            success: true
          });
          
          setResults(response.data || []);
          setIsOpen(true);
          setSelectedIndex(-1);
          setError(null);
        })
        .catch((error) => {
          console.error('❌ ResourceSearch: Error en búsqueda:', error);
          setResults([]);
          setIsOpen(false);
          
          let errorMessage = 'Error al buscar recursos.';
          
          if (!error.response) {
            errorMessage = 'Error de conexión. Verifica que el servidor esté disponible.';
          } else if (error.response.status === 500) {
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
          } else if (error.response.status === 403) {
            errorMessage = 'No tienes permisos para buscar recursos.';
          } else if (error.response.status === 404) {
            errorMessage = 'Servicio de recursos no disponible.';
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
  }, [debouncedSearchTerm, filterAvailable, showOnlyAvailable]);

  const handleSelect = (resource: Resource) => {
    console.log('✅ ResourceSearch: Recurso seleccionado:', {
      id: resource._id,
      title: resource.title,
      available: resource.available
    });
    
    // 🔧 SOLUCIÓN: Cancelar timeout pendiente
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    onSelect(resource);
    setSearchTerm(resource.title);
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
    onSelect(null);
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
    if (selectedResource) return 'green.300';
    return borderColor;
  };

  const getAvailabilityBadgeColor = (available: boolean) => {
    return available ? 'green' : 'red';
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

      {/* Botón de limpiar cuando hay recurso seleccionado */}
      {selectedResource && (
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
      {hasSearched && !isLoading && results.length === 0 && !error && debouncedSearchTerm.length >= 2 && !selectedResource && (
        <Alert status="info" size="sm" mt={2} borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            No se encontraron recursos que coincidan con "{debouncedSearchTerm}"
          </Text>
        </Alert>
      )}

      {/* Recurso seleccionado */}
      {selectedResource && !isOpen && (
        <Box
          mt={2}
          p={2}
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          borderRadius="md"
        >
          <HStack spacing={2}>
            <Box flexShrink={0}>
              {selectedResource.coverImageUrl ? (
                <Image
                  src={selectedResource.coverImageUrl}
                  alt={selectedResource.title}
                  boxSize="24px"
                  objectFit="cover"
                  borderRadius="sm"
                />
              ) : (
                <Icon as={FiBook} fontSize="24px" color="green.600" />
              )}
            </Box>
            <VStack spacing={0} align="start" flex={1}>
              <Text fontSize="sm" fontWeight="medium" color="green.700">
                Recurso seleccionado
              </Text>
              <Text fontSize="xs" color="green.600" noOfLines={1}>
                {selectedResource.title}
              </Text>
            </VStack>
            <Badge colorScheme="green" size="sm">
              ✓ Seleccionado
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
            {results.map((resource, index) => (
              <ListItem
                key={resource._id}
                p={3}
                cursor="pointer"
                bg={index === selectedIndex ? selectedBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                // 🔧 SOLUCIÓN: Usar onMouseDown en lugar de onClick
                onMouseDown={(e) => {
                  e.preventDefault(); // Evitar que el input pierda foco
                  handleSelect(resource);
                }}
                borderBottom={index < results.length - 1 ? '1px solid' : 'none'}
                borderBottomColor={borderColor}
              >
                <HStack spacing={3} align="start">
                  <Box flexShrink={0}>
                    {resource.coverImageUrl ? (
                      <Image
                        src={resource.coverImageUrl}
                        alt={resource.title}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      <Icon as={FiBook} fontSize="40px" color="blue.500" />
                    )}
                  </Box>
                  <VStack spacing={1} align="start" flex={1}>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                      {resource.title}
                    </Text>
                    {resource.authors && resource.authors.length > 0 && (
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {resource.authors.join(', ')}
                      </Text>
                    )}
                    {resource.isbn && (
                      <Text fontSize="xs" color="gray.500">
                        ISBN: {resource.isbn}
                      </Text>
                    )}
                    <HStack spacing={2}>
                      <Badge 
                        colorScheme={getAvailabilityBadgeColor(resource.available)} 
                        size="sm"
                        variant="subtle"
                      >
                        {resource.available ? 'Disponible' : 'No disponible'}
                      </Badge>
                      {resource.volumes && (
                        <Badge colorScheme="blue" size="sm" variant="outline">
                          Volúmenes: {resource.volumes}
                        </Badge>
                      )}
                    </HStack>
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