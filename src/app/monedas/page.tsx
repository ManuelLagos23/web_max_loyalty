'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchMonedas = async () => {
      const response = await fetch('/api/monedas');
      if (response.ok) {
        const data = await response.json();
        setMonedas(data);
      }
    };
    fetchMonedas();
  }, []);

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
      } else {
        alert('Error al eliminar la moneda');
      }
    }
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-full p-8">
          <h1 className="text-4xl font-semibold mb-4">Monedas</h1>
          <p className="text-lg text-gray-700 mb-4">Configura las monedas disponibles en la aplicación.</p>

          <SectionNavbar />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar moneda
          </button>

          <table className="mt-6 w-full table-auto border-collapse  border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 ">ID</th>
                <th className="px-4 py-2 ">Nombre de la Moneda</th>
                <th className="px-4 py-2 ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {monedas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 border text-center">No hay monedas disponibles</td>
                </tr>
              ) : (
                monedas.map((moneda, index) => (
                  <tr key={moneda.id}>
                    <td className="px-4 py-2  text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{moneda.moneda}</td>
                    <td className="px-4 py-2 text-center ">
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

          {/* Modal para agregar moneda */}
          {isAddModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Agregar Moneda</h3>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="moneda">
                      Nombre de la Moneda
                    </label>
                    <input
                      type="text"
                      id="moneda"
                      name="moneda"
                      value={monedaData.moneda}
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

          {/* Modal para actualizar moneda */}
          {isUpdateModalOpen && monedaToUpdate && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Actualizar Moneda</h3>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="moneda">
                      Nombre de la Moneda
                    </label>
                    <input
                      type="text"
                      id="moneda"
                      name="moneda"
                      value={monedaData.moneda}
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

          {/* Modal para eliminar moneda */}
          {isDeleteModalOpen && monedaToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar Moneda</h3>
                <p>¿Estás seguro de que deseas eliminar la moneda {monedaToDelete.moneda}?</p>
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
