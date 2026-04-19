import { Response } from 'express'
import pool from '../db/pool'
import { AuthRequest } from '../middlewares/auth'
import { TecnicaArbolDto, TarjetaArbolDto } from '../dtos/arbol.dto'
import { Tecnica } from '../interfaces/tecnica.interface'
import { Tarjeta } from '../interfaces/tarjeta.interface'
 
interface TarjetaConProgreso extends Tarjeta {
  completada: boolean
}
 
interface TecnicaConProgreso extends Tecnica {
  total_tarjetas:       number
  tarjetas_completadas: number
}
 
export const obtenerArbol = async (req: AuthRequest, res: Response): Promise<void> => {
  const artista_id = req.artista?.id
 
  if (!artista_id) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }
 
  try {
    const tecnicasResult = await pool.query<TecnicaConProgreso>(
      `SELECT
        t.id_tecnica,
        t.nombre,
        t.estado,
        t.tecnica_padre_id,
        COUNT(tj.id_tarjeta)                                          AS total_tarjetas,
        COUNT(p.id_proyecto)                                          AS tarjetas_completadas
       FROM tecnica t
       LEFT JOIN tarjeta  tj ON tj.tecnica_id  = t.id_tecnica
       LEFT JOIN proyecto p  ON p.tarjeta_id   = tj.id_tarjeta
         AND p.artista_id = $1
       GROUP BY t.id_tecnica, t.nombre, t.estado, t.tecnica_padre_id
       ORDER BY t.id_tecnica`,
      [artista_id]
    )
 
    const tecnicas = tecnicasResult.rows

    const tarjetasResult = await pool.query<TarjetaConProgreso>(
      `SELECT
        tj.id_tarjeta,
        tj.titulo,
        tj.descripcion,
        tj.tecnica_id,
        tj.estado,
        CASE WHEN p.id_proyecto IS NOT NULL THEN TRUE ELSE FALSE END AS completada
       FROM tarjeta tj
       LEFT JOIN proyecto p ON p.tarjeta_id = tj.id_tarjeta
         AND p.artista_id = $1
       ORDER BY tj.id_tarjeta`,
      [artista_id]
    )
 
    const tarjetas = tarjetasResult.rows
 
    const tecnicasCompletadasMap = new Map<number, boolean>()
    for (const t of tecnicas) {
      const completada = Number(t.total_tarjetas) > 0 &&
        Number(t.total_tarjetas) === Number(t.tarjetas_completadas)
      tecnicasCompletadasMap.set(t.id_tecnica, completada)
    }
 
    const arbol: TecnicaArbolDto[] = tecnicas.map((tecnica) => {
      const completada = tecnicasCompletadasMap.get(tecnica.id_tecnica) ?? false
 
      const desbloqueada = tecnica.tecnica_padre_id === null
        ? true
        : tecnicasCompletadasMap.get(tecnica.tecnica_padre_id) ?? false

      const tarjetasDeTecnica: TarjetaArbolDto[] = tarjetas
        .filter(tj => tj.tecnica_id === tecnica.id_tecnica)
        .map(tj => ({
          id_tarjeta:  tj.id_tarjeta,
          titulo:      tj.titulo,
          descripcion: tj.descripcion,
          completada:  tj.completada
        }))
 
      return {
        id_tecnica:           tecnica.id_tecnica,
        nombre:               tecnica.nombre,
        tecnica_padre_id:     tecnica.tecnica_padre_id,
        desbloqueada,
        completada,
        total_tarjetas:       Number(tecnica.total_tarjetas),
        tarjetas_completadas: Number(tecnica.tarjetas_completadas),
        tarjetas:             tarjetasDeTecnica
      }
    })
 
    res.status(200).json(arbol)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener el árbol de habilidades' })
  }
}