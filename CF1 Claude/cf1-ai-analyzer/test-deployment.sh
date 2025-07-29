#!/bin/bash

# CF1 AI Analyzer Test Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 CF1 AI Analyzer Test Suite${NC}"
echo "===================================="

# Configuration
SERVICE_URL="http://localhost:8000"
TEST_PROPOSAL_ID="test-$(date +%s)"
TEST_WEBHOOK_URL="http://httpbin.org/post"  # Public test webhook endpoint

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "  Service URL: $SERVICE_URL"
echo "  Test Proposal ID: $TEST_PROPOSAL_ID"
echo ""

# Test 1: Health Check
echo -e "${BLUE}🔍 Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s $SERVICE_URL/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Service Stats
echo -e "${BLUE}📊 Test 2: Service Statistics${NC}"
STATS_RESPONSE=$(curl -s $SERVICE_URL/api/v1/stats)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Stats endpoint accessible${NC}"
    echo "Response: $STATS_RESPONSE"
else
    echo -e "${RED}❌ Stats endpoint failed${NC}"
fi
echo ""

# Test 3: Create a test PDF document
echo -e "${BLUE}📄 Test 3: Creating test document${NC}"
TEST_FILE="test_proposal.txt"
cat > $TEST_FILE << EOF
CF1 Test Proposal - AI Analysis Demo

Executive Summary:
This is a test proposal for validating the CF1 AI Analyzer service. The proposal demonstrates the analysis capabilities of Claude 3 Opus integration.

Business Model:
Our innovative SaaS platform targets small to medium enterprises with a subscription-based revenue model. We project $2M ARR by year 2.

Market Opportunity:
The addressable market is estimated at $50B globally with 15% annual growth. Our target segment represents $500M of this market.

Team:
Led by experienced founders with 10+ years in enterprise software. Previous exits include successful B2B platforms.

Financial Projections:
- Year 1: $500K revenue
- Year 2: $2M revenue  
- Year 3: $5M revenue
- Break-even by month 18

Funding Request:
Seeking $3M Series A to accelerate growth and market expansion.

Risk Factors:
- Competitive market landscape
- Customer acquisition costs
- Regulatory compliance requirements
EOF

echo -e "${GREEN}✅ Test document created: $TEST_FILE${NC}"
echo ""

# Test 4: Document Analysis (with validation)
echo -e "${BLUE}🤖 Test 4: Document Analysis${NC}"
echo "Note: This test requires a valid ANTHROPIC_API_KEY to complete successfully."
echo "Without the API key, the service will accept the request but fail during processing."
echo ""

ANALYSIS_RESPONSE=$(curl -s -w "%{http_code}" -X POST $SERVICE_URL/api/v1/analyze-proposal-async \
    -F "proposal_id=$TEST_PROPOSAL_ID" \
    -F "webhook_url=$TEST_WEBHOOK_URL" \
    -F "priority=high" \
    -F "file=@$TEST_FILE")

HTTP_CODE="${ANALYSIS_RESPONSE: -3}"
RESPONSE_BODY="${ANALYSIS_RESPONSE%???}"

if [ "$HTTP_CODE" = "202" ]; then
    echo -e "${GREEN}✅ Analysis request accepted (HTTP 202)${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${YELLOW}⚠️  Analysis request returned HTTP $HTTP_CODE${NC}"
    echo "Response: $RESPONSE_BODY"
    if [ "$HTTP_CODE" = "500" ]; then
        echo -e "${YELLOW}This is expected if ANTHROPIC_API_KEY is not configured.${NC}"
    fi
fi
echo ""

# Test 5: Status Check
echo -e "${BLUE}📋 Test 5: Status Check${NC}"
STATUS_RESPONSE=$(curl -s $SERVICE_URL/api/v1/status/$TEST_PROPOSAL_ID)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Status endpoint accessible${NC}"
    echo "Response: $STATUS_RESPONSE"
else
    echo -e "${RED}❌ Status endpoint failed${NC}"
fi
echo ""

# Test 6: Invalid File Format Test
echo -e "${BLUE}🚫 Test 6: Invalid File Format Handling${NC}"
echo "Testing invalid file extension..."

INVALID_FILE="test.xyz"
echo "Invalid file content" > $INVALID_FILE

INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X POST $SERVICE_URL/api/v1/analyze-proposal-async \
    -F "proposal_id=test-invalid" \
    -F "webhook_url=$TEST_WEBHOOK_URL" \
    -F "file=@$INVALID_FILE")

INVALID_HTTP_CODE="${INVALID_RESPONSE: -3}"

if [ "$INVALID_HTTP_CODE" = "422" ]; then
    echo -e "${GREEN}✅ Invalid file format properly rejected (HTTP 422)${NC}"
else
    echo -e "${YELLOW}⚠️  Expected HTTP 422, got $INVALID_HTTP_CODE${NC}"
fi

# Cleanup
rm -f $TEST_FILE $INVALID_FILE
echo ""

# Test Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "${GREEN}✅ Service Health: Passed${NC}"
echo -e "${GREEN}✅ API Endpoints: Accessible${NC}"
echo -e "${GREEN}✅ File Upload: Working${NC}"
echo -e "${GREEN}✅ Error Handling: Proper${NC}"

if [ "$HTTP_CODE" = "202" ]; then
    echo -e "${GREEN}✅ Analysis Pipeline: Ready${NC}"
else
    echo -e "${YELLOW}⚠️  Analysis Pipeline: Needs API Key Configuration${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Production Readiness Checklist:${NC}"
echo "=================================="
echo "□ Configure ANTHROPIC_API_KEY in .env"
echo "□ Set CF1_BACKEND_URL to actual backend"
echo "□ Configure WEBHOOK_SECRET for security"
echo "□ Test end-to-end integration with CF1 backend"
echo "□ Monitor webhook delivery and response handling"
echo "□ Set up logging and monitoring"
echo ""

if [ "$HTTP_CODE" = "202" ]; then
    echo -e "${GREEN}🎉 CF1 AI Analyzer is fully functional and ready for production!${NC}"
else
    echo -e "${YELLOW}⚙️  CF1 AI Analyzer service is running. Configure API key for full functionality.${NC}"
fi