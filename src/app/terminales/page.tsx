'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

interface Terminal {
  id: number;
  empresa: string;
  estacion_servicio: string;
  codigo_terminal: string;
  nombre_terminal: string;
  numero_serie: string;
  mac: string;
  modelo: string;
  marca: string;
  codigo_activacion?: string | null;
  id_activacion?: string | null;
}

interface Costo {
  id: number;
  nombre_centro_costos: string;
  empresa: string;
}

interface Empresa {
  id: number;
  nombre_empresa: string;
}

export default function Terminales() {
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isActivationPopupOpen, setIsActivationPopupOpen] = useState(false);
  const [isDeactivationPopupOpen, setIsDeactivationPopupOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [terminalAEliminar, setTerminalAEliminar] = useState<Terminal | null>(null);
  const [terminalAActivar, setTerminalAActivar] = useState<Terminal | null>(null);
  const [terminalADesactivar, setTerminalADesactivar] = useState<Terminal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const generateActivationCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleActivate = async (terminal: Terminal) => {
    if (!terminal.empresa) {
      alert('Error: La terminal no tiene una empresa asignada.');
      return;
    }
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
    formDataToSend.append('numero_serie', terminal.numero_serie);
    formDataToSend.append('mac', terminal.mac);
    formDataToSend.append('modelo', terminal.modelo);
    formDataToSend.append('marca', terminal.marca);
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
        setTerminalAActivar(null);
      }
    } catch (error) {
      console.error('Error al activar:', error);
      alert('Error al conectar con el servidor');
      setIsActivationPopupOpen(false);
      setTerminalAActivar(null);
    }
  };

  const handleDeactivate = async (terminal: Terminal) => {
    if (!terminal.empresa) {
      alert('Error: La terminal no tiene una empresa asignada.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', terminal.id.toString());
    formDataToSend.append('empresa', terminal.empresa);
    formDataToSend.append('estacion_servicio', terminal.estacion_servicio);
    formDataToSend.append('codigo_terminal', terminal.codigo_terminal);
    formDataToSend.append('nombre_terminal', terminal.nombre_terminal);
    formDataToSend.append('numero_serie', terminal.numero_serie);
    formDataToSend.append('mac', terminal.mac);
    formDataToSend.append('modelo', terminal.modelo);
    formDataToSend.append('marca', terminal.marca);
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
      alert('Error al conectar con el servidor');
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
      formDataToSend.append('numero_serie', terminalAActivar.numero_serie);
      formDataToSend.append('mac', terminalAActivar.mac);
      formDataToSend.append('modelo', terminalAActivar.modelo);
      formDataToSend.append('marca', terminalAActivar.marca);
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
        } else {
          console.error('Error al limpiar el código de activación');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    }

    setIsActivationPopupOpen(false);
    setActivationCode('');
    setTerminalAActivar(null);
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

  const openDeletePopup = (terminal: Terminal) => {
    setTerminalAEliminar(terminal);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setTerminalAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleDelete = async () => {
    if (!terminalAEliminar) return;
    try {
      const response = await fetch(`/api/terminales/${terminalAEliminar.id}`, {
        method: 'PUT',
        body: JSON.stringify({ deleted: true }),
        headers: {
          'Content-Type': 'application/json',
        },
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
      alert('Error al conectar con el servidor');
    }
  };

  const fetchTerminales = useCallback(async () => {
    try {
      const response = await fetch(`/api/terminales?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Terminal[] = await response.json();
        setTerminales(data);
      } else {
        console.error('Error al obtener los terminales:', response.status);
        setError('Error al cargar los terminales');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setError('Error al conectar con el servidor');
    }
  }, [currentPage, itemsPerPage]);

  const fetchCostos = useCallback(async () => {
    try {
      const response = await fetch('/api/costos');
      if (response.ok) {
        const data: Costo[] = await response.json();
        setCostos(data);
      } else {
        console.error('Error al obtener los costos:', response.status);
        setError('Error al cargar los costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setError('Error al conectar con el servidor');
    }
  }, []);

  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas:', response.status);
        setError('Error al cargar las empresas');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setError('Error al conectar con el servidor');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchTerminales(), fetchCostos(), fetchEmpresas()]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchTerminales, fetchCostos, fetchEmpresas]);

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

  if (error) {
    return (
      <div className="font-sans bg-white text-gray-900 min-h-screen flex">
        <Navbar />
        <div className="flex-1 p-8">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

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
                Gestión de Terminales
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los terminales registrados en la plataforma.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <Link href="/terminales/crear">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Agregar terminal
                </button>
              </Link>
            </div>

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

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Estación de servicio</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Código terminal</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre terminal</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">S/N</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">MAC</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Modelo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Marca</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentTerminales.length > 0 ? (
                  currentTerminales.map((terminal, index) => {
                    const isActive = terminal.id_activacion && /^\d{6}$/.test(terminal.id_activacion);
                    return (
                      <tr className="hover:bg-gray-50 transition-all duration-200" key={terminal.id}>
                        <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-2">
                          {empresas.find((e) => e.id === parseInt(terminal.empresa))?.nombre_empresa || 'Desconocida'}
                        </td>
                        <td className="px-4 py-2">
                          {costos.find((c) => c.id === parseInt(terminal.estacion_servicio))?.nombre_centro_costos || 'Desconocida'}
                        </td>
                        <td className="px-4 py-2">{terminal.codigo_terminal}</td>
                        <td className="px-4 py-2">{terminal.nombre_terminal}</td>
                        <td className="px-4 py-2">{terminal.numero_serie}</td>
                        <td className="px-4 py-2">{terminal.mac}</td>
                        <td className="px-4 py-2">{terminal.modelo}</td>
                        <td className="px-4 py-2">{terminal.marca}</td>
                        <td className="px-4 py-2 flex space-x-2">
                          <Link href={`/terminales/editar/${terminal.id}`}>
                            <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 mr-2">
                              Editar
                            </button>
                          </Link>
                          <button
                            onClick={() => handleActivationClick(terminal)}
                            className={`px-3 py-1 rounded-lg text-white transition-all duration-300 ${
                              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => openDeletePopup(terminal)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
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

            {isDeletePopupOpen && terminalAEliminar && (
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
                    ¿Estás seguro de eliminar este terminal?
                  </h2>
                  <div className="flex justify-between">
                    <button
                      type="button"
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

            {isActivationPopupOpen && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeActivationPopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    Código de Activación
                  </h2>
                  <p className="text-center text-lg mb-4 text-gray-700">{activationCode}</p>
                  <div className="flex justify-center">
                    <button
                      onClick={closeActivationPopup}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
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
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    ¿Estás seguro de desactivar este terminal?
                  </h2>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={closeDeactivationPopup}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeactivate(terminalADesactivar)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
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
    </div>
  );
}