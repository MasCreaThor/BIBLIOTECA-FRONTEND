// src/components/ui/ServerStatus.tsx
import { 
    Box, 
    HStack, 
    Text, 
    Icon, 
    Tooltip, 
    Alert, 
    AlertIcon, 
    AlertTitle, 
    AlertDescription,
    Badge,
    Spinner,
    VStack,
  } from '@chakra-ui/react';
  import { FiWifi, FiWifiOff, FiServer, FiAlertTriangle } from 'react-icons/fi';
  import { useSystemHealth } from '@/hooks/useDashboard';
  
  interface ServerStatusProps {
    variant?: 'minimal' | 'badge' | 'full' | 'alert';
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
  
  export function ServerStatus({ 
    variant = 'minimal', 
    showText = false,
    size = 'md' 
  }: ServerStatusProps) {
    const { data: health, isLoading, error } = useSystemHealth();
  
    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 20,
    };
  
    const textSizes = {
      sm: 'xs',
      md: 'sm',
      lg: 'md',
    } as const;
  
    // Loading state
    if (isLoading) {
      if (variant === 'minimal') {
        return (
          <Tooltip label="Verificando conexión...">
            <Box>
              <Spinner size="sm" color="blue.500" />
            </Box>
          </Tooltip>
        );
      }
      
      return (
        <HStack spacing={2}>
          <Spinner size="sm" color="blue.500" />
          {showText && (
            <Text fontSize={textSizes[size]} color="gray.600">
              Verificando...
            </Text>
          )}
        </HStack>
      );
    }
  
    // Error state
    if (error || !health) {
      const errorMessage = "Error de conexión";
      
      if (variant === 'alert') {
        return (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Sin conexión al servidor</AlertTitle>
              <AlertDescription fontSize="sm">
                No se puede conectar al servidor. Verifica tu conexión a internet.
              </AlertDescription>
            </Box>
          </Alert>
        );
      }
      
      if (variant === 'minimal') {
        return (
          <Tooltip label={errorMessage}>
            <Box
              w={3}
              h={3}
              borderRadius="full"
              bg="red.500"
              shadow="sm"
            />
          </Tooltip>
        );
      }
      
      return (
        <HStack spacing={2}>
          <Icon 
            as={FiWifiOff} 
            color="red.500" 
            boxSize={iconSizes[size]} 
          />
          {showText && (
            <Text fontSize={textSizes[size]} color="red.600">
              Sin conexión
            </Text>
          )}
        </HStack>
      );
    }
  
    // Success states
    const { backend, apis } = health;
    const allApisWorking = apis.people && apis.resources && apis.users;
    
    if (variant === 'full') {
      return (
        <VStack spacing={3} align="start">
          <HStack spacing={2}>
            <Icon 
              as={backend ? FiServer : FiWifiOff} 
              color={backend ? 'green.500' : 'red.500'}
              boxSize={iconSizes[size]}
            />
            <Text fontSize={textSizes[size]} fontWeight="medium">
              Servidor: {backend ? 'Conectado' : 'Desconectado'}
            </Text>
          </HStack>
          
          <VStack spacing={1} align="start" pl={6}>
            <HStack spacing={2}>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={apis.people ? 'green.500' : 'red.500'}
              />
              <Text fontSize="xs" color="gray.600">
                API Personas: {apis.people ? 'OK' : 'Error'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={apis.resources ? 'green.500' : 'red.500'}
              />
              <Text fontSize="xs" color="gray.600">
                API Recursos: {apis.resources ? 'OK' : 'Error'}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={apis.users ? 'green.500' : 'red.500'}
              />
              <Text fontSize="xs" color="gray.600">
                API Usuarios: {apis.users ? 'OK' : 'Error'}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      );
    }
    
    if (variant === 'badge') {
      const status = backend && allApisWorking ? 'online' : 'issues';
      
      return (
        <Badge 
          colorScheme={status === 'online' ? 'green' : 'orange'}
          variant="subtle"
          fontSize={textSizes[size]}
        >
          <HStack spacing={1}>
            <Icon 
              as={status === 'online' ? FiWifi : FiAlertTriangle} 
              boxSize={iconSizes[size]} 
            />
            <Text>
              {status === 'online' ? 'Online' : 'Problemas'}
            </Text>
          </HStack>
        </Badge>
      );
    }
    
    if (variant === 'alert' && (!backend || !allApisWorking)) {
      return (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Problemas de conectividad</AlertTitle>
            <AlertDescription fontSize="sm">
              {!backend 
                ? 'Sin conexión al servidor principal.'
                : 'Algunos servicios tienen problemas.'
              } Los datos pueden no estar actualizados.
            </AlertDescription>
          </Box>
        </Alert>
      );
    }
    
    // Minimal variant - default
    const isHealthy = backend && allApisWorking;
    const tooltipMessage = isHealthy 
      ? 'Conectado al servidor' 
      : 'Problemas de conectividad';
    
    return (
      <Tooltip label={tooltipMessage}>
        <HStack spacing={2}>
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={isHealthy ? 'green.500' : 'orange.500'}
            shadow="sm"
          />
          {showText && (
            <Text fontSize={textSizes[size]} color="gray.600">
              {isHealthy ? 'Conectado' : 'Problemas'}
            </Text>
          )}
        </HStack>
      </Tooltip>
    );
  }
  
  // Hook personalizado para usar el estado de conexión
  export function useServerStatus() {
    const { data: health, isLoading, error } = useSystemHealth();
    
    const isOnline = !isLoading && !error && health?.backend;
    const hasApiIssues = health && (!health.apis.people || !health.apis.resources || !health.apis.users);
    
    return {
      isLoading,
      isOnline,
      hasApiIssues,
      health,
      status: isLoading 
        ? 'checking' 
        : isOnline 
          ? hasApiIssues 
            ? 'partial' 
            : 'online'
          : 'offline'
    };
  }