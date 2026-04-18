export interface CreateTarjetaDto {
  titulo:       string
  descripcion?: string
  tecnica_id:   number
}

export interface UpdateTarjetaDto {
  titulo?:      string
  descripcion?: string
  estado?:      boolean
  tecnica_id?:  number
}

export interface TarjetaResponseDto {
  id_tarjeta:     number
  titulo:         string
  descripcion:    string | null
  estado:         boolean
  tecnica_id:     number
  tecnica_nombre: string
}