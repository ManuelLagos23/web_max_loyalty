import MenuMain from '../components/MenuMain';
import PageWrapper from '../components/PageWrapper';
import NavbarMaxPay from '../components/NavbarMaxPay';

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Navbar lateral */}
      <PageWrapper>
        <NavbarMaxPay />
      </PageWrapper>
      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Menú horizontal */}
        <MenuMain />

        {/* Contenido con fondo */}
        <div
          className="flex-1 bg-cover bg-center bg-no-repeat p-8 text-white"
          style={{
            backgroundImage: 'url("/images/logo-max-loyalty-black.png")',
          }}
        >
          <h1 className="text-4xl font-bold mb-4">Bienvenido a Max Pay</h1>
          <p>Esta es tu plataforma para gestionar la flota de vehículos.</p>
        </div>
      </div>
    </div>
  );
}
