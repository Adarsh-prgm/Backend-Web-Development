// 'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Export handleWebhook(req, res), used by POST /webhooks in app.js.
// Also export _processedIds (your Set or Map) for test inspection/reset.
//
// Steps (in order):
//  1. Verify HMAC-SHA256 signature
//     - Signature header: req.headers['x-webhook-signature'] → 'sha256=<hex>'
//     - Compute: crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex')
//     - Compare: crypto.timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(received,'hex'))
//     - Mismatch or missing → res.status(401).json({ error: 'Invalid signature' })
//
//  2. Parse body: const event = JSON.parse(req.body)
//
//  3. Idempotency: if _processedIds.has(event.id) → res.status(200).json({ status: 'already_processed' })
//
//  4. Mark: _processedIds.add(event.id)
//
//  5. Acknowledge: res.status(200).json({ status: 'received' })
//     Then call handleEvent(event) inside setImmediate(() => { ... })

'use strict';

const crypto = require('crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  // Step 1: Read the signature and secret
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Step 2: Check whether required information exists
  if (!signature || !secret || !Buffer.isBuffer(req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Step 3: Generate the expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  // Step 4: Extract the received signature
  const receivedHex = signature.startsWith('sha256=')
    ? signature.slice(7)
    : '';

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(receivedHex, 'hex');

  // Step 5: Verify the signature
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !/^[a-fA-F0-9]{64}$/.test(receivedHex) ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Step 6: Parse the JSON body
  let event;

  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Step 7: Check for duplicate events
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Step 8: Store the event ID
  _processedIds.add(event.id);

  // Step 9: Respond immediately
  res.status(200).json({ status: 'received' });

  // Step 10: Process the event in the background
  setImmediate(() => {
    try {
      Promise.resolve(handleEvent(event)).catch((error) => {
        console.error('Webhook processing failed:', error);
      });
    } catch (error) {
      console.error('Webhook processing failed:', error);
    }
  });
}

module.exports = {
  handleWebhook,
  _processedIds,
};
