import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar una nueva unidad de medida
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const display_name = formData.get('display_name');
    const factor = formData.get('factor');
    const factor_inv = formData.get('factor_inv');
    const is_pos_groupable = formData.get('is_pos_groupable') === 'true';
    const name = formData.get('name');
    const rounding = formData.get('rounding');
    const uom_type = formData.get('uom_type');

    if (
      !name ||
      typeof name !== 'string' ||
      !uom_type ||
      typeof uom_type !== 'string' ||
      !display_name ||
      typeof display_name !== 'string' ||
      !factor ||
      isNaN(Number(factor)) ||
      !factor_inv ||
      isNaN(Number(factor_inv)) ||
      !rounding ||
      isNaN(Number(rounding))
    ) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO unidad_medida_producto (display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type`,
      [display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type]
    );
    client.release();

    return NextResponse.json({
      message: 'Unidad de medida creada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar la unidad de medida:', error);
    return NextResponse.json({ message: 'Error al crear la unidad de medida' }, { status: 500 });
  }
}

// Método GET para obtener todas las unidades de medida
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
      SELECT u.id, u.display_name, u.factor, u.factor_inv, u.is_pos_groupable, u.name, u.rounding, u.uom_type
      FROM unidad_medida_producto u
      WHERE u.name ILIKE $1 OR u.display_name ILIKE $1
      ORDER BY u.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM unidad_medida_producto u
      WHERE u.name ILIKE $1 OR u.display_name ILIKE $1
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
    console.error('Error al obtener las unidades de medida:', error);
    return NextResponse.json({ message: 'Error al obtener las unidades de medida' }, { status: 500 });
  }
}

// Método PUT para actualizar una unidad de medida
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const display_name = formData.get('display_name');
    const factor = formData.get('factor');
    const factor_inv = formData.get('factor_inv');
    const is_pos_groupable = formData.get('is_pos_groupable') === 'true';
    const name = formData.get('name');
    const rounding = formData.get('rounding');
    const uom_type = formData.get('uom_type');

    if (
      !id ||
      !name ||
      typeof name !== 'string' ||
      !uom_type ||
      typeof uom_type !== 'string' ||
      !display_name ||
      typeof display_name !== 'string' ||
      !factor ||
      isNaN(Number(factor)) ||
      !factor_inv ||
      isNaN(Number(factor_inv)) ||
      !rounding ||
      isNaN(Number(rounding))
    ) {
      return NextResponse.json(
        { message: 'El ID y todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE unidad_medida_producto 
       SET display_name = $1, factor = $2, factor_inv = $3, is_pos_groupable = $4, name = $5, rounding = $6, uom_type = $7 
       WHERE id = $8 
       RETURNING id, display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type`,
      [display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró la unidad de medida con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Unidad de medida actualizada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar la unidad de medida:', error);
    return NextResponse.json({ message: 'Error al actualizar la unidad de medida' }, { status: 500 });
  }
}

// Método DELETE para eliminar una unidad de medida
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM unidad_medida_producto 
       WHERE id = $1 
       RETURNING id, display_name, factor, factor_inv, is_pos_groupable, name, rounding, uom_type`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró la unidad de medida con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Unidad de medida eliminada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar la unidad de medida:', error);
    return NextResponse.json({ message: 'Error al eliminar la unidad de medida' }, { status: 500 });
  }
}