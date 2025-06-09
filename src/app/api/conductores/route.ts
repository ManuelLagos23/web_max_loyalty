import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo conductor
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre');
    const numero_licencia = formData.get('numero_licencia');
    const telefono = formData.get('telefono');
    const correo = formData.get('correo');
    const vehiculo_id = formData.get('vehiculo_id');
    const tipo_licencia = formData.get('tipo_licencia');
    const fecha_emision = formData.get('fecha_emision'); 
    const fecha_expiracion = formData.get('fecha_expiracion'); 
    const tipo_sangre = formData.get('tipo_sangre'); 


    console.log("DATOS", formData);

    if (!nombre || !numero_licencia || !telefono || !correo || !vehiculo_id ||  !tipo_licencia || !fecha_emision || !fecha_expiracion || !tipo_sangre ||
        typeof nombre !== 'string' || typeof numero_licencia !== 'string' ||
        typeof telefono !== 'string' || typeof correo !== 'string' || typeof vehiculo_id !== 'string' || typeof tipo_licencia !== 'string'
      || typeof fecha_emision !== 'string' || typeof fecha_expiracion !== 'string' || typeof tipo_sangre !== 'string'
      ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO conductores (nombre, numero_licencia, telefono, correo, vehiculo_id, tipo_licencia, fecha_emision, fecha_expiracion, tipo_sangre)   
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, nombre, numero_licencia, telefono, correo, vehiculo_id, tipo_licencia, fecha_emision, fecha_expiracion, tipo_sangre`,
      [nombre, numero_licencia, telefono, correo, vehiculo_id, tipo_licencia, fecha_emision, fecha_expiracion, tipo_sangre] 
    );
    client.release();

    return NextResponse.json({
      message: 'Conductor creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el conductor:', error);
    return NextResponse.json({ message: 'Error al crear el conductor' }, { status: 500 });
  }
}

// Método GET para obtener todos los conductores
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    const result = await client.query(
      `SELECT c.id, c.nombre, c.numero_licencia, c.telefono, c.correo, c.vehiculo_id, c.tipo_licencia, c.fecha_emision, c.fecha_expiracion, c.tipo_sangre, v.marca as vehiculo_marca ,  v.modelo as vehiculo_modelo,  v.placa as vehiculo_placa  
       FROM conductores c 
       LEFT JOIN vehiculos v ON c.vehiculo_id = v.id 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los conductores:', error);
    return NextResponse.json({ message: 'Error al obtener los conductores' }, { status: 500 });
  }
}

// Método PUT para actualizar un conductor
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const nombre = formData.get('nombre');
    const numero_licencia = formData.get('numero_licencia');
    const telefono = formData.get('telefono');
    const correo = formData.get('correo');
    const vehiculo_id = formData.get('vehiculo_id');
    const tipo_licencia = formData.get('tipo_licencia');
    const fecha_emision = formData.get('fecha_emision');
    const fecha_expiracion = formData.get('fecha_expiracion');
    const tipo_sangre = formData.get('tipo_sangre');

    if (!id || !nombre || !numero_licencia || !telefono || !correo || !vehiculo_id || !tipo_licencia || !fecha_emision || !fecha_expiracion || !tipo_sangre || 
        typeof nombre !== 'string' || typeof numero_licencia !== 'string' ||
        typeof telefono !== 'string' || typeof correo !== 'string' || typeof vehiculo_id !== 'string'  || typeof tipo_licencia !== 'string'
      ||typeof fecha_emision !== 'string' || typeof fecha_expiracion !== 'string' || typeof tipo_sangre !== 'string'
      ) {
      return NextResponse.json({ message: 'El ID y todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE conductores 
       SET nombre = $1, numero_licencia = $2, telefono = $3, correo = $4, vehiculo_id = $5 , tipo_licencia = $6, fecha_emision = $7, fecha_expiracion = $8,
       tipo_sangre = $9
       WHERE id = $10
       RETURNING id, nombre, numero_licencia, telefono, correo, vehiculo_id, tipo_licencia, fecha_emision, fecha_expiracion, tipo_sangre`,
      [nombre, numero_licencia, telefono, correo, vehiculo_id, tipo_licencia, fecha_emision, fecha_expiracion, tipo_sangre, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el conductor con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Conductor actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el conductor:', error);
    return NextResponse.json({ message: 'Error al actualizar el conductor' }, { status: 500 });
  }
}

// Método DELETE para eliminar un conductor
export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM conductores WHERE id = $1 RETURNING id`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el conductor con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Conductor eliminado con éxito',
    });
  } catch (error) {
    console.error('Error al eliminar el conductor:', error);
    return NextResponse.json({ message: 'Error al eliminar el conductor' }, { status: 500 });
  }
}