#!/usr/bin/env python3
"""
Script de notificação de cidadãos via WhatsApp
Monitora fila de notificações e envia mensagens para cidadãos
"""

import os
import time
import requests
from datetime import datetime, timedelta
from supabase import create_client
import asyncio
import json

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
API_URL = os.getenv('API_URL', 'http://localhost:3001')

# Cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_pending_notifications():
    """Busca notificações pendentes na fila"""
    try:
        response = supabase.table('notifications_queue')\
            .select('*')\
            .eq('status', 'pending')\
            .lte('scheduled_at', datetime.now().isoformat())\
            .limit(50)\
            .execute()
        
        return response.data or []
    except Exception as e:
        print(f"Erro ao buscar notificações: {e}")
        return []

def update_notification_status(notification_id, status, error_message=None):
    """Atualiza status da notificação"""
    try:
        data = {
            'status': status,
            'processed_at': datetime.now().isoformat()
        }
        
        if error_message:
            data['error_message'] = error_message
        
        supabase.table('notifications_queue')\
            .update(data)\
            .eq('id', notification_id)\
            .execute()
            
    except Exception as e:
        print(f"Erro ao atualizar notificação: {e}")

def send_whatsapp_message(phone, message):
    """Envia mensagem via WhatsApp através da API"""
    try:
        payload = {
            'phone': phone,
            'message': message
        }
        
        response = requests.post(
            f"{API_URL}/api/whatsapp/send",
            json=payload,
            timeout=30
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Erro ao enviar mensagem WhatsApp: {e}")
        return False

def create_notification_message(notification_type, data):
    """Cria mensagem baseada no tipo de notificação"""
    
    if notification_type == 'new_project':
        return f"""📋 *Novo Projeto Disponível!*

📝 {data.get('project_title', 'Novo projeto')}
🏙️ Cidade: {data.get('city_name', 'Sua cidade')}

📊 Participe votando e comentando!
💬 Envie *VOTAR {data.get('project_number', '')}* para votar

#EloCidadão #ParticipaçãoPopular"""

    elif notification_type == 'project_reminder':
        return f"""⏰ *Lembrete: Projeto em Votação*

📝 {data.get('project_title', 'Projeto')}
📅 Encerra em: {data.get('deadline', 'Breve')}

📊 Ainda não votou? Sua opinião é importante!
💬 Envie *VOTAR {data.get('project_number', '')}*

#EloCidadão #VoteAgora"""

    elif notification_type == 'voting_result':
        return f"""📊 *Resultado da Votação*

📝 {data.get('project_title', 'Projeto')}
✅ Aprovado: {data.get('approved_percentage', 0)}%
�️ Contra: {data.get('against_percentage', 0)}%
🗳️ Total de votos: {data.get('total_votes', 0)}

📰 Veja os detalhes completos no app

#EloCidadão #Resultados"""

    elif notification_type == 'ranking_update':
        return f"""🏆 *Seu Ranking foi Atualizado!*

⭐ Você agora está em #{data.get('current_position', 0)}º lugar
📈 Subiu {data.get('positions_gained', 0)} posições!
🎯 Continue participando para subir mais

#EloCidadão #Ranking"""

    else:
        return f"""📢 *Notificação do Elo Cidadão*

{data.get('custom_message', 'Você tem uma nova notificação!')}

#EloCidadão"""

def process_notifications():
    """Processa fila de notificações"""
    notifications = get_pending_notifications()
    
    if not notifications:
        print("Nenhuma notificação pendente")
        return
    
    print(f"Processando {len(notifications)} notificações...")
    
    for notification in notifications:
        try:
            # Criar mensagem
            message = create_notification_message(
                notification['type'],
                notification['data'] or {}
            )
            
            # Enviar mensagem
            success = send_whatsapp_message(
                notification['recipient_phone'],
                message
            )
            
            # Atualizar status
            if success:
                update_notification_status(notification['id'], 'sent')
                print(f"✅ Notificação {notification['id']} enviada com sucesso")
            else:
                update_notification_status(
                    notification['id'], 
                    'failed',
                    'Erro ao enviar mensagem'
                )
                print(f"❌ Falha ao enviar notificação {notification['id']}")
            
            # Respeitar limite de 1 msg/segundo
            time.sleep(1)
            
        except Exception as e:
            print(f"Erro ao processar notificação {notification['id']}: {e}")
            update_notification_status(
                notification['id'],
                'failed',
                str(e)
            )

def main():
    """Função principal"""
    print("🚀 Iniciando serviço de notificações WhatsApp...")
    
    while True:
        try:
            process_notifications()
            
            # Aguardar 30 segundos antes da próxima verificação
            time.sleep(30)
            
        except KeyboardInterrupt:
            print("\n🛑 Serviço interrompido pelo usuário")
            break
        except Exception as e:
            print(f"Erro no loop principal: {e}")
            time.sleep(60)  # Aguardar 1 minuto em caso de erro

if __name__ == "__main__":
    main()