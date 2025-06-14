// components/people/PersonSearch/PersonSearch.tsx
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
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Person, SearchFilters } from '@/types/api.types';
import { PersonService } from '@/services/person.service';

import { useDebounce } from '@/hooks/useDebounce';

interface PersonSearchProps {
  onPersonSelected: (person: Person) => void;
  selectedPerson: Person | null;
  placeholder?: string;
  isDisabled?: boolean;
  filterActive?: boolean;
}

export function PersonSearch({
  onPersonSelected,
  selectedPerson,
  placeholder = "Buscar persona...",
  isDisabled = false,
  filterActive = true,
}: PersonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Person[]>([]);
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

  // Búsqueda de personas
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsLoading(true);
      const filters: SearchFilters = {
        search: debouncedSearchTerm,
        limit: 10,
      };
      
      if (filterActive) {
        filters.status = 'active';
      }

      PersonService.getPeople(filters)
        .then((response) => {
          setResults(response.data);
          setIsOpen(true);
          setSelectedIndex(-1);
        })
        .catch((error) => {
          console.error('Error searching people:', error);
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
  }, [debouncedSearchTerm, filterActive]);

  const handleSelect = (person: Person) => {
    onPersonSelected(person);
    const fullName = person.fullName || `${person.firstName} ${person.lastName}`;
    setSearchTerm(fullName);
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
            {results.map((person, index) => (
              <ListItem
                key={person._id}
                p={3}
                cursor="pointer"
                bg={index === selectedIndex ? selectedBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                onClick={() => handleSelect(person)}
              >
                <HStack spacing={3}>
                  <Avatar size="sm" name={person.fullName || `${person.firstName} ${person.lastName}`} />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontWeight="medium">
                      {person.fullName || `${person.firstName} ${person.lastName}`}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">
                        {person.documentNumber}
                      </Text>
                      {person.grade && (
                        <>
                          <Text fontSize="sm" color="gray.400">•</Text>
                          <Text fontSize="sm" color="gray.600">
                            {person.grade}
                          </Text>
                        </>
                      )}
                    </HStack>
                  </VStack>
                  <Badge
                    colorScheme={person.active ? 'green' : 'gray'}
                    fontSize="xs"
                  >
                    {person.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}