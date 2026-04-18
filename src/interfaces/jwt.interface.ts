export interface JwtPayload {
  id:     number
  nombre: string
  iat?:   number
  exp?:   number
}