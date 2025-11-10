// Paytm Payment Callback Handler for Vercel Serverless Function
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { ORDERID, TXNID, TXNAMOUNT, STATUS, RESPCODE, RESPMSG, BANKTXNID, GATEWAYNAME, BANKNAME, PAYMENTMODE, MID, TXNDATE, CHECKSUMHASH } = req.body;

    // Verify checksum
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    const checksumString = `CHECKSUMHASH=${CHECKSUMHASH}&GATEWAYNAME=${GATEWAYNAME}&RESPMSG=${RESPMSG}&BANKNAME=${BANKNAME}&PAYMENTMODE=${PAYMENTMODE}&MID=${MID}&RESPCODE=${RESPCODE}&TXNID=${TXNID}&TXNAMOUNT=${TXNAMOUNT}&ORDERID=${ORDERID}&STATUS=${STATUS}&BANKTXNID=${BANKTXNID}&TXNDATE=${TXNDATE}`;
    
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(checksumString + merchantKey)
      .digest('hex');

    if (calculatedChecksum !== CHECKSUMHASH) {
      res.status(400).json({ error: 'Invalid checksum' });
      return;
    }

    // Payment verification
    const isProduction = process.env.PAYTM_ENVIRONMENT === 'production';
    const baseUrl = isProduction 
      ? 'https://securegw.paytm.in' 
      : 'https://securegw-stage.paytm.in';

    const verifyParams = {
      MID: MID,
      ORDERID: ORDERID,
      CHECKSUMHASH: CHECKSUMHASH,
    };

    const verifyResponse = await fetch(`${baseUrl}/order/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyParams),
    });

    const verifyData = await verifyResponse.json();

    // Return payment status
    res.status(200).json({
      success: STATUS === 'TXN_SUCCESS',
      orderId: ORDERID,
      transactionId: TXNID,
      amount: TXNAMOUNT,
      status: STATUS,
      responseCode: RESPCODE,
      responseMessage: RESPMSG,
      bankTransactionId: BANKTXNID,
      gatewayName: GATEWAYNAME,
      bankName: BANKNAME,
      paymentMode: PAYMENTMODE,
      transactionDate: TXNDATE,
      verification: verifyData,
    });
    return;
  } catch (error) {
    console.error('Paytm callback error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
    return;
  }
}

