'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';

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

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
  tipo_combustible_nombre: string;
  galones_totales: number;
  galones_disponibles: number;
  numero_tarjeta?: string;
};

// New interface for API response from /api/vehiculos
type VehiculoApi = {
  id: number;
  modelo?: string;
  placa?: string;
  marca?: string;
  tipo_combustible_nombre?: string;
};

type Canal = {
  id: number;
  canal: string;
};

type Subcanal = {
  id: number;
  subcanal: string;
  canal_id: number;
};

type Tarjeta = {
  id: number;
  numero_tarjeta: string;
  vehiculo_id: number;
  canal_id: number;
  subcanal_id: number | null;
  galones_totales: number;
  galones_disponibles: number;
};

export default function MonederoReset() {
  const [monederosReset, setMonederosReset] = useState<MonederoReset[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [vehiculoIds, setVehiculoIds] = useState<number[]>([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const pathname = usePathname();
  const [resetData, setResetData] = useState({
    canal_id: '',
    subcanal_id: '',
  });
  const [selectedVehiculoIds, setSelectedVehiculoIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time for display (MM/DD/YYYY, HH:MM:SS AM/PM)
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Format date and time for API (ISO 8601)
  const formatDateTimeForApi = (date: Date) => {
    return date.toISOString();
  };

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

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch('/api/vehiculos');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      // Initialize with default values for card-related fields
      setVehiculos(
        Array.isArray(data)
          ? data.map((v: VehiculoApi) => ({
              id: v.id,
              modelo: v.modelo || '',
              placa: v.placa || '',
              marca: v.marca || '',
              tipo_combustible_nombre: v.tipo_combustible_nombre || '',
              galones_totales: 0,
              galones_disponibles: 0,
              numero_tarjeta: '',
            }))
          : []
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching vehiculos:', err);
      setError(`Error al cargar los vehículos: ${errorMessage}`);
    }
  }, []);

  const fetchCanales = useCallback(async () => {
    try {
      const response = await fetch('/api/canales');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCanales(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching canales:', err);
      setError(`Error al cargar los canales: ${errorMessage}`);
    }
  }, []);

  const fetchSubcanales = useCallback(async (canalId: number) => {
    if (canalId === 0) {
      setSubcanales([]);
      return;
    }
    try {
      const response = await fetch(`/api/subcanales?canal_id=${canalId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setSubcanales(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching subcanales:', err);
      setSubcanales([]);
      setError(`Error al cargar los subcanales: ${errorMessage}`);
    }
  }, []);

  const fetchVehiculoIds = useCallback(
    async (canalId: number, subcanalId: number = 0) => {
      if (canalId === 0) {
        setVehiculoIds([]);
        return;
      }
      try {
        const url = subcanalId
          ? `/api/tarjetas/filtro?canal_id=${canalId}&subcanal_id=${subcanalId}`
          : `/api/tarjetas/filtro?canal_id=${canalId}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setVehiculoIds(Array.isArray(data.vehiculo_ids) ? data.vehiculo_ids : []);
        // Update only card-related fields for matching vehicles
        setVehiculos((prevVehiculos) =>
          prevVehiculos.map((vehiculo) => {
            const matchingTarjeta = data.tarjetas.find(
              (tarjeta: Tarjeta) => tarjeta.vehiculo_id === vehiculo.id
            );
            if (matchingTarjeta) {
              return {
                ...vehiculo,
                numero_tarjeta: matchingTarjeta.numero_tarjeta || '',
                galones_totales: matchingTarjeta.galones_totales || 0,
                galones_disponibles: matchingTarjeta.galones_disponibles || 0,
              };
            }
            return vehiculo;
          })
        );
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error fetching vehiculo IDs:', err);
        setVehiculoIds([]);
        setError(`Error al cargar los IDs de vehículos: ${errorMessage}`);
      }
    },
    []
  );

  useEffect(() => {
    Promise.all([fetchMonederosReset(), fetchVehiculos(), fetchCanales()]).catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error in initial fetch:', err);
      setError(`Error al cargar los datos iniciales: ${errorMessage}`);
    });
  }, [fetchMonederosReset, fetchVehiculos, fetchCanales]);

  const handleResetInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'canal_id') {
        newData.subcanal_id = '';
        setSubcanales([]);
        setVehiculoIds([]);
        setSelectedVehiculoIds([]);
        if (Number(value) !== 0) {
          fetchSubcanales(Number(value));
          fetchVehiculoIds(Number(value));
        }
      }
      if (name === 'subcanal_id') {
        setVehiculoIds([]);
        setSelectedVehiculoIds([]);
        if (newData.canal_id !== '' && Number(value) !== 0) {
          fetchVehiculoIds(Number(newData.canal_id), Number(value));
        }
      }
      return newData;
    });
  };

  const handleCheckboxChange = (vehiculoId: number) => {
    setSelectedVehiculoIds((prev) =>
      prev.includes(vehiculoId) ? prev.filter((id) => id !== vehiculoId) : [...prev, vehiculoId]
    );
  };

  const handleResetClick = () => {
    if (selectedVehiculoIds.length === 0) {
      alert('Por favor seleccione al menos un vehículo para resetear.');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleResetSubmit = async () => {
    try {
      const response = await fetch('/api/monedero_flota/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiculo_ids: selectedVehiculoIds,
          created_at: formatDateTimeForApi(currentTime),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      alert('Monederos reseteados exitosamente');
      setIsConfirmModalOpen(false);
      setIsResetModalOpen(false);
      setResetData({ canal_id: '', subcanal_id: '' });
      setSelectedVehiculoIds([]);
      setVehiculoIds([]);
      setSubcanales([]);
      setCurrentPage(1);
      fetchMonederosReset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error resetting monederos:', err);
      setError(`Error al resetear los monederos: ${errorMessage}`);
      setIsConfirmModalOpen(false);
    }
  };

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

  const filteredVehiculos = vehiculos.filter((vehiculo) => vehiculoIds.includes(vehiculo.id));

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
                onClick={() => setIsResetModalOpen(true)}
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

            {/* Modal para resetear monederos */}
            {isResetModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsResetModalOpen(false);
                    setResetData({ canal_id: '', subcanal_id: '' });
                    setSelectedVehiculoIds([]);
                    setVehiculoIds([]);
                    setSubcanales([]);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-md shadow-xl w-1/2 max-h-[90vh] overflow-y-auto border relative">
                  <div className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 text-sm">
                    <ClockIcon className="h-5 w-5" />
                    <span>{formatDateTime(currentTime)}</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent">
                      Resetear Monederos
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        className="block text-sm font-semibold text-gray-700 mb-1 text-center"
                        htmlFor="reset_canal_id"
                      >
                        Canal
                      </label>
                      <select
                        id="reset_canal_id"
                        name="canal_id"
                        value={resetData.canal_id}
                        onChange={handleResetInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      >
                        <option value="" disabled>
                          Seleccione un canal
                        </option>
                        {canales.map((canal) => (
                          <option key={canal.id} value={canal.id}>
                            {canal.canal}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-gray-700 mb-1 text-center"
                        htmlFor="reset_subcanal_id"
                      >
                        Subcanal
                      </label>
                      <select
                        id="reset_subcanal_id"
                        name="subcanal_id"
                        value={resetData.subcanal_id}
                        onChange={handleResetInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        disabled={resetData.canal_id === ''}
                      >
                        <option value="" disabled>
                          {subcanales.length === 0 && resetData.canal_id !== ''
                            ? 'No hay subcanales disponibles'
                            : 'Seleccione un subcanal'}
                        </option>
                        {subcanales.map((subcanal) => (
                          <option key={subcanal.id} value={subcanal.id}>
                            {subcanal.subcanal}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 text-center">
                      Vehículos Disponibles
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                      {filteredVehiculos.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-base">
                          {resetData.canal_id === ''
                            ? 'Seleccione un canal para ver vehículos'
                            : 'No hay vehículos disponibles'}
                        </p>
                      ) : (
                        <table className="min-w-full bg-white">
                          <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                <span className="sr-only">Seleccionar</span>
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Tipo de Combustible
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tarjeta</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Límite</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Galones Disponibles
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredVehiculos.map((vehiculo) => (
                              <tr key={vehiculo.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    id={`vehiculo_${vehiculo.id}`}
                                    checked={selectedVehiculoIds.includes(vehiculo.id)}
                                    onChange={() => handleCheckboxChange(vehiculo.id)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-3 text-base text-gray-800">
                                  {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa})
                                </td>
                                <td className="px-4 py-3 text-base text-gray-800">
                                  {vehiculo.tipo_combustible_nombre || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-base text-gray-800">{vehiculo.numero_tarjeta || 'N/A'}</td>
                                <td className="px-4 py-3 text-base text-gray-800">{vehiculo.galones_totales} gal</td>
                                <td className="px-4 py-3 text-base text-gray-800">
                                  {vehiculo.galones_disponibles} gal
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetModalOpen(false);
                        setResetData({ canal_id: '', subcanal_id: '' });
                        setSelectedVehiculoIds([]);
                        setVehiculoIds([]);
                        setSubcanales([]);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleResetClick}
                      disabled={selectedVehiculoIds.length === 0}
                      className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                        selectedVehiculoIds.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      Resetear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación */}
            {isConfirmModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsConfirmModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-md shadow-xl w-1/3 border">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Confirmar Reseteo
                  </h2>
                  <p className="text-gray-700 mb-4 text-center">
                    ¿Está seguro de que desea resetear los monederos de {selectedVehiculoIds.length}{' '}
                    vehículo(s) seleccionado(s)?
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSubmit}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}