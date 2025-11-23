-- Funções auxiliares
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_blog_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica para criar postagem no blog quando projeto atinge 10 votos
    INSERT INTO notifications (type, title, content, project_id, created_at)
    VALUES ('blog_post', 'Projeto em destaque', 'Este projeto atingiu 10 votos!', NEW.project_id, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON citizens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para notificações de votos
CREATE TRIGGER notify_vote_threshold AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION create_blog_post();

-- Função para registrar mensagens no log
CREATE OR REPLACE FUNCTION log_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_logs (conversation_id, message_type, content, created_at)
    VALUES (NEW.conversation_id, NEW.type, NEW.content, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log de mensagens
CREATE TRIGGER log_incoming_messages AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION log_message();

-- Função para atualizar contador de mensagens
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET message_count = message_count + 1,
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para contador de mensagens
CREATE TRIGGER update_message_count AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();