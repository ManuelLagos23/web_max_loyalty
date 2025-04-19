import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { nombre, contraseña } = await request.json();
    console.log('Datos recibidos:', { nombre, contraseña });

    if (!nombre || !contraseña) {
      return NextResponse.json({ message: 'Faltan nombre o contraseña' }, { status: 400 });
    }

    const client = await pool.connect();
    console.log('Conexión a DB establecida');
   
    const result = await client.query(
      'SELECT id, nombre, password, email, num_telefono FROM usuarios WHERE email = $1',
      [nombre]
    );
    const usuario = result.rows[0];
    client.release();

    if (!usuario) {
      return NextResponse.json({ message: 'Correo no encontrado' }, { status: 401 });
    }

   
    if (contraseña !== usuario.password) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
    }

    
    const session = { 
      id: usuario.id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      num_telefono: usuario.num_telefono 
    };
   
    const response = NextResponse.json({ 
      message: 'Login exitoso', 
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        num_telefono: usuario.num_telefono 
      } 
    });
    response.cookies.set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: false, 
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    console.log('Cookie seteada:', response.cookies.get('session')); 
    return response;
  } catch (error) {
    console.error('Error en el login:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}