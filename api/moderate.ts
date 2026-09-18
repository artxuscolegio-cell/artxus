/**
 * api/moderate.ts — Vercel Serverless Function
 *
 * Called by ntfy.sh action buttons when the admin taps ✅ Aprobar or 🚫 Rechazar
 * on the push notification in their phone.
 *
 * Expected query params:
 *   action  = "approve" | "reject"
 *   photoId = Appwrite document ID
 *   token   = secret token (must match MODERATE_TOKEN env var)
 *
 * Environment variables required in Vercel dashboard:
 *   MODERATE_TOKEN                         — secret token to authenticate requests
 *   APPWRITE_ENDPOINT                      — e.g. https://nyc.cloud.appwrite.io/v1
 *   APPWRITE_DATABASE_ID                   — Appwrite database ID
 *   APPWRITE_PHOTOS_COLLECTION_ID          — Appwrite photos collection ID
 *   APPWRITE_API_KEY                       — Appwrite server-side API key (with write access)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const APPWRITE_ENDPOINT     = process.env.APPWRITE_ENDPOINT     || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_DATABASE_ID  = process.env.APPWRITE_DATABASE_ID  || '';
const PHOTOS_COLLECTION_ID  = process.env.APPWRITE_PHOTOS_COLLECTION_ID || 'photos';
const APPWRITE_API_KEY      = process.env.APPWRITE_API_KEY      || '';
const MODERATE_TOKEN        = process.env.MODERATE_TOKEN        || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET and POST (ntfy sends GET for view actions, POST for http actions)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, photoId, token } = req.method === 'POST'
    ? { ...req.query, ...(req.body || {}) }
    : req.query;

  // ── Security: validate token ──
  if (!MODERATE_TOKEN || token !== MODERATE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!photoId || typeof photoId !== 'string') {
    return res.status(400).json({ error: 'Missing photoId' });
  }

  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject".' });
  }

  const docUrl = `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections/${PHOTOS_COLLECTION_ID}/documents/${photoId}`;

  try {
    if (action === 'approve') {
      // ── APPROVE: update status to approved ──
      const patchRes = await fetch(docUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || '',
          'X-Appwrite-Key': APPWRITE_API_KEY,
        },
        body: JSON.stringify({ status: 'approved', rejectionReason: '' }),
      });

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        console.error('Appwrite PATCH error (approve):', errText);
        return res.status(502).json({ error: 'Failed to approve photo', detail: errText });
      }

      console.log(`✅ Photo ${photoId} approved via push notification.`);
      return res.status(200).json({ ok: true, action: 'approved', photoId });

    } else {
      // ── REJECT: update status then delete document ──
      const defaultReason = 'No cumple las normas de la comunidad.';

      // First mark as rejected (so realtime subscribers see the change before deletion)
      await fetch(docUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || '',
          'X-Appwrite-Key': APPWRITE_API_KEY,
        },
        body: JSON.stringify({ status: 'rejected', rejectionReason: defaultReason }),
      });

      // Then delete the document
      const deleteRes = await fetch(docUrl, {
        method: 'DELETE',
        headers: {
          'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || '',
          'X-Appwrite-Key': APPWRITE_API_KEY,
        },
      });

      if (!deleteRes.ok && deleteRes.status !== 404) {
        const errText = await deleteRes.text();
        console.error('Appwrite DELETE error (reject):', errText);
        return res.status(502).json({ error: 'Failed to delete photo', detail: errText });
      }

      console.log(`🚫 Photo ${photoId} rejected and deleted via push notification.`);
      return res.status(200).json({ ok: true, action: 'rejected', photoId });
    }

  } catch (err: any) {
    console.error('Moderate handler error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message });
  }
}
