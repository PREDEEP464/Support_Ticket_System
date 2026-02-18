from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model with full validation.
    """
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'category',
            'priority',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_title(self, value):
        """Ensure title is not empty and within max length"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters")
        return value.strip()
    
    def validate_description(self, value):
        """Ensure description is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty")
        return value.strip()


class TicketUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for partial ticket updates (PATCH requests).
    """
    
    class Meta:
        model = Ticket
        fields = ['status', 'category', 'priority', 'title', 'description']
        
    def validate_title(self, value):
        if value and len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters")
        return value


class ClassificationRequestSerializer(serializers.Serializer):
    """
    Serializer for LLM classification request.
    """
    description = serializers.CharField(required=True, allow_blank=False)
    
    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty")
        return value.strip()


class ClassificationResponseSerializer(serializers.Serializer):
    """
    Serializer for LLM classification response.
    """
    suggested_category = serializers.ChoiceField(
        choices=['billing', 'technical', 'account', 'general']
    )
    suggested_priority = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'critical']
    )
    confidence = serializers.FloatField(required=False)


class TicketStatsSerializer(serializers.Serializer):
    """
    Serializer for ticket statistics.
    """
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    avg_tickets_per_day = serializers.FloatField()
    priority_breakdown = serializers.DictField()
    category_breakdown = serializers.DictField()
    status_breakdown = serializers.DictField()
