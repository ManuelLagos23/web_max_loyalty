'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
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
    if (!formData.nombre_empresa || !formData.pais || !formData.moneda || !formData.correo || !formData.telefono || !formData.nfi || !formData.prefijo_tarjetas) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
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
    if (!formData.id || !formData.nombre_empresa || !formData.pais || !formData.moneda || !formData.correo || !formData.telefono || !formData.nfi || !formData.prefijo_tarjetas) {
      alert('Por favor, complete todos los campos obligatorios.');
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
      const response = await fetch(`/api/empresas?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas');
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

  // Filtrar empresas según el término de búsqueda
  const filteredEmpresas = empresas.filter((empresa) =>
    Object.values(empresa)
      .filter((value) => typeof value === 'string') // Filtra solo valores string para evitar errores con null
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

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de Empresas</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra las empresas registradas en la plataforma.
          </p>

      
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

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar empresa
            </button>
       
          </div>

          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md "

            onClick={(e) => {
            
              if (e.target === e.currentTarget) {
                closePopup();
              }
            }}
            
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {empresaSeleccionada ? 'Editar Empresa' : 'Agregar Empresa'}
                </h2>
                {empresaSeleccionada ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="nombre_empresa">Nombre de la Empresa</label>
                        <input
                          type="text"
                          name="nombre_empresa"
                          placeholder="Nombre de la empresa"
                          value={formData.nombre_empresa}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="nombre_impreso">Nombre impreso</label>
                        <input
                          type="text"
                          name="nombre_impreso"
                          placeholder="Nombre impreso"
                          value={formData.nombre_impreso}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pais">País</label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
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
                          <label htmlFor="moneda">Moneda</label>
                          <select
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
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
                          <label htmlFor="correo">Correo</label>
                          <input
                            type="email"
                            name="correo"
                            placeholder="Correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono">Teléfono</label>
                          <input
                            type="tel"
                            name="telefono"
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nfi">NFI</label>
                          <input
                            type="text"
                            name="nfi"
                            placeholder="NFI"
                            value={formData.nfi}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label htmlFor="prefijo_tarjetas">Prefijo Tarjetas</label>
                          <input
                            type="text"
                            name="prefijo_tarjetas"
                            placeholder="Prefijo Tarjetas"
                            value={formData.prefijo_tarjetas}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="logo">Logo</label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="logo_impreso">Logo impreso</label>
                        <input
                          type="file"
                          name="logo_impreso"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
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
                        <label htmlFor="nombre_empresa">Nombre de la Empresa</label>
                        <input
                          type="text"
                          name="nombre_empresa"
                          placeholder="Nombre de la empresa"
                          value={formData.nombre_empresa}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="nombre_impreso">Nombre impreso</label>
                        <input
                          type="text"
                          name="nombre_impreso"
                          placeholder="Nombre impreso"
                          value={formData.nombre_impreso}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pais">País</label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
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
                          <label htmlFor="moneda">Moneda</label>
                          <select
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
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
                          <label htmlFor="correo">Correo</label>
                          <input
                            type="email"
                            name="correo"
                            placeholder="Correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono">Teléfono</label>
                          <input
                            type="tel"
                            name="telefono"
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nfi">NFI</label>
                          <input
                            type="text"
                            name="nfi"
                            placeholder="NFI"
                            value={formData.nfi}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label htmlFor="prefijo_tarjetas">Prefijo Tarjetas</label>
                          <input
                            type="text"
                            name="prefijo_tarjetas"
                            placeholder="Prefijo Tarjetas"
                            value={formData.prefijo_tarjetas}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="logo">Logo</label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="logo_impreso">Logo impreso</label>
                        <input
                          type="file"
                          name="logo_impreso"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
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

          <table className="w-full bg-white table-auto mt-8">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">ID</th>
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
                  <td colSpan={9} className="p-2 text-center text-gray-500">
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

          {isDeletePopupOpen && empresaAEliminar && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
            onClick={(e) => {
            
              if (e.target === e.currentTarget) {
                closeDeletePopup();
              }
            }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-2xl font-semibold mb-4">Eliminar Empresa</h2>
                <p>¿Estás seguro de que deseas eliminar la empresa {empresaAEliminar.nombre_empresa}?</p>
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