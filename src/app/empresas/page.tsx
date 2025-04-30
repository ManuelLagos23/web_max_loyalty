'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';

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
    pais: '',
    moneda: '',
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

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setEmpresaSeleccionada(null);
      setFormData({
        id: 0,
        nombre_empresa: '',
        nombre_impreso: '',
        logo: null,
        logo_impreso: null,
        pais: '',
        moneda: '',
        correo: '',
        telefono: '',
        nfi: '',
        prefijo_tarjetas: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (empresa: Empresa) => {
    setEmpresaAEliminar(empresa);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setEmpresaAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombre_empresa ||
      !formData.nombre_impreso ||
      !formData.pais ||
      !formData.moneda ||
      !formData.correo ||
      !formData.telefono ||
      !formData.nfi ||
      !formData.prefijo_tarjetas ||
      !formData.logo ||
      !formData.logo_impreso
    ) {
      alert('Por favor, complete todos los campos obligatorios, incluyendo ambos logos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    formDataToSend.append('logo', formData.logo!);
    formDataToSend.append('logo_impreso', formData.logo_impreso!);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('moneda', formData.moneda);
    formDataToSend.append('correo', formData.correo);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('prefijo_tarjetas', formData.prefijo_tarjetas);

    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa agregada exitosamente');
        closePopup();
        fetchEmpresas();
      } else {
        alert('Error al agregar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.id ||
      !formData.nombre_empresa ||
      !formData.nombre_impreso ||
      !formData.pais ||
      !formData.moneda ||
      !formData.correo ||
      !formData.telefono ||
      !formData.nfi ||
      !formData.prefijo_tarjetas
    ) {
      alert('Por favor, complete todos los campos obligatorios (los logos son opcionales al editar).');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    if (formData.logo) formDataToSend.append('logo', formData.logo);
    if (formData.logo_impreso) formDataToSend.append('logo_impreso', formData.logo_impreso);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('moneda', formData.moneda);
    formDataToSend.append('correo', formData.correo);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('prefijo_tarjetas', formData.prefijo_tarjetas);

    try {
      const response = await fetch('/api/empresas', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa actualizada exitosamente');
        closePopup();
        fetchEmpresas();
      } else {
        alert('Error al actualizar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!empresaAEliminar) return;
    try {
      const response = await fetch(`/api/empresas/${empresaAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Empresa eliminada exitosamente');
        closeDeletePopup();
        fetchEmpresas();
      } else {
        alert('Error al eliminar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/empresas?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Empresa[] = await response.json();
        console.log('Empresas obtenidas:', data); // Depuración
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchPaises = useCallback(async () => {
    try {
      const response = await fetch('/api/paises');
      if (response.ok) {
        const data: Pais[] = await response.json();
        setPaises(data);
      } else {
        console.error('Error al obtener los países');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const fetchMonedas = useCallback(async () => {
    try {
      const response = await fetch('/api/monedas');
      if (response.ok) {
        const data: Moneda[] = await response.json();
        setMonedas(data);
      } else {
        console.error('Error al obtener las monedas');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
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
      pais: empresa.pais,
      moneda: empresa.moneda,
      correo: empresa.correo,
      telefono: empresa.telefono,
      nfi: empresa.nfi,
      prefijo_tarjetas: empresa.prefijo_tarjetas,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchEmpresas();
    fetchPaises();
    fetchMonedas();
  }, [fetchEmpresas, fetchPaises, fetchMonedas]);

  const filteredEmpresas = empresas.filter((empresa) =>
    Object.values(empresa)
      .filter((value) => typeof value === 'string')
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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

  // Funciones para obtener la fuente de las imágenes (Base64)
  const getLogoSrc = (logo: string | null | undefined) => {
    if (!logo) return null;
    return `data:image/jpeg;base64,${logo}`; // Cambia a PNG si es necesario
  };

  const getLogoImpresoSrc = (logoImpreso: string | null | undefined) => {
    if (!logoImpreso) return null;
    return `data:image/jpeg;base64,${logoImpreso}`; // Cambia a PNG si es necesario
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <div className="space-y-6">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105 text-center"
            >
              Gestión de Empresas
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra las empresas registradas en la plataforma.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar empresa
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <table className="w-full bg-white table-auto mt-8 border border-gray-200 rounded shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Logo</th>
                <th className="p-2 text-left">Logo Impreso</th>
                <th className="p-2 text-left">Nombre Empresa</th>
                <th className="p-2 text-left">País</th>
                <th className="p-2 text-left">Moneda</th>
                <th className="p-2 text-left">Correo</th>
                <th className="p-2 text-left">Teléfono</th>
                <th className="p-2 text-left">NFI</th>
                <th className="p-2 text-left">Prefijo</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentEmpresas.length > 0 ? (
                currentEmpresas.map((empresa, index) => (
                  <tr className="hover:bg-gray-50" key={empresa.id}>
                    <td className="p-2">{indexOfFirstItem + index + 1}</td>
                    <td className="p-2">
                      {empresa.logo && getLogoSrc(empresa.logo) ? (
                        <Image
                          src={getLogoSrc(empresa.logo)!}
                          alt="Logo de la empresa"
                          width={40}
                          height={40}
                          className="object-cover rounded"
                          onError={() => console.error('Error al cargar el logo')} // Depuración
                        />
                      ) : (
                        <span className="text-gray-500">Sin logo</span>
                      )}
                    </td>
                    <td className="p-2">
                      {empresa.logo_impreso && getLogoImpresoSrc(empresa.logo_impreso) ? (
                        <Image
                          src={getLogoImpresoSrc(empresa.logo_impreso)!}
                          alt="Logo impreso de la empresa"
                          width={40}
                          height={40}
                          className="object-cover rounded"
                          onError={() => console.error('Error al cargar el logo impreso')} // Depuración
                        />
                      ) : (
                        <span className="text-gray-500">Sin logo impreso</span>
                      )}
                    </td>
                    <td className="p-2">{empresa.nombre_empresa}</td>
                    <td className="p-2">{empresa.pais}</td>
                    <td className="p-2">{empresa.moneda}</td>
                    <td className="p-2">{empresa.correo}</td>
                    <td className="p-2">{empresa.telefono}</td>
                    <td className="p-2">{empresa.nfi}</td>
                    <td className="p-2">{empresa.prefijo_tarjetas}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEditar(empresa)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(empresa)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="p-2 text-center text-gray-500">
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
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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
              <div className="bg-white p-6 rounded shadow-lg w-2/5 border-1">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {empresaSeleccionada ? 'Editar Empresa' : 'Agregar Empresa'}
                </h2>
                {empresaSeleccionada ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="nombre_empresa" className="block text-center">Nombre de la Empresa</label>
                        <input
                          type="text"
                          name="nombre_empresa"
                          placeholder="Ejemplo: Grupo GSIE"
                          value={formData.nombre_empresa}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div>
                        <label htmlFor="nombre_impreso" className="block text-center">Nombre Impreso</label>
                        <input
                          type="text"
                          name="nombre_impreso"
                          placeholder="Ejemplo: GSIE"
                          value={formData.nombre_impreso}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pais" className="block text-center">País</label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          >
                            <option value="">Seleccionar país</option>
                            {paises.map((pais) => (
                              <option key={pais.id} value={pais.pais}>
                                {pais.pais}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="moneda" className="block text-center">Moneda</label>
                          <select
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          >
                            <option value="">Seleccionar moneda</option>
                            {monedas.map((moneda) => (
                              <option key={moneda.id} value={moneda.moneda}>
                                {moneda.moneda}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="correo" className="block text-center">Correo</label>
                          <input
                            type="email"
                            name="correo"
                            placeholder="Ejemplo: info@gsie.hn"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono" className="block text-center">Teléfono</label>
                          <input
                            type="number"
                            name="telefono"
                            placeholder="Ejemplo: 8888-8888"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nfi" className="block text-center">NFI</label>
                          <input
                            type="text"
                            name="nfi"
                            placeholder="Ejemplo: 0801-1970-00350"
                            value={formData.nfi}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="prefijo_tarjetas" className="block text-center">Prefijo Tarjetas</label>
                          <input
                            type="text"
                            name="prefijo_tarjetas"
                            placeholder="Ejemplo: 0704"
                            value={formData.prefijo_tarjetas}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="logo" className="block text-center">Logo</label>
                        {empresaSeleccionada.logo && getLogoSrc(empresaSeleccionada.logo) ? (
                          <div className="flex justify-center mb-2">
                            <Image
                              src={getLogoSrc(empresaSeleccionada.logo)!}
                              alt="Logo actual de la empresa"
                              width={100}
                              height={100}
                              className="object-cover rounded"
                              onError={() => console.error('Error al cargar el logo actual')} 
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center mb-2">
                            <span className="text-gray-500">Sin logo actual</span>
                          </div>
                        )}
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                          accept="image/jpeg,image/png"
                        />
                        {formData.logo && (
                          <div className="text-center text-sm text-gray-600 mt-1">
                            Nuevo logo seleccionado: {formData.logo.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="logo_impreso" className="block text-center">Logo Impreso</label>
                        {empresaSeleccionada.logo_impreso && getLogoImpresoSrc(empresaSeleccionada.logo_impreso) ? (
                          <div className="flex justify-center mb-2">
                            <Image
                              src={getLogoImpresoSrc(empresaSeleccionada.logo_impreso)!}
                              alt="Logo impreso actual de la empresa"
                              width={100}
                              height={100}
                              className="object-cover rounded"
                              onError={() => console.error('Error al cargar el logo impreso actual')} 
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center mb-2">
                            <span className="text-gray-500">Sin logo impreso actual</span>
                          </div>
                        )}
                        <input
                          type="file"
                          name="logo_impreso"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                          accept="image/jpeg,image/png"
                        />
                        {formData.logo_impreso && (
                          <div className="text-center text-sm text-gray-600 mt-1">
                            Nuevo logo impreso seleccionado: {formData.logo_impreso.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="nombre_empresa" className="block text-center">Nombre de la Empresa</label>
                        <input
                          type="text"
                          name="nombre_empresa"
                          placeholder="Ejemplo: Grupo GSIE"
                          value={formData.nombre_empresa}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div>
                        <label htmlFor="nombre_impreso" className="block text-center">Nombre Impreso</label>
                        <input
                          type="text"
                          name="nombre_impreso"
                          placeholder="Ejemplo: GSIE"
                          value={formData.nombre_impreso}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pais" className="block text-center">País</label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          >
                            <option value="">Seleccionar país</option>
                            {paises.map((pais) => (
                              <option key={pais.id} value={pais.pais}>
                                {pais.pais}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="moneda" className="block text-center">Moneda</label>
                          <select
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          >
                            <option value="">Seleccionar moneda</option>
                            {monedas.map((moneda) => (
                              <option key={moneda.id} value={moneda.moneda}>
                                {moneda.moneda}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="correo" className="block text-center">Correo</label>
                          <input
                            type="email"
                            name="correo"
                            placeholder="Ejemplo: info@gsie.hn"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono" className="block text-center">Teléfono</label>
                          <input
                            type="number"
                            name="telefono"
                            placeholder="Ejemplo: 8888-8888"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nfi" className="block text-center">NFI</label>
                          <input
                            type="text"
                            name="nfi"
                            placeholder="Ejemplo: 0801-1970-00350"
                            value={formData.nfi}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                        <div>
                          <label htmlFor="prefijo_tarjetas" className="block text-center">Prefijo Tarjetas</label>
                          <input
                            type="text"
                            name="prefijo_tarjetas"
                            placeholder="Ejemplo: 0704"
                            value={formData.prefijo_tarjetas}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded block text-center"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="logo" className="block text-center">Logo</label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                          accept="image/jpeg,image/png"
                        />
                        {formData.logo && (
                          <div className="text-center text-sm text-gray-600 mt-1">
                            Logo seleccionado: {formData.logo.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="logo_impreso" className="block text-center">Logo Impreso</label>
                        <input
                          type="file"
                          name="logo_impreso"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded block text-center"
                          accept="image/jpeg,image/png"
                        />
                        {formData.logo_impreso && (
                          <div className="text-center text-sm text-gray-600 mt-1">
                            Logo impreso seleccionado: {formData.logo_impreso.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-2xl font-semibold mb-4 text-center">Eliminar Empresa</h2>
                <p className="text-center">
                  ¿Estás seguro de que deseas eliminar la empresa {empresaAEliminar.nombre_empresa}?
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
  );
}