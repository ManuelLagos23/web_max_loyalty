'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

interface Miembro {
  id: number;
  nombre: string;
  user: string;
  email: string;
  establecimiento: string;
  password: string;
}

interface CentroCosto {
  id: number;
  nombre_centro_costos: string;
}

export default function Miembros() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [centrosCostos, setCentrosCostos] = useState<CentroCosto[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    user: '',
    email: '',
    establecimiento: '',
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<Miembro | null>(null);
  const [miembroAEliminar, setMiembroAEliminar] = useState<Miembro | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setMiembroSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        user: '',
        email: '',
        establecimiento: '',
        password: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const openDeletePopup = (miembro: Miembro) => {
    setMiembroAEliminar(miembro);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setMiembroAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.user || !formData.email || !formData.establecimiento || !formData.password) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('user', formData.user);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('establecimiento', formData.establecimiento);
    formDataToSend.append('password', formData.password);

    try {
      const response = await fetch('/api/miembros', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Miembro agregado exitosamente');
        closePopup();
        fetchMiembros();
      } else {
        alert('Error al agregar el miembro');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre || !formData.user || !formData.email || !formData.establecimiento) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('user', formData.user);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('establecimiento', formData.establecimiento);
    formDataToSend.append('password', formData.password);

    try {
      const response = await fetch('/api/miembros', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Miembro actualizado exitosamente');
        closePopup();
        fetchMiembros();
      } else {
        alert('Error al actualizar el miembro');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!miembroAEliminar) return;
    try {
      const response = await fetch(`/api/miembros/${miembroAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Miembro eliminado exitosamente');
        closeDeletePopup();
        fetchMiembros();
      } else {
        alert('Error al eliminar el miembro');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchMiembros = useCallback(async () => {
    try {
      const response = await fetch(`/api/miembros?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data: Miembro[] = await response.json();
        setMiembros(data);
      } else {
        console.error('Error al obtener los miembros');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchCentrosCostos = useCallback(async () => {
    try {
      const response = await fetch('/api/costos');
      if (response.ok) {
        const data: CentroCosto[] = await response.json();
        setCentrosCostos(data);
      } else {
        console.error('Error al obtener los centros de costos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const handleEditar = (miembro: Miembro) => {
    setMiembroSeleccionado(miembro);
    setFormData({
      id: miembro.id,
      nombre: miembro.nombre,
      user: miembro.user,
      email: miembro.email,
      establecimiento: miembro.establecimiento,
      password: '',
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchMiembros();
    fetchCentrosCostos(); 
  }, [fetchMiembros, fetchCentrosCostos]);

  const filteredMiembros = miembros.filter((miembro) =>
    miembro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    miembro.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    miembro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    miembro.establecimiento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMiembros = filteredMiembros.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMiembros.length / itemsPerPage);

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
        <main className="w-4/5 p-8">
        <div className="space-y-6">


<h1 
className="text-4xl font-bold text-gray-900 mb-4 tracking-tight 
     bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
     transition-all duration-300 hover:scale-105 text-center"
>
Gestión de Miembros
</h1>
<p 
className="text-center text-black leading-relaxed max-w-2xl
     p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
>

Administra los miembros registrados en el APK de Max Loyalty Mobile.
</p>
</div>


       
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar Miembro
            </button>
        
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, usuario, email o establecimiento..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <table className="min-w-full bg-white table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Establecimiento</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMiembros.length > 0 ? (
                currentMiembros.map((miembro, index) => (
                  <tr className="hover:bg-gray-50" key={miembro.id}>
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2">{miembro.nombre}</td>
                    <td className="px-4 py-2">{miembro.user}</td>
                    <td className="px-4 py-2">{miembro.email}</td>
                    <td className="px-4 py-2">{miembro.establecimiento}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(miembro)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(miembro)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                    No hay miembros disponibles.
                  </td>
                </tr>
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

          {isPopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md border-4 border-black-500"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3  border-1" >
              <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1  after:w-12 after:mx-auto after:mt-2">
                  {miembroSeleccionado ? 'Editar Miembro' : 'Agregar Miembro'}
                </h2>
                </div>

                {miembroSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label className="block text-center" htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Grupo GSIE"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="user">User:</label>
                    <input
                      type="text"
                      name="user"
                      placeholder="gsie@hn"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="email">Email:</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ejemplo: grupogsie@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="establecimiento">Establecimiento:</label>
                    <select
                      name="establecimiento"
                      value={formData.establecimiento}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    >
                      <option value="">Seleccione un establecimiento</option>
                      {centrosCostos.map((centro) => (
                        <option key={centro.id} value={centro.nombre_centro_costos}>
                          {centro.nombre_centro_costos}
                        </option>
                      ))}
                    </select>
                    <label className="block text-center" htmlFor="password">Password:</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Ejemplo: Tu contraseña segura"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <div className="flex justify-between">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <label className="block text-center" htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Grupo GSIE"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="user">User:</label>
                    <input
                      type="text"
                      name="user"
                      placeholder="Ejemplo: gsie@hn"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="email">Email:</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ejemplo: grupogsie@hn"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="establecimiento">Establecimiento:</label>
                    <select
                      name="establecimiento"
                      value={formData.establecimiento}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    >
                      <option value="">Seleccione un establecimiento</option>
                      {centrosCostos.map((centro) => (
                        <option key={centro.id} value={centro.nombre_centro_costos}>
                          {centro.nombre_centro_costos}
                        </option>
                      ))}
                    </select>
                    <label className="block text-center" htmlFor="password">Password:</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Ejemplo: Tu contraseña segura"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <div className="flex justify-between">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {isDeletePopupOpen && miembroAEliminar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md border-black"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <h2 className="text-2xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro que deseas eliminar el miembro {miembroAEliminar.nombre}?
                </p>
                <div className="flex justify-between">
                  <button onClick={closeDeletePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
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