import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';

export interface PDFReportOptions {
  title: string;
  filterType: string;
  data: PersonLoanSummary[];
  generatedBy?: string;
}

export class PDFService {
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

  private static generateHeader(doc: jsPDF, options: PDFReportOptions): void {
    try {
      // Logo o título del sistema
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246); // Blue-600
      doc.text('Sistema de Gestión de Biblioteca', 20, 30);
      
      // Línea separadora
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Título del reporte
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.text(options.title, 20, 45);
      
      // Información del filtro
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text(`Filtro aplicado: ${options.filterType}`, 20, 55);
      
      // Fecha de generación
      const now = new Date();
      doc.text(`Generado el: ${this.formatDate(now)}`, 20, 65);
      
      if (options.generatedBy) {
        doc.text(`Generado por: ${options.generatedBy}`, 20, 75);
      }
      
      // Estadísticas generales
      const totalPeople = options.data.length;
      const totalLoans = options.data.reduce((sum, person) => sum + (person.summary?.totalLoans || 0), 0);
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // Gray-700
      doc.text(`Total de personas: ${totalPeople}`, 20, 90);
      doc.text(`Total de préstamos: ${totalLoans}`, 20, 100);
    } catch (error) {
      console.error('Error generando encabezado:', error);
      throw new Error('Error al generar el encabezado del PDF');
    }
  }

  private static generatePersonTable(doc: jsPDF, data: PersonLoanSummary[]): void {
    const tableData = data.map(person => [
      person.person?.name || 'Sin nombre',
      person.person?.documentNumber || 'Sin documento',
      person.person?.personType || 'Sin tipo',
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
      doc.text(`Documento: ${person.person?.documentNumber || 'Sin documento'} | Tipo: ${person.person?.personType || 'Sin tipo'}`, 25, currentY);
      currentY += 8;

      // Tabla de préstamos de la persona
      if (person.loans && person.loans.length > 0) {
        const loansData = person.loans.map(loan => [
          loan.resource?.title || 'Sin título',
          this.formatDate(loan.loanDate),
          this.formatDate(loan.dueDate),
          loan.status || 'Sin estado'
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

  static generateReport(options: PDFReportOptions): void {
    try {
      console.log('Iniciando generación de PDF con datos:', options.data.length, 'personas');
      
      // Crear el documento PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Generar contenido del PDF
      this.generateHeader(doc, options);
      this.generatePersonTable(doc, options.data);
      this.generateLoansDetails(doc, options.data);
      this.generateFooter(doc);
      
      // Generar nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `reporte_${options.filterType.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.pdf`;
      
      console.log('PDF generado exitosamente, guardando como:', fileName);
      
      // Descargar el PDF
      doc.save(fileName);
      
      console.log('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error en generateReport:', error);
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
} 