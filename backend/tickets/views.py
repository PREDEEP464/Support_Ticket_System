from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from .models import Ticket
from .serializers import (
    TicketSerializer,
    TicketUpdateSerializer,
    ClassificationRequestSerializer,
    ClassificationResponseSerializer,
    TicketStatsSerializer
)
from .llm_service import llm_service
from .email_service import email_service


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket CRUD operations with filtering and search.
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def get_serializer_class(self):
        """Use different serializer for partial updates"""
        if self.action == 'partial_update':
            return TicketUpdateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters.
        Supports: category, priority, status, search
        """
        queryset = Ticket.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by status
        ticket_status = self.request.query_params.get('status', None)
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)
        
        # Search in title and description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new ticket"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Send email notification (graceful fallback if not configured)
        ticket = serializer.instance
        email_service.send_ticket_created_notification(ticket)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def partial_update(self, request, *args, **kwargs):
        """Update ticket (PATCH) - typically for status changes"""
        instance = self.get_object()
        old_status = instance.status
        
        kwargs['partial'] = True
        response = self.update(request, *args, **kwargs)
        
        # Send email if status changed
        instance.refresh_from_db()
        if instance.status != old_status:
            email_service.send_ticket_status_update_notification(instance, old_status)
        
        return response
    
    @action(detail=False, methods=['get'], url_path='stats')
    def statistics(self, request):
        """
        Get aggregated ticket statistics using database aggregation.
        
        Returns:
        - total_tickets: Total number of tickets
        - open_tickets: Number of open tickets
        - avg_tickets_per_day: Average tickets created per day
        - priority_breakdown: Count by priority
        - category_breakdown: Count by category
        - status_breakdown: Count by status
        """
        
        # Total tickets
        total_tickets = Ticket.objects.count()
        
        # Open tickets
        open_tickets = Ticket.objects.filter(status='open').count()
        
        # Calculate average tickets per day using database aggregation
        earliest_ticket = Ticket.objects.order_by('created_at').first()
        
        if earliest_ticket:
            days_since_first = (timezone.now() - earliest_ticket.created_at).days + 1
            avg_tickets_per_day = round(total_tickets / days_since_first, 2)
        else:
            avg_tickets_per_day = 0.0
        
        # Priority breakdown using database aggregation
        priority_breakdown = dict(
            Ticket.objects.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )
        
        # Category breakdown using database aggregation
        category_breakdown = dict(
            Ticket.objects.values('category')
            .annotate(count=Count('id'))
            .values_list('category', 'count')
        )
        
        # Status breakdown using database aggregation
        status_breakdown = dict(
            Ticket.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )
        
        stats_data = {
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
            'status_breakdown': status_breakdown,
        }
        
        serializer = TicketStatsSerializer(data=stats_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='classify')
    def classify(self, request):
        """
        LLM-based ticket classification endpoint.
        
        Accepts: { "description": "ticket description" }
        Returns: { "suggested_category": "...", "suggested_priority": "..." }
        """
        
        # Validate request
        request_serializer = ClassificationRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        
        description = request_serializer.validated_data['description']
        
        # Call LLM service
        try:
            classification_result = llm_service.classify_ticket(description)
            
            # Validate response
            response_serializer = ClassificationResponseSerializer(data=classification_result)
            response_serializer.is_valid(raise_exception=True)
            
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Graceful fallback
            return Response(
                {
                    'suggested_category': 'general',
                    'suggested_priority': 'medium',
                    'error': 'Classification service temporarily unavailable'
                },
                status=status.HTTP_200_OK
            )
