import Navbar from '../components/Navbar'; 

export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Max Loyalty</title>
      </head>
      <body className="font-sans bg-gray-100 text-gray-900">

        {/* Contenedor principal */}
        <div className="flex">

          {/* Navbar vertical */}
          <Navbar />  {/* Aquí insertamos el navbar como un componente */}

          {/* Contenido principal */}
          <main className="w-4/5 p-8">
            <h1 className="text-4xl font-semibold mb-4">Bienvenido a Max Loyalty</h1>
            <p className="text-lg text-gray-700">
              Esta es tu plataforma para gestionar tu fidelidad. Utiliza el menú de la izquierda para navegar entre las opciones disponibles.
            </p>
          </main>

        </div>

      </body>
    </html>
  );
}
