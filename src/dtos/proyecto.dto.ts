export interface CreateProyectoDto {
  titulo:       string
  archivo:      string
  descripcion?: string
  artista_id:   number
  tarjeta_id:   number
}
 
export interface UpdateProyectoDto {
  titulo?:      string
  archivo?:     string
  descripcion?: string
  artista_id?:  number
  tarjeta_id?:  number
}

export interface ProyectoResponseDto {
  id_proyecto:      number
  proyecto_titulo:  string
  archivo:          string
  proyecto_descripcion: string | null
  id_artista:       number
  artista_nombre:   string
  id_tarjeta:       number
  tarjeta_titulo:   string
  id_tecnica:       number
  tecnica_nombre:   string
  tecnica_padre_id: number | null
}