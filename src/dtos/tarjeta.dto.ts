export interface TarjetaResponseDto {
  id_tarjeta:       number
  titulo:           string
  descripcion:      string | null
  estado:           boolean
  tecnica_id:       number
  tecnica_nombre:   string
  tecnica_padre_id: number | null
}
 