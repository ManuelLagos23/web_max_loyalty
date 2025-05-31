'use client';

import { useEffect, useState } from "react";
import { FaExchangeAlt, FaStar } from "react-icons/fa";

export default function RealTimeStats() {
  const [stats, setStats] = useState({ transactions: 0, points: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = async () => {
    try {
      const [transResponse, pointsResponse] = await Promise.all([
        fetch("/api/transacciones"),
        fetch("/api/canjeados"),
      ]);

      if (!transResponse.ok || !pointsResponse.ok) {
        throw new Error("Error al obtener los datos en tiempo real");
      }

      const transactions = await transResponse.json();
      const pointsData = await pointsResponse.json();

      // Filter for current day
      const todayTransactions = transactions.filter((t) => t.fecha && t.fecha.split("T")[0] === currentDate);
      const todayPoints = pointsData.filter((p) => p.fecha && p.fecha.split("T")[0] === currentDate);

      // Sum puntos_canjeados for the current day
      const totalPoints = todayPoints.reduce((sum, record) => sum + Number(record.puntos_canjeados || 0), 0);

      setStats({
        transactions: todayTransactions.length,
        points: totalPoints,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos en tiempo real:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Carga inicial

    // Polling cada 5 segundos
    const interval = setInterval(fetchData, 5000);

    // Limpieza al desmontar el componente
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    // Check for day change every minute
    const checkDate = () => {
      const now = new Date().toISOString().split("T")[0];
      if (now !== currentDate) {
        setCurrentDate(now);
        fetchData(); // Refresh data for the new day
      }
    };

    const timer = setInterval(checkDate, 60000); // Check every minute
    checkDate(); // Initial check

    // Cleanup
    return () => clearInterval(timer);
  }, [currentDate]);

  useEffect(() => {
    const card = document.querySelector(".real-time-stats");
    if (card) {
      const rect = card.getBoundingClientRect();
      console.log("RealTimeStats position:", {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  if (isLoading) return <p className="text-gray-800 text-center">Cargando estadísticas...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-green-50 rounded-lg shadow-lg p-8 w-full max-w-5xl real-time-stats">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">
        Estadísticas en Tiempo Real de Hoy
      </h2>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between h-full">
        {/* Contador de Transacciones */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white bg-opacity-80 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 min-h-[200px] w-full">
          <div className="flex items-center space-x-3 mb-4">
            <FaExchangeAlt className="text-3xl text-blue-600" />
            <h3 className="text-xl font-semibold text-black text-center w-full">Transacciones</h3>
          </div>
          <p className="text-5xl font-bold text-blue-600 animate-fadeIn text-center w-full">
            {stats.transactions}
          </p>
        </div>
        {/* Contador de Puntos Canjeados */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white bg-opacity-80 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 min-h-[200px] w-full">
          <div className="flex items-center space-x-3 mb-4">
            <FaStar className="text-3xl text-blue-600" />
            <h3 className="text-xl font-semibold text-black text-center w-full">Puntos Canjeados</h3>
          </div>
          <p className="text-5xl font-bold text-blue-600 animate-fadeIn text-center w-full">
            {stats.points}
          </p>
        </div>
      </div>
    </div>
  );
}