import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';
import { getPersonTypeLabel } from '@/utils/personType.utils';
import { systemConfigService, SystemConfig } from '@/services/system-config.service';

export interface PDFReportOptions {
  title: string;
  filterType: string;
  data: PersonLoanSummary[];
  generatedBy?: string;
  systemConfig?: SystemConfig;
}

export class PDFService {
  // ✅ NUEVO: Función para obtener la configuración del sistema
  private static async getSystemConfig(): Promise<SystemConfig | null> {
    try {
      const config = await systemConfigService.getActiveConfig();
      return config;
    } catch (error) {
      console.error('Error obteniendo configuración del sistema:', error);
      return null;
    }
  }

  // ✅ NUEVO: Función para probar la accesibilidad de una URL
  private static async testUrlAccessibility(url: string): Promise<boolean> {
    try {
      console.log('🔍 Probando accesibilidad de URL:', url);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      const isAccessible = response.ok;
      console.log('📊 Resultado de prueba de accesibilidad:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        isAccessible
      });
      
      return isAccessible;
    } catch (error) {
      console.error('❌ Error probando accesibilidad de URL:', error);
      return false;
    }
  }

  // ✅ NUEVO: Función para convertir URL externa a base64
  private static async convertUrlToBase64(url: string): Promise<string | null> {
    try {
      console.log('🔄 Convirtiendo URL a base64:', url);
      
      // Crear un canvas para procesar la imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ No se pudo obtener contexto del canvas');
        return null;
      }
      
      // Crear una nueva imagen
      const img = new Image();
      
      // Configurar CORS para la imagen
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        // Timeout para evitar que se quede colgado
        const timeout = setTimeout(() => {
          console.error('❌ Timeout cargando imagen desde URL');
          reject(new Error('Timeout cargando imagen'));
        }, 10000); // 10 segundos de timeout
        
        img.onload = () => {
          try {
            clearTimeout(timeout);
            console.log('✅ Imagen cargada exitosamente, dimensiones:', img.width, 'x', img.height);
            
            // Configurar el tamaño del canvas
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Dibujar la imagen en el canvas
            ctx.drawImage(img, 0, 0);
            
            // Convertir a base64
            const base64 = canvas.toDataURL('image/png');
            console.log('✅ URL convertida exitosamente a base64, longitud:', base64.length);
            resolve(base64);
          } catch (error) {
            clearTimeout(timeout);
            console.error('❌ Error procesando imagen:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          clearTimeout(timeout);
          console.error('❌ Error cargando imagen desde URL:', error);
          console.error('📊 Detalles del error de carga:', {
            url: url,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
          
          // Intentar con fetch como alternativa
          console.log('🔄 Intentando con fetch como alternativa...');
          this.convertUrlToBase64WithFetch(url)
            .then(resolve)
            .catch((fetchError) => {
              console.error('❌ Error también con fetch:', fetchError);
              reject(error);
            });
        };
        
        // Cargar la imagen
        console.log('📥 Iniciando carga de imagen...');
        img.src = url;
      });
    } catch (error) {
      console.error('❌ Error en convertUrlToBase64:', error);
      return null;
    }
  }

  // ✅ NUEVO: Función alternativa usando fetch para URLs que no permiten CORS
  private static async convertUrlToBase64WithFetch(url: string): Promise<string | null> {
    try {
      console.log('🔄 Intentando conversión con fetch:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('✅ Blob obtenido, tipo:', blob.type, 'tamaño:', blob.size);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          console.log('✅ Conversión con fetch exitosa, longitud:', base64.length);
          resolve(base64);
        };
        reader.onerror = () => {
          console.error('❌ Error leyendo blob');
          reject(new Error('Error leyendo blob'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error en convertUrlToBase64WithFetch:', error);
      return null;
    }
  }

  // ✅ NUEVO: Función para obtener el logo a mostrar
  private static async getLogoToDisplay(config: SystemConfig | null): Promise<{ url: string; format: string } | null> {
    if (!config) {
      console.log('🔍 No hay configuración del sistema disponible');
      return null;
    }
    
    console.log('🔍 Analizando configuración del logo:', {
      hasImage: !!config.sidebarIconImage,
      hasUrl: !!config.sidebarIconUrl,
      icon: config.sidebarIcon
    });
    
    // Prioridad: imagen subida > URL > icono del sistema
    if (config.sidebarIconImage && config.sidebarIconImage.trim()) {
      console.log('🖼️ Usando imagen subida (base64)');
      // Detectar formato de la imagen
      const format = this.detectImageFormat(config.sidebarIconImage);
      return { url: config.sidebarIconImage, format };
    }
    
    if (config.sidebarIconUrl && config.sidebarIconUrl.trim()) {
      console.log('🔗 Usando URL de imagen:', config.sidebarIconUrl);
      
      try {
        // Probar accesibilidad de la URL primero
        const isAccessible = await this.testUrlAccessibility(config.sidebarIconUrl);
        
        if (!isAccessible) {
          console.log('❌ URL no es accesible, saltando conversión');
          return null;
        }
        
        // Convertir URL externa a base64
        const base64Image = await this.convertUrlToBase64(config.sidebarIconUrl);
        
        if (base64Image) {
          console.log('✅ URL convertida exitosamente a base64');
          const format = this.detectImageFormat(base64Image);
          return { url: base64Image, format };
        } else {
          console.log('❌ No se pudo convertir la URL a base64');
          return null;
        }
      } catch (error) {
        console.error('❌ Error convirtiendo URL a base64:', error);
        return null;
      }
    }
    
    console.log('❌ No hay imagen configurada, usando solo texto');
    return null;
  }

  // ✅ NUEVO: Función para detectar formato de imagen desde base64
  private static detectImageFormat(base64String: string): string {
    try {
      // Extraer el tipo MIME del data URL
      const match = base64String.match(/^data:([^;]+);base64,/);
      if (match) {
        const mimeType = match[1];
        console.log('📋 MIME type detectado:', mimeType);
        
        // Mapear MIME types a formatos de jsPDF
        switch (mimeType) {
          case 'image/jpeg':
          case 'image/jpg':
            return 'JPEG';
          case 'image/png':
            return 'PNG';
          case 'image/webp':
            return 'WEBP';
          default:
            console.log('⚠️ Formato no soportado, intentando PNG:', mimeType);
            return 'PNG';
        }
      }
    } catch (error) {
      console.error('❌ Error detectando formato:', error);
    }
    
    console.log('⚠️ No se pudo detectar formato, usando PNG por defecto');
    return 'PNG';
  }

  // ✅ NUEVO: Función para detectar formato de imagen desde URL
  private static detectImageFormatFromUrl(url: string): string {
    try {
      const extension = url.split('.').pop()?.toLowerCase();
      console.log('📋 Extensión detectada:', extension);
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          return 'JPEG';
        case 'png':
          return 'PNG';
        case 'webp':
          return 'WEBP';
        default:
          console.log('⚠️ Extensión no reconocida, usando PNG por defecto:', extension);
          return 'PNG';
      }
    } catch (error) {
      console.error('❌ Error detectando formato desde URL:', error);
    }
    
    return 'PNG';
  }

  private static formatDate(date: Date | string): string {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return 'Fecha inválida';
      }
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  }

  private static getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('activo')) return '#10B981';
    if (statusLower.includes('vencido')) return '#EF4444';
    if (statusLower.includes('devuelto')) return '#3B82F6';
    if (statusLower.includes('perdido')) return '#6B7280';
    return '#6B7280';
  }

  private static async generateHeader(doc: jsPDF, options: PDFReportOptions): Promise<void> {
    const logoInfo = await this.getLogoToDisplay(options.systemConfig || null);
    
    // Posición inicial
    let currentY = 20;
    
    // Logo en la parte superior izquierda (si existe)
    if (logoInfo) {
      console.log('🎨 Intentando agregar logo al PDF:', {
        format: logoInfo.format,
        urlLength: logoInfo.url.length,
        urlPreview: logoInfo.url.substring(0, 50) + '...'
      });
      
      try {
        // Intentar agregar la imagen del logo
        doc.addImage(logoInfo.url, logoInfo.format, 20, currentY, 15, 15);
        console.log('✅ Logo agregado exitosamente al PDF');
        currentY += 20; // Espacio después del logo
      } catch (error) {
        console.error('❌ Error agregando logo al PDF:', error);
        console.error('📊 Detalles del error:', {
          message: error instanceof Error ? error.message : 'Error desconocido',
          format: logoInfo.format,
          urlType: logoInfo.url.startsWith('data:') ? 'base64' : 'url'
        });
        
        // Intentar con formato alternativo si falla
        try {
          console.log('🔄 Intentando con formato PNG como fallback...');
          doc.addImage(logoInfo.url, 'PNG', 20, currentY, 15, 15);
          console.log('✅ Logo agregado con formato PNG fallback');
          currentY += 20;
        } catch (fallbackError) {
          console.error('❌ Error también con formato PNG:', fallbackError);
          // Si falla, continuar sin logo
          currentY = 20;
        }
      }
    } else {
      console.log('ℹ️ No hay logo configurado, continuando sin logo');
    }
    
    // Título del reporte
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(options.title, 20, currentY);
    currentY += 10;

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    
    const generatedBy = options.generatedBy || 'Sistema';
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Generado por: ${generatedBy}`, 20, currentY);
    currentY += 5;
    doc.text(`Fecha: ${currentDate}`, 20, currentY);
    currentY += 5;
    
    // Información del sistema (si está disponible)
    if (options.systemConfig) {
      doc.text(`Sistema: ${options.systemConfig.sidebarTitle}`, 20, currentY);
      currentY += 5;
      doc.text(`Versión: ${options.systemConfig.version}`, 20, currentY);
    }
    
    // Línea separadora
    currentY += 10;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, currentY, 190, currentY);
  }

  private static generatePersonTable(doc: jsPDF, data: PersonLoanSummary[], filterType: string): void {
    // Determinar qué columnas mostrar según el filtro
    const isActiveFilter = filterType.toLowerCase().includes('activos');
    const isOverdueFilter = filterType.toLowerCase().includes('vencidos');
    const isLostFilter = filterType.toLowerCase().includes('perdidos');
    const isGeneralReport = !isActiveFilter && !isOverdueFilter && !isLostFilter;
    
    if (isActiveFilter) {
      // Para préstamos activos: mostrar solo información relevante
      const tableData = data.map(person => [
        person.person?.name || 'Sin nombre',
        person.person?.documentNumber || 'Sin documento',
        getPersonTypeLabel(person.person?.personType) || 'Sin tipo',
        person.personStatus === 'up_to_date' ? 'Al día' : 'No está al día',
        person.summary?.activeLoans || 0,
        this.getActiveResourceName(person) || 'Sin recurso'
      ]);

      (doc as any).autoTable({
        startY: 115,
        head: [[
          'Persona',
          'Documento',
          'Tipo',
          'Estado',
          'Activos',
          'Recurso'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
      });
    } else if (isOverdueFilter) {
      // Para préstamos vencidos: mostrar solo información relevante
      const tableData = data.map(person => [
        person.person?.name || 'Sin nombre',
        person.person?.documentNumber || 'Sin documento',
        getPersonTypeLabel(person.person?.personType) || 'Sin tipo',
        person.personStatus === 'up_to_date' ? 'Al día' : 'No está al día',
        person.summary?.overdueLoans || 0,
        this.getOverdueResourceName(person) || 'Sin recurso'
      ]);

      (doc as any).autoTable({
        startY: 115,
        head: [[
          'Persona',
          'Documento',
          'Tipo',
          'Estado',
          'Vencidos',
          'Recurso'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68], // Red color para vencidos
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
      });
    } else if (isLostFilter) {
      // Para libros perdidos: mostrar solo información relevante
      const tableData = data.map(person => [
        person.person?.name || 'Sin nombre',
        person.person?.documentNumber || 'Sin documento',
        getPersonTypeLabel(person.person?.personType) || 'Sin tipo',
        person.personStatus === 'up_to_date' ? 'Al día' : 'No está al día',
        person.summary?.lostLoans || 0,
        this.getLostResourceName(person) || 'Sin recurso'
      ]);

      (doc as any).autoTable({
        startY: 115,
        head: [[
          'Persona',
          'Documento',
          'Tipo',
          'Estado',
          'Perdidos',
          'Recurso'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [107, 114, 128], // Gray color para perdidos
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
      });
    } else if (isGeneralReport) {
      // Para reporte general: mostrar todas las columnas
      const tableData = data.map(person => [
        person.person?.name || 'Sin nombre',
        person.person?.documentNumber || 'Sin documento',
        getPersonTypeLabel(person.person?.personType) || 'Sin tipo',
        person.personStatus === 'up_to_date' ? 'Al día' : 'No está al día',
        person.summary?.totalLoans || 0,
        person.summary?.activeLoans || 0,
        person.summary?.overdueLoans || 0,
        person.summary?.returnedLoans || 0,
        person.summary?.lostLoans || 0
      ]);

      (doc as any).autoTable({
        startY: 115,
        head: [[
          'Persona',
          'Documento',
          'Tipo',
          'Estado',
          'Total',
          'Activos',
          'Vencidos',
          'Devueltos',
          'Perdidos'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // Blue color para reporte general
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
      });
    }
  }

  // ✅ NUEVO: Función para obtener el nombre del recurso activo
  private static getActiveResourceName(person: PersonLoanSummary): string {
    if (!person.loans || person.loans.length === 0) {
      return 'Sin préstamos activos';
    }
    
    // Buscar préstamos activos
    const activeLoans = person.loans.filter(loan => 
      this.translateLoanStatus(loan.status) === 'Activo' || 
      (!loan.returnDate && this.translateLoanStatus(loan.status) !== 'Devuelto')
    );
    
    if (activeLoans.length === 0) {
      return 'Sin préstamos activos';
    }
    
    // Si hay múltiples préstamos activos, mostrar el primero
    const firstActiveLoan = activeLoans[0];
    return firstActiveLoan.resource?.title || 'Sin título';
  }

  // ✅ NUEVO: Función para obtener el nombre del recurso vencido
  private static getOverdueResourceName(person: PersonLoanSummary): string {
    if (!person.loans || person.loans.length === 0) {
      return 'Sin préstamos vencidos';
    }
    
    // Buscar préstamos vencidos
    const overdueLoans = person.loans.filter(loan => 
      this.translateLoanStatus(loan.status) === 'Vencido' || 
      (new Date(loan.dueDate) < new Date() && !loan.returnDate)
    );
    
    if (overdueLoans.length === 0) {
      return 'Sin préstamos vencidos';
    }
    
    // Si hay múltiples préstamos vencidos, mostrar el primero
    const firstOverdueLoan = overdueLoans[0];
    return firstOverdueLoan.resource?.title || 'Sin título';
  }

  // ✅ NUEVO: Función para obtener el nombre del recurso perdido
  private static getLostResourceName(person: PersonLoanSummary): string {
    if (!person.loans || person.loans.length === 0) {
      return 'Sin libros perdidos';
    }
    
    // Buscar libros perdidos usando la función de traducción
    const lostLoans = person.loans.filter(loan => 
      this.translateLoanStatus(loan.status) === 'Perdido'
    );
    
    if (lostLoans.length === 0) {
      return 'Sin libros perdidos';
    }
    
    // Si hay múltiples libros perdidos, mostrar el primero
    const firstLostLoan = lostLoans[0];
    return firstLostLoan.resource?.title || 'Sin título';
  }

  private static generateLoansDetails(doc: jsPDF, data: PersonLoanSummary[]): void {
    let currentY = (doc as any).lastAutoTable?.finalY + 20 || 135;
    
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Detalle de Préstamos por Persona', 20, currentY);
    currentY += 10;

    data.forEach((person, personIndex) => {
      // Verificar si hay espacio suficiente para la persona
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Encabezado de la persona
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text(`${personIndex + 1}. ${person.person?.name || 'Sin nombre'}`, 20, currentY);
      currentY += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Documento: ${person.person?.documentNumber || 'Sin documento'} | Tipo: ${getPersonTypeLabel(person.person?.personType) || 'Sin tipo'}`, 25, currentY);
      currentY += 8;

      // Tabla de préstamos de la persona
      if (person.loans && person.loans.length > 0) {
        const loansData = person.loans.map(loan => [
          loan.resource?.title || 'Sin título',
          this.formatDate(loan.loanDate),
          this.formatDate(loan.dueDate),
          this.translateLoanStatus(loan.status)
        ]);

        (doc as any).autoTable({
          startY: currentY,
          head: [['Recurso', 'Préstamo', 'Vencimiento', 'Estado']],
          body: loansData,
          theme: 'striped',
          headStyles: {
            fillColor: [107, 114, 128],
            textColor: 255,
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8
          },
          margin: { left: 25, right: 20 },
          styles: {
            cellPadding: 3
          }
        });

        currentY = (doc as any).lastAutoTable?.finalY + 10 || currentY + 50;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text('   No hay préstamos registrados', 25, currentY);
        currentY += 15;
      }
    });
  }

  private static generateFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea separadora
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, 280, 190, 280);
      
      // Información del pie de página
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Sistema de Gestión de Biblioteca - Reporte Generado Automáticamente', 20, 285);
      doc.text(`Página ${i} de ${pageCount}`, 170, 285);
    }
  }

  static async generateReport(options: PDFReportOptions): Promise<void> {
    try {
      console.log('🚀 Iniciando generación de PDF...');
      
      // Crear el documento PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Obtener configuración del sistema si no se proporciona
      let systemConfig = options.systemConfig;
      if (!systemConfig) {
        console.log('🔍 Obteniendo configuración del sistema...');
        systemConfig = await this.getSystemConfig() || undefined;
        
        if (systemConfig) {
          console.log('✅ Configuración del sistema obtenida:', {
            title: systemConfig.sidebarTitle,
            hasImage: !!systemConfig.sidebarIconImage,
            hasUrl: !!systemConfig.sidebarIconUrl,
            icon: systemConfig.sidebarIcon
          });
        } else {
          console.log('⚠️ No se pudo obtener la configuración del sistema');
        }
      } else {
        console.log('✅ Usando configuración del sistema proporcionada');
      }
      
      // Determinar si es filtro de préstamos activos, vencidos o perdidos
      const isActiveFilter = options.filterType.toLowerCase().includes('activos');
      const isOverdueFilter = options.filterType.toLowerCase().includes('vencidos');
      const isLostFilter = options.filterType.toLowerCase().includes('perdidos');
      const isGeneralReport = !isActiveFilter && !isOverdueFilter && !isLostFilter;
      
      console.log('📊 Tipo de reporte:', {
        filterType: options.filterType,
        isActiveFilter,
        isOverdueFilter,
        isLostFilter,
        isGeneralReport
      });
      
      // Generar contenido del PDF
      await this.generateHeader(doc, { ...options, systemConfig });
      this.generatePersonTable(doc, options.data, options.filterType);
      
      // Solo mostrar detalles si es reporte general (sin filtros específicos)
      if (isGeneralReport) {
        console.log('📋 Generando detalles de préstamos por persona...');
        this.generateLoansDetails(doc, options.data);
      }
      
      this.generateFooter(doc);
      
      // Generar nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `reporte_${options.filterType.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.pdf`;
      
      console.log('💾 Guardando PDF como:', fileName);
      
      // Descargar el PDF
      doc.save(fileName);
      
      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('❌ Error en generateReport:', error);
      throw new Error(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static getFilterTypeLabel(statuses: LoanStatusFilter[]): string {
    if (statuses.length === 0) return 'Todos los préstamos';
    
    const labels = statuses.map(status => {
      switch (status) {
        case LoanStatusFilter.ACTIVE: return 'Préstamos Activos';
        case LoanStatusFilter.OVERDUE: return 'Préstamos Vencidos';
        case LoanStatusFilter.RETURNED: return 'Préstamos Devueltos';
        case LoanStatusFilter.LOST: return 'Libros Perdidos';
        default: return status;
      }
    });
    
    return labels.join(', ');
  }

  // ✅ NUEVO: Función para traducir estados de préstamos
  private static translateLoanStatus(status: string): string {
    if (!status) return 'Sin estado';
    
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'activo':
        return 'Activo';
      case 'overdue':
      case 'vencido':
        return 'Vencido';
      case 'returned':
      case 'devuelto':
        return 'Devuelto';
      case 'lost':
      case 'perdido':
        return 'Perdido';
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado';
      default:
        // Si no coincide con ningún estado conocido, devolver el original
        return status;
    }
  }

  // ✅ NUEVO: Función de prueba para verificar la configuración del sistema
  static async testSystemConfig(): Promise<void> {
    try {
      console.log('🧪 Iniciando prueba de configuración del sistema...');
      
      const config = await this.getSystemConfig();
      
      if (!config) {
        console.log('❌ No se pudo obtener la configuración del sistema');
        return;
      }
      
      console.log('✅ Configuración obtenida:', {
        id: config.id,
        title: config.sidebarTitle,
        subtitle: config.sidebarSubtitle,
        icon: config.sidebarIcon,
        hasImage: !!config.sidebarIconImage,
        hasUrl: !!config.sidebarIconUrl,
        version: config.version
      });
      
      const logoInfo = await this.getLogoToDisplay(config);
      
      if (logoInfo) {
        console.log('✅ Logo detectado:', {
          format: logoInfo.format,
          urlLength: logoInfo.url.length,
          urlPreview: logoInfo.url.substring(0, 100) + '...',
          isBase64: logoInfo.url.startsWith('data:'),
          isUrl: logoInfo.url.startsWith('http')
        });
      } else {
        console.log('❌ No se detectó ningún logo configurado');
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de configuración:', error);
    }
  }

  // ✅ NUEVO: Función de prueba específica para URLs
  static async testUrlConversion(url: string): Promise<void> {
    try {
      console.log('🧪 Iniciando prueba de conversión de URL:', url);
      
      // Paso 1: Probar accesibilidad
      const isAccessible = await this.testUrlAccessibility(url);
      console.log('📊 Accesibilidad:', isAccessible);
      
      if (!isAccessible) {
        console.log('❌ URL no es accesible, no se puede convertir');
        return;
      }
      
      // Paso 2: Intentar conversión con canvas
      console.log('🔄 Intentando conversión con canvas...');
      const base64Canvas = await this.convertUrlToBase64(url);
      
      if (base64Canvas) {
        console.log('✅ Conversión con canvas exitosa');
        console.log('📊 Resultado canvas:', {
          length: base64Canvas.length,
          preview: base64Canvas.substring(0, 100) + '...',
          format: this.detectImageFormat(base64Canvas)
        });
      } else {
        console.log('❌ Conversión con canvas falló');
      }
      
      // Paso 3: Intentar conversión con fetch
      console.log('🔄 Intentando conversión con fetch...');
      const base64Fetch = await this.convertUrlToBase64WithFetch(url);
      
      if (base64Fetch) {
        console.log('✅ Conversión con fetch exitosa');
        console.log('📊 Resultado fetch:', {
          length: base64Fetch.length,
          preview: base64Fetch.substring(0, 100) + '...',
          format: this.detectImageFormat(base64Fetch)
        });
      } else {
        console.log('❌ Conversión con fetch falló');
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de conversión de URL:', error);
    }
  }
} 