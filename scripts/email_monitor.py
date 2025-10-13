"""
Monitor de e-mails para criação automática de tickets
"""

import imaplib
import email
import logging
from email.header import decode_header
from email.utils import parsedate_to_datetime
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from celery import shared_task
import re
import html2text
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class EmailMonitor:
    """Classe para monitoramento de caixa de e-mail"""
    
    def __init__(self):
        self.imap_host = getattr(settings, 'IMAP_HOST', 'imap.gmail.com')
        self.imap_port = getattr(settings, 'IMAP_PORT', 993)
        self.imap_use_ssl = getattr(settings, 'IMAP_USE_SSL', True)
        self.username = getattr(settings, 'IMAP_USER', '')
        self.password = getattr(settings, 'IMAP_PASSWORD', '')
        self.connection = None
    
    def connect(self):
        """Conecta ao servidor IMAP"""
        try:
            if self.imap_use_ssl:
                self.connection = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
            else:
                self.connection = imaplib.IMAP4(self.imap_host, self.imap_port)
            
            self.connection.login(self.username, self.password)
            logger.info(f"Conectado ao servidor IMAP: {self.imap_host}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar IMAP: {e}")
            return False
    
    def disconnect(self):
        """Desconecta do servidor IMAP"""
        if self.connection:
            try:
                self.connection.close()
                self.connection.logout()
                logger.info("Desconectado do servidor IMAP")
            except:
                pass
    
    def get_new_emails(self, mailbox='INBOX', since_date=None):
        """
        Busca novos e-mails
        
        Args:
            mailbox (str): Caixa de entrada
            since_date (datetime): Data para buscar e-mails desde
            
        Returns:
            list: Lista de e-mails
        """
        if not self.connection:
            if not self.connect():
                return []
        
        try:
            self.connection.select(mailbox)
            
            # Definir critério de busca
            if since_date:
                since_str = since_date.strftime("%d-%b-%Y")
                search_criteria = f'(UNSEEN SINCE "{since_str}")'
            else:
                search_criteria = '(UNSEEN)'
            
            # Buscar e-mails
            status, messages = self.connection.search(None, search_criteria)
            
            if status != 'OK':
                logger.error("Erro ao buscar e-mails")
                return []
            
            email_ids = messages[0].split()
            emails = []
            
            for email_id in email_ids:
                email_data = self.fetch_email(email_id)
                if email_data:
                    emails.append(email_data)
            
            logger.info(f"Encontrados {len(emails)} novos e-mails")
            return emails
            
        except Exception as e:
            logger.error(f"Erro ao buscar e-mails: {e}")
            return []
    
    def fetch_email(self, email_id):
        """
        Busca dados de um e-mail específico
        
        Args:
            email_id: ID do e-mail
            
        Returns:
            dict: Dados do e-mail
        """
        try:
            status, msg_data = self.connection.fetch(email_id, '(RFC822)')
            
            if status != 'OK':
                return None
            
            # Parse do e-mail
            email_message = email.message_from_bytes(msg_data[0][1])
            
            # Extrair dados básicos
            email_data = {
                'message_id': email_message.get('Message-ID', ''),
                'subject': self.decode_mime_words(email_message.get('Subject', '')),
                'from': self.decode_mime_words(email_message.get('From', '')),
                'to': self.decode_mime_words(email_message.get('To', '')),
                'date': self.parse_email_date(email_message.get('Date', '')),
                'body': self.extract_email_body(email_message),
                'attachments': self.extract_attachments(email_message),
                'thread_id': self.extract_thread_id(email_message),
                'in_reply_to': email_message.get('In-Reply-To', ''),
                'references': email_message.get('References', ''),
            }
            
            # Extrair e-mail do remetente
            email_data['sender_email'] = self.extract_email_address(email_data['from'])
            email_data['sender_name'] = self.extract_sender_name(email_data['from'])
            
            return email_data
            
        except Exception as e:
            logger.error(f"Erro ao processar e-mail {email_id}: {e}")
            return None
    
    def decode_mime_words(self, s):
        """Decodifica palavras MIME"""
        try:
            decoded_words = decode_header(s)
            decoded_string = ''
            for word, encoding in decoded_words:
                if isinstance(word, bytes):
                    if encoding:
                        decoded_string += word.decode(encoding)
                    else:
                        decoded_string += word.decode('utf-8', errors='ignore')
                else:
                    decoded_string += word
            return decoded_string
        except:
            return s
    
    def parse_email_date(self, date_str):
        """Converte data do e-mail para datetime"""
        try:
            return parsedate_to_datetime(date_str)
        except:
            return timezone.now()
    
    def extract_email_body(self, email_message):
        """Extrai corpo do e-mail"""
        body = ""
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                # Pular anexos
                if "attachment" in content_disposition:
                    continue
                
                if content_type == "text/plain":
                    try:
                        body += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except:
                        pass
                elif content_type == "text/html":
                    try:
                        html_content = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        # Converter HTML para texto
                        h = html2text.HTML2Text()
                        h.ignore_links = True
                        body += h.handle(html_content)
                    except:
                        pass
        else:
            try:
                body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
            except:
                body = str(email_message.get_payload())
        
        return self.clean_email_body(body)
    
    def clean_email_body(self, body):
        """Limpa corpo do e-mail"""
        # Remover assinaturas comuns
        body = re.sub(r'\n--\s*\n.*', '', body, flags=re.DOTALL)
        body = re.sub(r'\n\s*Enviado do meu.*', '', body, flags=re.DOTALL)
        
        # Remover quebras de linha excessivas
        body = re.sub(r'\n{3,}', '\n\n', body)
        
        # Remover espaços em branco no início e fim
        body = body.strip()
        
        return body
    
    def extract_attachments(self, email_message):
        """Extrai informações de anexos"""
        attachments = []
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_disposition = str(part.get("Content-Disposition"))
                
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        attachments.append({
                            'filename': self.decode_mime_words(filename),
                            'content_type': part.get_content_type(),
                            'size': len(part.get_payload(decode=True)) if part.get_payload(decode=True) else 0
                        })
        
        return attachments
    
    def extract_thread_id(self, email_message):
        """Extrai ID do thread de e-mail"""
        # Tentar extrair da referência ou assunto
        references = email_message.get('References', '')
        if references:
            # Pegar primeira referência como thread ID
            return references.split()[0] if references.split() else ''
        
        # Se não tem referência, usar Message-ID como novo thread
        return email_message.get('Message-ID', '')
    
    def extract_email_address(self, from_field):
        """Extrai endereço de e-mail do campo From"""
        email_pattern = r'<([^>]+)>'
        match = re.search(email_pattern, from_field)
        if match:
            return match.group(1)
        
        # Se não tem <>, assumir que é só o e-mail
        email_pattern = r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        match = re.search(email_pattern, from_field)
        if match:
            return match.group(1)
        
        return from_field.strip()
    
    def extract_sender_name(self, from_field):
        """Extrai nome do remetente"""
        if '<' in from_field:
            name = from_field.split('<')[0].strip()
            return name.strip('"\'') if name else ''
        return ''


@shared_task
def monitor_emails():
    """Task Celery para monitorar e-mails"""
    monitor = EmailMonitor()
    
    try:
        # Buscar e-mails das últimas 24 horas
        since_date = timezone.now() - timedelta(hours=24)
        emails = monitor.get_new_emails(since_date=since_date)
        
        for email_data in emails:
            # Processar cada e-mail em uma task separada
            process_email_task.delay(email_data)
        
        logger.info(f"Monitoramento concluído. {len(emails)} e-mails processados")
        
    except Exception as e:
        logger.error(f"Erro no monitoramento de e-mails: {e}")
    
    finally:
        monitor.disconnect()


@shared_task
def process_email_task(email_data):
    """Task para processar um e-mail específico"""
    from contact_management.models import Contact, ContactHistory
    from ticket_management.models import Ticket, TicketComment
    from ai.sentiment import analyze_email_sentiment, suggest_ticket_priority
    from ai.response_suggestions import auto_categorize_ticket
    
    try:
        # Buscar ou criar contato
        contact, created = Contact.objects.get_or_create(
            email=email_data['sender_email'],
            defaults={
                'name': email_data['sender_name'] or email_data['sender_email'],
            }
        )
        
        if created:
            logger.info(f"Novo contato criado: {contact}")
        
        # Verificar se é resposta a ticket existente
        existing_ticket = None
        if email_data['thread_id']:
            existing_ticket = Ticket.objects.filter(
                email_thread_id=email_data['thread_id']
            ).first()
        
        if existing_ticket:
            # Adicionar comentário ao ticket existente
            comment = TicketComment.objects.create(
                ticket=existing_ticket,
                comment_type='public',
                content=email_data['body'],
                email_message_id=email_data['message_id'],
                is_email_response=True
            )
            
            # Atualizar status do ticket se estava aguardando cliente
            if existing_ticket.status == 'waiting_customer':
                existing_ticket.status = 'open'
                existing_ticket.save()
            
            # Registrar no histórico do contato
            ContactHistory.objects.create(
                contact=contact,
                interaction_type='email_received',
                description=f"Resposta ao ticket #{existing_ticket.id}: {email_data['subject']}",
                related_ticket=existing_ticket
            )
            
            logger.info(f"Comentário adicionado ao ticket #{existing_ticket.id}")
            
        else:
            # Criar novo ticket
            
            # Análise de sentimento
            sentiment_analysis = analyze_email_sentiment(email_data['body'])
            
            # Sugestão de prioridade
            suggested_priority = suggest_ticket_priority(email_data['body'])
            
            # Categorização automática
            suggested_category = auto_categorize_ticket(email_data['body'])
            
            # Criar ticket
            ticket = Ticket.objects.create(
                title=email_data['subject'][:255],  # Limitar tamanho
                description=email_data['body'],
                contact=contact,
                priority=suggested_priority,
                email_thread_id=email_data['thread_id'],
                sentiment_score=sentiment_analysis.get('score'),
                sentiment_label=sentiment_analysis.get('label')
            )
            
            # Registrar no histórico do contato
            ContactHistory.objects.create(
                contact=contact,
                interaction_type='ticket_created',
                description=f"Ticket criado automaticamente: {email_data['subject']}",
                related_ticket=ticket
            )
            
            logger.info(f"Novo ticket criado: #{ticket.id} - {ticket.title}")
        
    except Exception as e:
        logger.error(f"Erro ao processar e-mail: {e}")


class Command(BaseCommand):
    """Comando Django para executar o monitor de e-mails"""
    
    help = 'Monitora caixa de e-mail e cria tickets automaticamente'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--once',
            action='store_true',
            help='Executar apenas uma vez ao invés de loop contínuo',
        )
    
    def handle(self, *args, **options):
        if options['once']:
            self.stdout.write("Executando monitoramento único...")
            monitor_emails()
        else:
            self.stdout.write("Iniciando monitoramento contínuo...")
            # Implementar loop contínuo aqui se necessário