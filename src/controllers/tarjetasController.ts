import { Request, Response } from 'express'
import pool from '../db/pool'
import { TarjetaResponseDto } from '../dtos/tarjeta.dto'

export const obtenerTarjeta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<TarjetaResponseDto>(
      'SELECT * FROM vista_tarjetas WHERE id_tarjeta = $1',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tarjeta no encontrada' })
      return
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener tarjeta' })
  }
}