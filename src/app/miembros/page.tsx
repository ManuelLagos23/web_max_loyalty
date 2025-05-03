'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Miembro {
  id: number;
  nombre: string;
  user: string;
  email: string;
  establecimiento: number; // Cambiado a number, ya que es un entero en la base de datos
  empresa_id: number;
  terminal_id: number;
  empresa_nombre: string;
  terminal_nombre: string;
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
  establecimiento: number; // Cambiado a number, ya que es un entero
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
    establecimiento: 0, // Cambiado a number
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
  const [isLoading, setIsLoading] = useState(true);

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
    } else if (modo === 'editar' && miembroSeleccionado && !isLoading) {
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
          establecimiento: terminalData.establecimiento, // Ya es un número
        }));
      } else {
        const errorText = `Error al obtener los detalles de la terminal: ${response.status} ${response.statusText}`;
        console.error(errorText);
        setErrorMessage(errorText);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('La solicitud para obtener los detalles de la terminal ha excedido el tiempo límite');
        setErrorMessage('No se pudo obtener los detalles de la terminal: Tiempo de espera excedido');
      } else {
        console.error('Error en la solicitud de la terminal:', error);
        setErrorMessage(`Error al obtener los detalles de la terminal: ${error.message}`);
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
    formDataToSend.append('establecimiento', formData.establecimiento.toString()); // Enviado como string para FormData, pero es un número en formData
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
    formDataToSend.append('establecimiento', formData.establecimiento.toString()); // Enviado como string para FormData, pero es un número en formData
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
        console.log('Miembros obtenidos:', data);
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
        console.log('Centros de costos obtenidos:', data);
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
        console.log('Empresas obtenidas:', data);
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
        console.log('Terminales obtenidos:', data);
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
    console.log('Editando miembro:', miembro);
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
      setIsLoading(false);
    };
    loadData();
  }, [fetchMiembros, fetchCentrosCostos, fetchEmpresas, fetchTerminales]);

  // Función para obtener el nombre del establecimiento a partir de su ID
  const getNombreEstablecimiento = (establecimientoId: number) => {
    const centro = centrosCostos.find((c) => c.id === establecimientoId);
    return centro ? centro.nombre_centro_costos : '';
  };

  const filteredMiembros = miembros.filter((miembro) =>
    [
      miembro.nombre,
      miembro.user,
      miembro.email,
      getNombreEstablecimiento(miembro.establecimiento), // Buscar por nombre del establecimiento
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
              Gestión de Miembros
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los miembros registrados en el APK de Max Loyalty Mobile.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              Agregar Miembro
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, usuario, email, establecimiento, empresa o terminal..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

          <table className="min-w-full bg-white table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Establecimiento</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Terminal</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMiembros.length > 0 ? (
                currentMiembros.map((miembro, index) => (
                  <tr className="hover:bg-gray-50" key={miembro.id}>
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2">{miembro.nombre}</td>
                    <td className="px-4 py-2">{miembro.user}</td>
                    <td className="px-4 py-2">{miembro.email}</td>
                    <td className="px-4 py-2">{miembro.establecimiento}</td>
                    <td className="px-4 py-2">{miembro.empresa_id}</td>
                    <td className="px-4 py-2">{miembro.terminal_id}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(miembro)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                        disabled={isLoading}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(miembro)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        disabled={isLoading}
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
              disabled={currentPage === 1 || isLoading}
              className={`px-4 py-2 rounded ${currentPage === 1 || isLoading ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className={`px-4 py-2 rounded ${currentPage === totalPages || isLoading ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <div className="text-center">
                  <h2
                    className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative
                    after:block after:h-1 after:w-12 after:mx-auto after:mt-2"
                  >
                    {miembroSeleccionado ? 'Editar Miembro' : 'Agregar Miembro'}
                  </h2>
                </div>

                {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}

                {miembroSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label className="block text-center" htmlFor="nombre">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Grupo GSIE"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      required
                    />
                    <label className="block text-center" htmlFor="user">
                      User:
                    </label>
                    <input
                      type="text"
                      name="user"
                      placeholder="gsie@hn"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-center" htmlFor="terminal_id">
                          Terminal:
                        </label>
                        <select
                          name="terminal_id"
                          value={formData.terminal_id.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                        <label className="block text-center" htmlFor="empresa_id">
                          Empresa:
                        </label>
                        <select
                          name="empresa_id"
                          value={formData.empresa_id.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
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
                        <label className="block text-center" htmlFor="establecimiento">
                          Establecimiento:
                        </label>
                        <select
                          name="establecimiento"
                          value={formData.establecimiento.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
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
                        <label className="block text-center" htmlFor="email">
                          Email:
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: grupogsie@gmail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <label className="block text-center" htmlFor="password">
                      Password:
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Ejemplo: Tu contraseña segura"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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
                    <label className="block text-center" htmlFor="nombre">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Grupo GSIE"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      required
                    />
                    <label className="block text-center" htmlFor="user">
                      User:
                    </label>
                    <input
                      type="text"
                      name="user"
                      placeholder="Ejemplo: gsie@hn"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-center" htmlFor="terminal_id">
                          Terminal:
                        </label>
                        <select
                          name="terminal_id"
                          value={formData.terminal_id.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
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
                        <label className="block text-center" htmlFor="empresa_id">
                          Empresa:
                        </label>
                        <select
                          name="empresa_id"
                          value={formData.empresa_id.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
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
                        <label className="block text-center" htmlFor="establecimiento">
                          Establecimiento:
                        </label>
                        <select
                          name="establecimiento"
                          value={formData.establecimiento.toString()}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
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
                        <label className="block text-center" htmlFor="email">
                          Email:
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Ejemplo: grupogsie@hn"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                          required
                        />
                      </div>
                    </div>
                    <label className="block text-center" htmlFor="password">
                      Password:
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Ejemplo: Tu contraseña segura"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      required
                    />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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

          {isDeletePopupOpen && miembroAEliminar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <h2 className="text-2xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro que deseas eliminar el miembro {miembroAEliminar.nombre}?
                </p>
                {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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