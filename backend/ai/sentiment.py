"""
Módulo de análise de sentimento para tickets e e-mails
"""

from transformers import pipeline
import logging
from django.conf import settings
import os

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Classe para análise de sentimento usando Transformers"""
    
    def __init__(self):
        self.classifier = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Inicializa o modelo de análise de sentimento"""
        try:
            # Usar cache personalizado se configurado
            cache_dir = getattr(settings, 'TRANSFORMERS_CACHE', None)
            if cache_dir:
                os.makedirs(cache_dir, exist_ok=True)
                os.environ['TRANSFORMERS_CACHE'] = str(cache_dir)
            
            # Inicializar pipeline de classificação de sentimento
            self.classifier = pipeline(
                'sentiment-analysis',
                model='nlptown/bert-base-multilingual-uncased-sentiment',
                return_all_scores=True
            )
            logger.info("Modelo de análise de sentimento inicializado com sucesso")
            
        except Exception as e:
            logger.error(f"Erro ao inicializar modelo de sentimento: {e}")
            self.classifier = None
    
    def analyze_text(self, text):
        """
        Analisa o sentimento de um texto
        
        Args:
            text (str): Texto para análise
            
        Returns:
            dict: Resultado da análise com score e label
        """
        if not self.classifier:
            logger.warning("Modelo de sentimento não disponível")
            return {
                'score': 0.5,
                'label': 'neutral',
                'confidence': 0.0,
                'error': 'Modelo não inicializado'
            }
        
        try:
            # Limitar tamanho do texto
            max_length = 512
            if len(text) > max_length:
                text = text[:max_length]
            
            # Executar análise
            results = self.classifier(text)
            
            # Processar resultados
            if results and len(results) > 0:
                # Pegar o resultado com maior confiança
                best_result = max(results[0], key=lambda x: x['score'])
                
                # Mapear labels para português e simplificar
                label_mapping = {
                    'POSITIVE': 'positive',
                    'NEGATIVE': 'negative',
                    'NEUTRAL': 'neutral',
                    '1 star': 'very_negative',
                    '2 stars': 'negative',
                    '3 stars': 'neutral',
                    '4 stars': 'positive',
                    '5 stars': 'very_positive',
                }
                
                mapped_label = label_mapping.get(best_result['label'], 'neutral')
                
                # Converter para escala -1 a 1
                score = self._convert_to_score(mapped_label, best_result['score'])
                
                return {
                    'score': score,
                    'label': mapped_label,
                    'confidence': best_result['score'],
                    'raw_results': results[0]
                }
            
        except Exception as e:
            logger.error(f"Erro na análise de sentimento: {e}")
            
        return {
            'score': 0.0,
            'label': 'neutral',
            'confidence': 0.0,
            'error': 'Erro na análise'
        }
    
    def _convert_to_score(self, label, confidence):
        """Converte label para score numérico"""
        score_mapping = {
            'very_negative': -1.0,
            'negative': -0.5,
            'neutral': 0.0,
            'positive': 0.5,
            'very_positive': 1.0,
        }
        
        base_score = score_mapping.get(label, 0.0)
        return base_score * confidence
    
    def get_priority_suggestion(self, sentiment_score, sentiment_label):
        """
        Sugere prioridade baseada no sentimento
        
        Args:
            sentiment_score (float): Score do sentimento (-1 a 1)
            sentiment_label (str): Label do sentimento
            
        Returns:
            str: Prioridade sugerida
        """
        if sentiment_label in ['very_negative', 'negative'] and sentiment_score < -0.7:
            return 'urgent'
        elif sentiment_label == 'negative' and sentiment_score < -0.3:
            return 'high'
        elif sentiment_label == 'positive':
            return 'low'
        else:
            return 'medium'


# Instância global do analisador
sentiment_analyzer = SentimentAnalyzer()


def analyze_email_sentiment(email_content):
    """
    Função helper para análise de sentimento de e-mails
    
    Args:
        email_content (str): Conteúdo do e-mail
        
    Returns:
        dict: Resultado da análise
    """
    return sentiment_analyzer.analyze_text(email_content)


def suggest_ticket_priority(email_content):
    """
    Função helper para sugestão de prioridade baseada no sentimento
    
    Args:
        email_content (str): Conteúdo do e-mail
        
    Returns:
        str: Prioridade sugerida
    """
    analysis = sentiment_analyzer.analyze_text(email_content)
    return sentiment_analyzer.get_priority_suggestion(
        analysis['score'], 
        analysis['label']
    )