'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

// Tipo para los datos crudos de la API


type TipoCombustible = {
  id: number;
  name: string;
  code: string; // Campo para el código
};

export default function TiposCombustible() {
  const [tiposCombustible, setTiposCombustible] = useState<TipoCombustible[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tipoCombustibleData, setTipoCombustibleData] = useState({ name: '', code: '' }); // Eliminamos udm_id
  const [tipoCombustibleToUpdate, setTipoCombustibleToUpdate] = useState<TipoCombustible | null>(null);
  const [tipoCombustibleToDelete, setTipoCombustibleToDelete] = useState<TipoCombustible | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTiposCombustible = useCallback(async () => {
    try {
      const response = await fetch(`/api/tipos_combustible?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setTiposCombustible(result.data);
        } else {
          console.error('TiposCombustible data is not an array:', result);
          setTiposCombustible([]);
        }
      } else {
        console.error('Error fetching TiposCombustible:', response.status, await response.text());
        setTiposCombustible([]);
      }
    } catch (error) {
      console.error('Error in fetchTiposCombustible:', error);
      setTiposCombustible([]);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchTiposCombustible();
  }, [fetchTiposCombustible]);

  useEffect(() => {}, [tiposCombustible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTipoCombustibleData({
      ...tipoCombustibleData,
      [name]: value,
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoCombustibleData.name || !tipoCombustibleData.code) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formData = new FormData();
    formData.append('name', tipoCombustibleData.name);
    formData.append('code', tipoCombustibleData.code);

    const response = await fetch('/api/tipos_combustible', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newTipoCombustible = await response.json();
      alert('Tipo de combustible agregado exitosamente');
      setTiposCombustible((prev) => [...prev, newTipoCombustible.data]);
      setTipoCombustibleData({ name: '', code: '' });
      setIsAddModalOpen(false);
      fetchTiposCombustible();
    } else {
      alert('Error al agregar el tipo de combustible');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoCombustibleToUpdate) {
      if (!tipoCombustibleData.name || !tipoCombustibleData.code) {
        alert('Por favor, complete todos los campos.');
        return;
      }
      const formData = new FormData();
      formData.append('id', String(tipoCombustibleToUpdate.id));
      formData.append('name', tipoCombustibleData.name);
      formData.append('code', tipoCombustibleData.code);

      const response = await fetch('/api/tipos_combustible', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedTipoCombustible = await response.json();
        alert('Tipo de combustible actualizado exitosamente');
        setTiposCombustible((prev) =>
          prev.map((tipo) =>
            tipo.id === updatedTipoCombustible.data.id ? updatedTipoCombustible.data : tipo
          )
        );
        setTipoCombustibleData({ name: '', code: '' });
        setIsUpdateModalOpen(false);
        fetchTiposCombustible();
      } else {
        alert('Error al actualizar el tipo de combustible');
      }
    }
  };

  const handleDelete = async () => {
    if (tipoCombustibleToDelete) {
      const response = await fetch(`/api/tipos_combustible/${tipoCombustibleToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tipo de combustible eliminado exitosamente');
        setTiposCombustible((prev) => prev.filter((tipo) => tipo.id !== tipoCombustibleToDelete.id));
        setIsDeleteModalOpen(false);
        fetchTiposCombustible();
      } else {
        alert('Error al eliminar el tipo de combustible');
      }
    }
  };

  const filteredTiposCombustible = tiposCombustible.filter((tipo) =>
    Object.values(tipo)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTiposCombustible = filteredTiposCombustible.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTiposCombustible.length / itemsPerPage);

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
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Tipos de Combustible
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Configura los tipos de combustible disponibles en la aplicación.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Agregar Tipo de Combustible
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar tipos de combustible..."
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
                <th className="px-4 py-2 text-center">Código</th>
                <th className="px-4 py-2 text-center">Nombre del Tipo de Combustible</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTiposCombustible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center">
                    No hay tipos de combustible disponibles
                  </td>
                </tr>
              ) : (
                currentTiposCombustible.map((tipo, index) => (
                  <tr key={tipo.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{tipo.code}</td>
                    <td className="px-4 py-2 text-center">{tipo.name}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setTipoCombustibleToUpdate(tipo);
                          setTipoCombustibleData({ name: tipo.name, code: tipo.code });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setTipoCombustibleToDelete(tipo);
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
              className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Tipo de Combustible</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="code">
                      Código del Tipo de Combustible
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      placeholder="Ejemplo: GAS91"
                      value={tipoCombustibleData.code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="name">
                      Nombre del Tipo de Combustible
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ejemplo: Gasolina"
                      value={tipoCombustibleData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
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
          {isUpdateModalOpen && tipoCombustibleToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Tipo de Combustible</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="code">
                      Código del Tipo de Combustible
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      placeholder="Ejemplo: GAS91"
                      value={tipoCombustibleData.code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="name">
                      Nombre del Tipo de Combustible
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ejemplo: Gasolina"
                      value={tipoCombustibleData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
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
          {isDeleteModalOpen && tipoCombustibleToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Tipo de Combustible</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar el tipo de combustible {tipoCombustibleToDelete.name}?
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