# Support Ticket System 🎫

A full-stack AI-powered support ticket management system with intelligent ticket classification using LLM (Large Language Models).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [LLM Integration](#llm-integration)
- [Design Decisions](#design-decisions)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

---

## ✨ Features

### Core Functionality
- **Create Support Tickets** - Submit tickets with title, description, category, and priority
- **AI-Powered Classification** - Automatic category and priority suggestion using OpenAI GPT-3.5
- **Browse & Filter Tickets** - Search and filter by category, priority, status
- **Update Ticket Status** - Change status (open → in_progress → resolved → closed)
- **Real-time Statistics** - Dashboard with aggregated metrics computed at database level
- **Graceful Fallback** - System works even if LLM API is unavailable (keyword-based classification)

### Technical Highlights
- ✅ All constraints enforced at **database level**
- ✅ Database **aggregation** for statistics (no Python loops)
- ✅ Fully **containerized** with Docker Compose
- ✅ **One-command setup** - `docker-compose up --build`
- ✅ Auto-migration on startup
- ✅ CORS-enabled for frontend-backend communication

---

## 🛠 Tech Stack

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - RESTful API
- **PostgreSQL 15** - Relational database
- **OpenAI API** - LLM integration (GPT-3.5-turbo)

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling (no external UI library for simplicity)

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database service
- **Node.js 18** - Frontend runtime

---

## 🏗 Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│  - Ticket Form  │
│  - Ticket List  │
│  - Stats        │
└────────┬────────┘
         │ HTTP REST API
         ↓
┌─────────────────┐
│  Django Backend │ (Port 8000)
│  - REST API     │
│  - LLM Service  │───→ OpenAI API
│  - Models       │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│   PostgreSQL    │ (Port 5432)
│   Database      │
└─────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites
- Docker Desktop installed and running
- OpenAI API key (or any compatible LLM API key)

### Step 1: Clone/Extract the Project

```bash
cd Support_Ticket_System
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
LLM_API_KEY=sk-proj-your-actual-openai-api-key-here
```

**Note:** The system works without an API key using keyword-based fallback, but LLM classification requires a valid key.

### Step 3: Start the Application

```bash
docker-compose up --build
```

This single command will:
1. Build all Docker images
2. Start PostgreSQL database
3. Run Django migrations automatically
4. Start Django backend on port 8000
5. Start React frontend on port 3000

### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/tickets/
- **Django Admin:** http://localhost:8000/admin/

### Step 5: Test the System

1. Open http://localhost:3000 in your browser
2. Create a ticket by filling the form
3. Watch AI auto-classify the category and priority
4. View statistics on the dashboard
5. Click on tickets to update their status
6. Use filters to search tickets

### Stopping the Application

```bash
docker-compose down
```

To remove all data (including database):

```bash
docker-compose down -v
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. List Tickets (with filtering)
```http
GET /tickets/
```

**Query Parameters:**
- `category` - Filter by category (billing, technical, account, general)
- `priority` - Filter by priority (low, medium, high, critical)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `search` - Search in title and description

**Example:**
```bash
curl "http://localhost:8000/api/tickets/?status=open&priority=high"
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Cannot login to my account",
    "description": "Getting error 500 when trying to login",
    "category": "account",
    "priority": "high",
    "status": "open",
    "created_at": "2026-02-18T10:30:00Z",
    "updated_at": "2026-02-18T10:30:00Z"
  }
]
```

#### 2. Create Ticket
```http
POST /tickets/
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Cannot process payment",
  "description": "My credit card is being rejected repeatedly",
  "category": "billing",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Cannot process payment",
  "description": "My credit card is being rejected repeatedly",
  "category": "billing",
  "priority": "high",
  "status": "open",
  "created_at": "2026-02-18T11:00:00Z",
  "updated_at": "2026-02-18T11:00:00Z"
}
```

#### 3. Update Ticket (PATCH)
```http
PATCH /tickets/{id}/
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

#### 4. Get Statistics
```http
GET /tickets/stats/
```

**Response:**
```json
{
  "total_tickets": 42,
  "open_tickets": 15,
  "avg_tickets_per_day": 3.5,
  "priority_breakdown": {
    "low": 10,
    "medium": 20,
    "high": 8,
    "critical": 4
  },
  "category_breakdown": {
    "billing": 12,
    "technical": 18,
    "account": 7,
    "general": 5
  },
  "status_breakdown": {
    "open": 15,
    "in_progress": 10,
    "resolved": 12,
    "closed": 5
  }
}
```

#### 5. Classify Ticket (LLM)
```http
POST /tickets/classify/
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "I was charged twice for my subscription this month"
}
```

**Response:**
```json
{
  "suggested_category": "billing",
  "suggested_priority": "high"
}
```

---

## 🤖 LLM Integration

### Why OpenAI GPT-3.5-turbo?

**Chosen LLM:** OpenAI GPT-3.5-turbo

**Reasons:**
1. **Industry Standard** - Most widely used and reliable LLM API
2. **Low Latency** - Fast response times (typically < 1 second)
3. **Cost-Effective** - Cheaper than GPT-4 while maintaining good accuracy
4. **JSON Mode** - Can output structured JSON responses
5. **Well-Documented** - Extensive documentation and examples

### How It Works

1. **User types ticket description** in the form
2. **Frontend calls** `/api/tickets/classify/` endpoint
3. **Backend sends prompt** to GPT-3.5-turbo with:
   - Description of ticket categories
   - Description of priority levels
   - User's ticket description
4. **LLM analyzes** the content and returns JSON
5. **Backend validates** and normalizes the response
6. **Frontend pre-fills** category and priority dropdowns
7. **User can override** suggestions before submitting

### Fallback Strategy

If LLM API fails or is unavailable:
- ✅ System uses **keyword-based classification**
- ✅ Searches for common terms (e.g., "payment" → billing)
- ✅ No error shown to user - seamless experience
- ✅ Ticket creation always works

### Classification Prompt

```python
"""
Classify this support ticket into a category and priority level.

Description: "{user_description}"

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

Return ONLY a JSON object: {"category": "...", "priority": "..."}
"""
```

---

## 🎯 Design Decisions

### Backend Architecture

#### 1. Model Layer
- **Single `Ticket` model** with all constraints at DB level
- **Indexed fields** for performance (created_at, status, priority, category)
- **Choices validated** both in Django and PostgreSQL
- **Auto-generated timestamps** for audit trail

#### 2. Serializer Layer
- **Separate serializers** for different operations:
  - `TicketSerializer` - Full CRUD
  - `TicketUpdateSerializer` - Partial updates
  - `ClassificationRequestSerializer` - LLM input validation
  - `ClassificationResponseSerializer` - LLM output validation
- **Field-level validation** ensures data integrity

#### 3. View Layer
- **ViewSet pattern** for consistent REST API
- **Custom actions** for stats and classification
- **Query parameter filtering** using Django ORM
- **Database aggregation** for all statistics (no Python loops)

#### 4. LLM Service
- **Singleton pattern** for API client reuse
- **Error handling** with automatic fallback
- **Response normalization** handles LLM inconsistencies
- **Timeout protection** prevents hanging requests

### Frontend Architecture

#### 1. Component Structure
```
App.js (Main container)
├── StatsDashboard.js (Metrics display)
├── TicketForm.js (Create tickets)
└── TicketList.js (Browse/filter/update)
```

#### 2. State Management
- **Local state** with React hooks (no Redux needed)
- **Refresh trigger** pattern for cross-component updates
- **Optimistic UI** for better UX

#### 3. API Layer
- **Centralized API client** (`api.js`)
- **Axios interceptors** for error handling
- **Environment-based** backend URL

### Database Design

#### Indexes
- `created_at` (DESC) - Fast chronological sorting
- `status, priority` - Composite for dashboard queries
- `category` - Fast filtering

#### Aggregation Strategy
- Use Django ORM's `Count()` for grouping
- Calculate averages in database, not Python
- Minimize data transfer between DB and application

### Docker Strategy

#### Multi-Stage Benefits
- **Service isolation** - Each component in own container
- **Health checks** - PostgreSQL readiness before migrations
- **Volume mounts** - Hot reload during development
- **Environment variables** - Secure API key management

---

## 🗄 Database Schema

```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('billing', 'technical', 'account', 'general')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_status_priority ON tickets(status, priority);
CREATE INDEX idx_tickets_category ON tickets(category);
```

---

## 📸 Screenshots

### Creating a Ticket with AI Classification
![Ticket Form](docs/screenshot-form.png)

### Browsing and Filtering Tickets
![Ticket List](docs/screenshot-list.png)

### Statistics Dashboard
![Stats Dashboard](docs/screenshot-stats.png)

---

## 🧪 Testing the Application

### Manual Testing Checklist

- [ ] Create ticket without LLM API key (fallback works)
- [ ] Create ticket with LLM API key (AI classification works)
- [ ] Override AI suggestions
- [ ] Search tickets by keyword
- [ ] Filter by category
- [ ] Filter by priority
- [ ] Filter by status
- [ ] Update ticket status
- [ ] View statistics
- [ ] Create multiple tickets
- [ ] Verify database constraints

### API Testing with cURL

```bash
# Create a ticket
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket",
    "description": "This is a test",
    "category": "general",
    "priority": "medium"
  }'

# Get statistics
curl http://localhost:8000/api/tickets/stats/

# Classify description
curl -X POST http://localhost:8000/api/tickets/classify/ \
  -H "Content-Type: application/json" \
  -d '{"description": "I cannot login to my account"}'
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker containers not starting
```bash
# Check if ports are already in use
docker-compose down
# Kill any processes on ports 3000, 8000, 5432
# Try again
docker-compose up --build
```

#### 2. Database connection errors
```bash
# Ensure PostgreSQL is healthy
docker-compose ps
# Should show 'healthy' status for db service
```

#### 3. LLM classification not working
- Verify your API key in `.env`
- Check backend logs: `docker-compose logs backend`
- System will fallback to keyword-based classification

#### 4. Frontend can't reach backend
- Ensure both containers are running
- Check CORS settings in `settings.py`
- Verify proxy in `frontend/package.json`

---

## 📝 Notes

### Assumptions Made
- Single-user system (no authentication required per spec)
- Tickets cannot be deleted (only closed)
- All users have permission to update any ticket
- Statistics auto-refresh on new ticket creation

### Future Enhancements
- User authentication and authorization
- Ticket assignment to support agents
- Email notifications
- File attachments
- Ticket comments/threads
- SLA tracking
- Advanced analytics

---

## 👨‍💻 Development

### Project Structure

```
Support_Ticket_System/
├── backend/
│   ├── ticket_system/       # Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   ├── tickets/             # Django app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── llm_service.py
│   │   └── ...
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── TicketForm.js
│   │   ├── TicketList.js
│   │   ├── StatsDashboard.js
│   │   ├── api.js
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### Key Files

- `backend/tickets/models.py` - Data model with DB constraints
- `backend/tickets/views.py` - API endpoints
- `backend/tickets/llm_service.py` - AI classification logic
- `frontend/src/api.js` - Axios HTTP client
- `docker-compose.yml` - Multi-container orchestration

---

## 📄 License

This project is created for assessment purposes.

---

## 🙏 Acknowledgments

- OpenAI for GPT-3.5 API
- Django and Django REST Framework communities
- React team for excellent documentation

---

**Built with ❤️ for Clootrack Tech Intern Assessment**
