'use client';

import React, { useState, useRef } from 'react';
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
  Image,
  Switch,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw, FiBook, FiSettings, FiImage, FiLink, FiUpload } from 'react-icons/fi';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import { systemConfigService } from '@/services/system-config.service';
import * as Icons from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

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

// Constantes para validación
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUGGESTED_WIDTH = 100;
const SUGGESTED_HEIGHT = 100;

export function SystemConfigEditor() {
  const { config, updateConfig, isLoading, getIconComponent, refreshConfig } = useSystemConfig();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    sidebarTitle: '',
    sidebarSubtitle: '',
    sidebarIcon: 'FiBook',
    sidebarIconUrl: '',
    sidebarIconImage: '',
    description: '',
  });
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [iconType, setIconType] = useState<'system' | 'url' | 'upload'>('system');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Actualizar el formulario cuando cambie la configuración
  React.useEffect(() => {
    if (config) {
      setFormData({
        sidebarTitle: config.sidebarTitle || '',
        sidebarSubtitle: config.sidebarSubtitle || '',
        sidebarIcon: config.sidebarIcon || 'FiBook',
        sidebarIconUrl: config.sidebarIconUrl || '',
        sidebarIconImage: config.sidebarIconImage || '',
        description: config.description || '',
      });
      
      if (config.sidebarIconImage) {
        setUseCustomIcon(true);
        setIconType('upload');
      } else if (config.sidebarIconUrl) {
        setUseCustomIcon(true);
        setIconType('url');
      } else {
        setUseCustomIcon(false);
        setIconType('system');
      }
    }
  }, [config]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mostrar spinner mientras carga autenticación o configuración
  if (authLoading || isLoading || !config) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">
            {authLoading ? 'Verificando autenticación...' : 
             isLoading ? 'Cargando configuración...' : 
             'Inicializando...'}
          </Text>
        </VStack>
      </Center>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación cuando se cambia la URL
    if (field === 'sidebarIconUrl') {
      setUrlValidationError('');
    }
  };

  const handleIconTypeChange = (type: 'system' | 'url' | 'upload') => {
    setIconType(type);
    setUseCustomIcon(type !== 'system');
    setUploadError('');
    setUrlValidationError('');
    
    if (type === 'system') {
      setFormData(prev => ({ ...prev, sidebarIconUrl: '' }));
    } else if (type === 'url') {
      setFormData(prev => ({ ...prev, sidebarIconUrl: '' }));
    }
  };

  const validateImageUrl = async (url: string) => {
    if (!url.trim()) return true;
    
    setIsValidatingUrl(true);
    setUrlValidationError('');
    
    try {
      console.log('🔍 Iniciando validación de URL:', url);
      const isValid = await systemConfigService.validateImageUrl(url);
      
      if (!isValid) {
        setUrlValidationError('La URL no apunta a una imagen válida. Verifica que la URL sea correcta y que el archivo sea una imagen.');
        console.log('❌ Validación falló para URL:', url);
      } else {
        console.log('✅ Validación exitosa para URL:', url);
      }
      return isValid;
    } catch (error) {
      console.error('❌ Error durante validación:', error);
      setUrlValidationError('Error al validar la URL de la imagen. Verifica la conexión a internet y que la URL sea accesible.');
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB permitido`);
      return;
    }

    // Validar dimensiones (opcional, solo advertencia)
    const img = new window.Image();
    img.onload = async () => {
      if (img.width !== SUGGESTED_WIDTH || img.height !== SUGGESTED_HEIGHT) {
        toast({
          title: 'Advertencia',
          description: `Se sugiere usar una imagen de ${SUGGESTED_WIDTH}x${SUGGESTED_HEIGHT}px para mejor calidad`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    img.src = URL.createObjectURL(file);

    // Convertir a base64 para vista previa (sin subir al servidor)
    setIsUploading(true);
    setUploadError('');
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        
        // Actualizar solo la vista previa, no guardar en el servidor
        setFormData(prev => ({
          ...prev,
          sidebarIconImage: base64Image
        }));
        
        toast({
          title: 'Imagen cargada',
          description: 'La imagen se ha cargado para vista previa. Haz clic en "Guardar cambios" para aplicarla.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Error al procesar la imagen');
      toast({
        title: 'Error',
        description: 'No se pudo procesar la imagen',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validar URL si se está usando
      if (iconType === 'url' && formData.sidebarIconUrl) {
        const isValidUrl = await validateImageUrl(formData.sidebarIconUrl);
        if (!isValidUrl) {
          toast({
            title: 'Error de validación',
            description: 'La URL de la imagen no es válida. Corrige la URL antes de guardar.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
      }

      // Preparar datos para guardar
      const configData = {
        sidebarTitle: formData.sidebarTitle,
        sidebarSubtitle: formData.sidebarSubtitle,
        sidebarIcon: iconType === 'system' ? formData.sidebarIcon : 'FiImage',
        sidebarIconUrl: iconType === 'url' ? formData.sidebarIconUrl : '',
        sidebarIconImage: iconType === 'upload' ? formData.sidebarIconImage : '',
        description: formData.description,
      };

      await systemConfigService.updateConfig(configData);
      await updateConfig(configData);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast({
        title: 'Error al guardar',
        description: 'No se pudieron guardar los cambios. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getPreviewImage = () => {
    if (iconType === 'upload' && formData.sidebarIconImage) {
      return formData.sidebarIconImage;
    }
    if (iconType === 'url' && formData.sidebarIconUrl) {
      return formData.sidebarIconUrl;
    }
    return null;
  };

  const previewImage = getPreviewImage();
  const IconComponent = getIconComponent(formData.sidebarIcon);

  return (
    <VStack spacing={6} align="stretch">

      {/* Configuración del sidebar */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <Icon as={FiSettings} />
            Configuración del Sidebar
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Título y subtítulo */}
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Título del sidebar</FormLabel>
                <Input
                  value={formData.sidebarTitle}
                  onChange={(e) => handleInputChange('sidebarTitle', e.target.value)}
                  placeholder="Ej: Biblioteca Escolar"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Subtítulo del sidebar</FormLabel>
                <Input
                  value={formData.sidebarSubtitle}
                  onChange={(e) => handleInputChange('sidebarSubtitle', e.target.value)}
                  placeholder="Ej: Sistema de Biblioteca"
                />
              </FormControl>
            </HStack>

            {/* Tipo de icono */}
            <FormControl>
              <FormLabel>Tipo de icono</FormLabel>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  variant={iconType === 'system' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => handleIconTypeChange('system')}
                  leftIcon={<Icon as={FiBook} />}
                >
                  Icono del sistema
                </Button>
                <Button
                  size="sm"
                  variant={iconType === 'url' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => handleIconTypeChange('url')}
                  leftIcon={<Icon as={FiLink} />}
                >
                  URL de imagen
                </Button>
                <Button
                  size="sm"
                  variant={iconType === 'upload' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => handleIconTypeChange('upload')}
                  leftIcon={<Icon as={FiUpload} />}
                >
                  Subir imagen
                </Button>
              </HStack>
            </FormControl>

            {/* Configuración específica según el tipo de icono */}
            {iconType === 'system' && (
              <FormControl>
                <FormLabel>Seleccionar icono</FormLabel>
                <Select
                  value={formData.sidebarIcon}
                  onChange={(e) => handleInputChange('sidebarIcon', e.target.value)}
                >
                  {availableIcons.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {iconType === 'url' && (
              <FormControl isInvalid={!!urlValidationError}>
                <FormLabel>URL de la imagen</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    {isValidatingUrl ? (
                      <Spinner size="sm" color="blue.500" />
                    ) : (
                      <Icon as={FiLink} color="gray.400" />
                    )}
                  </InputLeftElement>
                  <Input
                    value={formData.sidebarIconUrl}
                    onChange={(e) => handleInputChange('sidebarIconUrl', e.target.value)}
                    placeholder="https://ejemplo.com/imagen.png"
                    isDisabled={isValidatingUrl}
                  />
                </InputGroup>
                <HStack spacing={2} mt={2}>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (formData.sidebarIconUrl) {
                        console.log('🧪 Probando URL específica:', formData.sidebarIconUrl);
                        const result = await systemConfigService.testImageUrl(formData.sidebarIconUrl);
                        console.log('🧪 Resultado detallado:', result);
                        
                        if (result.isValid) {
                          toast({
                            title: 'URL válida',
                            description: 'La URL apunta a una imagen válida',
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                          });
                        } else {
                          toast({
                            title: 'URL inválida',
                            description: 'La URL no apunta a una imagen válida. Revisa la consola para más detalles.',
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                          });
                        }
                      }
                    }}
                    isDisabled={!formData.sidebarIconUrl || isValidatingUrl}
                    leftIcon={<Icon as={FiRefreshCw} />}
                  >
                    Probar URL
                  </Button>
                </HStack>
                {urlValidationError && (
                  <FormHelperText color="red.500">{urlValidationError}</FormHelperText>
                )}
                <FormHelperText>
                  {isValidatingUrl 
                    ? 'Validando URL...' 
                    : 'Ingresa la URL de una imagen (JPEG, PNG, GIF, WebP). Tamaño sugerido: 100x100px.'
                  }
                </FormHelperText>
              </FormControl>
            )}

            {iconType === 'upload' && (
              <FormControl isInvalid={!!uploadError}>
                <FormLabel>Subir imagen</FormLabel>
                <VStack spacing={3} align="stretch">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Icon as={FiUpload} />}
                    isLoading={isUploading}
                    loadingText="Procesando..."
                  >
                    Seleccionar imagen
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  {uploadError && (
                    <Text color="red.500" fontSize="sm">{uploadError}</Text>
                  )}
                  <FormHelperText>
                    Formatos permitidos: JPEG, PNG, GIF, WebP. Tamaño máximo: 2MB. Tamaño sugerido: 100x100px.
                  </FormHelperText>
                </VStack>
              </FormControl>
            )}

            {/* Vista previa */}
            <Box>
              <FormLabel>Vista previa</FormLabel>
              <HStack spacing={3} p={4} border="1px" borderColor={borderColor} borderRadius="md">
                <Box
                  w={10}
                  h={10}
                  bg="blue.500"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Vista previa"
                      w="full"
                      h="full"
                      objectFit="cover"
                      fallback={<IconComponent color="white" size={20} />}
                    />
                  ) : (
                    <IconComponent color="white" size={20} />
                  )}
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontWeight="bold" fontSize="lg">
                    {formData.sidebarTitle || 'Título del sidebar'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {formData.sidebarSubtitle || 'Subtítulo del sidebar'}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Descripción */}
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción opcional de la configuración"
              />
              <FormHelperText>
                Descripción opcional para identificar esta configuración.
              </FormHelperText>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Botones de acción */}
      <HStack spacing={4} justify="flex-end">
        <Button
          onClick={async () => {
            try {
              await refreshConfig();
              toast({
                title: 'Configuración recargada',
                description: 'La configuración se ha recargado desde el servidor',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            } catch (error) {
              toast({
                title: 'Error al recargar',
                description: 'No se pudo recargar la configuración',
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            }
          }}
          leftIcon={<Icon as={FiRefreshCw} />}
          variant="outline"
          isLoading={isLoading}
        >
          Recargar
        </Button>
        <Button
          onClick={handleSave}
          leftIcon={<Icon as={FiSave} />}
          colorScheme="blue"
          isLoading={isLoading}
          loadingText="Guardando..."
        >
          Guardar cambios
        </Button>
      </HStack>
    </VStack>
  );
} 