'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';

type Cliente = {
  id: number;
  nombre: string;
  logo: string | null;
  pais: string;
  estado: string;
  ciudad: string;
  canal_nombre: string;
  subcanal_nombre: string;
  email: string;
  telefono: string;
  nfi: string;
  pais_id: number;
  estado_id: number;
  canal_id: number;
  subcanal_id: number;
};

export default function ClienteView() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCliente(data);
        } else {
          console.error('Error fetching client:', response.status, await response.text());
          alert('Error al cargar el cliente');
        }
      } catch (error) {
        console.error('Error in fetchCliente:', error);
        alert('Error al cargar el cliente');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCliente();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700 font-medium text-lg">Cliente no encontrado</p>
      </div>
    );
  }

  const getLogoSrc = (logo: string | null) => {
    if (!logo) return null;
    return `data:image/jpeg;base64,${logo}`;
  };

  const fieldGroups = [
    {
      label: 'Información General',
      fields: [
        { label: 'Nombre', value: cliente.nombre },
        { label: 'Correo Electrónico', value: cliente.email },
        { label: 'Teléfono', value: cliente.telefono },
        { label: 'NFI', value: cliente.nfi },
      ],
    },
    {
      label: 'Ubicación',
      fields: [
        { label: 'País', value: cliente.pais },
        { label: 'Estado', value: cliente.estado },
        { label: 'Ciudad', value: cliente.ciudad },
      ],
    },
    {
      label: 'Clasificación',
      fields: [
        { label: 'Canal', value: cliente.canal_nombre || '-' },
        { label: 'Subcanal', value: cliente.subcanal_nombre || '-' },
      ],
    },
    {
      label: 'Logo',
      fields: [
        {
          label: 'Logo',
          value: cliente.logo && getLogoSrc(cliente.logo) ? (
            <Image
              src={getLogoSrc(cliente.logo)!}
              alt="Logo del cliente"
              width={100}
              height={100}
              className="object-cover rounded"
              onError={() => console.error('Error al cargar el logo')}
            />
          ) : (
            <span className="text-gray-500">Sin logo</span>
          ),
        },
      ],
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gray-800 py-6 px-6 sm:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Detalles del Cliente
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">
              {cliente.nombre} ({cliente.nfi})
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Row: Información General and Ubicación */}
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[0].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[0].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${
                          fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[1].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[1].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${
                          fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Second Row: Clasificación and Logo */}
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[2].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[2].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${
                          fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[3].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[3].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${
                          fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => router.push('/clientes')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300
                  shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}