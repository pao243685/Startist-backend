
export interface TecnicaResponseDto {
  id_tecnica:       number
  nombre:           string
  estado:           boolean
  tecnica_padre_id: number | null
}