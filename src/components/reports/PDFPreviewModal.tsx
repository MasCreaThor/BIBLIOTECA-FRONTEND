'use client';

import { useState } from 'react';
import { FiX, FiEye, FiDownload } from 'react-icons/fi';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';
import { PDFService } from '@/services/pdf.service';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PersonLoanSummary[];
  selectedStatuses: LoanStatusFilter[];
  year: string;
  search?: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  data,
  selectedStatuses,
  year,
  search
}: PDFPreviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const filterType = PDFService.getFilterTypeLabel(selectedStatuses);
  const title = `Reporte de ${filterType} - Año ${year}`;
  const totalPeople = data.length;
  const totalLoans = data.reduce((sum, person) => sum + person.summary.totalLoans, 0);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const generatedBy = 'Bibliotecaria';
      
      PDFService.generateReport({
        title,
        filterType,
        data,
        generatedBy
      });
      
      setTimeout(() => {
        alert('✅ Reporte generado exitosamente');
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('❌ Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiEye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vista Previa del Reporte</h2>
              <p className="text-sm text-gray-600">Revisa el contenido antes de generar el PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Información del reporte */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Filtro:</span>
                <p className="text-blue-900">{filterType}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Personas:</span>
                <p className="text-blue-900">{totalPeople}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Préstamos:</span>
                <p className="text-blue-900">{totalLoans}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Año:</span>
                <p className="text-blue-900">{year}</p>
              </div>
            </div>
            {search && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="text-blue-700 font-medium">Búsqueda:</span>
                <p className="text-blue-900">"{search}"</p>
              </div>
            )}
          </div>

          {/* Tabla de resumen */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Resumen por Persona</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persona
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencidos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devueltos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perdidos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((person, index) => (
                    <tr key={person.person._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {person.person.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {person.person.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {person.person.personType}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="font-medium text-gray-900">{person.summary.totalLoans}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-green-600">{person.summary.activeLoans}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-red-600">{person.summary.overdueLoans}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-blue-600">{person.summary.returnedLoans}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-gray-600">{person.summary.lostLoans}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 10 && (
              <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
                ... y {data.length - 10} personas más
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">📋 Contenido del PDF</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Encabezado con información del sistema y filtros aplicados</li>
              <li>• Tabla resumen con estadísticas por persona</li>
              <li>• Detalle completo de préstamos por persona</li>
              <li>• Información de recursos (título, fechas de préstamo y vencimiento, estado)</li>
              <li>• Pie de página con numeración</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            El PDF se descargará automáticamente cuando esté listo
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || data.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium
                transition-all duration-200
                ${isGenerating || data.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiDownload className="h-4 w-4" />
              )}
              {isGenerating ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 