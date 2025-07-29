"""
CF1 AI Analyzer Microservice - Advanced Version
Enhanced FastAPI service with multi-document analysis, risk scoring, and market intelligence
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
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import pymupdf
import pdfplumber
from anthropic import Anthropic

# Import our advanced analysis modules
from advanced_analysis import AdvancedAIAnalyzer, DocumentType, AdvancedAnalysisResult
from market_intelligence import MarketIntelligenceEngine

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
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
SUPPORTED_FORMATS = {".pdf", ".txt", ".docx"}

if not CLAUDE_API_KEY:
    logger.error("ANTHROPIC_API_KEY environment variable not set")
    raise ValueError("ANTHROPIC_API_KEY is required")

# Initialize clients
claude_client = Anthropic(api_key=CLAUDE_API_KEY)
advanced_analyzer = AdvancedAIAnalyzer(claude_client)
market_engine = MarketIntelligenceEngine(claude_client)

# FastAPI app
app = FastAPI(
    title="CF1 AI Analyzer - Advanced",
    description="Advanced AI-powered proposal analysis with multi-document support and market intelligence",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced Pydantic models
class AdvancedAnalysisRequest(BaseModel):
    proposal_id: str = Field(..., description="Unique proposal identifier")
    webhook_url: str = Field(..., description="Callback URL for results")
    priority: str = Field(default="normal", description="Processing priority")
    analysis_type: str = Field(default="comprehensive", description="basic|comprehensive|market_focused")
    sector: Optional[str] = Field(None, description="Business sector for market intelligence")
    target_market: Optional[str] = Field(None, description="Target market segment")

class MultiDocumentUpload(BaseModel):
    proposal_id: str
    webhook_url: str
    sector: Optional[str] = None
    target_market: Optional[str] = None
    business_model: Optional[str] = None

class MarketAnalysisRequest(BaseModel):
    sector: str = Field(..., description="Business sector")
    target_market: str = Field(..., description="Target market segment")
    business_model: str = Field(..., description="Business model description")

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    claude_api_status: str
    advanced_features: List[str]

# Document processing functions (enhanced)
async def classify_document_type(content: str, filename: str) -> DocumentType:
    """Automatically classify document type based on content and filename"""
    
    filename_lower = filename.lower()
    content_lower = content.lower()[:2000]  # Check first 2000 chars
    
    # Filename-based classification
    if any(term in filename_lower for term in ["business", "plan", "executive", "summary"]):
        return DocumentType.BUSINESS_PLAN
    elif any(term in filename_lower for term in ["financial", "projections", "forecast", "budget"]):
        return DocumentType.FINANCIAL_PROJECTIONS
    elif any(term in filename_lower for term in ["market", "analysis", "research"]):
        return DocumentType.MARKET_ANALYSIS
    elif any(term in filename_lower for term in ["team", "bio", "founder", "leadership"]):
        return DocumentType.TEAM_BIOS
    elif any(term in filename_lower for term in ["legal", "terms", "contract", "agreement"]):
        return DocumentType.LEGAL_DOCUMENTS
    elif any(term in filename_lower for term in ["technical", "spec", "architecture", "product"]):
        return DocumentType.TECHNICAL_SPECS
    elif any(term in filename_lower for term in ["pitch", "deck", "presentation"]):
        return DocumentType.PITCH_DECK
    
    # Content-based classification using AI
    classification_prompt = f"""
    Classify this document type based on its content:
    
    Filename: {filename}
    Content: {content_lower}
    
    Return one of: business_plan, financial_projections, market_analysis, team_bios, legal_documents, technical_specs, pitch_deck, other
    """
    
    try:
        response = claude_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=50,
            temperature=0,
            messages=[{"role": "user", "content": classification_prompt}]
        )
        
        doc_type_str = response.content[0].text.strip().lower()
        
        # Map response to DocumentType enum
        type_mapping = {
            "business_plan": DocumentType.BUSINESS_PLAN,
            "financial_projections": DocumentType.FINANCIAL_PROJECTIONS,
            "market_analysis": DocumentType.MARKET_ANALYSIS,
            "team_bios": DocumentType.TEAM_BIOS,
            "legal_documents": DocumentType.LEGAL_DOCUMENTS,
            "technical_specs": DocumentType.TECHNICAL_SPECS,
            "pitch_deck": DocumentType.PITCH_DECK
        }
        
        return type_mapping.get(doc_type_str, DocumentType.OTHER)
        
    except Exception as e:
        logger.warning(f"Document classification failed: {e}")
        return DocumentType.OTHER

async def extract_text_content(file_path: str, file_extension: str) -> str:
    """Extract text content from various file formats"""
    try:
        if file_extension == ".pdf":
            return await extract_pdf_content(file_path)
        elif file_extension == ".txt":
            async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
                return await f.read()
        elif file_extension == ".docx":
            # Enhanced DOCX processing could be implemented here
            return "DOCX processing available in advanced version"
        else:
            raise HTTPException(status_code=422, detail=f"Unsupported file format: {file_extension}")
    except Exception as e:
        logger.error(f"Error extracting text content: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract document content")

async def extract_pdf_content(file_path: str) -> str:
    """Extract text content from PDF using PyMuPDF with pdfplumber fallback"""
    try:
        # Try PyMuPDF first
        doc = pymupdf.open(file_path)
        text_content = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_content += page.get_text()
        doc.close()
        
        if text_content.strip():
            return text_content
        
        # Fallback to pdfplumber
        with pdfplumber.open(file_path) as pdf:
            text_content = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content += page_text + "\n"
        
        return text_content
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise HTTPException(status_code=422, detail="Failed to extract text from PDF")

async def process_advanced_analysis_task(
    file_paths: List[str],
    file_extensions: List[str],
    filenames: List[str],
    proposal_id: str,
    webhook_url: str,
    sector: Optional[str] = None,
    target_market: Optional[str] = None,
    business_model: Optional[str] = None
):
    """Enhanced background task for advanced multi-document analysis"""
    try:
        logger.info(f"Starting advanced analysis for proposal {proposal_id} with {len(file_paths)} documents")
        
        # Extract and classify documents
        documents = []
        for i, (file_path, file_ext, filename) in enumerate(zip(file_paths, file_extensions, filenames)):
            content = await extract_text_content(file_path, file_ext)
            doc_type = await classify_document_type(content, filename)
            
            documents.append((f"doc_{i}", content, doc_type))
            logger.info(f"Classified {filename} as {doc_type.value}")
        
        # Perform advanced analysis
        analysis_result = await advanced_analyzer.analyze_multiple_documents(
            documents, proposal_id
        )
        
        # Enhance with market intelligence if sector provided
        if sector and target_market and business_model:
            market_analysis = await market_engine.analyze_market_environment(
                sector, target_market, business_model
            )
            
            # Update analysis result with market intelligence
            analysis_result.market_intelligence = market_analysis.get("ai_synthesis", {})
        
        # Convert to webhook format
        webhook_data = {
            "proposal_id": proposal_id,
            "status": "completed",
            "analysis_type": "advanced",
            "overall_score": analysis_result.overall_score,
            "investment_recommendation": analysis_result.investment_recommendation,
            "summary": f"Advanced analysis complete. Overall score: {analysis_result.overall_score:.2f}",
            "potential_strengths": [s["description"] for s in analysis_result.strengths_detailed],
            "areas_for_consideration": [c["description"] for c in analysis_result.concerns_detailed],
            "complexity_score": min(10, max(1, int(analysis_result.overall_score * 10))),
            "processing_time_seconds": 120,  # Estimated for advanced analysis
            "document_hash": hashlib.sha256(str(analysis_result).encode()).hexdigest()[:16],
            "timestamp": analysis_result.analysis_timestamp,
            
            # Advanced features
            "advanced_features": {
                "document_count": len(documents),
                "cross_document_consistency": analysis_result.cross_document_consistency,
                "information_completeness": analysis_result.information_completeness,
                "risk_assessment": {
                    "overall_risk_score": analysis_result.overall_risk_score,
                    "risk_category": analysis_result.risk_category.value,
                    "risk_factors": [
                        {
                            "category": rf.category,
                            "description": rf.description,
                            "severity": rf.severity.value
                        } for rf in analysis_result.risk_factors
                    ]
                },
                "market_intelligence": analysis_result.market_intelligence.__dict__ if hasattr(analysis_result.market_intelligence, '__dict__') else {},
                "success_probability": analysis_result.success_probability,
                "similar_projects": analysis_result.similar_projects,
                "recommendations": analysis_result.recommendations,
                "due_diligence_checklist": analysis_result.due_diligence_checklist
            }
        }
        
        # Send enhanced webhook
        webhook_sent = await send_webhook_notification(webhook_url, webhook_data)
        
        if not webhook_sent:
            logger.error(f"Failed to deliver advanced analysis results for proposal {proposal_id}")
        
        # Cleanup files
        for file_path in file_paths:
            try:
                await aiofiles.os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to cleanup file {file_path}: {e}")
                
    except Exception as e:
        logger.error(f"Advanced analysis task failed for proposal {proposal_id}: {e}")
        
        # Send failure notification
        error_result = {
            "proposal_id": proposal_id,
            "status": "failed",
            "analysis_type": "advanced",
            "summary": f"Advanced analysis failed: {str(e)}",
            "potential_strengths": [],
            "areas_for_consideration": ["Advanced analysis could not be completed"],
            "complexity_score": 1,
            "processing_time_seconds": 0,
            "document_hash": "",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "advanced_features": {}
        }
        
        await send_webhook_notification(webhook_url, error_result)

async def send_webhook_notification(webhook_url: str, analysis_result: Dict) -> bool:
    """Send analysis results to CF1 backend via webhook"""
    try:
        payload = json.dumps(analysis_result)
        signature = hmac.new(
            WEBHOOK_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            'Content-Type': 'application/json',
            'X-CF1-Signature': f'sha256={signature}',
            'User-Agent': 'CF1-AI-Analyzer-Advanced/2.0'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                webhook_url,
                data=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    logger.info(f"Advanced webhook sent successfully for proposal {analysis_result['proposal_id']}")
                    return True
                else:
                    logger.error(f"Advanced webhook failed with status {response.status}")
                    return False
                    
    except Exception as e:
        logger.error(f"Failed to send advanced webhook: {e}")
        return False

# Enhanced API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Enhanced health check with advanced features status"""
    try:
        # Test Claude API
        test_response = claude_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=10,
            messages=[{"role": "user", "content": "test"}]
        )
        claude_status = "healthy" if test_response else "unhealthy"
    except:
        claude_status = "unhealthy"
    
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        claude_api_status=claude_status,
        advanced_features=[
            "multi_document_analysis",
            "risk_assessment",
            "market_intelligence", 
            "comparative_analysis",
            "document_classification",
            "cross_document_consistency"
        ]
    )

@app.post("/api/v2/analyze-proposal-advanced")
async def analyze_proposal_advanced(
    background_tasks: BackgroundTasks,
    proposal_id: str = Form(...),
    webhook_url: str = Form(...),
    sector: str = Form(None),
    target_market: str = Form(None),
    business_model: str = Form(None),
    files: List[UploadFile] = File(...)
):
    """
    Advanced multi-document analysis with market intelligence
    Supports multiple files with automatic document classification
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        if len(files) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
        
        # Validate and save files
        file_paths = []
        file_extensions = []
        filenames = []
        
        os.makedirs("temp", exist_ok=True)
        
        for i, file in enumerate(files):
            if not file.filename:
                raise HTTPException(status_code=400, detail=f"File {i+1} has no filename")
            
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in SUPPORTED_FORMATS:
                raise HTTPException(
                    status_code=422,
                    detail=f"Unsupported file format: {file_extension}. Supported: {', '.join(SUPPORTED_FORMATS)}"
                )
            
            # Check file size
            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File {file.filename} too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            # Save file
            file_path = f"temp/{proposal_id}_{i}_{int(time.time())}{file_extension}"
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            file_paths.append(file_path)
            file_extensions.append(file_extension)
            filenames.append(file.filename)
        
        # Start advanced background processing
        background_tasks.add_task(
            process_advanced_analysis_task,
            file_paths,
            file_extensions,
            filenames,
            proposal_id,
            webhook_url,
            sector,
            target_market,
            business_model
        )
        
        logger.info(f"Advanced analysis queued for proposal {proposal_id} with {len(files)} documents")
        
        return JSONResponse(
            status_code=202,
            content={
                "message": "Advanced multi-document analysis started",
                "proposal_id": proposal_id,
                "status": "processing",
                "analysis_type": "advanced",
                "document_count": len(files),
                "features_enabled": [
                    "multi_document_analysis",
                    "document_classification",
                    "risk_assessment",
                    "market_intelligence" if sector else "basic_analysis",
                    "comparative_analysis"
                ],
                "estimated_completion": "5-10 minutes"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to queue advanced analysis for proposal {proposal_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to start advanced analysis")

@app.post("/api/v2/market-analysis")
async def get_market_analysis(request: MarketAnalysisRequest):
    """Get real-time market intelligence analysis"""
    try:
        market_data = await market_engine.analyze_market_environment(
            request.sector,
            request.target_market,
            request.business_model
        )
        
        market_score = await market_engine.get_real_time_market_score(
            request.sector,
            request.business_model
        )
        
        return JSONResponse(
            content={
                "market_analysis": market_data,
                "market_attractiveness_score": market_score,
                "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
                "data_sources": ["sector_trends", "economic_indicators", "competitor_intelligence", "news_sentiment"]
            }
        )
        
    except Exception as e:
        logger.error(f"Market analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Market analysis failed")

@app.get("/api/v2/features")
async def get_advanced_features():
    """Get list of available advanced features"""
    return JSONResponse(
        content={
            "advanced_features": {
                "multi_document_analysis": {
                    "description": "Analyze multiple related documents simultaneously",
                    "supported_types": [dt.value for dt in DocumentType],
                    "max_documents": 10
                },
                "document_classification": {
                    "description": "Automatic document type detection and classification",
                    "ai_powered": True
                },
                "risk_assessment": {
                    "description": "Comprehensive risk analysis across multiple categories",
                    "risk_categories": ["market", "technology", "team", "financial", "regulatory", "operational"]
                },
                "market_intelligence": {
                    "description": "Real-time market data integration and analysis",
                    "data_sources": ["market_trends", "economic_indicators", "competitor_intelligence", "news_sentiment"]
                },
                "comparative_analysis": {
                    "description": "Benchmark against similar historical projects",
                    "success_prediction": True
                },
                "cross_document_consistency": {
                    "description": "Detect inconsistencies across multiple documents",
                    "confidence_scoring": True
                }
            },
            "version": "2.0.0",
            "claude_model": "claude-3-opus-20240229"
        }
    )

# Legacy endpoint for backward compatibility
@app.post("/api/v1/analyze-proposal-async")
async def analyze_proposal_basic(
    background_tasks: BackgroundTasks,
    proposal_id: str = Form(...),
    webhook_url: str = Form(...),
    priority: str = Form(default="normal"),
    file: UploadFile = File(...)
):
    """
    Basic single-document analysis (legacy endpoint)
    Maintained for backward compatibility
    """
    # This would use the original analysis logic from main.py
    # For now, redirect to advanced analysis with single document
    
    return await analyze_proposal_advanced(
        background_tasks=background_tasks,
        proposal_id=proposal_id,
        webhook_url=webhook_url,
        files=[file]
    )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main_advanced:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )