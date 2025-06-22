'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import CustomAlert from '@/app/components/CustomAlert';

interface VehiculoFormData {
  id: string;
  modelo: string;
  placa: string;
  marca: string;
  vin: string;
  codigo_vehiculo: string;
  cilindraje: string;
  chasis: string;
  tipo_combustible: string;
  transmision: string;
  capacidad_carga: string;
  color: string;
  caballo_potencia: string;
  potencia_motor: string;
  numero_motor: string;
  numero_asientos: string;
  numero_puertas: string;
  odometro: string;
}

interface TipoCombustible {
  id: number;
  name: string;
}

export default function EditarVehiculo() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<VehiculoFormData>({
    id: '',
    modelo: '',
    placa: '',
    marca: '',
    vin: '',
    codigo_vehiculo: '',
    cilindraje: '',
    chasis: '',
    tipo_combustible: '0',
    transmision: '',
    capacidad_carga: '',
    color: '',
    caballo_potencia: '',
    potencia_motor: '',
    numero_motor: '',
    numero_asientos: '',
    numero_puertas: '',
    odometro: '',
  });
  const [tiposCombustible, setTiposCombustible] = useState<TipoCombustible[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState('tab1');

  const fetchTipoCombustibles = useCallback(async () => {
    try {
      const response = await fetch('/api/tipos_combustible');
      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setTiposCombustible(result.data);
        } else {
          console.error('TipoCombustibles data is not an array:', result);
          setTiposCombustible([]);
        }
      } else {
        console.error('Error fetching TipoCombustibles:', response.status, await response.text());
        setTiposCombustible([]);
      }
    } catch (error) {
      console.error('Error in fetchTipoCombustibles:', error);
      setTiposCombustible([]);
      setAlert({ message: 'Error al cargar los tipos de combustible', type: 'error' });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [vehiculoRes, tiposCombustibleRes] = await Promise.all([
          fetch(`/api/vehiculos/${id}`),
          fetch('/api/tipos_combustible'),
        ]);

        const vehiculoData = await vehiculoRes.json();
        const tiposCombustibleData = await tiposCombustibleRes.json();

        if (!vehiculoRes.ok) {
          throw new Error(`Error fetching vehicle: ${vehiculoRes.status}`);
        }
        if (!tiposCombustibleRes.ok) {
          throw new Error(`Error fetching fuel types: ${tiposCombustibleRes.status}`);
        }

        setFormData({
          id: vehiculoData.id.toString(),
          modelo: vehiculoData.modelo || '',
          placa: vehiculoData.placa || '',
          marca: vehiculoData.marca || '',
          vin: vehiculoData.vin || '',
          codigo_vehiculo: vehiculoData.codigo_vehiculo || '',
          cilindraje: vehiculoData.cilindraje?.toString() || '',
          chasis: vehiculoData.chasis || '',
          tipo_combustible: vehiculoData.tipo_combustible?.toString() || '0',
          transmision: vehiculoData.transmision || '',
          capacidad_carga: vehiculoData.capacidad_carga?.toString() || '',
          color: vehiculoData.color || '',
          caballo_potencia: vehiculoData.caballo_potencia?.toString() || '',
          potencia_motor: vehiculoData.potencia_motor?.toString() || '',
          numero_motor: vehiculoData.numero_motor || '',
          numero_asientos: vehiculoData.numero_asientos?.toString() || '',
          numero_puertas: vehiculoData.numero_puertas?.toString() || '',
          odometro: vehiculoData.odometro?.toString() || '',
        });

        if (tiposCombustibleData && Array.isArray(tiposCombustibleData.data)) {
          setTiposCombustible(tiposCombustibleData.data);
        } else {
          console.error('TipoCombustibles data is not an array:', tiposCombustibleData);
          setTiposCombustible([]);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setAlert({ message: 'Error al cargar los datos del vehículo', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchTipoCombustibles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipo_combustible === '0') {
      setAlert({ message: 'Por favor, seleccione un tipo de combustible.', type: 'error' });
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        [
          'cilindraje',
          'capacidad_carga',
          'caballo_potencia',
          'potencia_motor',
          'numero_asientos',
          'numero_puertas',
          'tipo_combustible',
        ].includes(key)
      ) {
        data.append(key, parseFloat(value).toString());
      } else {
        data.append(key, value);
      }
    });

    try {
      const response = await fetch('/api/vehiculos', {
        method: 'PUT',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setAlert({ message: 'Vehículo actualizado con éxito', type: 'success' });
      router.push('/vehiculos');
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      setAlert({ message: 'Error al actualizar el vehículo', type: 'error' });
    }
  };

  const handleAlertClose = () => {
    if (alert?.type === 'success') {
      router.push('/vehiculos');
    }
    setAlert(null);
  };

  // Validar si todos los campos están llenos
  const isFormComplete = () => {
    return (
      formData.modelo.trim() !== '' &&
      formData.placa.trim() !== '' &&
      formData.marca.trim() !== '' &&
      formData.vin.trim() !== '' &&
      formData.codigo_vehiculo.trim() !== '' &&
      formData.cilindraje.trim() !== '' &&
      formData.chasis.trim() !== '' &&
      formData.tipo_combustible !== '0' &&
      formData.transmision.trim() !== '' &&
      formData.capacidad_carga.trim() !== '' &&
      formData.color.trim() !== '' &&
      formData.caballo_potencia.trim() !== '' &&
      formData.potencia_motor.trim() !== '' &&
      formData.numero_motor.trim() !== '' &&
      formData.numero_asientos.trim() !== '' &&
      formData.numero_puertas.trim() !== '' &&
      formData.odometro.trim() !== ''
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-3 sm:px-4 lg:px-6 text-gray-900">
        <Navbar />
        <div className="w-full max-w-7xl bg-white border border-gray-300 p-6 sm:p-10 mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6 
            bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
            transition-all duration-300 text-center">
            Editar Vehículo
          </h1>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => setActiveTab('tab1')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'tab1' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-500 hover:text-white'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'tab2' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-500 hover:text-white'
              }`}
            >
              Características Mecánicas
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'tab3' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-500 hover:text-white'
              }`}
            >
              Rendimiento
            </button>
            <button
              onClick={() => setActiveTab('tab4')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'tab4' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-blue-500 hover:text-white'
              }`}
            >
              Detalles Adicionales
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmitEditar} className="space-y-6">
            <input type="hidden" name="id" value={formData.id} />
            {activeTab === 'tab1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="modelo" className="block text-center text-sm sm:text-base font-bold text-black">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    placeholder="Ejemplo: Corolla"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="placa" className="block text-center text-sm sm:text-base font-bold text-black">
                    Placa
                  </label>
                  <input
                    type="text"
                    name="placa"
                    placeholder="Ejemplo: ABC123"
                    value={formData.placa}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="marca" className="block text-center text-sm sm:text-base font-bold text-black">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="marca"
                    placeholder="Ejemplo: Toyota"
                    value={formData.marca}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="vin" className="block text-center text-sm sm:text-base font-bold text-black">
                    VIN
                  </label>
                  <input
                    type="text"
                    name="vin"
                    placeholder="Ejemplo: 1HGCM82633A004352"
                    value={formData.vin}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>


                  <div>
                  <label htmlFor="codigo_vehiculo" className="block text-center text-sm sm:text-base font-bold text-black">
                    Código del Vehículo
                  </label>
                  <input
                    type="text"
                    name="codigo_vehiculo"
                    placeholder="Ejemplo: CAR-001"
                    value={formData.codigo_vehiculo}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              
            )}

            {activeTab === 'tab2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="cilindraje" className="block text-center text-sm sm:text-base font-bold text-black">
                    Cilindraje (cc)
                  </label>
                  <input
                    type="number"
                    name="cilindraje"
                    placeholder="Ejemplo: 2000"
                    value={formData.cilindraje}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="chasis" className="block text-center text-sm sm:text-base font-bold text-black">
                    Chasis
                  </label>
                  <input
                    type="text"
                    name="chasis"
                    placeholder="Ejemplo: 123456789"
                    value={formData.chasis}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tipo_combustible" className="block text-center text-sm sm:text-base font-bold text-black">
                    Tipo de Combustible
                  </label>
                  <select
                    id="tipo_combustible"
                    name="tipo_combustible"
                    value={formData.tipo_combustible}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                    disabled={tiposCombustible.length === 0}
                  >
                    <option value="0">Seleccionar Tipo de Combustible</option>
                    {tiposCombustible.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.name}
                      </option>
                    ))}
                  </select>
                  {tiposCombustible.length === 0 && !loading && (
                    <p className="text-center text-red-500 text-sm mt-1">
                      No se encontraron tipos de combustible
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="transmision" className="block text-center text-sm sm:text-base font-bold text-black">
                    Transmisión
                  </label>
                  <select
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'tab3' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="capacidad_carga" className="block text-center text-sm sm:text-base font-bold text-black">
                    Capacidad de Carga (kg)
                  </label>
                  <input
                    type="number"
                    name="capacidad_carga"
                    placeholder="Ejemplo: 1000"
                    value={formData.capacidad_carga}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="color" className="block text-center text-sm sm:text-base font-bold text-black">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    placeholder="Ejemplo: Negro"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="caballo_potencia" className="block text-center text-sm sm:text-base font-bold text-black">
                    Caballos de Fuerza
                  </label>
                  <input
                    type="number"
                    name="caballo_potencia"
                    placeholder="Ejemplo: 150"
                    value={formData.caballo_potencia}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="potencia_motor" className="block text-center text-sm sm:text-base font-bold text-black">
                    Potencia del Motor (kW)
                  </label>
                  <input
                    type="number"
                    name="potencia_motor"
                    placeholder="Ejemplo: 110"
                    value={formData.potencia_motor}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'tab4' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="numero_motor" className="block text-center text-sm sm:text-base font-bold text-black">
                    Número de Motor
                  </label>
                  <input
                    type="text"
                    name="numero_motor"
                    placeholder="Ejemplo: ABC123456"
                    value={formData.numero_motor}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="numero_asientos" className="block text-center text-sm sm:text-base font-bold text-black">
                    Número de Asientos
                  </label>
                  <input
                    type="number"
                    name="numero_asientos"
                    placeholder="Ejemplo: 5"
                    value={formData.numero_asientos}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="numero_puertas" className="block text-center text-sm sm:text-base font-bold text-black">
                    Número de Puertas
                  </label>
                  <input
                    type="number"
                    name="numero_puertas"
                    placeholder="Ejemplo: 4"
                    value={formData.numero_puertas}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="odometro" className="block text-center text-sm sm:text-base font-bold text-black">
                    Odómetro (km)
                  </label>
                  <input
                    type="number"
                    name="odometro"
                    placeholder="Ejemplo: 1000"
                    value={formData.odometro}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.push('/vehiculos')}
                className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm sm:text-base transition-all duration-300 ${
                  !isFormComplete() || loading
                    ? 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={!isFormComplete() || loading}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </div>
  );
}