'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { FiBell, FiAlertTriangle, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export const NotificationBell: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  // Hook para obtener notificaciones
  const { notifications, stats, loading: notificationsLoading, refreshNotifications } = useNotifications();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: 'overdue' | 'expiring') => {
    return type === 'overdue' ? FiAlertTriangle : FiClock;
  };

  const getNotificationColor = (type: 'overdue' | 'expiring') => {
    return type === 'overdue' ? 'red' : 'orange';
  };

  const getDaysColor = (days: number, type: 'overdue' | 'expiring') => {
    if (type === 'overdue') {
      if (days <= 7) return 'orange';
      if (days <= 14) return 'red';
      return 'purple';
    } else {
      if (days === 1) return 'red';
      if (days === 2) return 'orange';
      return 'yellow';
    }
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="Notificaciones"
            icon={<FiBell />}
            variant="ghost"
            size="md"
            onClick={onOpen}
            color={stats.total > 0 ? 'orange.500' : 'gray.500'}
            _hover={{ bg: 'gray.100' }}
          />
          {stats.total > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {stats.total > 99 ? '99+' : stats.total}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="xl"
        maxW="400px"
        maxH="500px"
        overflow="hidden"
      >
        <PopoverHeader
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
          p={4}
        >
          <HStack justify="space-between" align="center">
            <Text fontWeight="semibold" fontSize="md">
              Notificaciones
            </Text>
            <HStack spacing={2}>
              <IconButton
                aria-label="Refrescar"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                isLoading={loading}
              />
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <IconButton
                  aria-label="Cerrar"
                  icon={<FiX />}
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                />
              )}
            </HStack>
          </HStack>
          
          {/* Resumen de notificaciones */}
          {stats.total > 0 && (
            <HStack spacing={4} mt={2}>
              {stats.overdue > 0 && (
                <Badge colorScheme="red" variant="subtle">
                  {stats.overdue} vencido{stats.overdue !== 1 ? 's' : ''}
                </Badge>
              )}
              {stats.expiring > 0 && (
                <Badge colorScheme="orange" variant="subtle">
                  {stats.expiring} por vencer
                </Badge>
              )}
            </HStack>
          )}
          
          {/* ✅ DEBUG: Información de depuración */}
          <Box mt={2} p={2} bg="gray.50" borderRadius="md" fontSize="xs">
            <Text color="gray.600">
              Debug: Total={stats.total}, Vencidos={stats.overdue}, Por vencer={stats.expiring}
            </Text>
            <Text color="gray.500">
              Loading: {notificationsLoading ? 'Sí' : 'No'}
            </Text>
          </Box>
        </PopoverHeader>
        
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          {notificationsLoading ? (
            <Box p={4} textAlign="center">
              <Spinner size="md" />
              <Text mt={2} fontSize="sm" color="gray.500">
                Cargando notificaciones...
              </Text>
            </Box>
          ) : stats.total === 0 ? (
            <Box p={4} textAlign="center">
              <FiBell size={24} color="#CBD5E0" />
              <Text mt={2} fontSize="sm" color="gray.500">
                No hay notificaciones
              </Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Link href={`/loans?loanId=${notification.loanId}`}>
                    <Box
                      p={4}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      transition="background 0.2s"
                    >
                      <HStack spacing={3} align="start">
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={`${getNotificationColor(notification.type)}.50`}
                        >
                          <Icon
                            as={getNotificationIcon(notification.type)}
                            color={`${getNotificationColor(notification.type)}.500`}
                            boxSize={4}
                          />
                        </Box>
                        
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="semibold" fontSize="sm">
                              {notification.title}
                            </Text>
                            <Badge
                              colorScheme={getDaysColor(notification.days, notification.type)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {notification.days} día{notification.days !== 1 ? 's' : ''}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {notification.personName}
                          </Text>
                          
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {notification.resourceTitle}
                          </Text>
                          
                          <Text fontSize="xs" color="gray.400">
                            Vence: {format(notification.dueDate, 'dd/MM/yyyy', { locale: es })}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Link>
                  
                  {index < notifications.length - 1 && (
                    <Divider borderColor="gray.100" />
                  )}
                </Box>
              ))}
              
              {/* Enlace para ver todas las notificaciones */}
              <Box p={3} borderTop="1px" borderColor="gray.100">
                <Link href="/loans">
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Ver todos los préstamos
                  </Text>
                </Link>
              </Box>
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}; 