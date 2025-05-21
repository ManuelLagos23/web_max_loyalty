'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

import Navbar from '../components/Navbar';

interface Empresa {
  id: number;
  nombre_empresa: string;
  nombre_impreso: string;
  logo: string | null;
  logo_impreso: string | null;
  pais: string;
  moneda: string;
  correo: string;
  telefono: string;
  nfi: string;
  prefijo_tarjetas: string;
  pais_id: number | null;
  moneda_id: number | null;
}

interface Pais {
  id: number;
  pais: string;
}

interface Moneda {
  id: number;
  moneda: string;
}

export default function Empresas() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
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
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState<Empresa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    setErrorMessage(null);
    if (modo === 'agregar') {
      setEmpresaSeleccionada(null);
      setFormData({
        id: 0,
        nombre_empresa: '',
        nombre_impreso: '',
        logo: null,
        logo_impreso: null,
        pais_id: 0,
        moneda_id: 0,
        correo: '',
        telefono: '',
        nfi: '',
        prefijo_tarjetas: '',
      });
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setErrorMessage(null);
  };

  const openDeletePopup = (empresa: Empresa) => {
    setEmpresaAEliminar(empresa);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setEmpresaAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const validateForm = (isEdit: boolean) => {
    const errors: string[] = [];
    if (!formData.nombre_empresa) errors.push('Nombre de la Empresa');
    if (!formData.nombre_impreso) errors.push('Nombre Impreso');
    if (!formData.pais_id) errors.push('País');
    if (!formData.moneda_id) errors.push('Moneda');
    if (!formData.correo) errors.push('Correo');
    if (!formData.telefono) errors.push('Teléfono');
    if (!formData.nfi) errors.push('NFI');
    if (!formData.prefijo_tarjetas) errors.push('Prefijo Tarjetas');
   
    if (isEdit && !formData.id) errors.push('ID');
    return errors;
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(false);
    if (errors.length > 0) {
      alert(`Por favor, complete los siguientes campos: ${errors.join(', ')}.`);
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    formDataToSend.append('logo', formData.logo!);
    formDataToSend.append('logo_impreso', formData.logo_impreso!);
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
        closePopup();
        fetchEmpresas();
      } else {
        const errorData = await response.json();
        alert(`Error al agregar la empresa: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al agregar la empresa');
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(true);
    if (errors.length > 0) {
      alert(`Por favor, complete los siguientes campos: ${errors.join(', ')}.`);
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
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
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa actualizada exitosamente');
        closePopup();
        fetchEmpresas();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar la empresa: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al actualizar la empresa');
    }
  };

  const handleDelete = async () => {
    if (!empresaAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/empresas/${empresaAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Empresa eliminada exitosamente');
        closeDeletePopup();
        fetchEmpresas();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar la empresa: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al eliminar la empresa');
    }
  };

  const fetchEmpresas = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/empresas?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Empresa[] = await response.json();
      
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas:', response.status, response.statusText);
        setErrorMessage(`Error al obtener las empresas: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener las empresas');
    }
  }, [currentPage, itemsPerPage, searchTerm]);

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

  const handleEditar = (empresa: Empresa) => {
  
    setEmpresaSeleccionada(empresa);
    setFormData({
      id: empresa.id,
      nombre_empresa: empresa.nombre_empresa,
      nombre_impreso: empresa.nombre_impreso,
      logo: null,
      logo_impreso: null,
      pais_id: empresa.pais_id ?? 0,
      moneda_id: empresa.moneda_id ?? 0,
      correo: empresa.correo,
      telefono: empresa.telefono,
      nfi: empresa.nfi,
      prefijo_tarjetas: empresa.prefijo_tarjetas,
    });
    openPopup('editar');
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchEmpresas(), fetchPaises(), fetchMonedas()]);
    };
    loadData();
  }, [fetchEmpresas, fetchPaises, fetchMonedas]);

  const filteredEmpresas = empresas.filter((empresa) =>
    [
      empresa.nombre_empresa,
      empresa.nombre_impreso,
      empresa.pais,
      empresa.moneda,
      empresa.correo,
      empresa.telefono,
      empresa.nfi,
      empresa.prefijo_tarjetas,
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmpresas = filteredEmpresas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);

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

  const getLogoSrc = (logo: string | null | undefined) => {
    if (!logo) return null;
    return `data:image/jpeg;base64,${logo}`;
  };

  const getLogoImpresoSrc = (logoImpreso: string | null | undefined) => {
    if (!logoImpreso) return null;
    return `data:image/jpeg;base64,${logoImpreso}`;
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
    
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Empresas
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra las empresas registradas en la plataforma con facilidad y seguridad.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => openPopup('agregar')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 m-2"
              >
                Agregar Empresa
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, país, moneda, correo, teléfono, NFI o prefijo..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Logo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Logo Impreso</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">País</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Moneda</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Correo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Teléfono</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">NFI</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Prefijo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentEmpresas.length > 0 ? (
                  currentEmpresas.map((empresa, index) => (
                    <tr className="hover:bg-gray-50 transition-all duration-200" key={empresa.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">
                        {empresa.logo && getLogoSrc(empresa.logo) ? (
                          <Image
                            src={getLogoSrc(empresa.logo)!}
                            alt="Logo de la empresa"
                            width={40}
                            height={40}
                            className="object-cover rounded"
                            onError={() => console.error('Error al cargar el logo')}
                          />
                        ) : (
                          <span className="text-gray-500">Sin logo</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {empresa.logo_impreso && getLogoImpresoSrc(empresa.logo_impreso) ? (
                          <Image
                            src={getLogoImpresoSrc(empresa.logo_impreso)!}
                            alt="Logo impreso de la empresa"
                            width={40}
                            height={40}
                            className="object-cover rounded"
                            onError={() => console.error('Error al cargar el logo impreso')}
                          />
                        ) : (
                          <span className="text-gray-500">Sin logo impreso</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{empresa.nombre_empresa}</td>
                      <td className="px-4 py-2">{empresa.pais}</td>
                      <td className="px-4 py-2">{empresa.moneda}</td>
                      <td className="px-4 py-2">{empresa.correo}</td>
                      <td className="px-4 py-2">{empresa.telefono}</td>
                      <td className="px-4 py-2">{empresa.nfi}</td>
                      <td className="px-4 py-2">{empresa.prefijo_tarjetas}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleEditar(empresa)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeletePopup(empresa)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-2 text-center text-gray-500">
                      No hay empresas disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
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
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Siguiente
              </button>
            </div>

            {isPopupOpen && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closePopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      {empresaSeleccionada ? 'Editar Empresa' : 'Agregar Empresa'}
                    </h2>
                  </div>
                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                  {empresaSeleccionada ? (
                    <form onSubmit={handleSubmitEditar}>
                      <input type="hidden" name="id" value={formData.id} />
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="nombre_empresa" className="block text-center font-medium text-gray-700">
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
                          <label htmlFor="nombre_impreso" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="pais_id" className="block text-center font-medium text-gray-700">
                              País
                            </label>
                            <select
                              name="pais_id"
                              value={formData.pais_id ?? '0'}
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
                            <label htmlFor="moneda_id" className="block text-center font-medium text-gray-700">
                              Moneda
                            </label>
                            <select
                              name="moneda_id"
                              value={formData.moneda_id ?? '0'}
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
                            <label htmlFor="correo" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="telefono" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="nfi" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="prefijo_tarjetas" className="block text-center font-medium text-gray-700">
                              Prefijo Tarjetas
                            </label>
distance: 10,                             <input
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
                          <label htmlFor="logo" className="block text-center font-medium text-gray-700">
                            Logo
                          </label>
                          {empresaSeleccionada.logo && getLogoSrc(empresaSeleccionada.logo) ? (
                            <div className="mb-4 flex justify-center">
                              <Image
                                src={getLogoSrc(empresaSeleccionada.logo)!}
                                alt="Logo actual de la empresa"
                                width={100}
                                height={100}
                                className="object-cover rounded-lg border border-gray-300"
                                onError={() => console.error('Error al cargar el logo actual')}
                              />
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 mb-4">Sin logo actual</p>
                          )}
                          <input
                            type="file"
                            name="logo"
                            onChange={handleFileChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-center"
                            accept="image/jpeg,image/png"
                          />
                          {formData.logo && (
                            <div className="text-center text-sm text-gray-600 mt-1">
                              Nuevo logo seleccionado: {formData.logo.name}
                            </div>
                          )}
                        </div>
                        <div>
                          <label htmlFor="logo_impreso" className="block text-center font-medium text-gray-700">
                            Logo Impreso
                          </label>
                          {empresaSeleccionada.logo_impreso && getLogoImpresoSrc(empresaSeleccionada.logo_impreso) ? (
                            <div className="mb-4 flex justify-center">
                              <Image
                                src={getLogoImpresoSrc(empresaSeleccionada.logo_impreso)!}
                                alt="Logo impreso actual de la empresa"
                                width={100}
                                height={100}
                                className="object-cover rounded-lg border border-gray-300"
                                onError={() => console.error('Error al cargar el logo impreso actual')}
                              />
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 mb-4">Sin logo impreso actual</p>
                          )}
                          <input
                            type="file"
                            name="logo_impreso"
                            onChange={handleFileChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-center"
                            accept="image/jpeg,image/png"
                          />
                          {formData.logo_impreso && (
                            <div className="text-center text-sm text-gray-600 mt-1">
                              Nuevo logo impreso seleccionado: {formData.logo_impreso.name}
                            </div>
                          )}
                        </div>
                      </div>
                       </div>
                      <div className="flex justify-between mt-4">
                        <button
                          type="button"
                          onClick={closePopup}
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
                  ) : (
                    <form onSubmit={handleSubmitAgregar}>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="nombre_empresa" className="block text-center font-medium text-gray-700">
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
                          <label htmlFor="nombre_impreso" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="pais_id" className="block text-center font-medium text-gray-700">
                              País
                            </label>
                            <select
                              name="pais_id"
                              value={formData.pais_id ?? '0'}
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
                            <label htmlFor="moneda_id" className="block text-center font-medium text-gray-700">
                              Moneda
                            </label>
                            <select
                              name="moneda_id"
                              value={formData.moneda_id ?? '0'}
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
                            <label htmlFor="correo" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="telefono" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="nfi" className="block text-center font-medium text-gray-700">
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
                            <label htmlFor="prefijo_tarjetas" className="block text-center font-medium text-gray-700">
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
                          <label htmlFor="logo" className="block text-center font-medium text-gray-700">
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
                          <label htmlFor="logo_impreso" className="block text-center font-medium text-gray-700">
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
                          onClick={closePopup}
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
                  )}
                </div>
              </div>
            )}

            {isDeletePopupOpen && empresaAEliminar && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeDeletePopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar la empresa {empresaAEliminar.nombre_empresa}?
                  </p>
                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                  <div className="flex justify-between">
                    <button
                      onClick={closeDeletePopup}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
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