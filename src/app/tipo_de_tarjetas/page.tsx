'use client';

import { useState, useEffect, useCallback } from 'react';

import MenuMain from '../components/MenuMain';
import NavbarGeneral from '../components/NavbarGeneral';

type TipoTarjeta = {
  id: number;
  tipo_tarjeta: string;
  codigo_tipo_tarjeta: string;
  descripcion: string;
};

export default function TiposTarjeta() {
  const [tiposTarjeta, setTiposTarjeta] = useState<TipoTarjeta[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tipoTarjetaData, setTipoTarjetaData] = useState({
    tipo_tarjeta: '',
    codigo_tipo_tarjeta: '',
    descripcion: '',
  });
  const [tipoTarjetaToUpdate, setTipoTarjetaToUpdate] = useState<TipoTarjeta | null>(null);
  const [tipoTarjetaToDelete, setTipoTarjetaToDelete] = useState<TipoTarjeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTiposTarjeta = useCallback(async () => {
    const response = await fetch(`/api/tipos_tarjetas?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setTiposTarjeta(data);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchTiposTarjeta();
  }, [fetchTiposTarjeta]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTipoTarjetaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tipo_tarjeta', tipoTarjetaData.tipo_tarjeta);
    formData.append('codigo_tipo_tarjeta', tipoTarjetaData.codigo_tipo_tarjeta);
    formData.append('descripcion', tipoTarjetaData.descripcion);

    const response = await fetch('/api/tipos_tarjetas', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newTipoTarjeta = await response.json();
      alert('Tipo de tarjeta agregado exitosamente');
      setTiposTarjeta((prev) => [...prev, newTipoTarjeta.data]);
      setTipoTarjetaData({ tipo_tarjeta: '', codigo_tipo_tarjeta: '', descripcion: '' });
      setIsAddModalOpen(false);
      fetchTiposTarjeta();
    } else {
      alert('Error al agregar el tipo de tarjeta');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoTarjetaToUpdate) {
      const formData = new FormData();
      formData.append('id', String(tipoTarjetaToUpdate.id));
      formData.append('tipo_tarjeta', tipoTarjetaData.tipo_tarjeta);
      formData.append('codigo_tipo_tarjeta', tipoTarjetaData.codigo_tipo_tarjeta);
      formData.append('descripcion', tipoTarjetaData.descripcion);

      const response = await fetch('/api/tipos_tarjetas', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedTipoTarjeta = await response.json();
        alert('Tipo de tarjeta actualizado exitosamente');
        setTiposTarjeta((prev) =>
          prev.map((tipo) =>
            tipo.id === updatedTipoTarjeta.data.id ? updatedTipoTarjeta.data : tipo
          )
        );
        setTipoTarjetaData({ tipo_tarjeta: '', codigo_tipo_tarjeta: '', descripcion: '' });
        setIsUpdateModalOpen(false);
        fetchTiposTarjeta();
      } else {
        alert('Error al actualizar el tipo de tarjeta');
      }
    }
  };

  const handleDelete = async () => {
    if (tipoTarjetaToDelete) {
      const response = await fetch(`/api/tipos_tarjetas/${tipoTarjetaToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tipo de tarjeta eliminado exitosamente');
        setTiposTarjeta((prev) => prev.filter((tipo) => tipo.id !== tipoTarjetaToDelete.id));
        setIsDeleteModalOpen(false);
        fetchTiposTarjeta();
      } else {
        alert('Error al eliminar el tipo de tarjeta');
      }
    }
  };

  const filteredTiposTarjeta = tiposTarjeta.filter((tipo) =>
    Object.values(tipo)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTiposTarjeta = filteredTiposTarjeta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTiposTarjeta.length / itemsPerPage);

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
        <NavbarGeneral />
        <div className="flex-1 flex flex-col">
          <MenuMain />
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Tipos de Tarjeta
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los tipos de tarjeta registrados en la plataforma con facilidad y seguridad.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Tipo de Tarjeta
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por tipo, código o descripción..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de Tarjeta</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Código</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Descripción</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentTiposTarjeta.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                      No hay tipos de tarjeta disponibles
                    </td>
                  </tr>
                ) : (
                  currentTiposTarjeta.map((tipo, index) => (
                    <tr key={tipo.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{tipo.tipo_tarjeta}</td>
                      <td className="px-4 py-2">{tipo.codigo_tipo_tarjeta}</td>
                      <td className="px-4 py-2">{tipo.descripcion}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setTipoTarjetaToUpdate(tipo);
                            setTipoTarjetaData({
                              tipo_tarjeta: tipo.tipo_tarjeta,
                              codigo_tipo_tarjeta: tipo.codigo_tipo_tarjeta,
                              descripcion: tipo.descripcion,
                            });
                            setIsUpdateModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setTipoTarjetaToDelete(tipo);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
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

            {/* Modal para agregar tipo de tarjeta */}
            {isAddModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsAddModalOpen(false);
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
                      Agregar Tipo de Tarjeta
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="tipo_tarjeta">
                        Tipo de Tarjeta
                      </label>
                      <input
                        type="text"
                        id="tipo_tarjeta"
                        name="tipo_tarjeta"
                        placeholder="Ejemplo: Visa"
                        value={tipoTarjetaData.tipo_tarjeta}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="codigo_tipo_tarjeta">
                        Código Tipo de Tarjeta
                      </label>
                      <input
                        type="text"
                        id="codigo_tipo_tarjeta"
                        name="codigo_tipo_tarjeta"
                        placeholder="Ejemplo: VIS"
                        value={tipoTarjetaData.codigo_tipo_tarjeta}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="descripcion">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Ejemplo: Tarjeta de crédito internacional"
                        value={tipoTarjetaData.descripcion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal para actualizar tipo de tarjeta */}
            {isUpdateModalOpen && tipoTarjetaToUpdate && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsUpdateModalOpen(false);
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
                      Actualizar Tipo de Tarjeta
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="tipo_tarjeta">
                        Tipo de Tarjeta
                      </label>
                      <input
                        type="text"
                        id="tipo_tarjeta"
                        name="tipo_tarjeta"
                        placeholder="Ejemplo: Visa"
                        value={tipoTarjetaData.tipo_tarjeta}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="codigo_tipo_tarjeta">
                        Código Tipo de Tarjeta
                      </label>
                      <input
                        type="text"
                        id="codigo_tipo_tarjeta"
                        name="codigo_tipo_tarjeta"
                        placeholder="Ejemplo: VIS"
                        value={tipoTarjetaData.codigo_tipo_tarjeta}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="descripcion">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Ejemplo: Tarjeta de crédito internacional"
                        value={tipoTarjetaData.descripcion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsUpdateModalOpen(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal para eliminar tipo de tarjeta */}
            {isDeleteModalOpen && tipoTarjetaToDelete && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDeleteModalOpen(false);
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
                    ¿Estás seguro de que deseas eliminar el tipo de tarjeta {tipoTarjetaToDelete.tipo_tarjeta}?
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
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