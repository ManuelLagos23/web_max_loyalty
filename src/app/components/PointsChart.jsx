"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PointsChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch("/api/canjeados");
        if (!response.ok) throw new Error("Error al obtener los canjeados");
        const pointsData = await response.json();

   

        const pointsByDate = pointsData.reduce((acc, item) => {
          // Validate puntos_canjeados
          const points = parseFloat(item.puntos_canjeados);
          if (isNaN(points) || !isFinite(points)) {
            console.warn(
              `Invalid puntos_canjeados value for item ${item.id}:`,
              item.puntos_canjeados
            );
            return acc; // Skip invalid entries
          }

          const date = new Date(item.created_at).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + points;
          return acc;
        }, {});

        const chartData = Object.keys(pointsByDate)
          .map((date) => ({
            date,
            points: pointsByDate[date],
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

     
        setData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener los canjeados:", error);
        setError(error.message);
        setIsLoading(false);
      }
    }

    fetchPoints();
  }, []);

  if (isLoading) return <p className="text-gray-800">Cargando...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h2 className="text-xl font-bold mb-3 text-gray-800 text-center">
        Puntos Canjeados por Día
      </h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#333" tick={{ fontSize: 12 }} />
            <YAxis stroke="#333" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
              labelStyle={{ color: "#333" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#82ca9d"
              activeDot={{ r: 6 }}
              name="Puntos Canjeados"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}