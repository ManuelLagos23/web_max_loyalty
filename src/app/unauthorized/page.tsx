import { Suspense } from 'react';
import Navbar from './../components/Navbar';
import UnauthorizedModal from './../components/UnauthorizedModal';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <Suspense fallback={<div>Cargando...</div>}>
          <UnauthorizedModal />
        </Suspense>
      </div>
    </div>
  );
}