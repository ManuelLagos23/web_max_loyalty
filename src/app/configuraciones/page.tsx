
import PageWrapper from '../components/PageWrapper';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Navbar lateral */}
      <PageWrapper>
        <Navbar />
      </PageWrapper>
      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Menú horizontal */}
 

        {/* Contenido con fondo */}
        <div
          className="flex-1 bg-cover bg-center bg-no-repeat p-8 text-white"
          style={{
            backgroundImage: 'url("/images/logo-max-loyalty-black.png")',
          }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-left">Configuraciones de la Plaforma</h1>
        </div>
      </div>
    </div>
  );
}
