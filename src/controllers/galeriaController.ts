import { Request, Response } from 'express'
import pool from '../db/pool'
import { Tecnica } from '../interfaces/tecnica.interface'

const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

export const obtenerGaleria = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const limit = Math.min(Number(req.query.limit) || 10, 20)

  try {
    const tecnicaResult = await pool.query<Tecnica>(
      'SELECT id_tecnica, nombre FROM tecnica WHERE id_tecnica = $1',
      [id]
    )

    if (tecnicaResult.rows.length === 0) {
      res.status(404).json({ error: 'Técnica no encontrada' })
      return
    }

    const tecnica = tecnicaResult.rows[0]

    const searchRes = await fetch(
      `${MET_BASE}/search?q=${encodeURIComponent(tecnica.nombre)}&hasImages=true&isHighlight=true`
    )
    const searchData = await searchRes.json() as { total: number; objectIDs: number[] | null }

    if (!searchData.objectIDs || searchData.total === 0) {
      res.status(200).json({
        tecnica_id:   tecnica.id_tecnica,
        tecnica_nombre: tecnica.nombre,
        total:        0,
        obras:        []
      })
      return
    }

    const ids = searchData.objectIDs.slice(0, limit)

    const obras = await Promise.all(
      ids.map(async (objectID) => {
        try {
          const objRes = await fetch(`${MET_BASE}/objects/${objectID}`)
          const obj = await objRes.json() as {
            objectID:        number
            title:           string
            artistDisplayName: string
            primaryImageSmall: string
            objectDate:      string
            medium:          string
            objectURL:       string
          }

          if (!obj.primaryImageSmall) return null

          return {
            id:      obj.objectID,
            titulo:  obj.title,
            artista: obj.artistDisplayName || 'Desconocido',
            imagen:  obj.primaryImageSmall,
            fecha:   obj.objectDate,
            medio:   obj.medium,
            url:     obj.objectURL
          }
        } catch {
          return null
        }
      })
    )

    const obrasFiltradas = obras.filter(Boolean)

    res.status(200).json({
      tecnica_id:     tecnica.id_tecnica,
      tecnica_nombre: tecnica.nombre,
      total:          obrasFiltradas.length,
      fuente:         'The Metropolitan Museum of Art Collection API',
      obras:          obrasFiltradas
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener galería de inspiración' })
  }
}