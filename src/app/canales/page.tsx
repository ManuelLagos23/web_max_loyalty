'use client';

import { useState, useEffect, useCallback } from 'react';
import NavbarGeneral from '../components/NavbarGeneral';


type Canal = {
  id: number;
  canal: string;
  codigo_canal: string;
};

export default function Canales() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [canalData, setCanalData] = useState({ canal: '', codigo_canal: '' });
  const [canalToUpdate, setCanalToUpdate] = useState<Canal | null>(null);
  const [canalToDelete, setCanalToDelete] = useState<Canal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCanales = useCallback(async () => {
    const response = await fetch(`/api/canales?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setCanales(data);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchCanales();
  }, [fetchCanales]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCanalData({ ...canalData, [name]: value });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('canal', canalData.canal);
    formData.append('codigo_canal', canalData.codigo_canal);

    const response = await fetch('/api/canales', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newCanal = await response.json();
      alert('Canal agregado exitosamente');
      setCanales((prev) => [...prev, newCanal.data]);
      setCanalData({ canal: '', codigo_canal: '' });
      setIsAddModalOpen(false);
      fetchCanales();
    } else {
      alert('Error al agregar el canal');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canalToUpdate) {
      const formData = new FormData();
      formData.append('id', String(canalToUpdate.id));
      formData.append('canal', canalData.canal);
      formData.append('codigo_canal', canalData.codigo_canal);

      const response = await fetch('/api/canales', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedCanal = await response.json();
        alert('Canal actualizado exitosamente');
        setCanales((prev) =>
          prev.map((canal) =>
            canal.id === updatedCanal.data.id ? updatedCanal.data : canal
          )
        );
        setCanalData({ canal: '', codigo_canal: '' });
        setIsUpdateModalOpen(false);
        fetchCanales();
      } else {
        alert('Error al actualizar el canal');
      }
    }
  };

  const handleDelete = async () => {
    if (canalToDelete) {
      const response = await fetch(`/api/canales/${canalToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Canal eliminado exitosamente');
        setCanales((prev) => prev.filter((canal) => canal.id !== canalToDelete.id));
        setIsDeleteModalOpen(false);
        fetchCanales();
      } else {
        alert('Error al eliminar el canal');
      }
    }
  };

  const filteredCanales = canales.filter((canal) =>
    Object.values(canal)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCanales = filteredCanales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCanales.length / itemsPerPage);

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
    <div className="min-h-screen flex">
      <NavbarGeneral />
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105 text-center"
            >
              Gestión de Canales
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Configura los canales disponibles en la aplicación.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Agregar Canal
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar canales..."
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
                <th className="px-4 py-2 text-center">Nombre del Canal</th>
                <th className="px-4 py-2 text-center">Código del Canal</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCanales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2  text-center">
                    No hay canales disponibles
                  </td>
                </tr>
              ) : (
                currentCanales.map((canal, index) => (
                  <tr key={canal.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{canal.canal}</td>
                    <td className="px-4 py-2 text-center">{canal.codigo_canal}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setCanalToUpdate(canal);
                          setCanalData({ canal: canal.canal, codigo_canal: canal.codigo_canal });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setCanalToDelete(canal);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Canal</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="canal">
                      Nombre del Canal
                    </label>
                    <input
                      type="text"
                      id="canal"
                      name="canal"
                      placeholder="Ejemplo: Tienda Física"
                      value={canalData.canal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="codigo_canal">
                      Código del Canal
                    </label>
                    <input
                      type="text"
                      id="codigo_canal"
                      name="codigo_canal"
                      placeholder="Ejemplo: TF001"
                      value={canalData.codigo_canal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && canalToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Canal</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="canal">
                      Nombre del Canal
                    </label>
                    <input
                      type="text"
                      id="canal"
                      name="canal"
                      placeholder="Ejemplo: Tienda Física"
                      value={canalData.canal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="codigo_canal">
                      Código del Canal
                    </label>
                    <input
                      type="text"
                      id="codigo_canal"
                      name="codigo_canal"
                      placeholder="Ejemplo: TF001"
                      value={canalData.codigo_canal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsUpdateModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && canalToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Canal</h2>
                <p className="text-center mb-4">¿Estás seguro de que deseas eliminar el canal {canalToDelete.canal}?</p>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
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