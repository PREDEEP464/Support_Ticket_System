import os
import json
from openai import OpenAI
from django.conf import settings


class LLMService:
    """
    Service class for LLM integration with graceful fallback.
    Uses OpenAI API for ticket classification.
    """
    
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.client = None
        if self.api_key and self.api_key != 'your_openai_api_key_here':
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception:
                self.client = None
    
    def classify_ticket(self, description: str) -> dict:
        """
        Classify ticket description and return suggested category and priority.
        
        Args:
            description: Ticket description text
            
        Returns:
            dict with suggested_category and suggested_priority
        """
        
        # Graceful fallback if LLM is not available
        if not self.client:
            return self._fallback_classification(description)
        
        try:
            prompt = self._build_classification_prompt(description)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a support ticket classifier. Analyze the description and return only a JSON object with 'category' and 'priority' fields."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=100
            )
            
            # Parse LLM response
            result_text = response.choices[0].message.content.strip()
            
            # Try to extract JSON from response
            try:
                # Remove markdown code blocks if present
                if '```json' in result_text:
                    result_text = result_text.split('```json')[1].split('```')[0].strip()
                elif '```' in result_text:
                    result_text = result_text.split('```')[1].split('```')[0].strip()
                
                result = json.loads(result_text)
                
                # Validate and normalize the response
                category = self._normalize_category(result.get('category', 'general'))
                priority = self._normalize_priority(result.get('priority', 'medium'))
                
                return {
                    'suggested_category': category,
                    'suggested_priority': priority
                }
                
            except json.JSONDecodeError:
                # If JSON parsing fails, use fallback
                return self._fallback_classification(description)
        
        except Exception as e:
            print(f"LLM classification error: {str(e)}")
            return self._fallback_classification(description)
    
    def _build_classification_prompt(self, description: str) -> str:
        """Build the classification prompt for LLM"""
        return f"""Classify this support ticket into a category and priority level.

Description: "{description}"

Categories:
- billing: Payment, invoices, refunds, pricing issues
- technical: Bugs, errors, system issues, integration problems
- account: Login, registration, profile, permissions
- general: Questions, feedback, feature requests

Priority levels:
- low: Minor issues, general questions
- medium: Normal issues affecting single user
- high: Significant issues affecting multiple users
- critical: System down, data loss, security issues

Return ONLY a JSON object in this exact format:
{{"category": "one_of_the_categories", "priority": "one_of_the_priorities"}}"""
    
    def _normalize_category(self, category: str) -> str:
        """Normalize category to valid choices"""
        valid_categories = ['billing', 'technical', 'account', 'general']
        category_lower = category.lower().strip()
        
        if category_lower in valid_categories:
            return category_lower
        
        # Fuzzy matching
        if 'bill' in category_lower or 'pay' in category_lower or 'invoice' in category_lower:
            return 'billing'
        elif 'tech' in category_lower or 'bug' in category_lower or 'error' in category_lower:
            return 'technical'
        elif 'account' in category_lower or 'login' in category_lower or 'user' in category_lower:
            return 'account'
        else:
            return 'general'
    
    def _normalize_priority(self, priority: str) -> str:
        """Normalize priority to valid choices"""
        valid_priorities = ['low', 'medium', 'high', 'critical']
        priority_lower = priority.lower().strip()
        
        if priority_lower in valid_priorities:
            return priority_lower
        
        # Fuzzy matching
        if 'crit' in priority_lower or 'urgent' in priority_lower or 'emergency' in priority_lower:
            return 'critical'
        elif 'high' in priority_lower or 'important' in priority_lower:
            return 'high'
        elif 'low' in priority_lower or 'minor' in priority_lower:
            return 'low'
        else:
            return 'medium'
    
    def _fallback_classification(self, description: str) -> dict:
        """
        Fallback classification using simple keyword matching.
        Used when LLM API is unavailable.
        """
        description_lower = description.lower()
        
        # Determine category
        if any(word in description_lower for word in ['payment', 'bill', 'invoice', 'refund', 'charge', 'price', 'cost']):
            category = 'billing'
        elif any(word in description_lower for word in ['bug', 'error', 'crash', 'not working', 'broken', 'issue', 'problem']):
            category = 'technical'
        elif any(word in description_lower for word in ['login', 'password', 'account', 'register', 'access', 'permission']):
            category = 'account'
        else:
            category = 'general'
        
        # Determine priority
        if any(word in description_lower for word in ['urgent', 'critical', 'emergency', 'down', 'cannot access', 'security']):
            priority = 'critical'
        elif any(word in description_lower for word in ['important', 'asap', 'serious', 'major']):
            priority = 'high'
        elif any(word in description_lower for word in ['minor', 'small', 'question', 'info']):
            priority = 'low'
        else:
            priority = 'medium'
        
        return {
            'suggested_category': category,
            'suggested_priority': priority
        }


# Singleton instance
llm_service = LLMService()
