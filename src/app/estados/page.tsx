'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SectionNavbar from '../components/SectionNavbar';

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

  useEffect(() => {
    const fetchEstados = async () => {
      const response = await fetch('/api/estados');
      if (response.ok) {
        const data = await response.json();
        setEstados(data);
      }
    };
    fetchEstados();
  }, []);

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
      } else {
        alert('Error al eliminar el estado');
      }
    }
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-full p-8">
          <h1 className="text-4xl font-semibold mb-4">Estados</h1>
          <p className="text-lg text-gray-700 mb-4">Configura los estados disponibles en la aplicación.</p>

          <SectionNavbar />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar estado
          </button>

          <table className="mt-6 w-full table-auto border-collapse  border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 ">ID</th>
                <th className="px-4 py-2 ">Nombre del Estado</th>
                <th className="px-4 py-2 ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 border text-center">No hay estados disponibles</td>
                </tr>
              ) : (
                estados.map((estado, index) => (
                  <tr key={estado.id}>
                    <td className="px-4 py-2  text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{estado.estado}</td>
                    <td className="px-4 py-2 text-center ">
                      <button
                        onClick={() => {
                          setEstadoToUpdate(estado);
                          setEstadoData({ estado: estado.estado });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setEstadoToDelete(estado);
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

          {/* Modal para agregar estado */}
          {isAddModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Agregar Estado</h3>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="estado">
                      Nombre del Estado
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={estadoData.estado}
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

          {/* Modal para actualizar estado */}
          {isUpdateModalOpen && estadoToUpdate && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Actualizar Estado</h3>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="estado">
                      Nombre del Estado
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={estadoData.estado}
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

          {/* Modal para eliminar estado */}
          {isDeleteModalOpen && estadoToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar Estado</h3>
                <p>¿Estás seguro de que deseas eliminar el estado {estadoToDelete.estado}?</p>
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
