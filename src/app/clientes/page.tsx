'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
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
  logo?: string | null; // Campo para el logo (Base64 string)
}

interface Pais {
  id: number;
  pais: string;
}

interface Estado {
  id: number;
  estado: string;
}

export default function Clientes() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    pais: '',
    ciudad: '',
    estado: '',
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

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setClienteSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        pais: '',
        estado: '',
        ciudad: '',
        email: '',
        telefono: '',
        nfi: '',
        logo: null,
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const openDeletePopup = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setClienteAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.pais || !formData.estado || !formData.ciudad || !formData.email || !formData.telefono || !formData.nfi || !formData.logo) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('logo', formData.logo!);

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente agregado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        alert('Error al agregar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre || !formData.pais || !formData.estado || !formData.ciudad || !formData.email || !formData.telefono || !formData.nfi) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo); // Corregido de 'foto' a 'logo'
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente actualizado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        alert('Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!clienteAEliminar) return;
    try {
      const response = await fetch(`/api/clientes/${clienteAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Cliente eliminado exitosamente');
        closeDeletePopup();
        fetchClientes();
      } else {
        alert('Error al eliminar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchClientes = useCallback(async () => {
    try {
      const response = await fetch(`/api/clientes?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data: Cliente[] = await response.json();
        console.log('Clientes obtenidos:', data); // Depuración
        setClientes(data);
      } else {
        console.error('Error al obtener los clientes');
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

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      pais: cliente.pais,
      estado: cliente.estado,
      ciudad: cliente.ciudad,
      email: cliente.email,
      telefono: cliente.telefono,
      nfi: cliente.nfi,
      logo: null,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchClientes();
    fetchPaises();
    fetchEstados();
  }, [fetchClientes, fetchPaises, fetchEstados]);

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono.includes(searchTerm) ||
    cliente.nfi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Función para obtener la fuente de la imagen (Base64)
  const getLogoSrc = (logo: string | null | undefined) => {
    if (!logo) return null;
    return `data:image/jpeg;base64,${logo}`; // Cambia a PNG si es necesario
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
              Gestión de Consumidores
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los consumidores registrados en la plataforma.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar consumidor
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, NFI, país, estado o ciudad..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Logo</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
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
                          onError={() => console.error('Error al cargar el logo')} // Depuración
                        />
                      ) : (
                        <span className="text-gray-500">Sin logo</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{cliente.nombre}</td>
                    <td className="px-4 py-2">{cliente.pais}</td>
                    <td className="px-4 py-2">{cliente.estado}</td>
                    <td className="px-4 py-2">{cliente.ciudad}</td>
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
                  <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
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
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2">
                    {clienteSeleccionado ? 'Editar Cliente' : 'Agregar Cliente'}
                  </h2>
                </div>
                {clienteSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="nombre" className="block text-center">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais" className="block text-center">País</label>
                      <select
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="">Seleccionar país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.pais}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="estado" className="block text-center">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="">Seleccionar estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.estado}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="ciudad" className="block text-center">Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ejemplo: El Paraíso"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-center">Correo electrónico</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: juanperez@gmail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="telefono" className="block text-center">Teléfono</label>
                        <input
                          type="number"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="nfi" className="block text-center">NFI</label>
                        <input
                          type="text"
                          name="nfi"
                          placeholder="Ejemplo: 0801-1970-00350"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="logo" className="block text-center">Logo</label>
                      {clienteSeleccionado.logo && getLogoSrc(clienteSeleccionado.logo) ? (
                        <div className="flex justify-center mb-2">
                          <Image
                            src={getLogoSrc(clienteSeleccionado.logo)!}
                            alt="Logo actual del cliente"
                            width={100}
                            height={100}
                            className="object-cover rounded"
                            onError={() => console.error('Error al cargar el logo actual')} // Depuración
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
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="nombre" className="block text-center">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais" className="block text-center">País</label>
                      <select
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="">Seleccionar país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.pais}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="estado" className="block text-center">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="">Seleccionar estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.estado}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="ciudad" className="block text-center">Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ejemplo: El Paraíso"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-center">Correo electrónico</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: Juan Pérez"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="telefono" className="block text-center">Teléfono</label>
                        <input
                          type="number"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="nfi" className="block text-center">NFI</label>
                        <input
                          type="text"
                          name="nfi"
                          placeholder="Ejemplo: 0801-1970-00350"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="logo" className="block text-center">Logo</label>
                      <input
                        type="file"
                        name="logo"
                        onChange={handleFileChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                        accept="image/jpeg,image/png"
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
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <h2 className="text-xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar al cliente {clienteAEliminar?.nombre}?
                </p>
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