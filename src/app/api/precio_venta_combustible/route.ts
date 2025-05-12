import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo precio de venta de combustible
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const currency_id = formData.get('currency_id');
    const fecha_final = formData.get('fecha_final');
    const fecha_inicio = formData.get('fecha_inicio');
    const notas = formData.get('notas');
    const precio_sucursal_ids = formData.get('precio_sucursal_ids');
    const semana_year = formData.get('semana_year');

    if (!currency_id || isNaN(Number(currency_id)) || !fecha_inicio || !fecha_final || !notas || typeof notas !== 'string' ||
        !precio_sucursal_ids || isNaN(Number(precio_sucursal_ids)) || !semana_year || isNaN(Number(semana_year))) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO precio_venta_combustible (currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year`,
      [currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year]
    );
    client.release();

    return NextResponse.json({
      message: 'Precio de venta creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el precio de venta:', error);
    return NextResponse.json({ message: 'Error al crear el precio de venta' }, { status: 500 });
  }
}

// Método GET para obtener todos los precios de venta
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const client = await pool.connect();
    const offset = (page - 1) * limit;
    const result = await client.query(
      `
      SELECT p.id, p.currency_id, p.fecha_final, p.fecha_inicio, p.notas, p.precio_sucursal_ids, p.semana_year, c.name AS currency_nombre
      FROM precio_venta_combustible p
      JOIN currencies c ON p.currency_id = c.id
      WHERE p.notas ILIKE $1 OR p.semana_year::text ILIKE $1
      ORDER BY p.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM precio_venta_combustible p
      JOIN currencies c ON p.currency_id = c.id
      WHERE p.notas ILIKE $1 OR p.semana_year::text ILIKE $1
      `,
      [`%${search}%`]
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    client.release();

    return NextResponse.json({
      data: result.rows,
      total,
    });
  } catch (error) {
    console.error('Error al obtener los precios de venta:', error);
    return NextResponse.json({ message: 'Error al obtener los precios de venta' }, { status: 500 });
  }
}

// Método PUT para actualizar un precio de venta
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const currency_id = formData.get('currency_id');
    const fecha_final = formData.get('fecha_final');
    const fecha_inicio = formData.get('fecha_inicio');
    const notas = formData.get('notas');
    const precio_sucursal_ids = formData.get('precio_sucursal_ids');
    const semana_year = formData.get('semana_year');

    if (!id || !currency_id || isNaN(Number(currency_id)) || !fecha_inicio || !fecha_final || !notas || typeof notas !== 'string' ||
        !precio_sucursal_ids || isNaN(Number(precio_sucursal_ids)) || !semana_year || isNaN(Number(semana_year))) {
      return NextResponse.json(
        { message: 'El ID y todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE precio_venta_combustible SET currency_id = $1, fecha_final = $2, fecha_inicio = $3, notas = $4, precio_sucursal_ids = $5, semana_year = $6 
       WHERE id = $7 
       RETURNING id, currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year`,
      [currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el precio de venta con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Precio de venta actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el precio de venta:', error);
    return NextResponse.json({ message: 'Error al actualizar el precio de venta' }, { status: 500 });
  }
}

// Método DELETE para eliminar un precio de venta
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM precio_venta_combustible WHERE id = $1 RETURNING id, currency_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el precio de venta con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Precio de venta eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el precio de venta:', error);
    return NextResponse.json({ message: 'Error al eliminar el precio de venta' }, { status: 500 });
  }
}