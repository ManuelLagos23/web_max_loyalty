import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-1/10 bg-gray-800 text-white h-screen p-4 space-y-2">
      <div className="text-2xl font-bold mb-8 text-center text-white">Max Loyalty</div>
      {/* Logo con Link */}
      <Link href="/inicio">
        <img src="/images/logo-max-loyalty.png" className="mb-8" />
      </Link>
      <ul className="space-y-2">
        <li>
          <Link href="/usuarios" className="flex items-center p-2 rounded hover:bg-gray-700">
            Usuario
          </Link>
        </li>
        <li>
          <Link href="#" className="block p-2 rounded hover:bg-gray-700">
            Estaciones
          </Link>
        </li>
        <li>
          <Link href="/clientes" className="block p-2 rounded hover:bg-gray-700">
            Clientes
          </Link>
        </li>
        <li>
          <Link href="/centro_de_costos" className="block p-2 rounded hover:bg-gray-700">
            Centros de costos
          </Link>
        </li>
        <li>
          <Link href="/empresas" className="block p-2 rounded hover:bg-gray-700">
            Empresas
          </Link>
        </li>
        <li>
          <Link href="/terminales" className="block p-2 rounded hover:bg-gray-700">
            Terminales
          </Link>
        </li>
        <li>
          <Link href="/transacciones" className="block p-2 rounded hover:bg-gray-700">
            Transacciones
          </Link>
        </li>
        <li>
          <Link href="/configuraciones" className="block p-2 rounded hover:bg-gray-700">
            Configuración
          </Link>
        </li>
        <li>
          <Link href="#" className="block p-2 rounded hover:bg-gray-700">
            Mi cuenta
          </Link>
        </li>
        <li>
          <Link href="#" className="block p-2 rounded hover:bg-gray-700">
            Cerrar sesión
          </Link>
        </li>
      </ul>
    </nav>
  );
}
