import { Request, Response, NextFunction } from 'express'

// Rate limiting simples em memória (para produção, usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100 // máximo de requisições por IP
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    // Nova janela de tempo
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    })
    return next()
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      error: 'Muitas requisições',
      message: `Limite de ${RATE_LIMIT.maxRequests} requisições por ${RATE_LIMIT.windowMs / 1000 / 60} minutos excedido. Tente novamente mais tarde.`,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    })
  }
  
  record.count++
  next()
}

