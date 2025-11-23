-- Adicionar campo project_id à tabela complaints para vincular reclamações aos projetos
ALTER TABLE complaints 
ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_complaints_project_id ON complaints(project_id);

-- Comentário explicativo
COMMENT ON COLUMN complaints.project_id IS 'ID do projeto de lei relacionado à reclamação (opcional)';

