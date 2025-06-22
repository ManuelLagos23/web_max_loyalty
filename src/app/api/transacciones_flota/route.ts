import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
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
      `
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return NextResponse.json({ message: 'Error al obtener las transacciones' }, { status: 500 });
  }
}