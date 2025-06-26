import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es inválido' }, { status: 400 });
    }

    const formData = await request.formData();

    const galones_totales = formData.get('galones_totales');
    const vehiculo_id = formData.get('vehiculo_id');
    const periodo = formData.get('periodo');
    const galones_consumidos = formData.get('galones_consumidos');
    const galones_disponibles = formData.get('galones_disponibles');
    const odometro = formData.get('odometro');
    const tarjeta_id = formData.get('tarjeta_id');

    if (
      !galones_totales ||
      !vehiculo_id ||
      !periodo ||
      !galones_consumidos ||
      !galones_disponibles ||
      !odometro ||
      !tarjeta_id ||
      typeof galones_totales !== 'string' ||
      typeof vehiculo_id !== 'string' ||
      typeof periodo !== 'string' ||
      typeof galones_consumidos !== 'string' ||
      typeof galones_disponibles !== 'string' ||
      typeof odometro !== 'string' ||
      typeof tarjeta_id !== 'string'
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

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
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID del cliente es obligatorio' }, { status: 400 });
    }

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
       WHERE m.id = $1`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el monedero con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el monedero:', error);
    return NextResponse.json({ message: 'Error al obtener el monedero' }, { status: 500 });
  }
}
