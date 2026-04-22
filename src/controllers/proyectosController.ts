import { Request, Response } from 'express'
import pool from '../db/pool'
import { Proyecto } from '../interfaces/proyecto.interface'
import { Artista } from '../interfaces/artista.interface'
import { Tarjeta } from '../interfaces/tarjeta.interface'
import { CreateProyectoDto, ProyectoResponseDto } from '../dtos/proyecto.dto'
import { AuthRequest } from '../middlewares/auth'

export const obtenerProyecto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<ProyectoResponseDto>(
      'SELECT * FROM vista_proyectos WHERE id_proyecto = $1',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Proyecto no encontrado' })
      return
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener proyecto' })
  }
}

export const crearProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { titulo, descripcion, tarjeta_id } = req.body
  const artista_id = req.artista?.id

  const file = req.file
  if (!file) {
    res.status(422).json({ error: 'El archivo es requerido' })
    return
  }

  const archivo = `/uploads/${file.filename}`

  try {
    if (!titulo || !tarjeta_id || !artista_id) {
      res.status(422).json({ error: 'titulo y tarjeta_id son requeridos' })
      return
    }

    const artista = await pool.query<Artista>(
      'SELECT id_artista FROM artista WHERE id_artista = $1',
      [artista_id]
    )
    if (artista.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }

    const tarjeta = await pool.query<Tarjeta>(
      'SELECT id_tarjeta FROM tarjeta WHERE id_tarjeta = $1',
      [tarjeta_id]
    )
    if (tarjeta.rows.length === 0) {
      res.status(404).json({ error: 'Tarjeta no encontrada' })
      return
    }

    const progreso = await pool.query<{ desbloqueada: boolean }>(
      `SELECT
        CASE
          WHEN tc.tecnica_padre_id IS NULL THEN TRUE
          ELSE (
            SELECT COUNT(tj2.id_tarjeta) = COUNT(p2.id_proyecto)
            FROM tarjeta tj2
            LEFT JOIN proyecto p2 ON p2.tarjeta_id = tj2.id_tarjeta
              AND p2.artista_id = $1
            WHERE tj2.tecnica_id = tc.tecnica_padre_id
          )
        END AS desbloqueada
       FROM tarjeta tj
       JOIN tecnica tc ON tc.id_tecnica = tj.tecnica_id
       WHERE tj.id_tarjeta = $2`,
      [artista_id, tarjeta_id]
    )

    if (!progreso.rows[0]?.desbloqueada) {
      res.status(403).json({ error: 'Esta tarjeta aún no está desbloqueada' })
      return
    }

    const result = await pool.query<Proyecto>(
      `INSERT INTO proyecto (titulo, archivo, descripcion, artista_id, tarjeta_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [titulo, archivo, descripcion ?? null, artista_id, tarjeta_id]
    )
    res.status(201).json(result.rows[0])
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya subiste un proyecto a esta tarjeta' })
      return
    }
    console.error(error)
    res.status(422).json({ error: 'Error al crear proyecto' })
  }
}

export const eliminarProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const artista_id = req.artista?.id
  try {
    const proyecto = await pool.query<Proyecto>(
      'SELECT * FROM proyecto WHERE id_proyecto = $1',
      [id]
    )
    if (proyecto.rows.length === 0) {
      res.status(404).json({ error: 'Proyecto no encontrado' })
      return
    }
    if (proyecto.rows[0].artista_id !== artista_id) {
      res.status(403).json({ error: 'No puedes eliminar un proyecto que no es tuyo' })
      return
    }

    await pool.query(
      'DELETE FROM proyecto WHERE id_proyecto = $1',
      [id]
    )
    res.status(200).json({ mensaje: 'Proyecto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al eliminar proyecto' })
  }
}