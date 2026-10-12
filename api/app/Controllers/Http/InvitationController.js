'use strict'

const crypto = use('crypto')
const Letter = use('App/Models/Letter')
const Invitation = use('App/Models/Invitation')
const { sendEmail } = use('App/Libs/email')

class InvitationController {
  /**
   * Create invitation(s) for a letter.
   * Can be called by the letter creator (with letter token) or by an invitee (with invite_token).
   *
   * Body: { token?, invite_token?, emails: ["a@b.com"] }
   */
  async create ({ request, params }) {
    const { token, invite_token, emails } = request.only(['token', 'invite_token', 'emails'])

    // Find the letter (any locale version, we just need the slug-level settings)
    const letter = await Letter.query()
      .where('slug', params.slug)
      .where('letter_type', 'invite_only')
      .first()

    if (!letter) {
      return { error: { code: 404, message: 'Letter not found or is not invite-only' } }
    }

    if (!letter.is_paid) {
      return { error: { code: 402, message: 'Payment required to activate invitations' } }
    }

    let parentInvitation = null
    let generation = 0
    let invitesPerPerson = letter.invites_per_person

    if (invite_token) {
      // Invitee creating sub-invitations
      parentInvitation = await Invitation.query()
        .where('token', invite_token)
        .where('letter_id', letter.id)
        .first()

      if (!parentInvitation) {
        return { error: { code: 403, message: 'Invalid invitation token' } }
      }

      if (!parentInvitation.used_at) {
        return { error: { code: 403, message: 'You must sign the letter before inviting others' } }
      }

      // Check if chain invites are allowed
      if (!letter.allow_chain_invites && parentInvitation.generation > 0) {
        return { error: { code: 403, message: 'Chain invitations are not allowed for this letter' } }
      }

      if (parentInvitation.invites_remaining <= 0) {
        return { error: { code: 403, message: 'No invitations remaining' } }
      }

      generation = parentInvitation.generation + 1
    } else if (token) {
      // Letter creator
      if (token !== letter.token) {
        return { error: { code: 403, message: 'Unauthorized: Invalid token' } }
      }
    } else {
      return { error: { code: 400, message: 'Either token or invite_token is required' } }
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return { error: { code: 400, message: 'At least one email address is required' } }
    }

    // Limit batch size
    const emailsToInvite = emails.slice(0, parentInvitation
      ? Math.min(emails.length, parentInvitation.invites_remaining)
      : 50
    )

    const created = []
    for (const email of emailsToInvite) {
      // Check if already invited
      const existing = await Invitation.query()
        .where('letter_id', letter.id)
        .where('email', email.toLowerCase())
        .first()

      if (existing) continue

      const inviteToken = crypto.randomBytes(24).toString('hex')

      const invitation = await Invitation.create({
        letter_id: letter.id,
        token: inviteToken,
        email: email.toLowerCase(),
        invited_by: parentInvitation ? parentInvitation.id : null,
        generation,
        invites_remaining: invitesPerPerson,
      })

      // Send invite email
      try {
        await sendEmail(
          email.toLowerCase(),
          `You're invited to sign: ${letter.title}`,
          'emails.en.invitation',
          {
            letter: letter.toJSON(),
            inviteUrl: `${process.env.FRONTEND_URL || 'https://openletter.earth'}/${letter.slug}?invite=${inviteToken}`,
            env: process.env,
          }
        )
      } catch (e) {
        console.error('Failed to send invite email to', email, e)
      }

      created.push({
        id: invitation.id,
        email: invitation.email,
        invite_url: `${process.env.FRONTEND_URL || 'https://openletter.earth'}/${letter.slug}?invite=${inviteToken}`,
        generation: invitation.generation,
      })
    }

    // Decrement parent invitation's remaining count
    if (parentInvitation) {
      parentInvitation.invites_remaining -= created.length
      await parentInvitation.save()
    }

    return { invitations: created }
  }

  /**
   * List all invitations for a letter (creator only, requires letter token).
   */
  async list ({ request, params }) {
    const { token } = request.only(['token'])

    const letter = await Letter.query()
      .where('slug', params.slug)
      .first()

    if (!letter) {
      return { error: { code: 404, message: 'Letter not found' } }
    }

    if (token !== letter.token) {
      return { error: { code: 403, message: 'Unauthorized: Invalid token' } }
    }

    const invitations = await Invitation.query()
      .where('letter_id', letter.id)
      .with('signature')
      .orderBy('created_at', 'asc')
      .fetch()

    return {
      invitations: invitations.toJSON().map(inv => ({
        id: inv.id,
        email: inv.email,
        generation: inv.generation,
        invited_by: inv.invited_by,
        invites_remaining: inv.invites_remaining,
        used_at: inv.used_at,
        signature: inv.signature,
        created_at: inv.created_at,
      })),
    }
  }

  /**
   * Validate an invite token (public endpoint).
   * Returns letter info if valid.
   */
  async validate ({ params }) {
    const invitation = await Invitation.query()
      .where('token', params.token)
      .with('letter')
      .first()

    if (!invitation) {
      return { error: { code: 404, message: 'Invalid invitation' } }
    }

    if (invitation.used_at) {
      return { error: { code: 400, message: 'This invitation has already been used' } }
    }

    const letter = invitation.getRelated('letter')

    return {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        generation: invitation.generation,
        invites_remaining: invitation.invites_remaining,
      },
      letter: {
        slug: letter.slug,
        title: letter.title,
      },
    }
  }
}

module.exports = InvitationController
