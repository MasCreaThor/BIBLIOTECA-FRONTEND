'use client';

import { useState } from 'react';
import { FiX, FiEye, FiDownload } from 'react-icons/fi';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';
import { PDFService } from '@/services/pdf.service';
import { reportsService } from '@/services/reports.service';
import { getPersonTypeLabel } from '@/utils/personType.utils';

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
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiEye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vista Previa del Reporte</h2>
              <p className="text-sm text-gray-600">Revisa el contenido antes de generar el PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información del reporte */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium block mb-1">Filtro:</span>
                <p className="text-blue-900 font-semibold">{filterType}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium block mb-1">Personas:</span>
                <p className="text-blue-900 font-semibold text-lg">{totalPeople}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium block mb-1">Préstamos:</span>
                <p className="text-blue-900 font-semibold text-lg">{totalLoans}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium block mb-1">Año:</span>
                <p className="text-blue-900 font-semibold text-lg">{year}</p>
              </div>
            </div>
            {search && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <span className="text-blue-700 font-medium">Búsqueda:</span>
                <p className="text-blue-900 font-semibold">"{search}"</p>
              </div>
            )}
          </div>

          {/* Tabla de resumen */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900 text-lg">Resumen por Persona</h4>
              <p className="text-sm text-gray-600 mt-1">Mostrando las primeras 10 personas del reporte</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Persona
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Activos
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vencidos
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Devueltos
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Perdidos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((person, index) => (
                    <tr key={person.person._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {person.person.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {person.person.documentNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getPersonTypeLabel(person.person.personType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="font-semibold text-gray-900 text-lg">{person.summary.totalLoans}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {person.summary.activeLoans}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {person.summary.overdueLoans}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {person.summary.returnedLoans}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {person.summary.lostLoans}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 10 && (
              <div className="bg-gray-50 px-6 py-4 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  ... y {data.length - 10} personas más en el PDF completo
                </p>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 text-lg mb-3 flex items-center gap-2">
              📋 Contenido del PDF
            </h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Encabezado con información del sistema y filtros aplicados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Tabla resumen con estadísticas por persona</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Detalle completo de préstamos por persona</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Información de recursos (título, fechas de préstamo y vencimiento, estado)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Pie de página con numeración</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            <p className="font-medium">El PDF se descargará automáticamente cuando esté listo</p>
            <p className="text-xs mt-1">Formato: A4, orientación vertical, con encabezado y pie de página</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || data.length === 0}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-lg font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isGenerating || data.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500'
                }
              `}
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiDownload className="h-5 w-5" />
              )}
              {isGenerating ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 