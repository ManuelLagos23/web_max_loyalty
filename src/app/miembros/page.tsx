'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';


interface Miembro {
  id: number;
  nombre: string;
  user: string;
  email: string;
  establecimiento: number;
  empresa_id: number;
  terminal_id: number;
  empresa_nombre: string;
  terminal_nombre: string;
  establecimiento_nombre: string;
  password: string;
}

interface CentroCosto {
  id: number;
  nombre_centro_costos: string;
}

interface Empresa {
  id: number;
  nombre_empresa: string;
}

interface Terminal {
  id: number;
  nombre_terminal: string;
  empresa_id: number;
  establecimiento: number;
}

export default function Miembros() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [centrosCostos, setCentrosCostos] = useState<CentroCosto[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    user: '',
    email: '',
    establecimiento: 0,
    empresa_id: 0,
    terminal_id: 0,
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<Miembro | null>(null);
  const [miembroAEliminar, setMiembroAEliminar] = useState<Miembro | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    setErrorMessage(null);
    if (modo === 'agregar') {
      setMiembroSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        user: '',
        email: '',
        establecimiento: 0,
        empresa_id: 0,
        terminal_id: 0,
        password: '',
      });
    } else if (modo === 'editar' && miembroSeleccionado) {
      setFormData({
        id: miembroSeleccionado.id,
        nombre: miembroSeleccionado.nombre,
        user: miembroSeleccionado.user,
        email: miembroSeleccionado.email,
        establecimiento: miembroSeleccionado.establecimiento,
        empresa_id: miembroSeleccionado.empresa_id,
        terminal_id: miembroSeleccionado.terminal_id,
        password: '',
      });
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setErrorMessage(null);
  };

  const openDeletePopup = (miembro: Miembro) => {
    setMiembroAEliminar(miembro);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setMiembroAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'empresa_id' || name === 'terminal_id' || name === 'establecimiento' ? parseInt(value) : value,
    }));
    if (name === 'terminal_id' && parseInt(value) > 0) {
      fetchTerminalDetails(parseInt(value));
    }
  };

  const fetchTerminalDetails = async (terminalId: number) => {
    try {
      setErrorMessage(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`/api/terminales/${terminalId}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const terminalData: Terminal = await response.json();
        setFormData((prevData) => ({
          ...prevData,
          empresa_id: terminalData.empresa_id,
          establecimiento: terminalData.establecimiento,
        }));
      } else {
        const errorText = `Error al obtener los detalles de la terminal: ${response.status} ${response.statusText}`;
        console.error(errorText);
        setErrorMessage(errorText);
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('La solicitud para obtener los detalles de la terminal ha excedido el tiempo límite');
        setErrorMessage('No se pudo obtener los detalles de la terminal: Tiempo de espera excedido');
      } else if (error instanceof Error) {
        console.error('Error en la solicitud de la terminal:', error);
        setErrorMessage(`Error al obtener los detalles de la terminal: ${error.message}`);
      } else {
        console.error('Error desconocido:', error);
        setErrorMessage('Ocurrió un error desconocido al obtener los detalles de la terminal');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const validateForm = (isEdit: boolean) => {
    const errors: string[] = [];
    if (!formData.nombre) errors.push('Nombre');
    if (!formData.user) errors.push('Usuario');
    if (!formData.email) errors.push('Email');
    if (!formData.establecimiento) errors.push('Establecimiento');
    if (!formData.empresa_id) errors.push('Empresa');
    if (!formData.terminal_id) errors.push('Terminal');
    if (!isEdit && !formData.password) errors.push('Contraseña');
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
    formDataToSend.append('user', formData.user);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('establecimiento', formData.establecimiento.toString());
    formDataToSend.append('empresa_id', formData.empresa_id.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());
    formDataToSend.append('password', formData.password);

    try {
      setErrorMessage(null);
      const response = await fetch('/api/miembros', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Miembro agregado exitosamente');
        closePopup();
        fetchMiembros();
      } else {
        const errorData = await response.json();
        alert(`Error al agregar el miembro: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al agregar el miembro');
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
    formDataToSend.append('user', formData.user);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('establecimiento', formData.establecimiento.toString());
    formDataToSend.append('empresa_id', formData.empresa_id.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());
    formDataToSend.append('password', formData.password);

    try {
      setErrorMessage(null);
      const response = await fetch('/api/miembros', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Miembro actualizado exitosamente');
        closePopup();
        fetchMiembros();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar el miembro: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al actualizar el miembro');
    }
  };

  const handleDelete = async () => {
    if (!miembroAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/miembros/${miembroAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Miembro eliminado exitosamente');
        closeDeletePopup();
        fetchMiembros();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el miembro: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al eliminar el miembro');
    }
  };

  const fetchMiembros = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/miembros?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Miembro[] = await response.json();

        setMiembros(data);
      } else {
        console.error('Error al obtener los miembros:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los miembros: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los miembros');
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchCentrosCostos = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/costos');
      if (response.ok) {
        const data: CentroCosto[] = await response.json();
     
        setCentrosCostos(data);
      } else {
        console.error('Error al obtener los centros de costos:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los centros de costos: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los centros de costos');
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

  const fetchTerminales = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/terminales');
      if (response.ok) {
        const data: Terminal[] = await response.json();
  
        setTerminales(data);
      } else {
        console.error('Error al obtener los terminales:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los terminales: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los terminales');
    }
  }, []);

  const handleEditar = (miembro: Miembro) => {

    setMiembroSeleccionado(miembro);
    setFormData({
      id: miembro.id,
      nombre: miembro.nombre,
      user: miembro.user,
      email: miembro.email,
      establecimiento: miembro.establecimiento,
      empresa_id: miembro.empresa_id,
      terminal_id: miembro.terminal_id,
      password: '',
    });
    openPopup('editar');
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMiembros(), fetchCentrosCostos(), fetchEmpresas(), fetchTerminales()]);
    };
    loadData();
  }, [fetchMiembros, fetchCentrosCostos, fetchEmpresas, fetchTerminales]);

  const filteredMiembros = miembros.filter((miembro) =>
    [
      miembro.nombre,
      miembro.user,
      miembro.email,
      miembro.establecimiento_nombre,
      miembro.empresa_nombre,
      miembro.terminal_nombre,
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMiembros = filteredMiembros.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMiembros.length / itemsPerPage);

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
        <Navbar />
        <div className="flex-1 flex flex-col">
    
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 Tiwmb-4 
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Miembros
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los miembros registrados en el APK de Max Loyalty Mobile.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => openPopup('agregar')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Miembro
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, usuario, email, establecimiento, empresa o terminal..."
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
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">User</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Email</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Establecimiento</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Terminal</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMiembros.length > 0 ? (
                  currentMiembros.map((miembro, index) => (
                    <tr className="hover:bg-gray-50 transition-all duration-200" key={miembro.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{miembro.nombre}</td>
                      <td className="px-4 py-2">{miembro.user}</td>
                      <td className="px-4 py-2">{miembro.email}</td>
                      <td className="px-4 py-2">{miembro.establecimiento_nombre}</td>
                      <td className="px-4 py-2">{miembro.empresa_nombre}</td>
                      <td className="px-4 py-2">{miembro.terminal_nombre}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleEditar(miembro)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeletePopup(miembro)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-2 text-center text-gray-500">
                      No hay miembros disponibles.
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
                      {miembroSeleccionado ? 'Editar Miembro' : 'Agregar Miembro'}
                    </h2>
                  </div>

                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}

                  {miembroSeleccionado ? (
                    <form onSubmit={handleSubmitEditar}>
                      <input type="hidden" name="id" value={formData.id} />
                      <label className="block text-center font-medium text-gray-700" htmlFor="nombre">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Grupo GSIE"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                      <label className="block text-center font-medium text-gray-700" htmlFor="user">
                        User
                      </label>
                      <input
                        type="text"
                        name="user"
                        placeholder="gsie@hn"
                        value={formData.user}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="terminal_id">
                            Terminal
                          </label>
                          <select
                            name="terminal_id"
                            value={formData.terminal_id.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          >
                            <option value="0">Seleccione un terminal</option>
                            {terminales.map((terminal) => (
                              <option key={terminal.id} value={terminal.id.toString()}>
                                {terminal.nombre_terminal}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="empresa_id">
                            Empresa
                          </label>
                          <select
                            name="empresa_id"
                            value={formData.empresa_id.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                            disabled
                          >
                            <option value="0">Seleccione una empresa</option>
                            {empresas.map((empresa) => (
                              <option key={empresa.id} value={empresa.id.toString()}>
                                {empresa.nombre_empresa}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="establecimiento">
                            Establecimiento
                          </label>
                          <select
                            name="establecimiento"
                            value={formData.establecimiento.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                            disabled
                          >
                            <option value="0">Seleccione un establecimiento</option>
                            {centrosCostos.map((centro) => (
                              <option key={centro.id} value={centro.id.toString()}>
                                {centro.nombre_centro_costos}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="email">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            placeholder="Ejemplo: grupogsie@gmail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          />
                        </div>
                      </div>
                      <label className="block text-center font-medium text-gray-700" htmlFor="password">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Dejar en blanco para no cambiar"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
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
                      <label className="block text-center font-medium text-gray-700" htmlFor="nombre">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Grupo GSIE"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                      <label className="block text-center font-medium text-gray-700" htmlFor="user">
                        User
                      </label>
                      <input
                        type="text"
                        name="user"
                        placeholder="Ejemplo: gsie@hn"
                        value={formData.user}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="terminal_id">
                            Terminal
                          </label>
                          <select
                            name="terminal_id"
                            value={formData.terminal_id.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          >
                            <option value="0">Seleccione un terminal</option>
                            {terminales.map((terminal) => (
                              <option key={terminal.id} value={terminal.id.toString()}>
                                {terminal.nombre_terminal}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="empresa_id">
                            Empresa
                          </label>
                          <select
                            name="empresa_id"
                            value={formData.empresa_id.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-gray-100"
                            required
                            disabled
                          >
                            <option value="0">Seleccione una empresa</option>
                            {empresas.map((empresa) => (
                              <option key={empresa.id} value={empresa.id.toString()}>
                                {empresa.nombre_empresa}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="establecimiento">
                            Establecimiento
                          </label>
                          <select
                            name="establecimiento"
                            value={formData.establecimiento.toString()}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-gray-100"
                            required
                            disabled
                          >
                            <option value="0">Seleccione un establecimiento</option>
                            {centrosCostos.map((centro) => (
                              <option key={centro.id} value={centro.id.toString()}>
                                {centro.nombre_centro_costos}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-center font-medium text-gray-700" htmlFor="email">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            placeholder="Ejemplo: grupogsie@hn"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                          />
                        </div>
                      </div>
                      <label className="block text-center font-medium text-gray-700" htmlFor="password">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Ejemplo: Tu contraseña segura"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
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

            {isDeletePopupOpen && miembroAEliminar && (
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
                    ¿Estás seguro que deseas eliminar el miembro {miembroAEliminar.nombre}?
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