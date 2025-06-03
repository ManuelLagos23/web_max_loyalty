'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

interface Pais {
  id: number;
  pais: string;
}

interface Moneda {
  id: number;
  moneda: string;
}

export default function AgregarEmpresa() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    nombre_impreso: '',
    logo: null as File | null,
    logo_impreso: null as File | null,
    pais_id: 0,
    moneda_id: 0,
    correo: '',
    telefono: '',
    nfi: '',
    prefijo_tarjetas: '',
  });
  const [paises, setPaises] = useState<Pais[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPaises = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/paises');
      if (response.ok) {
        const data: Pais[] = await response.json();
        setPaises(data);
      } else {
        console.error('Error al obtener los países:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los países: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los países');
    }
  }, []);

  const fetchMonedas = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/monedas');
      if (response.ok) {
        const data: Moneda[] = await response.json();
        setMonedas(data);
      } else {
        console.error('Error al obtener las monedas:', response.status, response.statusText);
        setErrorMessage(`Error al obtener las monedas: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener las monedas');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPaises(), fetchMonedas()]);
    };
    loadData();
  }, [fetchPaises, fetchMonedas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'pais_id' || name === 'moneda_id' ? (value ? parseInt(value) : 0) : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nombre_empresa) errors.push('Nombre de la Empresa');
    if (!formData.nombre_impreso) errors.push('Nombre Impreso');
    if (!formData.pais_id) errors.push('País');
    if (!formData.moneda_id) errors.push('Moneda');
    if (!formData.correo) errors.push('Correo');
    if (!formData.telefono) errors.push('Teléfono');
    if (!formData.nfi) errors.push('NFI');
    if (!formData.prefijo_tarjetas) errors.push('Prefijo Tarjetas');
    return errors;
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      alert(`Por favor, complete los siguientes campos: ${errors.join(', ')}.`);
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    if (formData.logo) formDataToSend.append('logo', formData.logo);
    if (formData.logo_impreso) formDataToSend.append('logo_impreso', formData.logo_impreso);
    formDataToSend.append('pais', formData.pais_id.toString());
    formDataToSend.append('moneda', formData.moneda_id.toString());
    formDataToSend.append('correo', formData.correo);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('prefijo_tarjetas', formData.prefijo_tarjetas);

    try {
      setErrorMessage(null);
      const response = await fetch('/api/empresas', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa agregada exitosamente');
        router.push('/empresas');
      } else {
        const errorData = await response.json();
        alert(`Error al agregar la empresa: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al agregar la empresa');
    }
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1
                className="text-4xl font-bold text-gray-900 mb-6
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Agregar Empresa
              </h1>
              {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
              <form onSubmit={handleSubmitAgregar} className="bg-white p-6 rounded-lg shadow-xl border">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="nombre_empresa" className="block text-center font-bold text-gray-700">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      name="nombre_empresa"
                      placeholder="Ejemplo: Grupo GSIE"
                      value={formData.nombre_empresa}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="nombre_impreso" className="block text-center font-bold text-gray-700">
                      Nombre Impreso
                    </label>
                    <input
                      type="text"
                      name="nombre_impreso"
                      placeholder="Ejemplo: GSIE"
                      value={formData.nombre_impreso}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pais_id" className="block text-center font-bold text-gray-700">
                        País
                      </label>
                      <select
                        name="pais_id"
                        value={formData.pais_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      >
                        <option value="0">Seleccionar país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.pais}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="moneda_id" className="block text-center font-bold text-gray-700">
                        Moneda
                      </label>
                      <select
                        name="moneda_id"
                        value={formData.moneda_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      >
                        <option value="0">Seleccionar moneda</option>
                        {monedas.map((moneda) => (
                          <option key={moneda.id} value={moneda.id}>
                            {moneda.moneda}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="correo" className="block text-center font-bold text-gray-700">
                        Correo
                      </label>
                      <input
                        type="email"
                        name="correo"
                        placeholder="Ejemplo: info@gsie.hn"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block text-center font-bold text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        name="telefono"
                        placeholder="Ejemplo: 8888-8888"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nfi" className="block text-center font-bold text-gray-700">
                        NFI
                      </label>
                      <input
                        type="text"
                        name="nfi"
                        placeholder="Ejemplo: 0801-1970-00350"
                        value={formData.nfi}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="prefijo_tarjetas" className="block text-center font-bold text-gray-700">
                        Prefijo Tarjetas
                      </label>
                      <input
                        type="text"
                        name="prefijo_tarjetas"
                        placeholder="Ejemplo: 0704"
                        value={formData.prefijo_tarjetas}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="logo" className="block text-center font-bold text-gray-700">
                        Logo
                      </label>
                      <input
                        type="file"
                        name="logo"
                        onChange={handleFileChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-center"
                        accept="image/jpeg,image/png"
                      />
                      {formData.logo && (
                        <div className="text-center text-sm text-gray-600 mt-1">
                          Logo seleccionado: {formData.logo.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="logo_impreso" className="block text-center font-bold text-gray-700">
                        Logo Impreso
                      </label>
                      <input
                        type="file"
                        name="logo_impreso"
                        onChange={handleFileChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-center"
                        accept="image/jpeg,image/png"
                      />
                      {formData.logo_impreso && (
                        <div className="text-center text-sm text-gray-600 mt-1">
                          Logo impreso seleccionado: {formData.logo_impreso.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/empresas')}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}