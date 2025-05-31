'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaMoneyCheckAlt, FaNetworkWired, FaSitemap, FaDesktop, FaUserFriends, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import RealTimeStats from '../components/RealTimeStats';

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
    { title: 'Centros de Costos', value: dashboardData.centrosCostos, icon: <FaMoneyCheckAlt className="text-3xl text-blue-600" /> },
    { title: 'Canales', value: dashboardData.canales, icon: <FaNetworkWired className="text-3xl text-blue-600" /> },
    { title: 'Subcanales', value: dashboardData.subcanales, icon: <FaSitemap className="text-3xl text-blue-600" /> },
    { title: 'Terminales', value: dashboardData.terminales, icon: <FaDesktop className="text-3xl text-blue-600" /> },
    { title: 'Usuarios APK', value: dashboardData.miembros, icon: <FaUserFriends className="text-3xl text-blue-600" /> },
    { title: 'Tarjetas', value: dashboardData.tarjetas, icon: <FaCreditCard className="text-3xl text-blue-600" /> },
  ];

  const totalIndicator = {
    title: 'Transacciones y Canjeados',
    text: 'Total de transacciones y canjeados en la plataforma',
    value: dashboardData.transaccionesCanjeados,
    icon: <FaMoneyBillWave className="text-4xl text-green-600" />,
  };

  return (
    <div className="font-sans min-h-screen flex bg-gray-100 text-gray-900">
      <PageWrapper>
        <Navbar />
      </PageWrapper>
      <div className="flex-1 flex flex-col overflow-x-auto">
        <main className="flex-1 p-4 md:p-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6
            bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
            transition-all duration-300 text-center"
          >
            Dashboard de Max Platform
          </h1>
          <p
            className="text-center text-gray-700 leading-relaxed max-w-2xl
            p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto mb-6 md:mb-8"
          >
            Visualiza los indicadores clave de tu plataforma de fidelidad en tiempo real.
          </p>

          {loading && (
            <p className="text-center text-gray-600 mb-6">Cargando datos...</p>
          )}

          {errorMessages.length > 0 && (
            <div className="text-center text-red-500 mb-6">
              {errorMessages.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
              <button
                onClick={fetchDashboardData}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg 
                transition-all duration-300 flex items-center space-x-4 min-w-[200px]"
              >
                <div>{indicator.icon}</div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-800">{indicator.title}</h2>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    {loading ? '...' : indicator.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Total Indicator (Izquierda) */}
            <div
              className="bg-gradient-to-r from-green-100 to-blue-100 p-4 md:p-8 rounded-lg shadow-lg 
              hover:shadow-xl transition-all duration-300 flex items-center space-x-4 md:space-x-6 w-full max-w-full"
            >
              <div>{totalIndicator.icon}</div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">{totalIndicator.title}</h2>
                <p className="text-base md:text-lg text-gray-700 mb-2">{totalIndicator.text}</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {loading ? '...' : totalIndicator.value}
                </p>
              </div>
            </div>

            {/* RealTimeStats (Derecha) */}
            <div className="w-full max-w-full">
              <RealTimeStats />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}