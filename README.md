# Multi-tenant Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant service that simulates how Xeno helps enterprise retailers onboard, integrate, and analyze their customer data from Shopify stores.

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Shopify       │────────▶│   Backend API   │────────▶│   PostgreSQL    │
│   Stores        │ Webhooks│   (Express.js)  │         │   (Supabase)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      │ REST API
                                      ▼
                            ┌─────────────────┐
                            │  Frontend       │
                            │  (Next.js)      │
                            └─────────────────┘
```

### Key Features

- **Multi-tenant Architecture** - Isolated data per Shopify store using tenant identifiers
- **Data Ingestion** - Syncs customers, orders, products, and custom events from Shopify
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

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Tenants
- `GET /api/tenants` - Get all tenants (requires auth)
- `GET /api/tenants/:id` - Get tenant by ID
- `POST /api/tenants` - Create new tenant
  ```json
  {
    "name": "My Store",
    "shopifyDomain": "mystore.myshopify.com",
    "shopifyAccessToken": "shpat_xxx",
    "shopifyApiKey": "xxx",
    "shopifyApiSecret": "xxx"
  }
  ```
- `POST /api/tenants/:id/sync` - Trigger manual data sync

### Insights
- `GET /api/insights/dashboard?tenantId=xxx&startDate=2024-01-01&endDate=2024-12-31`
  - Returns: totals (customers, orders, products, revenue), ordersByDate, topCustomers
- `GET /api/insights/orders?tenantId=xxx&startDate=...&endDate=...&page=1&limit=50`
  - Returns: paginated orders with customer info

**Note:** All insights endpoints require `x-tenant-id` header or `tenantId` query parameter.

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

## 📋 Known Limitations & Assumptions

1. **Authentication**: Currently uses simple demo authentication. In production, implement proper user management with database.
2. **Shopify OAuth**: Manual token entry for now. Full OAuth flow can be added.
3. **Webhooks**: Webhook endpoints not yet implemented. Can be added for real-time updates.
4. **Scheduler**: Cron job for automatic sync not included. Can use `node-cron` package.
5. **Error Handling**: Basic error handling. Production should have comprehensive error handling and logging.
6. **Pagination**: Orders endpoint has pagination, but other endpoints may need it for large datasets.

## 🚧 Future Enhancements

- [ ] Full Shopify OAuth flow
- [ ] Webhook endpoints for real-time updates
- [ ] Scheduled sync with cron jobs
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

