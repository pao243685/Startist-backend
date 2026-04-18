import { ArtistaResponseDto } from './artista.dto'

export interface LoginDto {
  nombre:     string
  contrasena: string
}

export interface RegisterDto {
  nombre:       string
  contrasena:   string
  descripcion?: string
}

export interface AuthResponseDto {
  artista: ArtistaResponseDto
  token:   string
}