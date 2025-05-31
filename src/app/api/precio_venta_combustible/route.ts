import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo precio de venta de combustible
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const monedas_id = formData.get('monedas_id');
    const fecha_final = formData.get('fecha_final');
    const fecha_inicio = formData.get('fecha_inicio');
    const notas = formData.get('notas');
    const precio_sucursal_ids = formData.get('precio_sucursal_ids');
    const semana_year = formData.get('semana_year');
    const precio = formData.get('precio');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    if (
      !monedas_id || isNaN(Number(monedas_id)) ||
      !fecha_inicio || !fecha_final ||
      !notas || typeof notas !== 'string' ||
      !precio_sucursal_ids || isNaN(Number(precio_sucursal_ids)) ||
      !semana_year || isNaN(Number(semana_year)) ||
      !precio || isNaN(Number(precio)) ||
      !tipo_combustible_id || isNaN(Number(tipo_combustible_id))
    ) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios y deben ser válidos (monedas_id, fecha_inicio, fecha_final, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id)' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO precio_venta_combustible (monedas_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, monedas_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id`,
      [Number(monedas_id), fecha_final, fecha_inicio, notas, Number(precio_sucursal_ids), Number(semana_year), Number(precio), Number(tipo_combustible_id)]
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
    const fechaInicio = searchParams.get('fechaInicio') || '';
    const fechaFinal = searchParams.get('fechaFinal') || '';

    const client = await pool.connect();
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id, p.monedas_id, p.fecha_final, p.fecha_inicio, p.notas, p.precio_sucursal_ids, 
        p.semana_year, p.precio, p.tipo_combustible_id,
        m.moneda AS monedas_nombre,
        tc.name AS tipo_combustible_nombre
      FROM precio_venta_combustible p
      JOIN monedas m ON p.monedas_id = m.id
      JOIN tipo_combustible tc ON p.tipo_combustible_id = tc.id
      WHERE (p.notas ILIKE $1 OR p.semana_year::text ILIKE $1)
    `;
    let totalQuery = `
      SELECT COUNT(*) AS total
      FROM precio_venta_combustible p
      JOIN monedas m ON p.monedas_id = m.id
      JOIN tipo_combustible tc ON p.tipo_combustible_id = tc.id
      WHERE (p.notas ILIKE $1 OR p.semana_year::text ILIKE $1)
    `;
    const queryParams: (string | number)[] = [`%${search}%`];
    const totalParams: (string | number)[] = [`%${search}%`];

    if (fechaInicio && fechaFinal) {
      query += ` AND p.fecha_inicio >= $2 AND p.fecha_final <= $3`;
      totalQuery += ` AND p.fecha_inicio >= $2 AND p.fecha_final <= $3`;
      queryParams.push(fechaInicio, fechaFinal);
      totalParams.push(fechaInicio, fechaFinal);
    }

    query += ` ORDER BY p.id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await client.query(query, queryParams);
    const totalResult = await client.query(totalQuery, totalParams);

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
    const monedas_id = formData.get('monedas_id');
    const fecha_final = formData.get('fecha_final');
    const fecha_inicio = formData.get('fecha_inicio');
    const notas = formData.get('notas');
    const precio_sucursal_ids = formData.get('precio_sucursal_ids');
    const semana_year = formData.get('semana_year');
    const precio = formData.get('precio');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    if (
      !id || isNaN(Number(id)) ||
      !monedas_id || isNaN(Number(monedas_id)) ||
      !fecha_inicio || !fecha_final ||
      !notas || typeof notas !== 'string' ||
      !precio_sucursal_ids || isNaN(Number(precio_sucursal_ids)) ||
      !semana_year || isNaN(Number(semana_year)) ||
      !precio || isNaN(Number(precio)) ||
      !tipo_combustible_id || isNaN(Number(tipo_combustible_id))
    ) {
      return NextResponse.json(
        { message: 'El ID y todos los campos son obligatorios y deben ser válidos (monedas_id, fecha_inicio, fecha_final, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id)' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE precio_venta_combustible 
       SET monedas_id = $1, fecha_final = $2, fecha_inicio = $3, notas = $4, 
           precio_sucursal_ids = $5, semana_year = $6, precio = $7, tipo_combustible_id = $8
       WHERE id = $9 
       RETURNING id, monedas_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id`,
      [Number(monedas_id), fecha_final, fecha_inicio, notas, Number(precio_sucursal_ids), Number(semana_year), Number(precio), Number(tipo_combustible_id), Number(id)]
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM precio_venta_combustible 
       WHERE id = $1 
       RETURNING id, monedas_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id`,
      [Number(id)]
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