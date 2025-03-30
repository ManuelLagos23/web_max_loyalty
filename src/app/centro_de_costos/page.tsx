'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface CentroCosto {
  id: number;
  nombre_centro_costos: string;
  pais: string;
  estado: string;
  ciudad: string;
  alias: string;
  codigo: string;
}

export default function Costos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [costos, setCostos] = useState<CentroCosto[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre_centro_costos: '',
    pais: '',
    estado: '',
    ciudad: '',
    alias: '',
    codigo: '',
  });

  const [centroCostoSeleccionado, setCentroCostoSeleccionado] = useState<CentroCosto | null>(null);
  const [centroCostoAEliminar, setCentroCostoAEliminar] = useState<CentroCosto | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setCentroCostoSeleccionado(null);
      setFormData({
        id: 0,
        nombre_centro_costos: '',
        pais: '',
        estado: '',
        ciudad: '',
        alias: '',
        codigo: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (centroCosto: CentroCosto) => {
    setCentroCostoAEliminar(centroCosto);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setCentroCostoAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Agregar centro de costos (POST)
  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombre_centro_costos ||
      !formData.pais ||
      !formData.estado ||
      !formData.ciudad ||
      !formData.alias ||
      !formData.codigo
    ) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);

    try {
      const response = await fetch('/api/costos', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Centro de costos agregado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        alert('Error al agregar el centro de costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Editar centro de costos (PUT)
  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.id ||
      !formData.nombre_centro_costos ||
      !formData.pais ||
      !formData.estado ||
      !formData.ciudad ||
      !formData.alias ||
      !formData.codigo
    ) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre_centro_costos', formData.nombre_centro_costos);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('alias', formData.alias);
    formDataToSend.append('codigo', formData.codigo);

    try {
      const response = await fetch('/api/costos', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Centro de costos actualizado exitosamente');
        closePopup();
        fetchCostos();
      } else {
        alert('Error al actualizar el centro de costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Eliminar centro de costos (DELETE)
  const handleDelete = async () => {
    if (!centroCostoAEliminar) return;
    try {
      const response = await fetch(`/api/costos/${centroCostoAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Centro de costos eliminado exitosamente');
        closeDeletePopup();
        fetchCostos();
      } else {
        alert('Error al eliminar el centro de costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchCostos = async () => {
    try {
      const response = await fetch('/api/costos');
      if (response.ok) {
        const data: CentroCosto[] = await response.json();
        setCostos(data);
      } else {
        console.error('Error al obtener los centros de costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleEditar = (centroCosto: CentroCosto) => {
    setCentroCostoSeleccionado(centroCosto);
    setFormData({
      id: centroCosto.id,
      nombre_centro_costos: centroCosto.nombre_centro_costos,
      pais: centroCosto.pais,
      estado: centroCosto.estado,
      ciudad: centroCosto.ciudad,
      alias: centroCosto.alias,
      codigo: centroCosto.codigo,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchCostos();
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de centros de costos</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los centros de costos registrados en la plataforma.
          </p>
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar centro de costos
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Actualizar centro de costos
            </button>
          </div>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre del centro de costos</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
                <th className="px-4 py-2 text-left">Alias</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {costos.length > 0 ? (
                costos.map((centroCosto) => (
                  <tr className="border-b" key={centroCosto.id}>
                    <td className="px-4 py-2">{centroCosto.id}</td>
                    <td className="px-4 py-2">{centroCosto.nombre_centro_costos}</td>
                    <td className="px-4 py-2">{centroCosto.pais}</td>
                    <td className="px-4 py-2">{centroCosto.estado}</td>
                    <td className="px-4 py-2">{centroCosto.ciudad}</td>
                    <td className="px-4 py-2">{centroCosto.alias}</td>
                    <td className="px-4 py-2">{centroCosto.codigo}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(centroCosto)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(centroCosto)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center text-gray-500">
                    No hay centros de costos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal para agregar o editar centro de costos */}
          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 block text-center">
                  {centroCostoSeleccionado ? 'Editar' : 'Agregar'} Centro de Costos
                </h2>
                <form
                  onSubmit={centroCostoSeleccionado ? handleSubmitEditar : handleSubmitAgregar}
                >
                  <div className="mb-4">
                    <label htmlFor="nombre_centro_costos" className="block text-sm font-medium text-gray-700 block text-center">
                      Nombre del centro de costos
                    </label>
                    <input
                      type="text"
                      id="nombre_centro_costos"
                      name="nombre_centro_costos"
                      placeholder='Nombre del centro de costos'
                      value={formData.nombre_centro_costos}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="pais" className="block text-sm font-medium text-gray-700 block text-center">
                      País
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      value={formData.pais}
                      placeholder='País'
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 block text-center">
                          Estado
                        </label>
                        <input
                          type="text"
                          id="estado"
                          name="estado"
                          placeholder='Estado'
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                        />
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 block text-center">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          id="ciudad"
                          name="ciudad"
                          placeholder='Ciudad'
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <label htmlFor="alias" className="block text-sm font-medium text-gray-700 block text-center">
                          Alias
                        </label>
                        <input
                          type="text"
                          id="alias"
                          name="alias"
                          placeholder='Alias'
                          value={formData.alias}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                        />
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 block text-center">
                          Código
                        </label>
                        <input
                          type="text"
                          id="codigo"
                          name="codigo"
                          placeholder='Código'
                          value={formData.codigo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={closePopup}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      {centroCostoSeleccionado ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para eliminar centro de costos */}
          {isDeletePopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4">¿Estás seguro de eliminar?</h2>
                <p className="text-lg mb-4">
  ¿Estás seguro de eliminar el centro de costos &quot;{centroCostoAEliminar?.nombre_centro_costos}&quot;?
</p>

                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
