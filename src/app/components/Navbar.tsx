

export default function Navbar() {
  return (
    <nav className="w-1/10 bg-gray-800 text-white h-screen p-4 space-y-2">
      <div className="text-2xl font-bold mb-8 text-center text-white">Max Loyalty</div>
     <a href="/inicio"><img src="/images/logo-max-loyalty.png"  className="mb-8" /></a> 
      <ul className="space-y-2">
        <li>
          <a href="/usuarios" className="flex items-center p-2 rounded hover:bg-gray-700">Usuario</a>
        </li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Estaciones</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Clientes</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Centros de costos</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Empresar</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Terminales</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Configuración</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Mi cuenta</a></li>
        <li><a href="#" className="block p-2 rounded hover:bg-gray-700">Cerrar sesión</a></li>
      </ul>
    </nav>
  );
}
