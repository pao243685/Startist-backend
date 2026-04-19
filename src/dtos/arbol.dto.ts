export interface TarjetaArbolDto {
  id_tarjeta:  number
  titulo:      string
  descripcion: string | null
  completada:  boolean         
}
 
export interface TecnicaArbolDto {
  id_tecnica:       number
  nombre:           string
  tecnica_padre_id: number | null
  desbloqueada:     boolean  
  completada:       boolean 
  total_tarjetas:   number
  tarjetas_completadas: number
  tarjetas:         TarjetaArbolDto[]
}