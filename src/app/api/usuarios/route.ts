// src/app/api/usuarios/route.ts

import { NextResponse  } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const nombre = formData.get('nombre');
  const email = formData.get('email');
  const contraseña = formData.get('contraseña');
  const foto = formData.get('foto');
  const numTelefono = formData.get('num_telefono');

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO usuarios (nombre, email, password, img, num_telefono)
      VALUES ($1, $2, $3, $4, $5)`,
      [nombre, email, contraseña, foto, numTelefono]
    );

    client.release();

    return NextResponse.json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    return NextResponse.json({ message: 'Error al crear el usuario' }, { status: 500 });
  }
}



// 🚀 Nuevo método GET para obtener los usuarios
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre, email, img, num_telefono FROM usuarios`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener los usuarios' }, { status: 500 });
  }
}




export async function PUT(request: Request) {
    try {
      // Extraer los datos enviados en el formulario
      const formData = await request.formData();
      const id = formData.get('id');
      const nombre = formData.get('nombre');
      const email = formData.get('email');
      const numTelefono = formData.get('num_telefono');
  
      // Validar que el ID esté presente
      if (!id) {
        return NextResponse.json({ message: 'El ID del usuario es obligatorio' }, { status: 400 });
      }
  
      const client = await pool.connect();
  
      // Realiza la actualización del usuario y devuelve la fila actualizada
      const result = await client.query(
        `UPDATE usuarios 
         SET nombre = $1, email = $2,  num_telefono = $3 
         WHERE id = $4
         RETURNING *`,
        [nombre, email,  numTelefono, id]
      );
  
      client.release();
  
      return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return NextResponse.json({ message: 'Error al actualizar el usuario' }, { status: 500 });
    }
  }






