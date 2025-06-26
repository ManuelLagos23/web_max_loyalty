'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type Monedero = {
  id: number;
  galones_totales: number;
  vehiculo_id: number;
  vehiculo_nombre?: string;
  periodo: number;
  galones_consumidos: number;
  galones_disponibles: number;
  odometro: number;
  tarjeta_id: number;
  tarjeta_numero?: string;
  canal_id?: number;
  subcanal_id?: number;
};

export default function MonederoFlota() {
  const [monederos, setMonederos] = useState<Monedero[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const itemsPerPage = 10;

  const getPeriodLabel = (period: number | string | null): string => {
    const periodNum = Number(period);
    switch (periodNum) {
      case 1: return 'Diario';
      case 7: return 'Semanal';
      case 15: return 'Quincenal';
      case 30: return 'Mensual';
      default: return 'N/A';
    }
  };

  const fetchMonederos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monedero_flota?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setMonederos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching monederos:', err);
      setError(`Error al cargar los monederos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchMonederos();
  }, [fetchMonederos]);

  const filteredMonederos = monederos.filter((monedero) =>
    Object.values(monedero)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMonederos = filteredMonederos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMonederos.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <div className="font-sans bg-white text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-700">Cargando...</div>
      </div>
    );
  }

  const monederoRoutes = [
    { name: 'Monedero', href: '/monedero_flota' },
    { name: 'Restablecer monedero', href: '/monedero_flota/monedero_reset' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-center text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent">
                Gestión de Monedero de Flota
              </h1>
            </div>

            <nav className="flex justify-center space-x-4">
              {monederoRoutes.map((monedero) => {
                const isActive = pathname === monedero.href;
                return (
                  <Link key={monedero.name} href={monedero.href}>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {monedero.name}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {error && (
              <div className="mb-4 p-2 bg-red-600 text-white text-center rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-between mb-4 space-x-2">
              <Link href="/monedero_flota/crear">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Agregar Monedero
                </button>
              </Link>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por vehículo, período, tarjeta u otros..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="w-full rounded-md shadow-md bg-gray-100">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Límite</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Período</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Litros Disponibles</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Litros Consumidos</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tarjeta</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMonederos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-2 text-center text-gray-500">
                      No hay monederos disponibles
                    </td>
                  </tr>
                ) : (
                  currentMonederos.map((monedero, index) => (
                    <tr key={monedero.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{monedero.galones_totales || 'N/A'}</td>
                      <td className="px-4 py-2">{monedero.vehiculo_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{getPeriodLabel(monedero.periodo)}</td>
                      <td className="px-4 py-2 text-center">
                        {Number(monedero.galones_disponibles ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {Number(monedero.galones_consumidos ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2">{monedero.tarjeta_numero || 'N/A'}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <Link href={`/monedero_flota/editar/${monedero.id}`}>
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors duration-200">
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            // Aquí iría la lógica de eliminación
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-gray-700">Página {currentPage} de {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
