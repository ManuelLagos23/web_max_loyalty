'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [nombre, setNombre] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, contraseña }),
      });

      console.log('Estado de la respuesta:', response.status);
      const data = await response.json();
      console.log('Datos de la respuesta:', data);

      if (response.ok) {
        console.log('Login exitoso, redirigiendo a /inicio');
        router.push('/inicio');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-max-loyalty-bg.png" alt="Logo" width={200} height={200} />
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nombre" className="block text-center font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-2 w-full p-3 border border-gray-300 rounded-md text-center"
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="contraseña" className="block text-center font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="mt-2 w-full p-3 border border-gray-300 rounded-md text-center"
              required
            />
          </div>
          {error && <p className="text-red-500 text-base mb-6">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 text-lg"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}