'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SectionNavbar from '../components/SectionNavbar';

interface Terminal {
  id: number;
  empresa: string;
  estacion_servicio: string;
  codigo_terminal: string;
  nombre_terminal: string;
  codigo_activacion?: string | null;
  id_activacion?: string | null;
}

export default function Terminales() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isActivationPopupOpen, setIsActivationPopupOpen] = useState(false);
  const [isDeactivationPopupOpen, setIsDeactivationPopupOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    empresa: '',
    estacion_servicio: '',
    codigo_terminal: '',
    nombre_terminal: '',
  });
  const [terminalSeleccionado, setTerminalSeleccionado] = useState<Terminal | null>(null);
  const [terminalAEliminar, setTerminalAEliminar] = useState<Terminal | null>(null);
  const [terminalAActivar, setTerminalAActivar] = useState<Terminal | null>(null);
  const [terminalADesactivar, setTerminalADesactivar] = useState<Terminal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const generateActivationCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleActivate = async (terminal: Terminal) => {
    const newCode = generateActivationCode();
    setActivationCode(newCode);
    setTerminalAActivar(terminal);
    setIsActivationPopupOpen(true);

    const formDataToSend = new FormData();
    formDataToSend.append('id', terminal.id.toString());
    formDataToSend.append('empresa', terminal.empresa);
    formDataToSend.append('estacion_servicio', terminal.estacion_servicio);
    formDataToSend.append('codigo_terminal', terminal.codigo_terminal);
    formDataToSend.append('nombre_terminal', terminal.nombre_terminal);
    formDataToSend.append('codigo_activacion', newCode);

    try {
      const response = await fetch('/api/terminales', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        setTerminales((prev) =>
          prev.map((t) =>
            t.id === terminal.id ? { ...t, codigo_activacion: newCode } : t
          )
        );
      } else {
        alert('Error al activar la terminal');
        setIsActivationPopupOpen(false);
      }
    } catch (error) {
      console.error('Error al activar:', error);
      setIsActivationPopupOpen(false);
    }
  };

  const handleDeactivate = async (terminal: Terminal) => {
    const formDataToSend = new FormData();
    formDataToSend.append('id', terminal.id.toString());
    formDataToSend.append('empresa', terminal.empresa);
    formDataToSend.append('estacion_servicio', terminal.estacion_servicio);
    formDataToSend.append('codigo_terminal', terminal.codigo_terminal);
    formDataToSend.append('nombre_terminal', terminal.nombre_terminal);
    formDataToSend.append('codigo_activacion', '');
    formDataToSend.append('id_activacion', '0');

    try {
      const response = await fetch('/api/terminales', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        setTerminales((prev) =>
          prev.map((t) =>
            t.id === terminal.id ? { ...t, codigo_activacion: null, id_activacion: null } : t
          )
        );
        setIsDeactivationPopupOpen(false);
        setTerminalADesactivar(null);
      } else {
        alert('Error al desactivar la terminal');
      }
    } catch (error) {
      console.error('Error al desactivar:', error);
    }
  };

  const openDeactivationPopup = (terminal: Terminal) => {
    setTerminalADesactivar(terminal);
    setIsDeactivationPopupOpen(true);
  };

  const closeDeactivationPopup = () => {
    setTerminalADesactivar(null);
    setIsDeactivationPopupOpen(false);
  };

  const handleActivationClick = (terminal: Terminal) => {
    const isActive = terminal.id_activacion && /^\d{6}$/.test(terminal.id_activacion);
    if (isActive) {
      openDeactivationPopup(terminal);
    } else {
      handleActivate(terminal);
    }
  };

  const closeActivationPopup = async () => {
    if (terminalAActivar) {
      const formDataToSend = new FormData();
      formDataToSend.append('id', terminalAActivar.id.toString());
      formDataToSend.append('empresa', terminalAActivar.empresa);
      formDataToSend.append('estacion_servicio', terminalAActivar.estacion_servicio);
      formDataToSend.append('codigo_terminal', terminalAActivar.codigo_terminal);
      formDataToSend.append('nombre_terminal', terminalAActivar.nombre_terminal);
      formDataToSend.append('codigo_activacion', '');

      try {
        const response = await fetch('/api/terminales', {
          method: 'PUT',
          body: formDataToSend,
        });
        if (response.ok) {
          setTerminales((prev) =>
            prev.map((t) =>
              t.id === terminalAActivar.id ? { ...t, codigo_activacion: null } : t
            )
          );
        }
      } catch (error) {
        console.error('Error al cerrar el popup:', error);
      }
    }

    setIsActivationPopupOpen(false);
    setActivationCode('');
    setTerminalAActivar(null);
    window.location.reload(); // Recargar la página al cerrar el modal
  };

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setTerminalSeleccionado(null);
      setFormData({
        id: 0,
        empresa: '',
        estacion_servicio: '',
        codigo_terminal: '',
        nombre_terminal: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const openDeletePopup = (terminal: Terminal) => {
    setTerminalAEliminar(terminal);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setTerminalAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa || !formData.estacion_servicio || !formData.codigo_terminal || !formData.nombre_terminal) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('empresa', formData.empresa);
    formDataToSend.append('estacion_servicio', formData.estacion_servicio);
    formDataToSend.append('codigo_terminal', formData.codigo_terminal);
    formDataToSend.append('nombre_terminal', formData.nombre_terminal);

    try {
      const response = await fetch('/api/terminales', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Terminal agregado exitosamente');
        closePopup();
        fetchTerminales();
      } else {
        alert('Error al agregar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.empresa || !formData.estacion_servicio || !formData.codigo_terminal || !formData.nombre_terminal) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('empresa', formData.empresa);
    formDataToSend.append('estacion_servicio', formData.estacion_servicio);
    formDataToSend.append('codigo_terminal', formData.codigo_terminal);
    formDataToSend.append('nombre_terminal', formData.nombre_terminal);

    try {
      const response = await fetch('/api/terminales', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Terminal actualizado exitosamente');
        closePopup();
        fetchTerminales();
      } else {
        alert('Error al actualizar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!terminalAEliminar) return;
    try {
      const response = await fetch(`/api/terminales/${terminalAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Terminal eliminado exitosamente');
        closeDeletePopup();
        fetchTerminales();
      } else {
        alert('Error al eliminar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchTerminales = useCallback(async () => {
    try {
      const response = await fetch(`/api/terminales?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Terminal[] = await response.json();
        setTerminales(data);
      } else {
        console.error('Error al obtener los terminales');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage]);

  const handleEditar = (terminal: Terminal) => {
    setTerminalSeleccionado(terminal);
    setFormData({
      id: terminal.id,
      empresa: terminal.empresa,
      estacion_servicio: terminal.estacion_servicio,
      codigo_terminal: terminal.codigo_terminal,
      nombre_terminal: terminal.nombre_terminal,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchTerminales();
  }, [fetchTerminales]);

  const filteredTerminales = terminales.filter((terminal) =>
    Object.values(terminal)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTerminales = filteredTerminales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTerminales.length / itemsPerPage);

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
        <main className="w-full p-8">
          <SectionNavbar />
          <h1 className="text-4xl font-semibold mb-4">Gestión de terminales</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los terminales registrados en la plataforma.
          </p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar terminales..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Agregar terminal
            </button>
          
          </div>

          <table className="min-w-full bg-white table-auto">
            <thead className="bg-gray-200">
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Estación de servicio</th>
                <th className="px-4 py-2 text-left">Código terminal</th>
                <th className="px-4 py-2 text-left">Nombre terminal</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTerminales.length > 0 ? (
                currentTerminales.map((terminal, index) => {
                  const isActive = terminal.id_activacion && /^\d{6}$/.test(terminal.id_activacion);
                  return (
                    <tr className="hover:bg-gray-50" key={terminal.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{terminal.empresa}</td>
                      <td className="px-4 py-2">{terminal.estacion_servicio}</td>
                      <td className="px-4 py-2">{terminal.codigo_terminal}</td>
                      <td className="px-4 py-2">{terminal.nombre_terminal}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditar(terminal)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleActivationClick(terminal)}
                          className={`px-3 py-1 rounded text-white mr-2 ${
                            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => openDeletePopup(terminal)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                    No hay terminales disponibles.
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
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {terminalSeleccionado ? 'Editar Terminal' : 'Agregar Terminal'}
                </h2>
                {terminalSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label htmlFor="empresa">Empresa</label>
                    <input
                      type="text"
                      name="empresa"
                      placeholder="Empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="estacion_servicio">Estación de servicio</label>
                    <input
                      type="text"
                      name="estacion_servicio"
                      placeholder="Estación de servicio"
                      value={formData.estacion_servicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="codigo_terminal">Código terminal</label>
                    <input
                      type="text"
                      name="codigo_terminal"
                      placeholder="Código terminal"
                      value={formData.codigo_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="nombre_terminal">Nombre terminal</label>
                    <input
                      type="text"
                      name="nombre_terminal"
                      placeholder="Nombre terminal"
                      value={formData.nombre_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                    <label htmlFor="empresa">Empresa</label>
                    <input
                      type="text"
                      name="empresa"
                      placeholder="Empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="estacion_servicio">Estación de servicio</label>
                    <input
                      type="text"
                      name="estacion_servicio"
                      placeholder="Estación de servicio"
                      value={formData.estacion_servicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="codigo_terminal">Código terminal</label>
                    <input
                      type="text"
                      name="codigo_terminal"
                      placeholder="Código terminal"
                      value={formData.codigo_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="nombre_terminal">Nombre terminal</label>
                    <input
                      type="text"
                      name="nombre_terminal"
                      placeholder="Nombre terminal"
                      value={formData.nombre_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
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

          {isDeletePopupOpen && terminalAEliminar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">¿Estás seguro de eliminar este terminal?</h2>
                <div className="flex justify-between">
                  <button
                    type="button"
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

          {isActivationPopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeActivationPopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">Código de Activación</h2>
                <p className="text-center text-lg mb-4">{activationCode}</p>
                <div className="flex justify-center">
                  <button
                    onClick={closeActivationPopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeactivationPopupOpen && terminalADesactivar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeactivationPopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">¿Estás seguro de desactivar este terminal?</h2>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={closeDeactivationPopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeactivate(terminalADesactivar)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Desactivar
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