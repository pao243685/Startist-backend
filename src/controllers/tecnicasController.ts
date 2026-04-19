import { Request, Response } from 'express'
import pool from '../db/pool'
import { Tecnica } from '../interfaces/tecnica.interface'
import { TecnicaResponseDto } from '../dtos/tecnica.dto'
import { TarjetaResponseDto } from '../dtos/tarjeta.dto'

export const obtenerTecnica = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<TecnicaResponseDto>(
      'SELECT * FROM tecnica WHERE id_tecnica = $1',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Técnica no encontrada' })
      return
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener técnica' })
  }
}

export const listarTarjetasPorTecnica = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const tecnica = await pool.query<Tecnica>(
      'SELECT id_tecnica FROM tecnica WHERE id_tecnica = $1',
      [id]
    )
    if (tecnica.rows.length === 0) {
      res.status(404).json({ error: 'Técnica no encontrada' })
      return
    }

    const result = await pool.query<TarjetaResponseDto>(
      'SELECT * FROM vista_tarjetas WHERE tecnica_id = $1 ORDER BY id_tarjeta',
      [id]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al listar tarjetas de la técnica' })
  }
}