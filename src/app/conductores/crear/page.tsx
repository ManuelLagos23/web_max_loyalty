'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

type Conductor = {
  nombre: string;
  numero_licencia: string;
  telefono: string;
  correo: string;
  vehiculo_id: number;
  tipo_licencia: string;
  fecha_emision: string;
  fecha_expiracion: string;
  tipo_sangre: string;
};

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
};

export default function CrearConductor() {
  const [conductorData, setConductorData] = useState<Conductor>({
    nombre: '',
    numero_licencia: '',
    telefono: '',
    correo: '',
    vehiculo_id: 0,
    tipo_licencia: '',
    fecha_emision: '',
    fecha_expiracion: '',
    tipo_sangre: '',
  });
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVehiculos = async () => {
      const response = await fetch('/api/vehiculos');
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
      }
      setLoading(false);
    };
    fetchVehiculos();
  }, []);

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

    const response = await fetch('/api/conductores', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('Conductor agregado exitosamente');
      router.push('/conductores');
    } else {
      alert('Error al agregar el conductor');
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8 border">
          <div className="text-center">
            <h2
              className="text-3xl font-bold text-black mb-6 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300"
            >
              Agregar Conductor
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
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="Ejemplo: 8888-8888"
                  value={conductorData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-center font-bold text-black mb-2" htmlFor="tipo_sangre">
                  Tipo de Sangre
                </label>
                <input
                  type="text"
                  id="tipo_sangre"
                  name="tipo_sangre"
                  placeholder="Ejemplo: O+"
                  value={conductorData.tipo_sangre}
                  onChange={handleInputChange}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}