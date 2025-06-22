'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import * as XLSX from 'xlsx';

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

type ResetData = {
  canal_id: string;
  subcanal_id: string;
};

// Interfaz para la respuesta de la API de vehículos
interface ApiVehiculo {
  id: number;
  modelo?: string;
  placa?: string;
  marca?: string;
  tipo_combustible_nombre?: string;
}

export default function ResetMonedero() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResetData>({ canal_id: '', subcanal_id: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [vehiculoIds, setVehiculoIds] = useState<number[]>([]);
  const [selectedVehiculoIds, setSelectedVehiculoIds] = useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time for API (ISO 8601)
  const formatDateTimeForApi = (date: Date) => {
    return date.toISOString();
  };

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch('/api/vehiculos');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data: ApiVehiculo[] = await response.json();
      setVehiculos(
        Array.isArray(data)
          ? data.map((v: ApiVehiculo) => ({
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
    Promise.all([fetchVehiculos(), fetchCanales()]).catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error in initial fetch:', err);
      setError(`Error al cargar los datos iniciales: ${errorMessage}`);
    }).finally(() => setLoading(false));
  }, [fetchVehiculos, fetchCanales]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
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
      router.push('/monedero_flota/monedero_reset');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error resetting monederos:', err);
      setError(`Error al resetear los monederos: ${errorMessage}`);
      setIsConfirmModalOpen(false);
    }
  };

  const downloadExcel = () => {
    const filteredVehiculos = vehiculos
      .filter((vehiculo) => vehiculoIds.includes(vehiculo.id))
      .filter((vehiculo) =>
        vehiculo.numero_tarjeta?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const data = filteredVehiculos.map((vehiculo) => ({
      Vehículo: `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa})`,
      'Tipo de Combustible': vehiculo.tipo_combustible_nombre || 'N/A',
      'Número de Tarjeta': vehiculo.numero_tarjeta || 'N/A',
      Límite: `${vehiculo.galones_totales} gal`,
      'Galones Disponibles': `${vehiculo.galones_disponibles} gal`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehiculos');
    XLSX.writeFile(workbook, 'vehiculos_reset.xlsx');
  };

  const filteredVehiculos = vehiculos
    .filter((vehiculo) => vehiculoIds.includes(vehiculo.id))
    .filter((vehiculo) =>
      vehiculo.numero_tarjeta?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-700">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-3 sm:px-4 lg:px-6">
        <Navbar />
        <div className="w-full max-w-7xl bg-white border border-gray-300 p-6 sm:p-10 mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
            Resetear Monederos
          </h1>

          {error && (
            <div className="mb-4 p-2 bg-red-600 text-white text-center rounded-lg">{error}</div>
          )}

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="canal_id"
                  className="block text-center text-sm sm:text-base font-bold text-black"
                >
                  Canal
                </label>
                <select
                  id="canal_id"
                  name="canal_id"
                  value={formData.canal_id}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
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
                  htmlFor="subcanal_id"
                  className="block text-center text-sm sm:text-base font-bold text-black"
                >
                  Subcanal
                </label>
                <select
                  id="subcanal_id"
                  name="subcanal_id"
                  value={formData.subcanal_id}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                  disabled={formData.canal_id === ''}
                >
                  <option value="" disabled>
                    {subcanales.length === 0 && formData.canal_id !== ''
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

            <div>
              <label
                htmlFor="search"
                className="block text-center text-sm sm:text-base font-bold text-black"
              >
                Buscar por Número de Tarjeta
              </label>
              <input
                id="search"
                type="text"
                placeholder="Ingrese número de tarjeta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                Vehículos Disponibles
              </label>
              <div className="border border-gray-300 rounded-lg overflow-y-auto max-h-96">
                {filteredVehiculos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm sm:text-base">
                    {formData.canal_id === ''
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
                          <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                            {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa})
                          </td>
                          <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                            {vehiculo.tipo_combustible_nombre || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                            {vehiculo.numero_tarjeta || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                            {vehiculo.galones_totales} gal
                          </td>
                          <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                            {vehiculo.galones_disponibles} gal
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {filteredVehiculos.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={downloadExcel}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                >
                  Descargar en Excel
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.push('/monedero_flota/monedero_reset')}
                className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetClick}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm sm:text-base transition-all duration-300 ${
                  selectedVehiculoIds.length === 0 || loading
                    ? 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={selectedVehiculoIds.length === 0 || loading}
              >
                Resetear
              </button>
            </div>
          </form>

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
              <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
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
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSubmit}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}