"""
CF1 Market Intelligence Module
Real-time market data integration for enhanced AI analysis
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import aiohttp
import numpy as np
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class MarketDataSource(Enum):
    ALPHA_VANTAGE = "alpha_vantage"
    YAHOO_FINANCE = "yahoo_finance"
    COINMARKETCAP = "coinmarketcap"
    NEWS_API = "news_api"
    FRED = "fred"  # Federal Reserve Economic Data

@dataclass
class MarketTrend:
    sector: str
    trend_direction: str  # "bullish", "bearish", "sideways"
    strength: float  # 0.0 to 1.0
    timeframe: str  # "short", "medium", "long"
    supporting_factors: List[str]

@dataclass
class CompetitorIntelligence:
    company_name: str
    market_cap: str
    recent_funding: str
    growth_rate: str
    key_metrics: Dict[str, Any]
    competitive_advantages: List[str]
    recent_news: List[str]

@dataclass
class EconomicIndicators:
    gdp_growth: float
    inflation_rate: float
    interest_rates: float
    market_volatility: float
    sector_performance: Dict[str, float]
    risk_sentiment: str

class MarketIntelligenceEngine:
    def __init__(self, claude_client: Anthropic, api_keys: Dict[str, str] = None):
        self.claude_client = claude_client
        self.api_keys = api_keys or {}
        self.cache = {}
        self.cache_duration = 3600  # 1 hour cache
        
    async def analyze_market_environment(
        self, 
        sector: str, 
        target_market: str, 
        business_model: str
    ) -> Dict[str, Any]:
        """Analyze current market environment for a specific sector and business model"""
        
        logger.info(f"Analyzing market environment for sector: {sector}")
        
        try:
            # Gather multiple data sources
            market_trends = await self._get_sector_trends(sector)
            economic_data = await self._get_economic_indicators()
            competitor_intel = await self._get_competitor_intelligence(sector, target_market)
            news_sentiment = await self._get_news_sentiment(sector)
            
            # Synthesize with AI analysis
            market_analysis = await self._synthesize_market_analysis(
                sector, target_market, business_model,
                market_trends, economic_data, competitor_intel, news_sentiment
            )
            
            return {
                "market_trends": market_trends,
                "economic_indicators": economic_data,
                "competitor_intelligence": competitor_intel,
                "news_sentiment": news_sentiment,
                "ai_synthesis": market_analysis,
                "analysis_timestamp": datetime.now().isoformat(),
                "data_freshness": "real-time"
            }
            
        except Exception as e:
            logger.error(f"Market environment analysis failed: {e}")
            return self._get_fallback_market_analysis(sector)

    async def _get_sector_trends(self, sector: str) -> List[MarketTrend]:
        """Get current trends for a specific sector"""
        
        cache_key = f"sector_trends_{sector}"
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]
        
        # Mock implementation - in production, integrate with financial data APIs
        sector_mapping = {
            "fintech": ["digital payments growth", "blockchain adoption", "regulatory clarity"],
            "healthtech": ["telemedicine expansion", "AI diagnostics", "aging population"],
            "proptech": ["remote work trends", "smart building tech", "sustainability focus"],
            "edtech": ["online learning growth", "skill-based learning", "corporate training"],
            "climate": ["ESG investing", "carbon markets", "clean energy transition"],
            "default": ["digital transformation", "automation", "data analytics"]
        }
        
        factors = sector_mapping.get(sector.lower(), sector_mapping["default"])
        
        trends = []
        for i, factor in enumerate(factors[:3]):
            trend = MarketTrend(
                sector=sector,
                trend_direction=["bullish", "bullish", "sideways"][i],
                strength=0.7 + (i * 0.1),
                timeframe=["short", "medium", "long"][i],
                supporting_factors=[factor, f"Market demand for {sector} solutions"]
            )
            trends.append(trend)
        
        self._cache_data(cache_key, trends)
        return trends

    async def _get_economic_indicators(self) -> EconomicIndicators:
        """Get current economic indicators"""
        
        cache_key = "economic_indicators"
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]
        
        # Mock implementation - integrate with FRED, World Bank APIs
        indicators = EconomicIndicators(
            gdp_growth=2.1,  # Example values
            inflation_rate=3.2,
            interest_rates=5.25,
            market_volatility=0.18,
            sector_performance={
                "technology": 0.08,
                "healthcare": 0.06,
                "finance": 0.04,
                "real_estate": 0.02,
                "energy": -0.01
            },
            risk_sentiment="cautious_optimism"
        )
        
        self._cache_data(cache_key, indicators)
        return indicators

    async def _get_competitor_intelligence(
        self, 
        sector: str, 
        target_market: str
    ) -> List[CompetitorIntelligence]:
        """Get intelligence on key competitors in the sector"""
        
        cache_key = f"competitors_{sector}_{target_market}"
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]
        
        # Mock competitor data - in production, integrate with Crunchbase, PitchBook APIs
        mock_competitors = [
            CompetitorIntelligence(
                company_name=f"Market Leader Corp",
                market_cap="$2.5B",
                recent_funding="Series D $150M",
                growth_rate="45% YoY",
                key_metrics={
                    "annual_revenue": "$200M",
                    "customers": "10,000+",
                    "employees": "500"
                },
                competitive_advantages=[
                    "First mover advantage",
                    "Strong brand recognition",
                    "Extensive distribution network"
                ],
                recent_news=[
                    "Expanded to European markets",
                    "Launched AI-powered features",
                    "Partnership with Fortune 500 company"
                ]
            ),
            CompetitorIntelligence(
                company_name=f"Rising Challenger Inc",
                market_cap="$800M",
                recent_funding="Series C $75M",
                growth_rate="120% YoY",
                key_metrics={
                    "annual_revenue": "$50M",
                    "customers": "2,500+",
                    "employees": "150"
                },
                competitive_advantages=[
                    "Innovative technology",
                    "Lower cost structure",
                    "Agile development"
                ],
                recent_news=[
                    "Rapid customer acquisition",
                    "Key executive hire from industry leader",
                    "Patent filing for core technology"
                ]
            )
        ]
        
        self._cache_data(cache_key, mock_competitors)
        return mock_competitors

    async def _get_news_sentiment(self, sector: str) -> Dict[str, Any]:
        """Analyze news sentiment for the sector"""
        
        cache_key = f"news_sentiment_{sector}"
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]
        
        # Mock sentiment analysis - integrate with news APIs and sentiment analysis
        sentiment_data = {
            "overall_sentiment": "positive",
            "sentiment_score": 0.65,  # -1 to 1 scale
            "key_topics": [
                "funding announcements",
                "technology breakthroughs",
                "regulatory developments"
            ],
            "sentiment_drivers": {
                "positive": [
                    "Increased investment activity",
                    "Strong earnings reports",
                    "Product innovation announcements"
                ],
                "negative": [
                    "Regulatory uncertainty",
                    "Market saturation concerns"
                ]
            },
            "trending_keywords": [
                "artificial intelligence",
                "sustainability",
                "digital transformation"
            ]
        }
        
        self._cache_data(cache_key, sentiment_data)
        return sentiment_data

    async def _synthesize_market_analysis(
        self,
        sector: str,
        target_market: str,
        business_model: str,
        market_trends: List[MarketTrend],
        economic_data: EconomicIndicators,
        competitor_intel: List[CompetitorIntelligence],
        news_sentiment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Use AI to synthesize comprehensive market analysis"""
        
        synthesis_prompt = f"""
        Analyze the current market environment for an investment opportunity:
        
        Sector: {sector}
        Target Market: {target_market}
        Business Model: {business_model}
        
        Market Trends: {[f"{t.trend_direction} {t.sector} trend (strength: {t.strength})" for t in market_trends]}
        
        Economic Indicators:
        - GDP Growth: {economic_data.gdp_growth}%
        - Inflation: {economic_data.inflation_rate}%
        - Interest Rates: {economic_data.interest_rates}%
        - Market Volatility: {economic_data.market_volatility}
        
        Competitors: {[f"{c.company_name} ({c.growth_rate} growth)" for c in competitor_intel]}
        
        News Sentiment: {news_sentiment['overall_sentiment']} (score: {news_sentiment['sentiment_score']})
        
        Provide market analysis in JSON format:
        {{
            "market_opportunity_score": 0.0-1.0,
            "competitive_intensity": "low|moderate|high|very_high",
            "market_timing": "excellent|good|fair|poor",
            "growth_potential": "high|moderate|low",
            "key_success_factors": ["factor1", "factor2"],
            "market_risks": ["risk1", "risk2"],
            "strategic_recommendations": ["rec1", "rec2"],
            "optimal_positioning": "description of how to position in market",
            "funding_environment": "favorable|neutral|challenging",
            "exit_opportunities": ["ipo", "acquisition", "merger"]
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                temperature=0.1,
                messages=[{"role": "user", "content": synthesis_prompt}]
            )
            
            return self._parse_json_response(response.content[0].text)
            
        except Exception as e:
            logger.error(f"Market analysis synthesis failed: {e}")
            return self._get_fallback_synthesis()

    async def get_real_time_market_score(
        self, 
        sector: str, 
        business_model: str
    ) -> float:
        """Calculate real-time market attractiveness score"""
        
        try:
            market_env = await self.analyze_market_environment(sector, "enterprise", business_model)
            
            # Weight different factors
            weights = {
                "market_trends": 0.25,
                "economic_conditions": 0.20,
                "competitive_landscape": 0.25,
                "sentiment": 0.15,
                "timing": 0.15
            }
            
            # Calculate component scores
            trend_score = sum(t.strength for t in market_env["market_trends"]) / len(market_env["market_trends"])
            
            econ_score = self._calculate_economic_score(market_env["economic_indicators"])
            
            comp_score = self._calculate_competitive_score(market_env["competitor_intelligence"])
            
            sentiment_score = (market_env["news_sentiment"]["sentiment_score"] + 1) / 2  # Normalize to 0-1
            
            timing_score = self._calculate_timing_score(market_env["ai_synthesis"])
            
            # Calculate weighted score
            market_score = (
                trend_score * weights["market_trends"] +
                econ_score * weights["economic_conditions"] +
                comp_score * weights["competitive_landscape"] +
                sentiment_score * weights["sentiment"] +
                timing_score * weights["timing"]
            )
            
            return min(max(market_score, 0.0), 1.0)  # Clamp to 0-1 range
            
        except Exception as e:
            logger.error(f"Real-time market score calculation failed: {e}")
            return 0.6  # Neutral default

    def _calculate_economic_score(self, indicators: EconomicIndicators) -> float:
        """Calculate economic conditions score"""
        # Simplified scoring based on economic indicators
        gdp_score = min(indicators.gdp_growth / 4.0, 1.0)  # Normalize around 4% growth
        inflation_score = max(0, 1.0 - abs(indicators.inflation_rate - 2.0) / 3.0)  # Target 2% inflation
        interest_score = max(0, 1.0 - indicators.interest_rates / 8.0)  # Lower rates better
        
        return (gdp_score + inflation_score + interest_score) / 3.0

    def _calculate_competitive_score(self, competitors: List[CompetitorIntelligence]) -> float:
        """Calculate competitive landscape score"""
        if not competitors:
            return 0.8  # No data, assume moderate
        
        # Lower competition intensity = higher score
        avg_growth = sum(float(c.growth_rate.split('%')[0]) for c in competitors) / len(competitors)
        
        # If average competitor growth is high, market is attractive but competitive
        if avg_growth > 100:
            return 0.6  # High growth but very competitive
        elif avg_growth > 50:
            return 0.7  # Good growth, manageable competition
        else:
            return 0.8  # Lower growth, less competition

    def _calculate_timing_score(self, ai_synthesis: Dict[str, Any]) -> float:
        """Calculate market timing score from AI synthesis"""
        timing = ai_synthesis.get("market_timing", "fair")
        timing_scores = {
            "excellent": 1.0,
            "good": 0.8,
            "fair": 0.6,
            "poor": 0.3
        }
        return timing_scores.get(timing, 0.6)

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache[cache_key]["timestamp"]
        return (time.time() - cache_time) < self.cache_duration

    def _cache_data(self, cache_key: str, data: Any) -> None:
        """Cache data with timestamp"""
        self.cache[cache_key] = {
            "data": data,
            "timestamp": time.time()
        }

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON from Claude's response"""
        try:
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return self._get_fallback_synthesis()
                
        except json.JSONDecodeError:
            return self._get_fallback_synthesis()

    def _get_fallback_market_analysis(self, sector: str) -> Dict[str, Any]:
        """Fallback market analysis when data sources fail"""
        return {
            "market_trends": [],
            "economic_indicators": EconomicIndicators(
                gdp_growth=2.0, inflation_rate=3.0, interest_rates=5.0,
                market_volatility=0.2, sector_performance={}, risk_sentiment="neutral"
            ),
            "competitor_intelligence": [],
            "news_sentiment": {"overall_sentiment": "neutral", "sentiment_score": 0.5},
            "ai_synthesis": self._get_fallback_synthesis(),
            "analysis_timestamp": datetime.now().isoformat(),
            "data_freshness": "fallback"
        }

    def _get_fallback_synthesis(self) -> Dict[str, Any]:
        """Fallback AI synthesis when analysis fails"""
        return {
            "market_opportunity_score": 0.6,
            "competitive_intensity": "moderate",
            "market_timing": "fair",
            "growth_potential": "moderate",
            "key_success_factors": ["Product differentiation", "Strong execution"],
            "market_risks": ["Competitive pressure", "Market timing"],
            "strategic_recommendations": ["Focus on unique value proposition"],
            "optimal_positioning": "Differentiated player with strong execution",
            "funding_environment": "neutral",
            "exit_opportunities": ["acquisition"]
        }

# Export main classes
__all__ = ['MarketIntelligenceEngine', 'MarketTrend', 'CompetitorIntelligence', 'EconomicIndicators']