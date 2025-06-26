'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
};

type Tarjeta = {
  id: number;
  numero_tarjeta: string;
  cliente_id: number | null;
  tipo_tarjeta_id: number;
  vehiculo_id: number | null;
  cliente_nombre?: string;
  tipo_tarjeta_nombre?: string;
  canal_id?: number;
  codigo_canal?: string;
  subcanal_id?: number;
  subcanal_nombre?: string;
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

export default function CrearMonedero() {
  const [monederoData, setMonederoData] = useState({
    galones_totales: '',
    periodo: '',
    galones_consumidos: '',
    galones_disponibles: '',
    odometro: '',
    canal_id: '',
    subcanal_id: '',
    selectedVehiculoIds: [] as number[],
  });
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [, setTarjetas] = useState<Tarjeta[]>([]); // Mantendremos porque se usa indirectamente
  const [filteredTarjetas, setFilteredTarjetas] = useState<Tarjeta[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [vehiculoIds, setVehiculoIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const mapPeriodToNumber = (period: string): number => {
    const periodNum = Number(period);
    return [1, 7, 15, 30].includes(periodNum) ? periodNum : 0;
  };

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch('/api/vehiculos');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching vehiculos:', err);
      setError(`Error al cargar los vehículos: ${errorMessage}`);
    }
  }, []);

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch('/api/tarjetas');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      const tarjetasConVehiculo = Array.isArray(data.tarjetas)
        ? data.tarjetas.filter((tarjeta: Tarjeta) => tarjeta.vehiculo_id !== null)
        : [];
      setTarjetas(tarjetasConVehiculo);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching tarjetas:', err);
      setError(`Error al cargar las tarjetas: ${errorMessage}`);
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

  const fetchVehiculoIdsForAdd = useCallback(async (canalId: number, subcanalId: number = 0) => {
    if (canalId === 0) {
      setVehiculoIds([]);
      setFilteredTarjetas([]);
      return;
    }
    try {
      const url = subcanalId
        ? `/api/tarjetas/filtro/monedero?canal_id=${canalId}&subcanal_id=${subcanalId}`
        : `/api/tarjetas/filtro/monedero?canal_id=${canalId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setVehiculoIds(Array.isArray(data.vehiculo_ids) ? data.vehiculo_ids : []);
      setFilteredTarjetas(Array.isArray(data.tarjetas) ? data.tarjetas : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching vehiculo IDs for add:', err);
      setVehiculoIds([]);
      setFilteredTarjetas([]);
      setError(`Error al cargar los IDs de vehículos para agregar: ${errorMessage}`);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchVehiculos(), fetchTarjetas(), fetchCanales()]).catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error in initial fetch:', err);
      setError(`Error al cargar los datos iniciales: ${errorMessage}`);
    });
  }, [fetchVehiculos, fetchTarjetas, fetchCanales]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMonederoData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'canal_id') {
        newData.subcanal_id = '';
        newData.selectedVehiculoIds = [];
        setSubcanales([]);
        setVehiculoIds([]);
        setFilteredTarjetas([]);
        if (Number(value) !== 0) {
          fetchSubcanales(Number(value));
          fetchVehiculoIdsForAdd(Number(value));
        }
      }
      if (name === 'subcanal_id') {
        newData.selectedVehiculoIds = [];
        setVehiculoIds([]);
        setFilteredTarjetas([]);
        if (newData.canal_id !== '' && Number(value) !== 0) {
          fetchVehiculoIdsForAdd(Number(newData.canal_id), Number(value));
        }
      }
      return newData;
    });
  };

  const handleCheckboxChange = (vehiculoId: number) => {
    setMonederoData((prev) => ({
      ...prev,
      selectedVehiculoIds: prev.selectedVehiculoIds.includes(vehiculoId)
        ? prev.selectedVehiculoIds.filter((id) => id !== vehiculoId)
        : [...prev.selectedVehiculoIds, vehiculoId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { galones_totales, periodo, canal_id, subcanal_id, selectedVehiculoIds } = monederoData;

    if (!periodo) {
      alert('Por favor seleccione un período');
      return;
    }
    if (selectedVehiculoIds.length === 0) {
      alert('Por favor seleccione al menos un vehículo');
      return;
    }
    if (!canal_id) {
      alert('Por favor seleccione un canal');
      return;
    }
    if (!subcanal_id) {
      alert('Por favor seleccione un subcanal');
      return;
    }

    try {
      for (const vehiculoId of selectedVehiculoIds) {
        const selectedTarjetas = filteredTarjetas.filter((tarjeta) => tarjeta.vehiculo_id === Number(vehiculoId));
        if (selectedTarjetas.length === 0) {
          alert(`No se encontró una tarjeta asociada al vehículo ID ${vehiculoId}`);
          return;
        }
        if (selectedTarjetas.length > 1) {
          setError(`Advertencia: El vehículo ID ${vehiculoId} tiene ${selectedTarjetas.length} tarjetas asociadas. Se seleccionó la primera.`);
        }
        const selectedTarjeta = selectedTarjetas[0];

        const formData = new FormData();
        formData.append('galones_totales', galones_totales);
        formData.append('vehiculo_id', String(vehiculoId));
        formData.append('periodo', String(mapPeriodToNumber(periodo)));
        formData.append('galones_consumidos', monederoData.galones_consumidos || '0');
        formData.append('galones_disponibles', monederoData.galones_disponibles || '0');
        formData.append('odometro', monederoData.odometro || '0');
        formData.append('tarjeta_id', String(selectedTarjeta.id));

        const response = await fetch('/api/monedero_flota', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al agregar el monedero para el vehículo ID ${vehiculoId}`);
        }
      }

      alert('Monederos agregados exitosamente');
      router.push('/monedero_flota');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert('Error al agregar los monederos');
      console.error('Error submitting add:', err);
      setError(`Error al agregar los monederos: ${errorMessage}`);
    }
  };

  const filteredVehiculos = vehiculos.filter((vehiculo) => vehiculoIds.includes(vehiculo.id));

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-xl w-1/2 max-h-[90vh] overflow-y-auto border">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent">
            Agregar Monedero
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-center" htmlFor="galones_totales">
                Límite de Litros
              </label>
              <input
                type="number"
                id="galones_totales"
                name="galones_totales"
                placeholder="Ejemplo: 100"
                value={monederoData.galones_totales}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                required
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-center" htmlFor="periodo">
                Período
              </label>
              <select
                id="periodo"
                name="periodo"
                value={monederoData.periodo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                required
              >
                <option value="" disabled>
                  Seleccione un período
                </option>
                <option value="1">Diario</option>
                <option value="7">Semanal</option>
                <option value="15">Quincenal</option>
                <option value="30">Mensual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-center" htmlFor="canal_id">
                Canal
              </label>
              <select
                id="canal_id"
                name="canal_id"
                value={monederoData.canal_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                required
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
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-center" htmlFor="subcanal_id">
                Subcanal
              </label>
              <select
                id="subcanal_id"
                name="subcanal_id"
                value={monederoData.subcanal_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                disabled={monederoData.canal_id === ''}
                required
              >
                <option value="" disabled>
                  {subcanales.length === 0 && monederoData.canal_id !== ''
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
              Vehículos
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
              {filteredVehiculos.length === 0 ? (
                <p className="text-center text-gray-500">
                  {monederoData.subcanal_id === '' ? 'Seleccione un subcanal para ver vehículos' : 'No hay vehículos disponibles'}
                </p>
              ) : (
                filteredVehiculos.map((vehiculo) => (
                  <div key={vehiculo.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`vehiculo_${vehiculo.id}`}
                      checked={monederoData.selectedVehiculoIds.includes(vehiculo.id)}
                      onChange={() => handleCheckboxChange(vehiculo.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`vehiculo_${vehiculo.id}`} className="text-gray-700">
                      {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Link href="/monedero_flota">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Agregar
            </button>
          </div>
        </form>
        {error && <div className="mt-4 p-2 bg-red-600 text-white text-center rounded-md">{error}</div>}
      </div>
    </div>
  );
}