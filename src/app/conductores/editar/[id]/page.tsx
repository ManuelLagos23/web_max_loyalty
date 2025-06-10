'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

type Conductor = {
  id: number;
  nombre: string;
  numero_licencia: string;
  telefono: string;
  correo: string;
  vehiculo_id: number;
  tipo_licencia: string;
  fecha_emision: string;
  fecha_expiracion: string;
  tipo_sangre: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  vehiculo_placa?: string;
};

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
};

export default function EditarConductor() {
  const [conductorData, setConductorData] = useState<Conductor>({
    id: 0,
    nombre: '',
    numero_licencia: '',
    telefono: '',
    correo: '',
    vehiculo_id: 0,
    tipo_licencia: '',
    fecha_emision: '',
    fecha_expiracion: '',
    tipo_sangre: '',
    vehiculo_marca: '',
    vehiculo_modelo: '',
    vehiculo_placa: '',
  });
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchConductor = async () => {
      try {
        const response = await fetch(`/api/conductores/${id}`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setConductorData({
          id: data.id,
          nombre: data.nombre,
          numero_licencia: data.numero_licencia,
          telefono: data.telefono,
          correo: data.correo,
          vehiculo_id: data.vehiculo_id,
          tipo_licencia: data.tipo_licencia,
          fecha_emision: data.fecha_emision,
          fecha_expiracion: data.fecha_expiracion,
          tipo_sangre: data.tipo_sangre,
          vehiculo_marca: data.vehiculo_marca || '',
          vehiculo_modelo: data.vehiculo_modelo || '',
          vehiculo_placa: data.vehiculo_placa || '',
        });
      } catch (err) {
        console.error('Error fetching conductor:', err);
        setError('Error al cargar los datos del conductor');
      }
    };

    const fetchVehiculos = async () => {
      try {
        const response = await fetch('/api/vehiculos');
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setVehiculos(data);
      } catch (err) {
        console.error('Error fetching vehiculos:', err);
        setError('Error al cargar los vehículos');
      }
    };

    fetchConductor();
    fetchVehiculos();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConductorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(conductorData).forEach(([key, value]) => {
      formData.append(key, String(value)); // Convert all values to strings
    });

    try {
      const response = await fetch('/api/conductores', {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      console.log('Update response:', data);
      alert('Conductor actualizado exitosamente');
      router.push('/conductores');
    } catch (err) {
      console.error('Error updating conductor:', err);
      alert('Error al actualizar el conductor');
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8 border border-gray-300">
          <div className="text-center">
            <h2
              className="text-3xl font-bold text-black mb-6 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105"
            >
              Actualizar Conductor
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-center font-bold text-black mb-2" htmlFor="nombre">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ejemplo: Juan Pérez"
                value={conductorData.nombre}
                onChange={handleInputChange}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="numero_licencia">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  id="numero_licencia"
                  name="numero_licencia"
                  placeholder="Ejemplo: A12345678"
                  value={conductorData.numero_licencia}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="tipo_licencia">
                  Tipo de Licencia
                </label>
                <input
                  type="text"
                  id="tipo_licencia"
                  name="tipo_licencia"
                  placeholder="Ejemplo: Pesada"
                  value={conductorData.tipo_licencia}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="fecha_emision">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  id="fecha_emision"
                  name="fecha_emision"
                  value={conductorData.fecha_emision}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="fecha_expiracion">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  id="fecha_expiracion"
                  name="fecha_expiracion"
                  value={conductorData.fecha_expiracion}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="correo">
                  Correo
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="Ejemplo: juan.perez@empresa.com"
                  value={conductorData.correo}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="vehiculo_id">
                  Vehículo
                </label>
                <select
                  id="vehiculo_id"
                  name="vehiculo_id"
                  value={conductorData.vehiculo_id}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                >
                  <option value={0} disabled>Seleccione un vehículo</option>
                  {vehiculos.map((vehiculo) => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.modelo} - {vehiculo.placa} - {vehiculo.marca}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="telefono">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  placeholder="Ejemplo: 45678"
                  value={conductorData.telefono}
                  onChange={handleInputChange}
                  className="w-full text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-center font-semibold text-black mb-2" htmlFor="tipo_sangre">
                  Tipo de Sangre
                </label>
                <input
                  type="text"
                  id="tipo_sangre"
                  name="tipo_sangre"
                  placeholder="Ejemplo: O+"
                  value={conductorData.tipo_sangre}
                  onChange={handleInputChange}
                  className="w-full text-center px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => router.push('/conductores')}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}