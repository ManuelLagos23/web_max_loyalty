'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Añadida la importación de Image
import Navbar from '../components/Navbar';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contraseña: string;
  num_telefono: string;
  img?: string; // Base64 string for the image
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
    img: '', // Base64 string for display
    num_telefono: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
        img: '',
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          foto: file,
          img: reader.result as string, // Vista previa de la nueva imagen
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`/api/usuarios?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data: Usuario[] = await response.json();
        setUsuarios(data);
      } else {
        console.error('Error al obtener los usuarios');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: '',
      foto: null,
      img: usuario.img ? `data:image/jpeg;base64,${usuario.img}` : '', // Cargar imagen Base64
      num_telefono: usuario.num_telefono,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.num_telefono.includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

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
              Gestión de Usuarios
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
                         p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los usuarios registrados en la plataforma con facilidad y seguridad.
            </p>
          </div>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 m-2"
            >
              Agregar Usuario
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
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
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsuarios.length > 0 ? (
                currentUsuarios.map((usuario, index) => (
                  <tr className="hover:bg-gray-50" key={usuario.id}>
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
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
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2">
                    {usuarioSeleccionado ? 'Editar Usuario' : 'Agregar Usuario'}
                  </h2>
                </div>

                {usuarioSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label className="block text-center" htmlFor="nombre">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Juan Pérez"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ejemplo: juanperez@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="contraseña">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="contraseña"
                      placeholder="Ejemplo: Contraseña_Segura"
                      value={formData.contraseña}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="foto">
                      Foto
                    </label>
                    {formData.img ? (
                      <div className="mb-2 flex justify-center">
                        <Image
                          src={formData.img}
                          alt="Foto actual"
                          width={128} // 32rem = 128px
                          height={128} // 32rem = 128px
                          className="object-cover rounded border border-gray-300"
                          onError={() => console.error('Error al cargar la imagen')}
                        />
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 mb-2">No hay foto cargada</p>
                    )}
                    <input
                      type="file"
                      name="foto"
                      onChange={handleFileChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      accept="image/*"
                    />
                    <label className="block text-center" htmlFor="num_telefono">
                      Número de teléfono
                    </label>
                    <input
                      type="number"
                      name="num_telefono"
                      placeholder="Ejemplo: 8888-8888"
                      value={formData.num_telefono}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <label className="block text-center" htmlFor="nombre">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ejemplo: Juan Pérez"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      autoFocus
                    />
                    <label className="block text-center" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ejemplo: juanperez@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="contraseña">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="contraseña"
                      placeholder="Ejemplo: Contraseña_Segura"
                      value={formData.contraseña}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <label className="block text-center" htmlFor="foto">
                      Foto
                    </label>
                    <input
                      type="file"
                      name="foto"
                      onChange={handleFileChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      accept="image/*"
                    />
                    <label className="block text-center" htmlFor="num_telefono">
                      Número de teléfono
                    </label>
                    <input
                      type="number"
                      name="num_telefono"
                      placeholder="Ejemplo: 8888-8888"
                      value={formData.num_telefono}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                    />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {isDeletePopupOpen && usuarioAEliminar && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md border-black"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 border-1 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro que deseas eliminar el usuario {usuarioAEliminar.nombre}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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