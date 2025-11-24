import { z } from 'zod'

export const createProjectSchema = z.object({
  city_id: z.string().uuid('ID de cidade inválido'),
  number: z.string().min(1, 'Número do projeto é obrigatório').max(50),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(500),
  full_text: z.string().min(10, 'Texto completo deve ter pelo menos 10 caracteres'),
  author: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  main_impacts: z.array(z.string()).optional(),
  vote_date: z.string().date().optional(),
  original_url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['em_análise', 'em_votação', 'aprovado', 'rejeitado', 'arquivado']).optional()
})

export const updateProjectSchema = createProjectSchema.partial()

export const createVoteSchema = z.object({
  project_id: z.string().uuid('ID de projeto inválido'),
  citizen_id: z.string().uuid('ID de cidadão inválido').optional(),
  citizen_phone: z.string().regex(/^\d+$/, 'Telefone inválido').optional(),
  city_id: z.string().uuid('ID de cidade inválido').optional(),
  position: z.enum(['support', 'against']),
  reasoning: z.string().max(500, 'Justificativa muito longa').optional(),
  neighborhood: z.string().max(255).optional()
})

export const createCommentSchema = z.object({
  project_id: z.string().uuid('ID de projeto inválido'),
  citizen_id: z.string().uuid('ID de cidadão inválido').optional(),
  citizen_phone: z.string().regex(/^\d+$/, 'Telefone inválido').optional(),
  content: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(1000, 'Comentário muito longo')
})

export const createComplaintSchema = z.object({
  city_id: z.string().uuid('ID de cidade inválido'),
  citizen_id: z.string().uuid('ID de cidadão inválido').optional(),
  citizen_phone: z.string().regex(/^\d+$/, 'Telefone inválido').optional(),
  project_id: z.string().uuid('ID de projeto inválido').optional(),
  original_complaint: z.string().min(20, 'Reclamação deve ter pelo menos 20 caracteres'),
  category: z.enum(['iluminacao', 'asfalto', 'saude', 'educacao', 'transporte', 'seguranca', 'limpeza', 'meio_ambiente', 'outro']).optional()
})

export const createCitySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  population: z.number().int().positive().optional(),
  chamber_url: z.string().url('URL inválida').optional().or(z.literal('')),
  active: z.boolean().optional()
})

