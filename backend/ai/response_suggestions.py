"""
Módulo de sugestões de resposta usando IA
"""

import logging
from transformers import pipeline
import re
from django.conf import settings

logger = logging.getLogger(__name__)


class ResponseSuggester:
    """Classe para gerar sugestões de resposta"""
    
    def __init__(self):
        self.generator = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Inicializa o modelo de geração de texto"""
        try:
            # Usar modelo menor para desenvolvimento
            self.generator = pipeline(
                'text-generation',
                model='microsoft/DialoGPT-small',
                tokenizer='microsoft/DialoGPT-small',
                max_length=150,
                do_sample=True,
                temperature=0.7
            )
            logger.info("Modelo de sugestão de resposta inicializado")
            
        except Exception as e:
            logger.error(f"Erro ao inicializar modelo de resposta: {e}")
            self.generator = None
    
    def generate_response_suggestions(self, ticket_content, category=None, priority=None):
        """
        Gera sugestões de resposta para um ticket
        
        Args:
            ticket_content (str): Conteúdo do ticket
            category (str): Categoria do ticket
            priority (str): Prioridade do ticket
            
        Returns:
            list: Lista de sugestões de resposta
        """
        if not self.generator:
            return self._get_template_responses(category, priority)
        
        try:
            # Preparar prompt baseado no contexto
            prompt = self._prepare_prompt(ticket_content, category, priority)
            
            # Gerar respostas
            responses = self.generator(
                prompt,
                max_length=200,
                num_return_sequences=3,
                pad_token_id=self.generator.tokenizer.eos_token_id
            )
            
            # Processar e limpar respostas
            suggestions = []
            for response in responses:
                text = response['generated_text'].replace(prompt, '').strip()
                cleaned_text = self._clean_response(text)
                if cleaned_text and len(cleaned_text) > 10:
                    suggestions.append(cleaned_text)
            
            # Se não conseguiu gerar, usar templates
            if not suggestions:
                suggestions = self._get_template_responses(category, priority)
            
            return suggestions[:3]  # Máximo 3 sugestões
            
        except Exception as e:
            logger.error(f"Erro ao gerar sugestões: {e}")
            return self._get_template_responses(category, priority)
    
    def _prepare_prompt(self, content, category, priority):
        """Prepara prompt para geração"""
        prompt = "Cliente: " + content[:200] + "\nAtendente:"
        return prompt
    
    def _clean_response(self, response):
        """Limpa e formata resposta gerada"""
        # Remover quebras de linha excessivas
        response = re.sub(r'\n+', '\n', response)
        
        # Remover caracteres especiais
        response = re.sub(r'[^\w\s\.,\!\?\-]', '', response)
        
        # Capitalizar primeira letra
        if response:
            response = response[0].upper() + response[1:]
        
        return response.strip()
    
    def _get_template_responses(self, category=None, priority=None):
        """Retorna respostas template baseadas na categoria e prioridade"""
        
        base_responses = [
            "Obrigado por entrar em contato. Recebemos sua solicitação e iremos analisá-la.",
            "Agradecemos seu contato. Nossa equipe está verificando sua solicitação.",
            "Recebemos sua mensagem e iremos retornar em breve com uma solução."
        ]
        
        if priority == 'urgent':
            return [
                "Entendemos a urgência da sua solicitação. Nossa equipe prioritária já foi acionada.",
                "Trataremos sua solicitação com máxima prioridade. Retornaremos em breve.",
                "Sua solicitação urgente foi encaminhada para nossa equipe especializada."
            ]
        
        if priority == 'high':
            return [
                "Sua solicitação foi classificada como alta prioridade. Iremos analisá-la rapidamente.",
                "Entendemos a importância da sua solicitação e iremos priorizá-la.",
                "Nossa equipe irá tratar sua solicitação com prioridade elevada."
            ]
        
        category_responses = {
            'technical': [
                "Nossa equipe técnica irá analisar sua solicitação e retornar com uma solução.",
                "Encaminhamos sua questão técnica para nossos especialistas.",
                "Nossa equipe de suporte técnico está verificando sua solicitação."
            ],
            'billing': [
                "Nossa equipe financeira irá verificar sua solicitação sobre faturamento.",
                "Encaminhamos sua questão financeira para o departamento responsável.",
                "Nossa equipe de contas irá analisar sua solicitação."
            ],
            'general': base_responses
        }
        
        return category_responses.get(category, base_responses)


class AutoCategorizer:
    """Classe para categorização automática de tickets"""
    
    def __init__(self):
        self.keywords = {
            'technical': [
                'erro', 'bug', 'falha', 'não funciona', 'problema técnico',
                'sistema', 'aplicação', 'software', 'hardware', 'configuração'
            ],
            'billing': [
                'fatura', 'cobrança', 'pagamento', 'valor', 'preço',
                'conta', 'financeiro', 'débito', 'cartão', 'boleto'
            ],
            'support': [
                'dúvida', 'como', 'ajuda', 'suporte', 'orientação',
                'tutorial', 'explicação', 'procedimento'
            ],
            'complaint': [
                'reclamação', 'insatisfeito', 'problema', 'ruim',
                'péssimo', 'não gostei', 'decepcionado'
            ]
        }
    
    def categorize_content(self, content):
        """
        Categoriza conteúdo baseado em palavras-chave
        
        Args:
            content (str): Conteúdo para categorizar
            
        Returns:
            str: Categoria sugerida
        """
        content_lower = content.lower()
        
        scores = {}
        for category, keywords in self.keywords.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return 'general'


# Instâncias globais
response_suggester = ResponseSuggester()
auto_categorizer = AutoCategorizer()


def get_response_suggestions(ticket_content, category=None, priority=None):
    """
    Função helper para obter sugestões de resposta
    
    Args:
        ticket_content (str): Conteúdo do ticket
        category (str): Categoria do ticket
        priority (str): Prioridade do ticket
        
    Returns:
        list: Lista de sugestões
    """
    return response_suggester.generate_response_suggestions(
        ticket_content, category, priority
    )


def auto_categorize_ticket(content):
    """
    Função helper para categorização automática
    
    Args:
        content (str): Conteúdo do ticket
        
    Returns:
        str: Categoria sugerida
    """
    return auto_categorizer.categorize_content(content)