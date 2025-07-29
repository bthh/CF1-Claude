"""
CF1 Regulatory Compliance Module
Automated compliance checking and regulatory flagging for investment proposals
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass
from enum import Enum

from anthropic import Anthropic

logger = logging.getLogger(__name__)

class ComplianceFramework(Enum):
    SEC_REG_CF = "sec_regulation_cf"  # SEC Regulation Crowdfunding
    SEC_REG_D = "sec_regulation_d"   # SEC Regulation D
    SEC_REG_A = "sec_regulation_a"   # SEC Regulation A+
    EU_MiFID = "eu_mifid"           # EU Markets in Financial Instruments Directive
    CFTC_DERIVATIVES = "cftc_derivatives"  # CFTC Derivatives
    BSA_AML = "bsa_aml"             # Bank Secrecy Act / Anti-Money Laundering
    GDPR = "gdpr"                   # General Data Protection Regulation
    CCPA = "ccpa"                   # California Consumer Privacy Act

class ComplianceLevel(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    NEEDS_REVIEW = "needs_review"
    UNCLEAR = "unclear"

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ComplianceRequirement:
    framework: ComplianceFramework
    requirement_id: str
    description: str
    mandatory: bool
    category: str  # "disclosure", "financial", "operational", "governance"

@dataclass
class ComplianceFlag:
    requirement: ComplianceRequirement
    status: ComplianceLevel
    risk_level: RiskLevel
    details: str
    recommended_action: str
    regulatory_citation: Optional[str] = None

@dataclass
class ComplianceReport:
    proposal_id: str
    analysis_timestamp: str
    overall_compliance_score: float  # 0.0 to 1.0
    applicable_frameworks: List[ComplianceFramework]
    compliance_flags: List[ComplianceFlag]
    recommendations: List[str]
    required_disclosures: List[str]
    regulatory_warnings: List[str]

class RegulatoryComplianceEngine:
    def __init__(self, claude_client: Anthropic):
        self.claude_client = claude_client
        self.compliance_requirements = self._load_compliance_requirements()
        
    def _load_compliance_requirements(self) -> Dict[ComplianceFramework, List[ComplianceRequirement]]:
        """Load regulatory compliance requirements for different frameworks"""
        
        requirements = {
            ComplianceFramework.SEC_REG_CF: [
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_CF,
                    "cf_offering_limit",
                    "Offering amount must not exceed $5 million in 12-month period",
                    True,
                    "financial"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_CF,
                    "cf_investor_limits",
                    "Individual investor limits based on income and net worth",
                    True,
                    "financial"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_CF,
                    "cf_disclosure_requirements",
                    "Detailed business plan, financial statements, and risk factors",
                    True,
                    "disclosure"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_CF,
                    "cf_intermediary_requirement",
                    "Must use registered funding portal or broker-dealer",
                    True,
                    "operational"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_CF,
                    "cf_annual_reporting",
                    "Annual reporting requirements for ongoing issuers",
                    True,
                    "disclosure"
                )
            ],
            
            ComplianceFramework.SEC_REG_D: [
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_D,
                    "reg_d_accredited_investors",
                    "Verification of accredited investor status required",
                    True,
                    "financial"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_D,
                    "reg_d_general_solicitation",
                    "Restrictions on general solicitation and advertising",
                    True,
                    "operational"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_D,
                    "reg_d_form_d_filing",
                    "Form D filing within 15 days of first sale",
                    True,
                    "disclosure"
                ),
                ComplianceRequirement(
                    ComplianceFramework.SEC_REG_D,
                    "reg_d_bad_actor_check",
                    "Bad actor disqualification checks for covered persons",
                    True,
                    "governance"
                )
            ],
            
            ComplianceFramework.BSA_AML: [
                ComplianceRequirement(
                    ComplianceFramework.BSA_AML,
                    "aml_customer_identification",
                    "Customer Identification Program (CIP) requirements",
                    True,
                    "operational"
                ),
                ComplianceRequirement(
                    ComplianceFramework.BSA_AML,
                    "aml_suspicious_activity",
                    "Suspicious Activity Report (SAR) filing procedures",
                    True,
                    "operational"
                ),
                ComplianceRequirement(
                    ComplianceFramework.BSA_AML,
                    "aml_recordkeeping",
                    "Transaction recordkeeping and reporting requirements",
                    True,
                    "operational"
                )
            ]
        }
        
        return requirements

    async def analyze_compliance(
        self,
        proposal_id: str,
        business_description: str,
        financial_details: Dict[str, any],
        target_investors: str,
        offering_structure: Dict[str, any],
        documents: List[Dict[str, str]]
    ) -> ComplianceReport:
        """
        Comprehensive regulatory compliance analysis
        """
        
        logger.info(f"Starting compliance analysis for proposal {proposal_id}")
        
        try:
            # Determine applicable regulatory frameworks
            applicable_frameworks = await self._determine_applicable_frameworks(
                business_description, financial_details, target_investors, offering_structure
            )
            
            # Analyze compliance for each framework
            all_flags = []
            for framework in applicable_frameworks:
                framework_flags = await self._analyze_framework_compliance(
                    framework, proposal_id, business_description, 
                    financial_details, target_investors, offering_structure, documents
                )
                all_flags.extend(framework_flags)
            
            # Generate overall assessment
            compliance_score = self._calculate_compliance_score(all_flags)
            recommendations = await self._generate_compliance_recommendations(all_flags)
            required_disclosures = self._extract_required_disclosures(all_flags)
            regulatory_warnings = self._extract_regulatory_warnings(all_flags)
            
            report = ComplianceReport(
                proposal_id=proposal_id,
                analysis_timestamp=datetime.utcnow().isoformat(),
                overall_compliance_score=compliance_score,
                applicable_frameworks=applicable_frameworks,
                compliance_flags=all_flags,
                recommendations=recommendations,
                required_disclosures=required_disclosures,
                regulatory_warnings=regulatory_warnings
            )
            
            logger.info(f"Compliance analysis completed for proposal {proposal_id}")
            return report
            
        except Exception as e:
            logger.error(f"Compliance analysis failed for proposal {proposal_id}: {e}")
            raise

    async def _determine_applicable_frameworks(
        self,
        business_description: str,
        financial_details: Dict[str, any],
        target_investors: str,
        offering_structure: Dict[str, any]
    ) -> List[ComplianceFramework]:
        """Determine which regulatory frameworks apply to this offering"""
        
        framework_prompt = f"""
        Determine which regulatory frameworks apply to this investment offering:
        
        Business Description: {business_description}
        Financial Details: {json.dumps(financial_details, indent=2)}
        Target Investors: {target_investors}
        Offering Structure: {json.dumps(offering_structure, indent=2)}
        
        Available frameworks:
        - sec_regulation_cf: SEC Regulation Crowdfunding (up to $5M, retail investors)
        - sec_regulation_d: SEC Regulation D (accredited investors, private placement)
        - sec_regulation_a: SEC Regulation A+ (up to $75M, public offering)
        - eu_mifid: EU MiFID (European investors)
        - cftc_derivatives: CFTC Derivatives (derivative instruments)
        - bsa_aml: BSA/AML (anti-money laundering requirements)
        - gdpr: GDPR (EU data protection)
        - ccpa: CCPA (California privacy)
        
        Return JSON: {{"applicable_frameworks": ["framework1", "framework2"]}}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=500,
                temperature=0.1,
                messages=[{"role": "user", "content": framework_prompt}]
            )
            
            result = self._parse_json_response(response.content[0].text)
            framework_names = result.get("applicable_frameworks", [])
            
            # Convert to enum values
            frameworks = []
            for name in framework_names:
                try:
                    framework = ComplianceFramework(name)
                    frameworks.append(framework)
                except ValueError:
                    logger.warning(f"Unknown compliance framework: {name}")
            
            # Always include BSA/AML for financial offerings
            if ComplianceFramework.BSA_AML not in frameworks:
                frameworks.append(ComplianceFramework.BSA_AML)
            
            return frameworks
            
        except Exception as e:
            logger.error(f"Framework determination failed: {e}")
            # Default fallback
            return [ComplianceFramework.SEC_REG_CF, ComplianceFramework.BSA_AML]

    async def _analyze_framework_compliance(
        self,
        framework: ComplianceFramework,
        proposal_id: str,
        business_description: str,
        financial_details: Dict[str, any],
        target_investors: str,
        offering_structure: Dict[str, any],
        documents: List[Dict[str, str]]
    ) -> List[ComplianceFlag]:
        """Analyze compliance for a specific regulatory framework"""
        
        requirements = self.compliance_requirements.get(framework, [])
        if not requirements:
            return []
        
        framework_prompt = f"""
        Analyze compliance with {framework.value} requirements:
        
        Business Description: {business_description}
        Financial Details: {json.dumps(financial_details, indent=2)}
        Target Investors: {target_investors}
        Offering Structure: {json.dumps(offering_structure, indent=2)}
        Available Documents: {[doc.get('type', 'unknown') for doc in documents]}
        
        Requirements to check:
        {json.dumps([{
            'id': req.requirement_id,
            'description': req.description,
            'mandatory': req.mandatory,
            'category': req.category
        } for req in requirements], indent=2)}
        
        For each requirement, assess compliance:
        {{
            "compliance_flags": [
                {{
                    "requirement_id": "requirement_id",
                    "status": "compliant|non_compliant|needs_review|unclear",
                    "risk_level": "low|medium|high|critical",
                    "details": "Detailed assessment",
                    "recommended_action": "Specific action needed",
                    "regulatory_citation": "Relevant regulation section"
                }}
            ]
        }}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                temperature=0.1,
                messages=[{"role": "user", "content": framework_prompt}]
            )
            
            result = self._parse_json_response(response.content[0].text)
            flag_data = result.get("compliance_flags", [])
            
            # Convert to ComplianceFlag objects
            flags = []
            for flag_info in flag_data:
                # Find the corresponding requirement
                req_id = flag_info.get("requirement_id")
                requirement = next((req for req in requirements if req.requirement_id == req_id), None)
                
                if requirement:
                    flag = ComplianceFlag(
                        requirement=requirement,
                        status=ComplianceLevel(flag_info.get("status", "unclear")),
                        risk_level=RiskLevel(flag_info.get("risk_level", "medium")),
                        details=flag_info.get("details", ""),
                        recommended_action=flag_info.get("recommended_action", ""),
                        regulatory_citation=flag_info.get("regulatory_citation")
                    )
                    flags.append(flag)
            
            return flags
            
        except Exception as e:
            logger.error(f"Framework compliance analysis failed for {framework.value}: {e}")
            return []

    def _calculate_compliance_score(self, flags: List[ComplianceFlag]) -> float:
        """Calculate overall compliance score from flags"""
        
        if not flags:
            return 0.5  # Neutral score if no flags
        
        total_weight = 0
        weighted_score = 0
        
        for flag in flags:
            # Weight mandatory requirements higher
            weight = 1.0 if flag.requirement.mandatory else 0.5
            
            # Score based on compliance level
            if flag.status == ComplianceLevel.COMPLIANT:
                score = 1.0
            elif flag.status == ComplianceLevel.NEEDS_REVIEW:
                score = 0.7
            elif flag.status == ComplianceLevel.UNCLEAR:
                score = 0.5
            else:  # NON_COMPLIANT
                score = 0.0
            
            # Adjust for risk level
            if flag.risk_level == RiskLevel.CRITICAL:
                score *= 0.5
            elif flag.risk_level == RiskLevel.HIGH:
                score *= 0.7
            
            weighted_score += score * weight
            total_weight += weight
        
        return weighted_score / total_weight if total_weight > 0 else 0.5

    async def _generate_compliance_recommendations(self, flags: List[ComplianceFlag]) -> List[str]:
        """Generate actionable compliance recommendations"""
        
        high_priority_flags = [
            flag for flag in flags 
            if flag.status in [ComplianceLevel.NON_COMPLIANT, ComplianceLevel.NEEDS_REVIEW]
            and flag.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
        ]
        
        if not high_priority_flags:
            return ["All critical compliance requirements appear to be met."]
        
        recommendation_prompt = f"""
        Generate actionable compliance recommendations based on these compliance issues:
        
        {json.dumps([{
            'requirement': flag.requirement.description,
            'status': flag.status.value,
            'risk': flag.risk_level.value,
            'details': flag.details,
            'action': flag.recommended_action
        } for flag in high_priority_flags], indent=2)}
        
        Provide prioritized recommendations as a JSON list:
        {{"recommendations": ["recommendation1", "recommendation2"]}}
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0.1,
                messages=[{"role": "user", "content": recommendation_prompt}]
            )
            
            result = self._parse_json_response(response.content[0].text)
            return result.get("recommendations", [])
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return [flag.recommended_action for flag in high_priority_flags if flag.recommended_action]

    def _extract_required_disclosures(self, flags: List[ComplianceFlag]) -> List[str]:
        """Extract required regulatory disclosures"""
        
        disclosure_flags = [
            flag for flag in flags 
            if flag.requirement.category == "disclosure"
            and flag.status != ComplianceLevel.COMPLIANT
        ]
        
        disclosures = []
        for flag in disclosure_flags:
            if "disclosure" in flag.recommended_action.lower():
                disclosures.append(flag.recommended_action)
            elif flag.requirement.description:
                disclosures.append(f"Required: {flag.requirement.description}")
        
        return disclosures

    def _extract_regulatory_warnings(self, flags: List[ComplianceFlag]) -> List[str]:
        """Extract critical regulatory warnings"""
        
        warning_flags = [
            flag for flag in flags 
            if flag.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
            and flag.status == ComplianceLevel.NON_COMPLIANT
        ]
        
        warnings = []
        for flag in warning_flags:
            warning_text = f"⚠️ {flag.requirement.framework.value.upper()}: {flag.details}"
            if flag.regulatory_citation:
                warning_text += f" (Citation: {flag.regulatory_citation})"
            warnings.append(warning_text)
        
        return warnings

    def _parse_json_response(self, response_text: str) -> Dict[str, any]:
        """Parse JSON from Claude's response"""
        try:
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {}
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from compliance analysis response")
            return {}

    async def quick_compliance_check(
        self,
        offering_amount: float,
        investor_type: str,
        business_sector: str
    ) -> Dict[str, any]:
        """Quick compliance framework recommendation"""
        
        recommendations = {}
        
        # SEC Regulation CF check
        if offering_amount <= 5_000_000 and "retail" in investor_type.lower():
            recommendations["sec_reg_cf"] = {
                "applicable": True,
                "description": "SEC Regulation Crowdfunding - suitable for retail investors up to $5M",
                "key_requirements": [
                    "Use registered funding portal",
                    "Investor limits apply",
                    "Disclosure requirements",
                    "Annual reporting"
                ]
            }
        
        # SEC Regulation D check
        if "accredited" in investor_type.lower():
            recommendations["sec_reg_d"] = {
                "applicable": True,
                "description": "SEC Regulation D - for accredited investors",
                "key_requirements": [
                    "Verify accredited status",
                    "File Form D",
                    "No general solicitation",
                    "Bad actor checks"
                ]
            }
        
        # Always include AML requirements
        recommendations["bsa_aml"] = {
            "applicable": True,
            "description": "Bank Secrecy Act / Anti-Money Laundering requirements",
            "key_requirements": [
                "Customer identification",
                "Suspicious activity monitoring",
                "Transaction recordkeeping"
            ]
        }
        
        return recommendations

# Export main classes
__all__ = [
    'RegulatoryComplianceEngine', 
    'ComplianceReport', 
    'ComplianceFlag', 
    'ComplianceFramework',
    'ComplianceLevel',
    'RiskLevel'
]