// src/app/api/miembros/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const nombre = formData.get('nombre');
  const user = formData.get('user');
  const email = formData.get('email');
  const establecimiento = formData.get('establecimiento');
  const password = formData.get('password');

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO miembros (nombre, "user", email, establecimiento, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [nombre, user, email, establecimiento, password]
    );

    client.release();

    return NextResponse.json({ message: 'Miembro creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el miembro:', error);
    return NextResponse.json({ message: 'Error al crear el miembro' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre, "user", email, establecimiento FROM miembros`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los miembros:', error);
    return NextResponse.json({ message: 'Error al obtener los miembros' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const nombre = formData.get('nombre');
    const user = formData.get('user');
    const email = formData.get('email');
    const establecimiento = formData.get('establecimiento');

    if (!id) {
      return NextResponse.json({ message: 'El ID del miembro es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    const result = await client.query(
      `UPDATE miembros 
       SET nombre = $1, "user" = $2, email = $3, establecimiento = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, user, email, establecimiento, id]
    );

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el miembro:', error);
    return NextResponse.json({ message: 'Error al actualizar el miembro' }, { status: 500 });
  }
}