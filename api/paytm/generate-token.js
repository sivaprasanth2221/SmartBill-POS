// Paytm Token Generation API for Vercel Serverless Function
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { orderId, amount, merchantId } = req.body;

    // Validate required fields
    if (!orderId || !amount || !merchantId) {
      res.status(400).json({ 
        error: 'Missing required fields: orderId, amount, merchantId' 
      });
      return;
    }

    // Get merchant key from environment variables
    // In production, store this in Vercel environment variables
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    
    if (!merchantKey) {
      res.status(500).json({ 
        error: 'Paytm Merchant Key not configured. Please set PAYTM_MERCHANT_KEY in environment variables.' 
      });
      return;
    }

    // Paytm API endpoints
    const isProduction = process.env.PAYTM_ENVIRONMENT === 'production';
    const baseUrl = isProduction 
      ? 'https://securegw.paytm.in' 
      : 'https://securegw-stage.paytm.in';

    // Generate checksum for the transaction
    const paytmParams = {
      body: {
        requestType: 'Payment',
        mid: merchantId,
        websiteName: 'DEFAULT', // Change this to your website name from Paytm dashboard
        orderId: orderId,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5173'}/api/paytm/callback`,
        txnAmount: {
          value: amount.toString(),
          currency: 'INR',
        },
        userInfo: {
          custId: 'CUST_' + Date.now(),
        },
      },
    };

    // Generate checksum using Paytm's algorithm
    const checksum = generateChecksum(paytmParams.body, merchantKey);

    // Generate transaction token
    const tokenResponse = await fetch(`${baseUrl}/theia/api/v1/initiateTransaction?mid=${merchantId}&orderId=${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-checksum': checksum,
      },
      body: JSON.stringify(paytmParams.body),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Paytm API Error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to generate Paytm token',
        details: errorData 
      });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.body && tokenData.body.txnToken) {
      res.status(200).json({
        token: tokenData.body.txnToken,
        orderId: orderId,
        mid: merchantId,
      });
      return;
    } else {
      res.status(500).json({ 
        error: 'Invalid response from Paytm',
        details: tokenData 
      });
      return;
    }
  } catch (error) {
    console.error('Paytm token generation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
    return;
  }
}

// Generate Paytm checksum
function generateChecksum(params, merchantKey) {
  const string = JSON.stringify(params);
  const checksum = crypto
    .createHash('sha256')
    .update(string + merchantKey)
    .digest('hex');
  return checksum;
}

