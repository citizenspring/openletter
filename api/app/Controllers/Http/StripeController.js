'use strict'

const Letter = use('App/Models/Letter')

const PRICE_CENTS = 1000 // €10.00

function getStripe () {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

class StripeController {
  /**
   * Verify payment status by checking the Stripe session directly.
   * Called when user returns from Stripe Checkout.
   *
   * POST /letters/:slug/verify-payment
   * Body: { token } (letter edit token for auth)
   */
  async verifyPayment ({ request, params }) {
    const { token } = request.only(['token'])

    const letter = await Letter.query()
      .where('slug', params.slug)
      .where('letter_type', 'invite_only')
      .first()

    if (!letter) {
      return { error: { code: 404, message: 'Letter not found' } }
    }

    if (token !== letter.token) {
      return { error: { code: 403, message: 'Unauthorized' } }
    }

    if (letter.is_paid) {
      return { paid: true }
    }

    if (!letter.stripe_session_id) {
      return { paid: false, message: 'No checkout session found' }
    }

    // Check payment status with Stripe
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(letter.stripe_session_id)

    if (session.payment_status === 'paid') {
      // Activate all locale versions
      await Letter.query()
        .where('slug', letter.slug)
        .where('letter_type', 'invite_only')
        .update({ is_paid: true })

      return { paid: true }
    }

    return { paid: false }
  }

  /**
   * Create a Stripe Checkout Session for activating an invite-only letter.
   *
   * POST /letters/:slug/checkout
   * Body: { token } (letter edit token for auth)
   */
  async createCheckout ({ request, params }) {
    const { token } = request.only(['token'])

    const letter = await Letter.query()
      .where('slug', params.slug)
      .where('letter_type', 'invite_only')
      .first()

    if (!letter) {
      return { error: { code: 404, message: 'Letter not found or is not invite-only' } }
    }

    if (token !== letter.token) {
      return { error: { code: 403, message: 'Unauthorized: Invalid token' } }
    }

    if (letter.is_paid) {
      return { error: { code: 400, message: 'This letter has already been activated' } }
    }

    const stripe = getStripe()
    const frontendUrl = process.env.FRONTEND_URL || 'https://openletter.earth'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Invitation-Only Open Letter',
              description: `Activate invite-only signing for: ${letter.title}`,
            },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        letter_slug: letter.slug,
        letter_id: String(letter.id),
      },
      success_url: `${frontendUrl}/${letter.slug}/manage?token=${letter.token}&payment=success`,
      cancel_url: `${frontendUrl}/${letter.slug}?payment=cancelled`,
    })

    // Store session ID on the letter
    letter.stripe_session_id = session.id
    await letter.save()

    return { checkout_url: session.url }
  }

  /**
   * Stripe webhook handler.
   * Listens for checkout.session.completed to activate invite-only letters.
   *
   * POST /webhooks/stripe
   *
   * Note: signature verification requires STRIPE_WEBHOOK_SECRET.
   * Without it, we accept the event but verify payment via the Stripe API as a safety check.
   */
  async webhook ({ request, response }) {
    const event = request.post()

    // Optional signature verification
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (endpointSecret) {
      const sig = request.header('stripe-signature')
      // If webhook secret is set but we can't verify (no raw body access in Adonis v4),
      // we fall through to API-based verification below
      if (!sig) {
        return response.status(400).json({ error: 'Missing stripe-signature header' })
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object
      const letterSlug = session?.metadata?.letter_slug

      if (letterSlug && session?.id) {
        // Double-check with Stripe API that payment actually went through
        const stripe = getStripe()
        const verified = await stripe.checkout.sessions.retrieve(session.id)

        if (verified.payment_status === 'paid') {
          const affected = await Letter.query()
            .where('slug', letterSlug)
            .where('letter_type', 'invite_only')
            .update({
              is_paid: true,
              stripe_session_id: session.id,
            })

          console.log(`>>> Stripe webhook: activated invite-only letter "${letterSlug}" (${affected} rows)`)
        } else {
          console.warn(`>>> Stripe webhook: session ${session.id} not paid yet`)
        }
      }
    }

    return response.status(200).json({ received: true })
  }
}

module.exports = StripeController
