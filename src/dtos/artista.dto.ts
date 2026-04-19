
export interface UpdateArtistaDto {
  nombre?:      string
  contrasena?:  string
  descripcion?: string
}

export interface ArtistaResponseDto {
  id_artista:     number
  nombre:         string
  descripcion:    string | null
  fecha_registro: Date
}