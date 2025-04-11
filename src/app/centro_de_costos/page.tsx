// src/app/centro_de_costos/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Costo {
  id: number;
  nombre_centro_costos: string;
  pais: string;
  estado: string;
  ciudad: string;
  alias: string;
  codigo: string;
  empresa: string;
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
    pais: '',
    estado: '',
    ciudad: '',
    alias: '',
    codigo: '',
    empresa: '',
  });
  const [costoSeleccionado, setCostoSeleccionado] = useState<Costo | null>(null);
  const [costoAEliminar, setCostoAEliminar] = useState<Costo | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setCostoSeleccionado(null);
      setFormData({
        id: 0,
        nombre_centro_costos: '',
        pais: '',
        estado: '',
        ciudad: '',
        alias: '',
        codigo: '',
        empresa: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (costo: Costo) => {
    setCostoAEliminar(costo);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setCostoAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_centro_costos || !formData.pais || !formData.estado || !formData.ciudad || !formData.alias || !formData.codigo || !formData.empresa) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);
    formDataToSend.append('empresa', formData.empresa);

    try {
      const response = await fetch('/api/costos', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Costo agregado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        alert('Error al agregar el costo');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre_centro_costos || !formData.pais || !formData.estado || !formData.ciudad || !formData.alias || !formData.codigo || !formData.empresa) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);
    formDataToSend.append('empresa', formData.empresa);

    try {
      const response = await fetch('/api/costos', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Costo actualizado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        alert('Error al actualizar el costo');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!costoAEliminar) return;
    try {
      const response = await fetch(`/api/costos/${costoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Costo eliminado exitosamente');
        closeDeletePopup();
        fetchCostos();
      } else {
        alert('Error al eliminar el costo');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchCostos = useCallback(async () => {
    try {
      const response = await fetch(`/api/costos?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Costo[] = await response.json();
        setCostos(data);
      } else {
        console.error('Error al obtener los costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage]);

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

  const fetchEstados = useCallback(async () => {
    try {
      const response = await fetch('/api/estados');
      if (response.ok) {
        const data: Estado[] = await response.json();
        setEstados(data);
      } else {
        console.error('Error al obtener los estados');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const handleEditar = (costo: Costo) => {
    setCostoSeleccionado(costo);
    setFormData({
      id: costo.id,
      nombre_centro_costos: costo.nombre_centro_costos,
      pais: costo.pais,
      estado: costo.estado,
      ciudad: costo.ciudad,
      alias: costo.alias,
      codigo: costo.codigo,
      empresa: costo.empresa,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchCostos();
    fetchPaises();
    fetchEstados();
    fetchEmpresas();
  }, [fetchCostos, fetchPaises, fetchEstados, fetchEmpresas, currentPage]);

  // Filtrar costos según el término de búsqueda
  const filteredCostos = costos.filter((costo) =>
    Object.values(costo)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de costos</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los Centros de Costos registrados en la plataforma.
          </p>

          {/* Buscador */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar centros de costos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reinicia la paginación al buscar
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar costo
            </button>
         
          </div>

          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
            onClick={(e) => {
            
              if (e.target === e.currentTarget) {
                closePopup();
              }
            }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {costoSeleccionado ? 'Editar Costo' : 'Agregar Costo'}
                </h2>
                {costoSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="nombre_centro_costos">Nombre Centro de Costos</label>
                      <input
                        type="text"
                        name="nombre_centro_costos"
                        placeholder="Nombre del Centro de Costos"
                        value={formData.nombre_centro_costos}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="empresa">Empresa</label>
                      <select
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar empresa</option>
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.nombre_empresa}>
                            {empresa.nombre_empresa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="pais">País</label>
                      <select
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.pais}>
                            {pais.pais}
                          </option>
                        ))}
                      </select>
                    </div>
                
                    <div className="mb-4">
                      <label htmlFor="estado">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.estado}>
                            {estado.estado}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="ciudad">Ciudad</label>
                      <input
                        type="text"
                        name="ciudad"
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="alias">Alias</label>
                      <input
                        type="text"
                        name="alias"
                        placeholder="Alias"
                        value={formData.alias}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                    <div className="mb-4">
                      <label htmlFor="codigo">Código</label>
                      <input
                        type="text"
                        name="codigo"
                        placeholder="Código"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex justify-between">
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
                    <div className="mb-4">
                      <label htmlFor="nombre_centro_costos">Nombre Centro de Costos</label>
                      <input
                        type="text"
                        name="nombre_centro_costos"
                        placeholder="Nombre del Centro de Costos"
                        value={formData.nombre_centro_costos}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="empresa">Empresa</label>
                      <select
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar empresa</option>
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.nombre_empresa}>
                            {empresa.nombre_empresa}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="pais">País</label>
                      <select
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.pais}>
                            {pais.pais}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="estado">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.estado}>
                            {estado.estado}
                          </option>
                        ))}
                      </select>
                    </div>

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="ciudad">Ciudad</label>
                      <input
                        type="text"
                        name="ciudad"
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="alias">Alias</label>
                      <input
                        type="text"
                        name="alias"
                        placeholder="Alias"
                        value={formData.alias}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>

                    </div>
                    <div className="mb-4">
                      <label htmlFor="codigo">Código</label>
                      <input
                        type="text"
                        name="codigo"
                        placeholder="Código"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex justify-between">
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

          {isDeletePopupOpen && costoAEliminar && (
            <div className="fixed inset-0 flex justify-center items-center z-50  backdrop-blur-md"
            onClick={(e) => {
            
              if (e.target === e.currentTarget) {
                closeDeletePopup();
              }
            }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-xl font-semibold mb-4">Eliminar Costo</h2>
                <p>¿Está seguro de que desea eliminar el costo {costoAEliminar.nombre_centro_costos}?</p>
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

          <table className="table-auto bg-white w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Centro de Costos</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
                <th className="px-4 py-2 text-left">Alias</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCostos.length > 0 ? (
                currentCostos.map((costo, index) => (
                  <tr className="hover:bg-gray-50" key={costo.id}>
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2">{costo.nombre_centro_costos}</td>
                    <td className="px-4 py-2">{costo.empresa}</td>
                    <td className="px-4 py-2">{costo.pais}</td>
                    <td className="px-4 py-2">{costo.estado}</td>
                    <td className="px-4 py-2">{costo.ciudad}</td>
                    <td className="px-4 py-2">{costo.alias}</td>
                    <td className="px-4 py-2">{costo.codigo}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(costo)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(costo)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                    No hay costos disponibles.
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
        </main>
      </div>
    </div>
  );
}