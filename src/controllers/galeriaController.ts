import { Request, Response } from 'express'
import pool from '../db/pool'
import { Tecnica } from '../interfaces/tecnica.interface'

const UNSPLASH_BASE = 'https://api.unsplash.com/search/photos'
const UNSPLASH_KEY  = process.env.UNSPLASH_ACCESS_KEY as string

const TECNICA_QUERY_MAP: Record<string, string> = {
  'grafito':     'graphite pencil drawing',
  'carboncillo': 'charcoal drawing',
  'acuarela':    'watercolor painting',
  'grabado':     'printmaking etching',
  'óleo':        'oil painting',
  'acrílico':    'acrylic painting',
  'escultura':   'sculpture artwork',
}

function getUnsplashQuery(nombreTecnica: string): string {
  const key = nombreTecnica.toLowerCase().trim()
  return TECNICA_QUERY_MAP[key] ?? `${nombreTecnica} handmade hand painted artwork close up`
}

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
    const query   = getUnsplashQuery(tecnica.nombre)

    const params = new URLSearchParams({
      query,
      per_page:    String(limit),
      orientation: 'landscape',
    })

    const searchRes = await fetch(`${UNSPLASH_BASE}?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
    })

    if (!searchRes.ok) {
      res.status(502).json({ error: 'Error al consultar Unsplash' })
      return
    }

    const searchData = await searchRes.json() as UnsplashResponse

    if (searchData.results.length === 0) {
      res.status(200).json({
        tecnica_id:     tecnica.id_tecnica,
        tecnica_nombre: tecnica.nombre,
        total:          0,
        obras:          []
      })
      return
    }

    const obras = searchData.results.map(foto => ({
      id:      foto.id,
      titulo:  foto.alt_description || tecnica.nombre,
      artista: foto.user.name,
      imagen:  foto.urls.regular,
      thumb:   foto.urls.small,
      color:   foto.color,
      url:     foto.links.html
    }))

    res.status(200).json({
      tecnica_id:     tecnica.id_tecnica,
      tecnica_nombre: tecnica.nombre,
      total:          obras.length,
      fuente:         'Unsplash',
      obras
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al obtener galería de inspiración' })
  }
}

interface UnsplashPhoto {
  id:              string
  alt_description: string | null
  color:           string | null
  urls: {
    regular: string
    small:   string
  }
  links: {
    html: string
  }
  user: {
    name: string
  }
}

interface UnsplashResponse {
  total:   number
  results: UnsplashPhoto[]
}