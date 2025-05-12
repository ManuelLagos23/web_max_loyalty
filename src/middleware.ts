import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
 

  const protectedRoutes = ['/inicio',  '/centro_de_costos', '/clientes' , '/componenets', '/configuraciones', '/empresas', '/estados',
    '/monedas', '/paises', '/puntos', '/redimir', '/terminales', '/transacciones', '/usuarios', '/miembros',
 ];
  if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
 
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (session && request.nextUrl.pathname === '/login') {
   
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/inicio/:path*', '/terminales/:path*', '/paises/:path*', '/centro_de_costos/:path*', '/clientes/:path*', '/components/:path*', 
    '/configuraciones/:path*',  '/empresas/:path*',  '/estados/:path*',  '/monedas/:path*', '/puntos/:path*', '/redimir/:path*',   
    '/transacciones/:path*', '/usuarios/:path*',  '/miembros/:path*' , '/login'], 
};