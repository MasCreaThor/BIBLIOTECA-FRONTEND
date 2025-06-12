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
  Link,
  Image,
  Skeleton,
} from '@chakra-ui/react';
import { useState } from 'react'; // ✅ AGREGADO: import useState
import { FiMoreVertical, FiEye, FiEdit, FiToggleLeft, FiToggleRight, FiTrash2, FiBook, FiMapPin } from 'react-icons/fi';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Resource } from '@/types/resource.types';

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onToggleAvailability?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onView?: (resource: Resource) => void; // ✅ AGREGADO: prop onView
  showActions?: boolean;
  isCompact?: boolean;
  isLoading?: boolean; // ✅ AGREGADO: prop isLoading
}

const RESOURCE_TYPE_CONFIGS = {
  book: { icon: '📚', label: 'Libro', color: 'blue' },
  game: { icon: '🎲', label: 'Juego', color: 'green' },
  map: { icon: '🗺️', label: 'Mapa', color: 'orange' },
  bible: { icon: '📖', label: 'Biblia', color: 'purple' },
};

// ✅ CORREGIDO: Función local para formatear fechas que acepta string o Date
function formatRelativeDate(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - parsedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.ceil(diffDays / 7)} semanas`;
    return `hace ${Math.ceil(diffDays / 30)} meses`;
  } catch {
    return 'fecha inválida';
  }
}

// ✅ AGREGADO: Componente simple para imagen del recurso
function ResourceCardImage({ 
  resource, 
  size = 'sm',
  alt 
}: { 
  resource: Resource; 
  size?: 'xs' | 'sm' | 'md'; 
  alt?: string;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const sizeConfig = {
    xs: { width: '50px', height: '70px' },
    sm: { width: '60px', height: '85px' },
    md: { width: '80px', height: '110px' },
  };

  const dimensions = sizeConfig[size];

  // Obtener URL de imagen
  const getImageUrl = () => {
    // Prioridad: coverImageUrl > imagen de Google Books
    if (resource.coverImageUrl) {
      return resource.coverImageUrl.startsWith('http://') 
        ? resource.coverImageUrl.replace('http://', 'https://')
        : resource.coverImageUrl;
    }
    return null;
  };

  // Placeholder basado en tipo de recurso
  const getPlaceholderUrl = () => {
    const type = resource.type?.name || 'book';
    const placeholders = {
      book: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEzMCIgdmlld0JveD0iMCAwIDEwMCAxMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTMwIiBmaWxsPSIjRjdGQUZDIiBzdHJva2U9IiNFMkU4RjAiLz4KPHN2ZyB4PSIzNSIgeT0iNDUiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjM3MzgwIj4KPHA+4p2kPC9wPgo8L3N2Zz4KPC9zdmc+',
      game: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEzMCIgdmlld0JveD0iMCAwIDEwMCAxMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTMwIiBmaWxsPSIjRjBGRkY0IiBzdHJva2U9IiNEMUZBRTUiLz4KPHRleHQgeD0iNTAiIHk9IjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMwIj7wn46yPC90ZXh0Pgo8L3N2Zz4K',
      map: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEzMCIgdmlld0JveD0iMCAwIDEwMCAxMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTMwIiBmaWxsPSIjRkVGNUU3IiBzdHJva2U9IiNGQkQzOEQiLz4KPHRleHQgeD0iNTAiIHk9IjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMwIj7wn5KOPC90ZXh0Pgo8L3N2Zz4K',
      bible: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEzMCIgdmlld0JveD0iMCAwIDEwMCAxMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTMwIiBmaWxsPSIjRkFGNUZGIiBzdHJva2U9IiNFOUQ4RkQiLz4KPHRleHQgeD0iNTAiIHk9IjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMwIj7wn5KOPC90ZXh0Pgo8L3N2Zz4K'
    };
    return placeholders[type as keyof typeof placeholders] || placeholders.book;
  };

  const imageUrl = getImageUrl();
  const placeholderUrl = getPlaceholderUrl();

  return (
    <Box
      position="relative"
      width={dimensions.width}
      height={dimensions.height}
      borderRadius="md"
      overflow="hidden"
      bg="gray.100"
      flexShrink={0}
    >
      {/* Skeleton mientras carga */}
      {imageLoading && imageUrl && (
        <Skeleton 
          width="100%" 
          height="100%" 
          position="absolute" 
          top={0} 
          left={0} 
          zIndex={2}
        />
      )}

      {/* Imagen principal */}
      <Image
        src={imageError || !imageUrl ? placeholderUrl : imageUrl}
        alt={alt || `Portada de ${resource.title}`}
        width="100%"
        height="100%"
        objectFit="cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
        opacity={imageLoading && imageUrl ? 0 : 1}
        transition="opacity 0.3s ease"
      />

      {/* Indicador de que es placeholder */}
      {(imageError || !imageUrl) && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="blackAlpha.500"
          color="white"
          fontSize="8px"
          textAlign="center"
          py={0.5}
        >
          Sin imagen
        </Box>
      )}
    </Box>
  );
}

export function ResourceCard({
  resource,
  onEdit,
  onToggleAvailability,
  onDelete,
  onView, // ✅ AGREGADO: destructuring onView
  showActions = true,
  isCompact = false,
  isLoading = false, // ✅ AGREGADO: destructuring isLoading
}: ResourceCardProps) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'toggleAvailability' | 'delete' | 'view') => {
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
      case 'view': // ✅ AGREGADO: case para view
        onView?.(resource);
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(resource);
    onDeleteClose();
  };

  // ✅ AGREGADO: Handler para click en la card
  const handleCardClick = () => {
    if (onView) {
      onView(resource);
    }
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
        cursor={onView ? 'pointer' : 'default'} // ✅ AGREGADO: cursor condicional
        onClick={handleCardClick} // ✅ AGREGADO: handler de click
        position="relative" // ✅ AGREGADO: para overlay de loading
      >
        {/* ✅ AGREGADO: Overlay de loading */}
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.200"
            zIndex={1}
            borderRadius="md"
          />
        )}
        
        <CardBody p={isCompact ? 3 : 4}>
          <VStack spacing={isCompact ? 2 : 3} align="stretch">
            {/* Header con tipo y disponibilidad */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                {typeConfig && (
                  <Text fontSize="lg" title={typeConfig.label}>
                    {typeConfig.icon}
                  </Text>
                )}
                <Badge
                  colorScheme={typeConfig?.color || 'gray'}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {typeConfig?.label || 'Recurso'}
                </Badge>
              </HStack>
              
              <Badge
                colorScheme={resource.available ? 'green' : 'red'}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {resource.available ? 'Disponible' : 'Prestado'}
              </Badge>
            </HStack>

            {/* Información principal */}
            <VStack spacing={1} align="start">
              {/* ✅ AGREGADO: Layout con imagen y texto */}
              <HStack spacing={3} align="start" width="100%">
                {/* Imagen del recurso */}
                <ResourceCardImage
                  resource={resource}
                  size={isCompact ? 'xs' : 'sm'}
                  alt={`Portada de ${resource.title}`}
                />

                {/* Información del recurso */}
                <VStack spacing={1} align="start" flex={1} minW={0}>
                  <Text
                    fontWeight="bold"
                    fontSize={isCompact ? 'sm' : 'md'}
                    lineHeight="tight"
                    noOfLines={2}
                    title={resource.title}
                  >
                    {resource.title}
                  </Text>
                  
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    noOfLines={isCompact ? 1 : 2}
                    title={authorsText}
                  >
                    {authorsText}
                  </Text>

                  {/* Ubicación */}
                  {resource.location && (
                    <HStack spacing={1}>
                      <FiMapPin size={12} />
                      <Text fontSize="xs" color="gray.500">
                        {resource.location.name}
                      </Text>
                    </HStack>
                  )}

                  {/* ISBN si existe */}
                  {resource.isbn && (
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      ISBN: {resource.isbn}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </VStack>

            {/* Acciones */}
            {showActions && (
              <HStack justify="space-between" align="center">
                <HStack spacing={1}>
                  {/* Botón de vista rápida */}
                  {onView && (
                    <Tooltip label="Ver detalles">
                      <IconButton
                        aria-label="Ver detalles"
                        icon={<FiEye />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar doble click
                          handleActionClick('view');
                        }}
                      />
                    </Tooltip>
                  )}
                  
                  {/* Link directo al recurso usando Link de Chakra */}
                  <Link href={`/inventory/${resource._id}`}>
                    <Tooltip label="Ir a página del recurso">
                      <IconButton
                        aria-label="Ir a página del recurso"
                        icon={<FiBook />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()} // Evitar conflicto con card click
                      />
                    </Tooltip>
                  </Link>
                </HStack>

                {/* Menú de acciones */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    size="xs"
                    variant="ghost"
                    aria-label="Más opciones"
                    onClick={(e) => e.stopPropagation()} // Evitar conflicto con card click
                  />
                  <MenuList>
                    {onEdit && (
                      <MenuItem
                        icon={<FiEdit />}
                        onClick={() => handleActionClick('edit')}
                      >
                        Editar
                      </MenuItem>
                    )}
                    
                    {onToggleAvailability && (
                      <MenuItem
                        icon={resource.available ? <FiToggleLeft /> : <FiToggleRight />}
                        onClick={() => handleActionClick('toggleAvailability')}
                        color={resource.available ? "orange.600" : "green.600"}
                      >
                        {resource.available ? 'Marcar como prestado' : 'Marcar como disponible'}
                      </MenuItem>
                    )}

                    {(onEdit || onToggleAvailability) && onDelete && <MenuDivider />}
                    
                    {onDelete && (
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleActionClick('delete')}
                        color="red.600"
                      >
                        Eliminar
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </HStack>
            )}

            {/* Metadata adicional para vista no compacta */}
            {!isCompact && (
              <Box pt={2} borderTop="1px solid" borderColor="gray.100">
                <HStack justify="space-between" fontSize="xs" color="gray.500">
                  <Text>
                    Actualizado {formatRelativeDate(resource.updatedAt)}
                  </Text>
                  {resource.volumes && resource.volumes > 1 && (
                    <Text>{resource.volumes} vol.</Text>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

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