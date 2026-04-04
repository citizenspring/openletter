'use strict';

const crypto = use('crypto');
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');

const Signature = use('App/Models/Signature');

// In-memory challenge store (short-lived, per-signature)
// In production with multiple dynos, consider Redis
const challengeStore = new Map();

// Clean up expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of challengeStore) {
    if (now - value.createdAt > 5 * 60 * 1000) {
      challengeStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

class PasskeyController {
  /**
   * Generate WebAuthn registration options for a signature
   * POST /passkey/register-options
   * Body: { signature_id }
   */
  async registerOptions({ request, response }) {
    const { signature_id } = request.only(['signature_id']);

    if (!signature_id) {
      return response.status(400).json({ error: 'Missing signature_id' });
    }

    const signature = await Signature.find(signature_id);
    if (!signature) {
      return response.status(404).json({ error: 'Signature not found' });
    }

    if (signature.is_verified) {
      return response.status(400).json({ error: 'Signature already verified' });
    }

    const rpName = 'Open Letter';
    const rpID = process.env.PASSKEY_RP_ID || 'openletter.earth';
    const userID = Buffer.from(String(signature.id));
    const userName = signature.getName(signature.name);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID,
      userName,
      userDisplayName: userName,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store challenge temporarily
    challengeStore.set(String(signature.id), {
      challenge: options.challenge,
      createdAt: Date.now(),
    });

    return options;
  }

  /**
   * Verify WebAuthn registration response and mark signature as verified
   * POST /passkey/register-verify
   * Body: { signature_id, credential }
   */
  async registerVerify({ request, response }) {
    const { signature_id, credential } = request.only(['signature_id', 'credential']);

    if (!signature_id || !credential) {
      return response.status(400).json({ error: 'Missing signature_id or credential' });
    }

    const signature = await Signature.find(signature_id);
    if (!signature) {
      return response.status(404).json({ error: 'Signature not found' });
    }

    if (signature.is_verified) {
      return response.status(400).json({ error: 'Signature already verified' });
    }

    const stored = challengeStore.get(String(signature.id));
    if (!stored) {
      return response.status(400).json({ error: 'No challenge found. Please try again.' });
    }

    // Challenge expires after 2 minutes
    if (Date.now() - stored.createdAt > 2 * 60 * 1000) {
      challengeStore.delete(String(signature.id));
      return response.status(400).json({ error: 'Challenge expired. Please try again.' });
    }

    const rpID = process.env.PASSKEY_RP_ID || 'openletter.earth';
    const expectedOrigin = process.env.PASSKEY_ORIGIN || 'https://openletter.earth';

    try {
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: stored.challenge,
        expectedOrigin,
        expectedRPID: rpID,
      });

      if (verification.verified) {
        signature.is_verified = true;
        signature.verification_method = 'passkey';
        signature.passkey_credential_id = verification.registrationInfo?.credential?.id || null;
        await signature.save();

        // Clean up challenge
        challengeStore.delete(String(signature.id));

        return { verified: true, signature: signature.toJSON() };
      } else {
        return response.status(400).json({ error: 'Verification failed' });
      }
    } catch (err) {
      console.error('Passkey verification error:', err);
      return response.status(400).json({ error: 'Verification failed: ' + err.message });
    }
  }
}

module.exports = PasskeyController;
