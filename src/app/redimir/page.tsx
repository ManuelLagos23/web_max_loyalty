'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Canjeado {
  id: number;
  cliente_id: number;
  cliente_nombre: string | null;
  establecimiento_id: number;
  created_at: string;
  puntos_canjeados: number;
  terminal_id: number;
  numero_tarjeta: string | null;
  estado: boolean;
}

export default function Canjeados() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [canjeados, setCanjeados] = useState<Canjeado[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    cliente_id: 0,
    establecimiento_id: 0,
    created_at: '',
    puntos_canjeados: 0,
    terminal_id: 0,
  });
  const [canjeadoSeleccionado, setCanjeadoSeleccionado] = useState<Canjeado | null>(null);
  const [canjeadoAEliminar, setCanjeadoAEliminar] = useState<Canjeado | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setCanjeadoSeleccionado(null);
      setFormData({
        id: 0,
        cliente_id: 0,
        establecimiento_id: 0,
        created_at: '',
        puntos_canjeados: 0,
        terminal_id: 0,
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (canjeado: Canjeado) => {
    setCanjeadoAEliminar(canjeado);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setCanjeadoAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'created_at' ? value : Number(value) });
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.establecimiento_id || !formData.terminal_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('establecimiento_id', formData.establecimiento_id.toString());
    formDataToSend.append('puntos_canjeados', formData.puntos_canjeados.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());

    try {
      const response = await fetch('/api/canjeados', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Canjeado agregado exitosamente');
        closePopup();
        fetchCanjeados();
      } else {
        alert('Error al agregar el canjeado');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.cliente_id || !formData.establecimiento_id || !formData.terminal_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('establecimiento_id', formData.establecimiento_id.toString());
    formDataToSend.append('puntos_canjeados', formData.puntos_canjeados.toString());
    formDataToSend.append('terminal_id', formData.terminal_id.toString());

    try {
      const response = await fetch('/api/canjeados', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Canjeado actualizado exitosamente');
        closePopup();
        fetchCanjeados();
      } else {
        alert('Error al actualizar el canjeado');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!canjeadoAEliminar) return;
    try {
      const response = await fetch(`/api/canjeados/${canjeadoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Canjeado eliminado exitosamente');
        closeDeletePopup();
        fetchCanjeados();
      } else {
        alert('Error al eliminar el canjeado');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchCanjeados = useCallback(async () => {
    try {
      const response = await fetch(`/api/canjeados?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Canjeado[] = await response.json();
        setCanjeados(data);
      } else {
        console.error('Error al obtener los canjeados');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage]);

  const handleEditar = (canjeado: Canjeado) => {
    setCanjeadoSeleccionado(canjeado);
    setFormData({
      id: canjeado.id,
      cliente_id: canjeado.cliente_id,
      establecimiento_id: canjeado.establecimiento_id,
      created_at: canjeado.created_at,
      puntos_canjeados: canjeado.puntos_canjeados,
      terminal_id: canjeado.terminal_id,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchCanjeados();
  }, [fetchCanjeados]);

  const filteredCanjeados = canjeados.filter((canjeado) =>
    Object.values(canjeado)
      .map((value) => String(value ?? '')) // Maneja valores null
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCanjeados = filteredCanjeados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCanjeados.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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
              Gestión de Canjeados
            </h1>
            <p 
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los puntos canjeados registrados en la plataforma.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar Canjeado
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar canjeados..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {canjeadoSeleccionado ? 'Editar Canjeado' : 'Agregar Canjeado'}
                </h2>
                {canjeadoSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="cliente_id">ID Cliente</label>
                      <input
                        type="number"
                        name="cliente_id"
                        placeholder="ID Cliente"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="establecimiento_id">ID Establecimiento</label>
                      <input
                        type="number"
                        name="establecimiento_id"
                        placeholder="ID Establecimiento"
                        value={formData.establecimiento_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="created_at">Fecha Creación</label>
                      <input
                        type="text"
                        name="created_at"
                        placeholder="Fecha Creación"
                        value={formData.created_at}
                        readOnly
                        className="w-full p-2 mb-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="puntos_canjeados">Puntos Canjeados</label>
                      <input
                        type="number"
                        name="puntos_canjeados"
                        placeholder="Puntos Canjeados"
                        value={formData.puntos_canjeados}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="terminal_id">ID Terminal</label>
                      <input
                        type="number"
                        name="terminal_id"
                        placeholder="ID Terminal"
                        value={formData.terminal_id}
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
                      <label htmlFor="cliente_id">ID Cliente</label>
                      <input
                        type="number"
                        name="cliente_id"
                        placeholder="ID Cliente"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="establecimiento_id">ID Establecimiento</label>
                      <input
                        type="number"
                        name="establecimiento_id"
                        placeholder="ID Establecimiento"
                        value={formData.establecimiento_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="puntos_canjeados">Puntos Canjeados</label>
                      <input
                        type="number"
                        name="puntos_canjeados"
                        placeholder="Puntos Canjeados"
                        value={formData.puntos_canjeados}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="terminal_id">ID Terminal</label>
                      <input
                        type="number"
                        name="terminal_id"
                        placeholder="ID Terminal"
                        value={formData.terminal_id}
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

          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left" hidden>ID Cliente</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Establecimiento</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Puntos Canjeados</th>
                <th className="px-4 py-2 text-left">Terminal</th>
                <th className="px-4 py-2 text-left">Número de Tarjeta</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCanjeados.length > 0 ? (
                currentCanjeados.map((canjeado, index) => (
                  <tr key={canjeado.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2" hidden>{canjeado.cliente_id}</td>
                    <td className="px-4 py-2">{canjeado.cliente_nombre ?? 'Sin cliente'}</td>
                    <td className="px-4 py-2">{canjeado.establecimiento_id}</td>
                    <td className="px-4 py-2">{new Date(canjeado.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{canjeado.puntos_canjeados}</td>
                    <td className="px-4 py-2">{canjeado.terminal_id}</td>
                    <td className="px-4 py-2">{canjeado.numero_tarjeta ?? 'Sin tarjeta'}</td>
                    <td className="px-4 py-2">{canjeado.estado ? 'Validada' : 'Cancelada'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(canjeado)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(canjeado)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
                    No hay canjeados disponibles.
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

          {isDeletePopupOpen && canjeadoAEliminar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5">
                <h2 className="text-xl font-semibold mb-2">Eliminar Canjeado</h2>
                <p>¿Estás seguro de que deseas eliminar este canjeado?</p>
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