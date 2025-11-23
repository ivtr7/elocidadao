-- Criação das tabelas principais do Elo Cidadão

-- Tabela de Cidades
CREATE TABLE cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    population INTEGER,
    chamber_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cidadãos
CREATE TABLE citizens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    stars INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_complaints INTEGER DEFAULT 0,
    engagement_level VARCHAR(20) DEFAULT 'beginner',
    notifications_enabled BOOLEAN DEFAULT true,
    last_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Projetos
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    number VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    simple_title VARCHAR(500),
    summary TEXT,
    full_text TEXT NOT NULL,
    who_benefits TEXT,
    who_loses TEXT,
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    total_support INTEGER DEFAULT 0,
    total_against INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    notify_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Votos
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
    position VARCHAR(20) CHECK (position IN ('support', 'against')),
    reasoning TEXT,
    neighborhood VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, citizen_id)
);

-- Tabela de Comentários
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('approved', 'pending', 'blocked')),
    reports INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Reclamações
CREATE TABLE complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    formal_document TEXT,
    category VARCHAR(100),
    responsible_agency VARCHAR(255),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'sent', 'resolved')),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conversas do WhatsApp
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    citizen_phone VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_citizens_phone ON citizens(phone);
CREATE INDEX idx_citizens_city_id ON citizens(city_id);
CREATE INDEX idx_projects_city_id ON projects(city_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_votes_project_id ON votes(project_id);
CREATE INDEX idx_votes_citizen_id ON votes(citizen_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_citizen_id ON comments(citizen_id);
CREATE INDEX idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX idx_complaints_city_id ON complaints(city_id);
CREATE INDEX idx_conversations_citizen_phone ON conversations(citizen_phone);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);