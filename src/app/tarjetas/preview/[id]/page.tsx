
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import Navbar from '@/app/components/Navbar';
import TarjetaPDF from '@/app/components/pdf/TarjetaPDF';

interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  tipo_tarjeta_id: number;
  tipo_tarjeta_nombre: string;
  canal_id?: number;
  canal?: string;
  codigo_canal?: string;
  subcanal_id?: number;
  subcanal_nombre?: string;
  created_at: string;
  vehiculo_id?: number;
  vehiculo_nombre?: string;
}

export default function TarjetaPreview() {
  const { id } = useParams();
  const router = useRouter();
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTarjeta = async () => {
      try {
        const response = await fetch(`/api/tarjetas/${id}`, {
          credentials: 'include', // Enviar cookies para autenticación
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Datos de la tarjeta:', data);
          setTarjeta(data);
        } else {
          const errorText = await response.text();
          console.error('Error fetching tarjeta:', response.status, errorText);
          setError(`Error al cargar la tarjeta: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error('Error in fetchTarjeta:', error);
        setError('Error al cargar la tarjeta. Verifica tu conexión o sesión.');
      } finally {
        setLoading(false);
      }
    };

    fetchTarjeta();
  }, [id]);

  const handleDownload = async () => {
    if (!tarjeta) return;
    try {
      const blob = await pdf(<TarjetaPDF tarjeta={tarjeta} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tarjeta.numero_tarjeta}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setError('Error al generar el PDF para descargar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-600 font-medium text-lg">{error}</p>
      </div>
    );
  }

  if (!tarjeta) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700 font-medium text-lg">Tarjeta no encontrada</p>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gray-800 py-6 px-6 sm:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Vista Previa de la Tarjeta
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">
              {tarjeta.numero_tarjeta}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            {error && <div className="text-red-600 text-center mb-4">{error}</div>}
            <div className="w-full h-[400px] mx-auto mb-8 shadow-md border border-gray-300">
              <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true}>
                <TarjetaPDF tarjeta={tarjeta} />
              </PDFViewer>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                Descargar
              </button>
              <button
                onClick={() => router.push('/tarjetas')}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
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
