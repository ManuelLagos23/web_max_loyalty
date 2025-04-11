import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  console.log('Middleware - Session:', !!session); // Muestra si hay sesión
  console.log('Middleware - Path:', request.nextUrl.pathname);


  const protectedRoutes = ['/inicio',  '/centro_de_costos', '/clientes' , '/componenets', '/configuraciones', '/empresas', '/estados',
    '/monedas', '/paises', '/puntos', '/redimir', '/terminales', '/transacciones', '/usuarios', '/miembros',
 ];
  if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    console.log(`Redirigiendo a /login desde ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (session && request.nextUrl.pathname === '/login') {
    console.log('Redirigiendo a /inicio desde /login');
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/inicio/:path*', '/terminales/:path*', '/paises/:path*', '/centro_de_costos/:path*', '/clientes/:path*', '/components/:path*', 
    '/configuraciones/:path*',  '/empresas/:path*',  '/estados/:path*',  '/monedas/:path*', '/puntos/:path*', '/redimir/:path*',   
    '/transacciones/:path*', '/usuarios/:path*',  '/miembros/:path*' , '/login'], 
};