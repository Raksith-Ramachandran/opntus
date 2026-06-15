#!/bin/bash
# OPNTUS — Create Admin/Listener Account
# Usage: ./scripts/create-admin.sh
#
# Prerequisites: backend must be running or set BACKEND_URL

BACKEND_URL=${BACKEND_URL:-"http://localhost:5000"}

echo "╔════════════════════════════════════════╗"
echo "║     OPNTUS — Create Listener Account   ║"
echo "╚════════════════════════════════════════╝"
echo ""

read -p "Full Name:     " NAME
read -p "Email:         " EMAIL
read -s -p "Password:      " PASSWORD
echo ""
read -s -p "Admin Key:     " ADMIN_KEY
echo ""
echo ""

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/listener/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"adminKey\": \"$ADMIN_KEY\"
  }")

echo "Response: $RESPONSE"
echo ""
echo "✅ Done. Login at /listener/login"
