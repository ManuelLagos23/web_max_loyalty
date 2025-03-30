// src/app/api/terminales/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Crear un pool de conexión con la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🚀 Método POST para crear una nueva terminal
export async function POST(request: Request) {
  const formData = await request.formData();

  // Obtener los valores del formulario
  const empresa = formData.get('empresa');
  const estacion_servicio = formData.get('estacion_servicio');
  const codigo_terminal = formData.get('codigo_terminal');
  const nombre_terminal = formData.get('nombre_terminal');

  try {
    const client = await pool.connect();

    // Insertar los datos en la tabla "terminales"
    await client.query(
      `INSERT INTO terminales (empresa, estacion_servicio, codigo_terminal, nombre_terminal)
      VALUES ($1, $2, $3, $4)`,
      [empresa, estacion_servicio, codigo_terminal, nombre_terminal]
    );

    client.release();

    return NextResponse.json({ message: 'Terminal creada con éxito' });
  } catch (error) {
    console.error('Error al guardar la terminal:', error);
    return NextResponse.json({ message: 'Error al crear la terminal' }, { status: 500 });
  }
}

// 🚀 Método GET para obtener todas las terminales
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, empresa, estacion_servicio, codigo_terminal, nombre_terminal FROM terminales`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las terminales:', error);
    return NextResponse.json({ message: 'Error al obtener las terminales' }, { status: 500 });
  }
}

// 🚀 Método PUT para actualizar los datos de una terminal
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const empresa = formData.get('empresa');
    const estacion_servicio = formData.get('estacion_servicio');
    const codigo_terminal = formData.get('codigo_terminal');
    const nombre_terminal = formData.get('nombre_terminal');

    // Validar que el ID esté presente
    if (!id) {
      return NextResponse.json({ message: 'El ID de la terminal es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    // Realizar la actualización de los datos
    const result = await client.query(
      `UPDATE terminales
       SET empresa = $1, estacion_servicio = $2, codigo_terminal = $3, nombre_terminal = $4
       WHERE id = $5
       RETURNING *`,
      [empresa, estacion_servicio, codigo_terminal, nombre_terminal, id]
    );

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la terminal:', error);
    return NextResponse.json({ message: 'Error al actualizar la terminal' }, { status: 500 });
  }
}

