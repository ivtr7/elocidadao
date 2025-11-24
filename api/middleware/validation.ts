import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validação falhou',
          details: (error as ZodError).issues.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        })
      }
      next(error)
    }
  }
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validação de query falhou',
          details: (error as ZodError).issues.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        })
      }
      next(error)
    }
  }
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validação de parâmetros falhou',
          details: (error as ZodError).issues.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        })
      }
      next(error)
    }
  }
}

