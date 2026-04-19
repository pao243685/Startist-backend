import { Request, Response } from 'express'
import pool from '../db/pool'
import { Proyecto } from '../interfaces/proyecto.interface'
import { Artista } from '../interfaces/artista.interface'
import { Tarjeta } from '../interfaces/tarjeta.interface'
import { CreateProyectoDto, UpdateProyectoDto, ProyectoResponseDto } from '../dtos/proyecto.dto'

export const listarProyectos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<ProyectoResponseDto>(
      'SELECT * FROM vista_proyectos ORDER BY id_proyecto'
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al listar proyectos' })
  }
}

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

export const crearProyecto = async (req: Request, res: Response): Promise<void> => {
  const { titulo, archivo, descripcion, artista_id, tarjeta_id }: CreateProyectoDto = req.body
  try {
    if (!titulo || !archivo || !artista_id || !tarjeta_id) {
      res.status(422).json({
        error: 'titulo, archivo, artista_id y tarjeta_id son requeridos'
      })
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

    const result = await pool.query<Proyecto>(
      `INSERT INTO proyecto (titulo, archivo, descripcion, artista_id, tarjeta_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [titulo, archivo, descripcion ?? null, artista_id, tarjeta_id]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al crear proyecto' })
  }
}

export const editarProyecto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { titulo, archivo, descripcion, artista_id, tarjeta_id }: UpdateProyectoDto = req.body
  try {
    const existe = await pool.query<Proyecto>(
      'SELECT * FROM proyecto WHERE id_proyecto = $1',
      [id]
    )
    if (existe.rows.length === 0) {
      res.status(404).json({ error: 'Proyecto no encontrado' })
      return
    }

    const actual = existe.rows[0]
    const nuevoTitulo      = titulo      ?? actual.titulo
    const nuevoArchivo     = archivo     ?? actual.archivo
    const nuevoDescripcion = descripcion ?? actual.descripcion
    const nuevoArtistaId   = artista_id  ?? actual.artista_id
    const nuevoTarjetaId   = tarjeta_id  ?? actual.tarjeta_id

    const result = await pool.query<Proyecto>(
      `UPDATE proyecto
       SET titulo = $1, archivo = $2, descripcion = $3,
           artista_id = $4, tarjeta_id = $5
       WHERE id_proyecto = $6
       RETURNING *`,
      [nuevoTitulo, nuevoArchivo, nuevoDescripcion, nuevoArtistaId, nuevoTarjetaId, id]
    )
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al editar proyecto' })
  }
}

export const eliminarProyecto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query<Proyecto>(
      'DELETE FROM proyecto WHERE id_proyecto = $1 RETURNING *',
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Proyecto no encontrado' })
      return
    }
    res.status(200).json({ mensaje: 'Proyecto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al eliminar proyecto' })
  }
}