import { Request, Response } from 'express'
import pool from '../db/pool'
import { Tarjeta } from '../interfaces/tarjeta.interface'
import { Tecnica } from '../interfaces/tecnica.interface'
import { CreateTarjetaDto, UpdateTarjetaDto, TarjetaResponseDto } from '../dtos/tarjeta.dto'

export const listarTarjetas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<TarjetaResponseDto>(
      'SELECT * FROM vista_tarjetas ORDER BY id_tarjeta'
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al listar tarjetas' })
  }
}

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

export const crearTarjeta = async (req: Request, res: Response): Promise<void> => {
  const { titulo, descripcion, tecnica_id }: CreateTarjetaDto = req.body
  try {
    if (!titulo || !tecnica_id) {
      res.status(422).json({ error: 'titulo y tecnica_id son requeridos' })
      return
    }

    const tecnica = await pool.query<Tecnica>(
      'SELECT id_tecnica FROM tecnica WHERE id_tecnica = $1',
      [tecnica_id]
    )
    if (tecnica.rows.length === 0) {
      res.status(404).json({ error: 'Técnica no encontrada' })
      return
    }

    const result = await pool.query<TarjetaResponseDto>(
      `INSERT INTO tarjeta (titulo, descripcion, tecnica_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [titulo, descripcion ?? null, tecnica_id]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al crear tarjeta' })
  }
}

export const editarTarjeta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { titulo, descripcion, estado, tecnica_id }: UpdateTarjetaDto = req.body
  try {
    const existe = await pool.query<Tarjeta>(
      'SELECT * FROM tarjeta WHERE id_tarjeta = $1',
      [id]
    )
    if (existe.rows.length === 0) {
      res.status(404).json({ error: 'Tarjeta no encontrada' })
      return
    }

    const actual = existe.rows[0]
    const nuevoTitulo      = titulo      ?? actual.titulo
    const nuevoDescripcion = descripcion ?? actual.descripcion
    const nuevoEstado      = estado      ?? actual.estado
    const nuevoTecnicaId   = tecnica_id  ?? actual.tecnica_id

    const result = await pool.query<TarjetaResponseDto>(
      `UPDATE tarjeta
       SET titulo = $1, descripcion = $2, estado = $3, tecnica_id = $4
       WHERE id_tarjeta = $5
       RETURNING *`,
      [nuevoTitulo, nuevoDescripcion, nuevoEstado, nuevoTecnicaId, id]
    )
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al editar tarjeta' })
  }
}

export const eliminarTarjeta = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<Tarjeta>(
      'DELETE FROM tarjeta WHERE id_tarjeta = $1 RETURNING *',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tarjeta no encontrada' })
      return
    }
    res.status(200).json({ mensaje: 'Tarjeta eliminada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al eliminar tarjeta' })
  }
}