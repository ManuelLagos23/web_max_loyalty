'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

type MonederoReset = {
  id: number;
  monedero_id: number;
  vehiculo_id: number;
  canal_id: number | null;
  subcanal_id: number | null;
  usuario_id: number | null;
  vehiculo_nombre?: string;
  canal_nombre?: string;
  subcanal_nombre?: string;
  usuario_nombre?: string;
};

export default function MonederoReset() {
  const router = useRouter();
  const [monederosReset, setMonederosReset] = useState<MonederoReset[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const pathname = usePathname();

  const fetchMonederosReset = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monedero_flota/reset?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const { data, total } = await response.json();
      setMonederosReset(Array.isArray(data) ? data : []);
      setTotalItems(Number.isInteger(total) ? total : 0);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching monederos reset:', err);
      setError(`Error al cargar los monederos reset: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchMonederosReset();
  }, [fetchMonederosReset]);

  const filteredMonederosReset = monederosReset.filter((monedero) =>
    Object.values(monedero)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
                Gestión de Reseteo de Monederos
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
              <div className="mb-4 p-2 bg-red-600 text-white text-center rounded-md">{error}</div>
            )}

            <div className="flex justify-between mb-4 space-x-2">
              <button
                onClick={() => router.push('/monedero_flota/monedero_reset/formulario_reset')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Resetear Monederos
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por vehículo, canal, subcanal, usuario..."
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
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Monedero ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Canal</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Subcanal</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonederosReset.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                      No hay registros de reseteo disponibles
                    </td>
                  </tr>
                ) : (
                  filteredMonederosReset.map((monedero, index) => (
                    <tr key={monedero.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-2">{monedero.id}</td>
                      <td className="px-4 py-2">{monedero.monedero_id}</td>
                      <td className="px-4 py-2">{monedero.vehiculo_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{monedero.canal_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{monedero.subcanal_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{monedero.usuario_nombre || 'N/A'}</td>
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