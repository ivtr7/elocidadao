-- Migração para atualizar e adicionar campos conforme especificação das entidades

-- 1. Atualizar tabela cities (adicionar campo active se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cities' AND column_name = 'active') THEN
        ALTER TABLE cities ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. Atualizar tabela projects com novos campos
DO $$ 
BEGIN
    -- Adicionar author se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'author') THEN
        ALTER TABLE projects ADD COLUMN author VARCHAR(255);
    END IF;
    
    -- Adicionar main_impacts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'main_impacts') THEN
        ALTER TABLE projects ADD COLUMN main_impacts TEXT[];
    END IF;
    
    -- Adicionar vote_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'vote_date') THEN
        ALTER TABLE projects ADD COLUMN vote_date DATE;
    END IF;
    
    -- Adicionar original_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'original_url') THEN
        ALTER TABLE projects ADD COLUMN original_url TEXT;
    END IF;
    
    -- Adicionar notified se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'notified') THEN
        ALTER TABLE projects ADD COLUMN notified BOOLEAN DEFAULT false;
    END IF;
    
    -- Atualizar status para usar novos valores
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE projects ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('em_análise', 'em_votação', 'aprovado', 'rejeitado', 'arquivado', 'draft', 'active', 'voting', 'approved', 'rejected', 'archived'));
END $$;

-- 3. Atualizar tabela votes com novos campos
DO $$ 
BEGIN
    -- Adicionar citizen_phone se não existir (para facilitar queries)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'citizen_phone') THEN
        ALTER TABLE votes ADD COLUMN citizen_phone VARCHAR(20);
    END IF;
    
    -- Adicionar city_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'city_id') THEN
        ALTER TABLE votes ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar upvotes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'upvotes') THEN
        ALTER TABLE votes ADD COLUMN upvotes INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar downvotes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'downvotes') THEN
        ALTER TABLE votes ADD COLUMN downvotes INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar quality_score se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'quality_score') THEN
        ALTER TABLE votes ADD COLUMN quality_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Atualizar tabela citizens
DO $$ 
BEGIN
    -- Mudar engagement_level de VARCHAR para INTEGER se necessário
    -- Primeiro, vamos criar uma coluna temporária
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'citizens' AND column_name = 'engagement_level' 
               AND data_type = 'character varying') THEN
        -- Converter valores existentes
        ALTER TABLE citizens ADD COLUMN engagement_level_new INTEGER DEFAULT 0;
        UPDATE citizens SET engagement_level_new = 
            CASE engagement_level
                WHEN 'beginner' THEN 0
                WHEN 'intermediate' THEN 1
                WHEN 'advanced' THEN 2
                WHEN 'expert' THEN 3
                WHEN 'master' THEN 4
                ELSE 0
            END;
        ALTER TABLE citizens DROP COLUMN engagement_level;
        ALTER TABLE citizens RENAME COLUMN engagement_level_new TO engagement_level;
    END IF;
    
    -- Garantir que engagement_level existe como INTEGER
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'citizens' AND column_name = 'engagement_level') THEN
        ALTER TABLE citizens ADD COLUMN engagement_level INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. Atualizar tabela complaints
DO $$ 
BEGIN
    -- Renomear original_text para original_complaint se necessário
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'complaints' AND column_name = 'original_text') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'complaints' AND column_name = 'original_complaint') THEN
        ALTER TABLE complaints RENAME COLUMN original_text TO original_complaint;
    END IF;
    
    -- Adicionar citizen_phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'citizen_phone') THEN
        ALTER TABLE complaints ADD COLUMN citizen_phone VARCHAR(20);
    END IF;
    
    -- Adicionar project_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'project_id') THEN
        ALTER TABLE complaints ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
    
    -- Atualizar status
    ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
    ALTER TABLE complaints ADD CONSTRAINT complaints_status_check 
        CHECK (status IN ('registrada', 'enviada', 'em_andamento', 'resolvida', 'new', 'sent', 'resolved'));
    
    -- Atualizar category enum
    ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_category_check;
    
    -- Adicionar document_url se não existir (renomear de pdf_url se existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'complaints' AND column_name = 'pdf_url') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'complaints' AND column_name = 'document_url') THEN
        ALTER TABLE complaints RENAME COLUMN pdf_url TO document_url;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'document_url') THEN
        ALTER TABLE complaints ADD COLUMN document_url TEXT;
    END IF;
    
    -- Adicionar sent_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'sent_date') THEN
        ALTER TABLE complaints ADD COLUMN sent_date DATE;
    END IF;
    
    -- Atualizar responsible_agency enum
    ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_responsible_agency_check;
END $$;

-- 6. Atualizar tabela comments
DO $$ 
BEGIN
    -- Adicionar citizen_phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'citizen_phone') THEN
        ALTER TABLE comments ADD COLUMN citizen_phone VARCHAR(20);
    END IF;
    
    -- Adicionar citizen_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'citizen_name') THEN
        ALTER TABLE comments ADD COLUMN citizen_name VARCHAR(255);
    END IF;
    
    -- Adicionar city_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'city_id') THEN
        ALTER TABLE comments ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar is_moderated se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'is_moderated') THEN
        ALTER TABLE comments ADD COLUMN is_moderated BOOLEAN DEFAULT true;
    END IF;
    
    -- Adicionar reported se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'reported') THEN
        ALTER TABLE comments ADD COLUMN reported BOOLEAN DEFAULT false;
    END IF;
    
    -- Adicionar report_count se não existir (renomear de reports se existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'comments' AND column_name = 'reports') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'comments' AND column_name = 'report_count') THEN
        ALTER TABLE comments RENAME COLUMN reports TO report_count;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'report_count') THEN
        ALTER TABLE comments ADD COLUMN report_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 7. Criar tabela council_members se não existir
CREATE TABLE IF NOT EXISTS council_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    photo_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    total_projects INTEGER DEFAULT 0,
    dashboard_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_votes_citizen_phone ON votes(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_votes_city_id ON votes(city_id);
CREATE INDEX IF NOT EXISTS idx_comments_citizen_phone ON comments(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_comments_city_id ON comments(city_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_phone ON complaints(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_complaints_project_id ON complaints(project_id);
CREATE INDEX IF NOT EXISTS idx_council_members_city_id ON council_members(city_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para council_members
DROP TRIGGER IF EXISTS update_council_members_updated_at ON council_members;
CREATE TRIGGER update_council_members_updated_at
    BEFORE UPDATE ON council_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

