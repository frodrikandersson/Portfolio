# Deployment Guide

This project uses:
- **Frontend**: Vercel
- **Backend**: Render (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Storage**: Cloudflare R2 (free tier)
- **Domain**: Namecheap

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 tier)
3. Create a database user with read/write permissions
4. Add `0.0.0.0/0` to Network Access (allows Render to connect)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

---

## 2. Render Backend Deployment

### Initial Setup

1. Go to [Render](https://render.com) and create an account
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `quilcount-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Environment Variables

Add these in Render dashboard → Environment:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `MONGO_DB_NAME` | `QuilCount` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `CORS_ORIGIN` | `https://quilcount.store` |
| `FRONTEND_URL` | `https://quilcount.store` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret (add after webhook setup) |
| `R2_ENDPOINT` | `https://[account-id].r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Your R2 access key |
| `R2_SECRET_ACCESS_KEY` | Your R2 secret key |
| `R2_BUCKET_NAME` | `quilcount` (or your bucket name) |
| `R2_PUBLIC_URL` | Your R2 public URL (see R2 setup below) |

### Get Your Render URL

After deployment, Render provides a URL like `https://quilcount-api.onrender.com`. You'll need this for the frontend.

### Important: Free Tier Behavior

Render's free tier spins down after 15 minutes of inactivity. The first request after sleeping takes ~30 seconds to wake up. This is normal for free tier.

---

## 2.5 Cloudflare R2 Setup (Image Storage)

R2 provides persistent image storage with a generous free tier (10GB storage, 10M requests/month).

### If You Already Have R2 (e.g., from arkom.ink)

You can reuse your existing R2 setup - just create a new bucket for quilcount.

### Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **R2 Object Storage** in the sidebar
3. Click **Create bucket**
4. Name it `quilcount` (or similar)
5. Click **Create bucket**

### Enable Public Access

1. In your bucket, go to **Settings**
2. Under **Public access**, click **Allow Access**
3. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)
4. This is your `R2_PUBLIC_URL`

### Create API Token

1. Go to R2 → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name like `quilcount-backend`
4. Permissions: **Object Read & Write**
5. Specify bucket: `quilcount`
6. Click **Create API Token**
7. Copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

### Get Account ID

Your R2 endpoint URL uses your account ID:
1. Go to Cloudflare Dashboard
2. Click any domain, or go to **Workers & Pages**
3. Your Account ID is in the right sidebar
4. Endpoint: `https://[account-id].r2.cloudflarestorage.com`

---

## 3. Vercel Frontend Deployment

### Initial Setup

1. Go to [Vercel](https://vercel.com) and create a new project
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Framework preset: Vite

### Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://quilcount-api.onrender.com` (your Render URL) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |

### Build Settings

These should be auto-detected, but verify:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## 4. Domain Setup (Namecheap)

### For Frontend (Vercel)

1. In Vercel dashboard → Settings → Domains → Add `quilcount.store`
2. In Namecheap → Domain List → Manage → Advanced DNS:
   - Add A record: Host `@` → Value `76.76.21.21`
   - Add CNAME record: Host `www` → Value `cname.vercel-dns.com`

### For Backend (Render) - Custom Subdomain

1. In Render dashboard → Your service → Settings → Custom Domains
2. Add `api.quilcount.store`
3. Render will show you a CNAME target (like `xxx.onrender.com`)
4. In Namecheap → Advanced DNS:
   - Add CNAME record: Host `api` → Value `[your-render-cname-target]`

### Update Environment Variables After Domain Setup

- **Render**: Already set to `https://quilcount.store`
- **Vercel**: Update `VITE_API_URL` to `https://api.quilcount.store`

---

## 5. Stripe Webhook Setup

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://api.quilcount.store/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to Render env: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

---

## 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to **Authorized JavaScript origins**:
   - `https://quilcount.store`
   - `https://www.quilcount.store`
5. Add to **Authorized redirect URIs**:
   - `https://quilcount.store`
6. Save

---

## Deployment Order

1. ✅ MongoDB Atlas - create cluster
2. ✅ Cloudflare R2 - create bucket, get credentials
3. ✅ Render - deploy backend, add all env vars (including R2)
4. ✅ Vercel - deploy frontend with Render URL
5. ✅ Namecheap - configure DNS for both domains
6. ✅ Update Vercel `VITE_API_URL` to `https://api.quilcount.store`
7. ✅ Stripe - create webhook, add secret to Render
8. ✅ Google OAuth - add domains to authorized origins

---

## Deployment Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Cloudflare R2 bucket created with public access
- [ ] R2 API token created with read/write permissions
- [ ] Render service created with backend deployed
- [ ] Render environment variables set (including R2)
- [ ] Vercel project created with frontend deployed
- [ ] Vercel environment variables set
- [ ] Custom domains configured (quilcount.store + api.quilcount.store)
- [ ] Namecheap DNS records added
- [ ] Stripe webhook endpoint created
- [ ] Google OAuth origins updated
- [ ] Test login works
- [ ] Test image upload works
- [ ] Test product purchase works

---

## Troubleshooting

### Backend Takes Long to Respond
This is normal for Render free tier. After 15 min of inactivity, the first request takes ~30s. Subsequent requests are fast.

### CORS Errors
- Ensure `CORS_ORIGIN` in Render matches exactly: `https://quilcount.store`
- No trailing slash
- Check browser console for the exact origin being blocked

### Cookies Not Working
- Verify `NODE_ENV=production` is set in Render
- Ensure both frontend and backend use HTTPS
- Cross-origin cookies require `sameSite: 'none'` (already configured)

### Images Not Loading
- Check R2 environment variables are set correctly in Render
- Verify R2 bucket has public access enabled
- Check R2_PUBLIC_URL matches your bucket's public URL
- Check Render logs for R2 upload errors

### Database Connection Failed
- Ensure MongoDB Atlas Network Access includes `0.0.0.0/0`
- Verify connection string is correct (no extra spaces)
- Check Render logs for specific error

### Google Login Not Working
- Ensure `quilcount.store` is in authorized origins
- Check browser console for OAuth errors
- Verify `VITE_GOOGLE_CLIENT_ID` matches `GOOGLE_CLIENT_ID`
