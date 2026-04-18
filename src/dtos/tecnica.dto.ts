export interface CreateTecnicaDto {
  nombre: string
}

export interface UpdateTecnicaDto {
  nombre?: string
  estado?: boolean
}

export interface TecnicaResponseDto {
  id_tecnica: number
  nombre:     string
  estado:     boolean
}