#!/usr/bin/env python3
"""
Script para gerar PDF de reclamações formais
Converte reclamações em documentos PDF oficiais
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.colors import black, blue, gray
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from supabase import create_client
import io

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_complaint_pdf(complaint_data):
    """Cria PDF de reclamação formal"""
    
    # Criar buffer em memória
    buffer = io.BytesIO()
    
    # Configurar documento
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo personalizado para título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=blue
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=12,
        textColor=blue
    )
    
    # Estilo para texto normal
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        alignment=TA_JUSTIFY
    )
    
    # Estilo para informações
    info_style = ParagraphStyle(
        'CustomInfo',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        alignment=TA_LEFT
    )
    
    # Conteúdo do documento
    story = []
    
    # Cabeçalho
    story.append(Paragraph("PREFEITURA MUNICIPAL", title_style))
    story.append(Spacer(1, 12))
    
    # Informações do protocolo
    protocol_info = f"""
    <b>PROTOCOLO Nº:</b> {complaint_data.get('protocol_number', 'XXXXX')}<br/>
    <b>DATA:</b> {datetime.now().strftime('%d/%m/%Y')}<br/>
    <b>HORA:</b> {datetime.now().strftime('%H:%M')}<br/>
    <b>CATEGORIA:</b> {complaint_data.get('category', 'Não especificada').upper()}
    """
    story.append(Paragraph(protocol_info, info_style))
    story.append(Spacer(1, 20))
    
    # Título principal
    story.append(Paragraph("RECLAMAÇÃO FORMAL", subtitle_style))
    story.append(Spacer(1, 12))
    
    # Dados do cidadão
    citizen_info = f"""
    <b>DADOS DO CIDADÃO:</b><br/>
    <b>Nome:</b> {complaint_data.get('citizen_name', 'Não informado')}<br/>
    <b>Telefone:</b> {complaint_data.get('citizen_phone', 'Não informado')}<br/>
    <b>Cidade:</b> {complaint_data.get('city_name', 'Não informada')}<br/>
    <b>Data da reclamação:</b> {complaint_data.get('created_at', datetime.now()).strftime('%d/%m/%Y')}
    """
    story.append(Paragraph(citizen_info, info_style))
    story.append(Spacer(1, 20))
    
    # Descrição da reclamação
    story.append(Paragraph("<b>DESCRIÇÃO DA RECLAMAÇÃO:</b>", subtitle_style))
    story.append(Spacer(1, 6))
    
    complaint_text = complaint_data.get('formal_document', complaint_data.get('original_text', 'Texto não fornecido'))
    story.append(Paragraph(complaint_text.replace('\n', '<br/>'), normal_style))
    story.append(Spacer(1, 20))
    
    # Órgão responsável
    story.append(Paragraph("<b>ÓRGÃO RESPONSÁVEL:</b>", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(complaint_data.get('responsible_agency', 'Prefeitura Municipal'), normal_style))
    story.append(Spacer(1, 20))
    
    # Prazo de resposta
    story.append(Paragraph("<b>PRAZO PARA RESPOSTA:</b>", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Conforme estabelecido na legislação municipal, o órgão responsável tem até 30 (trinta) dias úteis para responder esta reclamação.",
        normal_style
    ))
    story.append(Spacer(1, 30))
    
    # Assinatura
    signature_info = f"""
    <b>Assinado digitalmente por:</b><br/>
    {complaint_data.get('citizen_name', 'Cidadão')}<br/>
    <b>Data:</b> {datetime.now().strftime('%d/%m/%Y')}<br/>
    <br/>
    <br/>
    ________________________________<br/>
    <b>Assinatura do Responsável</b>
    """
    story.append(Paragraph(signature_info, info_style))
    
    # Rodapé
    footer_text = f"""
    <para alignment="center" textColor="{gray}">
    Este documento foi gerado automaticamente pelo sistema Elo Cidadão<br/>
    Protocolo: {complaint_data.get('protocol_number', 'XXXXX')} | 
    Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>
    Sistema de Participação Popular Municipal
    </para>
    """
    story.append(Spacer(1, 40))
    story.append(Paragraph(footer_text, info_style))
    
    # Construir PDF
    doc.build(story)
    
    # Retornar bytes
    buffer.seek(0)
    return buffer.getvalue()

def generate_protocol_number():
    """Gera número de protocolo único"""
    now = datetime.now()
    return f"REC-{now.year}{now.month:02d}{now.day:02d}-{now.hour:02d}{now.minute:02d}{now.second:02d}"

def process_complaint_pdf(complaint_id):
    """Processa uma reclamação e gera PDF"""
    try:
        # Buscar reclamação
        response = supabase.table('complaints')\
            .select('*, citizens(name, phone), cities(name)')\
            .eq('id', complaint_id)\
            .single()\
            .execute()
        
        if not response.data:
            print(f"Reclamação {complaint_id} não encontrada")
            return None
        
        complaint = response.data
        
        # Preparar dados para PDF
        complaint_data = {
            'protocol_number': generate_protocol_number(),
            'citizen_name': complaint['citizens']['name'],
            'citizen_phone': complaint['citizens']['phone'],
            'city_name': complaint['cities']['name'],
            'category': complaint['category'],
            'responsible_agency': complaint['responsible_agency'],
            'formal_document': complaint['formal_document'],
            'original_text': complaint['original_text'],
            'created_at': datetime.fromisoformat(complaint['created_at'])
        }
        
        # Gerar PDF
        pdf_content = create_complaint_pdf(complaint_data)
        
        # Salvar PDF no Supabase Storage (simulação)
        # Em produção, você salvaria no Supabase Storage
        pdf_filename = f"complaint_{complaint_id}_{generate_protocol_number()}.pdf"
        
        # Atualizar registro com URL do PDF
        supabase.table('complaints')\
            .update({'pdf_url': f"/storage/complaints/{pdf_filename}"})\
            .eq('id', complaint_id)\
            .execute()
        
        print(f"✅ PDF gerado para reclamação {complaint_id}: {pdf_filename}")
        return pdf_filename
        
    except Exception as e:
        print(f"❌ Erro ao gerar PDF para reclamação {complaint_id}: {e}")
        return None

def process_pending_complaints():
    """Processa todas as reclamações pendentes de PDF"""
    try:
        # Buscar reclamações sem PDF
        response = supabase.table('complaints')\
            .select('id')\
            .is_('pdf_url', 'null')\
            .eq('status', 'new')\
            .execute()
        
        complaints = response.data or []
        print(f"Encontradas {len(complaints)} reclamações pendentes de PDF")
        
        for complaint in complaints:
            process_complaint_pdf(complaint['id'])
            # Pequena pausa para não sobrecarregar
            time.sleep(1)
            
    except Exception as e:
        print(f"Erro ao processar reclamações pendentes: {e}")

def main():
    """Função principal"""
    print("🚀 Iniciando geração de PDFs de reclamações...")
    
    while True:
        try:
            process_pending_complaints()
            
            # Aguardar 5 minutos antes da próxima verificação
            print("Aguardando 5 minutos...")
            time.sleep(300)
            
        except KeyboardInterrupt:
            print("\n🛑 Serviço interrompido pelo usuário")
            break
        except Exception as e:
            print(f"Erro no loop principal: {e}")
            time.sleep(60)  # Aguardar 1 minuto em caso de erro

if __name__ == "__main__":
    main()