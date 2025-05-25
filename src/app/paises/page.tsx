'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';


type Pais = {
  id: number;
  pais: string;
};

export default function Paises() {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paisData, setPaisData] = useState({ pais: '' });
  const [paisToUpdate, setPaisToUpdate] = useState<Pais | null>(null);
  const [paisToDelete, setPaisToDelete] = useState<Pais | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPaises = useCallback(async () => {
    const response = await fetch(`/api/paises?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setPaises(data);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchPaises();
  }, [fetchPaises]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPaisData({ pais: value });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pais', paisData.pais);

    const response = await fetch('/api/paises', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newPais = await response.json();
      alert('País agregado exitosamente');
      setPaises((prev) => [...prev, newPais.data]);
      setPaisData({ pais: '' });
      setIsAddModalOpen(false);
      fetchPaises();
    } else {
      alert('Error al agregar el país');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paisToUpdate) {
      const formData = new FormData();
      formData.append('id', String(paisToUpdate.id));
      formData.append('pais', paisData.pais);

      const response = await fetch('/api/paises', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedPais = await response.json();
        alert('País actualizado exitosamente');
        setPaises((prev) =>
          prev.map((pais) =>
            pais.id === updatedPais.data.id ? updatedPais.data : pais
          )
        );
        setPaisData({ pais: '' });
        setIsUpdateModalOpen(false);
        fetchPaises();
      } else {
        alert('Error al actualizar el país');
      }
    }
  };

  const handleDelete = async () => {
    if (paisToDelete) {
      const response = await fetch(`/api/paises/${paisToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('País eliminado exitosamente');
        setPaises((prev) => prev.filter((pais) => pais.id !== paisToDelete.id));
        setIsDeleteModalOpen(false);
        fetchPaises();
      } else {
        alert('Error al eliminar el país');
      }
    }
  };

  const filteredPaises = paises.filter((pais) =>
    Object.values(pais)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPaises = filteredPaises.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPaises.length / itemsPerPage);

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
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Países
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Administra los países registrados en la plataforma con facilidad y seguridad.
              </p>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar País
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre del país..."
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
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre del País</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPaises.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                      No hay países disponibles
                    </td>
                  </tr>
                ) : (
                  currentPaises.map((pais, index) => (
                    <tr key={pais.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{pais.pais}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setPaisToUpdate(pais);
                            setPaisData({ pais: pais.pais });
                            setIsUpdateModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setPaisToDelete(pais);
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

            {/* Modal para agregar país */}
            {isAddModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsAddModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Agregar País
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="pais">
                        Nombre del País
                      </label>
                      <input
                        type="text"
                        id="pais"
                        name="pais"
                        placeholder="Ejemplo: Honduras"
                        value={paisData.pais}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
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

            {/* Modal para actualizar país */}
            {isUpdateModalOpen && paisToUpdate && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsUpdateModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Actualizar País
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="mb-4">
                      <label className="block text-center font-medium text-gray-700 mb-2" htmlFor="pais">
                        Nombre del País
                      </label>
                      <input
                        type="text"
                        id="pais"
                        name="pais"
                        placeholder="Ejemplo: Honduras"
                        value={paisData.pais}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
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

            {/* Modal para eliminar país */}
            {isDeleteModalOpen && paisToDelete && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDeleteModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar el país {paisToDelete.pais}?
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