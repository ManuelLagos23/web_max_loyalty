'use client';

import { useState, useEffect, useCallback } from 'react';

import Navbar from '@/app/components/Navbar';


interface Costo {
  id: number;
  nombre_centro_costos: string;
  pais: string;
  estado: string;
  ciudad: string;
  alias: string;
  codigo: string;
  empresa: string;
  pais_id: number | null;
  estado_id: number | null;
}

interface Pais {
  id: number;
  pais: string;
}

interface Estado {
  id: number;
  estado: string;
}

interface Empresa {
  id: number;
  nombre_empresa: string;
}

export default function Costos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre_centro_costos: '',
    pais_id: 0,
    estado_id: 0,
    ciudad: '',
    alias: '',
    codigo: '',
    empresa: 0,
  });
  const [costoSeleccionado, setCostoSeleccionado] = useState<Costo | null>(null);
  const [costoAEliminar, setCostoAEliminar] = useState<Costo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    setErrorMessage(null);
    if (modo === 'agregar') {
      setCostoSeleccionado(null);
      setFormData({
        id: 0,
        nombre_centro_costos: '',
        pais_id: 0,
        estado_id: 0,
        ciudad: '',
        alias: '',
        codigo: '',
        empresa: 0,
      });
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setErrorMessage(null);
  };

  const openDeletePopup = (costo: Costo) => {
    setCostoAEliminar(costo);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setCostoAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'pais_id' || name === 'estado_id' || name === 'empresa'
          ? value
            ? parseInt(value)
            : 0
          : value,
    });
  };

  const validateForm = (isEdit: boolean) => {
    const errors: string[] = [];
    if (!formData.nombre_centro_costos) errors.push('Nombre Centro de Costos');
    if (!formData.pais_id) errors.push('País');
    if (!formData.estado_id) errors.push('Estado');
    if (!formData.ciudad) errors.push('Ciudad');
    if (!formData.alias) errors.push('Alias');
    if (!formData.codigo) errors.push('Código');
    if (!formData.empresa) errors.push('Empresa');
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
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais_id.toString());
    formDataToSend.append('estado', formData.estado_id.toString());
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);
    formDataToSend.append('empresa', formData.empresa.toString());

    try {
      setErrorMessage(null);
      const response = await fetch('/api/costos', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Costo agregado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        const errorData = await response.json();
        alert(`Error al agregar el costo: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al agregar el costo');
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
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais_id.toString());
    formDataToSend.append('estado', formData.estado_id.toString());
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);
    formDataToSend.append('empresa', formData.empresa.toString());

    try {
      setErrorMessage(null);
      const response = await fetch('/api/costos', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Costo actualizado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar el costo: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al actualizar el costo');
    }
  };

  const handleDelete = async () => {
    if (!costoAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/costos/${costoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Costo eliminado exitosamente');
        closeDeletePopup();
        fetchCostos();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el costo: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al eliminar el costo');
    }
  };

  const fetchCostos = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/costos?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Costo[] = await response.json();
    
        setCostos(data);
      } else {
        console.error('Error al obtener los costos:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los costos: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los costos');
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

  const fetchEstados = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/estados');
      if (response.ok) {
        const data: Estado[] = await response.json();
  
        setEstados(data);
      } else {
        console.error('Error al obtener los estados:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los estados: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los estados');
    }
  }, []);

  const fetchEmpresas = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/empresas');
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
  }, []);

  const handleEditar = (costo: Costo) => {

    setCostoSeleccionado(costo);
    setFormData({
      id: costo.id,
      nombre_centro_costos: costo.nombre_centro_costos,
      pais_id: costo.pais_id ?? 0,
      estado_id: costo.estado_id ?? 0,
      ciudad: costo.ciudad,
      alias: costo.alias,
      codigo: costo.codigo,
      empresa: parseInt(costo.empresa) || 0,
    });
    openPopup('editar');
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCostos(), fetchPaises(), fetchEstados(), fetchEmpresas()]);
    };
    loadData();
  }, [fetchCostos, fetchPaises, fetchEstados, fetchEmpresas]);

  const filteredCostos = costos.filter((costo) =>
    [
      costo.nombre_centro_costos,
      costo.pais,
      costo.estado,
      costo.ciudad,
      costo.alias,
      costo.codigo,
      empresas.find((empresa) => empresa.id === parseInt(costo.empresa))?.nombre_empresa || '',
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCostos = filteredCostos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCostos.length / itemsPerPage);

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

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      
      <div className="flex">
        <Navbar/>
        <div className="flex-1 flex flex-col">
 
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Centros de Costos
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los centros de costos registrados en la plataforma con facilidad y seguridad.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => openPopup('agregar')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Centro de Costos
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, empresa, país, estado, ciudad, alias o código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Centro de Costos</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">País</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Estado</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Ciudad</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Alias</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Código</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentCostos.length > 0 ? (
                  currentCostos.map((costo, index) => (
                    <tr className="hover:bg-gray-50 transition-all duration-200" key={costo.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{costo.nombre_centro_costos}</td>
                      <td className="px-4 py-2">
                        {empresas.find((empresa) => empresa.id === parseInt(costo.empresa))?.nombre_empresa || 'Desconocida'}
                      </td>
                      <td className="px-4 py-2">{costo.pais}</td>
                      <td className="px-4 py-2">{costo.estado}</td>
                      <td className="px-4 py-2">{costo.ciudad}</td>
                      <td className="px-4 py-2">{costo.alias}</td>
                      <td className="px-4 py-2">{costo.codigo}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleEditar(costo)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeletePopup(costo)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all personally identifiable information (PII) duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                      No hay centros de costos disponibles.
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
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      {costoSeleccionado ? 'Editar Centro de Costos' : 'Agregar Centro de Costos'}
                    </h2>
                  </div>
                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                  {costoSeleccionado ? (
                    <form onSubmit={handleSubmitEditar}>
                      <input type="hidden" name="id" value={formData.id} />
                      <div className="mb-4">
                        <label htmlFor="nombre_centro_costos" className="block text-center font-medium text-gray-700">
                          Nombre Centro de Costos
                        </label>
                        <input
                          type="text"
                          name="nombre_centro_costos"
                          placeholder="Ejemplo: GSIE El Paraíso"
                          value={formData.nombre_centro_costos}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="empresa" className="block text-center font-medium text-gray-700">
                          Empresa
                        </label>
                        <select
                          name="empresa"
                          value={formData.empresa ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        >
                          <option value="0">Seleccionar empresa</option>
                          {empresas.map((empresa) => (
                            <option key={empresa.id} value={empresa.id}>
                              {empresa.nombre_empresa}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
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
                        <div className="mb-4">
                          <label htmlFor="estado_id" className="block text-center font-medium text-gray-700">
                            Estado
                          </label>
                          <select
                            name="estado_id"
                            value={formData.estado_id ?? '0'}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          >
                            <option value="0">Seleccionar estado</option>
                            {estados.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.estado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label htmlFor="ciudad" className="block text-center font-medium text-gray-700">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            name="ciudad"
                            placeholder="Ejemplo: El Paraíso"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                        />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="alias" className="block text-center font-medium text-gray-700">
                            Alias
                          </label>
                          <input
                            type="text"
                            name="alias"
                            placeholder="Ejemplo: GSIE HN"
                            value={formData.alias}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="codigo" className="block text-center font-medium text-gray-700">
                          Código
                        </label>
                        <input
                          type="text"
                          name="codigo"
                          placeholder="Ejemplo: CTR-001"
                          value={formData.codigo}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="flex justify-between">
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
                      <div className="mb-4">
                        <label htmlFor="nombre_centro_costos" className="block text-center font-medium text-gray-700">
                          Nombre Centro de Costos
                        </label>
                        <input
                          type="text"
                          name="nombre_centro_costos"
                          placeholder="Ejemplo: GSIE El Paraíso"
                          value={formData.nombre_centro_costos}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="empresa" className="block text-center font-medium text-gray-700">
                          Empresa
                        </label>
                        <select
                          name="empresa"
                          value={formData.empresa ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        >
                          <option value="0">Seleccionar empresa</option>
                          {empresas.map((empresa) => (
                            <option key={empresa.id} value={empresa.id}>
                              {empresa.nombre_empresa}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
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
                        <div className="mb-4">
                          <label htmlFor="estado_id" className="block text-center font-medium text-gray-700">
                            Estado
                          </label>
                          <select
                            name="estado_id"
                            value={formData.estado_id ?? '0'}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          >
                            <option value="0">Seleccionar estado</option>
                            {estados.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.estado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label htmlFor="ciudad" className="block text-center font-medium text-gray-700">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            name="ciudad"
                            placeholder="Ejemplo: El Paraíso"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="alias" className="block text-center font-medium text-gray-700">
                            Alias
                          </label>
                          <input
                            type="text"
                            name="alias"
                            placeholder="Ejemplo: GSIE HN"
                            value={formData.alias}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="codigo" className="block text-center font-medium text-gray-700">
                          Código
                        </label>
                        <input
                          type="text"
                          name="codigo"
                          placeholder="Ejemplo: CTR-001"
                          value={formData.codigo}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="flex justify-between">
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

            {isDeletePopupOpen && costoAEliminar && (
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
                    ¿Está seguro de que desea eliminar el centro de costos {costoAEliminar.nombre_centro_costos}?
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