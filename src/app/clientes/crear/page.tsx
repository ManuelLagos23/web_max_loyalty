'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import CustomAlert from '@/app/components/CustomAlert';

// Define interfaces for the API data
interface Pais {
  id: number;
  pais: string;
}

interface Estado {
  id: number;
  estado: string;
}

interface Canal {
  id: number;
  canal: string;
}

interface Subcanal {
  id: number;
  subcanal: string;
  canal_id: number;
}

export default function CrearCliente() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    pais_id: '0',
    estado_id: '0',
    canal_id: '0',
    subcanal_id: '0',
    ciudad: '',
    email: '',
    telefono: '',
    nfi: '',
    logo: null as File | null,
  });
  const [paises, setPaises] = useState<Pais[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cargar datos iniciales (países, estados, canales, subcanales)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, estadosRes, canalesRes, subcanalesRes] = await Promise.all([
          fetch('/api/paises'),
          fetch('/api/estados'),
          fetch('/api/canales'),
          fetch('/api/subcanales'),
        ]);
        setPaises(await paisesRes.json());
        setEstados(await estadosRes.json());
        setCanales(await canalesRes.json());
        setSubcanales(await subcanalesRes.json());
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setAlert({ message: 'Error al cargar los datos', type: 'error' });
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'canal_id' ? { subcanal_id: '0' } : {}),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleSubmitCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('pais', formData.pais_id);
    data.append('estado', formData.estado_id);
    data.append('canal_id', formData.canal_id);
    data.append('subcanal_id', formData.subcanal_id);
    data.append('ciudad', formData.ciudad);
    data.append('email', formData.email);
    data.append('telefono', formData.telefono);
    data.append('nfi', formData.nfi);
    if (formData.logo) {
      data.append('logo', formData.logo);
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      router.push(`/clientes?alert=success&message=${encodeURIComponent('Cliente creado con éxito')}`);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setAlert({ message: 'Error al crear el cliente', type: 'error' });
    }
  };

  const handleAlertClose = () => {
    if (alert?.type === 'success') {
      router.push('/clientes');
    }
    setAlert(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 ">
      
      <div className="flex items-center justify-center py-4 px-3 sm:px-4 lg:px-6">
        <Navbar />
        <div className="w-full max-w-xl sm:max-w-4xl bg-white border p-5 sm:p-8 mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center">
            Crear Cliente
          </h1>
          <form onSubmit={handleSubmitCrear} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="nombre" className="block text-center text-sm sm:text-base font-medium">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                placeholder="Ejemplo: Juan Pérez"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label htmlFor="pais_id" className="block text-center text-sm sm:text-base font-medium">
                País
              </label>
              <select
                name="pais_id"
                value={formData.pais_id}
                onChange={handleInputChange}
                className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                required
              >
                <option value="0">Seleccionar país</option>
                {paises.map((pais: Pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.pais}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estado_id" className="block text-center text-sm sm:text-base font-medium">
                Estado
              </label>
              <select
                name="estado_id"
                value={formData.estado_id}
                onChange={handleInputChange}
                className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                required
              >
                <option value="0">Seleccionar estado</option>
                {estados.map((estado: Estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.estado}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="canal_id" className="block text-center text-sm sm:text-base font-medium">
                  Canal
                </label>
                <select
                  name="canal_id"
                  value={formData.canal_id}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                >
                  <option value="0">Seleccionar canal</option>
                  {canales.map((canal: Canal) => (
                    <option key={canal.id} value={canal.id}>
                      {canal.canal}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subcanal_id" className="block text-center text-sm sm:text-base font-medium">
                  Subcanal
                </label>
                <select
                  name="subcanal_id"
                  value={formData.subcanal_id}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                  disabled={!formData.canal_id || formData.canal_id === '0'}
                >
                  <option value="0">Seleccionar subcanal</option>
                  {subcanales
                    .filter((subcanal: Subcanal) => subcanal.canal_id === parseInt(formData.canal_id))
                    .map((subcanal: Subcanal) => (
                      <option key={subcanal.id} value={subcanal.id}>
                        {subcanal.subcanal}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="ciudad" className="block text-center text-sm sm:text-base font-medium">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ejemplo: El Paraíso"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-center text-sm sm:text-base font-medium">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Ejemplo: juanperez@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="telefono" className="block text-center text-sm sm:text-base font-medium">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Ejemplo: 8888-8888"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="nfi" className="block text-center text-sm sm:text-base font-medium">
                  NFI
                </label>
                <input
                  type="text"
                  name="nfi"
                  placeholder="Ejemplo: 0801-1970-00350"
                  value={formData.nfi}
                  onChange={handleInputChange}
                  className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="logo" className="block text-center text-sm sm:text-base font-medium">
                Logo
              </label>
              <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
                accept="image/jpeg,image/png"
              />
              {formData.logo && (
                <div className="text-center text-xs sm:text-sm text-gray-600 mt-1.5">
                  Logo seleccionado: {formData.logo.name}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-5 sm:mt-8">
              <button
                type="button"
                onClick={() => router.push('/clientes')}
                className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
              >
                Crear
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