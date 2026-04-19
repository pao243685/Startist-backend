import { Request, Response } from 'express'
import pool from '../db/pool'
import { Artista } from '../interfaces/artista.interface'
import { ProyectoResponseDto } from '../dtos/proyecto.dto'
import {
  CreateArtistaDto,
  UpdateArtistaDto,
  ArtistaResponseDto
} from '../dtos/artista.dto'

export const listarArtistas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<ArtistaResponseDto>(
      `SELECT id_artista, nombre, descripcion, fecha_registro
       FROM artista
       ORDER BY id_artista`
    )
    res.status(200).json(result.rows)
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

export const crearArtista = async (req: Request, res: Response): Promise<void> => {
  const { nombre, contrasena, descripcion }: CreateArtistaDto = req.body
  try {
    if (!nombre || !contrasena) {
      res.status(422).json({ error: 'nombre y contrasena son requeridos' })
      return
    }

    const existe = await pool.query<Artista>(
      'SELECT id_artista FROM artista WHERE nombre = $1',
      [nombre]
    )
    if (existe.rows.length > 0) {
      res.status(409).json({ error: 'Ya existe un artista con ese nombre' })
      return
    }

    const result = await pool.query<ArtistaResponseDto>(
      `INSERT INTO artista (nombre, contrasena, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id_artista, nombre, descripcion, fecha_registro`,
      [nombre, contrasena, descripcion ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al crear artista' })
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
    const nuevoContrasena  = contrasena  ?? actual.contrasena
    const nuevoDescripcion = descripcion ?? actual.descripcion

    const result = await pool.query<ArtistaResponseDto>(
      `UPDATE artista
       SET nombre = $1, contrasena = $2, descripcion = $3
       WHERE id_artista = $4
       RETURNING id_artista, nombre, descripcion, fecha_registro`,
      [nuevoNombre, nuevoContrasena, nuevoDescripcion, id]
    )
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al editar artista' })
  }
}

export const eliminarArtista = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<Artista>(
      'DELETE FROM artista WHERE id_artista = $1 RETURNING id_artista',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }
    res.status(200).json({ mensaje: 'Artista eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al eliminar artista' })
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