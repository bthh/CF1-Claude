# CF1 AI Analyzer Microservice 🤖

**Production-ready FastAPI service for AI-powered investment proposal analysis using Claude 3 Opus**

## 🎯 Overview

The CF1 AI Analyzer is a dedicated microservice that provides intelligent document analysis for investment proposals. It integrates with Anthropic's Claude 3 Opus to deliver comprehensive, structured analysis of business plans, financial projections, and other investment documents.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CF1 Frontend  │    │  CF1 Backend     │    │ CF1 AI Analyzer │
│   (React)       │    │  (Express.js)    │    │ (FastAPI)       │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          │ 1. Trigger Analysis  │                       │
          ├─────────────────────►│                       │
          │                      │ 2. Upload Document    │
          │                      ├──────────────────────►│
          │                      │                       │
          │                      │ 3. 202 Accepted       │
          │                      │◄──────────────────────┤
          │ 4. Processing Status │                       │
          │◄─────────────────────┤                       │
          │                      │ 5. Webhook Result     │
          │                      │◄──────────────────────┤
          │ 6. Analysis Complete │                       │
          │◄─────────────────────┤                       │
```

## 🚀 Features

### Core Analysis Capabilities
- **Document Processing**: PDF, TXT, DOCX support with fallback extraction
- **AI Analysis**: Claude 3 Opus integration for intelligent proposal evaluation
- **Structured Results**: Standardized analysis format with strength/risk assessment
- **Complexity Scoring**: 1-10 scale rating for proposal sophistication

### Production Features
- **Async Processing**: Non-blocking document analysis with webhook callbacks
- **Security**: HMAC signature verification for webhook authenticity
- **Error Handling**: Comprehensive error recovery and logging
- **Health Monitoring**: Built-in health checks and service status endpoints
- **Rate Limiting**: Configurable request throttling
- **Docker Support**: Complete containerization for easy deployment

## 📋 API Endpoints

### Core Analysis
```bash
POST /api/v1/analyze-proposal-async
# Initiate async document analysis
# Returns: 202 Accepted with processing status
```

### Monitoring
```bash
GET /health
# Service health check with Claude API status

GET /api/v1/stats
# Service statistics and configuration

GET /api/v1/status/{proposal_id}
# Analysis status for specific proposal
```

## 🔧 Installation & Setup

### 1. Local Development

```bash
# Clone and navigate
cd cf1-ai-analyzer

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run service
python main.py
# Service runs on http://localhost:8000
```

### 2. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t cf1-ai-analyzer .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e CF1_BACKEND_URL=http://host.docker.internal:3001 \
  cf1-ai-analyzer
```

### 3. Production Deployment

```bash
# Build production image
docker build -t cf1-ai-analyzer:prod .

# Deploy with proper environment variables
docker run -d \
  --name cf1-ai-analyzer \
  -p 8000:8000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e CF1_BACKEND_URL=$CF1_BACKEND_URL \
  -e WEBHOOK_SECRET=$WEBHOOK_SECRET \
  --restart unless-stopped \
  cf1-ai-analyzer:prod
```

## 🔑 Configuration

### Required Environment Variables

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CF1_BACKEND_URL=http://localhost:3001
WEBHOOK_SECRET=secure_webhook_secret
```

### Optional Configuration

```bash
MAX_FILE_SIZE_MB=50
LOG_LEVEL=INFO
CLAUDE_MODEL=claude-3-opus-20240229
CLAUDE_MAX_TOKENS=2000
CLAUDE_TEMPERATURE=0.1
```

## 📄 Document Analysis

### Supported Formats
- **PDF**: Primary format with PyMuPDF + pdfplumber fallback
- **TXT**: Plain text documents
- **DOCX**: Microsoft Word documents (basic support)

### Analysis Structure

```json
{
  "proposal_id": "unique_proposal_id",
  "status": "completed",
  "summary": "Concise 2-3 sentence summary",
  "potential_strengths": [
    "Market opportunity assessment",
    "Strong team credentials",
    "Solid business model"
  ],
  "areas_for_consideration": [
    "Regulatory compliance needs",
    "Market competition analysis",
    "Financial projections validation"
  ],
  "complexity_score": 7,
  "processing_time_seconds": 45.2,
  "document_hash": "abc123def456",
  "timestamp": "2025-01-20T22:30:00Z"
}
```

## 🔒 Security Features

### Webhook Security
- **HMAC Signatures**: SHA256 signatures for webhook verification
- **Secret Management**: Configurable webhook secrets
- **Request Validation**: Comprehensive input validation

### File Processing Security
- **Size Limits**: Configurable max file size (default 50MB)
- **Format Validation**: Restricted to supported file types
- **Temporary Storage**: Automatic cleanup of uploaded files

## 📊 Monitoring & Logging

### Health Checks
```bash
curl http://localhost:8000/health
```

### Service Statistics
```bash
curl http://localhost:8000/api/v1/stats
```

### Logging
- Structured logging with timestamps
- Error tracking and debugging information
- Claude API interaction logging
- Webhook delivery confirmation

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Analysis test (with file upload)
curl -X POST http://localhost:8000/api/v1/analyze-proposal-async \
  -F "proposal_id=test-001" \
  -F "webhook_url=http://localhost:3001/api/v1/ai-analysis/webhook" \
  -F "file=@sample_proposal.pdf"
```

### Integration Testing
The service integrates with the CF1 backend through webhook notifications:

1. **Frontend** triggers analysis via CF1 backend
2. **Backend** uploads document to AI Analyzer
3. **AI Analyzer** processes async and sends webhook
4. **Backend** receives results and updates database
5. **Frontend** displays analysis through polling

## 🚀 Deployment Options

### Local Development
- Direct Python execution with `python main.py`
- Hot reloading enabled for development

### Containerized Deployment
- Docker Compose for local testing
- Production Docker images
- Kubernetes manifests (can be generated)

### Cloud Deployment
- **AWS**: ECS/Fargate with Application Load Balancer
- **Google Cloud**: Cloud Run with autoscaling
- **Azure**: Container Instances with API Management

## 📈 Performance

### Optimizations
- **Async Processing**: Non-blocking document analysis
- **Background Tasks**: Separate processing pipeline
- **Efficient PDF Extraction**: Dual extraction strategy
- **Memory Management**: Automatic file cleanup

### Scaling Considerations
- **Horizontal Scaling**: Multiple container instances
- **Load Balancing**: Distribute requests across instances
- **Queue Systems**: Redis/RabbitMQ for high volume
- **Caching**: Result caching for duplicate documents

## 🔧 Development

### Project Structure
```
cf1-ai-analyzer/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container definition
├── docker-compose.yml     # Local development
├── .env.example           # Environment template
├── README.md              # This file
└── temp/                  # Temporary file storage
```

### Key Components
- **FastAPI App**: Main application with endpoints
- **Document Processing**: PDF/text extraction logic
- **Claude Integration**: AI analysis with prompt engineering
- **Webhook Client**: Secure result delivery
- **Background Tasks**: Async processing pipeline

## 🎯 Integration with CF1 Platform

### Backend Integration
The CF1 Express.js backend (`/cf1-frontend/backend/`) provides:
- **Analysis API**: Endpoints for triggering analysis
- **Database Storage**: SQLite storage for analysis results
- **Frontend Communication**: Real-time updates to React UI

### Frontend Integration
The React frontend displays analysis through:
- **AIAnalysisTab Component**: Complete analysis UI
- **Real-time Polling**: Status updates during processing
- **Interactive Results**: Complexity visualization and insights

## 📞 Support & Troubleshooting

### Common Issues

**Claude API Errors**:
- Verify `ANTHROPIC_API_KEY` is valid
- Check API rate limits and quotas
- Monitor Claude API status

**Webhook Delivery Failures**:
- Verify CF1 backend URL accessibility
- Check webhook secret configuration
- Monitor network connectivity

**File Processing Errors**:
- Validate file format support
- Check file size limits
- Verify PDF text extraction

### Debugging
```bash
# View logs
docker logs cf1-ai-analyzer

# Health check details
curl http://localhost:8000/health

# Service statistics
curl http://localhost:8000/api/v1/stats
```

---

## 🏆 Production Readiness

This microservice is **production-ready** with:

✅ **Complete FastAPI Implementation**  
✅ **Claude 3 Opus Integration**  
✅ **Async Processing Pipeline**  
✅ **Docker Containerization**  
✅ **Security & Validation**  
✅ **Health Monitoring**  
✅ **Error Handling**  
✅ **Comprehensive Logging**  

**Ready for immediate deployment and integration with the CF1 platform!** 🚀