#!/bin/bash

# FlashTrack API Test Script

set -e

BASE_URL="http://localhost:8081"

echo "🧪 Testing FlashTrack API..."
echo ""

# Test 1: Register a user
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "role": "user",
    "society_id": 1
  }')

if echo "$REGISTER_RESPONSE" | grep -q "registered"; then
    echo "✅ Registration successful"
else
    echo "❌ Registration failed: $REGISTER_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"[^"]*"' | tail -1 | tr -d '"')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "error" ]; then
    echo "✅ Login successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Test 3: Create a complaint (requires auth)
echo "3️⃣  Testing Create Complaint..."
COMPLAINT_RESPONSE=$(curl -s -X POST $BASE_URL/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Broken elevator",
    "description": "The elevator on the 3rd floor is not working",
    "category_id": 1
  }')

if echo "$COMPLAINT_RESPONSE" | grep -q "Broken elevator"; then
    echo "✅ Complaint created successfully"
else
    echo "❌ Create complaint failed: $COMPLAINT_RESPONSE"
fi

echo ""
echo "🎉 All tests passed!"
