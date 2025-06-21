// src/components/loans/LoanManagement.tsx
// ================================================================
// COMPONENTE PRINCIPAL DE GESTIÓN DE PRÉSTAMOS - COMPLETO Y CORREGIDO
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useDisclosure,
  Container,
  useToast
} from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';

// FIX: Usar react-icons/fi en lugar de lucide-react
import { 
  FiBook, 
  FiPlus, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiFileText
} from 'react-icons/fi';

// Importar componentes hijos
import LoansList from './LoansList';
import ReturnsManagement from './ReturnsManagement';
import OverdueManagement from './OverdueManagement';
import LoanStatistics from './LoanStatistics';
import CreateLoanModal from './CreateLoanModal';

// ===== INTERFACES =====

interface TabInfo {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

// ===== COMPONENTE PRINCIPAL =====

const LoanManagement: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = useSearchParams();
  const toast = useToast();

  // ✅ NUEVO: Obtener resourceId y loanId desde URL parameters
  const resourceId = searchParams.get('resourceId');
  const loanId = searchParams.get('loanId');

  // ✅ NUEVO: Abrir modal automáticamente si hay resourceId
  useEffect(() => {
    if (resourceId) {
      onOpen();
    }
  }, [resourceId, onOpen]);

  // ✅ NUEVO: Cambiar a la pestaña de "Lista de Préstamos" si hay loanId
  useEffect(() => {
    if (loanId) {
      setActiveTabIndex(0); // Cambiar a la primera pestaña (Lista de Préstamos)
    }
  }, [loanId]);

  // Valores de color mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('lg', 'dark-lg');

  // Definir tabs con sus componentes - Reorganizados por prioridad
  const tabs: TabInfo[] = [
    { 
      id: 'loans', 
      label: 'Lista de Préstamos', 
      icon: FiBook,
      component: LoansList
    },
    { 
      id: 'returns', 
      label: 'Devoluciones', 
      icon: FiRefreshCw,
      component: ReturnsManagement
    },
    { 
      id: 'overdue', 
      label: 'Préstamos Vencidos', 
      icon: FiAlertTriangle,
      component: OverdueManagement
    },
    { 
      id: 'stats', 
      label: 'Estadísticas y Reportes', 
      icon: FiFileText,
      component: LoanStatistics
    }
  ];

  // ===== MANEJADORES =====

  const handleLoanCreated = () => {
    // ✅ CORREGIDO: Limpiar URL y cerrar modal sin recargar página
    if (resourceId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('resourceId');
      window.history.replaceState({}, '', url.toString());
    }
    onClose();
    
    // ✅ MEJORADO: En lugar de recargar, podríamos usar un estado global o context
    // Por ahora, recargamos solo si no hay resourceId (préstamo normal)
    if (!resourceId) {
      window.location.reload();
    }
  };

  // ✅ NUEVO: Handler para cerrar modal y limpiar URL
  const handleCloseModal = () => {
    onClose();
    // Limpiar el parámetro resourceId de la URL
    if (resourceId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('resourceId');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // ✅ NUEVO: Handler para limpiar loanId de la URL
  const handleLoanDetailsClosed = () => {
    if (loanId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('loanId');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // ===== RENDER =====

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box
        bg={headerBg}
        shadow={shadowColor}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1}
      >
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <Flex 
            align="center" 
            justify="space-between" 
            h={16}
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 4, md: 0 }}
            py={{ base: 4, md: 0 }}
          >
            <HStack spacing={4}>
              <Box
                p={2}
                bg="blue.500"
                color="white"
                rounded="lg"
              >
                <FiBook size={24} />
              </Box>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color={useColorModeValue('gray.900', 'white')}
              >
                Gestión de Préstamos
              </Text>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onOpen}
                size={{ base: 'sm', md: 'md' }}
                w={{ base: 'full', md: 'auto' }}
              >
                Nuevo Préstamo
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Contenido Principal */}
      <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }} py={8}>
        <VStack spacing={8} align="stretch">
          {/* Tabs de Navegación */}
          <Box
            bg={bgColor}
            rounded="lg"
            shadow="md"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Tabs 
              index={activeTabIndex} 
              onChange={setActiveTabIndex}
              variant="enclosed"
              colorScheme="blue"
            >
              <TabList
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderBottom="1px"
                borderColor={borderColor}
                overflowX="auto"
                css={{
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  }
                }}
              >
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <Tab
                      key={tab.id}
                      minW="fit-content"
                      _selected={{
                        color: 'blue.600',
                        borderColor: 'blue.500',
                        borderBottomColor: 'transparent',
                        bg: bgColor
                      }}
                    >
                      <HStack spacing={2}>
                        <Icon size={16} />
                        <Text 
                          fontSize={{ base: 'sm', md: 'md' }}
                          whiteSpace="nowrap"
                        >
                          {tab.label}
                        </Text>
                      </HStack>
                    </Tab>
                  );
                })}
              </TabList>

              <TabPanels>
                {tabs.map((tab, index) => {
                  const Component = tab.component;
                  return (
                    <TabPanel key={tab.id} p={6}>
                      <Component 
                        preSelectedLoanId={loanId || undefined}
                        onLoanDetailsClosed={handleLoanDetailsClosed}
                      />
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>

      {/* Modal de Crear Préstamo */}
      <CreateLoanModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onSuccess={handleLoanCreated}
        preSelectedResourceId={resourceId || undefined}
      />
    </Box>
  );
};

export default LoanManagement;