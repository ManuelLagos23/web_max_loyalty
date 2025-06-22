import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la transacción es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        id, 
        monto, 
        unidades, 
        odometro, 
        tarjeta_id, 
        monedero_id, 
        canal_id, 
        subcanal_id, 
        vehiculo_id, 
        numero_tarjeta, 
        tipo_combustible_id, 
        turno_id, 
        establecimiento_id, 
        precio, 
        turno_estado, 
        estado, 
        created_at
      FROM transacciones_flota
      WHERE id = $1
      `,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Transacción de flota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la transacción de flota:', error);
    return NextResponse.json({ message: 'Error al obtener la transacción de flota' }, { status: 500 });
  }
}