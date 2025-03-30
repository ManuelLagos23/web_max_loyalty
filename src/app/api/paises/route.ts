// src/app/api/paises/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo país
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pais = formData.get('pais');

    if (!pais || typeof pais !== 'string') {
      return NextResponse.json({ message: 'El país es obligatorio y debe ser una cadena de texto' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO paises (pais) VALUES ($1) RETURNING id, pais`,
      [pais]
    );
    client.release();

    return NextResponse.json({
      message: 'País creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el país:', error);
    return NextResponse.json({ message: 'Error al crear el país' }, { status: 500 });
  }
}

// Método GET para obtener todos los países
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT id, pais FROM paises`);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los países:', error);
    return NextResponse.json({ message: 'Error al obtener los países' }, { status: 500 });
  }
}

// Método PUT para actualizar un país
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const pais = formData.get('pais');

    if (!id || !pais || typeof pais !== 'string') {
      return NextResponse.json({ message: 'El ID y el país son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE paises SET pais = $1 WHERE id = $2 RETURNING id, pais`,
      [pais, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el país con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'País actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el país:', error);
    return NextResponse.json({ message: 'Error al actualizar el país' }, { status: 500 });
  }
}
