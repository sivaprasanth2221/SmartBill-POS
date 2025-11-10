# Quick Start Guide - SmartBill POS Deployment

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SmartBill POS with Paytm integration"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Click **"Deploy"**

### Step 3: Configure Environment Variables

After deployment, go to **Settings** → **Environment Variables**:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `PAYTM_MERCHANT_KEY` | Your Paytm Merchant Key | Paytm Dashboard → API Keys |
| `PAYTM_ENVIRONMENT` | `staging` or `production` | Use `staging` for testing |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL | e.g., `https://your-app.vercel.app` |

### Step 4: Redeploy

After adding environment variables:
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment

### Step 5: Configure App

1. Open your deployed app
2. Go to **Settings** (⚙️ icon)
3. Enter your **Paytm Merchant ID**
4. Enter your **Paytm Merchant Key** (same as in Vercel)
5. Click **Save Settings**

## ✅ You're Done!

Your POS system is now live with Paytm integration!

## 🧪 Test Payment

1. Add products to cart
2. Click **Checkout**
3. Click **Pay with Paytm**
4. Complete test payment

## 📝 Notes

- Use Paytm **staging** environment for testing
- Switch to **production** when ready for live payments
- Configure callback URL in Paytm dashboard: `https://your-app.vercel.app/api/paytm/callback`

## 🆘 Need Help?

Check `DEPLOYMENT.md` for detailed instructions.

