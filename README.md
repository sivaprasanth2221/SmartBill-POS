# SmartBill POS

A modern Point of Sale (POS) system with billing and inventory management, integrated with Paytm payment gateway.

## Features

- 🛒 **Point of Sale (POS)** - Quick checkout with product selection
- 📦 **Inventory Management** - Add, edit, delete products with stock tracking
- 📊 **Sales Reports** - View sales reports with date filters
- 💳 **Paytm Integration** - Secure payment processing via Paytm gateway
- 💾 **Local Storage** - All data stored locally in browser
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Payment**: Paytm Payment Gateway
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Paytm Merchant Account (for payment integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmartBill-POS
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional for local development):
```env
VITE_BACKEND_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Configuration

### Paytm Integration

1. **Get Paytm Credentials**:
   - Sign up for a Paytm Business account
   - Get your Merchant ID and Merchant Key from the Paytm dashboard

2. **Configure in App**:
   - Go to Settings in the app
   - Enter your Paytm Merchant ID
   - Enter your Paytm Merchant Key
   - Save settings

3. **Set Environment Variables in Vercel**:
   - `PAYTM_MERCHANT_KEY`: Your Paytm Merchant Key
   - `PAYTM_ENVIRONMENT`: `staging` or `production`
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel deployment URL

## Deployment to Vercel

### Step 1: Prepare for Deployment

1. Build the project:
```bash
npm run build
```

2. Verify the build output in the `dist` folder

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

### Step 3: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   - **PAYTM_MERCHANT_KEY**: Your Paytm Merchant Key
   - **PAYTM_ENVIRONMENT**: `staging` (for testing) or `production` (for live)
   - **NEXT_PUBLIC_BASE_URL**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

4. **Redeploy** after adding environment variables:
```bash
vercel --prod
```

### Step 4: Update Frontend Settings

1. After deployment, note your Vercel URL
2. In the app Settings, make sure Paytm credentials are configured
3. The app will automatically use the deployed API endpoints

## Project Structure

```
SmartBill-POS/
├── api/                    # Vercel serverless functions
│   └── paytm/
│       ├── generate-token.js  # Generate Paytm transaction token
│       └── callback.js        # Handle Paytm payment callbacks
├── src/
│   ├── App.jsx              # Main application component
│   ├── index.jsx            # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── vite.config.js          # Vite configuration
```

## API Endpoints

### POST `/api/paytm/generate-token`

Generates a Paytm transaction token for payment processing.

**Request Body**:
```json
{
  "orderId": "ORDER_1234567890",
  "amount": "100.00",
  "merchantId": "YOUR_MERCHANT_ID"
}
```

**Response**:
```json
{
  "token": "transaction_token_here",
  "orderId": "ORDER_1234567890",
  "mid": "YOUR_MERCHANT_ID"
}
```

### POST `/api/paytm/callback`

Handles Paytm payment callbacks and verifies payment status.

## Development

### Local Development

For local development, the API routes will work with Vercel CLI:

```bash
vercel dev
```

This will start a local server that mimics Vercel's serverless functions.

## Troubleshooting

### Payment Issues

1. **Token Generation Fails**:
   - Verify `PAYTM_MERCHANT_KEY` is set in Vercel environment variables
   - Check that `PAYTM_ENVIRONMENT` is set correctly
   - Ensure Merchant ID is correct in app settings

2. **Payment Not Processing**:
   - Verify Paytm credentials are correct
   - Check browser console for errors
   - Ensure callback URL is configured in Paytm dashboard

### Deployment Issues

1. **Build Fails**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors if using TS

2. **API Routes Not Working**:
   - Verify `vercel.json` configuration
   - Check that API files are in the correct location
   - Ensure environment variables are set

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

