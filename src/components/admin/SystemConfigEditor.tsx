'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw, FiBook, FiSettings } from 'react-icons/fi';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import * as Icons from 'react-icons/fi';

// Lista de iconos disponibles
const availableIcons = [
  { name: 'FiBook', label: 'Libro', icon: Icons.FiBook },
  { name: 'FiBookOpen', label: 'Libro Abierto', icon: Icons.FiBookOpen },
  { name: 'FiHome', label: 'Casa', icon: Icons.FiHome },
  { name: 'FiSettings', label: 'Configuración', icon: Icons.FiSettings },
  { name: 'FiGrid', label: 'Cuadrícula', icon: Icons.FiGrid },
  { name: 'FiStar', label: 'Estrella', icon: Icons.FiStar },
  { name: 'FiHeart', label: 'Corazón', icon: Icons.FiHeart },
  { name: 'FiAward', label: 'Premio', icon: Icons.FiAward },
  { name: 'FiGlobe', label: 'Globo', icon: Icons.FiGlobe },
  { name: 'FiUsers', label: 'Usuarios', icon: Icons.FiUsers },
  { name: 'FiBarChart', label: 'Gráfico', icon: Icons.FiBarChart },
  { name: 'FiCalendar', label: 'Calendario', icon: Icons.FiCalendar },
  { name: 'FiClock', label: 'Reloj', icon: Icons.FiClock },
  { name: 'FiMapPin', label: 'Ubicación', icon: Icons.FiMapPin },
  { name: 'FiCheckCircle', label: 'Verificado', icon: Icons.FiCheckCircle },
];

export function SystemConfigEditor() {
  const { config, updateConfig, isLoading, getIconComponent } = useSystemConfig();
  const [formData, setFormData] = useState({
    sidebarTitle: config.sidebarTitle,
    sidebarSubtitle: config.sidebarSubtitle,
    sidebarIcon: config.sidebarIcon,
    version: config.version,
  });

  // Actualizar el formulario cuando cambie la configuración
  React.useEffect(() => {
    setFormData({
      sidebarTitle: config.sidebarTitle,
      sidebarSubtitle: config.sidebarSubtitle,
      sidebarIcon: config.sidebarIcon,
      version: config.version,
    });
  }, [config]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    await updateConfig(formData);
  };

  const handleReset = () => {
    setFormData({
      sidebarTitle: config.sidebarTitle,
      sidebarSubtitle: config.sidebarSubtitle,
      sidebarIcon: config.sidebarIcon,
      version: config.version,
    });
  };

  const hasChanges = 
    formData.sidebarTitle !== config.sidebarTitle ||
    formData.sidebarSubtitle !== config.sidebarSubtitle ||
    formData.sidebarIcon !== config.sidebarIcon ||
    formData.version !== config.version;

  const SelectedIcon = getIconComponent(formData.sidebarIcon);

  return (
    <VStack spacing={6} align="stretch">

      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader pb={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold" color="gray.800">
                Configuración del Sidebar
              </Text>
              <Text fontSize="sm" color="gray.600">
                Personaliza la apariencia del menú lateral
              </Text>
            </VStack>
            <Badge colorScheme="blue" variant="subtle">
              Sistema
            </Badge>
          </HStack>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={6} align="stretch">
            {/* Vista previa */}
            <Box p={4} bg="gray.50" rounded="lg" border="1px" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
                Vista previa del sidebar:
              </Text>
              <HStack spacing={3}>
                <Box
                  w={10}
                  h={10}
                  bg="blue.500"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <SelectedIcon color="white" size={20} />
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                    {formData.sidebarTitle || 'Título del sistema'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {formData.sidebarSubtitle || 'Subtítulo del sistema'}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Divider />

            {/* Formulario */}
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Título del Sistema
                </FormLabel>
                <Input
                  value={formData.sidebarTitle}
                  onChange={(e) => handleInputChange('sidebarTitle', e.target.value)}
                  placeholder="Ej: Biblioteca Escolar"
                  bg="white"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                  }}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Este título se mostrará en el menú lateral
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Subtítulo del Sistema
                </FormLabel>
                <Input
                  value={formData.sidebarSubtitle}
                  onChange={(e) => handleInputChange('sidebarSubtitle', e.target.value)}
                  placeholder="Ej: Sistema de Biblioteca"
                  bg="white"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                  }}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Subtítulo que aparece debajo del título principal
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Icono del Sistema
                </FormLabel>
                <Select
                  value={formData.sidebarIcon}
                  onChange={(e) => handleInputChange('sidebarIcon', e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                  }}
                >
                  {availableIcons.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <option key={iconOption.name} value={iconOption.name}>
                        {iconOption.label} ({iconOption.name})
                      </option>
                    );
                  })}
                </Select>
                <FormHelperText fontSize="xs" color="gray.500">
                  Icono que se mostrará junto al título en el menú lateral
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Versión del Sistema
                </FormLabel>
                <Input
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="Ej: 1.0.0"
                  bg="white"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                  }}
                />
                <FormHelperText fontSize="xs" color="gray.500">
                  Versión que se mostrará en el pie del menú lateral
                </FormHelperText>
              </FormControl>
            </VStack>

            <Divider />

            {/* Acciones */}
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.500">
                Última actualización: {new Date(config.lastUpdated).toLocaleString()}
              </Text>
              <HStack spacing={3}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiRefreshCw />}
                  onClick={handleReset}
                  isDisabled={!hasChanges || isLoading}
                >
                  Restaurar
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleSave}
                  isLoading={isLoading}
                  isDisabled={!hasChanges}
                >
                  Guardar Cambios
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
} 