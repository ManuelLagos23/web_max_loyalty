'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchPaises = async () => {
      const response = await fetch('/api/paises');
      if (response.ok) {
        const data = await response.json();
        setPaises(data);
      }
    };
    fetchPaises();
  }, []);

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
      } else {
        alert('Error al eliminar el país');
      }
    }
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-full p-8">
          <h1 className="text-4xl font-semibold mb-4">Paises</h1>
          <p className="text-lg text-gray-700 mb-4">Configura los países disponibles en la aplicación.</p>

          <SectionNavbar />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar país
          </button>

          <table className="mt-6 w-full table-auto border-collapse  border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 ">ID</th>
                <th className="px-4 py-2 ">Nombre del País</th>
                <th className="px-4 py-2 ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paises.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 border text-center">No hay países disponibles</td>
                </tr>
              ) : (
                paises.map((pais, index) => (
                  <tr key={pais.id}>
                    <td className="px-4 py-2  text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{pais.pais}</td>
                    <td className="px-4 py-2 text-center ">
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

          {/* Modal para agregar país */}
          {isAddModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
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
                  <div className="flex justify-end space-x-2">
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

          {/* Modal para actualizar país */}
          {isUpdateModalOpen && paisToUpdate && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
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
                  <div className="flex justify-end space-x-2">
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

          {/* Modal para eliminar país */}
          {isDeleteModalOpen && paisToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar País</h3>
                <p>¿Estás seguro de que deseas eliminar el país {paisToDelete.pais}?</p>
                <div className="flex justify-end space-x-2">
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
