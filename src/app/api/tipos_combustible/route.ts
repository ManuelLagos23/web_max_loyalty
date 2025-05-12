import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo tipo de combustible
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const udm_id = formData.get('udm_id');

    if (!name || typeof name !== 'string' || !udm_id || isNaN(Number(udm_id))) {
      return NextResponse.json(
        { message: 'El nombre y la unidad de medida (udm_id) son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO tipo_combustible (name, udm_id) VALUES ($1, $2) RETURNING id, name, udm_id`,
      [name, udm_id]
    );
    client.release();

    return NextResponse.json({
      message: 'Tipo de combustible creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el tipo de combustible:', error);
    return NextResponse.json({ message: 'Error al crear el tipo de combustible' }, { status: 500 });
  }
}

// Método GET para obtener todos los tipos de combustible
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
      SELECT tc.id, tc.name, tc.udm_id, u.name AS udm_nombre
      FROM tipo_combustible tc
      JOIN unidad_medida_producto u ON tc.udm_id = u.id
      WHERE tc.name ILIKE $1
      ORDER BY tc.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM tipo_combustible tc
      JOIN unidad_medida_producto u ON tc.udm_id = u.id
      WHERE tc.name ILIKE $1
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
    console.error('Error al obtener los tipos de combustible:', error);
    return NextResponse.json({ message: 'Error al obtener los tipos de combustible' }, { status: 500 });
  }
}

// Método PUT para actualizar un tipo de combustible
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const udm_id = formData.get('udm_id');

    if (!id || !name || typeof name !== 'string' || !udm_id || isNaN(Number(udm_id))) {
      return NextResponse.json(
        { message: 'El ID, el nombre y la unidad de medida (udm_id) son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }


    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE tipo_combustible SET name = $1, udm_id = $2 WHERE id = $3 RETURNING id, name, udm_id`,
      [name, udm_id, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el tipo de combustible con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Tipo de combustible actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el tipo de combustible:', error);
    return NextResponse.json({ message: 'Error al actualizar el tipo de combustible' }, { status: 500 });
  }
}

// Método DELETE para eliminar un tipo de combustible
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM tipo_combustible WHERE id = $1 RETURNING id, name, udm_id`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el tipo de combustible con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Tipo de combustible eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el tipo de combustible:', error);
    return NextResponse.json({ message: 'Error al eliminar el tipo de combustible' }, { status: 500 });
  }
}