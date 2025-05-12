"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#8884d8", "#82ca9d"]; // Purple for transactions, Green for points

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

  if (isLoading) return <p className="text-gray-800">Cargando estadísticas...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const chartData = [
    { name: "Transacciones", value: stats.transactions },
    { name: "Puntos Canjeados", value: stats.points },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl h-72 real-time-stats">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Estadísticas en Tiempo Real de Hoy
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Contadores */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Transacciones</h3>
            <p className="text-4xl font-bold text-[#8884d8]">{stats.transactions}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Puntos Canjeados</h3>
            <p className="text-4xl font-bold text-[#82ca9d]">{stats.points}</p>
          </div>
        </div>
        {/* Gráfico de barras */}
        <div className="flex-1 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
            >
              <XAxis type="number" stroke="#333" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" stroke="#333" tick={{ fontSize: 12 }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                labelStyle={{ color: "#333" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}