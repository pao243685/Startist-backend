export interface Proyecto {
  id_proyecto: number
  titulo:      string
  archivo:     string
  descripcion: string | null
  artista_id:  number
  tarjeta_id:  number
}

export interface ProyectoCompleto extends Proyecto {
  artista_nombre:  string
  tarjeta_titulo:  string
  tecnica_nombre:  string
  id_artista:      number
  id_tarjeta:      number
  id_tecnica:      number
}