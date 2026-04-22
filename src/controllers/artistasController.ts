import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import pool from '../db/pool'
import { Artista } from '../interfaces/artista.interface'
import { ProyectoResponseDto } from '../dtos/proyecto.dto'
import {
  UpdateArtistaDto,
  ArtistaResponseDto
} from '../dtos/artista.dto'

const SALT_ROUNDS = 10

export const listarArtistas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const artistas = await pool.query(
      `SELECT id_artista, nombre, descripcion, fecha_registro
       FROM artista
       ORDER BY id_artista`
    )

    const tecnicas = await pool.query(
      `SELECT
         p.artista_id,
         t.id_tecnica,
         t.nombre
       FROM tecnica t
       JOIN tarjeta tj ON tj.tecnica_id = t.id_tecnica
       JOIN proyecto p ON p.tarjeta_id  = tj.id_tarjeta
       GROUP BY p.artista_id, t.id_tecnica, t.nombre
       HAVING COUNT(tj.id_tarjeta) = COUNT(p.id_proyecto)`
    )

    const tecnicasPorArtista = new Map<number, any[]>()
    for (const t of tecnicas.rows) {
      if (!tecnicasPorArtista.has(t.artista_id)) {
        tecnicasPorArtista.set(t.artista_id, [])
      }
      tecnicasPorArtista.get(t.artista_id)!.push({
        id_tecnica: t.id_tecnica,
        nombre: t.nombre
      })
    }

    const resultado = artistas.rows.map(a => ({
      ...a,
      tecnicas_completadas: tecnicasPorArtista.get(a.id_artista) ?? []
    }))

    res.status(200).json(resultado)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al listar artistas' })
  }
}

export const obtenerArtista = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<ArtistaResponseDto>(
      `SELECT id_artista, nombre, descripcion, fecha_registro
       FROM artista
       WHERE id_artista = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener artista' })
  }
}

export const editarArtista = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { nombre, contrasena, descripcion }: UpdateArtistaDto = req.body
  try {
    const existe = await pool.query<Artista>(
      'SELECT * FROM artista WHERE id_artista = $1',
      [id]
    )
    if (existe.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }

    const actual = existe.rows[0]
    const nuevoNombre      = nombre      ?? actual.nombre
    const nuevoDescripcion = descripcion ?? actual.descripcion

    const nuevoHash = contrasena
      ? await bcrypt.hash(contrasena, SALT_ROUNDS)
      : actual.contrasena

    const result = await pool.query<ArtistaResponseDto>(
      `UPDATE artista
       SET nombre = $1, contrasena = $2, descripcion = $3
       WHERE id_artista = $4
       RETURNING id_artista, nombre, descripcion, fecha_registro`,
      [nuevoNombre, nuevoHash, nuevoDescripcion, id]
    )
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al editar artista' })
  }
}

export const listarProyectosDeArtista = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const artista = await pool.query<Artista>(
      'SELECT id_artista FROM artista WHERE id_artista = $1',
      [id]
    )
    if (artista.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }

    const result = await pool.query<ProyectoResponseDto>(
      `SELECT * FROM vista_proyectos
       WHERE id_artista = $1
       ORDER BY id_proyecto`,
      [id]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al listar proyectos del artista' })
  }
}