
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ message: 'No hay sesión activa' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, nombre, email, num_telefono, encode(img, \'base64\') as img, admin FROM usuarios WHERE id = $1',
      [session.id]
    );
    const usuario = result.rows[0];
    client.release();

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
    }

    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      num_telefono: usuario.num_telefono,
      img: usuario.img,
      admin: usuario.admin,
    });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
