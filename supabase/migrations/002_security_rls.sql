-- Configuração de Row Level Security (RLS) e permissões

-- Ativar RLS em todas as tabelas
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Permissões para tabela cities (leitura pública)
CREATE POLICY "Cities are viewable by everyone" ON cities
    FOR SELECT USING (true);

CREATE POLICY "Cities can be managed by admins" ON cities
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela citizens
CREATE POLICY "Citizens can view own profile" ON citizens
    FOR SELECT USING (auth.jwt() ->> 'sub' = id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Citizens can update own profile" ON citizens
    FOR UPDATE USING (auth.jwt() ->> 'sub' = id::text);

CREATE POLICY "Admins can manage citizens" ON citizens
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela projects (leitura pública por cidade)
CREATE POLICY "Projects are viewable by city" ON projects
    FOR SELECT USING (
        city_id IN (
            SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage projects" ON projects
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela votes (usuários autenticados)
CREATE POLICY "Users can view votes in their city" ON votes
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create own votes" ON votes
    FOR INSERT WITH CHECK (
        citizen_id = (auth.jwt() ->> 'sub')::uuid AND
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        )
    );

-- Permissões para tabela comments
CREATE POLICY "Users can view comments in their city" ON comments
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create own comments" ON comments
    FOR INSERT WITH CHECK (
        citizen_id = (auth.jwt() ->> 'sub')::uuid AND
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        )
    );

CREATE POLICY "Admins can moderate comments" ON comments
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela complaints
CREATE POLICY "Users can create own complaints" ON complaints
    FOR INSERT WITH CHECK (
        citizen_id = auth.jwt() ->> 'sub'::uuid AND
        city_id IN (
            SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
        )
    );

CREATE POLICY "Users can view own complaints" ON complaints
    FOR SELECT USING (
        (citizen_id = (auth.jwt() ->> 'sub')::uuid) OR (auth.jwt() ->> 'role' = 'admin')
    );

CREATE POLICY "Admins can manage complaints" ON complaints
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela conversations (WhatsApp)
CREATE POLICY "Admins can view conversations" ON conversations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage conversations" ON conversations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões para tabela messages (WhatsApp)
CREATE POLICY "Admins can view messages" ON messages
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage messages" ON messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Grant basic permissions
GRANT SELECT ON cities TO anon, authenticated;
GRANT SELECT ON projects TO anon, authenticated;
GRANT SELECT ON votes TO anon, authenticated;
GRANT SELECT ON comments TO anon, authenticated;

GRANT INSERT ON citizens TO anon;
GRANT INSERT ON votes TO authenticated;
GRANT INSERT ON comments TO authenticated;
GRANT INSERT ON complaints TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;