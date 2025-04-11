// src/app/api/puntos/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const cliente_id = formData.get('cliente_id');
  const transaccion_id = formData.get('transaccion_id');
  const canjeados_id = formData.get('canjeados_id');
  const debe = formData.get('debe');
  const haber = formData.get('haber');

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO puntos (cliente_id, transaccion_id, debe, haber, canjeados_id, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [cliente_id, transaccion_id, debe, haber, canjeados_id]
    );

    client.release();

    return NextResponse.json({ message: 'Punto creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el punto:', error);
    return NextResponse.json({ message: 'Error al crear el punto' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, cliente_id, transaccion_id, debe, haber, canjeados_id 
       FROM puntos`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los puntos:', error);
    return NextResponse.json({ message: 'Error al obtener los puntos' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const cliente_id = formData.get('cliente_id');
    const transaccion_id = formData.get('transaccion_id');
    const canjeados_id = formData.get('canjeados_id');
    const debe = formData.get('debe');
    const haber = formData.get('haber');

    if (!id) {
      return NextResponse.json({ message: 'El ID del punto es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    const result = await client.query(
      `UPDATE puntos 
       SET cliente_id = $1, transaccion_id = $2, debe = $3, haber = $4, canjeados_id = $5
       WHERE id = $6
       RETURNING *`,
      [cliente_id, transaccion_id, debe, haber, canjeados_id, id]
    );

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el punto:', error);
    return NextResponse.json({ message: 'Error al actualizar el punto' }, { status: 500 });
  }
}