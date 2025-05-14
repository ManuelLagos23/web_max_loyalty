
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import TransactionChart from "../components/TransactionChart";
import PointsChart from "../components/PointsChart";
import PieChartComparison from "../components/PieChartComparison";
import RealTimeStats from "../components/RealTimeStats";

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Navbar lateral */}
      <PageWrapper>
        <Navbar />
      </PageWrapper>
      {/* Área principal */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Menú horizontal */}
       
        {/* Contenido con fondo */}
        <div
          className="flex-1 bg-cover bg-center bg-no-repeat p-8 text-white bg-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">Bienvenido a Max Loyalty</h1>
          <p className="text-center text-gray-700 leading-relaxed max-w-2xl p-4 rounded-lg transition-all duration-300 mx-auto mb-8">Esta es tu plataforma para gestionar tu fidelidad.</p>

          {/* Contenedor para los gráficos superiores */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-4 mb-8">
            {/* Gráfico de transacciones */}
            <TransactionChart />

            {/* Gráfico de puntos canjeados */}
            <PointsChart />

            {/* Gráfico circular de porcentajes */}
            <PieChartComparison />
          </div>

          {/* Contenedor para las estadísticas en tiempo real */}
          <div className="flex justify-center">
            <RealTimeStats />
          </div>
        </div>
      </div>
    </div>
  );
}