// components/TransactionChart.jsx
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

export default function TransactionChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transacciones");
        if (!response.ok) throw new Error("Error al obtener las transacciones");
        const transactions = await response.json();

        const transactionsByDate = transactions.reduce((acc, transaction) => {
          const date = new Date(transaction.fecha).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(transactionsByDate)
          .map((date) => ({
            date,
            transactions: transactionsByDate[date],
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener las transacciones:", error);
        setError(error.message);
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h2 className="text-xl font-bold mb-3 text-gray-800 text-center">
        Transacciones por Día
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
              dataKey="transactions"
              stroke="#8884d8"
              activeDot={{ r: 6 }}
              name="Transacciones"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}