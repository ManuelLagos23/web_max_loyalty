// src/app/api/usuarios/route.ts

import { NextResponse  } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const nombre = formData.get('nombre');
  const pais = formData.get('pais');
  const estado = formData.get('estado');
  const ciudad = formData.get('ciudad');
  const email = formData.get('email');
  const telefono = formData.get('telefono');
  const nfi = formData.get('nfi');
 
  const logo = formData.get('logo');
 

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO clientes (nombre, pais, estado, ciudad, email, telefono, nfi, logo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nombre,  pais, estado, ciudad, email, telefono, nfi, logo]
    );

    client.release();

    return NextResponse.json({ message: 'Cliente creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    return NextResponse.json({ message: 'Error al crear el cliente' }, { status: 500 });
  }
}



// 🚀 Nuevo método GET para obtener los usuarios
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre, pais, estado, ciudad, email, telefono, nfi FROM clientes`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    return NextResponse.json({ message: 'Error al obtener los clientes' }, { status: 500 });
  }
}




export async function PUT(request: Request) {
    try {
      // Extraer los datos enviados en el formulario
      const formData = await request.formData();
      const id = formData.get('id');
      const nombre = formData.get('nombre');
      const pais = formData.get('pais');
      const estado = formData.get('estado');
      const ciudad = formData.get('ciudad');
      const email = formData.get('email');
      const telefono = formData.get('telefono');
      const nfi = formData.get('nfi');
  
      // Validar que el ID esté presente
      if (!id) {
        return NextResponse.json({ message: 'El ID del cliente es obligatorio' }, { status: 400 });
      }
  
      const client = await pool.connect();
  
      // Realiza la actualización del usuario y devuelve la fila actualizada
      const result = await client.query(
        `UPDATE clientes 
         SET nombre = $1, pais = $2,  estado = $3, ciudad = $4, email = $5, telefono = $6, nfi = $7 
         WHERE id = $8
         RETURNING *`,
        [nombre, pais,  estado, ciudad, email, telefono, nfi, id]
      );
  
      client.release();
  
      return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
      return NextResponse.json({ message: 'Error al actualizar el cliene' }, { status: 500 });
    }
  }



