# Shopify Insights Frontend

Next.js frontend application for visualizing Shopify store data and insights.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Features

- **Email Authentication** - Simple login system
- **Multi-tenant Support** - Select and view data for different Shopify stores
- **Dashboard Insights**:
  - Total customers, orders, products, and revenue
  - Orders by date chart with revenue trends
  - Top 5 customers by spend
- **Date Range Filtering** - Filter orders and metrics by date range
- **Manual Sync** - Trigger data sync from Shopify

## Pages

- `/` - Login page
- `/dashboard` - Main insights dashboard

