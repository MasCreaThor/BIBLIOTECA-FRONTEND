// src/components/resources/ResourceCard/ResourceCard.tsx
'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Box,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBook, FiMapPin, FiUsers, FiEdit, FiEye } from 'react-icons/fi';
import { ResourceCardImage } from '@/components/resources/ResourceImage/ResourceImage';
import type { Resource } from '@/types/resource.types';

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
  onBorrow?: (resource: Resource) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ResourceCard({
  resource,
  onEdit,
  onView,
  onBorrow,
  showActions = true,
  compact = false,
}: ResourceCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Formatear autores
  const authorsText = resource.authors && resource.authors.length > 0
    ? resource.authors.map(author => author.name).join(', ')
    : 'Sin autor';

  // Estado de disponibilidad
  const availabilityColor = resource.available ? 'green' : 'red';
  const availabilityText = resource.available ? 'Disponible' : 'Prestado';

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onView?.(resource)}
    >
      <CardBody p={compact ? 3 : 4}>
        <VStack spacing={compact ? 2 : 3} align="stretch">
          {/* Imagen y información básica */}
          <HStack spacing={3} align="start">
            {/* Imagen del recurso */}
            <Box flexShrink={0}>
              <ResourceCardImage
                resource={resource}
                size={compact ? 'xs' : 'sm'}
                alt={`Portada de ${resource.title}`}
              />
            </Box>

            {/* Información principal */}
            <VStack spacing={1} align="start" flex={1} minW={0}>
              {/* Título */}
              <Text
                fontWeight="bold"
                fontSize={compact ? 'sm' : 'md'}
                lineHeight="short"
                noOfLines={2}
                title={resource.title}
              >
                {resource.title}
              </Text>

              {/* Autores */}
              <HStack spacing={1} color={textColor}>
                <FiUsers size={14} />
                <Text fontSize="xs" noOfLines={1} title={authorsText}>
                  {authorsText}
                </Text>
              </HStack>

              {/* Editorial */}
              {resource.publisher && (
                <Text
                  fontSize="xs"
                  color={textColor}
                  noOfLines={1}
                  title={resource.publisher.name}
                >
                  {resource.publisher.name}
                </Text>
              )}

              {/* ISBN */}
              {resource.isbn && (
                <Text fontSize="xs" color={textColor} fontFamily="mono">
                  ISBN: {resource.isbn}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Información adicional */}
          {!compact && (
            <VStack spacing={2} align="stretch">
              {/* Categoría y ubicación */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <FiBook size={14} />
                  <Text fontSize="xs" color={textColor}>
                    {resource.category?.name || 'Sin categoría'}
                  </Text>
                </HStack>
                
                <HStack spacing={1} color={textColor}>
                  <FiMapPin size={14} />
                  <Text fontSize="xs">
                    {resource.location?.name || 'Sin ubicación'}
                  </Text>
                </HStack>
              </HStack>

              {/* Estado y disponibilidad */}
              <HStack justify="space-between">
                <Badge
                  colorScheme={resource.state?.name === 'good' ? 'green' : 'yellow'}
                  size="sm"
                >
                  {resource.state?.description || 'Estado desconocido'}
                </Badge>

                <Badge colorScheme={availabilityColor} size="sm">
                  {availabilityText}
                </Badge>
              </HStack>

              {/* Información de Google Books */}
              {resource.googleBooksId && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color={textColor}>
                    📚 Importado de Google Books
                  </Text>
                  {resource.coverImageUrl && (
                    <Tooltip label="Tiene imagen de portada guardada">
                      <Text fontSize="xs" color="green.500">
                        🖼️
                      </Text>
                    </Tooltip>
                  )}
                </HStack>
              )}
            </VStack>
          )}

          {/* Acciones */}
          {showActions && (
            <HStack spacing={2} justify="stretch">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiEye />}
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(resource);
                }}
                flex={1}
              >
                Ver
              </Button>

              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiEdit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(resource);
                  }}
                  flex={1}
                >
                  Editar
                </Button>
              )}

              {resource.available && onBorrow && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBorrow(resource);
                  }}
                  flex={1}
                >
                  Prestar
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}