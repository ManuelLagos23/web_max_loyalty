'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SectionNavbar from '../components/SectionNavbar';

type Moneda = {
  id: number;
  moneda: string;
};

export default function Monedas() {
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [monedaData, setMonedaData] = useState({ moneda: '' });
  const [monedaToUpdate, setMonedaToUpdate] = useState<Moneda | null>(null);
  const [monedaToDelete, setMonedaToDelete] = useState<Moneda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchMonedas = useCallback(async () => {
    const response = await fetch(`/api/monedas?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setMonedas(data);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchMonedas();
  }, [fetchMonedas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMonedaData({ moneda: value });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('moneda', monedaData.moneda);

    const response = await fetch('/api/monedas', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newMoneda = await response.json();
      alert('Moneda agregada exitosamente');
      setMonedas((prev) => [...prev, newMoneda.data]);
      setMonedaData({ moneda: '' });
      setIsAddModalOpen(false);
      fetchMonedas();
    } else {
      alert('Error al agregar la moneda');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monedaToUpdate) {
      const formData = new FormData();
      formData.append('id', String(monedaToUpdate.id));
      formData.append('moneda', monedaData.moneda);

      const response = await fetch('/api/monedas', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedMoneda = await response.json();
        alert('Moneda actualizada exitosamente');
        setMonedas((prev) =>
          prev.map((moneda) =>
            moneda.id === updatedMoneda.data.id ? updatedMoneda.data : moneda
          )
        );
        setMonedaData({ moneda: '' });
        setIsUpdateModalOpen(false);
        fetchMonedas();
      } else {
        alert('Error al actualizar la moneda');
      }
    }
  };

  const handleDelete = async () => {
    if (monedaToDelete) {
      const response = await fetch(`/api/monedas/${monedaToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Moneda eliminada exitosamente');
        setMonedas((prev) => prev.filter((moneda) => moneda.id !== monedaToDelete.id));
        setIsDeleteModalOpen(false);
        fetchMonedas();
      } else {
        alert('Error al eliminar la moneda');
      }
    }
  };

  const filteredMonedas = monedas.filter((moneda) =>
    Object.values(moneda)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMonedas = filteredMonedas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMonedas.length / itemsPerPage);

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
Gestión de Monedas
</h1>
<p 
className="text-center text-black leading-relaxed max-w-2xl
p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
>

Configura las monedas disponibles en la aplicación.
</p>
</div>

            <div className="flex justify-between mb-4">

            <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            Agregar moneda
            </button>

            </div>

          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar monedas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <table className="mt-6 w-full table-auto border-collapse bg-white border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Nombre de la Moneda</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMonedas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 border text-center">
                    No hay monedas disponibles
                  </td>
                </tr>
              ) : (
                currentMonedas.map((moneda, index) => (
                  <tr key={moneda.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{moneda.moneda}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setMonedaToUpdate(moneda);
                          setMonedaData({ moneda: moneda.moneda });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setMonedaToDelete(moneda);
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
              <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2">
                  Agregar Moneda
                  </h2>
                  </div>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-center font-medium mb-2" htmlFor="moneda">
                      Nombre de la Moneda
                    </label>
                    <input
                      type="text"
                      id="moneda"
                      name="moneda"
                      placeholder="Ejemplo: Lempiras"
                      value={monedaData.moneda}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md block text-center "
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

       
          {isUpdateModalOpen && monedaToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg">
              <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2">
                  Actualizar Moneda

                </h2>
                </div>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-center font-medium mb-2" htmlFor="moneda">
                      Nombre de la Moneda
                    </label>
                    <input
                      type="text"
                      id="moneda"
                      name="moneda"
                       placeholder="Ejemplo: Lempiras"
                      value={monedaData.moneda}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md block text-center"
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

       
          {isDeleteModalOpen && monedaToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar Moneda</h3>
                <p>¿Estás seguro de que deseas eliminar la moneda {monedaToDelete.moneda}?</p>
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