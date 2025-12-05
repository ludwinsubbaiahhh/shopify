# Quick Setup Guide

## Step 1: Backend Setup

```bash
cd backend
npm install
```

### Create `.env` file in `backend/` directory:

```env
PORT=3000
NODE_ENV=development

# Your Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres.tfotvxkxhmcuhrekghyc:Ludwin!123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15"

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Shopify API Version
SHOPIFY_API_VERSION=2025-10

# Optional: Scheduler settings
ENABLE_SCHEDULER=true
SYNC_CRON_EXPRESSION=0 * * * *
```

### Initialize Database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Start Backend:

```bash
npm run dev
```

Backend will run on `http://localhost:3000`

## Step 2: Frontend Setup

```bash
cd frontend
npm install
```

### Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Start Frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:3001`

## Step 3: Get Shopify Credentials

1. Go to your Shopify Partner Dashboard
2. Navigate to your app (Xeno Data Ingestion Service)
3. Get your **Client ID** and **Client Secret**
4. You'll also need an **Access Token** from your development store

## Step 4: Create Your First Tenant

### Option A: Via API

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Test Store",
    "shopifyDomain": "your-store.myshopify.com",
    "shopifyAccessToken": "shpat_xxxxx"
  }'
```

### Option B: Via Frontend (after login)

1. Login at `http://localhost:3001`
2. Use any email/password (demo mode)
3. Create tenant via API or add manually to database

## Step 5: Sync Data

Click "Sync Data" button in the dashboard, or:

```bash
curl -X POST http://localhost:3000/api/tenants/TENANT_ID/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Database Connection Issues
- Verify your Supabase connection string
- Check if your IP is whitelisted in Supabase
- Ensure database is accessible

### Prisma Issues
- Run `npm run prisma:generate` again
- Check `prisma/schema.prisma` for syntax errors
- Verify DATABASE_URL in `.env`

### Shopify API Issues
- Verify access token is valid
- Check API scopes are correct
- Ensure store domain is correct format

