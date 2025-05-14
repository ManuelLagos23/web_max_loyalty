
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';

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
          <h1 className="text-4xl font-bold mb-4">Bienvenido a Max Loyalty</h1>
          <p>Esta es tu plataforma para gestionar tu fidelidad.</p>
        </div>
      </div>
    </div>

  );
}
