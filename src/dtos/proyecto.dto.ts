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
  id_proyecto:    number
  titulo:         string
  archivo:        string
  descripcion:    string | null
  artista_id:     number
  artista_nombre: string
  tarjeta_id:     number
  tarjeta_titulo: string
  tecnica_nombre: string
}