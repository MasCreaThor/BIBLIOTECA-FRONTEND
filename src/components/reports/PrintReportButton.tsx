'use client';

import { useState } from 'react';
import { FiPrinter, FiDownload, FiFileText, FiEye } from 'react-icons/fi';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';
import { PDFService } from '@/services/pdf.service';
import { PDFPreviewModal } from './PDFPreviewModal';

interface PrintReportButtonProps {
  data: PersonLoanSummary[];
  selectedStatuses: LoanStatusFilter[];
  year: string;
  search?: string;
}

export function PrintReportButton({ 
  data, 
  selectedStatuses, 
  year, 
  search 
}: PrintReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Mostrar el botón para filtros específicos O para reporte general (sin filtros)
  const shouldShowButton = 
    // Filtros específicos (solo uno seleccionado)
    (selectedStatuses.length === 1 && 
     [LoanStatusFilter.ACTIVE, LoanStatusFilter.OVERDUE, LoanStatusFilter.LOST].includes(selectedStatuses[0])) ||
    // Reporte general (sin filtros específicos)
    (selectedStatuses.length === 0 && data.length > 0);

  const handleGenerateReport = async () => {
    if (data.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Determinar el tipo de filtro para el reporte
      let filterType: string;
      let title: string;
      
      if (selectedStatuses.length === 0) {
        // Reporte general
        filterType = 'Todos los préstamos';
        title = `Reporte General de Préstamos - Año ${year}`;
      } else {
        // Filtro específico
        filterType = PDFService.getFilterTypeLabel(selectedStatuses);
        title = `Reporte de ${filterType} - Año ${year}`;
      }
      
      // Obtener información del usuario actual (opcional)
      const generatedBy = 'Bibliotecaria'; // Puedes obtener esto del contexto de autenticación
      
      PDFService.generateReport({
        title,
        filterType,
        data,
        generatedBy
      });
      
      // Mostrar mensaje de éxito
      setTimeout(() => {
        alert('✅ Reporte generado exitosamente');
      }, 1000);
      
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('❌ Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!shouldShowButton) {
    return null;
  }

  const getButtonText = () => {
    // Si no hay filtros seleccionados, es reporte general
    if (selectedStatuses.length === 0) {
      return 'Reporte General de Préstamos';
    }
    
    const status = selectedStatuses[0];
    switch (status) {
      case LoanStatusFilter.ACTIVE:
        return 'Reporte de Préstamos Activos';
      case LoanStatusFilter.OVERDUE:
        return 'Reporte de Préstamos Vencidos';
      case LoanStatusFilter.LOST:
        return 'Reporte de Libros Perdidos';
      default:
        return 'Reporte';
    }
  };

  const getButtonIcon = () => {
    if (isGenerating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;
    }
    return <FiPrinter className="h-4 w-4" />;
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                {getButtonText()}
              </h3>
              <p className="text-xs text-blue-700">
                Genera un reporte PDF con {data.length} persona{data.length !== 1 ? 's' : ''} encontrada{data.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              disabled={data.length === 0}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${data.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <FiEye className="h-4 w-4" />
              Vista Previa
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || data.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 transform hover:scale-105
                ${isGenerating || data.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {getButtonIcon()}
              {isGenerating ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
        
        {data.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-4 text-xs text-blue-700">
              <span>📊 Total de préstamos: {data.reduce((sum, person) => sum + person.summary.totalLoans, 0)}</span>
              <span>👥 Personas: {data.length}</span>
              <span>📅 Año: {year}</span>
              {search && <span>🔍 Búsqueda: "{search}"</span>}
            </div>
          </div>
        )}
      </div>

      {/* Modal de vista previa */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={data}
        selectedStatuses={selectedStatuses}
        year={year}
        search={search}
      />
    </>
  );
} 