'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type Estado = {
  id: number;
  estado: string;
};

export default function Estados() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [estadoData, setEstadoData] = useState({ estado: '' });
  const [estadoToUpdate, setEstadoToUpdate] = useState<Estado | null>(null);
  const [estadoToDelete, setEstadoToDelete] = useState<Estado | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pathname = usePathname();

  const fetchEstados = useCallback(async () => {
    const response = await fetch(`/api/estados?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setEstados(data);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchEstados();
  }, [fetchEstados]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEstadoData({ estado: value });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('estado', estadoData.estado);

    const response = await fetch('/api/estados', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newEstado = await response.json();
      alert('Estado agregado exitosamente');
      setEstados((prev) => [...prev, newEstado.data]);
      setEstadoData({ estado: '' });
      setIsAddModalOpen(false);
      fetchEstados();
    } else {
      alert('Error al agregar el estado');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estadoToUpdate) {
      const formData = new FormData();
      formData.append('id', String(estadoToUpdate.id));
      formData.append('estado', estadoData.estado);

      const response = await fetch('/api/estados', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedEstado = await response.json();
        alert('Estado actualizado exitosamente');
        setEstados((prev) =>
          prev.map((estado) =>
            estado.id === updatedEstado.data.id ? updatedEstado.data : estado
          )
        );
        setEstadoData({ estado: '' });
        setIsUpdateModalOpen(false);
        fetchEstados();
      } else {
        alert('Error al actualizar el estado');
      }
    }
  };

  const handleDelete = async () => {
    if (estadoToDelete) {
      const response = await fetch(`/api/estados/${estadoToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Estado eliminado exitosamente');
        setEstados((prev) => prev.filter((estado) => estado.id !== estadoToDelete.id));
        setIsDeleteModalOpen(false);
        fetchEstados();
      } else {
        alert('Error al eliminar el estado');
      }
    }
  };

  const filteredEstados = estados.filter((estado) =>
    Object.values(estado)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEstados = filteredEstados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEstados.length / itemsPerPage);

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

  const regionRoutes = [
    { name: 'Países', href: '/paises' },
    { name: 'Departamentos', href: '/estados' },
    { name: 'Monedas', href: '/monedas' },

  ];


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
                Gestión de Departamentos
              </h1>


              <nav className="flex justify-center space-x-4">
                {regionRoutes.map((reporte) => {
                  const isActive = pathname === reporte.href;
                  return (
                    <Link key={reporte.name} href={reporte.href}>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                          }`}
                      >
                        {reporte.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>

            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Departamento
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre del estado..."
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
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre del Departamento</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentEstados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                      No hay departamentos disponibles
                    </td>
                  </tr>
                ) : (
                  currentEstados.map((estado, index) => (
                    <tr key={estado.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{estado.estado}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setEstadoToUpdate(estado);
                            setEstadoData({ estado: estado.estado });
                            setIsUpdateModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setEstadoToDelete(estado);
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

            {/* Modal para agregar estado */}
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
                      Agregar Departamento
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="mb-4">
                      <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="estado">
                        Nombre del Departamento
                      </label>
                      <input
                        type="text"
                        id="estado"
                        name="estado"
                        placeholder="Ejemplo: El Paraíso"
                        value={estadoData.estado}
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

            {/* Modal para actualizar estado */}
            {isUpdateModalOpen && estadoToUpdate && (
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
                      Actualizar Departamento
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="mb-4">
                      <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="estado">
                        Nombre del Departamento
                      </label>
                      <input
                        type="text"
                        id="estado"
                        name="estado"
                        placeholder="Ejemplo: El Paraíso"
                        value={estadoData.estado}
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

            {/* Modal para eliminar estado */}
            {isDeleteModalOpen && estadoToDelete && (
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
                    ¿Estás seguro de que deseas eliminar el departamento {estadoToDelete.estado}?
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