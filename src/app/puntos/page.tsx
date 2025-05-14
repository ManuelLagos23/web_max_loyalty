'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';


interface Punto {
  id: number;
  cliente_id: number;
  cliente_nombre: string | null;
  transaccion_id: number;
  canjeados_id: number;
  debe: number;
  haber: number;
  created_at: string;
}

export default function Puntos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    cliente_id: 0,
    transaccion_id: 0,
    canjeados_id: 0,
    debe: 0,
    haber: 0,
  });
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<Punto | null>(null);
  const [puntoAEliminar, setPuntoAEliminar] = useState<Punto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedSearchTerm, setGroupedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [groupedCurrentPage, setGroupedCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isGrouped, setIsGrouped] = useState(false);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setPuntoSeleccionado(null);
      setFormData({
        id: 0,
        cliente_id: 0,
        transaccion_id: 0,
        canjeados_id: 0,
        debe: 0,
        haber: 0,
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const openDeletePopup = (punto: Punto) => {
    setPuntoAEliminar(punto);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setPuntoAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.transaccion_id || !formData.canjeados_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('transaccion_id', formData.transaccion_id.toString());
    formDataToSend.append('canjeados_id', formData.canjeados_id.toString());
    formDataToSend.append('debe', formData.debe.toString());
    formDataToSend.append('haber', formData.haber.toString());

    try {
      const response = await fetch('/api/puntos', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Punto agregado exitosamente');
        closePopup();
        fetchPuntos();
      } else {
        alert('Error al agregar el punto');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.cliente_id || !formData.transaccion_id || !formData.canjeados_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('transaccion_id', formData.transaccion_id.toString());
    formDataToSend.append('canjeados_id', formData.canjeados_id.toString());
    formDataToSend.append('debe', formData.debe.toString());
    formDataToSend.append('haber', formData.haber.toString());

    try {
      const response = await fetch('/api/puntos', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Punto actualizado exitosamente');
        closePopup();
        fetchPuntos();
      } else {
        alert('Error al actualizar el punto');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!puntoAEliminar) return;
    try {
      const response = await fetch(`/api/puntos/${puntoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Punto eliminado exitosamente');
        closeDeletePopup();
        fetchPuntos();
      } else {
        alert('Error al eliminar el punto');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchPuntos = useCallback(async () => {
    try {
      const response = await fetch(`/api/puntos?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: Punto[] = await response.json();
        setPuntos(data);
      } else {
        console.error('Error al obtener los puntos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage]);

  const handleEditar = (punto: Punto) => {
    setPuntoSeleccionado(punto);
    setFormData({
      id: punto.id,
      cliente_id: punto.cliente_id,
      transaccion_id: punto.transaccion_id,
      canjeados_id: punto.canjeados_id,
      debe: punto.debe,
      haber: punto.haber,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchPuntos();
  }, [fetchPuntos]);

  const filteredPuntos = puntos.filter((punto) =>
    Object.values(punto)
      .map((value) => String(value ?? ''))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPuntos = filteredPuntos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPuntos.length / itemsPerPage);

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

  interface GroupedData {
    cliente_id: number;
    cliente_nombre: string | null;
    sumDebe: number;
    sumHaber: number;
    diferencia: number;
  }

  const groupByClienteId = (): GroupedData[] => {
    const groupedData = puntos.reduce((acc, punto) => {
      const { cliente_id, cliente_nombre, debe, haber } = punto;
      if (!acc[cliente_id]) {
        acc[cliente_id] = { sumDebe: 0, sumHaber: 0, cliente_nombre };
      }
      acc[cliente_id].sumDebe += debe;
      acc[cliente_id].sumHaber += haber;
      return acc;
    }, {} as Record<number, { sumDebe: number; sumHaber: number; cliente_nombre: string | null }>);

    return Object.entries(groupedData).map(([cliente_id, { sumDebe, sumHaber, cliente_nombre }]) => ({
      cliente_id: Number(cliente_id),
      cliente_nombre,
      sumDebe,
      sumHaber,
      diferencia: sumDebe - sumHaber,
    }));
  };

  const groupedDataRaw = groupByClienteId();

  const filteredGroupedData = groupedDataRaw.filter((item) =>
    Object.values(item)
      .map((value) => String(value ?? ''))
      .join(' ')
      .toLowerCase()
      .includes(groupedSearchTerm.toLowerCase())
  );

  const groupedIndexOfLastItem = groupedCurrentPage * itemsPerPage;
  const groupedIndexOfFirstItem = groupedIndexOfLastItem - itemsPerPage;
  const currentGroupedData = filteredGroupedData.slice(groupedIndexOfFirstItem, groupedIndexOfLastItem);
  const groupedTotalPages = Math.ceil(filteredGroupedData.length / itemsPerPage);

  const handleGroupedNextPage = () => {
    if (groupedCurrentPage < groupedTotalPages) {
      setGroupedCurrentPage(groupedCurrentPage + 1);
    }
  };

  const handleGroupedPrevPage = () => {
    if (groupedCurrentPage > 1) {
      setGroupedCurrentPage(groupedCurrentPage - 1);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Navbar />
      <div className="flex-1 flex flex-col">
 
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Puntos
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los puntos registrados en la plataforma.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Agregar Punto
            </button>
            <button
              onClick={() => setIsGrouped(!isGrouped)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {isGrouped ? 'Mostrar Detalles' : 'Agrupar por Cliente'}
            </button>
          </div>
          {!isGrouped && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar puntos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {isGrouped && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={groupedSearchTerm}
                onChange={(e) => {
                  setGroupedSearchTerm(e.target.value);
                  setGroupedCurrentPage(1);
                }}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {isPopupOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  {puntoSeleccionado ? 'Editar Punto' : 'Agregar Punto'}
                </h2>
                {puntoSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="cliente_id" className="block text-sm font-medium mb-2">
                        ID Cliente
                      </label>
                      <input
                        type="number"
                        name="cliente_id"
                        placeholder="ID Cliente"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="transaccion_id" className="block text-sm font-medium mb-2">
                        ID Transacción
                      </label>
                      <input
                        type="number"
                        name="transaccion_id"
                        placeholder="ID Transacción"
                        value={formData.transaccion_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="canjeados_id" className="block text-sm font-medium mb-2">
                        ID Canjeados
                      </label>
                      <input
                        type="number"
                        name="canjeados_id"
                        placeholder="ID Canjeados"
                        value={formData.canjeados_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="debe" className="block text-sm font-medium mb-2">
                        Debe
                      </label>
                      <input
                        type="number"
                        name="debe"
                        placeholder="Debe"
                        value={formData.debe}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="haber" className="block text-sm font-medium mb-2">
                        Haber
                      </label>
                      <input
                        type="number"
                        name="haber"
                        placeholder="Haber"
                        value={formData.haber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="cliente_id" className="block text-sm font-medium mb-2">
                        ID Cliente
                      </label>
                      <input
                        type="number"
                        name="cliente_id"
                        placeholder="ID Cliente"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="transaccion_id" className="block text-sm font-medium mb-2">
                        ID Transacción
                      </label>
                      <input
                        type="number"
                        name="transaccion_id"
                        placeholder="ID Transacción"
                        value={formData.transaccion_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="canjeados_id" className="block text-sm font-medium mb-2">
                        ID Canjeados
                      </label>
                      <input
                        type="number"
                        name="canjeados_id"
                        placeholder="ID Canjeados"
                        value={formData.canjeados_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="debe" className="block text-sm font-medium mb-2">
                        Debe
                      </label>
                      <input
                        type="number"
                        name="debe"
                        placeholder="Debe"
                        value={formData.debe}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="haber" className="block text-sm font-medium mb-2">
                        Haber
                      </label>
                      <input
                        type="number"
                        name="haber"
                        placeholder="Haber"
                        value={formData.haber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          {isGrouped ? (
            <>
              <table className="mt-6 w-full bg-white table-auto border-collapse border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-left">Total Debe</th>
                    <th className="px-4 py-2 text-left">Total Haber</th>
                    <th className="px-4 py-2 text-left">Puntos Disponibles</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGroupedData.length > 0 ? (
                    currentGroupedData.map((item) => (
                      <tr key={item.cliente_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{item.cliente_nombre ?? 'Sin cliente'}</td>
                        <td className="px-4 py-2">{item.sumDebe}</td>
                        <td className="px-4 py-2">{item.sumHaber}</td>
                        <td className="px-4 py-2">{item.diferencia.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                        No hay datos agrupados disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleGroupedPrevPage}
                  disabled={groupedCurrentPage === 1}
                  className={`px-4 py-2 rounded ${groupedCurrentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Anterior
                </button>
                <span>
                  Página {groupedCurrentPage} de {groupedTotalPages}
                </span>
                <button
                  onClick={handleGroupedNextPage}
                  disabled={groupedCurrentPage === groupedTotalPages}
                  className={`px-4 py-2 rounded ${groupedCurrentPage === groupedTotalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : (
            <>
              <table className="mt-6 w-full bg-gray-100 table-auto border-collapse border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left" hidden>ID Cliente</th>
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-left" hidden>ID Transacción</th>
                    <th className="px-4 py-2 text-left" hidden>ID Canjeados</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Debe</th>
                    <th className="px-4 py-2 text-left">Haber</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPuntos.length > 0 ? (
                    currentPuntos.map((punto, index) => (
                      <tr key={punto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-2" hidden>{punto.id}</td>
                        <td className="px-4 py-2" hidden>{punto.cliente_id}</td>
                        <td className="px-4 py-2">{punto.cliente_nombre ?? 'Sin cliente'}</td>
                        <td className="px-4 py-2" hidden>{punto.transaccion_id}</td>
                        <td className="px-4 py-2" hidden>{punto.canjeados_id}</td>
                        <td className="px-4 py-2">{new Date(punto.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{punto.debe}</td>
                        <td className="px-4 py-2">{punto.haber}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleEditar(punto)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openDeletePopup(punto)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                        No hay puntos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
          {isDeletePopupOpen && puntoAEliminar && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Punto</h2>
                <p className="text-center mb-4">¿Estás seguro de que deseas eliminar este punto?</p>
                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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