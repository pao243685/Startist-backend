export interface Tarjeta {
  id_tarjeta:       number
  titulo:           string
  descripcion:      string | null
  tecnica_id:       number
  estado:           boolean
}
 
export interface TarjetaConTecnica extends Tarjeta {
  tecnica_nombre:   string
  tecnica_padre_id: number | null
}