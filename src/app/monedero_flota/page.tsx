'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

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
};

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
};

type Tarjeta = {
  id: number;
  numero_tarjeta: string;
  cliente_id: number;
  tipo_tarjeta_id: number;
  vehiculo_id: number;
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

export default function MonederoFlota() {
  const [monederos, setMonederos] = useState<Monedero[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [monederoData, setMonederoData] = useState({
    galones_totales: '',
    vehiculo_id: 0,
    periodo: '',
    galones_consumidos: '',
    galones_disponibles: '',
    odometro: '',
    tarjeta_id: 0,
    canal_id: 0,
    subcanal_id: 0,
  });
  const [monederoToUpdate, setMonederoToUpdate] = useState<Monedero | null>(null);
  const [monederoToDelete, setMonederoToDelete] = useState<Monedero | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const getPeriodLabel = (period: number): string => {
    switch (period) {
      case 1: return 'Diario';
      case 7: return 'Semanal';
      case 15: return 'Quincenal';
      case 30: return 'Mensual';
      default: return 'N/A';
    }
  };

  const mapPeriodToNumber = (period: string): number => {
    switch (period) {
      case '1': return 1;
      case '7': return 7;
      case '15': return 15;
      case '30': return 30;
      default: return 0;
    }
  };

  const fetchMonederos = useCallback(async () => {
    try {
      const response = await fetch(`/api/monedero_flota?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error('Error fetching monederos');
      const data = await response.json();
      console.log('Monederos fetched:', data);
      setMonederos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching monederos:', err);
      setError('Error al cargar los monederos');
    }
  }, [currentPage, itemsPerPage]);

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch('/api/vehiculos');
      if (!response.ok) throw new Error('Error fetching vehiculos');
      const data = await response.json();
      console.log('Vehiculos fetched:', data);
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vehiculos:', err);
    }
  }, []);

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch('/api/tarjetas');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Tarjetas raw data:', JSON.stringify(data, null, 2));
      const tarjetasConVehiculo = Array.isArray(data.tarjetas)
        ? data.tarjetas.filter((tarjeta: Tarjeta) => tarjeta.vehiculo_id !== null)
        : [];
      console.log('Tarjetas filtered:', JSON.stringify(tarjetasConVehiculo, null, 2));
      setTarjetas(tarjetasConVehiculo);
      if (tarjetasConVehiculo.length === 0) {
        setError('No se encontraron tarjetas de flota disponibles');
      }
    } catch (err) {
      console.error('Error fetching tarjetas:', err);

    }
  }, []);

  const fetchCanales = useCallback(async () => {
    try {
      const response = await fetch('/api/canales');
      if (!response.ok) throw new Error('Error fetching canales');
      const data = await response.json();
      console.log('Canales fetched:', data);
      setCanales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching canales:', err);
      setError('Error al cargar los canales');
    }
  }, []);

  const fetchSubcanales = useCallback(async (canalId: number) => {
    try {
      const response = await fetch(`/api/subcanales?canal_id=${canalId}`);
      if (!response.ok) throw new Error('Error fetching subcanales');
      const data = await response.json();
      console.log(`Subcanales fetched for canal_id=${canalId}:`, data);
      setSubcanales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subcanales:', err);
      setSubcanales([]);
      setError('Error al cargar los subcanales');
    }
  }, []);

  useEffect(() => {
    fetchMonederos();
    fetchVehiculos();
    fetchTarjetas();
    fetchCanales();
  }, [fetchMonederos, fetchVehiculos, fetchTarjetas, fetchCanales]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMonederoData((prev) => {
      const newData = {
        ...prev,
        [name]: name === 'vehiculo_id' || name === 'tarjeta_id' || name === 'canal_id' || name === 'subcanal_id' ? Number(value) : value,
      };
      if (name === 'tarjeta_id') {
        const selectedTarjeta = tarjetas.find((tarjeta) => tarjeta.id === Number(value));
        newData.vehiculo_id = selectedTarjeta ? selectedTarjeta.vehiculo_id : 0;
      }
      if (name === 'canal_id') {
        newData.subcanal_id = 0; // Reiniciar subcanal
        newData.tarjeta_id = 0; // Reiniciar tarjeta
        newData.vehiculo_id = 0; // Reiniciar vehículo
        setSubcanales([]); // Limpiar subcanales
        if (Number(value) !== 0) {
          fetchSubcanales(Number(value));
        }
      }
      if (name === 'subcanal_id') {
        newData.tarjeta_id = 0; // Reiniciar tarjeta
        newData.vehiculo_id = 0; // Reiniciar vehículo
      }
      console.log('MonederoData updated:', newData);
      return newData;
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monederoData.periodo) {
      alert('Por favor seleccione un período');
      return;
    }
    if (monederoData.tarjeta_id === 0) {
      alert('Por favor seleccione una tarjeta');
      return;
    }
    if (monederoData.vehiculo_id === 0) {
      alert('Por favor seleccione un vehículo');
      return;
    }
    if (monederoData.canal_id === 0) {
      alert('Por favor seleccione un canal');
      return;
    }
    if (monederoData.subcanal_id === 0) {
      alert('Por favor seleccione un subcanal');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('galones_totales', monederoData.galones_totales);
      formData.append('vehiculo_id', String(monederoData.vehiculo_id));
      formData.append('periodo', String(mapPeriodToNumber(monederoData.periodo)));
      formData.append('galones_consumidos', monederoData.galones_consumidos || '0');
      formData.append('galones_disponibles', monederoData.galones_disponibles || '0');
      formData.append('odometro', monederoData.odometro);
      formData.append('tarjeta_id', String(monederoData.tarjeta_id));

      const response = await fetch('/api/monedero_flota', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Monedero agregado exitosamente');
        setMonederoData({
          galones_totales: '',
          vehiculo_id: 0,
          periodo: '',
          galones_consumidos: '',
          galones_disponibles: '',
          odometro: '',
          tarjeta_id: 0,
          canal_id: 0,
          subcanal_id: 0,
        });
        setIsAddModalOpen(false);
        fetchMonederos();
      } else {
        alert('Error al agregar el monedero');
      }
    } catch (err) {
      alert('Error al agregar el monedero');
      console.error('Error submitting add:', err);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monederoData.periodo) {
      alert('Por favor seleccione un período');
      return;
    }
    if (monederoData.tarjeta_id === 0) {
      alert('Por favor seleccione una tarjeta');
      return;
    }
    if (monederoData.vehiculo_id === 0) {
      alert('Por favor seleccione un vehículo');
      return;
    }
    if (monederoData.canal_id === 0) {
      alert('Por favor seleccione un canal');
      return;
    }
    if (monederoData.subcanal_id === 0) {
      alert('Por favor seleccione un subcanal');
      return;
    }
    if (monederoToUpdate) {
      try {
        const formData = new FormData();
        formData.append('id', String(monederoToUpdate.id));
        formData.append('galones_totales', monederoData.galones_totales);
        formData.append('vehiculo_id', String(monederoData.vehiculo_id));
        formData.append('periodo', String(mapPeriodToNumber(monederoData.periodo)));
        formData.append('galones_consumidos', monederoData.galones_consumidos || '0');
        formData.append('galones_disponibles', monederoData.galones_disponibles || '0');
        formData.append('odometro', monederoData.odometro);
        formData.append('tarjeta_id', String(monederoData.tarjeta_id));

        const response = await fetch('/api/monedero_flota', {
          method: 'PUT',
          body: formData,
        });

        if (response.ok) {
          alert('Monedero actualizado exitosamente');
          setMonederoData({
            galones_totales: '',
            vehiculo_id: 0,
            periodo: '',
            galones_consumidos: '',
            galones_disponibles: '',
            odometro: '',
            tarjeta_id: 0,
            canal_id: 0,
            subcanal_id: 0,
          });
          setIsUpdateModalOpen(false);
          fetchMonederos();
        } else {
          alert('Error al actualizar el monedero');
        }
      } catch (err) {
        alert('Error al actualizar el monedero');
        console.error('Error submitting update:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (monederoToDelete) {
      try {
        const response = await fetch(`/api/monedero_flota/${monederoToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Monedero eliminado exitosamente');
          setIsDeleteModalOpen(false);
          fetchMonederos();
        } else {
          alert('Error al eliminar el monedero');
        }
      } catch (err) {
        alert('Error al eliminar el monedero');
        console.error('Error deleting monedero:', err);
      }
    }
  };

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
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  console.log('All Tarjetas:', JSON.stringify(tarjetas, null, 2));

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-center text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent"
              >
                Gestión de Monedero de Flota
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-600 text-white text-center rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Agregar Monedero
              </button>
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

            <table className="w-full bg-white rounded-md shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Galones Totales</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Período</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Galones Disponibles</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Galones Consumidos</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Odómetro</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tarjeta</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMonederos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
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
                      <td className="px-4 py-2">{monedero.galones_disponibles || '0'}</td>
                      <td className="px-4 py-2">{monedero.galones_consumidos || '0'}</td>
                      <td className="px-4 py-2">{monedero.odometro || 'N/A'}</td>
                      <td className="px-4 py-2">{monedero.tarjeta_numero || 'N/A'}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setMonederoToUpdate(monedero);
                            const associatedTarjeta = tarjetas.find((tarjeta) => tarjeta.id === monedero.tarjeta_id);
                            setMonederoData({
                              galones_totales: String(monedero.galones_totales || ''),
                              vehiculo_id: associatedTarjeta ? associatedTarjeta.vehiculo_id : monedero.vehiculo_id || 0,
                              periodo: String(monedero.periodo || ''),
                              galones_consumidos: String(monedero.galones_consumidos || ''),
                              galones_disponibles: String(monedero.galones_disponibles || ''),
                              odometro: String(monedero.odometro || ''),
                              tarjeta_id: monedero.tarjeta_id || 0,
                              canal_id: associatedTarjeta?.canal_id || 0,
                              subcanal_id: associatedTarjeta?.subcanal_id || 0,
                            });
                            if (associatedTarjeta?.canal_id) {
                              fetchSubcanales(associatedTarjeta.canal_id);
                            }
                            setIsUpdateModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setMonederoToDelete(monedero);
                            setIsDeleteModalOpen(true);
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
              <span className="text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
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

            {/* Modal para agregar monedero */}
            {isAddModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsAddModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-md shadow-xl w-1/2 max-h-[90vh] overflow-y-auto border border-gray-200">
                  <div className="text-center">
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent"
                    >
                      Agregar Monedero
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="galones_totales">
                          Galones Totales
                        </label>
                        <input
                          type="number"
                          id="galones_totales"
                          name="galones_totales"
                          placeholder="Ejemplo: 100"
                          value={monederoData.galones_totales}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          step="0.01"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="vehiculo_id">
                          Vehículo
                        </label>
                        <select
                          id="vehiculo_id"
                          name="vehiculo_id"
                          value={monederoData.vehiculo_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                          required
                        >
                          <option value={0} disabled>
                            Seleccione un vehículo
                          </option>
                          {vehiculos.map((vehiculo) => (
                            <option key={vehiculo.id} value={vehiculo.id}>
                              {vehiculo.modelo} - {vehiculo.placa} - {vehiculo.marca}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="periodo">
                        Período
                      </label>
                      <select
                        id="periodo"
                        name="periodo"
                        value={monederoData.periodo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="canal_id">
                        Canal
                      </label>
                      <select
                        id="canal_id"
                        name="canal_id"
                        value={monederoData.canal_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0} disabled>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="subcanal_id">
                        Subcanal
                      </label>
                      <select
                        id="subcanal_id"
                        name="subcanal_id"
                        value={monederoData.subcanal_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={monederoData.canal_id === 0}
                        required
                      >
                        <option value={0} disabled>
                          {subcanales.length === 0 && monederoData.canal_id !== 0
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
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="tarjeta_id">
                        Tarjeta
                      </label>
                      <select
                        id="tarjeta_id"
                        name="tarjeta_id"
                        value={monederoData.tarjeta_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0} disabled>
                          {tarjetas.length === 0 ? 'No hay tarjetas disponibles' : 'Seleccione una tarjeta'}
                        </option>
                        {tarjetas.map((tarjeta) => (
                          <option key={tarjeta.id} value={tarjeta.id}>
                            {tarjeta.numero_tarjeta} (Vehículo: {vehiculos.find((v) => v.id === tarjeta.vehiculo_id)?.placa || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal para actualizar monedero */}
            {isUpdateModalOpen && monederoToUpdate && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsUpdateModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-md shadow-xl w-1/2 max-h-[90vh] overflow-y-auto border border-gray-200">
                  <div className="text-center">
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent"
                    >
                      Actualizar Monedero
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="galones_totales">
                          Galones Totales
                        </label>
                        <input
                          type="number"
                          id="galones_totales"
                          name="galones_totales"
                          placeholder="Ejemplo: 100"
                          value={monederoData.galones_totales}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          step="0.01"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="vehiculo_id">
                          Vehículo
                        </label>
                        <select
                          id="vehiculo_id"
                          name="vehiculo_id"
                          value={monederoData.vehiculo_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                          required
                        >
                          <option value={0} disabled>
                            Seleccione un vehículo
                          </option>
                          {vehiculos.map((vehiculo) => (
                            <option key={vehiculo.id} value={vehiculo.id}>
                              {vehiculo.modelo} - {vehiculo.placa} - {vehiculo.marca}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="periodo">
                        Período
                      </label>
                      <select
                        id="periodo"
                        name="periodo"
                        value={monederoData.periodo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="canal_id">
                        Canal
                      </label>
                      <select
                        id="canal_id"
                        name="canal_id"
                        value={monederoData.canal_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0} disabled>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="subcanal_id">
                        Subcanal
                      </label>
                      <select
                        id="subcanal_id"
                        name="subcanal_id"
                        value={monederoData.subcanal_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={monederoData.canal_id === 0}
                        required
                      >
                        <option value={0} disabled>
                          {subcanales.length === 0 && monederoData.canal_id !== 0
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
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="tarjeta_id">
                        Tarjeta
                      </label>
                      <select
                        id="tarjeta_id"
                        name="tarjeta_id"
                        value={monederoData.tarjeta_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0} disabled>
                          {tarjetas.length === 0 ? 'No hay tarjetas disponibles' : 'Seleccione una tarjeta'}
                        </option>
                        {tarjetas.map((tarjeta) => (
                          <option key={tarjeta.id} value={tarjeta.id}>
                            {tarjeta.numero_tarjeta} (Vehículo: {vehiculos.find((v) => v.id === tarjeta.vehiculo_id)?.placa || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsUpdateModalOpen(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal para eliminar monedero */}
            {isDeleteModalOpen && monederoToDelete && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDeleteModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-md shadow-xl w-1/3 border border-gray-200">
                  <h2
                    className="text-xl font-bold text-gray-800 mb-4 bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar el monedero para el vehículo{' '}
                    {monederoToDelete.vehiculo_nombre || 'N/A'}?
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                      Eliminar
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