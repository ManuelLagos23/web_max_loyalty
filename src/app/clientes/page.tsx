'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import CustomAlert from '@/app/components/CustomAlert';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';

interface Cliente {
  id: number;
  nombre: string;
  pais: string;
  ciudad: string;
  estado: string;
  email: string;
  telefono: string;
  nfi: string;
  pais_id: number | null;
  estado_id: number | null;
  canal_id: number | null;
  subcanal_id: number | null;
  canal_nombre: string;
  subcanal_nombre: string;
  logo?: string | null;
}

function AlertSection({ setAlert }: { setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const alertType = searchParams.get('alert');
    const message = searchParams.get('message');
    if (alertType && message) {
      setAlert({ type: alertType as 'success' | 'error', message: decodeURIComponent(message) });
      router.replace('/clientes');
    }
  }, [searchParams, router, setAlert]);

  return null; // No renderiza nada directamente, solo maneja la lógica de alertas
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const fetchClientes = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/clientes?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data: Cliente[] = await response.json();
        setClientes(data);
      } else {
        setErrorMessage(`Error al obtener los clientes: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al obtener los clientes');
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleAlertClose = () => {
    if (alert?.type === 'success') {
      router.push('/clientes'); // Ensure no redirect loop
    }
    setAlert(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openDeletePopup = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setIsDeletePopupOpen(true);
    setErrorMessage(null);
  };

  const closeDeletePopup = () => {
    setClienteAEliminar(null);
    setIsDeletePopupOpen(false);
    setErrorMessage(null);
  };

  const handleDelete = async () => {
    if (!clienteAEliminar) return;
    try {
      setErrorMessage(null);
      const response = await fetch(`/api/clientes/${clienteAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        closeDeletePopup();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error al eliminar el cliente: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrorMessage('Error al eliminar el cliente');
    }
  };

  const filteredClientes = clientes.filter((cliente) =>
    [
      cliente.nombre,
      cliente.email,
      cliente.telefono,
      cliente.nfi,
      cliente.pais,
      cliente.estado,
      cliente.ciudad,
      cliente.canal_nombre,
      cliente.subcanal_nombre,
    ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

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

  return (
   
    
       <div className="font-sans bg-white text-gray-900 min-h-screen flex">
      
        <Head>
        <meta charSet="UTF-8" />
     
      </Head>
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 bg-white">
          <Suspense fallback={<></>}>
            <AlertSection setAlert={setAlert} />
          </Suspense>
          <div className="space-y-2">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Clientes
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra los clientes registrados en la plataforma.
            </p>
          </div>

          {alert && (
            <CustomAlert
              type={alert.type}
              message={alert.message}
              onClose={handleAlertClose}
            />
          )}

          <div className="flex justify-between mb-4">
            <Link href="/clientes/crear">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Agregar cliente
              </button>
            </Link>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, NFI, país, estado, ciudad, canal o subcanal..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

          <table className="min-w-full bg-gray-100 border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Logo</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
                <th className="px-4 py-2 text-left">Canal</th>
                <th className="px-4 py-2 text-left">Subcanal</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">NFI</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClientes.length > 0 ? (
                currentClientes.map((cliente, index) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2">
                      {cliente.logo && getLogoSrc(cliente.logo) ? (
                        <Image
                          src={getLogoSrc(cliente.logo)!}
                          alt="Logo del cliente"
                          width={40}
                          height={40}
                          className="object-cover rounded"
                          onError={() => console.error('Error al cargar el logo')}
                        />
                      ) : (
                        <span className="text-gray-500">Sin logo</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{cliente.nombre}</td>
                    <td className="px-4 py-2">{cliente.pais}</td>
                    <td className="px-4 py-2">{cliente.estado}</td>
                    <td className="px-4 py-2">{cliente.ciudad}</td>
                    <td className="px-4 py-2">{cliente.canal_nombre}</td>
                    <td className="px-4 py-2">{cliente.subcanal_nombre}</td>
                    <td className="px-4 py-2">{cliente.email}</td>
                    <td className="px-4 py-2">{cliente.telefono}</td>
                    <td className="px-4 py-2">{cliente.nfi}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <Link href={`/clientes/editar/${cliente.id}`}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 mr-2">
                          Editar
                        </button>
                      </Link>
                      <button
                        onClick={() => openDeletePopup(cliente)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-2 text-center text-gray-500">
                    No hay clientes disponibles.
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

          {isDeletePopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar al cliente {clienteAEliminar?.nombre}?
                </p>
                {errorMessage && <p className="text-center text-red-500 mb-4">{errorMessage}</p>}
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