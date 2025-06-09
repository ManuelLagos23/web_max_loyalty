import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'El ID del vehículo es obligatorio y debe ser un número' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        v.id,
        v.modelo,
        v.placa,
        v.marca,
        v.vin,
        v.cilindraje,
        v.chasis,
        v.tipo_combustible,
        v.transmision,
        v.capacidad_carga,
        v.color,
        v.caballo_potencia,
        v.potencia_motor,
        v.numero_motor,
        v.numero_asientos,
        v.numero_puertas,
        v.odometro,
        tc.name AS tipo_combustible_nombre
      FROM vehiculos v
      LEFT JOIN tipo_combustible tc ON v.tipo_combustible = tc.id
      WHERE v.id = $1
      `,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Vehículo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al obtener el vehículo:', error);
    return NextResponse.json({ message: 'Error al obtener el vehículo' }, { status: 500 });
  }
}