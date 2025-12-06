# Quick Start Guide

## Your Shopify Credentials

**⚠️ IMPORTANT:** Replace these placeholders with your actual credentials from your Shopify app dashboard.

**Store Domain:** `your-store-name.myshopify.com`

**Client ID (API Key):** `YOUR_CLIENT_ID`

**Client Secret:** `YOUR_CLIENT_SECRET`

**Access Token:** `YOUR_ACCESS_TOKEN`

---

## Step 1: Create Your First Tenant

### Option A: Using cURL

```bash
# 1. First, login to get a JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Copy the "token" from the response, then:

# 2. Create tenant (replace YOUR_TOKEN with the token from step 1)
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Store",
    "shopifyDomain": "your-store-name.myshopify.com",
    "shopifyAccessToken": "YOUR_ACCESS_TOKEN",
    "shopifyApiKey": "YOUR_CLIENT_ID",
    "shopifyApiSecret": "YOUR_CLIENT_SECRET"
  }'
```

### Option B: Using Postman

1. **Login:**
   - POST to `http://localhost:3000/api/auth/login`
   - Body: `{"email": "admin@example.com", "password": "password"}`
   - Copy the `token` from response
n
2. **Create Tenant:**
   - POST to `http://localhost:3000/api/tenants`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body (JSON):
     ```json
     {
       "name": "Test Store",
       "shopifyDomain": "your-store-name.myshopify.com",
       "shopifyAccessToken": "YOUR_ACCESS_TOKEN",
       "shopifyApiKey": "YOUR_CLIENT_ID",
       "shopifyApiSecret": "YOUR_CLIENT_SECRET"
     }
     ```

---

## Step 2: Sync Data from Shopify

After creating the tenant, you'll get a tenant `id` in the response. Use it to sync:

```bash
# Replace TENANT_ID with the ID from step 1
curl -X POST http://localhost:3000/api/tenants/TENANT_ID/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Or use the "Sync Data" button in the frontend dashboard.

---

## Step 3: View Dashboard

1. Start frontend: `cd frontend && npm run dev`
2. Open: `http://localhost:3001`
3. Login with any email/password (demo mode)
4. Select your tenant and view insights!

---

## Important Notes

- **Access Token** is the only credential actually used by the code to fetch data
- **API Key & Secret** are stored but optional (for future OAuth implementation)
- Make sure your database tables are created (run the SQL in Supabase)
- Backend must be running on `http://localhost:3000`

