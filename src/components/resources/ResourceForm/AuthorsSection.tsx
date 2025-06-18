// src/components/resources/ResourceForm/AuthorsSection.tsx - CORREGIDO
'use client';

import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
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
  FormErrorMessage,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FiUsers, FiPlus, FiSearch, FiUserPlus } from 'react-icons/fi';
import { useAuthors, useAuthorSearch, useCreateAuthor, useBulkCreateAuthors } from '@/hooks/useResources';
import { TextUtils } from '@/utils';
import type { Author } from '@/types/resource.types';

interface AuthorsSectionProps {
  authors: Author[];
  onAuthorsChange: (authors: Author[]) => void;
  disabled?: boolean;
}

export function AuthorsSection({ authors, onAuthorsChange, disabled }: AuthorsSectionProps) {
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreateMutation = useBulkCreateAuthors();

  const handleAddAuthor = async () => {
    if (!newAuthorName.trim()) return;

    setError(null);
    setIsAdding(true);

    try {
      const names = [newAuthorName.trim()];
      const newAuthors = await bulkCreateMutation.mutateAsync(names.map(name => ({ name })));
      onAuthorsChange([...authors, ...newAuthors]);
      setNewAuthorName('');
    } catch (error) {
      setError('Error al agregar el autor');
      console.error('Error al agregar autor:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAuthor = (authorId: string) => {
    onAuthorsChange(authors.filter(author => author._id !== authorId));
  };

  return (
    <VStack align="stretch" spacing={4}>
      <FormControl isInvalid={!!error}>
        <FormLabel>Autores</FormLabel>
        <HStack>
          <Input
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
            placeholder="Nombre del autor"
            disabled={disabled || isAdding}
          />
          <Button
            onClick={handleAddAuthor}
            isLoading={isAdding}
            disabled={disabled || !newAuthorName.trim()}
            leftIcon={<FiPlus />}
          >
            Agregar
          </Button>
        </HStack>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>

      <Wrap spacing={2}>
        {authors.map((author) => (
          <WrapItem key={author._id}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="blue"
            >
              <TagLabel>{author.name}</TagLabel>
              {!disabled && (
                <TagCloseButton onClick={() => handleRemoveAuthor(author._id)} />
              )}
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
}