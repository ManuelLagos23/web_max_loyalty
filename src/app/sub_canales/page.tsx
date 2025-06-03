'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';




type Subcanal = {
  id: number;
  subcanal: string;
  subcanal_codigo: string;
  canal_id: number;
  canal_nombre: string;
};

type Canal = {
  id: number;
  canal: string;
};

export default function Subcanales() {
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subcanalData, setSubcanalData] = useState({ subcanal: '', subcanal_codigo: '', canal_id: '' });
  const [subcanalToUpdate, setSubcanalToUpdate] = useState<Subcanal | null>(null);
  const [subcanalToDelete, setSubcanalToDelete] = useState<Subcanal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pathname = usePathname();
  const itemsPerPage = 10;

  const fetchSubcanales = useCallback(async () => {
    const response = await fetch(`/api/subcanales?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setSubcanales(data);
    }
  }, [currentPage, itemsPerPage]);

  const fetchCanales = async () => {
    const response = await fetch('/api/canales');
    if (response.ok) {
      const data = await response.json();
      setCanales(data);
    }
  };

  useEffect(() => {
    fetchSubcanales();
    fetchCanales();
  }, [fetchSubcanales]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubcanalData({ ...subcanalData, [name]: value });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('subcanal', subcanalData.subcanal);
    formData.append('subcanal_codigo', subcanalData.subcanal_codigo);
    formData.append('canal_id', subcanalData.canal_id);

    const response = await fetch('/api/subcanales', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newSubcanal = await response.json();
      alert('Subcanal agregado exitosamente');
      setSubcanales((prev) => [...prev, newSubcanal.data]);
      setSubcanalData({ subcanal: '', subcanal_codigo: '', canal_id: '' });
      setIsAddModalOpen(false);
      fetchSubcanales();
    } else {
      alert('Error al agregar el subcanal');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subcanalToUpdate) {
      const formData = new FormData();
      formData.append('id', String(subcanalToUpdate.id));
      formData.append('subcanal', subcanalData.subcanal);
      formData.append('subcanal_codigo', subcanalData.subcanal_codigo);
      formData.append('canal_id', subcanalData.canal_id);

      const response = await fetch('/api/subcanales', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedSubcanal = await response.json();
        alert('Subcanal actualizado exitosamente');
        setSubcanales((prev) =>
          prev.map((subcanal) =>
            subcanal.id === updatedSubcanal.data.id ? updatedSubcanal.data : subcanal
          )
        );
        setSubcanalData({ subcanal: '', subcanal_codigo: '', canal_id: '' });
        setIsUpdateModalOpen(false);
        fetchSubcanales();
      } else {
        alert('Error al actualizar el subcanal');
      }
    }
  };

  const handleDelete = async () => {
    if (subcanalToDelete) {
      const response = await fetch(`/api/subcanales/${subcanalToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Subcanal eliminado exitosamente');
        setSubcanales((prev) => prev.filter((subcanal) => subcanal.id !== subcanalToDelete.id));
        setIsDeleteModalOpen(false);
        fetchSubcanales();
      } else {
        alert('Error al eliminar el subcanal');
      }
    }
  };

  const filteredSubcanales = subcanales.filter((subcanal) =>
    Object.values(subcanal)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubcanales = filteredSubcanales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubcanales.length / itemsPerPage);

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


  const canalesRoutes = [
    { name: 'Canal', href: '/canales' },
    { name: 'Subcanales', href: '/sub_canales' },


  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex">
      <Navbar />
      <div className="flex-1 flex flex-col">

        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Subcanales
            </h1>

            <nav className="flex justify-center space-x-4">
              {canalesRoutes.map((canal) => {
                const isActive = pathname === canal.href;
                return (
                  <Link key={canal.name} href={canal.href}>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                        }`}
                    >
                      {canal.name}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Agregar Subcanal
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar subcanales..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="mt-6 w-full table-auto border-collapse bg-gray-100 border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-center">Nombre del Subcanal</th>
                <th className="px-4 py-2 text-center">Código del Subcanal</th>
                <th className="px-4 py-2 text-center">Canal</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentSubcanales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center">
                    No hay subcanales disponibles
                  </td>
                </tr>
              ) : (
                currentSubcanales.map((subcanal, index) => (
                  <tr key={subcanal.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{subcanal.subcanal}</td>
                    <td className="px-4 py-2 text-center">{subcanal.subcanal_codigo}</td>
                    <td className="px-4 py-2 text-center">{subcanal.canal_nombre}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setSubcanalToUpdate(subcanal);
                          setSubcanalData({
                            subcanal: subcanal.subcanal,
                            subcanal_codigo: subcanal.subcanal_codigo,
                            canal_id: String(subcanal.canal_id),
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSubcanalToDelete(subcanal);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
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
              className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
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
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              Siguiente
            </button>
          </div>
          {isAddModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAddModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Subcanal</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="subcanal">
                      Nombre del Subcanal
                    </label>
                    <input
                      type="text"
                      id="subcanal"
                      name="subcanal"
                      placeholder="Ejemplo: Punto de Venta"
                      value={subcanalData.subcanal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="subcanal_codigo">
                      Código del Subcanal
                    </label>
                    <input
                      type="text"
                      id="subcanal_codigo"
                      name="subcanal_codigo"
                      placeholder="Ejemplo: PV001"
                      value={subcanalData.subcanal_codigo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="canal_id">
                      Canal
                    </label>
                    <select
                      id="canal_id"
                      name="canal_id"
                      value={subcanalData.canal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value="">Seleccione un canal</option>
                      {canales.map((canal) => (
                        <option key={canal.id} value={canal.id}>
                          {canal.canal}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && subcanalToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Subcanal</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="subcanal">
                      Nombre del Subcanal
                    </label>
                    <input
                      type="text"
                      id="subcanal"
                      name="subcanal"
                      placeholder="Ejemplo: Punto de Venta"
                      value={subcanalData.subcanal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="subcanal_codigo">
                      Código del Subcanal
                    </label>
                    <input
                      type="text"
                      id="subcanal_codigo"
                      name="subcanal_codigo"
                      placeholder="Ejemplo: PV001"
                      value={subcanalData.subcanal_codigo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-center" htmlFor="canal_id">
                      Canal
                    </label>
                    <select
                      id="canal_id"
                      name="canal_id"
                      value={subcanalData.canal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value="">Seleccione un canal</option>
                      {canales.map((canal) => (
                        <option key={canal.id} value={canal.id}>
                          {canal.canal}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsUpdateModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && subcanalToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Subcanal</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar el subcanal {subcanalToDelete.subcanal}?
                </p>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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