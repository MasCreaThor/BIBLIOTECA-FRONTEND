// components/resources/ResourceSearch/ResourceSearch.tsx
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
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiBook } from 'react-icons/fi';
import { Resource, ResourceFilters } from '@/types/resource.types';
import { ResourceService } from '@/services/resource.service';
import { useDebounce } from '@/hooks/useDebounce';

interface ResourceSearchProps {
  onSelect: (resource: Resource) => void;
  placeholder?: string;
  isDisabled?: boolean;
  filterAvailable?: boolean;
}

export function ResourceSearch({
  onSelect,
  placeholder = "Buscar recurso...",
  isDisabled = false,
  filterAvailable = false,
}: ResourceSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  // Búsqueda de recursos
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsLoading(true);
      const filters: ResourceFilters = {
        search: debouncedSearchTerm,
        limit: 10,
      };
      
      if (filterAvailable) {
        filters.available = true;
      }

      ResourceService.getResources(filters)
        .then((response) => {
          setResults(response.data || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        })
        .catch((error) => {
          console.error('Error searching resources:', error);
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [debouncedSearchTerm, filterAvailable]);

  const handleSelect = (resource: Resource) => {
    onSelect(resource);
    setSearchTerm(resource.title);
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
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

  const handleBlur = () => {
    // Delay to allow clicking on results
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <Box position="relative">
      <InputGroup>
        <InputLeftElement>
          {isLoading ? <Spinner size="sm" /> : <FiSearch />}
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
        />
      </InputGroup>

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
        >
          <List ref={listRef}>
            {results.map((resource, index) => (
              <ListItem
                key={resource._id}
                p={3}
                cursor="pointer"
                bg={index === selectedIndex ? selectedBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                onClick={() => handleSelect(resource)}
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
                        fallback={<Box boxSize="40px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center"><FiBook /></Box>}
                      />
                    ) : (
                      <Box boxSize="40px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                        <FiBook />
                      </Box>
                    )}
                  </Box>
                  <VStack spacing={0} align="start" flex={1} minW={0}>
                    <Text fontWeight="medium" noOfLines={1}>
                      {resource.title}
                    </Text>
                    {resource.authors && resource.authors.length > 0 && (
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {resource.authors.map(a => a.name).join(', ')}
                      </Text>
                    )}
                    {resource.isbn && (
                      <Text fontSize="xs" color="gray.500" fontFamily="mono">
                        ISBN: {resource.isbn}
                      </Text>
                    )}
                  </VStack>
                  <VStack spacing={1} alignItems="end">
                    <Badge
                      colorScheme={resource.available ? 'green' : 'red'}
                      fontSize="xs"
                    >
                      {resource.available ? 'Disponible' : 'No disponible'}
                    </Badge>
                    {resource.category && (
                      <Text fontSize="xs" color="gray.500">
                        {resource.category.name}
                      </Text>
                    )}
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