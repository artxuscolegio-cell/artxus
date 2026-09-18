/**
 * pushNotificationService.ts
 *
 * Envía notificaciones push al admin via ntfy.sh.
 * Cuando hay una foto pendiente de moderación, la notificación incluye
 * botones de acción (✅ Aprobar / 🚫 Rechazar) que llaman a la
 * Vercel Function /api/moderate directamente desde el celular.
 *
 * Variables de entorno requeridas (VITE_* para el frontend):
 *   VITE_NTFY_TOPIC          — topic de ntfy (ej: artxus-admin-2026)
 *   VITE_MODERATE_ENDPOINT   — URL base de tu app en Vercel (ej: https://artxus.vercel.app)
 *   VITE_MODERATE_TOKEN      — token secreto que protege /api/moderate
 *
 * El admin debe instalar la app "ntfy" en su celular y suscribirse al topic.
 */

const NTFY_TOPIC         = import.meta.env.VITE_NTFY_TOPIC         || 'artxus-admin-notifs';
const NTFY_BASE          = 'https://ntfy.sh';
const MODERATE_ENDPOINT  = import.meta.env.VITE_MODERATE_ENDPOINT  || '';
const MODERATE_TOKEN     = import.meta.env.VITE_MODERATE_TOKEN     || '';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

/**
 * Builds the URL for the /api/moderate Vercel Function.
 */
function buildModerateUrl(action: 'approve' | 'reject', photoId: string): string {
  const base = MODERATE_ENDPOINT.replace(/\/$/, '');
  return `${base}/api/moderate?action=${action}&photoId=${encodeURIComponent(photoId)}&token=${encodeURIComponent(MODERATE_TOKEN)}`;
}

/**
 * Sends a push notification to the admin via ntfy.sh.
 *
 * If a `photoId` is provided AND the moderation endpoint is configured,
 * the notification will include two action buttons:
 *   ✅ Aprobar  → calls /api/moderate?action=approve&photoId=...
 *   🚫 Rechazar → calls /api/moderate?action=reject&photoId=...
 *
 * The admin taps the button and the photo is moderated instantly — no app needed.
 */
export async function sendAdminPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
  photoId?: string;
}) {
  const headers: Record<string, string> = {
    'Title': payload.title,
    'Content-Type': 'text/plain',
    'Click': payload.url || window.location.origin,
    'Priority': 'high',
    'Tags': 'art,camera,artxus',
  };

  // Add action buttons if photoId and moderation endpoint are configured
  if (payload.photoId && MODERATE_ENDPOINT && MODERATE_TOKEN) {
    const approveUrl = buildModerateUrl('approve', payload.photoId);
    const rejectUrl  = buildModerateUrl('reject',  payload.photoId);

    // ntfy Actions format: "http, Label, URL, method=POST; http, Label, URL, method=POST"
    headers['Actions'] = [
      `http, ✅ Aprobar, ${approveUrl}, method=GET, clear=true`,
      `http, 🚫 Rechazar, ${rejectUrl}, method=GET, clear=true`,
    ].join('; ');
  }

  try {
    await fetch(`${NTFY_BASE}/${NTFY_TOPIC}`, {
      method: 'POST',
      headers,
      body: payload.body,
    });
  } catch (e) {
    console.error('Push notification send error:', e);
  }
}

export function getNtfySubscribeUrl(): string {
  return `${NTFY_BASE}/${NTFY_TOPIC}`;
}
