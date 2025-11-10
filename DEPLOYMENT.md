# Deployment Guide for SmartBill POS

## Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Paytm Merchant Account

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the project settings
5. Click **"Deploy"**

#### 3. Configure Environment Variables

After deployment, go to **Settings** → **Environment Variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `PAYTM_MERCHANT_KEY` | Your Paytm Merchant Key | Get from Paytm dashboard |
| `PAYTM_ENVIRONMENT` | `staging` or `production` | Use `staging` for testing |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL | e.g., `https://your-app.vercel.app` |

#### 4. Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment
- Or push a new commit to trigger auto-deployment

#### 5. Configure Paytm in App

1. Open your deployed app
2. Go to **Settings**
3. Enter your **Paytm Merchant ID**
4. Enter your **Paytm Merchant Key** (same as in Vercel env vars)
5. Save settings

## Testing the Deployment

### Test Payment Flow

1. Add products to cart
2. Click **Checkout**
3. Click **Pay with Paytm**
4. You should be redirected to Paytm payment page
5. Use Paytm test credentials to complete payment

### Verify API Endpoints

Test the API endpoints:

```bash
# Test token generation
curl -X POST https://your-app.vercel.app/api/paytm/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_TEST_123",
    "amount": "100.00",
    "merchantId": "YOUR_MERCHANT_ID"
  }'
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Paytm credentials configured in app
- [ ] `PAYTM_ENVIRONMENT` set to `production`
- [ ] Callback URL configured in Paytm dashboard
- [ ] Test payment flow works
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Domain configured (optional)

## Paytm Dashboard Configuration

1. **Login to Paytm Business Dashboard**
2. **Go to Settings** → **Payment Gateway**
3. **Add Callback URL**: `https://your-app.vercel.app/api/paytm/callback`
4. **Save changes**

## Troubleshooting

### API Returns 500 Error

- Check environment variables are set correctly
- Verify Paytm Merchant Key is correct
- Check Vercel function logs

### Payment Not Redirecting

- Verify Paytm credentials in app settings
- Check browser console for errors
- Ensure callback URL is configured in Paytm dashboard

### Build Fails

- Check Node.js version (18+ required)
- Verify all dependencies in package.json
- Check Vercel build logs for specific errors

## Monitoring

### Vercel Analytics

- View deployment logs in Vercel dashboard
- Monitor API function execution
- Check error rates and response times

### Paytm Dashboard

- Monitor transaction status
- View payment reports
- Check for failed transactions

## Support

For deployment issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Check Paytm integration documentation