import {
    Box,
    VStack,
    Icon,
    Heading,
    Text,
    Button,
    BoxProps,
    IconProps,
  } from '@chakra-ui/react';
  import { IconType } from 'react-icons';
  import { FiInbox, FiSearch, FiFileText, FiUsers, FiBook } from 'react-icons/fi';
  
  interface EmptyStateProps extends BoxProps {
    icon?: IconType;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'search' | 'error' | 'create';
  }
  
  export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    size = 'md',
    variant = 'default',
    ...props
  }: EmptyStateProps) {
    // Iconos por defecto según el variant
    const defaultIcons = {
      default: FiInbox,
      search: FiSearch,
      error: FiFileText,
      create: FiFileText,
    };
  
    // Configuraciones por tamaño
    const sizeConfig = {
      sm: {
        iconSize: 12,
        titleSize: 'lg',
        textSize: 'md',
        spacing: 4,
        py: 8,
      },
      md: {
        iconSize: 16,
        titleSize: 'xl',
        textSize: 'lg',
        spacing: 6,
        py: 12,
      },
      lg: {
        iconSize: 20,
        titleSize: '2xl',
        textSize: 'xl',
        spacing: 8,
        py: 16,
      },
    };
  
    const config = sizeConfig[size];
    const IconComponent = icon || defaultIcons[variant];
  
    // Colores según el variant
    const variantColors = {
      default: {
        iconColor: 'gray.400',
        titleColor: 'gray.800',
        textColor: 'gray.600',
        buttonColorScheme: 'primary',
      },
      search: {
        iconColor: 'blue.400',
        titleColor: 'gray.800',
        textColor: 'gray.600',
        buttonColorScheme: 'blue',
      },
      error: {
        iconColor: 'red.400',
        titleColor: 'gray.800',
        textColor: 'gray.600',
        buttonColorScheme: 'red',
      },
      create: {
        iconColor: 'green.400',
        titleColor: 'gray.800',
        textColor: 'gray.600',
        buttonColorScheme: 'green',
      },
    };
  
    const colors = variantColors[variant];
  
    return (
      <Box
        textAlign="center"
        py={config.py}
        px={4}
        {...props}
      >
        <VStack spacing={config.spacing}>
          <Icon
            as={IconComponent}
            boxSize={config.iconSize}
            color={colors.iconColor}
          />
          
          <VStack spacing={2}>
            <Heading
              size={config.titleSize}
              color={colors.titleColor}
              fontWeight="semibold"
            >
              {title}
            </Heading>
            
            {description && (
              <Text
                fontSize={config.textSize}
                color={colors.textColor}
                maxW="md"
                lineHeight="relaxed"
              >
                {description}
              </Text>
            )}
          </VStack>
  
          {actionLabel && onAction && (
            <Button
              colorScheme={colors.buttonColorScheme}
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={onAction}
              mt={2}
            >
              {actionLabel}
            </Button>
          )}
        </VStack>
      </Box>
    );
  }
  
  // Componentes específicos para casos comunes
  export function EmptySearch({
    searchTerm,
    onClear,
    ...props
  }: {
    searchTerm?: string;
    onClear?: () => void;
  } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="search"
        icon={FiSearch}
        title="No se encontraron resultados"
        description={
          searchTerm
            ? `No se encontraron resultados para "${searchTerm}". Intenta con otros términos de búsqueda.`
            : 'Realiza una búsqueda para encontrar elementos.'
        }
        actionLabel={searchTerm ? 'Limpiar búsqueda' : undefined}
        onAction={onClear}
        {...props}
      />
    );
  }
  
  export function EmptyPeople({ onCreate, ...props }: { onCreate?: () => void } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="create"
        icon={FiUsers}
        title="No hay personas registradas"
        description="Comienza registrando estudiantes y docentes para gestionar préstamos."
        actionLabel="Registrar primera persona"
        onAction={onCreate}
        {...props}
      />
    );
  }
  
  export function EmptyResources({ onCreate, ...props }: { onCreate?: () => void } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="create"
        icon={FiBook}
        title="No hay recursos registrados"
        description="Agrega libros, juegos, mapas y otros recursos para comenzar a gestionar préstamos."
        actionLabel="Agregar primer recurso"
        onAction={onCreate}
        {...props}
      />
    );
  }
  
  export function EmptyLoans({ onCreate, ...props }: { onCreate?: () => void } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="default"
        icon={FiBook}
        title="No hay préstamos registrados"
        description="Los préstamos aparecerán aquí una vez que se registren."
        actionLabel="Registrar préstamo"
        onAction={onCreate}
        {...props}
      />
    );
  }
  
  export function EmptyRequests({ onCreate, ...props }: { onCreate?: () => void } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="default"
        icon={FiFileText}
        title="No hay solicitudes registradas"
        description="Las solicitudes de recursos aparecerán aquí cuando los usuarios busquen recursos no disponibles."
        actionLabel="Ver inventario"
        onAction={onCreate}
        {...props}
      />
    );
  }
  
  // Componente de error genérico
  export function ErrorState({
    onRetry,
    error,
    ...props
  }: {
    onRetry?: () => void;
    error?: string;
  } & Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>) {
    return (
      <EmptyState
        variant="error"
        title="Algo salió mal"
        description={error || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'}
        actionLabel="Intentar nuevamente"
        onAction={onRetry}
        {...props}
      />
    );
  }