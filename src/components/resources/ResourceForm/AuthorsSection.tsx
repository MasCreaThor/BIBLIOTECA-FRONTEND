// src/components/resources/ResourceForm/AuthorsSection.tsx
'use client';

import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Skeleton,
  Badge,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FiUsers, FiPlus, FiSearch, FiUserPlus } from 'react-icons/fi';
import { useAuthors, useAuthorSearch, useCreateAuthor, useBulkCreateAuthors } from '@/hooks/useResources';
import { TextUtils } from '@/utils';
import type { Author } from '@/types/resource.types';

interface AuthorsSectionProps {
  form: UseFormReturn<any>;
}

export function AuthorsSection({ form }: AuthorsSectionProps) {
  const { watch, setValue } = form;
  const selectedAuthorIds = watch('authorIds') || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  
  // Queries y mutations
  const { data: allAuthors = [], isLoading: isLoadingAuthors } = useAuthors();
  const { data: searchResults = [], isLoading: isSearching } = useAuthorSearch(
    searchQuery,
    20
  );
  const createAuthorMutation = useCreateAuthor();
  const bulkCreateMutation = useBulkCreateAuthors();

  // Autores seleccionados
  const selectedAuthors = allAuthors.filter(author => 
    selectedAuthorIds.includes(author._id)
  );

  // Resultados de búsqueda filtrados (excluir ya seleccionados)
  const filteredResults = searchResults.filter(author => 
    !selectedAuthorIds.includes(author._id)
  );

  const handleSelectAuthor = (author: Author) => {
    if (!selectedAuthorIds.includes(author._id)) {
      setValue('authorIds', [...selectedAuthorIds, author._id], { shouldDirty: true });
    }
  };

  const handleRemoveAuthor = (authorId: string) => {
    setValue(
      'authorIds', 
      selectedAuthorIds.filter((id: string) => id !== authorId),
      { shouldDirty: true }
    );
  };

  const handleCreateNewAuthor = async () => {
    if (!newAuthorName.trim()) return;

    try {
      const newAuthor = await createAuthorMutation.mutateAsync({
        name: TextUtils.capitalize(newAuthorName.trim())
      });
      
      // Agregar automáticamente a la selección
      setValue('authorIds', [...selectedAuthorIds, newAuthor._id], { shouldDirty: true });
      setNewAuthorName('');
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleBulkCreateAuthors = async () => {
    // Extraer nombres únicos del campo de texto que no existan
    const names = newAuthorName
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => TextUtils.capitalize(name));

    if (names.length === 0) return;

    try {
      const newAuthors = await bulkCreateMutation.mutateAsync(names);
      
      // Agregar todos a la selección
      const newAuthorIds = newAuthors.map(author => author._id);
      setValue('authorIds', [...selectedAuthorIds, ...newAuthorIds], { shouldDirty: true });
      setNewAuthorName('');
      onModalClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Limpiar búsqueda al cerrar modal
  useEffect(() => {
    if (!isModalOpen) {
      setSearchQuery('');
      setNewAuthorName('');
    }
  }, [isModalOpen]);

  return (
    <>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="medium" color="gray.700" fontSize="md">
            Autores
          </Text>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiUsers />}
            onClick={onModalOpen}
          >
            Gestionar Autores
          </Button>
        </HStack>

        {/* Autores seleccionados */}
        {selectedAuthors.length > 0 ? (
          <Box>
            <FormLabel fontSize="sm" color="gray.600" mb={2}>
              Autores seleccionados ({selectedAuthors.length})
            </FormLabel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={2}>
              {selectedAuthors.map((author) => (
                <Tag
                  key={author._id}
                  size="lg"
                  variant="solid"
                  colorScheme="blue"
                >
                  <TagLabel>{author.name}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveAuthor(author._id)} />
                </Tag>
              ))}
            </SimpleGrid>
          </Box>
        ) : (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontSize="sm">
                No hay autores seleccionados. Los libros requieren al menos un autor.
              </Text>
            </Box>
          </Alert>
        )}

        <FormHelperText>
          Los autores son opcionales para juegos, mapas y otros recursos no bibliográficos.
          Haz clic en "Gestionar Autores" para buscar o agregar nuevos autores.
        </FormHelperText>
      </VStack>

      {/* Modal de gestión de autores */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Gestionar Autores</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Búsqueda de autores existentes */}
              <Box>
                <FormLabel>Buscar Autores Existentes</FormLabel>
                <InputGroup>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre del autor..."
                  />
                  <InputRightElement>
                    <FiSearch color="gray.400" />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  Busca y selecciona autores ya registrados en el sistema
                </FormHelperText>
              </Box>

              {/* Resultados de búsqueda */}
              {searchQuery.length >= 2 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Resultados de búsqueda
                  </Text>
                  {isSearching ? (
                    <VStack spacing={2}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height="40px" />
                      ))}
                    </VStack>
                  ) : filteredResults.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {filteredResults.map((author) => (
                        <HStack
                          key={author._id}
                          p={3}
                          border="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          justify="space-between"
                          _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                        >
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{author.name}</Text>
                            {author.biography && (
                              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                {author.biography}
                              </Text>
                            )}
                          </VStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleSelectAuthor(author)}
                            leftIcon={<FiPlus />}
                          >
                            Seleccionar
                          </Button>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No se encontraron autores con ese nombre
                    </Text>
                  )}
                </Box>
              )}

              {/* Crear nuevo autor */}
              <Box>
                <FormLabel>Crear Nuevo Autor</FormLabel>
                <VStack spacing={3} align="stretch">
                  <Input
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="Nombre del nuevo autor o lista separada por comas"
                  />
                  
                  <HStack spacing={2}>
                    <Button
                      onClick={handleCreateNewAuthor}
                      disabled={!newAuthorName.trim() || newAuthorName.includes(',') || newAuthorName.includes('\n')}
                      isLoading={createAuthorMutation.isPending}
                      colorScheme="green"
                      variant="outline"
                      leftIcon={<FiUserPlus />}
                      size="sm"
                    >
                      Crear Un Autor
                    </Button>
                    
                    <Button
                      onClick={handleBulkCreateAuthors}
                      disabled={!newAuthorName.includes(',') && !newAuthorName.includes('\n')}
                      isLoading={bulkCreateMutation.isPending}
                      colorScheme="green"
                      leftIcon={<FiUsers />}
                      size="sm"
                    >
                      Crear Múltiples
                    </Button>
                  </HStack>
                  
                  <FormHelperText>
                    Para crear múltiples autores, sepáralos con comas o saltos de línea
                  </FormHelperText>
                </VStack>
              </Box>

              {/* Resumen de selección actual */}
              {selectedAuthors.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Autores seleccionados para este recurso
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {selectedAuthors.map((author) => (
                      <Badge key={author._id} colorScheme="blue" variant="subtle">
                        {author.name}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}