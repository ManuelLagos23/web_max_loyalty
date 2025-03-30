// src/app/api/transacciones/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar una nueva transacción
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const terminal_id = formData.get('terminal_id');

    // Validar que todos los campos sean correctos
    if (
      !cliente_id || !establecimiento_id || !fecha || !monto || !terminal_id ||
      typeof cliente_id !== 'string' || typeof establecimiento_id !== 'string' || 
      typeof fecha !== 'string' || typeof monto !== 'string' || typeof terminal_id !== 'string'
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO transacciones (cliente_id, establecimiento_id, fecha, monto, terminal_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, cliente_id, establecimiento_id, fecha, monto, terminal_id`,
      [cliente_id, establecimiento_id, fecha, monto, terminal_id]
    );
    client.release();

    return NextResponse.json({
      message: 'Transacción creada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar la transacción:', error);
    return NextResponse.json({ message: 'Error al crear la transacción' }, { status: 500 });
  }
}

// Método GET para obtener todas las transacciones
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, cliente_id, establecimiento_id, fecha, monto, terminal_id FROM transacciones`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return NextResponse.json({ message: 'Error al obtener las transacciones' }, { status: 500 });
  }
}

// Método PUT para actualizar una transacción
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id');
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const terminal_id = formData.get('terminal_id');

    // Validar que todos los campos sean correctos
    if (
      !id || !cliente_id || !establecimiento_id || !fecha || !monto || !terminal_id ||
      typeof cliente_id !== 'string' || typeof establecimiento_id !== 'string' ||
      typeof fecha !== 'string' || typeof monto !== 'string' || typeof terminal_id !== 'string'
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
      `UPDATE transacciones
       SET cliente_id = $1, establecimiento_id = $2, fecha = $3, monto = $4, terminal_id = $5
       WHERE id = $6 RETURNING id, cliente_id, establecimiento_id, fecha, monto, terminal_id`,
      [cliente_id, establecimiento_id, fecha, monto, terminal_id, idNumber]
    );
    client.release();

    // Si no se encontró la transacción
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró la transacción con el ID proporcionado' }, { status: 404 });
    }

    // Responder con el resultado
    return NextResponse.json({
      message: 'Transacción actualizada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar la transacción:', error);
    return NextResponse.json({ message: 'Error al actualizar la transacción' }, { status: 500 });
  }
}
