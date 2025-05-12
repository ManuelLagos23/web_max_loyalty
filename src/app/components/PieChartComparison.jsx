"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d"]; // Purple for transactions, Green for points

export default function PieChartComparison() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [transResponse, pointsResponse] = await Promise.all([
          fetch("/api/transacciones"),
          fetch("/api/canjeados"),
        ]);

        if (!transResponse.ok || !pointsResponse.ok) {
          throw new Error("Error al obtener los datos");
        }

        const transactions = await transResponse.json();
        const pointsData = await pointsResponse.json();

        const totalTransactions = transactions.length;
        const totalPoints = pointsData.length;

        const total = totalTransactions + totalPoints;

        const chartData = [
          { name: "Transacciones", value: totalTransactions, percentage: total ? (totalTransactions / total) * 100 : 0 },
          { name: "Puntos Canjeados", value: totalPoints, percentage: total ? (totalPoints / total) * 100 : 0 },
        ];

        setData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError(error.message);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) return <p className="text-gray-800">Cargando...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h2 className="text-xl font-bold mb-3 text-gray-800 text-center">
        Transacciones vs. Puntos Canjeados
      </h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${props.payload.percentage.toFixed(1)}%`,
                name,
              ]}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
              labelStyle={{ color: "#333" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}