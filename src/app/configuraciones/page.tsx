'use client';

import Navbar from '../components/Navbar';
import SectionNavbar from '../components/SectionNavbar';

export default function Configuracion() {
  return (
    
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar /> 
        <main className="w-full p-8">
          
          <SectionNavbar />
          <h1>Selecciona uno de los items de arriba para configurarlos</h1>
        </main>
      </div>
    </div>
  );
}
