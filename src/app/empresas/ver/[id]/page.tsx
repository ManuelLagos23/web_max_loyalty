'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';

type Empresa = {
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
};

export default function EmpresaView() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await fetch(`/api/empresas/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEmpresa(data);
        } else {
          console.error('Error fetching empresa:', response.status, await response.text());
          alert('Error al cargar la empresa');
        }
      } catch (error) {
        console.error('Error in fetchEmpresa:', error);
        alert('Error al cargar la empresa');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmpresa();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700 font-medium text-lg">Empresa no encontrada</p>
      </div>
    );
  }

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

  const fieldGroups = [
    {
      label: 'Información General',
      fields: [
        { label: 'Nombre de la Empresa', value: empresa.nombre_empresa },
        { label: 'Nombre Impreso', value: empresa.nombre_impreso },
        { label: 'Correo Electrónico', value: empresa.correo },
        { label: 'Teléfono', value: empresa.telefono },
        { label: 'NFI', value: empresa.nfi },
        { label: 'Prefijo de Tarjetas', value: empresa.prefijo_tarjetas },
      ],
    },
    {
      label: 'Ubicación y Moneda',
      fields: [
        { label: 'País', value: empresa.pais },
        { label: 'Moneda', value: empresa.moneda },
      ],
    },
    {
      label: 'Logos',
      fields: [
        {
          label: 'Logo',
          value: empresa.logo && getLogoSrc(empresa.logo) ? (
            <div
              className="cursor-pointer"
              onClick={() => openModal(getLogoSrc(empresa.logo))}
            >
              <Image
                src={getLogoSrc(empresa.logo)!}
                alt="Logo de la empresa"
                width={100}
                height={100}
                className="object-cover rounded mr-4"
              />
            </div>
          ) : (
            <span className="text-gray-500 mr-4">Sin logo</span>
          ),
        },
        {
          label: 'Logo Impreso',
          value: empresa.logo_impreso && getLogoSrc(empresa.logo_impreso) ? (
            <div
              className="cursor-pointer"
              onClick={() => openModal(getLogoSrc(empresa.logo_impreso))}
            >
              <Image
                src={getLogoSrc(empresa.logo_impreso)!}
                alt="Logo impreso de la empresa"
                width={100}
                height={100}
                className="object-cover rounded"
              />
            </div>
          ) : (
            <span className="text-gray-500">Sin logo impreso</span>
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
              Detalles de la Empresa
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">
              {empresa.nombre_empresa} ({empresa.nfi})
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fieldGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                    {group.label}
                  </h2>
                  {group.label === 'Logos' ? (
                    <div className="flex items-center space-x-4">
                      {group.fields.map((field, fieldIdx) => (
                        <div key={fieldIdx} className="flex-1">
                          <p className="text-sm font-medium text-gray-600">{field.label}</p>
                          <div className="mt-1">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full table-auto border-collapse">
                      <tbody>
                        {group.fields.map((field, fieldIdx) => (
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
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => router.push('/empresas')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300
                  shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
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
              ×
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
    </div>
  );
}