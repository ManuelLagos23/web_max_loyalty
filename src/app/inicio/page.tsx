'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaMoneyCheckAlt, FaNetworkWired, FaSitemap, FaDesktop, FaUserFriends, FaCreditCard, FaMoneyBillWave, FaCar } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';

interface DashboardData {
  clientes: number;
  empresas: number;
  centrosCostos: number;
  canales: number;
  subcanales: number;
  terminales: number;
  miembros: number;
  tarjetas: number;
  transaccionesCanjeados: number;
  vehiculos: number;
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    clientes: 0,
    empresas: 0,
    centrosCostos: 0,
    canales: 0,
    subcanales: 0,
    terminales: 0,
    miembros: 0,
    tarjetas: 0,
    transaccionesCanjeados: 0,
    vehiculos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const fetchDashboardData = async () => {
    try {
      setErrorMessages([]);
      setLoading(true);

      const [
        clientesRes,
        empresasRes,
        centrosCostosRes,
        canalesRes,
        subcanalesRes,
        terminalesRes,
        miembrosRes,
        tarjetasRes,
        transaccionesRes,
        canjeadosRes,
        vehiculosRes,
      ] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/empresas'),
        fetch('/api/costos'),
        fetch('/api/canales'),
        fetch('/api/subcanales'),
        fetch('/api/terminales'),
        fetch('/api/miembros'),
        fetch('/api/tarjetas'),
        fetch('/api/transacciones'),
        fetch('/api/canjeados'),
        fetch('/api/vehiculos'),
      ]);

      const results = await Promise.all([
        clientesRes.ok ? clientesRes.json().catch(() => []) : [],
        empresasRes.ok ? empresasRes.json().catch(() => []) : [],
        centrosCostosRes.ok ? centrosCostosRes.json().catch(() => []) : [],
        canalesRes.ok ? canalesRes.json().catch(() => []) : [],
        subcanalesRes.ok ? subcanalesRes.json().catch(() => []) : [],
        terminalesRes.ok ? terminalesRes.json().catch(() => []) : [],
        miembrosRes.ok ? miembrosRes.json().catch(() => []) : [],
        tarjetasRes.ok ? tarjetasRes.json().catch(() => []) : [],
        transaccionesRes.ok ? transaccionesRes.json().catch(() => []) : [],
        canjeadosRes.ok ? canjeadosRes.json().catch(() => []) : [],
        vehiculosRes.ok ? vehiculosRes.json().catch(() => []) : [],
      ]);

      setDashboardData({
        clientes: results[0].total || (Array.isArray(results[0].clientes) ? results[0].clientes.length : Array.isArray(results[0]) ? results[0].length : results[0].count || results[0].data?.length || 0),
        empresas: Array.isArray(results[1]) ? results[1].length : results[1].count || results[1].data?.length || 0,
        centrosCostos: Array.isArray(results[2]) ? results[2].length : results[2].count || results[2].data?.length || 0,
        canales: Array.isArray(results[3]) ? results[3].length : results[3].count || results[3].data?.length || 0,
        subcanales: Array.isArray(results[4]) ? results[4].length : results[4].count || results[4].data?.length || 0,
        terminales: Array.isArray(results[5]) ? results[5].length : results[5].count || results[5].data?.length || 0,
        miembros: Array.isArray(results[6]) ? results[6].length : results[6].count || results[6].data?.length || 0,
        tarjetas: results[7].total || (Array.isArray(results[7].tarjetas) ? results[7].tarjetas.length : results[7].count || results[7].data?.length || 0),
        transaccionesCanjeados: (
          (results[8].total || (Array.isArray(results[8].transacciones) ? results[8].transacciones.length : Array.isArray(results[8]) ? results[8].length : results[8].count || results[8].data?.length || 0)) +
          (results[9].total || (Array.isArray(results[9].canjeados) ? results[9].canjeados.length : Array.isArray(results[9]) ? results[9].length : results[9].count || results[9].data?.length || 0))
        ),
        vehiculos: Array.isArray(results[10]) ? results[10].length : results[10].count || results[10].data?.length || 0,
      });
    } catch (error: unknown) {
      console.error('Error al obtener datos del dashboard:', error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Error desconocido';
      setErrorMessages((prev) => [...prev, message]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const indicators = [
    { title: 'Clientes', value: dashboardData.clientes, icon: <FaUsers className="text-3xl text-blue-600" /> },
    { title: 'Empresas', value: dashboardData.empresas, icon: <FaBuilding className="text-3xl text-blue-600" /> },
    { title: 'Establecimientos', value: dashboardData.centrosCostos, icon: <FaMoneyCheckAlt className="text-3xl text-blue-600" /> },
    { title: 'Canales', value: dashboardData.canales, icon: <FaNetworkWired className="text-3xl text-blue-600" /> },
    { title: 'Subcanales', value: dashboardData.subcanales, icon: <FaSitemap className="text-3xl text-blue-600" /> },
    { title: 'Terminales', value: dashboardData.terminales, icon: <FaDesktop className="text-3xl text-blue-600" /> },
    { title: 'Usuarios APK', value: dashboardData.miembros, icon: <FaUserFriends className="text-3xl text-blue-600" /> },
    { title: 'Tarjetas', value: dashboardData.tarjetas, icon: <FaCreditCard className="text-3xl text-blue-600" /> },
  ];

  const totalIndicators = [
    {
      title: 'Transacciones y Canjeados',
      text: 'Total de transacciones y canjeados en la plataforma',
      value: dashboardData.transaccionesCanjeados,
      icon: <FaMoneyBillWave className="text-4xl text-green-600" />,
    },
    {
      title: 'Vehículos',
      text: 'Total de vehículos registrados en el sistema',
      value: dashboardData.vehiculos,
      icon: <FaCar className="text-4xl text-yellow-600" />,
    },
  ];

  return (
    <div className="font-sans min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900">
      <PageWrapper>
        <Navbar />
      </PageWrapper>
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 md:mb-8
            bg-blue-600 bg-clip-text text-transparent
            animate-fadeIn drop-shadow-md text-center"
          >
            Max Platform
          </h1>
          <p
            className="text-center text-gray-700 text-lg md:text-xl leading-relaxed max-w-3xl
            bg-white/80 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mx-auto mb-8"
          >
            Indicadores clave de tu plataforma de fidelidad.
          </p>

          {loading && (
            <div className="flex justify-center mb-8">
              <div className="animate-pulse bg-blue-200/50 p-4 rounded-full">
                <p className="text-gray-600">Cargando datos...</p>
              </div>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="text-center mb-8">
              {errorMessages.map((error, index) => (
                <p key={index} className="text-red-500 mb-2 bg-red-100/50 p-2 rounded-md inline-block">
                  {error}
                </p>
              ))}
              <button
                onClick={fetchDashboardData}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className="bg-white/90 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                transform hover:-translate-y-1 hover:bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-100
                flex items-center justify-between min-h-[120px]"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">{indicator.icon}</div>
                  <div>
                    <h2 className="text-md md:text-lg font-semibold text-gray-800">{indicator.title}</h2>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 animate-countUp">
                      {loading ? '...' : indicator.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {totalIndicators.map((indicator, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${
                  index === 0 ? 'from-green-100 via-blue-100 to-green-200' : 'from-yellow-100 via-amber-100 to-yellow-200'
                } p-6 md:p-8 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row
                items-center justify-between border ${
                  index === 0 ? 'border-green-200' : 'border-yellow-200'
                } animate-slideIn`}
              >
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <div className={`p-4 ${index === 0 ? 'bg-green-200' : 'bg-yellow-200'} rounded-full`}>{indicator.icon}</div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{indicator.title}</h2>
                    <p className="text-md md:text-lg text-gray-600">{indicator.text}</p>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold ${
                  index === 0 ? 'text-green-700' : 'text-yellow-700'
                } animate-countUp">
                  {loading ? '...' : indicator.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}