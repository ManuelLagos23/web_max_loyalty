import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo vehículo
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const modelo = formData.get('modelo');
    const placa = formData.get('placa');
    const marca = formData.get('marca');
    const vin = formData.get('vin');
    const codigo_vehiculo = formData.get('codigo_vehiculo');
    const cilindraje = formData.get('cilindraje');
    const chasis = formData.get('chasis');
    const tipo_combustible = formData.get('tipo_combustible');
    const transmision = formData.get('transmision');
    const capacidad_carga = formData.get('capacidad_carga');
    const color = formData.get('color');
    const caballo_potencia = formData.get('caballo_potencia');
    const potencia_motor = formData.get('potencia_motor');
    const numero_motor = formData.get('numero_motor');
    const numero_asientos = formData.get('numero_asientos');
    const numero_puertas = formData.get('numero_puertas');
    const odometro = formData.get('odometro');

    // Validación de campos obligatorios
    if (
      !modelo || typeof modelo !== 'string' ||
      !placa || typeof placa !== 'string' ||
      !marca || typeof marca !== 'string' ||
      !vin || typeof vin !== 'string' ||
      !codigo_vehiculo || typeof codigo_vehiculo !== 'string' ||
      !cilindraje || isNaN(Number(cilindraje)) ||
      !chasis || typeof chasis !== 'string' ||
      !tipo_combustible || isNaN(Number(tipo_combustible)) ||
      !transmision || typeof transmision !== 'string' ||
      !capacidad_carga || isNaN(Number(capacidad_carga)) ||
      !color || typeof color !== 'string' ||
      !caballo_potencia || isNaN(Number(caballo_potencia)) ||
      !potencia_motor || isNaN(Number(potencia_motor)) ||
      !numero_motor || typeof numero_motor !== 'string' ||
      !numero_asientos || isNaN(Number(numero_asientos)) ||
      !numero_puertas || isNaN(Number(numero_puertas))||
          !odometro || isNaN(Number(odometro))
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO vehiculos (
        modelo, placa, marca, vin, cilindraje, chasis, tipo_combustible, transmision,
        capacidad_carga, color, caballo_potencia, potencia_motor, numero_motor,
        numero_asientos, numero_puertas, odometro, codigo_vehiculo  
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        modelo,
        placa,
        marca,
        vin,
        Number(cilindraje),
        chasis,
        Number(tipo_combustible),
        transmision,
        Number(capacidad_carga),
        color,
        Number(caballo_potencia),
        Number(potencia_motor),
        numero_motor,
        Number(numero_asientos),
        Number(numero_puertas),
        Number(odometro),
        codigo_vehiculo,
      ]
    );
    client.release();

    return NextResponse.json({
      message: 'Vehículo creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el vehículo:', error);
    return NextResponse.json({ message: 'Error al crear el vehículo' }, { status: 500 });
  }
}

// Método GET para obtener todos los vehículos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;


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
        tc.name AS tipo_combustible_nombre,
        v.transmision,
        v.capacidad_carga,
        v.color,
        v.caballo_potencia,
        v.potencia_motor,
        v.numero_motor,
        v.numero_asientos,
        v.numero_puertas,
        v.codigo_vehiculo,
        v.odometro
      FROM vehiculos v
      LEFT JOIN tipo_combustible tc ON v.tipo_combustible = tc.id
      ORDER BY v.id
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los vehículos:', error);
    return NextResponse.json({ message: 'Error al obtener los vehículos' }, { status: 500 });
  }
}


// Método PUT para actualizar un vehículo
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const modelo = formData.get('modelo');
    const placa = formData.get('placa');
    const marca = formData.get('marca');
    const vin = formData.get('vin');
   const codigo_vehiculo = formData.get('codigo_vehiculo');
    const cilindraje = formData.get('cilindraje');
    const chasis = formData.get('chasis');
    const tipo_combustible = formData.get('tipo_combustible');
    const transmision = formData.get('transmision');
    const capacidad_carga = formData.get('capacidad_carga');
    const color = formData.get('color');
    const caballo_potencia = formData.get('caballo_potencia');
    const potencia_motor = formData.get('potencia_motor');
    const numero_motor = formData.get('numero_motor');
    const numero_asientos = formData.get('numero_asientos');
    const numero_puertas = formData.get('numero_puertas');
    const odometro = formData.get('odometro');

    // Validación de campos obligatorios
    if (
      !id || isNaN(Number(id)) ||
      !modelo || typeof modelo !== 'string' ||
      !placa || typeof placa !== 'string' ||
      !marca || typeof marca !== 'string' ||
      !vin || typeof vin !== 'string' ||
        !codigo_vehiculo || typeof codigo_vehiculo !== 'string' ||
      !cilindraje || isNaN(Number(cilindraje)) ||
      !chasis || typeof chasis !== 'string' ||
      !tipo_combustible || isNaN(Number(tipo_combustible)) ||
      !transmision || typeof transmision !== 'string' ||
      !capacidad_carga || isNaN(Number(capacidad_carga)) ||
      !color || typeof color !== 'string' ||
      !caballo_potencia || isNaN(Number(caballo_potencia)) ||
      !potencia_motor || isNaN(Number(potencia_motor)) ||
      !numero_motor || typeof numero_motor !== 'string' ||
      !numero_asientos || isNaN(Number(numero_asientos)) ||
      !numero_puertas || isNaN(Number(numero_puertas)) ||
      !odometro || isNaN(Number(odometro))
    ) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios y deben ser válidos' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE vehiculos SET
        modelo = $1,
        placa = $2,
        marca = $3,
        vin = $4,
        cilindraje = $5,
        chasis = $6,
        tipo_combustible = $7,
        transmision = $8,
        capacidad_carga = $9,
        color = $10,
        caballo_potencia = $11,
        potencia_motor = $12,
        numero_motor = $13,
        numero_asientos = $14,
        numero_puertas = $15,
        odometro = $16,
        codigo_vehiculo = $17
      WHERE id = $18
      RETURNING *`,
      [
        modelo,
        placa,
        marca,
        vin,
        Number(cilindraje),
        chasis,
        Number(tipo_combustible),
        transmision,
        Number(capacidad_carga),
        color,
        Number(caballo_potencia),
        Number(potencia_motor),
        numero_motor,
        Number(numero_asientos),
        Number(numero_puertas),
        Number(odometro),
          codigo_vehiculo,
        Number(id),
  
      ]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el vehículo con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Vehículo actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el vehículo:', error);
    return NextResponse.json({ message: 'Error al actualizar el vehículo' }, { status: 500 });
  }
}

// Método DELETE para eliminar un vehículo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM vehiculos WHERE id = $1 RETURNING id`,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el vehículo con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Vehículo eliminado con éxito',
      data: { id: Number(id) },
    });
  } catch (error) {
    console.error('Error al eliminar el vehículo:', error);
    return NextResponse.json({ message: 'Error al eliminar el vehículo' }, { status: 500 });
  }
}