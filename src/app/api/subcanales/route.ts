import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo subcanal
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const subcanal = formData.get('subcanal');
    const subcanal_codigo = formData.get('subcanal_codigo');
    const canal_id = formData.get('canal_id');

    if (
      !subcanal ||
      typeof subcanal !== 'string' ||
      !subcanal_codigo ||
      typeof subcanal_codigo !== 'string' ||
      !canal_id ||
      isNaN(Number(canal_id))
    ) {
      return NextResponse.json(
        { message: 'El subcanal, el código del subcanal y el ID del canal son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO subcanales (subcanal, subcanal_codigo, canal_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, subcanal, subcanal_codigo, canal_id, 
       (SELECT canal FROM canales WHERE id = $3) AS canal_nombre`,
      [subcanal, subcanal_codigo, Number(canal_id)]
    );
    client.release();

    return NextResponse.json({
      message: 'Subcanal creado con éxito',
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Error al guardar el subcanal:', error);
    return NextResponse.json({ message: 'Error al crear el subcanal' }, { status: 500 });
  }
}

// Método GET para obtener subcanales, con soporte para filtrado por canal_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const canalId = searchParams.get('canal_id');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    let query = `SELECT s.id, s.subcanal, s.subcanal_codigo, s.canal_id, c.canal AS canal_nombre 
                 FROM subcanales s 
                 JOIN canales c ON s.canal_id = c.id`;
    const values: number[] = [limit, offset];

    if (canalId && !isNaN(Number(canalId))) {
      query += ` WHERE s.canal_id = $${values.length + 1}`;
      values.push(Number(canalId));
    }

    query += ` ORDER BY s.id LIMIT $1 OFFSET $2`;

    const result = await client.query(query, values);
    client.release();


    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al obtener los subcanales:', error);
    return NextResponse.json({ message: 'Error al obtener los subcanales', error: String(error) }, { status: 500 });
  }
}

// Método PUT para actualizar un subcanal
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const subcanal = formData.get('subcanal');
    const subcanal_codigo = formData.get('subcanal_codigo');
    const canal_id = formData.get('canal_id');

    if (
      !id ||
      isNaN(Number(id)) ||
      !subcanal ||
      typeof subcanal !== 'string' ||
      !subcanal_codigo ||
      typeof subcanal_codigo !== 'string' ||
      !canal_id ||
      isNaN(Number(canal_id))
    ) {
      return NextResponse.json(
        { message: 'El ID, el subcanal, el código del subcanal y el ID del canal son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE subcanales 
       SET subcanal = $1, subcanal_codigo = $2, canal_id = $3 
       WHERE id = $4 
       RETURNING id, subcanal, subcanal_codigo, canal_id, 
       (SELECT canal FROM canales WHERE id = $3) AS canal_nombre`,
      [subcanal, subcanal_codigo, Number(canal_id), Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el subcanal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Subcanal actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Error al actualizar el subcanal:', error);
    return NextResponse.json({ message: 'Error al actualizar el subcanal' }, { status: 500 });
  }
}

// Método DELETE para eliminar un subcanal
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM subcanales 
       WHERE id = $1 
       RETURNING id, subcanal, subcanal_codigo, canal_id, 
       (SELECT canal FROM canales WHERE id = subcanales.canal_id) AS canal_nombre`,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el subcanal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Subcanal eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Error al eliminar el subcanal:', error);
    return NextResponse.json({ message: 'Error al eliminar el subcanal' }, { status: 500 });
  }
}