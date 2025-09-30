# Database Integration Testing Guide

## Overview
This document describes how to test the database integration functionality that was implemented.

## Features Implemented

### 1. Smart Database Connection
- **With DATABASE_URL**: Uses real Neon PostgreSQL database
- **Without DATABASE_URL**: Automatically falls back to mock data
- **On Database Errors**: Gracefully falls back to mock data with error logging

### 2. Complete API Integration
All API endpoints now support both database and mock data modes:

- `GET /api/categories` - List categories with optional type filtering
- `GET /api/accounts` - List accounts with archive filtering  
- `POST /api/accounts` - Create new accounts
- `PATCH /api/accounts/[id]` - Update accounts
- `DELETE /api/accounts/[id]` - Delete accounts
- `GET /api/transactions` - List transactions with multiple filters
- `POST /api/transactions` - Create new transactions
- `PATCH /api/transactions/[id]` - Update transactions
- `DELETE /api/transactions/[id]` - Delete transactions
- `GET /api/dashboard/metrics` - Get dashboard metrics with date filters
- `GET /api/reports/expenses-by-category` - Get expense reports by category

## Testing Instructions

### Prerequisites
```bash
npm install
npm run build  # Verify build succeeds
```

### Test 1: Mock Data Mode (No Database)
```bash
# Start development server (no DATABASE_URL set)
npm run dev

# Test categories filtering
curl "http://localhost:3000/api/categories?type=ingreso"
curl "http://localhost:3000/api/categories?type=gasto"

# Test accounts
curl "http://localhost:3000/api/accounts"

# Test transactions with filtering
curl "http://localhost:3000/api/transactions?type=gasto"

# Test dashboard metrics
curl "http://localhost:3000/api/dashboard/metrics"

# Test reports
curl "http://localhost:3000/api/reports/expenses-by-category"

# Test creating new records
curl -X POST "http://localhost:3000/api/accounts" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Account","type":"banco","balance":1000,"currency":"USD"}'

curl -X POST "http://localhost:3000/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{"account_id":"1","category_id":"6","type":"gasto","amount":"75.50","description":"Test expense","date":"2025-01-20"}'
```

### Test 2: Database Mode (With DATABASE_URL)
```bash
# Set up DATABASE_URL environment variable
export DATABASE_URL="postgresql://your-connection-string"

# Run database setup scripts first
# psql $DATABASE_URL -f scripts/01-create-tables.sql
# psql $DATABASE_URL -f scripts/02-seed-categories.sql

# Start development server
npm run dev

# Run same tests as above - should now use real database
```

### Test 3: Error Handling
```bash
# Set invalid DATABASE_URL to test fallback
export DATABASE_URL="postgresql://invalid-connection"

# Start server - should fall back to mock data with error logging
npm run dev

# Test endpoints - should work with mock data
curl "http://localhost:3000/api/categories"
```

## Key Implementation Details

### Database Query Functions
All database operations are centralized in `lib/db.ts`:
- `dbQueries.getCategories(type?)` - Fetch categories with optional filtering
- `dbQueries.getAccounts(includeArchived)` - Fetch accounts
- `dbQueries.createAccount(data)` - Create new account
- `dbQueries.getTransactions(filters)` - Fetch transactions with complex filtering
- `dbQueries.getDashboardMetrics(filters)` - Calculate dashboard metrics
- `dbQueries.getExpensesByCategory(filters)` - Generate expense reports

### Field Mapping
Database schema uses different field names than TypeScript types:
- DB: `category_type` → TS: `type`
- DB: `account_type` → TS: `type`  
- DB: `transaction_type` → TS: `type`
- DB: `transaction_date` → TS: `date`
- DB: `is_archived` (boolean) → TS: `is_archived` (boolean|number for compatibility)

### Error Handling Strategy
1. Check if `sql` connection exists (`process.env.DATABASE_URL`)
2. If exists, attempt database operation
3. On database error, log error and fall back to mock data
4. If no connection, use mock data directly
5. All endpoints remain functional regardless of database state

## Validation Results

✅ **Category filtering works correctly** - Both "ingreso" and "gasto" categories filter properly
✅ **Account management** - CRUD operations work in both modes  
✅ **Transaction handling** - Complex filtering and creation works
✅ **Dashboard metrics** - Real-time calculations update correctly
✅ **Reports generation** - Expense categorization and percentage calculations work
✅ **Graceful fallback** - No functionality is lost when database is unavailable
✅ **Build compatibility** - All changes compile successfully
✅ **Type safety** - No TypeScript errors with schema field mapping