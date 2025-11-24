import { z } from 'zod'

// Schemas de validação para o frontend
export const citySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  population: z.number().int().positive().optional(),
  chamber_url: z.string().url('URL inválida').optional().or(z.literal(''))
})

export const projectSchema = z.object({
  city_id: z.string().uuid('ID de cidade inválido'),
  number: z.string().min(1, 'Número do projeto é obrigatório'),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  full_text: z.string().min(10, 'Texto completo deve ter pelo menos 10 caracteres'),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['em_análise', 'em_votação', 'aprovado', 'rejeitado', 'arquivado']).optional()
})

export const voteSchema = z.object({
  project_id: z.string().uuid('ID de projeto inválido'),
  position: z.enum(['support', 'against']),
  reasoning: z.string().max(500, 'Justificativa muito longa').optional(),
  neighborhood: z.string().max(255).optional()
})

export const commentSchema = z.object({
  project_id: z.string().uuid('ID de projeto inválido'),
  content: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(1000, 'Comentário muito longo')
})

export const complaintSchema = z.object({
  city_id: z.string().uuid('ID de cidade inválido'),
  original_complaint: z.string().min(20, 'Reclamação deve ter pelo menos 20 caracteres'),
  category: z.enum(['iluminacao', 'asfalto', 'saude', 'educacao', 'transporte', 'seguranca', 'limpeza', 'meio_ambiente', 'outro'])
})

