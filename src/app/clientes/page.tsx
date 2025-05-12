'use client';

import { useState, useEffect, useCallback } from 'react';
import NavbarGeneral from '../components/NavbarGeneral';
import MenuMain from '../components/MenuMain';
import Image from 'next/image';

interface Cliente {
  id: number;
  nombre: string;
  pais: string;
  ciudad: string;
  estado: string;
  email: string;
  telefono: string;
  nfi: string;
  pais_id: number | null;
  estado_id: number | null;
  canal_id: number | null;
  subcanal_id: number | null;
  canal_nombre: string;
  subcanal_nombre: string;
  logo?: string | null;
}

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

export default function Clientes() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    pais_id: 0,
    estado_id: 0,
    canal_id: 0,
    subcanal_id: 0,
    ciudad: '',
    email: '',
    telefono: '',
    nfi: '',
    logo: null as File | null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    setErrorMessage(null);
    if (modo === 'agregar') {
      setClienteSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        pais_id: 0,
        estado_id: 0,
        canal_id: 0,
        subcanal_id: 0,
        ciudad: '',
        email: '',
        telefono: '',
        nfi: '',
        logo: null,
      });
      setSubcanales([]);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setErrorMessage(null);
  };

  const openDeletePopup = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setClienteAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pais_id' || name === 'estado_id' || name === 'canal_id' || name === 'subcanal_id' ? (value ? parseInt(value) : 0) : value,
      ...(name === 'canal_id' ? { subcanal_id: 0 } : {}),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const validateForm = (isEdit: boolean) => {
    const errors: string[] = [];
    if (!formData.nombre) errors.push('Nombre');
    if (!formData.pais_id) errors.push('País');
    if (!formData.estado_id) errors.push('Estado');
    if (!formData.canal_id) errors.push('Canal');
    if (!formData.subcanal_id) errors.push('Subcanal');
    if (!formData.ciudad) errors.push('Ciudad');
    if (!formData.email) errors.push('Correo electrónico');
    if (!formData.telefono) errors.push('Teléfono');
    if (!formData.nfi) errors.push('NFI');
    if (!isEdit && !formData.logo) errors.push('Logo');
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
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais_id.toString());
    formDataToSend.append('estado', formData.estado_id.toString());
    formDataToSend.append('canal_id', formData.canal_id.toString());
    formDataToSend.append('subcanal_id', formData.subcanal_id.toString());
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('logo', formData.logo!);

    try {
      setErrorMessage(null);
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente agregado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error al agregar el cliente: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al agregar el cliente');
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
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais_id.toString());
    formDataToSend.append('estado', formData.estado_id.toString());
    formDataToSend.append('canal_id', formData.canal_id.toString());
    formDataToSend.append('subcanal_id', formData.subcanal_id.toString());
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    try {
      setErrorMessage(null);
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente actualizado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error al actualizar el cliente: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al actualizar el cliente');
    }
  };

  const handleDelete = async () => {
    if (!clienteAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/clientes/${clienteAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Cliente eliminado exitosamente');
        closeDeletePopup();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error al eliminar el cliente: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al eliminar el cliente');
    }
  };

  const fetchClientes = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/clientes?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Cliente[] = await response.json();
        setClientes(data);
      } else {
        setErrorMessage(`Error al obtener los clientes: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los clientes');
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
        setErrorMessage(`Error al obtener los estados: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los estados');
    }
  }, []);

  const fetchCanales = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/canales');
      if (response.ok) {
        const data: Canal[] = await response.json();
        setCanales(data);
      } else {
        setErrorMessage(`Error al obtener los canales: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los canales');
    }
  }, []);

  const fetchSubcanales = useCallback(async (canalId?: number) => {
    try {
      setErrorMessage(null);
      if (!canalId) {
        setSubcanales([]);
        return;
      }
      const response = await fetch(`/api/subcanales?canal_id=${canalId}`);
      if (response.ok) {
        const data: Subcanal[] = await response.json();
        setSubcanales(data);
      } else {
        setErrorMessage(`Error al obtener los subcanales: ${response.status} ${response.statusText}`);
        setSubcanales([]);
      }
    } catch (error) {
      console.error('Error al obtener los subcanales:', error);
      setErrorMessage('Error al obtener los subcanales');
      setSubcanales([]);
    }
  }, []);

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      pais_id: cliente.pais_id ?? 0,
      estado_id: cliente.estado_id ?? 0,
      canal_id: cliente.canal_id ?? 0,
      subcanal_id: cliente.subcanal_id ?? 0,
      ciudad: cliente.ciudad,
      email: cliente.email,
      telefono: cliente.telefono,
      nfi: cliente.nfi,
      logo: null,
    });
    if (cliente.canal_id) {
      fetchSubcanales(cliente.canal_id);
    } else {
      setSubcanales([]);
    }
    openPopup('editar');
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchClientes(), fetchPaises(), fetchEstados(), fetchCanales()]);
    };
    loadData();
  }, [fetchClientes, fetchPaises, fetchEstados, fetchCanales]);

  useEffect(() => {
    if (formData.canal_id) {
      fetchSubcanales(formData.canal_id);
    } else {
      setSubcanales([]);
      setFormData((prev) => ({ ...prev, subcanal_id: 0 }));
    }
  }, [formData.canal_id, fetchSubcanales]);

  const filteredClientes = clientes.filter((cliente) =>
    [
      cliente.nombre,
      cliente.email,
      cliente.telefono,
      cliente.nfi,
      cliente.pais,
      cliente.estado,
      cliente.ciudad,
      cliente.canal_nombre,
      cliente.subcanal_nombre,
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

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

  return (
    <div className="min-h-screen flex">
      <NavbarGeneral />
      <div className="flex-1 flex flex-col">
        <MenuMain />
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-2">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Clientes
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los clientes registrados en la plataforma.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Agregar cliente
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, NFI, país, estado, ciudad, canal o subcanal..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

          <table className="min-w-full bg-gray-100 border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Logo</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
                <th className="px-4 py-2 text-left">Canal</th>
                <th className="px-4 py-2 text-left">Subcanal</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">NFI</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClientes.length > 0 ? (
                currentClientes.map((cliente, index) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2">
                      {cliente.logo && getLogoSrc(cliente.logo) ? (
                        <Image
                          src={getLogoSrc(cliente.logo)!}
                          alt="Logo del cliente"
                          width={40}
                          height={40}
                          className="object-cover rounded"
                          onError={() => console.error('Error al cargar el logo')}
                        />
                      ) : (
                        <span className="text-gray-500">Sin logo</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{cliente.nombre}</td>
                    <td className="px-4 py-2">{cliente.pais}</td>
                    <td className="px-4 py-2">{cliente.estado}</td>
                    <td className="px-4 py-2">{cliente.ciudad}</td>
                    <td className="px-4 py-2">{cliente.canal_nombre}</td>
                    <td className="px-4 py-2">{cliente.subcanal_nombre}</td>
                    <td className="px-4 py-2">{cliente.email}</td>
                    <td className="px-4 py-2">{cliente.telefono}</td>
                    <td className="px-4 py-2">{cliente.nfi}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEditar(cliente)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(cliente)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-2 text-center text-gray-500">
                    No hay clientes disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
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
              <div className="bg-white p-6 rounded shadow-lg w-2/5 border">
                <div className="text-center">
                  <h2
                    className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2"
                  >
                    {clienteSeleccionado ? 'Editar Cliente' : 'Agregar Cliente'}
                  </h2>
                </div>
                {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                {clienteSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="nombre" className="block text-center">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais_id" className="block text-center">
                        País
                      </label>
                      <select
                        name="pais_id"
                        value={formData.pais_id ?? '0'}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                      <label htmlFor="estado_id" className="block text-center">
                        Estado
                      </label>
                      <select
                        name="estado_id"
                        value={formData.estado_id ?? '0'}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="canal_id" className="block text-center">
                          Canal
                        </label>
                        <select
                          name="canal_id"
                          value={formData.canal_id ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        >
                          <option value="0">Seleccionar canal</option>
                          {canales.map((canal) => (
                            <option key={canal.id} value={canal.id}>
                              {canal.canal}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="subcanal_id" className="block text-center">
                          Subcanal
                        </label>
                        <select
                          name="subcanal_id"
                          value={formData.subcanal_id ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                          disabled={!formData.canal_id}
                        >
                          <option value="0">Seleccionar subcanal</option>
                          {subcanales.map((subcanal) => (
                            <option key={subcanal.id} value={subcanal.id}>
                              {subcanal.subcanal}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="ciudad" className="block text-center">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ejemplo: El Paraíso"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-center">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: juanperez@gmail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="telefono" className="block text-center">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="nfi" className="block text-center">
                          NFI
                        </label>
                        <input
                          type="text"
                          name="nfi"
                          placeholder="Ejemplo: 0801-1970-00350"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="logo" className="block text-center">
                        Logo
                      </label>
                      {clienteSeleccionado?.logo && getLogoSrc(clienteSeleccionado.logo) ? (
                        <div className="flex justify-center mb-2">
                          <Image
                            src={getLogoSrc(clienteSeleccionado.logo)!}
                            alt="Logo actual del cliente"
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
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        accept="image/jpeg,image/png"
                      />
                      {formData.logo && (
                        <div className="text-center text-sm text-gray-600 mt-1">
                          Nuevo logo seleccionado: {formData.logo.name}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="nombre" className="block text-center">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais_id" className="block text-center">
                        País
                      </label>
                      <select
                        name="pais_id"
                        value={formData.pais_id ?? '0'}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                      <label htmlFor="estado_id" className="block text-center">
                        Estado
                      </label>
                      <select
                        name="estado_id"
                        value={formData.estado_id ?? '0'}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="canal_id" className="block text-center">
                          Canal
                        </label>
                        <select
                          name="canal_id"
                          value={formData.canal_id ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        >
                          <option value="0">Seleccionar canal</option>
                          {canales.map((canal) => (
                            <option key={canal.id} value={canal.id}>
                              {canal.canal}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="subcanal_id" className="block text-center">
                          Subcanal
                        </label>
                        <select
                          name="subcanal_id"
                          value={formData.subcanal_id ?? '0'}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                          disabled={!formData.canal_id}
                        >
                          <option value="0">Seleccionar subcanal</option>
                          {subcanales.map((subcanal) => (
                            <option key={subcanal.id} value={subcanal.id}>
                              {subcanal.subcanal}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="ciudad" className="block text-center">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ejemplo: El Paraíso"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-center">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: juanperez@gmail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="telefono" className="block text-center">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="nfi" className="block text-center">
                          NFI
                        </label>
                        <input
                          type="text"
                          name="nfi"
                          placeholder="Ejemplo: 0801-1970-00350"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="logo" className="block text-center">
                        Logo
                      </label>
                      <input
                        type="file"
                        name="logo"
                        onChange={handleFileChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        accept="image/jpeg,image/png"
                        required
                      />
                      {formData.logo && (
                        <div className="text-center text-sm text-gray-600 mt-1">
                          Logo seleccionado: {formData.logo.name}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {isDeletePopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar al cliente {clienteAEliminar?.nombre}?
                </p>
                {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                <div className="flex justify-between">
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