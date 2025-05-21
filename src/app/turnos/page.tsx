'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Turno {
  id: number;
  fecha_inicio: string;
  fecha_final: string | null;
  miembro_id: number;
  usuario_nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  establecimiento_id: number;
  establecimiento_nombre: string;
  terminal_id: number;
  terminal_nombre: string;
  estado: boolean;
}

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
}

export default function Turnos() {
  const [isAgregarPopupOpen, setIsAgregarPopupOpen] = useState(false);
  const [isEditarPopupOpen, setIsEditarPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    fecha_inicio: '',
    fecha_final: '',
    miembro_id: 0,
    empresa_id: 0,
    establecimiento: 0,
    terminal_id: 0,
    estado: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
  const [turnoAEliminar, setTurnoAEliminar] = useState<Turno | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openAgregarPopup = () => {
    setIsAgregarPopupOpen(true);
    setErrorMessage(null);
    setFormData({
      id: 0,
      fecha_inicio: '',
      fecha_final: '',
      miembro_id: 0,
      empresa_id: 0,
      establecimiento: 0,
      terminal_id: 0,
      estado: true,
    });
  };

  const openEditarPopup = (turno: Turno) => {
    setIsEditarPopupOpen(true);
    setTurnoSeleccionado(turno);
    setErrorMessage(null);
    setFormData({
      id: turno.id,
      fecha_inicio: turno.fecha_inicio.slice(0, 16),
      fecha_final: turno.fecha_final ? turno.fecha_final.slice(0, 16) : '',
      miembro_id: turno.miembro_id,
      empresa_id: turno.empresa_id,
      establecimiento: turno.establecimiento_id,
      terminal_id: turno.terminal_id,
      estado: turno.estado,
    });
  };

  const closeAgregarPopup = () => {
    setIsAgregarPopupOpen(false);
    setErrorMessage(null);
  };

  const closeEditarPopup = () => {
    setIsEditarPopupOpen(false);
    setTurnoSeleccionado(null);
    setErrorMessage(null);
  };

  const openDeletePopup = (turno: Turno) => {
    setTurnoAEliminar(turno);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setTurnoAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'miembro_id') {
      const miembro = miembros.find((m) => m.id === parseInt(value));
      if (miembro) {
        setFormData((prevData) => ({
          ...prevData,
          miembro_id: parseInt(value),
          empresa_id: miembro.empresa_id,
          establecimiento: miembro.establecimiento,
          terminal_id: miembro.terminal_id,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          miembro_id: 0,
          empresa_id: 0,
          establecimiento: 0,
          terminal_id: 0,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const validateForm = (isEdit: boolean) => {
    const errors: string[] = [];
    if (!formData.fecha_inicio) {
      errors.push('Fecha y hora de inicio');
    }
    if (!formData.miembro_id) {
      errors.push('Miembro');
    }
    if (!formData.empresa_id) {
      errors.push('Empresa');
    }
    if (!formData.establecimiento) {
      errors.push('Establecimiento');
    }
    if (!formData.terminal_id) {
      errors.push('Terminal');
    }
    if (isEdit && !formData.id) {
      errors.push('ID');
    }
    if (formData.fecha_final) {
      const inicio = new Date(formData.fecha_inicio);
      const final = new Date(formData.fecha_final);
      if (isNaN(inicio.getTime()) || isNaN(final.getTime())) {
        errors.push('Fechas inválidas');
      } else if (final <= inicio) {
        errors.push('La fecha final debe ser posterior a la fecha de inicio');
      }
    }
    return errors;
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(false);
    if (errors.length > 0) {
      alert(`Por favor, corrija los siguientes errores: ${errors.join(', ')}.`);
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('fecha_inicio', formData.fecha_inicio);
    formDataToSend.append('fecha_final', formData.fecha_final );
    formDataToSend.append('miembro_id', formData.miembro_id.toString());
    formDataToSend.append('empresa_id', formData.empresa_id.toString());
    formDataToSend.append('establecimiento', formData.establecimiento.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());
    formDataToSend.append('estado', formData.estado.toString());

    try {
      setErrorMessage(null);
      const response = await fetch('/api/turnos', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Turno agregado exitosamente');
        closeAgregarPopup();
        fetchTurnos();
      } else {
        const errorData = await response.json();
        alert(`Error al agregar el turno: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al agregar el turno');
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(true);
    if (errors.length > 0) {
      alert(`Por favor, corrija los siguientes errores: ${errors.join(', ')}.`);
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('fecha_inicio', formData.fecha_inicio);
    formDataToSend.append('fecha_final', formData.fecha_final );
    formDataToSend.append('miembro_id', formData.miembro_id.toString());
    formDataToSend.append('empresa_id', formData.empresa_id.toString());
    formDataToSend.append('establecimiento', formData.establecimiento.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());
    formDataToSend.append('estado', formData.estado.toString());

    try {
      setErrorMessage(null);
      const response = await fetch('/api/turnos', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Turno actualizado exitosamente');
        closeEditarPopup();
        fetchTurnos();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar el turno: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al actualizar el turno');
    }
  };

  const handleDelete = async () => {
    if (!turnoAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/turnos/${turnoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Turno eliminado exitosamente');
        closeDeletePopup();
        fetchTurnos();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el turno: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al eliminar el turno');
    }
  };

  const fetchTurnos = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/turnos?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Turno[] = await response.json();
        setTurnos(data);
      } else {
        console.error('Error al obtener los turnos:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los turnos: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los turnos');
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchMiembros = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('/api/miembros');
      if (response.ok) {
        const data: Miembro[] = await response.json();
        console.log('Miembros obtenidos:', data); // Depuración
        setMiembros(data);
        if (data.length === 0) {
     
        }
      } else {
        console.error('Error al obtener los miembros:', response.status, response.statusText);
        setErrorMessage(`Error al obtener los miembros: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los miembros: No se pudo conectar con el servidor.');
    }
  }, []);

  const handleEditar = (turno: Turno) => {
    openEditarPopup(turno);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTurnos(), fetchMiembros()]);
    };
    loadData();
  }, [fetchTurnos, fetchMiembros]);

  const filteredTurnos = turnos.filter((turno) =>
    [
      turno.usuario_nombre || '',
      turno.empresa_nombre || '',
      turno.establecimiento_nombre || '',
      turno.terminal_nombre || '',
      turno.fecha_inicio,
      turno.fecha_final || '',
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTurnos = filteredTurnos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTurnos.length / itemsPerPage);

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

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                Gestión de Turnos
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los turnos registrados en el sistema.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={openAgregarPopup}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Turno
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por miembro, empresa, establecimiento, terminal o fechas..."
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
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha Inicio</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha Final</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Miembro</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Establecimiento</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Terminal</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Estado</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentTurnos.length > 0 ? (
                  currentTurnos.map((turno, index) => (
                    <tr className="hover:bg-gray-50 transition-all duration-200" key={turno.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{formatDateTime(turno.fecha_inicio)}</td>
                      <td className="px-4 py-2">{formatDateTime(turno.fecha_final)}</td>
                      <td className="px-4 py-2">{turno.usuario_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{turno.empresa_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{turno.establecimiento_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{turno.terminal_nombre || 'N/A'}</td>
                      <td className="px-4 py-2">{turno.estado ? 'Activo' : 'Cerrado'}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleEditar(turno)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeletePopup(turno)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                      No hay turnos disponibles.
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

            {isAgregarPopupOpen && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeAgregarPopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-1">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Agregar Turno
                    </h2>
                  </div>

                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}

                  <form onSubmit={handleSubmitAgregar}>
                    <label className="block text-center font-medium text-gray-700" htmlFor="fecha_inicio">
                      Fecha y Hora de Inicio
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="fecha_final">
                      Fecha y Hora Final
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_final"
                      value={formData.fecha_final}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="miembro_id">
                      Miembro
                    </label>
                    <select
                      name="miembro_id"
                      value={formData.miembro_id.toString()}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    >
                      <option value="0">Seleccione un miembro</option>
                      {miembros.map((miembro) => (
                        <option key={miembro.id} value={miembro.id.toString()}>
                          {miembro.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-center font-medium text-gray-700" htmlFor="empresa_id">
                          Empresa
                        </label>
                        <input
                          type="text"
                          name="empresa_id"
                          value={formData.empresa_id ? miembros.find((m) => m.empresa_id === formData.empresa_id)?.empresa_nombre || '' : ''}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-center font-medium text-gray-700" htmlFor="establecimiento">
                          Establecimiento
                        </label>
                        <input
                          type="text"
                          name="establecimiento"
                          value={
                        formData.establecimiento ? miembros.find((m) => m.establecimiento === formData.establecimiento)?.establecimiento_nombre || '' : ''}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                          disabled
                        />
                      </div>
                    </div>
                    <label className="block text-center font-medium text-gray-700" htmlFor="terminal_id">
                      Terminal
                    </label>
                    <input
                      type="text"
                      name="terminal_id"
                      value={formData.terminal_id ? miembros.find((m) => m.terminal_id === formData.terminal_id)?.terminal_nombre || '' : ''}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                      disabled
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="estado">
                      Estado
                    </label>
                    <div className="flex justify-center mb-4">
                      <input
                        type="checkbox"
                        name="estado"
                        checked={formData.estado}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{formData.estado ? 'Activo' : 'Cerrado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closeAgregarPopup}
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
              </div>
            )}

            {isEditarPopupOpen && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeEditarPopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-1">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Editar Turno
                    </h2>
                  </div>

                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}

                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label className="block text-center font-medium text-gray-700" htmlFor="fecha_inicio">
                      Fecha y Hora de Inicio
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="fecha_final">
                      Fecha y Hora Final
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_final"
                      value={formData.fecha_final}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="miembro_id">
                      Miembro
                    </label>
                    <select
                      name="miembro_id"
                      value={formData.miembro_id.toString()}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      required
                    >
                      <option value="0">Seleccione un miembro</option>
                      {miembros.map((miembro) => (
                        <option key={miembro.id} value={miembro.id.toString()}>
                          {miembro.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-center font-medium text-gray-700" htmlFor="empresa_id">
                          Empresa
                        </label>
                        <input
                          type="text"
                          name="empresa_id"
                          value={formData.empresa_id ? miembros.find((m) => m.empresa_id === formData.empresa_id)?.empresa_nombre || '' : ''}
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-center font-medium text-gray-700" htmlFor="establecimiento">
                          Establecimiento
                        </label>
                        <input
                          type="text"
                          name="establecimiento"
                          value={formData.establecimiento ? miembros.find((m) => m.establecimiento === formData.establecimiento)?.establecimiento_nombre || '': '' }
                          className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                          disabled
                        />
                      </div>
                    </div>
                    <label className="block text-center font-medium text-gray-700" htmlFor="terminal_id">
                      Terminal
                    </label>
                    <input
                      type="text"
                      name="terminal_id"
                      value={formData.terminal_id ? miembros.find((m) => m.terminal_id === formData.terminal_id)?.terminal_nombre || '' : ''}
                      className="w-full p-2 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-center"
                      disabled
                    />
                    <label className="block text-center font-medium text-gray-700" htmlFor="estado">
                      Estado
                    </label>
                    <div className="flex justify-center mb-4">
                      <input
                        type="checkbox"
                        name="estado"
                        checked={formData.estado}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{formData.estado ? 'Activo' : 'Cerrado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closeEditarPopup}
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
              </div>
            )}

            {isDeletePopupOpen && turnoAEliminar && (
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
                    ¿Estás seguro que deseas eliminar el turno del {formatDateTime(turnoAEliminar.fecha_inicio)}?
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