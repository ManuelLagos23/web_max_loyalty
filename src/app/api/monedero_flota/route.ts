import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo monedero
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const galones_totales = formData.get('galones_totales');
    const vehiculo_id = formData.get('vehiculo_id');
    const periodo = formData.get('periodo');
    
  
 
    const tarjeta_id = formData.get('tarjeta_id');

    // Validar que todos los campos estén presentes y sean del tipo correcto
    if (
      !galones_totales ||
      !vehiculo_id ||
      !periodo ||


      !tarjeta_id ||
      typeof galones_totales !== 'string' ||
      typeof vehiculo_id !== 'string' ||
      typeof periodo !== 'string' ||
    

      typeof tarjeta_id !== 'string'
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    // Validar que el período sea un valor permitido
    const validPeriods = ['1', '7', '15', '30'];
    if (!validPeriods.includes(periodo)) {
      return NextResponse.json({ message: 'El período debe ser 1, 7, 15 o 30' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO monedero_flota (galones_totales, vehiculo_id, periodo,  tarjeta_id, galones_disponibles)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, galones_totales, vehiculo_id, periodo,   tarjeta_id, galones_disponibles`,
      [
        galones_totales,
        vehiculo_id,
        periodo,
    
      
        tarjeta_id,
        galones_totales
      ]
    );
    client.release();

    return NextResponse.json({
      message: 'Monedero creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el monedero:', error);
    return NextResponse.json({ message: 'Error al crear el monedero' }, { status: 500 });
  }
}

// Método GET para obtener todos los monederos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
         m.id, 
         m.galones_totales, 
         m.vehiculo_id, 
         CONCAT(v.marca, ' ', v.modelo, ' ', v.placa) AS vehiculo_nombre,
         m.periodo, 
         m.galones_consumidos, 
         m.galones_disponibles, 
         m.odometro, 
         m.tarjeta_id, 
         t.numero_tarjeta AS tarjeta_numero
       FROM monedero_flota m
       LEFT JOIN vehiculos v ON m.vehiculo_id = v.id
       LEFT JOIN tarjetas t ON m.tarjeta_id = t.id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los monederos:', error);
    return NextResponse.json({ message: 'Error al obtener los monederos' }, { status: 500 });
  }
}

// Método PUT para actualizar un monedero
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const galones_totales = formData.get('galones_totales');
    const vehiculo_id = formData.get('vehiculo_id');
    const periodo = formData.get('periodo');
    const galones_consumidos = formData.get('galones_consumidos');
    const galones_disponibles = formData.get('galones_disponibles');
    const odometro = formData.get('odometro');
    const tarjeta_id = formData.get('tarjeta_id');

    // Validar que todos los campos estén presentes y sean del tipo correcto
    if (
      !id ||
      !galones_totales ||
      !vehiculo_id ||
      !periodo ||
      !galones_consumidos ||
      !galones_disponibles ||
      !odometro ||
      !tarjeta_id ||
      typeof id !== 'string' ||
      typeof galones_totales !== 'string' ||
      typeof vehiculo_id !== 'string' ||
      typeof periodo !== 'string' ||
      typeof galones_consumidos !== 'string' ||
      typeof galones_disponibles !== 'string' ||
      typeof odometro !== 'string' ||
      typeof tarjeta_id !== 'string'
    ) {
      return NextResponse.json({ message: 'El ID y todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    // Validar que el período sea un valor permitido
    const validPeriods = ['1', '7', '15', '30'];
    if (!validPeriods.includes(periodo)) {
      return NextResponse.json({ message: 'El período debe ser 1, 7, 15 o 30' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE monedero_flota
       SET galones_totales = $1, vehiculo_id = $2, periodo = $3, galones_consumidos = $4, galones_disponibles = $5, odometro = $6, tarjeta_id = $7
       WHERE id = $8
       RETURNING id, galones_totales, vehiculo_id, periodo, galones_consumidos, galones_disponibles, odometro, tarjeta_id`,
      [
        galones_totales,
        vehiculo_id,
        periodo,
        galones_consumidos,
        galones_disponibles,
        odometro,
        tarjeta_id,
        id,
      ]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el monedero con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Monedero actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el monedero:', error);
    return NextResponse.json({ message: 'Error al actualizar el monedero' }, { status: 500 });
  }
}

// Método DELETE para eliminar un monedero
export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM monedero_flota WHERE id = $1 RETURNING id`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el monedero con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Monedero eliminado con éxito',
    });
  } catch (error) {
    console.error('Error al eliminar el monedero:', error);
    return NextResponse.json({ message: 'Error al eliminar el monedero' }, { status: 500 });
  }
}