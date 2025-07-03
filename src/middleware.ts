import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const requestedPath = request.nextUrl.pathname;

  const protectedRoutes = [
    '/canales',
    '/centro_costos',
    '/clientes',
    '/components',
    '/conductores',
    '/cuenta',
    '/descuentos',
    '/empresas',
    '/estados',
    '/generales',
    '/max_loyalty',
    '/max_pay',
    '/miembros',
    '/monedas',
    '/monedero_flota',
    '/paises',
    '/permisos',
    '/precios_semana',
    '/puntos',
    '/redimir',
    '/reportes_flota',
    '/reportes_transacciones',
    '/sub_canales',
    '/tarjetas',
    '/terminales',
    '/tipo_combustible',
    '/tipo_de_tarjetas',
    '/transacciones',
    '/transacciones_flota',
    '/turnos',
    '/unidad_medida',
    '/usuarios',
    '/vehiculos',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    requestedPath.startsWith(route)
  );

  console.log(`[Middleware] Ruta solicitada: ${requestedPath}, Es protegida: ${isProtectedRoute}, Sesión: ${!!session}`);

  if (requestedPath === '/login' || requestedPath === '/unauthorized') {
    console.log(`[Middleware] Acceso permitido a ${requestedPath} para todos`);
    return NextResponse.next();
  }

  if (!session && (isProtectedRoute || requestedPath === '/inicio')) {
    console.log('[Middleware] No hay sesión, redirigiendo a /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && requestedPath === '/inicio') {
    console.log('[Middleware] Acceso permitido a /inicio para usuario autenticado');
    return NextResponse.next();
  }

  if (session && isProtectedRoute) {
    try {
      const user = JSON.parse(session);
      const userId = user.id;

      if (!userId) {
        console.log('[Middleware] ID de usuario no encontrado en la sesión');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`[Middleware] Verificando permisos para usuario ID: ${userId}, ruta: ${requestedPath}`);

      const permissionResponse = await fetch(
        `${request.nextUrl.origin}/api/check-permissions?userId=${userId}&path=${encodeURIComponent(requestedPath)}`,
        {
          headers: {
            Cookie: `session=${session}`,
          },
        }
      );

      const permissionData = await permissionResponse.json();

      if (!permissionResponse.ok || !permissionData.allowed) {
        console.log(`[Middleware] Permiso denegado para ${requestedPath}: ${permissionData.message || 'Sin permisos'}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`[Middleware] Permiso concedido para ${requestedPath}`);
      return NextResponse.next();
    } catch (error) {
      console.error(`[Middleware] Error verificando permisos para ${requestedPath}:`, error);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  console.log(`[Middleware] Acceso permitido a ${requestedPath} (no protegida)`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/canales/:path*',
    '/centro_costos/:path*',
    '/clientes/:path*',
    '/components/:path*',
    '/conductores/:path*',
    '/cuenta/:path*',
    '/descuentos/:path*',
    '/empresas/:path*',
    '/estados/:path*',
    '/generales/:path*',
    '/inicio/:path*',
    '/max_loyalty/:path*',
    '/max_pay/:path*',
    '/miembros/:path*',
    '/monedas/:path*',
    '/monedero_flota/:path*',
    '/paises/:path*',
    '/permisos/:path*',
    '/precios_semana/:path*',
    '/puntos/:path*',
    '/redimir/:path*',
    '/reportes_flota/:path*',
    '/reportes_transacciones/:path*',
    '/sub_canales/:path*',
    '/tarjetas/:path*',
    '/terminales/:path*',
    '/tipo_combustible/:path*',
    '/tipo_de_tarjetas/:path*',
    '/transacciones/:path*',
    '/transacciones_flota/:path*',
    '/turnos/:path*',
    '/unidad_medida/:path*',
    '/usuarios/:path*',
    '/vehiculos/:path*',
    '/login',
    '/unauthorized',
  ],
};