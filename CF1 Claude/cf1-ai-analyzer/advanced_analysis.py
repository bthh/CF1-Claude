"""
CF1 Advanced AI Analysis Engine
Enhanced capabilities for multi-document analysis, risk scoring, and comparative intelligence
"""

import asyncio
import json
import logging
import math
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum

import aiohttp
from anthropic import Anthropic
import numpy as np

logger = logging.getLogger(__name__)

class DocumentType(Enum):
    BUSINESS_PLAN = "business_plan"
    FINANCIAL_PROJECTIONS = "financial_projections"
    MARKET_ANALYSIS = "market_analysis"
    TEAM_BIOS = "team_bios"
    LEGAL_DOCUMENTS = "legal_documents"
    TECHNICAL_SPECS = "technical_specs"
    PITCH_DECK = "pitch_deck"
    OTHER = "other"

class RiskLevel(Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class DocumentAnalysis:
    document_id: str
    document_type: DocumentType
    content_summary: str
    key_metrics: Dict[str, Any]
    confidence_score: float
    quality_indicators: Dict[str, float]
    extracted_data: Dict[str, Any]

@dataclass
class RiskFactor:
    category: str
    description: str
    severity: RiskLevel
    likelihood: float
    impact_score: float
    mitigation_suggestions: List[str]

@dataclass
class MarketIntelligence:
    market_size: str
    growth_rate: str
    competition_level: str
    market_trends: List[str]
    opportunity_score: float
    timing_assessment: str

@dataclass
class AdvancedAnalysisResult:
    proposal_id: str
    analysis_timestamp: str
    overall_score: float
    investment_recommendation: str
    
    # Multi-document analysis
    document_analyses: List[DocumentAnalysis]
    cross_document_consistency: float
    information_completeness: float
    
    # Risk assessment
    risk_factors: List[RiskFactor]
    overall_risk_score: float
    risk_category: RiskLevel
    
    # Comparative analysis
    similar_projects: List[Dict[str, Any]]
    success_probability: float
    market_intelligence: MarketIntelligence
    
    # Enhanced insights
    strengths_detailed: List[Dict[str, str]]
    concerns_detailed: List[Dict[str, str]]
    recommendations: List[str]
    due_diligence_checklist: List[str]

class AdvancedAIAnalyzer:
    def __init__(self, claude_client: Anthropic):
        self.claude_client = claude_client
        self.historical_data_cache = {}
        self.market_data_cache = {}
        
    async def analyze_multiple_documents(
        self, 
        documents: List[Tuple[str, str, DocumentType]], 
        proposal_id: str
    ) -> AdvancedAnalysisResult:
        """
        Perform advanced multi-document analysis with risk scoring and comparative intelligence
        
        Args:
            documents: List of (document_id, content, document_type) tuples
            proposal_id: Unique proposal identifier
        
        Returns:
            AdvancedAnalysisResult with comprehensive analysis
        """
        logger.info(f"Starting advanced analysis for proposal {proposal_id} with {len(documents)} documents")
        
        try:
            # Phase 1: Individual document analysis
            document_analyses = await self._analyze_individual_documents(documents)
            
            # Phase 2: Cross-document consistency check
            consistency_score = await self._check_cross_document_consistency(document_analyses)
            
            # Phase 3: Advanced risk assessment
            risk_assessment = await self._perform_risk_assessment(document_analyses, proposal_id)
            
            # Phase 4: Market intelligence and comparative analysis
            market_intel = await self._gather_market_intelligence(document_analyses)
            similar_projects = await self._find_similar_projects(document_analyses)
            
            # Phase 5: Generate comprehensive insights
            insights = await self._generate_advanced_insights(
                document_analyses, risk_assessment, market_intel, similar_projects
            )
            
            # Phase 6: Calculate overall scores and recommendations
            overall_score, investment_rec = await self._calculate_overall_assessment(
                document_analyses, risk_assessment, market_intel, insights
            )
            
            result = AdvancedAnalysisResult(
                proposal_id=proposal_id,
                analysis_timestamp=datetime.now(timezone.utc).isoformat(),
                overall_score=overall_score,
                investment_recommendation=investment_rec,
                document_analyses=document_analyses,
                cross_document_consistency=consistency_score,
                information_completeness=self._calculate_completeness_score(document_analyses),
                risk_factors=risk_assessment["factors"],
                overall_risk_score=risk_assessment["overall_score"],
                risk_category=risk_assessment["category"],
                similar_projects=similar_projects,
                success_probability=insights["success_probability"],
                market_intelligence=market_intel,
                strengths_detailed=insights["strengths"],
                concerns_detailed=insights["concerns"],
                recommendations=insights["recommendations"],
                due_diligence_checklist=insights["due_diligence"]
            )
            
            logger.info(f"Advanced analysis completed for proposal {proposal_id}")
            return result
            
        except Exception as e:
            logger.error(f"Advanced analysis failed for proposal {proposal_id}: {e}")
            raise

    async def _analyze_individual_documents(
        self, 
        documents: List[Tuple[str, str, DocumentType]]
    ) -> List[DocumentAnalysis]:
        """Analyze each document individually with specialized prompts"""
        
        analyses = []
        
        for doc_id, content, doc_type in documents:
            try:
                # Get specialized prompt for document type
                prompt = self._get_document_specific_prompt(content, doc_type)
                
                # Analyze with Claude
                response = self.claude_client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=3000,
                    temperature=0.1,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                # Parse response
                analysis_data = self._parse_document_analysis_response(response.content[0].text)
                
                analysis = DocumentAnalysis(
                    document_id=doc_id,
                    document_type=doc_type,
                    content_summary=analysis_data.get("summary", ""),
                    key_metrics=analysis_data.get("key_metrics", {}),
                    confidence_score=analysis_data.get("confidence_score", 0.5),
                    quality_indicators=analysis_data.get("quality_indicators", {}),
                    extracted_data=analysis_data.get("extracted_data", {})
                )
                
                analyses.append(analysis)
                
            except Exception as e:
                logger.error(f"Failed to analyze document {doc_id}: {e}")
                # Create placeholder analysis for failed documents
                analyses.append(DocumentAnalysis(
                    document_id=doc_id,
                    document_type=doc_type,
                    content_summary="Analysis failed",
                    key_metrics={},
                    confidence_score=0.0,
                    quality_indicators={},
                    extracted_data={}
                ))
        
        return analyses

    def _get_document_specific_prompt(self, content: str, doc_type: DocumentType) -> str:
        """Generate specialized analysis prompts based on document type"""
        
        base_instruction = f"""
        You are analyzing a {doc_type.value} document for an investment proposal.
        Provide a detailed analysis in JSON format with the following structure:
        
        {{
            "summary": "Concise summary of the document",
            "key_metrics": {{}},
            "confidence_score": 0.0-1.0,
            "quality_indicators": {{}},
            "extracted_data": {{}}
        }}
        
        Document content:
        {content[:12000]}
        """
        
        specific_instructions = {
            DocumentType.BUSINESS_PLAN: """
            Focus on:
            - Business model clarity and viability
            - Market opportunity size and validation
            - Competitive advantages and differentiation
            - Revenue model and scalability
            - Execution strategy and milestones
            
            Extract: target_market, revenue_model, competitive_advantages, key_milestones
            """,
            
            DocumentType.FINANCIAL_PROJECTIONS: """
            Focus on:
            - Revenue growth assumptions and reasonableness
            - Cost structure and margin analysis
            - Cash flow projections and burn rate
            - Break-even analysis and profitability timeline
            - Funding requirements and use of capital
            
            Extract: revenue_projections, break_even_month, funding_required, burn_rate
            """,
            
            DocumentType.MARKET_ANALYSIS: """
            Focus on:
            - Total addressable market (TAM) size and growth
            - Target customer segments and validation
            - Competitive landscape and positioning
            - Market trends and timing
            - Go-to-market strategy effectiveness
            
            Extract: tam_size, market_growth_rate, target_segments, key_competitors
            """,
            
            DocumentType.TEAM_BIOS: """
            Focus on:
            - Relevant experience and track record
            - Domain expertise and technical skills
            - Previous startup/business experience
            - Team completeness and complementary skills
            - Advisory board strength
            
            Extract: team_size, years_experience, previous_exits, domain_expertise
            """,
            
            DocumentType.LEGAL_DOCUMENTS: """
            Focus on:
            - Corporate structure and equity distribution
            - Intellectual property protection
            - Regulatory compliance status
            - Legal risks and liabilities
            - Contract and partnership agreements
            
            Extract: legal_structure, ip_protection, regulatory_status, legal_risks
            """,
            
            DocumentType.TECHNICAL_SPECS: """
            Focus on:
            - Technical feasibility and innovation
            - Scalability and architecture design
            - Development timeline and milestones
            - Technology risks and dependencies
            - Competitive technical advantages
            
            Extract: technology_stack, development_timeline, technical_risks, innovation_level
            """
        }
        
        return base_instruction + specific_instructions.get(doc_type, "Analyze comprehensively.")

    async def _check_cross_document_consistency(
        self, 
        document_analyses: List[DocumentAnalysis]
    ) -> float:
        """Check for consistency across multiple documents"""
        
        if len(document_analyses) < 2:
            return 1.0
        
        # Extract key metrics for comparison
        financial_data = []
        market_data = []
        team_data = []
        
        for analysis in document_analyses:
            if analysis.document_type == DocumentType.FINANCIAL_PROJECTIONS:
                financial_data.append(analysis.extracted_data)
            elif analysis.document_type == DocumentType.MARKET_ANALYSIS:
                market_data.append(analysis.extracted_data)
            elif analysis.document_type == DocumentType.TEAM_BIOS:
                team_data.append(analysis.extracted_data)
        
        consistency_prompt = f"""
        Check for consistency across these document analyses:
        
        Financial Data: {json.dumps(financial_data, indent=2)}
        Market Data: {json.dumps(market_data, indent=2)}
        Team Data: {json.dumps(team_data, indent=2)}
        
        Provide a consistency score from 0.0 to 1.0 and identify any major inconsistencies.
        Return JSON: {{"consistency_score": 0.0-1.0, "inconsistencies": ["list of issues"]}}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0.1,
                messages=[{"role": "user", "content": consistency_prompt}]
            )
            
            result = self._parse_json_response(response.content[0].text)
            return result.get("consistency_score", 0.8)
            
        except Exception as e:
            logger.error(f"Consistency check failed: {e}")
            return 0.8

    async def _perform_risk_assessment(
        self, 
        document_analyses: List[DocumentAnalysis], 
        proposal_id: str
    ) -> Dict[str, Any]:
        """Perform comprehensive risk assessment"""
        
        # Combine all extracted data for risk analysis
        combined_data = {}
        for analysis in document_analyses:
            combined_data.update(analysis.extracted_data)
        
        risk_prompt = f"""
        Perform a comprehensive risk assessment for this investment proposal.
        
        Combined Data: {json.dumps(combined_data, indent=2)}
        
        Analyze risks in these categories:
        1. Market Risk - competition, market size, timing
        2. Technology Risk - feasibility, scalability, innovation
        3. Team Risk - experience, completeness, execution capability
        4. Financial Risk - projections, funding, burn rate
        5. Regulatory Risk - compliance, legal issues
        6. Operational Risk - execution, partnerships, scaling
        
        Return JSON format:
        {{
            "risk_factors": [
                {{
                    "category": "Market Risk",
                    "description": "Specific risk description",
                    "severity": "low|moderate|high|very_high",
                    "likelihood": 0.0-1.0,
                    "impact_score": 0.0-1.0,
                    "mitigation_suggestions": ["suggestion1", "suggestion2"]
                }}
            ],
            "overall_risk_score": 0.0-1.0,
            "risk_category": "low|moderate|high|very_high"
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2500,
                temperature=0.1,
                messages=[{"role": "user", "content": risk_prompt}]
            )
            
            risk_data = self._parse_json_response(response.content[0].text)
            
            # Convert to RiskFactor objects
            risk_factors = []
            for factor_data in risk_data.get("risk_factors", []):
                risk_factor = RiskFactor(
                    category=factor_data.get("category", "Unknown"),
                    description=factor_data.get("description", ""),
                    severity=RiskLevel(factor_data.get("severity", "moderate")),
                    likelihood=factor_data.get("likelihood", 0.5),
                    impact_score=factor_data.get("impact_score", 0.5),
                    mitigation_suggestions=factor_data.get("mitigation_suggestions", [])
                )
                risk_factors.append(risk_factor)
            
            return {
                "factors": risk_factors,
                "overall_score": risk_data.get("overall_risk_score", 0.5),
                "category": RiskLevel(risk_data.get("risk_category", "moderate"))
            }
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {e}")
            return {
                "factors": [],
                "overall_score": 0.5,
                "category": RiskLevel.MODERATE
            }

    async def _gather_market_intelligence(
        self, 
        document_analyses: List[DocumentAnalysis]
    ) -> MarketIntelligence:
        """Gather and analyze market intelligence"""
        
        # Extract market-related data
        market_data = {}
        for analysis in document_analyses:
            if analysis.document_type in [DocumentType.MARKET_ANALYSIS, DocumentType.BUSINESS_PLAN]:
                market_data.update(analysis.extracted_data)
        
        market_prompt = f"""
        Analyze the market intelligence for this investment proposal:
        
        Market Data: {json.dumps(market_data, indent=2)}
        
        Provide market intelligence analysis:
        {{
            "market_size": "Size description with numbers",
            "growth_rate": "Annual growth rate",
            "competition_level": "low|moderate|high|very_high",
            "market_trends": ["trend1", "trend2", "trend3"],
            "opportunity_score": 0.0-1.0,
            "timing_assessment": "excellent|good|fair|poor"
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1500,
                temperature=0.1,
                messages=[{"role": "user", "content": market_prompt}]
            )
            
            market_data = self._parse_json_response(response.content[0].text)
            
            return MarketIntelligence(
                market_size=market_data.get("market_size", "Unknown"),
                growth_rate=market_data.get("growth_rate", "Unknown"),
                competition_level=market_data.get("competition_level", "moderate"),
                market_trends=market_data.get("market_trends", []),
                opportunity_score=market_data.get("opportunity_score", 0.5),
                timing_assessment=market_data.get("timing_assessment", "fair")
            )
            
        except Exception as e:
            logger.error(f"Market intelligence gathering failed: {e}")
            return MarketIntelligence(
                market_size="Analysis unavailable",
                growth_rate="Unknown",
                competition_level="moderate",
                market_trends=[],
                opportunity_score=0.5,
                timing_assessment="fair"
            )

    async def _find_similar_projects(
        self, 
        document_analyses: List[DocumentAnalysis]
    ) -> List[Dict[str, Any]]:
        """Find and analyze similar historical projects"""
        
        # This would integrate with a database of historical projects
        # For now, we'll simulate with AI-generated comparable analysis
        
        combined_data = {}
        for analysis in document_analyses:
            combined_data.update(analysis.extracted_data)
        
        comparison_prompt = f"""
        Based on this proposal data, generate analysis of 3-5 similar historical projects:
        
        Proposal Data: {json.dumps(combined_data, indent=2)}
        
        For each comparable project, provide:
        {{
            "similar_projects": [
                {{
                    "name": "Project name",
                    "sector": "Industry sector",
                    "funding_amount": "Amount raised",
                    "outcome": "success|failure|mixed",
                    "similarity_score": 0.0-1.0,
                    "key_learnings": ["learning1", "learning2"],
                    "success_factors": ["factor1", "factor2"],
                    "failure_reasons": ["reason1", "reason2"] // if applicable
                }}
            ]
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                temperature=0.3,  # Slightly higher for creative comparison
                messages=[{"role": "user", "content": comparison_prompt}]
            )
            
            comparison_data = self._parse_json_response(response.content[0].text)
            return comparison_data.get("similar_projects", [])
            
        except Exception as e:
            logger.error(f"Similar projects analysis failed: {e}")
            return []

    async def _generate_advanced_insights(
        self, 
        document_analyses: List[DocumentAnalysis],
        risk_assessment: Dict[str, Any],
        market_intel: MarketIntelligence,
        similar_projects: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate advanced insights and recommendations"""
        
        insights_prompt = f"""
        Generate advanced investment insights based on comprehensive analysis:
        
        Document Analyses: {len(document_analyses)} documents analyzed
        Risk Assessment: {risk_assessment['overall_score']} overall risk score
        Market Intelligence: {asdict(market_intel)}
        Similar Projects: {len(similar_projects)} comparable projects
        
        Generate detailed insights:
        {{
            "success_probability": 0.0-1.0,
            "strengths": [
                {{
                    "category": "Market Position",
                    "description": "Detailed strength description",
                    "impact_level": "high|moderate|low"
                }}
            ],
            "concerns": [
                {{
                    "category": "Financial Risk",
                    "description": "Detailed concern description",
                    "severity": "high|moderate|low"
                }}
            ],
            "recommendations": ["recommendation1", "recommendation2"],
            "due_diligence": ["checklist item 1", "checklist item 2"]
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2500,
                temperature=0.1,
                messages=[{"role": "user", "content": insights_prompt}]
            )
            
            return self._parse_json_response(response.content[0].text)
            
        except Exception as e:
            logger.error(f"Advanced insights generation failed: {e}")
            return {
                "success_probability": 0.5,
                "strengths": [],
                "concerns": [],
                "recommendations": [],
                "due_diligence": []
            }

    async def _calculate_overall_assessment(
        self,
        document_analyses: List[DocumentAnalysis],
        risk_assessment: Dict[str, Any],
        market_intel: MarketIntelligence,
        insights: Dict[str, Any]
    ) -> Tuple[float, str]:
        """Calculate overall investment score and recommendation"""
        
        # Weighted scoring algorithm
        weights = {
            "market_opportunity": 0.25,
            "team_quality": 0.20,
            "financial_projections": 0.20,
            "risk_profile": 0.15,
            "competitive_position": 0.10,
            "execution_capability": 0.10
        }
        
        # Calculate component scores
        scores = {}
        
        # Market opportunity score
        scores["market_opportunity"] = market_intel.opportunity_score
        
        # Team quality score (from team document analysis)
        team_scores = [a.confidence_score for a in document_analyses if a.document_type == DocumentType.TEAM_BIOS]
        scores["team_quality"] = sum(team_scores) / len(team_scores) if team_scores else 0.5
        
        # Financial projections score
        financial_scores = [a.confidence_score for a in document_analyses if a.document_type == DocumentType.FINANCIAL_PROJECTIONS]
        scores["financial_projections"] = sum(financial_scores) / len(financial_scores) if financial_scores else 0.5
        
        # Risk profile score (inverted - lower risk = higher score)
        scores["risk_profile"] = 1.0 - risk_assessment["overall_score"]
        
        # Competitive position and execution capability
        scores["competitive_position"] = 0.6  # Default based on analysis
        scores["execution_capability"] = 0.6  # Default based on analysis
        
        # Calculate weighted overall score
        overall_score = sum(scores[key] * weights[key] for key in weights.keys())
        
        # Generate investment recommendation
        if overall_score >= 0.8:
            recommendation = "Strong Buy - Excellent investment opportunity"
        elif overall_score >= 0.65:
            recommendation = "Buy - Good investment opportunity with manageable risks"
        elif overall_score >= 0.5:
            recommendation = "Hold - Moderate opportunity, requires careful consideration"
        elif overall_score >= 0.35:
            recommendation = "Weak Hold - Significant risks outweigh potential"
        else:
            recommendation = "Avoid - High risk, low probability of success"
        
        return overall_score, recommendation

    def _calculate_completeness_score(self, document_analyses: List[DocumentAnalysis]) -> float:
        """Calculate information completeness score based on document types"""
        
        required_docs = {
            DocumentType.BUSINESS_PLAN,
            DocumentType.FINANCIAL_PROJECTIONS,
            DocumentType.MARKET_ANALYSIS,
            DocumentType.TEAM_BIOS
        }
        
        present_docs = {analysis.document_type for analysis in document_analyses}
        completeness = len(present_docs.intersection(required_docs)) / len(required_docs)
        
        return completeness

    def _parse_document_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's response for document analysis"""
        return self._parse_json_response(response_text)

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON from Claude's response with fallback handling"""
        try:
            # Try to find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {}
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from Claude response")
            return {}

# Export the main class
__all__ = ['AdvancedAIAnalyzer', 'AdvancedAnalysisResult', 'DocumentType', 'RiskLevel']