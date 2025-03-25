'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contraseña: string;
  num_telefono: string;
}

export default function Usuarios() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    email: '',
    contraseña: '',
    foto: null as File | null,
    num_telefono: '',
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setUsuarioSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        email: '',
        contraseña: '',
        foto: null,
        num_telefono: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (usuario: Usuario) => {
    setUsuarioAEliminar(usuario);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setUsuarioAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, foto: e.target.files[0] });
    }
  };

  // Agregar usuario (POST)
  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.contraseña || !formData.num_telefono || !formData.foto) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('contraseña', formData.contraseña);
    formDataToSend.append('foto', formData.foto);
    formDataToSend.append('num_telefono', formData.num_telefono);

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Usuario agregado exitosamente');
        closePopup();
        fetchUsuarios();
      } else {
        alert('Error al agregar el usuario');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Editar usuario (PUT)
  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre || !formData.email || !formData.num_telefono) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('contraseña', formData.contraseña);
    // Si se selecciona una nueva foto se envía; de lo contrario, el backend puede decidir mantener la anterior.
    if (formData.foto) {
      formDataToSend.append('foto', formData.foto);
    }
    formDataToSend.append('num_telefono', formData.num_telefono);

    try {
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Usuario actualizado exitosamente');
        closePopup();
        fetchUsuarios();
      } else {
        alert('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Eliminar usuario (DELETE)
  const handleDelete = async () => {
    if (!usuarioAEliminar) return;
    try {
      const response = await fetch(`/api/usuarios/${usuarioAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Usuario eliminado exitosamente');
        closeDeletePopup();
        fetchUsuarios();
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data: Usuario[] = await response.json();
        setUsuarios(data);
      } else {
        console.error('Error al obtener los usuarios');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: '', 
      foto: null,
      num_telefono: usuario.num_telefono,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de Usuarios</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los usuarios registrados en la plataforma.
          </p>
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar Usuario
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Actualizar Usuarios
            </button>
          </div>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr className="border-b" key={usuario.id}>
                    <td className="px-4 py-2">{usuario.id}</td>
                    <td className="px-4 py-2">{usuario.nombre}</td>
                    <td className="px-4 py-2">{usuario.email}</td>
                    <td className="px-4 py-2">{usuario.num_telefono}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(usuario)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(usuario)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal para agregar o editar usuario */}
          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 ">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {usuarioSeleccionado ? 'Editar Usuario' : 'Agregar Usuario'}
                </h2>
                {usuarioSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    {/* Campo oculto para el ID */}
                    <input type="hidden" name="id" value={formData.id} />
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="password"
                      name="contraseña"
                      placeholder="Contraseña"
                      value={formData.contraseña}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="file"
                      name="foto"
                      onChange={handleFileChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="num_telefono"
                      placeholder="Número de Teléfono"
                      value={formData.num_telefono}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Actualizar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="password"
                      name="contraseña"
                      placeholder="Contraseña"
                      value={formData.contraseña}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="file"
                      name="foto"
                      onChange={handleFileChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="num_telefono"
                      placeholder="Número de Teléfono"
                      value={formData.num_telefono}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <div className="flex justify-end space-x-2">
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

          {/* Modal de confirmación para eliminar usuario */}
          {isDeletePopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 ">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                ¿Estás seguro que deseas eliminar el usuario &apos;{usuarioAEliminar?.nombre}&apos;?
                </p>
                <div className="flex justify-end space-x-2">
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
