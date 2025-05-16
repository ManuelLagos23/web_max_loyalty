'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';

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

interface Cliente {
  id: string;
  nombre: string;
  pais_id: string;
  estado_id: string;
  canal_id: string;
  subcanal_id: string;
  ciudad: string;
  email: string;
  telefono: string;
  nfi: string;
  logo: string;
}

export default function EditarCliente() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    id: '',
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
  const [clienteActual, setClienteActual] = useState<Cliente | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, estadosRes, canalesRes, subcanalesRes, clienteRes] = await Promise.all([
          fetch('/api/paises'),
          fetch('/api/estados'),
          fetch('/api/canales'),
          fetch('/api/subcanales'),
          fetch(`/api/clientes/${id}`),
        ]);
        const paisesData = await paisesRes.json();
        const estadosData = await estadosRes.json();
        const canalesData = await canalesRes.json();
        const subcanalesData = await subcanalesRes.json();
        const clienteData = await clienteRes.json();

        setPaises(paisesData);
        setEstados(estadosData);
        setCanales(canalesData);
        setSubcanales(subcanalesData);
        setClienteActual(clienteData);

        setFormData({
          id: clienteData.id,
          nombre: clienteData.nombre || '',
          pais_id: clienteData.pais_id || '0',
          estado_id: clienteData.estado_id || '0',
          canal_id: clienteData.canal_id || '0',
          subcanal_id: clienteData.subcanal_id || '0',
          ciudad: clienteData.ciudad || '',
          email: clienteData.email || '',
          telefono: clienteData.telefono || '',
          nfi: clienteData.nfi || '',
          logo: null,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
        alert('Error al cargar los datos del cliente');
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

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

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('id', formData.id);
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
        method: 'PUT',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    alert('Cliente actualizadio con éxito.');
      router.push('/clientes');
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      alert('Error al actualizar el cliente');
    }
  };

  const getLogoSrc = (logo: string) => {
    if (logo) {
      return `data:image/jpeg;base64,${logo}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-3 sm:px-4 lg:px-6">
      <Navbar />
      <div className="w-full max-w-xl sm:max-w-4xl bg-white border border-gray-300 p-5 sm:p-8 mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center">Editar Cliente</h1>
        <form onSubmit={handleSubmitEditar} className="space-y-4 sm:space-y-5">
          <input type="hidden" name="id" value={formData.id} />
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
            {clienteActual?.logo && getLogoSrc(clienteActual.logo) ? (
              <div className="flex justify-center mb-3">
                <Image
                  src={getLogoSrc(clienteActual.logo)!}
                  alt="Logo actual del cliente"
                  width={100}
                  height={100}
                  className="object-cover rounded"
                  onError={() => console.error('Error al cargar el logo actual')}
                />
              </div>
            ) : (
              <div className="flex justify-center mb-3">
                <span className="text-gray-500 text-sm">Sin logo actual</span>
              </div>
            )}
            <input
              type="file"
              name="logo"
              onChange={handleFileChange}
              className="w-full p-1.5 sm:p-2 border border-gray-300 rounded text-center text-sm sm:text-base"
              accept="image/jpeg,image/png"
            />
            {formData.logo && (
              <div className="text-center text-xs sm:text-sm text-gray-600 mt-1.5">
                Nuevo logo seleccionado: {formData.logo.name}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}