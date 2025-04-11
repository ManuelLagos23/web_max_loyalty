import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' });
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: false, // Cambiado a false para pruebas locales sin HTTPS
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}