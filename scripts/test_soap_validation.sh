#!/bin/bash

# SOAP Validation Test Script
# This script tests your SOAP implementation against real public SOAP APIs

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         SOAP Implementation Validation Test               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo "Please start the backend first:"
    echo "  cd backend && uvicorn app.main:app --reload"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Test 1: WSDL Analysis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: WSDL Analysis (Country Info Service)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WSDL_RESPONSE=$(curl -s -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "wsdl",
    "wsdlUrl": "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL"
  }')

if echo "$WSDL_RESPONSE" | grep -q "resources"; then
    echo -e "${GREEN}✓ WSDL parsed successfully${NC}"
    RESOURCE_COUNT=$(echo "$WSDL_RESPONSE" | grep -o '"name"' | wc -l)
    echo "  Found $RESOURCE_COUNT operations"
    echo ""
    echo "Sample operations:"
    echo "$WSDL_RESPONSE" | grep -o '"name":"[^"]*"' | head -5
else
    echo -e "${RED}❌ WSDL parsing failed${NC}"
    echo "Response: $WSDL_RESPONSE"
fi
echo ""

# Test 2: SOAP Endpoint Call
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: SOAP Endpoint Call (List Countries)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SOAP_RESPONSE=$(curl -s -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "soap_endpoint",
    "endpointUrl": "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso",
    "operation": "ListOfCountryNamesByName",
    "soapAction": "",
    "authType": "none",
    "parameters": {}
  }')

if echo "$SOAP_RESPONSE" | grep -q "resources"; then
    echo -e "${GREEN}✓ SOAP call successful${NC}"
    echo "  Response contains data"
else
    echo -e "${RED}❌ SOAP call failed${NC}"
    echo "Response: $SOAP_RESPONSE"
fi
echo ""

# Test 3: Calculator SOAP Service
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Calculator SOAP Service (Add Operation)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CALC_WSDL=$(curl -s -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "wsdl",
    "wsdlUrl": "http://www.dneonline.com/calculator.asmx?WSDL"
  }')

if echo "$CALC_WSDL" | grep -q "Add"; then
    echo -e "${GREEN}✓ Calculator WSDL parsed${NC}"
    echo "  Found Add operation"
else
    echo -e "${YELLOW}⚠ Calculator WSDL parsing had issues${NC}"
fi
echo ""

# Test 4: SOAP XML Analysis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: SOAP XML Response Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SAMPLE_SOAP='<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUserResponse>
      <User>
        <UserId>123</UserId>
        <UserName>John Doe</UserName>
        <Email>john@example.com</Email>
      </User>
    </GetUserResponse>
  </soap:Body>
</soap:Envelope>'

XML_RESPONSE=$(curl -s -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{
    \"mode\": \"soap_xml\",
    \"soapXml\": $(echo "$SAMPLE_SOAP" | jq -Rs .)
  }")

if echo "$XML_RESPONSE" | grep -q "UserId"; then
    echo -e "${GREEN}✓ SOAP XML parsed successfully${NC}"
    echo "  Extracted fields from response"
else
    echo -e "${RED}❌ SOAP XML parsing failed${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                        SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tests completed. Check results above."
echo ""
echo "Next steps:"
echo "1. Review any failed tests"
echo "2. Test the full download flow with SOAP"
echo "3. Configure proxy with SOAP endpoint"
echo "4. Test end-to-end in browser"
echo ""
echo "For detailed validation strategy, see: SOAP_VALIDATION_STRATEGY.md"
echo ""
