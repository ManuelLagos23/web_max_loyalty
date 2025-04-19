'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SectionNavbar from '../components/SectionNavbar';

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
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-full p-8">
          <SectionNavbar />
          <div className="space-y-6">


<h1 
className="text-4xl font-bold text-gray-900 mb-4 tracking-tight 
bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
transition-all duration-300 hover:scale-105 text-center"
>
Gestión de Países
</h1>
<p 
className="text-center text-black leading-relaxed max-w-2xl
p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
>

Configura los países disponibles en la aplicación.
</p>
</div>


<div className="flex justify-between mb-4">
<button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar país
          </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar países..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

       
          <table className="mt-6 w-full table-auto border-collapse border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Nombre del País</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPaises.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 border text-center">
                    No hay países disponibles
                  </td>
                </tr>
              ) : (
                currentPaises.map((pais, index) => (
                  <tr key={pais.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{pais.pais}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setPaisToUpdate(pais);
                          setPaisData({ pais: pais.pais });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setPaisToDelete(pais);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded"
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
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Agregar País</h3>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="pais">
                      Nombre del País
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      value={paisData.pais}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
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

         
          {isUpdateModalOpen && paisToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Actualizar País</h3>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="pais">
                      Nombre del País
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      value={paisData.pais}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
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

       
          {isDeleteModalOpen && paisToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar País</h3>
                <p>¿Estás seguro de que deseas eliminar el país {paisToDelete.pais}?</p>
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