// src/app/api/costos/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Crear un pool de conexión con la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🚀 Método POST para crear un nuevo centro de costos
export async function POST(request: Request) {
  const formData = await request.formData();

  // Obtener los valores del formulario
  const nombre_centro_costos = formData.get('nombre_centro_costos');
  const pais = formData.get('pais');
  const estado = formData.get('estado');
  const ciudad = formData.get('ciudad');
  const alias = formData.get('alias');
  const codigo = formData.get('codigo');
  const empresa = formData.get('empresa');

  try {
    const client = await pool.connect();

    // Insertar los datos en la tabla "costos"
    await client.query(
      `INSERT INTO costos (nombre_centro_costos, pais, estado, ciudad, alias, codigo, empresa)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre_centro_costos, pais, estado, ciudad, alias, codigo, empresa]
    );

    client.release();

    return NextResponse.json({ message: 'Centro de costos creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el centro de costos:', error);
    return NextResponse.json({ message: 'Error al crear el centro de costos' }, { status: 500 });
  }
}

// 🚀 Método GET para obtener todos los centros de costos
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre_centro_costos, pais, estado, ciudad, alias, codigo, empresa FROM costos`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los centros de costos:', error);
    return NextResponse.json({ message: 'Error al obtener los centros de costos' }, { status: 500 });
  }
}

// 🚀 Método PUT para actualizar los datos de un centro de costos
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const nombre_centro_costos = formData.get('nombre_centro_costos');
    const pais = formData.get('pais');
    const estado = formData.get('estado');
    const ciudad = formData.get('ciudad');
    const alias = formData.get('alias');
    const codigo = formData.get('codigo');
    const empresa = formData.get('empresa');

    // Validar que el ID esté presente
    if (!id) {
      return NextResponse.json({ message: 'El ID del centro de costos es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    // Realizar la actualización de los datos
    const result = await client.query(
      `UPDATE costos
       SET nombre_centro_costos = $1, pais = $2, estado = $3, ciudad = $4, alias = $5, codigo = $6, empresa = $7
       WHERE id = $8
       RETURNING *`,
      [nombre_centro_costos, pais, estado, ciudad, alias, codigo, empresa, id]
    );

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el centro de costos:', error);
    return NextResponse.json({ message: 'Error al actualizar el centro de costos' }, { status: 500 });
  }
}
