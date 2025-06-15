'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

interface Empresa {
  id: number;
  nombre_empresa: string;
  nombre_impreso: string;
  logo: string | null;
  logo_impreso: string | null;
  pais: string;
  moneda: string;
  correo: string;
  telefono: string;
  nfi: string;
  prefijo_tarjetas: string;
  pais_id: number | null;
  moneda_id: number | null;
}

export default function Empresas() {
  const router = useRouter();
  const pathname = usePathname();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [empresaAEliminar, setEmpresaAEliminar] = useState<Empresa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openDeletePopup = (empresa: Empresa) => {
    setEmpresaAEliminar(empresa);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setEmpresaAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchEmpresas = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/empresas?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas:', response.status, response.statusText);
        setErrorMessage(`Error al obtener las empresas: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener las empresas');
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleDelete = async () => {
    if (!empresaAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/empresas/${empresaAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Empresa eliminada exitosamente');
        closeDeletePopup();
        fetchEmpresas();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar la empresa: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al eliminar la empresa');
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const filteredEmpresas = empresas.filter((empresa) =>
    [
      empresa.nombre_empresa,
      empresa.nombre_impreso,
      empresa.pais,
      empresa.moneda,
      empresa.correo,
      empresa.telefono,
      empresa.nfi,
      empresa.prefijo_tarjetas,
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmpresas = filteredEmpresas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);

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

  const getLogoSrc = (logo: string | null | undefined) => {
    if (!logo) return null;
    return `data:image/jpeg;base64,${logo}`;
  };


  const openModal = (imageSrc: string | null) => {
    if (imageSrc) {
      setSelectedImage(imageSrc);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const empresaRoutes = [
    { name: 'Empresas', href: '/empresas' },
    { name: 'Establecimientos', href: '/centro_de_costos' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Empresas
              </h1>
              <nav className="flex justify-center space-x-4">
                {empresaRoutes.map((empresa) => {
                  const isActive = pathname === empresa.href;
                  return (
                    <Link key={empresa.name} href={empresa.href}>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {empresa.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => router.push('/empresas/crear')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 m-2"
              >
                Agregar Empresa
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, país, moneda, correo, teléfono, NFI o prefijo..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Logo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre Empresa</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">País</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Moneda</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Correo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Teléfono</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">NFI</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Prefijo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentEmpresas.length > 0 ? (
                  currentEmpresas.map((empresa, index) => (
                    <tr className="hover:bg-gray-50 transition-all duration-200" key={empresa.id}>
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2 cursor-pointer" onClick={() => openModal(getLogoSrc(empresa.logo))}>
                        {empresa.logo && getLogoSrc(empresa.logo) ? (
                          <Image
                            src={getLogoSrc(empresa.logo)!}
                            alt="Logo de la empresa"
                            width={40}
                            height={40}
                            className="object-cover rounded"
                            onError={() => console.error('Error al cargar el logo')}
                          />
                        ) : (
                          <span className="text-gray-500">Sin logo</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{empresa.nombre_empresa}</td>
                      <td className="px-4 py-2">{empresa.pais}</td>
                      <td className="px-4 py-2">{empresa.moneda}</td>
                      <td className="px-4 py-2">{empresa.correo}</td>
                      <td className="px-4 py-2">{empresa.telefono}</td>
                      <td className="px-4 py-2">{empresa.nfi}</td>
                      <td className="px-4 py-2">{empresa.prefijo_tarjetas}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => router.push(`/empresas/editar/${empresa.id}`)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => router.push(`/empresas/ver/${empresa.id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-yelgreenlow-600 transition-all duration-300"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => openDeletePopup(empresa)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-2 text-center text-gray-500">
                      No hay empresas disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Siguiente
              </button>
            </div>

            {isDeletePopupOpen && empresaAEliminar && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeDeletePopup();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar la empresa {empresaAEliminar.nombre_empresa}?
                  </p>
                  {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
                  <div className="flex justify-between">
                    <button
                      onClick={closeDeletePopup}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isModalOpen && selectedImage && (
              <div
                className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModal();
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl border max-w-4xl">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-2xl font-bold"
                  >
                    &times;
                  </button>
                  <Image
                    src={selectedImage}
                    alt="Imagen ampliada"
                    width={800}
                    height={600}
                    className="object-contain max-h-[80vh]"
                    onError={() => {
                      console.error('Error al cargar la imagen ampliada');
                      closeModal();
                    }}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}