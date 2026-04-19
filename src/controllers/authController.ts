import { Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import pool from '../db/pool'
import { Artista } from '../interfaces/artista.interface'
import { LoginDto, RegisterDto, AuthResponseDto } from '../dtos/auth.dto'
import { ArtistaResponseDto } from '../dtos/artista.dto'

const SALT_ROUNDS = 10

export const registro = async (req: Request, res: Response): Promise<void> => {
  const { nombre, contrasena, descripcion }: RegisterDto = req.body
  try {
    if (!nombre || !contrasena) {
      res.status(422).json({ error: 'nombre y contrasena son requeridos' })
      return
    }

    const existe = await pool.query<Artista>(
      'SELECT id_artista FROM artista WHERE nombre = $1',
      [nombre]
    )
    if (existe.rows.length > 0) {
      res.status(409).json({ error: 'Ya existe un artista con ese nombre' })
      return
    }
    
    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS)

    const result = await pool.query<ArtistaResponseDto>(
      `INSERT INTO artista (nombre, contrasena, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id_artista, nombre, descripcion, fecha_registro`,
      [nombre, hash, descripcion ?? null]
    )

    const artista = result.rows[0]

    const expiresIn = (process.env.JWT_EXPIRES_IN) as SignOptions['expiresIn']

    const token = jwt.sign(
      { id: artista.id_artista, nombre: artista.nombre },
      process.env.JWT_SECRET as string,
      { expiresIn }
    )

    const response: AuthResponseDto = { artista, token }
    res.status(201).json(response)
  } catch (error) {
    console.error(error)
    res.status(422).json({ error: 'Error al registrar artista' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { nombre, contrasena }: LoginDto = req.body
  try {
    if (!nombre || !contrasena) {
      res.status(422).json({ error: 'nombre y contrasena son requeridos' })
      return
    }

    const result = await pool.query<Artista>(
      'SELECT * FROM artista WHERE nombre = $1',
      [nombre]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artista no encontrado' })
      return
    }

    const artista = result.rows[0]

    const valida = await bcrypt.compare(contrasena, artista.contrasena)
    if (!valida) {
      res.status(401).json({ error: 'Contraseña incorrecta' })
      return
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN) as SignOptions['expiresIn']

    const token = jwt.sign(
      { id: artista.id_artista, nombre: artista.nombre },
      process.env.JWT_SECRET as string,
      { expiresIn }
    )

    const response: AuthResponseDto = {
      artista: {
        id_artista:     artista.id_artista,
        nombre:         artista.nombre,
        descripcion:    artista.descripcion,
        fecha_registro: artista.fecha_registro
      },
      token
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Error al iniciar sesión' })
  }
}