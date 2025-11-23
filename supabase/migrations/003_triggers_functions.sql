-- Triggers e funções para automação

-- Função para atualizar engagement_score de projetos
CREATE OR REPLACE FUNCTION update_project_engagement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'votes' THEN
        UPDATE projects 
        SET 
            total_support = (SELECT COUNT(*) FROM votes WHERE project_id = NEW.project_id AND position = 'support'),
            total_against = (SELECT COUNT(*) FROM votes WHERE project_id = NEW.project_id AND position = 'against'),
            engagement_score = (total_support + total_against) * 10 + total_comments * 5
        WHERE id = NEW.project_id;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        UPDATE projects 
        SET 
            total_comments = (SELECT COUNT(*) FROM comments WHERE project_id = NEW.project_id AND moderation_status = 'approved'),
            engagement_score = (total_support + total_against) * 10 + total_comments * 5
        WHERE id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar engagement_level de cidadãos
CREATE OR REPLACE FUNCTION update_citizen_engagement()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE citizens 
    SET 
        total_votes = (SELECT COUNT(*) FROM votes WHERE citizen_id = NEW.citizen_id),
        total_comments = (SELECT COUNT(*) FROM comments WHERE citizen_id = NEW.citizen_id AND moderation_status = 'approved'),
        total_complaints = (SELECT COUNT(*) FROM complaints WHERE citizen_id = NEW.citizen_id),
        engagement_level = CASE 
            WHEN (total_votes + total_comments + total_complaints) >= 50 THEN 'expert'
            WHEN (total_votes + total_comments + total_complaints) >= 20 THEN 'advanced'
            WHEN (total_votes + total_comments + total_complaints) >= 5 THEN 'intermediate'
            ELSE 'beginner'
        END
    WHERE id = NEW.citizen_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de projetos
CREATE TRIGGER trigger_update_project_on_vote
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_project_engagement();

CREATE TRIGGER trigger_update_project_on_comment
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_project_engagement();

-- Triggers para atualização automática de cidadãos
CREATE TRIGGER trigger_update_citizen_on_vote
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_citizen_engagement();

CREATE TRIGGER trigger_update_citizen_on_comment
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_citizen_engagement();

CREATE TRIGGER trigger_update_citizen_on_complaint
    AFTER INSERT OR UPDATE OR DELETE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_citizen_engagement();

-- Função para criar post automático no blog
CREATE OR REPLACE FUNCTION create_blog_post()
RETURNS TRIGGER AS $$
DECLARE
    post_title TEXT;
    post_content TEXT;
    city_name TEXT;
BEGIN
    -- Obter nome da cidade
    SELECT name INTO city_name FROM cities WHERE id = NEW.city_id;
    
    IF TG_TABLE_NAME = 'projects' THEN
        post_title := 'Novo Projeto: ' || NEW.simple_title || ' - ' || city_name;
        post_content := 'Foi publicado um novo projeto na cidade de ' || city_name || '. ' || 
                       COALESCE(NEW.summary, 'Confira os detalhes e participe votando e comentando.');
    ELSIF TG_TABLE_NAME = 'votes' THEN
        post_title := 'Nova Votação: Projeto ' || (SELECT number FROM projects WHERE id = NEW.project_id);
        post_content := 'Um cidadão acabou de votar no projeto. Acompanhe os resultados em tempo real!';
    END IF;
    
    -- Aqui você pode inserir em uma tabela de blog ou chamar uma função externa
    -- Por enquanto, apenas logamos
    RAISE NOTICE 'Blog post criado: % - %', post_title, post_content;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar posts automáticos
CREATE TRIGGER trigger_blog_post_on_project
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION create_blog_post();

CREATE TRIGGER trigger_blog_post_on_vote
    AFTER INSERT ON votes
    FOR EACH ROW
    WHEN (NEW.created_at > NOW() - INTERVAL '1 hour' AND (SELECT COUNT(*) FROM votes WHERE project_id = NEW.project_id AND created_at > NOW() - INTERVAL '1 hour') >= 10)
    EXECUTE FUNCTION create_blog_post();