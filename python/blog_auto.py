#!/usr/bin/env python3
"""
Script de monitoramento e geração automática de posts de blog
Monitora mudanças no Supabase e gera posts automáticos
"""

import os
import time
import requests
from datetime import datetime, timedelta
from supabase import create_client
import json

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
API_URL = os.getenv('API_URL', 'http://localhost:3001')

# Cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_new_projects():
    """Verifica novos projetos nas últimas horas"""
    try:
        # Buscar projetos criados nas últimas 2 horas
        two_hours_ago = (datetime.now() - timedelta(hours=2)).isoformat()
        
        response = supabase.table('projects')\
            .select('*, cities(name)')\
            .gte('created_at', two_hours_ago)\
            .execute()
        
        return response.data or []
        
    except Exception as e:
        print(f"Erro ao verificar novos projetos: {e}")
        return []

def check_voting_milestones():
    """Verifica marcos de votação"""
    try:
        # Buscar projetos com muitos votos recentes
        one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
        
        response = supabase.rpc('get_projects_with_recent_votes', {
            'since_time': one_hour_ago,
            'min_votes': 10
        }).execute()
        
        return response.data or []
        
    except Exception as e:
        print(f"Erro ao verificar marcos de votação: {e}")
        return []

def check_ranking_changes():
    """Verifica mudanças significativas no ranking"""
    try:
        # Buscar cidadãos que subiram muito no ranking
        one_day_ago = (datetime.now() - timedelta(days=1)).isoformat()
        
        response = supabase.rpc('get_ranking_changes', {
            'since_time': one_day_ago,
            'min_position_change': 10
        }).execute()
        
        return response.data or []
        
 except Exception as e:
        print(f"Erro ao verificar mudanças no ranking: {e}")
        return []

def generate_blog_post(title, content, category='geral'):
    """Cria post de blog no sistema"""
    try:
        post_data = {
            'title': title,
            'content': content,
            'category': category,
            'is_auto_generated': True,
            'created_at': datetime.now().isoformat()
        }
        
        response = supabase.table('blog_posts')\
            .insert(post_data)\
            .execute()
        
        if response.data:
            print(f"✅ Post criado: {title}")
            return response.data[0]
        else:
            print(f"❌ Falha ao criar post: {title}")
            return None
            
    except Exception as e:
        print(f"Erro ao criar post de blog: {e}")
        return None

def create_project_blog_post(project):
    """Cria post sobre novo projeto"""
    title = f"📋 Novo Projeto: {project.get('simple_title', project['title'])}"
    
    content = f"""
Foi publicado um novo projeto na cidade de {project['cities']['name']}.

**Projeto {project['number']}**: {project.get('simple_title', project['title'])}

{project.get('summary', 'Confira os detalhes e participe do processo democrático.')}

### Como participar?
- 📊 **Vote** no projeto
- 💬 **Comente** e compartilhe sua opinião
- 📱 **Acesse** pelo WhatsApp

{project.get('who_benefits', '') and f'**Quem se beneficia:** {project[\"who_benefits\"]}'}
{project.get('who_loses', '') and f'**Quem pode ser prejudicado:** {project[\"who_loses\"]}'}

Participe da democracia municipal! 🗳️
    """
    
    return generate_blog_post(title, content.strip(), 'projetos')

def create_voting_milestone_post(project_data):
    """Cria post sobre marco de votação"""
    title = f"📊 Projeto {project_data['number']} atinge {project_data['recent_votes']} votos!"
    
    content = f"""
O projeto **{project_data['simple_title']}** está em alta! 📈

Nas últimas horas, recebeu {project_data['recent_votes']} novos votos, totalizando {project_data['total_votes']} participações.

**Resultado parcial:**
- ✅ **A favor:** {project_data['total_support']} votos
- ❌ **Contra:** {project_data['total_against']} votos

A votação continua aberta! Sua opinião é fundamental para o futuro da nossa cidade. 🏙️

Vote agora: envie **VOTAR {project_data['number']}** pelo WhatsApp
    """
    
    return generate_blog_post(title, content.strip(), 'votacoes')

def create_ranking_update_post(citizen_data):
    """Cria post sobre atualização no ranking"""
    title = f"🏆 {citizen_data['name']} sobe para #{citizen_data['current_position']} no ranking!"
    
    content = f"""
Parabéns **{citizen_data['name']}**! 🎉

Você subiu {citizen_data['positions_gained']} posições no ranking de cidadãos mais engajados, agora ocupando a **{citizen_data['current_position']}ª posição**!

**Seus números:**
- ⭐ Estrelas: {citizen_data['stars']}
- 🗳️ Votos: {citizen_data['total_votes']}
- 💬 Comentários: {citizen_data['total_comments']}
- 📊 Nível: {citizen_data['engagement_level']}

Continue participando e suba ainda mais no ranking! 💪

#EloCidadão #Engajamento
    """
    
    return generate_blog_post(title, content.strip(), 'ranking')

def monitor_and_create_posts():
    """Monitora mudanças e cria posts automáticos"""
    print("🔍 Monitorando mudanças para posts automáticos...")
    
    posts_created = 0
    
    # 1. Verificar novos projetos
    new_projects = check_new_projects()
    for project in new_projects:
        if create_project_blog_post(project):
            posts_created += 1
    
    # 2. Verificar marcos de votação
    voting_projects = check_voting_milestones()
    for project in voting_projects:
        if create_voting_milestone_post(project):
            posts_created += 1
    
    # 3. Verificar mudanças no ranking
    ranking_changes = check_ranking_changes()
    for citizen in ranking_changes:
        if create_ranking_update_post(citizen):
            posts_created += 1
    
    print(f"📚 {posts_created} posts criados nesta rodada")
    return posts_created

def main():
    """Função principal"""
    print("🚀 Iniciando monitoramento de blog automático...")
    
    while True:
        try:
            posts_created = monitor_and_create_posts()
            
            if posts_created > 0:
                print(f"✅ Rodada concluída com {posts_created} novos posts")
            else:
                print("ℹ️ Nenhuma mudança detectada nesta rodada")
            
            # Aguardar 10 minutos antes da próxima verificação
            print("⏰ Aguardando 10 minutos...")
            time.sleep(600)
            
        except KeyboardInterrupt:
            print("\n🛑 Monitoramento interrompido pelo usuário")
            break
        except Exception as e:
            print(f"Erro no monitoramento: {e}")
            time.sleep(300)  # Aguardar 5 minutos em caso de erro

if __name__ == "__main__":
    main()