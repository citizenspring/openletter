/**
 * Check if the browser supports WebAuthn / passkeys
 */
export function isPasskeySupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

/**
 * Check if a platform authenticator (Touch ID, Face ID, Windows Hello, etc.) is available
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isPasskeySupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Register a passkey for a signature
 * @param {number} signatureId - The signature ID returned by the sign API
 * @returns {Promise<{verified: boolean, signature: object}>}
 */
export async function registerPasskey(signatureId) {
  // Dynamic import — this module is ESM-only and must never be required server-side
  const { startRegistration } = await import('@simplewebauthn/browser');

  // 1. Get registration options from the server
  const optionsRes = await fetch(`${process.env.API_URL}/passkey/register-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature_id: signatureId }),
  });

  if (!optionsRes.ok) {
    const err = await optionsRes.json();
    throw new Error(err.error || 'Failed to get passkey options');
  }

  const options = await optionsRes.json();

  // 2. Start WebAuthn registration (browser prompt)
  const credential = await startRegistration({ optionsJSON: options });

  // 3. Verify with the server
  const verifyRes = await fetch(`${process.env.API_URL}/passkey/register-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature_id: signatureId, credential }),
  });

  if (!verifyRes.ok) {
    const err = await verifyRes.json();
    throw new Error(err.error || 'Passkey verification failed');
  }

  return await verifyRes.json();
}
