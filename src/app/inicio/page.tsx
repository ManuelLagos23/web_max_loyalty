import Navbar from '../components/Navbar'; 

export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Max Loyalty</title>
      </head>
      <body className="font-sans bg-gray-100 text-gray-900 min-h-screen">
        <div className="flex">
          <Navbar />  

         
          <main 
            className="w-5/5 p-8 bg-white bg-opacity-90 rounded-lg" 
            style={{
              backgroundImage: 'url("/images/logo-max-loyalty-black.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <h1 className="text-4xl font-semibold mb-4 text-gray-900">Bienvenido a Max Loyalty</h1>
            <p className="text-lg text-gray-700">
              Esta es tu plataforma para gestionar tu fidelidad.
            </p>
          </main>
        </div>
      </body>
    </html>
  );
}