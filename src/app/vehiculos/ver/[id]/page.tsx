'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
  vin: string;
  cilindraje: number;
  chasis: string;
  tipo_combustible: number;
  tipo_combustible_nombre: string;
  transmision: string;
  capacidad_carga: number;
  color: string;
  caballo_potencia: number;
  potencia_motor: number;
  numero_motor: string;
  numero_asientos: number;
  numero_puertas: number;
  odometro: number;
};

export default function VehiculoView() {
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const response = await fetch(`/api/vehiculos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVehiculo(data);
        } else {
          console.error('Error fetching vehicle:', response.status, await response.text());
          alert('Error al cargar el vehículo');
        }
      } catch (error) {
        console.error('Error in fetchVehiculo:', error);
        alert('Error al cargar el vehículo');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehiculo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700 font-medium text-lg">Vehículo no encontrado</p>
      </div>
    );
  }

  const fieldGroups = [
    {
      label: 'Identificación',
      fields: [
        { label: 'Placa', value: vehiculo.placa },
        { label: 'Marca', value: vehiculo.marca },
        { label: 'Modelo', value: vehiculo.modelo },
      ],
    },
    {
      label: 'Documentación',
      fields: [
        { label: 'VIN', value: vehiculo.vin },
        { label: 'Chasis', value: vehiculo.chasis },
        { label: 'Número de Motor', value: vehiculo.numero_motor },
      ],
    },
    {
      label: 'Especificaciones Técnicas',
      fields: [
        { label: 'Cilindraje', value: `${vehiculo.cilindraje} cc` },
        { label: 'Tipo de Combustible', value: vehiculo.tipo_combustible_nombre || '-' },
        { label: 'Transmisión', value: vehiculo.transmision },
        { label: 'Caballos de Potencia', value: vehiculo.caballo_potencia },
        { label: 'Potencia del Motor', value: `${vehiculo.potencia_motor} kW` },
      ],
    },
    {
      label: 'Características Físicas',
      fields: [
        { label: 'Capacidad de Carga', value: `${vehiculo.capacidad_carga} kg` },
        { label: 'Color', value: vehiculo.color },
        { label: 'Número de Asientos', value: vehiculo.numero_asientos },
        { label: 'Número de Puertas', value: vehiculo.numero_puertas },
           { label: 'Odómetro', value: vehiculo.odometro },
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
              Detalles del Vehículo
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa})
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Row: Identificación and Documentación */}
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
              {/* Second Row: Especificaciones Técnicas and Características Físicas */}
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
                onClick={() => router.push('/vehiculos')}
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