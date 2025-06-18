'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { reportsService } from '@/services/reports.service';
import { PersonLoanSummary, PersonLoansQuery, LoanStatusFilter } from '@/types/reports.types';

interface PersonLoansFiltersProps {
  onDataLoaded: (data: PersonLoanSummary[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function PersonLoansFilters({ onDataLoaded, onLoadingChange }: PersonLoansFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<LoanStatusFilter[]>([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    { value: LoanStatusFilter.ACTIVE, label: 'Préstamos Activos' },
    { value: LoanStatusFilter.OVERDUE, label: 'Préstamos Vencidos' },
    { value: LoanStatusFilter.RETURNED, label: 'Préstamos Devueltos' },
    { value: LoanStatusFilter.LOST, label: 'Libros Perdidos' },
  ];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    onLoadingChange(true);
    
    try {
      const query: PersonLoansQuery = {
        search: search.trim() || undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        year,
      };

      const data = await reportsService.getPersonLoans(query);
      
      // Asegurar que data sea un array
      if (Array.isArray(data)) {
        onDataLoaded(data);
      } else {
        console.error('Respuesta inesperada del servidor:', data);
        onDataLoaded([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      onDataLoaded([]);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [search, selectedStatuses, year, onDataLoaded, onLoadingChange]);

  useEffect(() => {
    loadData();
  }, [year]); // Recargar cuando cambie el año

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [selectedStatuses, loadData]); // Recargar cuando cambien los filtros de estado

  const handleSearch = () => {
    loadData();
  };

  const handleStatusChange = (status: LoanStatusFilter) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    // Los datos se recargarán automáticamente por el useEffect
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setYear(new Date().getFullYear().toString());
    // Los datos se recargarán automáticamente por el useEffect
  };

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        {/* Búsqueda y año */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const yearValue = new Date().getFullYear() - i;
                return (
                  <option key={yearValue} value={yearValue.toString()}>
                    {yearValue}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiSearch />
              )}
              Buscar
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar datos"
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filtros de estado */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(option.value)}
                  onChange={() => handleStatusChange(option.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
            
            {selectedStatuses.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Información de filtros activos */}
        {(search || selectedStatuses.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <strong>Filtros activos:</strong>
              {search && (
                <span className="ml-2">
                  Búsqueda: "{search}"
                </span>
              )}
              {selectedStatuses.length > 0 && (
                <span className="ml-2">
                  Estados: {selectedStatuses.map(s => 
                    statusOptions.find(opt => opt.value === s)?.label
                  ).join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 