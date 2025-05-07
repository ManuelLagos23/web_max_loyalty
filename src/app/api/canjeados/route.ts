// src/app/api/canjeados/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo canjeado
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const puntos_canjeados = formData.get('puntos_canjeados');
    const terminal_id = formData.get('terminal_id');

    // Validar que todos los campos sean correctos
    if (
      !cliente_id || !establecimiento_id || !fecha || !puntos_canjeados || !terminal_id ||
      typeof cliente_id !== 'string' || typeof establecimiento_id !== 'string' || 
      typeof fecha !== 'string' || typeof puntos_canjeados !== 'string' || typeof terminal_id !== 'string'
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO canjeados (cliente_id, establecimiento_id, created_at, puntos_canjeados, terminal_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, cliente_id, establecimiento_id, fecha, puntos_canjeados, terminal_id`,
      [cliente_id, establecimiento_id, fecha, puntos_canjeados, terminal_id]
    );
    client.release();

    return NextResponse.json({
      message: 'Canjeado creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el canjeado:', error);
    return NextResponse.json({ message: 'Error al crear el canjeado' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT c.id, c.cliente_id, cl.nombre AS cliente_nombre, cs.nombre_centro_costos AS establecimiento_id, 
       tr.nombre_terminal AS terminal_id, c.created_at, c.puntos_canjeados, c.numero_tarjeta, c.estado
       FROM canjeados c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN costos cs ON c.establecimiento_id = cs.id
       LEFT JOIN terminales tr ON c.terminal_id = tr.id`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los canjeados:', error);
    return NextResponse.json({ message: 'Error al obtener los canjeados' }, { status: 500 });
  }
}
// Método PUT para actualizar un canjeado
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id');
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const puntos_canjeados = formData.get('puntos_canjeados');
    const terminal_id = formData.get('terminal_id');

    // Validar que todos los campos sean correctos
    if (
      !id || !cliente_id || !establecimiento_id || !fecha || !puntos_canjeados || !terminal_id ||
      typeof cliente_id !== 'string' || typeof establecimiento_id !== 'string' ||
      typeof fecha !== 'string' || typeof puntos_canjeados !== 'string' || typeof terminal_id !== 'string'
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    // Convertir id a número (si es necesario)
    const idNumber = parseInt(id as string, 10);
    if (isNaN(idNumber)) {
      return NextResponse.json({ message: 'El ID debe ser un número válido' }, { status: 400 });
    }

    // Realizar la actualización en la base de datos
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE canjeados
       SET cliente_id = $1, establecimiento_id = $2, created_at = $3, puntos_canjeados = $4, terminal_id = $5
       WHERE id = $6 RETURNING id, cliente_id, establecimiento_id, created_at, puntos_canjeados, terminal_id`,
      [cliente_id, establecimiento_id, fecha, puntos_canjeados, terminal_id, idNumber]
    );
    client.release();

    // Si no se encontró el canjeado
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el canjeado con el ID proporcionado' }, { status: 404 });
    }

    // Responder con el resultado
    return NextResponse.json({
      message: 'Canjeado actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el canjeado:', error);
    return NextResponse.json({ message: 'Error al actualizar el canjeado' }, { status: 500 });
  }
}