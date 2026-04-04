'use strict';

const crypto = use('crypto');
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');

const Signature = use('App/Models/Signature');

/**
 * Derive a deterministic challenge from signature context + server secret.
 * No need to store challenges server-side.
 */
function deriveChallenge(signatureId, letterSlug, signatureName) {
  const data = `passkey-challenge:${letterSlug}:${signatureName || 'anonymous'}:${signatureId}:${process.env.APP_KEY}`;
  return crypto.createHash('sha256').update(data).digest('base64url');
}

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

    const signature = await Signature.query()
      .where('id', signature_id)
      .with('letter')
      .first();

    if (!signature) {
      return response.status(404).json({ error: 'Signature not found' });
    }

    if (signature.is_verified) {
      return response.status(400).json({ error: 'Signature already verified' });
    }

    const letter = signature.getRelated('letter');
    const rpName = 'Open Letter';
    const rpID = process.env.PASSKEY_RP_ID || 'openletter.earth';
    const userID = Buffer.from(String(signature.id));
    const userName = signature.getName(signature.name);

    const challenge = deriveChallenge(signature.id, letter ? letter.slug : '', signature.name);

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
      challenge,
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

    const signature = await Signature.query()
      .where('id', signature_id)
      .with('letter')
      .first();

    if (!signature) {
      return response.status(404).json({ error: 'Signature not found' });
    }

    if (signature.is_verified) {
      return response.status(400).json({ error: 'Signature already verified' });
    }

    const letter = signature.getRelated('letter');
    const expectedChallenge = deriveChallenge(signature.id, letter ? letter.slug : '', signature.name);
    const rpID = process.env.PASSKEY_RP_ID || 'openletter.earth';
    const expectedOrigin = process.env.PASSKEY_ORIGIN || 'https://openletter.earth';

    try {
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
      });

      if (verification.verified) {
        signature.is_verified = true;
        signature.verification_method = 'passkey';
        signature.passkey_credential_id = verification.registrationInfo?.credential?.id || null;
        await signature.save();

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
