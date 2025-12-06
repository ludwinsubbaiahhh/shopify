# Deployment Guide

This guide will help you deploy the Shopify Data Ingestion & Insights Service to production.

## Architecture

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Node.js/Express API deployed on Railway or Render
- **Database**: PostgreSQL (Supabase)

---

## Prerequisites

1. GitHub repository with your code pushed
2. Vercel account (free tier available)
3. Railway or Render account (free tier available)
4. Supabase PostgreSQL database (already set up)

---

## Step 1: Deploy Backend

### Option A: Railway (Recommended)

1. **Sign up/Login**: Go to [railway.app](https://railway.app) and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect it's a Node.js project

3. **Configure Service**:
   - Set **Root Directory**: `backend`
   - Railway will use the `railway.json` configuration automatically

4. **Set Environment Variables**:
   - Go to your service → **Variables** tab
   - Add the following:
     ```
     DATABASE_URL=your-supabase-postgresql-connection-string
     JWT_SECRET=your-random-secret-string-min-32-chars
     SHOPIFY_API_VERSION=2024-10
     ENABLE_SCHEDULER=true
     NODE_ENV=production
     PORT=3000
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
   - **Note**: You'll update `FRONTEND_URL` after deploying the frontend

5. **Run Prisma Migrations**:
   - Go to your service → **Deployments** → Click on the latest deployment
   - Click **View Logs** → **Shell** tab
   - Run:
     ```bash
     npx prisma generate
     npx prisma migrate deploy
     ```

6. **Get Your Backend URL**:
   - Go to **Settings** → **Domains**
   - Railway provides a default domain like: `your-app.railway.app`
   - Copy this URL (you'll need it for frontend)

---

### Option B: Render

1. **Sign up/Login**: Go to [render.com](https://render.com) and sign in with GitHub

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   - **Name**: `shopify-insights-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   - Scroll to **Environment Variables** section
   - Add the same variables as Railway (see above)

5. **Run Prisma Migrations**:
   - After first deployment, go to **Shell** tab
   - Run:
     ```bash
     npx prisma migrate deploy
     ```

6. **Get Your Backend URL**:
   - Render provides a default URL like: `your-app.onrender.com`
   - Copy this URL

---

## Step 2: Deploy Frontend (Vercel)

1. **Sign up/Login**: Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Set Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
     (or your Render URL)

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Vercel will provide a URL like: `your-app.vercel.app`

---

## Step 3: Update CORS and Environment Variables

### Update Backend CORS

1. **Go back to Railway/Render**
2. **Update Environment Variables**:
   - Add/Update: `FRONTEND_URL=https://your-frontend.vercel.app`
3. **Redeploy** (or it will auto-redeploy)

### Update Frontend API URL (if needed)

If you need to change the backend URL:
1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_API_URL`
3. Redeploy

---

## Step 4: Verify Deployment

1. **Test Backend Health**:
   - Visit: `https://your-backend-url.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**:
   - Visit: `https://your-frontend.vercel.app`
   - Try logging in
   - Create a tenant
   - Sync data
   - View dashboard

---

## Environment Variables Summary

### Backend (Railway/Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT token signing | Random 32+ char string |
| `SHOPIFY_API_VERSION` | Shopify API version | `2024-10` |
| `ENABLE_SCHEDULER` | Enable automatic data sync | `true` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app` |

---

## Troubleshooting

### Backend Issues

1. **Database Connection Error**:
   - Verify `DATABASE_URL` is correct
   - Check Supabase connection settings
   - Ensure database is accessible from Railway/Render IPs

2. **Prisma Errors**:
   - Run `npx prisma generate` in deployment shell
   - Run `npx prisma migrate deploy` to apply migrations

3. **CORS Errors**:
   - Verify `FRONTEND_URL` is set correctly
   - Check backend logs for CORS errors
   - Temporarily set `ALLOW_ALL_ORIGINS=true` for testing

### Frontend Issues

1. **API Connection Error**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check browser console for errors
   - Ensure backend is running and accessible

2. **Build Errors**:
   - Check Vercel build logs
   - Verify all dependencies are in `package.json`
   - Ensure Node.js version is compatible (18+)

---

## Custom Domains (Optional)

### Backend Custom Domain

**Railway**:
- Go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

**Render**:
- Go to Settings → Custom Domains
- Add your custom domain
- Update DNS records

### Frontend Custom Domain

**Vercel**:
- Go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Monitoring & Logs

### Railway
- View logs: Service → Deployments → View Logs
- Monitor: Service → Metrics

### Render
- View logs: Service → Logs tab
- Monitor: Service → Metrics tab

### Vercel
- View logs: Project → Deployments → Click deployment → View Function Logs
- Monitor: Project → Analytics

---

## Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Railway/Render will auto-deploy
3. Check logs for any errors

### Frontend Updates
1. Push changes to GitHub
2. Vercel will auto-deploy
3. Check build logs

---

## Security Notes

1. **Never commit secrets** to GitHub
2. **Use environment variables** for all sensitive data
3. **Rotate JWT_SECRET** regularly in production
4. **Enable HTTPS** (automatic on Vercel, Railway, Render)
5. **Review CORS settings** - only allow your frontend domain

---

## Cost Estimates

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: Free tier includes $5 credit/month
- **Render**: Free tier available (with limitations)
- **Supabase**: Free tier includes 500MB database

For production use, consider upgrading to paid tiers.

---

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check database connectivity
5. Review CORS configuration

