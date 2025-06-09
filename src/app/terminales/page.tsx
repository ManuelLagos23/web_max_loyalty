'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


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
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [terminalAEliminar, setTerminalAEliminar] = useState<Terminal | null>(null);
  const [terminalAActivar, setTerminalAActivar] = useState<Terminal | null>(null);
  const [terminalADesactivar, setTerminalADesactivar] = useState<Terminal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
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

  const checkActivationStatus = useCallback(async () => {
    if (!terminalAActivar) return;

    try {
      const response = await fetch(`/api/terminales/${terminalAActivar.id}`);
      if (response.ok) {
        const terminal: Terminal = await response.json();
        if (terminal.id_activacion && /^\d{6}$/.test(terminal.id_activacion)) {
          setTerminales((prev) =>
            prev.map((t) =>
              t.id === terminalAActivar.id ? { ...t, id_activacion: terminal.id_activacion } : t
            )
          );
          setIsActivationPopupOpen(false);
          setIsSuccessPopupOpen(true);
          setTerminalAActivar(null);
          setActivationCode('');
        }
      } else {
        console.error('Error al verificar el estado de activación:', response.status);
        setError('Error al verificar el estado de activación');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setError('Error al conectar con el servidor');
    }
  }, [terminalAActivar]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActivationPopupOpen && terminalAActivar) {
      interval = setInterval(() => {
        checkActivationStatus();
      }, 2000); // Verificar cada 2 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActivationPopupOpen, terminalAActivar, checkActivationStatus]);

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
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Terminal eliminado exitosamente');
        closeDeletePopup();
        fetchTerminales();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el terminal: ${errorData.message || 'Error desconocido'}`);
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


  const terminalesRoutes = [
    { name: 'Terminales', href: '/terminales' },
    { name: 'Usuarios de terminales', href: '/miembros' },


  ];


  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      {isLoading ? (
        <div className="flex min-h-screen">
          <Navbar />
          <div className="flex-1 p-8">
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-screen">
          <Navbar />
          <div className="flex-1 p-8">
            <p className="text-center text-red-500">{error}</p>
          </div>
        </div>
      ) : (
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
                <nav className="flex justify-center space-x-4">
                  {terminalesRoutes.map((terminal) => {
                    const isActive = pathname === terminal.href;
                    return (
                      <Link key={terminal.name} href={terminal.href}>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                            }`}
                        >
                          {terminal.name}
                        </button>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex justify-between mb-4">
                <Link href="/terminales/crear">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
                          <td className="px-4 py-2 flex space-x-2">
                            <Link href={`/terminales/editar/${terminal.id}`}>
                              <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 mr-2">
                                Editar
                              </button>
                            </Link>
                            <Link href={`/terminales/ver/${terminal.id}`}>
                              <button className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 mr-2">
                                Ver
                              </button>
                            </Link>
                            <button
                              onClick={() => handleActivationClick(terminal)}
                              className={`px-3 py-1 rounded-lg text-white transition-all duration-300 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
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
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
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
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
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
                  <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
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
                    {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                    <p className="text-center text-gray-500 text-sm mb-4">Verificando activación...</p>
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

              {isSuccessPopupOpen && (
                <div
                  className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsSuccessPopupOpen(false);
                    }
                  }}
                >
                  <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                      bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105 text-center"
                    >
                      Terminal activada exitosamente
                    </h2>
                    <div className="flex justify-center mb-4">
                      <svg
                        className="w-12 h-12 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setIsSuccessPopupOpen(false)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
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
                  <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
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
      )}
    </div>
  );
}