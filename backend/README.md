# Shopify Data Ingestion Backend

Multi-tenant backend service for ingesting and managing Shopify store data.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env` file and update with your credentials:
- Database URL (Supabase PostgreSQL)
- JWT Secret
- Shopify API version

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Tenants
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/:id` - Get tenant by ID
- `POST /api/tenants` - Create new tenant
- `POST /api/tenants/:id/sync` - Trigger manual sync

### Insights
- `GET /api/insights/dashboard?tenantId=xxx&startDate=2024-01-01&endDate=2024-12-31` - Get dashboard metrics
- `GET /api/insights/orders?tenantId=xxx&startDate=2024-01-01&endDate=2024-12-31` - Get orders with filtering

**Note:** All insights endpoints require `x-tenant-id` header or `tenantId` query parameter.

## Database Schema

See `prisma/schema.prisma` for full schema definition.

Key models:
- **Tenant** - Shopify stores (multi-tenant isolation)
- **Customer** - Customer data from Shopify
- **Order** - Order data from Shopify
- **Product** - Product data from Shopify
- **CustomEvent** - Custom events (cart abandoned, checkout started, etc.)

