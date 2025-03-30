// src/app/api/monedas/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar una nueva moneda
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const moneda = formData.get('moneda');

    if (!moneda || typeof moneda !== 'string') {
      return NextResponse.json({ message: 'La moneda es obligatoria y debe ser una cadena de texto' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO monedas (moneda) VALUES ($1) RETURNING id, moneda`,
      [moneda]
    );
    client.release();

    return NextResponse.json({
      message: 'Moneda creada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar la moneda:', error);
    return NextResponse.json({ message: 'Error al crear la moneda' }, { status: 500 });
  }
}

// Método GET para obtener todas las monedas
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT id, moneda FROM monedas`);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las monedas:', error);
    return NextResponse.json({ message: 'Error al obtener las monedas' }, { status: 500 });
  }
}

// Método PUT para actualizar una moneda
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const moneda = formData.get('moneda');

    if (!id || !moneda || typeof moneda !== 'string') {
      return NextResponse.json({ message: 'El ID y la moneda son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE monedas SET moneda = $1 WHERE id = $2 RETURNING id, moneda`,
      [moneda, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró la moneda con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Moneda actualizada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar la moneda:', error);
    return NextResponse.json({ message: 'Error al actualizar la moneda' }, { status: 500 });
  }
}
