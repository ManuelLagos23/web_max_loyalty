// src/app/api/estados/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo estado
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const estado = formData.get('estado');

    if (!estado || typeof estado !== 'string') {
      return NextResponse.json({ message: 'El estado es obligatorio y debe ser una cadena de texto' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO estados (estado) VALUES ($1) RETURNING id, estado`,
      [estado]
    );
    client.release();

    return NextResponse.json({
      message: 'Estado creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el estado:', error);
    return NextResponse.json({ message: 'Error al crear el estado' }, { status: 500 });
  }
}

// Método GET para obtener todos los estados
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT id, estado FROM estados`);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los estados:', error);
    return NextResponse.json({ message: 'Error al obtener los estados' }, { status: 500 });
  }
}

// Método PUT para actualizar un estado
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const estado = formData.get('estado');

    if (!id || !estado || typeof estado !== 'string') {
      return NextResponse.json({ message: 'El ID y el estado son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE estados SET estado = $1 WHERE id = $2 RETURNING id, estado`,
      [estado, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el estado con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Estado actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return NextResponse.json({ message: 'Error al actualizar el estado' }, { status: 500 });
  }
}
