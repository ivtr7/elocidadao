-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela cities (visível para todos)
CREATE POLICY "Cities are viewable by all" ON cities
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage cities" ON cities
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tabela citizens
CREATE POLICY "Users can view own citizen data" ON citizens
    FOR SELECT USING (
        phone = current_setting('app.current_citizen', true) OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage citizens" ON citizens
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tabela projects
CREATE POLICY "Projects are viewable by city residents" ON projects
    FOR SELECT USING (
        city_id IN (
            SELECT city_id FROM citizens 
            WHERE phone = current_setting('app.current_citizen', true)
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage projects" ON projects
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tabela votes
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
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        ) AND auth.jwt() ->> 'role' = 'authenticated'
    );

-- Políticas para tabela comments
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
        project_id IN (
            SELECT id FROM projects 
            WHERE city_id IN (
                SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
            )
        ) AND auth.jwt() ->> 'role' = 'authenticated'
    );

-- Políticas para tabela complaints
CREATE POLICY "Users can view complaints in their city" ON complaints
    FOR SELECT USING (
        city_id IN (
            SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create own complaints" ON complaints
    FOR INSERT WITH CHECK (
        city_id IN (
            SELECT city_id FROM citizens WHERE phone = current_setting('app.current_citizen', true)
        ) AND auth.jwt() ->> 'role' = 'authenticated'
    );

CREATE POLICY "Admins can manage complaints" ON complaints
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tabela conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        citizen_phone = current_setting('app.current_citizen', true) OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage conversations" ON conversations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tabela messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE citizen_phone = current_setting('app.current_citizen', true)
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage messages" ON messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permissões básicas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON cities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON citizens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON projects TO authenticated;
GRANT SELECT, INSERT ON votes TO authenticated;
GRANT SELECT, INSERT ON comments TO authenticated;
GRANT SELECT, INSERT ON complaints TO authenticated;
GRANT SELECT, INSERT ON conversations TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;