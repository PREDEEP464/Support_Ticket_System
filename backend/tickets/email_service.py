from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service class for sending email notifications with graceful fallback.
    If email is not configured, operations fail silently.
    """
    
    def __init__(self):
        self.is_configured = bool(
            settings.EMAIL_HOST_USER and 
            settings.EMAIL_HOST_PASSWORD
        )
    
    def send_ticket_created_notification(self, ticket):
        """
        Send email notification when a new ticket is created.
        
        Args:
            ticket: Ticket model instance
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        
        if not self.is_configured:
            logger.info("Email not configured. Skipping notification.")
            return False
        
        try:
            subject = f"New Support Ticket Created: #{ticket.id} - {ticket.title}"
            
            # Plain text message
            message = self._build_plain_text_message(ticket)
            
            # HTML message
            html_message = self._build_html_message(ticket)
            
            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                html_message=html_message,
                fail_silently=True,  # Don't break app if email fails
            )
            
            logger.info(f"Email sent for ticket #{ticket.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email for ticket #{ticket.id}: {str(e)}")
            return False
    
    def send_ticket_status_update_notification(self, ticket, old_status):
        """
        Send email notification when ticket status changes.
        
        Args:
            ticket: Ticket model instance
            old_status: Previous status value
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        
        if not self.is_configured:
            return False
        
        try:
            subject = f"Ticket Status Updated: #{ticket.id} - {ticket.title}"
            
            message = f"""
Ticket Status Update

Ticket ID: #{ticket.id}
Title: {ticket.title}

Status Changed: {old_status.upper()} → {ticket.status.upper()}

Category: {ticket.get_category_display()}
Priority: {ticket.get_priority_display()}

View ticket details in the support system.

---
This is an automated notification.
            """
            
            send_mail(
                subject=subject,
                message=message.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True,
            )
            
            logger.info(f"Status update email sent for ticket #{ticket.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send status update email: {str(e)}")
            return False
    
    def _build_plain_text_message(self, ticket):
        """Build plain text email message"""
        return f"""
New Support Ticket Created

Ticket ID: #{ticket.id}
Title: {ticket.title}

Description:
{ticket.description}

Details:
- Category: {ticket.get_category_display()}
- Priority: {ticket.get_priority_display()}
- Status: {ticket.get_status_display()}
- Created: {ticket.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Please review and respond to this ticket in the support system.

---
This is an automated notification from the Support Ticket System.
        """
    
    def _build_html_message(self, ticket):
        """Build HTML email message"""
        
        # Priority colors
        priority_colors = {
            'low': '#4caf50',
            'medium': '#ff9800',
            'high': '#ff5722',
            'critical': '#d32f2f',
        }
        
        priority_color = priority_colors.get(ticket.priority, '#666666')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .ticket-info {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid {priority_color}; }}
                .badge {{ display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }}
                .priority-{ticket.priority} {{ background: {priority_color}; color: white; }}
                .footer {{ text-align: center; padding: 15px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">🎫 New Support Ticket</h2>
                </div>
                <div class="content">
                    <div class="ticket-info">
                        <h3 style="margin-top: 0;">Ticket #{ticket.id}: {ticket.title}</h3>
                        
                        <p><strong>Description:</strong></p>
                        <p>{ticket.description}</p>
                        
                        <p>
                            <span class="badge priority-{ticket.priority}">{ticket.get_priority_display()} Priority</span>
                            <span class="badge" style="background: #2196f3; color: white;">{ticket.get_category_display()}</span>
                            <span class="badge" style="background: #4caf50; color: white;">{ticket.get_status_display()}</span>
                        </p>
                        
                        <p style="color: #666; font-size: 14px;">
                            Created: {ticket.created_at.strftime('%B %d, %Y at %H:%M')}
                        </p>
                    </div>
                    
                    <p>Please review and respond to this ticket in the support system.</p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from the Support Ticket System.</p>
                    <p>© 2026 Support Ticket System</p>
                </div>
            </div>
        </body>
        </html>
        """


# Singleton instance
email_service = EmailService()
