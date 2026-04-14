#!/bin/bash

# EduConnect Production Deployment - Validation Script
# This script tests all critical endpoints and verifies the upgrade

set -e

echo "🧪 EduConnect Production Readiness Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000"
ADMIN_EMAIL="admin@educonnect.com"
ADMIN_PASSWORD="Gayatri@#\$123321"
TEST_UID="test_user_123"

# Temporary file for responses
TEMP_FILE="/tmp/educonnect_test.json"

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
test_endpoint() {
  local method=$1
  local endpoint=$2
  local body=$3
  local expected_code=$4
  local description=$5

  TESTS_RUN=$((TESTS_RUN + 1))

  echo -n "Testing: $description ... "

  if [ -z "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$body")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [[ "$http_code" == "$expected_code"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} ($http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$body" > "$TEMP_FILE"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_code, Got: $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo ""
}

test_admin_endpoint() {
  local method=$1
  local endpoint=$2
  local body=$3
  local expected_code=$4
  local description=$5
  local session_token=$6

  TESTS_RUN=$((TESTS_RUN + 1))

  echo -n "Testing: $description ... "

  if [ -z "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: $session_token" \
      -H "X-Admin-Session: $session_token" \
      -H "Email: $ADMIN_EMAIL")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: $session_token" \
      -H "X-Admin-Session: $session_token" \
      -H "Email: $ADMIN_EMAIL" \
      -d "$body")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [[ "$http_code" == "$expected_code"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} ($http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$body" > "$TEMP_FILE"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_code, Got: $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo ""
}

# ===== PHASE B TESTS =====

echo -e "${YELLOW}=== PHASE B: DEPLOYMENT VALIDATION ===${NC}"
echo ""

# 1. Health Check
echo "1️⃣  HEALTH CHECK"
echo "---"
test_endpoint "GET" "/" "200" "Server health check"

# 2. Admin Authentication
echo "2️⃣  ADMIN AUTHENTICATION"
echo "---"
test_endpoint "POST" "/api/admin/login" \
  "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}" \
  "200" \
  "Admin login with valid credentials"

# Extract session token
ADMIN_SESSION=$(jq -r '.data.sessionToken' "$TEMP_FILE" 2>/dev/null || echo "")
if [ -z "$ADMIN_SESSION" ] || [ "$ADMIN_SESSION" = "null" ]; then
  echo -e "${RED}⚠️  Failed to extract session token!${NC}"
  echo "Response: $(cat $TEMP_FILE)"
  ADMIN_SESSION="invalid_token_for_rest_of_tests"
fi
echo "Session Token: $ADMIN_SESSION"
echo ""

# 3. Protected Admin Routes
echo "3️⃣  PROTECTED ADMIN ROUTES"
echo "---"
test_admin_endpoint "GET" "/api/admin/stats" "" "200" \
  "Get admin dashboard stats" "$ADMIN_SESSION"

# 4. Error Handling - Invalid Credentials
echo "4️⃣  ERROR HANDLING & VALIDATION"
echo "---"
test_endpoint "POST" "/api/admin/login" \
  "{\"email\": \"admin@educonnect.com\", \"password\": \"wrong\"}" \
  "401" \
  "Reject invalid admin password"

# 5. Authorization - Missing Headers
echo "5️⃣  AUTHORIZATION CHECKS"
echo "---"
test_endpoint "GET" "/api/admin/stats" "" "401" \
  "Reject request without admin session"

# 6. Input Validation
echo "6️⃣  INPUT VALIDATION"
echo "---"
test_endpoint "POST" "/api/admin/login" \
  "{\"email\": \"\", \"password\": \"\"}" \
  "400" \
  "Reject empty credentials"

# 7. Response Format Standardization
echo "7️⃣  RESPONSE FORMAT VERIFICATION"
echo "---"
test_endpoint "GET" "/" "" "200" \
  "Health check returns standardized format"

# Verify response structure
response=$(cat "$TEMP_FILE")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Response has 'success' field${NC}"
else
  echo -e "${RED}✗ Response missing 'success' field${NC}"
fi

if echo "$response" | jq -e '.message' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Response has 'message' field${NC}"
else
  echo -e "${RED}✗ Response missing 'message' field${NC}"
fi
echo ""

# 8. Database Connection
echo "8️⃣  DATABASE CONNECTION"
echo "---"
test_admin_endpoint "GET" "/api/admin/stats" "" "200" \
  "Successfully connect to MongoDB and retrieve stats" "$ADMIN_SESSION"

# 9. Static Files
echo "9️⃣  STATIC FILE SERVING"
echo "---"
echo -n "Testing: Static uploads directory accessible ... "
if [ -d "uploads" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} (uploads directory not found)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# 10. Environment Configuration
echo "🔟 CONFIGURATION CHECK"
echo "---"
echo -n "Checking: .env file exists ... "
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -n "Checking: Utilities exist ... "
if [ -f "src/utils/response.js" ] && [ -f "src/utils/validators.js" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -n "Checking: Error handler middleware exists ... "
if [ -f "src/middleware/errorHandler.js" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Summary
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
echo "Total Tests Run: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED! Ready for deployment.${NC}"
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Review POSTMAN_COLLECTION.json for comprehensive testing"
  echo "2. Proceed to Phase A: Security Enhancement"
  echo "3. Apply authorization pattern to remaining controllers"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED! Fix issues before deploying.${NC}"
  exit 1
fi
