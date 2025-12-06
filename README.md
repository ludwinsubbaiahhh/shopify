# Multi-tenant Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant service that simulates how Xeno helps enterprise retailers onboard, integrate, and analyze their customer data from Shopify stores.

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Shopify Stores                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Store A     │  │  Store B     │  │  Store C     │          │
│  │ (Tenant 1)   │  │ (Tenant 2)   │  │ (Tenant 3)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                     │
│                    REST API / Webhooks                          │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tenant Isolation Middleware                               │  │
│  │  - Extracts tenantId from request                          │  │
│  │  - Injects into all queries                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services Layer                                          │  │
│  │  - ShopifyService (API calls)                            │  │
│  │  - SyncService (Data ingestion)                          │  │
│  │  - SchedulerService (Cron jobs)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers                                             │  │
│  │  - TenantController                                      │  │
│  │  - InsightsController                                    │  │
│  │  - AuthController                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Tenant    │  │  Customer    │  │    Order     │         │
│  │  (Isolated) │  │  (tenantId)  │  │  (tenantId)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │   Product    │  │ CustomEvent  │                           │
│  │  (tenantId)  │  │  (tenantId)  │                           │
│  └──────────────┘  └──────────────┘                           │
│                                                                 │
│  All tables have tenantId for multi-tenant isolation           │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ REST API
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                    Frontend (Next.js)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                    │  │
│  │  - Login Page                                             │  │
│  │  - Dashboard Page                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components                                              │  │
│  │  - TenantSelector                                        │  │
│  │  - DashboardStats                                        │  │
│  │  - OrdersChart                                           │  │
│  │  - TopCustomers                                          │  │
│  │  - MonthlyRevenueChart                                   │  │
│  │  - OrderStatusChart                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Client (Axios)                                       │  │
│  │  - JWT token management                                   │  │
│  │  - Tenant context                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Components

1. **Shopify Stores**: Multiple tenant stores, each with their own domain and access token
2. **Backend API**: Express.js server with middleware for auth and tenant isolation
3. **Database**: PostgreSQL with Prisma ORM, all tables include `tenantId` for isolation
4. **Frontend**: Next.js React app with dashboard and visualization components
5. **Scheduler**: Node-cron for automatic hourly data sync

### Key Features

- **Multi-tenant Architecture** - Isolated data per Shopify store using tenant identifiers
- **Data Ingestion** - Syncs customers, orders, products from Shopify APIs, and custom events via webhooks
- **Insights Dashboard** - Visualize business metrics with charts and analytics
- **Date Range Filtering** - Filter orders and metrics by custom date ranges
- **Real-time Sync** - Manual sync trigger or scheduled sync (via cron)

## 📁 Project Structure

```
shopify/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database & Shopify config
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic (Shopify API, sync)
│   │   ├── models/         # Prisma models (auto-generated)
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Auth & tenant isolation
│   ├── prisma/             # Database schema & migrations
│   └── server.js           # Entry point
│
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   └── lib/           # API clients
│   └── package.json
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase PostgreSQL database (or local PostgreSQL)
- Shopify Partner account with development store

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
# Copy .env.example to .env and update with your credentials:
# - DATABASE_URL (Supabase connection string)
# - JWT_SECRET
# - SHOPIFY_API_VERSION

# Initialize database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3001`

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy Summary

- **Frontend**: Deploy to [Vercel](https://vercel.com) (automatic Next.js detection)
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
- **Database**: Already using Supabase PostgreSQL

### Required Environment Variables

**Backend:**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `JWT_SECRET` - Random secret string (32+ chars)
- `SHOPIFY_API_VERSION` - Shopify API version (e.g., `2024-10`)
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

## 📊 Database Schema

### Core Models

- **Tenant** - Shopify stores (multi-tenant isolation)
  - `id`, `name`, `shopifyDomain`, `shopifyAccessToken`, etc.

- **Customer** - Customer data from Shopify
  - `id`, `tenantId`, `shopifyId`, `email`, `totalSpent`, etc.

- **Order** - Order data from Shopify
  - `id`, `tenantId`, `shopifyId`, `customerId`, `totalPrice`, `orderDate`, etc.

- **Product** - Product data from Shopify
  - `id`, `tenantId`, `shopifyId`, `title`, `status`, etc.

- **CustomEvent** - Custom events (cart abandoned, checkout started)
  - `id`, `tenantId`, `eventType`, `customerId`, `metadata`, etc.

All models include `tenantId` for multi-tenant data isolation.

## 🔌 API Endpoints

### Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://shopify-insights-backend.onrender.com`

### Authentication Endpoints

#### `POST /api/auth/login`
Login with email/password (demo mode - accepts any credentials).

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/register`
Register new user (demo mode).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tenant Management Endpoints

All tenant endpoints require `Authorization: Bearer <token>` header.

#### `GET /api/tenants`
Get all tenants for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Store",
    "shopifyDomain": "mystore.myshopify.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### `GET /api/tenants/:id`
Get tenant by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "shopifyAccessToken": "shpat_xxx",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/tenants`
Create new tenant.

**Request:**
```json
{
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "shopifyAccessToken": "shpat_xxx",
  "shopifyApiKey": "xxx",
  "shopifyApiSecret": "xxx"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/tenants/:id/sync`
Trigger manual data sync for a tenant.

**Response:**
```json
{
  "message": "Sync completed",
  "results": {
    "customers": { "created": 10, "updated": 5 },
    "orders": { "created": 20, "updated": 3 },
    "products": { "created": 15, "updated": 2 }
  }
}
```

### Insights Endpoints

All insights endpoints require:
- `Authorization: Bearer <token>` header
- `tenantId` query parameter OR `x-tenant-id` header

#### `GET /api/insights/dashboard`
Get comprehensive dashboard insights.

**Query Parameters:**
- `tenantId` (required) - Tenant ID
- `startDate` (optional) - Filter start date (YYYY-MM-DD)
- `endDate` (optional) - Filter end date (YYYY-MM-DD)

**Response:**
```json
{
  "totals": {
    "customers": 100,
    "orders": 50,
    "products": 25,
    "revenue": 5000.00
  },
  "ordersByDate": [
    {
      "orderDate": "2024-01-01",
      "count": 5,
      "revenue": 500.00
    }
  ],
  "topCustomers": [
    {
      "id": "uuid",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "totalSpent": 1000.00,
      "ordersCount": 10
    }
  ],
  "averageOrderValue": 100.00,
  "revenueGrowth": 15.5,
  "orderStatusBreakdown": [
    { "financialStatus": "paid", "count": 40 },
    { "financialStatus": "pending", "count": 10 }
  ],
  "fulfillmentStatusBreakdown": [
    { "fulfillmentStatus": "fulfilled", "count": 35 },
    { "fulfillmentStatus": "unfulfilled", "count": 15 }
  ],
  "monthlyRevenue": [
    {
      "month": "2024-01-01",
      "orderCount": 50,
      "revenue": 5000.00
    }
  ]
}
```

#### `GET /api/insights/orders`
Get paginated orders with filtering.

**Query Parameters:**
- `tenantId` (required) - Tenant ID
- `startDate` (optional) - Filter start date
- `endDate` (optional) - Filter end date
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "shopifyId": "123",
      "orderNumber": "1001",
      "totalPrice": 100.00,
      "currency": "USD",
      "financialStatus": "paid",
      "fulfillmentStatus": "fulfilled",
      "orderDate": "2024-01-01T00:00:00Z",
      "customer": {
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### Custom Events Endpoints

All event endpoints require:
- `Authorization: Bearer <token>` header
- `tenantId` query parameter OR `x-tenant-id` header

#### `POST /api/events`
Create a custom event (cart abandoned, checkout started, etc.).

**Request:**
```json
{
  "eventType": "cart_abandoned",
  "customerId": "shopify_customer_id",
  "orderId": "shopify_order_id",
  "metadata": {
    "cartValue": 100.00,
    "items": 3
  }
}
```

**Valid eventTypes:**
- `cart_abandoned`
- `checkout_started`
- `checkout_completed`
- `product_viewed`

**Response:**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "eventType": "cart_abandoned",
  "customerId": "shopify_customer_id",
  "orderId": null,
  "metadata": {
    "cartValue": 100.00,
    "items": 3
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/events`
Get custom events for a tenant.

**Query Parameters:**
- `tenantId` (required) - Tenant ID
- `eventType` (optional) - Filter by event type
- `startDate` (optional) - Filter start date
- `endDate` (optional) - Filter end date

**Response:**
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "eventType": "cart_abandoned",
    "customerId": "shopify_customer_id",
    "orderId": null,
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Health Check

#### `GET /health`
Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Frontend Features

### Dashboard
- **Total Metrics**: Customers, Orders, Products, Revenue
- **Orders Chart**: Line chart showing orders and revenue over time
- **Top Customers**: Top 5 customers by total spend
- **Date Range Filter**: Filter all metrics by custom date range
- **Tenant Selector**: Switch between different Shopify stores
- **Manual Sync**: Trigger data sync from Shopify

### Authentication
- Simple email-based authentication
- JWT token stored in localStorage
- Protected routes

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios

## 📝 Usage Example

### 1. Create a Tenant

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Shopify Store",
    "shopifyDomain": "mystore.myshopify.com",
    "shopifyAccessToken": "shpat_xxx"
  }'
```

### 2. Sync Data

```bash
curl -X POST http://localhost:3000/api/tenants/TENANT_ID/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. View Insights

```bash
curl http://localhost:3000/api/insights/dashboard?tenantId=TENANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Security Notes

- JWT tokens for authentication
- Multi-tenant data isolation via `tenantId`
- Environment variables for sensitive data
- CORS configured for frontend

## 📋 Assumptions & Known Limitations

### Assumptions Made

1. **Authentication**: 
   - Assumed demo authentication is sufficient for MVP
   - Any email/password combination works for testing
   - Production would require proper user management with database storage

2. **Shopify Integration**:
   - Manual access token entry is acceptable for initial setup
   - Full OAuth flow can be implemented later for better UX
   - Shopify API version 2024-10 is used (can be updated)

3. **Data Sync**:
   - Polling-based sync (scheduled hourly) is acceptable
   - Webhooks would provide real-time updates but require additional infrastructure
   - Incremental sync is handled via upsert logic (idempotent operations)

4. **Multi-Tenancy**:
   - Single database with tenant isolation is sufficient
   - Separate databases per tenant would be more secure but less cost-effective
   - Tenant ID is always provided in requests (no tenant auto-detection)

5. **Database**:
   - PostgreSQL (Supabase) is used for all tenants
   - Database connection pooling is handled by Supabase
   - No sharding required for initial scale

6. **Custom Events**:
   - Custom events (cart abandoned, checkout started) require webhook implementation
   - Schema is ready, webhook endpoints can be added
   - For demo, events can be manually created via API

7. **Performance**:
   - Indexes on `tenantId` are sufficient for query performance
   - Pagination is implemented for large datasets
   - No caching layer assumed (Redis can be added)

### Known Limitations

1. **Authentication**: Simple demo authentication. Production needs proper user management.
2. **Shopify OAuth**: Manual token entry. Full OAuth flow can be added.
3. **Webhooks**: Webhook endpoints not yet implemented. Can be added for real-time updates.
4. **Error Handling**: Basic error handling. Production should have comprehensive error handling and logging.
5. **Pagination**: Orders endpoint has pagination, but other endpoints may need it for large datasets.
6. **Rate Limiting**: No rate limiting implemented. Shopify API has rate limits that should be respected.
7. **Data Validation**: Basic validation. Production should have comprehensive input validation.
8. **Monitoring**: No monitoring/alerting. Production should have logging, metrics, and alerts.

## 🚀 Next Steps to Productionize

### 1. Authentication & Authorization
- [ ] Implement proper user management with database
- [ ] Add role-based access control (RBAC)
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Implement session management

### 2. Shopify Integration
- [ ] Implement full OAuth flow for Shopify
- [ ] Add webhook endpoints for real-time updates:
  - `orders/create` - New order notifications
  - `orders/updated` - Order status changes
  - `customers/create` - New customer signups
  - `checkouts/create` - Checkout started events
  - `carts/create` - Cart abandoned events
- [ ] Add webhook signature verification
- [ ] Implement retry logic for failed webhooks

### 3. Data Sync & Performance
- [ ] Add Redis caching layer for frequently accessed data
- [ ] Implement incremental sync (only fetch changed data)
- [ ] Add rate limiting to respect Shopify API limits
- [ ] Implement queue system (RabbitMQ/Redis) for async processing
- [ ] Add data validation and sanitization

### 4. Monitoring & Observability
- [ ] Add comprehensive logging (Winston/Pino)
- [ ] Implement error tracking (Sentry)
- [ ] Add application metrics (Prometheus)
- [ ] Set up health checks and alerts
- [ ] Add performance monitoring (APM)

### 5. Security
- [ ] Implement rate limiting on API endpoints
- [ ] Add input validation and sanitization
- [ ] Implement CORS properly for production
- [ ] Add API key management
- [ ] Implement audit logging
- [ ] Add data encryption at rest

### 6. Scalability
- [ ] Implement database connection pooling
- [ ] Add read replicas for database
- [ ] Implement horizontal scaling for API
- [ ] Add CDN for frontend assets
- [ ] Implement database sharding if needed

### 7. Testing
- [ ] Add unit tests (Jest)
- [ ] Add integration tests
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Add load testing
- [ ] Implement CI/CD pipeline

### 8. Documentation
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add developer guide
- [ ] Add deployment runbooks
- [ ] Add troubleshooting guide

### 9. Features
- [ ] Export functionality (CSV, PDF, Excel)
- [ ] Advanced filtering and search
- [ ] Real-time notifications
- [ ] Custom report builder
- [ ] Data visualization enhancements
- [ ] Multi-currency support
- [ ] Timezone handling

## 🚧 Future Enhancements

- [x] Scheduled sync with cron jobs ✅
- [ ] Full Shopify OAuth flow
- [ ] Webhook endpoints for real-time updates
- [ ] User management system
- [ ] More advanced analytics and metrics
- [ ] Export functionality (CSV, PDF)
- [ ] Real-time notifications
- [ ] Advanced filtering and search

## 📚 Reference Links

- [Shopify App Template](https://github.com/Shopify/shopify-app-template-remix)
- [Shopify CLI Documentation](https://shopify.dev/docs/apps/build/cli-for-apps)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

ISC

---

Built to simulate Xeno's customer engagement platform for enterprise retailers.

