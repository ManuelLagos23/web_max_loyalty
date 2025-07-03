'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedModal() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      router.replace('/inicio', { scroll: false });
    }
  }, [isOpen, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md">
      <div className="p-6 rounded-lg shadow-lg border-1">
        <h2 className="text-xl font-bold mb-4">Acceso No Autorizado</h2>
        <p className="mb-4">No tienes permisos para acceder a esta página.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setIsOpen(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}