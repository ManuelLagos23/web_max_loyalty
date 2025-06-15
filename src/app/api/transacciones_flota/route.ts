import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método GET para obtener todas las transacciones
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
     SELECT id, monto, unidades, odometro, tarjeta_id, monedero_id, canal_id, subcanal_id, created_at
       FROM transacciones_flota
       LIMIT $1 OFFSET $2
      `
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return NextResponse.json({ message: 'Error al obtener las transacciones' }, { status: 500 });
  }
}
