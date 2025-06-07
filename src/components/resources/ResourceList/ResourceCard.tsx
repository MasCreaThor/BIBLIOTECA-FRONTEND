// src/components/resources/ResourceList/ResourceCard.tsx
'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Box,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEye, FiEdit, FiToggleLeft, FiToggleRight, FiTrash2, FiBook, FiMapPin } from 'react-icons/fi';
import { SafeLink } from '@/components/ui/SafeLink';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DateUtils, TextUtils } from '@/utils';
import type { Resource } from '@/types/resource.types';

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onToggleAvailability?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  showActions?: boolean;
  isCompact?: boolean;
}

const RESOURCE_TYPE_CONFIGS = {
  book: { icon: '📚', label: 'Libro', color: 'blue' },
  game: { icon: '🎲', label: 'Juego', color: 'green' },
  map: { icon: '🗺️', label: 'Mapa', color: 'orange' },
  bible: { icon: '📖', label: 'Biblia', color: 'purple' },
};

export function ResourceCard({
  resource,
  onEdit,
  onToggleAvailability,
  onDelete,
  showActions = true,
  isCompact = false,
}: ResourceCardProps) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'toggleAvailability' | 'delete') => {
    switch (action) {
      case 'edit':
        onEdit?.(resource);
        break;
      case 'toggleAvailability':
        onToggleAvailability?.(resource);
        break;
      case 'delete':
        onDeleteOpen();
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(resource);
    onDeleteClose();
  };

  // Configuración del tipo de recurso
  const typeConfig = resource.type 
    ? RESOURCE_TYPE_CONFIGS[resource.type.name as keyof typeof RESOURCE_TYPE_CONFIGS]
    : null;

  // Información de autores
  const authorsText = resource.authors && resource.authors.length > 0
    ? resource.authors.map(author => author.name).join(', ')
    : 'Sin autor especificado';

  return (
    <>
      <Card
        size="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={resource.available ? 1 : 0.7}
        border={resource.available ? '1px solid' : '2px solid'}
        borderColor={resource.available ? 'gray.200' : 'orange.300'}
      >
        <CardBody p={isCompact ? 3 : 4}>
          <VStack spacing={3} align="stretch" h="full">
            {/* Header con tipo y disponibilidad */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                {typeConfig && (
                  <Badge colorScheme={typeConfig.color} variant="solid" fontSize="xs">
                    <HStack spacing={1}>
                      <Text>{typeConfig.icon}</Text>
                      <Text>{typeConfig.label}</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>

              <Badge
                colorScheme={resource.available ? 'green' : 'orange'}
                variant="subtle"
                fontSize="xs"
              >
                {resource.available ? 'Disponible' : 'Prestado'}
              </Badge>
            </HStack>

            {/* Título */}
            <Box flex={1}>
              <Text
                fontWeight="semibold"
                fontSize={isCompact ? "sm" : "md"}
                lineHeight="short"
                noOfLines={2}
                color="gray.800"
              >
                {resource.title}
              </Text>

              {/* Autores */}
              <Text
                fontSize="sm"
                color="gray.600"
                noOfLines={1}
                mt={1}
              >
                {authorsText}
              </Text>

              {/* Editorial */}
              {resource.publisher && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  noOfLines={1}
                  mt={1}
                >
                  Editorial: {resource.publisher.name}
                </Text>
              )}

              {/* ISBN */}
              {resource.isbn && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontFamily="mono"
                  mt={1}
                >
                  ISBN: {resource.isbn}
                </Text>
              )}
            </Box>

            {/* Información adicional */}
            <VStack spacing={1} align="stretch">
              {/* Categoría y ubicación */}
              <HStack spacing={2} fontSize="xs" color="gray.500">
                {resource.category && (
                  <HStack spacing={1}>
                    <FiBook size={10} />
                    <Text noOfLines={1}>{resource.category.name}</Text>
                  </HStack>
                )}
                
                {resource.location && (
                  <HStack spacing={1}>
                    <FiMapPin size={10} />
                    <Text noOfLines={1}>{resource.location.name}</Text>
                  </HStack>
                )}
              </HStack>

              {/* Volúmenes */}
              {resource.volumes && resource.volumes > 1 && (
                <Text fontSize="xs" color="gray.500">
                  {resource.volumes} volúmenes
                </Text>
              )}

              {/* Fecha de registro */}
              <Text fontSize="xs" color="gray.400">
                Registrado: {DateUtils.formatRelative(resource.createdAt)}
              </Text>
            </VStack>

            {/* Acciones */}
            {showActions && (
              <HStack justify="space-between" pt={2}>
                <SafeLink href={`/inventory/${resource._id}`}>
                  <Button size="xs" variant="outline" leftIcon={<FiEye />}>
                    Ver
                  </Button>
                </SafeLink>

                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Acciones"
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="xs"
                  />
                  <MenuList>
                    <SafeLink href={`/inventory/${resource._id}`}>
                      <MenuItem icon={<FiEye />}>
                        Ver detalles
                      </MenuItem>
                    </SafeLink>
                    
                    <MenuItem
                      icon={<FiEdit />}
                      onClick={() => handleActionClick('edit')}
                    >
                      Editar
                    </MenuItem>

                    <MenuDivider />

                    <MenuItem
                      icon={resource.available ? <FiToggleLeft /> : <FiToggleRight />}
                      onClick={() => handleActionClick('toggleAvailability')}
                      color={resource.available ? "orange.600" : "green.600"}
                    >
                      {resource.available ? 'Marcar como prestado' : 'Marcar como disponible'}
                    </MenuItem>

                    <MenuDivider />
                    
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => handleActionClick('delete')}
                      color="red.600"
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            )}

            {/* Notas (si existen) */}
            {resource.notes && !isCompact && (
              <Box
                p={2}
                bg="gray.50"
                borderRadius="md"
                borderLeft="3px solid"
                borderColor="blue.200"
              >
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {resource.notes}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={resource.title}
        itemType="recurso"
      />
    </>
  );
}