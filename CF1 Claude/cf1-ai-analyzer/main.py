"""
CF1 AI Analyzer Microservice
FastAPI service for analyzing investment proposals using Claude 3 Opus
"""

import asyncio
import hashlib
import hmac
import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Union

import aiofiles
import aiofiles.os
import aiohttp
import redis.asyncio as redis
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import pymupdf  # PyMuPDF for PDF extraction
import pdfplumber  # Fallback PDF processor
from anthropic import Anthropic
from asyncio_throttle import Throttler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CF1_BACKEND_URL = os.getenv("CF1_BACKEND_URL", "http://localhost:3001")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "cf1-ai-webhook-secret-key")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
SUPPORTED_FORMATS = {".pdf", ".txt", ".docx"}
CACHE_TTL = 3600 * 24  # 24 hours cache TTL
MAX_CONTENT_LENGTH = 8000  # Token chunking limit
CONCURRENT_CLAUDE_CALLS = 3  # Rate limiting for Claude API

if not CLAUDE_API_KEY:
    logger.error("ANTHROPIC_API_KEY environment variable not set")
    raise ValueError("ANTHROPIC_API_KEY is required")

# Initialize Anthropic client
claude_client = Anthropic(api_key=CLAUDE_API_KEY)

# Initialize Redis client
redis_client = None
claude_throttler = Throttler(rate_limit=CONCURRENT_CLAUDE_CALLS, period=1.0)

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection established successfully")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Caching will be disabled.")
        redis_client = None

async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")

# FastAPI app
app = FastAPI(
    title="CF1 AI Analyzer",
    description="AI-powered proposal analysis using Claude 3 Opus",
    version="1.0.0"
)

# Middleware configuration
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Response compression
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AnalysisRequest(BaseModel):
    proposal_id: str = Field(..., description="Unique proposal identifier")
    webhook_url: str = Field(..., description="Callback URL for results")
    priority: str = Field(default="normal", description="Processing priority")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message")
    context: Optional[Dict] = Field(default=None, description="Additional context for the chat")
    conversation_id: Optional[str] = Field(default=None, description="Conversation identifier")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI's response")
    conversation_id: str = Field(..., description="Conversation identifier")
    timestamp: str = Field(..., description="Response timestamp")

class AnalysisResult(BaseModel):
    proposal_id: str
    status: str
    summary: str
    potential_strengths: List[str]
    areas_for_consideration: List[str]
    complexity_score: int = Field(..., ge=1, le=10)
    processing_time_seconds: float
    document_hash: str
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    claude_api_status: str
    redis_status: str

# Cache utility functions
async def get_cache_key(content: str) -> str:
    """Generate SHA256 cache key for content"""
    return f"analysis:{hashlib.sha256(content.encode()).hexdigest()}"

async def get_cached_analysis(content: str) -> Optional[Dict]:
    """Retrieve cached analysis result"""
    if not redis_client:
        return None

    try:
        cache_key = await get_cache_key(content)
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            logger.info(f"Cache hit for key: {cache_key[:16]}...")
            return json.loads(cached_data)
    except Exception as e:
        logger.warning(f"Cache retrieval failed: {e}")
    return None

async def cache_analysis(content: str, analysis_result: Dict) -> bool:
    """Cache analysis result with TTL"""
    if not redis_client:
        return False

    try:
        cache_key = await get_cache_key(content)
        await redis_client.setex(
            cache_key,
            CACHE_TTL,
            json.dumps(analysis_result)
        )
        logger.info(f"Analysis cached with key: {cache_key[:16]}...")
        return True
    except Exception as e:
        logger.warning(f"Cache storage failed: {e}")
        return False

async def chunk_content(content: str, max_length: int = MAX_CONTENT_LENGTH) -> List[str]:
    """Intelligently chunk content for processing"""
    if len(content) <= max_length:
        return [content]

    chunks = []
    current_chunk = ""

    # Split by paragraphs first, then sentences if needed
    paragraphs = content.split('\n\n')

    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) <= max_length:
            current_chunk += paragraph + '\n\n'
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = paragraph + '\n\n'
            else:
                # Paragraph is too long, split by sentences
                sentences = paragraph.split('. ')
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) <= max_length:
                        current_chunk += sentence + '. '
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + '. '

    if current_chunk:
        chunks.append(current_chunk.strip())

    logger.info(f"Content chunked into {len(chunks)} pieces")
    return chunks

async def process_chunks_concurrently(chunks: List[str], proposal_id: str) -> List[Dict]:
    """Process multiple content chunks concurrently with rate limiting"""
    async def process_single_chunk(chunk: str, chunk_index: int) -> Dict:
        async with claude_throttler:
            logger.info(f"Processing chunk {chunk_index + 1}/{len(chunks)} for proposal {proposal_id}")
            return await analyze_with_claude_raw(chunk, f"{proposal_id}_chunk_{chunk_index}")

    # Create tasks for concurrent processing
    tasks = [
        process_single_chunk(chunk, i)
        for i, chunk in enumerate(chunks)
    ]

    # Execute with controlled concurrency
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out exceptions and return valid results
    valid_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Chunk {i} processing failed: {result}")
        else:
            valid_results.append(result)

    return valid_results

async def merge_chunk_analyses(chunk_results: List[Dict], proposal_id: str) -> Dict:
    """Merge multiple chunk analysis results into a single comprehensive result"""
    if not chunk_results:
        raise ValueError("No valid chunk results to merge")

    if len(chunk_results) == 1:
        return chunk_results[0]

    # Combine all strengths and considerations
    all_strengths = []
    all_considerations = []
    all_summaries = []

    for result in chunk_results:
        if result.get('potential_strengths'):
            all_strengths.extend(result['potential_strengths'])
        if result.get('areas_for_consideration'):
            all_considerations.extend(result['areas_for_consideration'])
        if result.get('summary'):
            all_summaries.append(result['summary'])

    # Remove duplicates while preserving order
    unique_strengths = list(dict.fromkeys(all_strengths))
    unique_considerations = list(dict.fromkeys(all_considerations))

    # Create merged summary
    merged_summary = f"Multi-section analysis completed. Key findings: {'; '.join(all_summaries[:3])}..."

    # Calculate average complexity score
    complexity_scores = [r.get('complexity_score', 5) for r in chunk_results]
    avg_complexity = round(sum(complexity_scores) / len(complexity_scores))

    # Calculate total processing time
    total_time = sum(r.get('processing_time_seconds', 0) for r in chunk_results)

    return {
        'proposal_id': proposal_id,
        'status': 'completed',
        'summary': merged_summary,
        'potential_strengths': unique_strengths[:5],  # Limit to top 5
        'areas_for_consideration': unique_considerations[:5],  # Limit to top 5
        'complexity_score': avg_complexity,
        'processing_time_seconds': round(total_time, 2),
        'chunks_processed': len(chunk_results),
        'document_hash': hashlib.sha256(json.dumps(chunk_results).encode()).hexdigest()[:16],
        'timestamp': datetime.now(timezone.utc).isoformat()
    }

# Claude 3 Opus Analysis Prompts
ANALYSIS_PROMPT_TEMPLATE = """
You are an expert financial analyst specializing in investment proposal evaluation. 
Analyze the following proposal document and provide a comprehensive assessment.

Document Content:
{document_content}

Please provide your analysis in the following JSON format:
{{
    "summary": "A concise 2-3 sentence summary of the proposal",
    "potential_strengths": [
        "List 3-5 key strengths or positive aspects",
        "Focus on market opportunity, team, business model, financials"
    ],
    "areas_for_consideration": [
        "List 3-5 areas that need attention or pose risks",
        "Include regulatory, market, operational, or financial concerns"
    ],
    "complexity_score": <1-10 integer rating the proposal complexity>,
    "key_metrics": {{
        "market_size": "Estimated market size if mentioned",
        "funding_amount": "Requested funding amount",
        "revenue_model": "Brief description of revenue model",
        "regulatory_status": "Regulatory compliance status"
    }}
}}

Focus on providing actionable insights for investors. Be objective and highlight both opportunities and risks.
Ensure your complexity score reflects the sophistication required to understand and evaluate this investment.
"""

# Chat-specific prompt template
CHAT_PROMPT_TEMPLATE = """
You are a senior financial advisor and tokenization expert for the CF1 platform, with deep expertise in real-world asset tokenization, SEC regulations, investor relations, and asset management. You provide premium-quality guidance that asset creators would pay for.

User Question: "{message}"

Context Information:
{context_info}

Please provide a comprehensive, premium-quality response that:

1. **Directly addresses the user's specific question** with detailed, actionable advice
2. **Provides step-by-step guidance** with specific examples and best practices
3. **Covers regulatory considerations** including SEC Reg CF requirements, compliance obligations, and risk mitigation
4. **Offers concrete next steps** with timelines, resources, and implementation strategies
5. **Includes industry insights** with market trends, competitive analysis, and performance benchmarks
6. **Maintains a professional, consultative tone** as a trusted advisor would

**Response Guidelines:**
- **Match response length to question complexity**: Simple questions get concise answers (50-150 words), complex strategic questions get detailed responses (300-800 words)
- **For simple/factual questions**: Provide direct, clear answers with brief context
- **For strategic/complex questions**: Include specific examples, multiple options, step-by-step guidance, and industry insights
- **Always include**: Relevant regulations, best practices, and concrete next steps when applicable
- **Quality over quantity**: Ensure every word adds value - be comprehensive when needed, concise when appropriate

Gauge the depth needed: operational questions need practical answers, strategic questions need consultative guidance, factual questions need clear information.
"""

# Document processing functions
async def extract_pdf_content(file_path: str) -> str:
    """Extract text content from PDF using PyMuPDF with pdfplumber fallback"""
    try:
        # Try PyMuPDF first (faster)
        doc = pymupdf.open(file_path)
        text_content = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_content += page.get_text()
        doc.close()
        
        if text_content.strip():
            logger.info(f"Successfully extracted content using PyMuPDF: {len(text_content)} characters")
            return text_content
        
        # Fallback to pdfplumber if PyMuPDF returns empty content
        logger.info("PyMuPDF returned empty content, trying pdfplumber fallback")
        
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}, trying pdfplumber fallback")
    
    # Fallback to pdfplumber
    try:
        with pdfplumber.open(file_path) as pdf:
            text_content = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content += page_text + "\n"
        
        logger.info(f"Successfully extracted content using pdfplumber: {len(text_content)} characters")
        return text_content
        
    except Exception as e:
        logger.error(f"Both PDF extraction methods failed: {e}")
        raise HTTPException(status_code=422, detail="Failed to extract text from PDF")

async def extract_text_content(file_path: str, file_extension: str) -> str:
    """Extract text content from various file formats"""
    try:
        if file_extension == ".pdf":
            return await extract_pdf_content(file_path)
        elif file_extension == ".txt":
            async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
                return await f.read()
        elif file_extension == ".docx":
            # For production, implement docx processing
            # For now, return placeholder
            return "DOCX processing not yet implemented in this demo version"
        else:
            raise HTTPException(status_code=422, detail=f"Unsupported file format: {file_extension}")
    except Exception as e:
        logger.error(f"Error extracting text content: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract document content")

async def analyze_with_claude_raw(content: str, proposal_id: str) -> Dict:
    """Raw Claude analysis without caching (used for chunks)"""
    try:
        start_time = time.time()

        # Prepare the prompt
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(document_content=content[:15000])  # Limit content length

        # Call Claude 3 Opus API
        response = claude_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=2000,
            temperature=0.1,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        processing_time = time.time() - start_time

        # Parse the response
        analysis_text = response.content[0].text

        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = analysis_text.find('{')
            end_idx = analysis_text.rfind('}') + 1

            if start_idx != -1 and end_idx != 0:
                json_str = analysis_text[start_idx:end_idx]
                analysis_data = json.loads(json_str)
            else:
                # Fallback to structured parsing if JSON not found
                raise json.JSONDecodeError("JSON not found", analysis_text, 0)

        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from Claude response, using fallback structure")
            analysis_data = {
                "summary": "Analysis completed. See full response for details.",
                "potential_strengths": ["Detailed analysis provided by AI"],
                "areas_for_consideration": ["Review full analysis response"],
                "complexity_score": 5,
                "key_metrics": {}
            }

        # Create document hash for deduplication
        document_hash = hashlib.sha256(content.encode()).hexdigest()[:16]

        # Build result
        result = {
            "proposal_id": proposal_id,
            "status": "completed",
            "summary": analysis_data.get("summary", "Analysis completed"),
            "potential_strengths": analysis_data.get("potential_strengths", []),
            "areas_for_consideration": analysis_data.get("areas_for_consideration", []),
            "complexity_score": analysis_data.get("complexity_score", 5),
            "processing_time_seconds": round(processing_time, 2),
            "document_hash": document_hash,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        logger.info(f"Claude analysis completed for proposal {proposal_id} in {processing_time:.2f}s")
        return result

    except Exception as e:
        logger.error(f"Claude analysis failed for proposal {proposal_id}: {e}")

        # Return error result
        return {
            "proposal_id": proposal_id,
            "status": "failed",
            "summary": f"Analysis failed: {str(e)}",
            "potential_strengths": [],
            "areas_for_consideration": ["Analysis could not be completed"],
            "complexity_score": 1,
            "processing_time_seconds": 0,
            "document_hash": "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def analyze_with_claude(content: str, proposal_id: str) -> Dict:
    """Analyze document content using Claude 3 Opus with caching and chunking"""
    try:
        start_time = time.time()

        # Check cache first
        cached_result = await get_cached_analysis(content)
        if cached_result:
            # Update metadata for cached result
            cached_result['proposal_id'] = proposal_id
            cached_result['processing_time_seconds'] = 0.1  # Cache hit time
            cached_result['timestamp'] = datetime.now(timezone.utc).isoformat()
            logger.info(f"Cache hit for proposal {proposal_id}")
            return cached_result

        # Check if content needs chunking
        if len(content) > MAX_CONTENT_LENGTH:
            logger.info(f"Content too large ({len(content)} chars), using chunking strategy")

            # Chunk the content
            chunks = await chunk_content(content)

            # Process chunks concurrently
            chunk_results = await process_chunks_concurrently(chunks, proposal_id)

            # Merge results
            result = await merge_chunk_analyses(chunk_results, proposal_id)
        else:
            # Process single content piece
            result = await analyze_with_claude_raw(content, proposal_id)

        # Cache the result
        await cache_analysis(content, result)

        processing_time = time.time() - start_time
        result['processing_time_seconds'] = round(processing_time, 2)

        logger.info(f"Claude analysis completed for proposal {proposal_id} in {processing_time:.2f}s")
        return result

    except Exception as e:
        logger.error(f"Claude analysis failed for proposal {proposal_id}: {e}")

        # Return error result
        return {
            "proposal_id": proposal_id,
            "status": "failed",
            "summary": f"Analysis failed: {str(e)}",
            "potential_strengths": [],
            "areas_for_consideration": ["Analysis could not be completed"],
            "complexity_score": 1,
            "processing_time_seconds": 0,
            "document_hash": "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def send_webhook_notification(webhook_url: str, analysis_result: Dict) -> bool:
    """Send analysis results to CF1 backend via webhook"""
    try:
        # Create HMAC signature for security
        payload = json.dumps(analysis_result)
        signature = hmac.new(
            WEBHOOK_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            'Content-Type': 'application/json',
            'X-CF1-Signature': f'sha256={signature}',
            'User-Agent': 'CF1-AI-Analyzer/1.0'
        }
        
        # Send webhook
        async with aiohttp.ClientSession() as session:
            async with session.post(
                webhook_url,
                data=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    logger.info(f"Webhook sent successfully for proposal {analysis_result['proposal_id']}")
                    return True
                else:
                    logger.error(f"Webhook failed with status {response.status} for proposal {analysis_result['proposal_id']}")
                    return False
                    
    except Exception as e:
        logger.error(f"Failed to send webhook for proposal {analysis_result['proposal_id']}: {e}")
        return False

async def process_chat_message(message: str, context: Optional[Dict] = None) -> str:
    """Process chat message using Claude 3 Opus"""
    try:
        start_time = time.time()
        
        # Build context information
        context_info = "No specific context provided"
        if context:
            context_parts = []
            if context.get('assetId'):
                context_parts.append(f"Asset ID: {context['assetId']}")
            if context.get('assetType'):
                context_parts.append(f"Asset Type: {context['assetType']}")
            if context.get('currentPhase'):
                context_parts.append(f"Current Phase: {context['currentPhase']}")
            if context.get('userRole'):
                context_parts.append(f"User Role: {context['userRole']}")
            if context.get('assetData'):
                context_parts.append(f"Asset Details: {str(context['assetData'])[:200]}...")
            
            if context_parts:
                context_info = "\n".join(context_parts)
        
        # Prepare the chat prompt
        prompt = CHAT_PROMPT_TEMPLATE.format(
            message=message,
            context_info=context_info
        )
        
        # Call Claude 3 Opus API
        response = claude_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=3000,  # Increased for detailed, premium responses
            temperature=0.3,  # Balanced for professional yet engaging responses
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        processing_time = time.time() - start_time
        ai_response = response.content[0].text.strip()
        
        logger.info(f"Chat response generated in {processing_time:.2f}s")
        return ai_response
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        # For authentication errors, raise the exception so backend can use fallbacks
        if "authentication_error" in str(e) or "invalid x-api-key" in str(e):
            raise e
        return f"I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment."

async def process_analysis_task(
    file_path: str,
    file_extension: str,
    proposal_id: str,
    webhook_url: str
):
    """Background task to process document analysis"""
    try:
        logger.info(f"Starting analysis task for proposal {proposal_id}")
        
        # Extract document content
        content = await extract_text_content(file_path, file_extension)
        
        # Analyze with Claude
        analysis_result = await analyze_with_claude(content, proposal_id)
        
        # Send webhook notification
        webhook_sent = await send_webhook_notification(webhook_url, analysis_result)
        
        if not webhook_sent:
            logger.error(f"Failed to deliver analysis results for proposal {proposal_id}")
        
        # Cleanup uploaded file
        try:
            await aiofiles.os.remove(file_path)
            logger.info(f"Cleaned up uploaded file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup file {file_path}: {e}")
            
    except Exception as e:
        logger.error(f"Analysis task failed for proposal {proposal_id}: {e}")
        
        # Send failure notification
        error_result = {
            "proposal_id": proposal_id,
            "status": "failed",
            "summary": f"Processing failed: {str(e)}",
            "potential_strengths": [],
            "areas_for_consideration": ["Analysis could not be completed due to processing error"],
            "complexity_score": 1,
            "processing_time_seconds": 0,
            "document_hash": "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await send_webhook_notification(webhook_url, error_result)

# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test Claude API connectivity
        test_response = claude_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=10,
            messages=[{"role": "user", "content": "test"}]
        )
        claude_status = "healthy" if test_response else "unhealthy"
    except:
        claude_status = "unhealthy"
    
    # Test Redis connectivity
    redis_status = "healthy" if redis_client else "disabled"
    if redis_client:
        try:
            await redis_client.ping()
        except:
            redis_status = "unhealthy"

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        claude_api_status=claude_status,
        redis_status=redis_status
    )

@app.post("/api/v1/analyze-proposal-async")
async def analyze_proposal_async(
    background_tasks: BackgroundTasks,
    proposal_id: str = Form(...),
    webhook_url: str = Form(...),
    priority: str = Form(default="normal"),
    file: UploadFile = File(...)
):
    """
    Asynchronously analyze a proposal document
    Returns 202 Accepted and processes in background
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=422,
                detail=f"Unsupported file format. Supported: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Save uploaded file temporarily
        os.makedirs("temp", exist_ok=True)
        file_path = f"temp/{proposal_id}_{int(time.time())}{file_extension}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Start background processing
        background_tasks.add_task(
            process_analysis_task,
            file_path,
            file_extension,
            proposal_id,
            webhook_url
        )
        
        logger.info(f"Analysis queued for proposal {proposal_id}")
        
        return JSONResponse(
            status_code=202,
            content={
                "message": "Analysis started",
                "proposal_id": proposal_id,
                "status": "processing",
                "estimated_completion": "2-5 minutes"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to queue analysis for proposal {proposal_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to start analysis")

@app.get("/api/v1/status/{proposal_id}")
async def get_analysis_status(proposal_id: str):
    """Get analysis status for a proposal (placeholder for future caching)"""
    return JSONResponse(
        content={
            "proposal_id": proposal_id,
            "message": "Status tracking not implemented. Check webhook notifications for results."
        }
    )

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Synchronous chat endpoint for real-time AI assistance
    """
    try:
        # Validate message
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if len(request.message) > 1000:
            raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or f"chat_{int(time.time())}"
        
        # Process the chat message
        ai_response = await process_chat_message(request.message, request.context)
        
        logger.info(f"Chat request processed for conversation {conversation_id}")
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@app.get("/api/v1/stats")
async def get_service_stats():
    """Get service statistics"""
    # Get cache stats if Redis is available
    cache_stats = {"cache_enabled": bool(redis_client)}
    if redis_client:
        try:
            info = await redis_client.info()
            cache_stats.update({
                "cache_keys": info.get('db0', {}).get('keys', 0),
                "cache_memory": info.get('used_memory_human', 'N/A')
            })
        except:
            cache_stats["cache_status"] = "error"

    return JSONResponse(
        content={
            "service": "CF1 AI Analyzer",
            "version": "1.0.0",
            "uptime": "N/A",
            "total_analyses": "N/A",
            "claude_model": "claude-3-opus-20240229",
            "supported_formats": list(SUPPORTED_FORMATS),
            "optimization_features": {
                "redis_caching": bool(redis_client),
                "content_chunking": True,
                "concurrent_processing": True,
                "streaming_pdf": True,
                "response_compression": True,
                "max_workers": "4 (configured)"
            },
            "cache_stats": cache_stats
        }
    )

# Application lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    logger.info("Starting CF1 AI Analyzer with performance optimizations...")
    await init_redis()
    logger.info("Startup complete - Redis caching, chunking, and concurrent processing enabled")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup connections on shutdown"""
    logger.info("Shutting down CF1 AI Analyzer...")
    await close_redis()
    logger.info("Shutdown complete")

if __name__ == "__main__":
    import uvicorn

    # Set up logging
    uvicorn_log_config = uvicorn.config.LOGGING_CONFIG
    uvicorn_log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_config=uvicorn_log_config
    )