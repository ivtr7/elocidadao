-- Funções RPC para o agente WhatsApp

-- Incrementar total_votes do cidadão
CREATE OR REPLACE FUNCTION increment_citizen_votes(citizen_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE citizens
    SET 
        total_votes = COALESCE(total_votes, 0) + 1,
        updated_at = NOW()
    WHERE id = citizen_id_param;
END;
$$ LANGUAGE plpgsql;

-- Incrementar total_complaints do cidadão
CREATE OR REPLACE FUNCTION increment_citizen_complaints(citizen_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE citizens
    SET 
        total_complaints = COALESCE(total_complaints, 0) + 1,
        updated_at = NOW()
    WHERE id = citizen_id_param;
END;
$$ LANGUAGE plpgsql;

-- Incrementar total_comments do cidadão
CREATE OR REPLACE FUNCTION increment_citizen_comments(citizen_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE citizens
    SET 
        total_comments = COALESCE(total_comments, 0) + 1,
        updated_at = NOW()
    WHERE id = citizen_id_param;
END;
$$ LANGUAGE plpgsql;

-- Atualizar nível de engajamento do cidadão
CREATE OR REPLACE FUNCTION update_citizen_engagement_level(citizen_id_param UUID)
RETURNS VOID AS $$
DECLARE
    total_actions INTEGER;
    new_level TEXT;
BEGIN
    SELECT COALESCE(total_votes, 0) + COALESCE(total_comments, 0) + COALESCE(total_complaints, 0)
    INTO total_actions
    FROM citizens
    WHERE id = citizen_id_param;

    -- Determinar nível baseado em ações
    IF total_actions >= 50 THEN
        new_level := 'expert';
    ELSIF total_actions >= 20 THEN
        new_level := 'advanced';
    ELSIF total_actions >= 10 THEN
        new_level := 'intermediate';
    ELSIF total_actions >= 5 THEN
        new_level := 'beginner';
    ELSE
        new_level := 'new';
    END IF;

    UPDATE citizens
    SET 
        engagement_level = new_level,
        updated_at = NOW()
    WHERE id = citizen_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar nível de engajamento automaticamente
CREATE OR REPLACE FUNCTION auto_update_engagement_level()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_citizen_engagement_level(NEW.citizen_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar engajamento
DROP TRIGGER IF EXISTS update_engagement_on_vote ON votes;
CREATE TRIGGER update_engagement_on_vote
    AFTER INSERT ON votes
    FOR EACH ROW
    WHEN (NEW.citizen_id IS NOT NULL)
    EXECUTE FUNCTION auto_update_engagement_level();

DROP TRIGGER IF EXISTS update_engagement_on_comment ON comments;
CREATE TRIGGER update_engagement_on_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    WHEN (NEW.citizen_id IS NOT NULL)
    EXECUTE FUNCTION auto_update_engagement_level();

DROP TRIGGER IF EXISTS update_engagement_on_complaint ON complaints;
CREATE TRIGGER update_engagement_on_complaint
    AFTER INSERT ON complaints
    FOR EACH ROW
    WHEN (NEW.citizen_id IS NOT NULL)
    EXECUTE FUNCTION auto_update_engagement_level();

