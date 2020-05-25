"use strict";
const crypto = use("crypto");
const Mail = use("Mail");
const Letter = use("App/Models/Letter");
const User = use("App/Models/User");
const acceptLanguageParser = use("accept-language-parser");

class LetterController {
  async index() {
    return await Letter.query()
      .with("signatures")
      .setHidden(["text", "updated_at"])
      .orderBy("id", "desc")
      .limit(10)
      .fetch();
  }

  async get(ctx) {
    const resultSet = await Letter.query()
      .whereSlug(ctx.params.slug)
      .with("signatures", (builder) => {
        builder.where("is_verified", true);
        builder.orderBy("id", "asc");
      })
      .with("parentLetter", (builder) => {
        // builder.select('slug', 'title')
      })
      .with("updates")
      .fetch();

    const request = ctx.request.only(["locale"]);
    const locale =
      request.locale ||
      acceptLanguageParser.pick(
        ["en", "fr", "nl"],
        ctx.request.headers()["accept-language"],
        { loose: true }
      ) ||
      "en";
    console.log("GET", ctx.params.slug, locale);
    let res;
    if (resultSet.rows.length > 1) {
      const letters = resultSet.rows;

      let index = 0;
      const signatures = [];
      const locales = [];
      letters.map((l, i) => {
        const letter = l.toJSON();
        letter.signatures.map((s) => signatures.push(s));
        locales.push(letter.locale);
        if (letter.locale === locale) index = i;
      });

      signatures.sort((a, b) => {
        return a.created_at < b.created_at ? -1 : 1;
      });

      res = letters[index].toJSON();
      res.signatures = signatures;
      res.locales = locales;
      res.type = res.parent_letter_id ? "update" : "letter";
      if (res.updates) {
        res.updates = res.updates.filter((u) => u.locale === locale);
      }
      return res;
    }

    if (resultSet.rows.length == 1) {
      res = resultSet.rows[0].toJSON();
      res.locales = [res.locale];
      res.type = res.parent_letter_id ? "update" : "letter";
      console.log(">>> return", res);
      return res;
    } else {
      return { error: { code: 404, message: "not found" } };
    }
  }

  async create({ request }) {
    const formData = request.only(["letters"]);
    console.log(">>> LetterController.create", formData);
    let user = {};
    if (formData.letters[0].email) {
      try {
        user = await User.findOrCreate(
          { email: formData.letters[0].email },
          {
            email: formData.letters[0].email,
          }
        );
      } catch (e) {
        console.error(e);
      }
    }

    let letters;
    try {
      letters = await Letter.createWithLocales(formData.letters, {
        image: formData.letters[0].image,
        user_id: user && user.id,
      });
    } catch (e) {
      console.error("error", e);
    }

    if (formData.letters[0].email) {
      const locale =
        acceptLanguageParser.pick(
          ["en", "fr", "nl"],
          request.headers()["accept-language"],
          { loose: true }
        ) || "en";

      const subject = {
        en: "KEEP: Link to post updates to your open letter",
        nl: "KEEP: Link to post updates to your open letter",
        fr: "A GARDER: Lien pour poster une mise à jour à votre lettre ouverte",
      };

      console.log(">>> send email confirmation for locale", locale);

      try {
        await Mail.send(
          `emails.${locale}.link_to_edit_openletter`,
          { letter: letters[0] },
          (message) => {
            message
              .to(formData.letters[0].email)
              .from("support@openletter.earth")
              .subject(subject[locale]);
          }
        );
      } catch (e) {
        console.error("error", e);
      }
      console.log(">>> email sent");
    }
    return letters[0].toJSON();
  }

  /**
   * Post an update to an existing open letter
   * @param {*} param0
   */
  async update({ request }) {
    const formData = request.only(["letters", "parent_letter_id", "token"]);
    console.log(">>> LetterController.update", formData);

    const parentLetter = await Letter.find(formData.parent_letter_id);

    if (formData.token !== parentLetter.token) {
      return { error: { code: 403, message: "Unauthorized: Invalid token" } };
    }

    let updates;
    try {
      updates = await Letter.createWithLocales(formData.letters, {
        parent_letter_id: parentLetter.id,
        user_id: parentLetter.user_id,
      });
    } catch (e) {
      console.error("error", e);
    }

    const subscribersByLocale = await parentLetter.getSubscribersByLocale();
    await Promise.all(
      updates.map(async (letter) => {
        const subscribers = subscribersByLocale[letter.locale];
        const emailData = {
          letter: letter.toJSON(),
          parentLetter: parentLetter.toJSON(),
        };
        console.log(
          ">>> sending",
          letter.locale,
          "to",
          subscribers.length,
          "subscribers",
          subscribers,
          emailData
        );

        subscribers.map(async (email) => {
          try {
            await Mail.send(`emails.update`, emailData, (message) => {
              message
                .to(email)
                .from("support@openletter.earth")
                .subject(letter.title);
            });
          } catch (e) {
            console.error("error", e);
          }

          console.log(">>> email sent");
        });
      })
    );

    return updates[0].toJSON();
  }

  async sign({ request }) {
    const signatureData = request.only([
      "name",
      "occupation",
      "city",
      "organization",
      "share_email",
    ]);

    const letter = await Letter.query()
      .where("slug", request.params.slug)
      .where("locale", request.params.locale)
      .first();

    // We create the token based on the letter.id and request.body.email to make sure we can only have one signature per email address (without having to actually record the email address in our database)
    const tokenData = `${letter.id}-${request.body.email}-${process.env.APP_KEY}`;
    signatureData.token = crypto
      .createHash("md5")
      .update(tokenData)
      .digest("hex");
    if (signatureData.share_email) {
      signatureData.email = request.body.email;
    }
    delete signatureData.share_email;

    let signature;
    console.log(">>> Signature.create", signatureData);
    try {
      signature = await letter.signatures().create(signatureData);
    } catch (e) {
      if (e.constraint === "signatures_token_unique") {
        return {
          error: { code: 400, message: "you already signed this open letter" },
        };
      } else {
        console.error("error", e);
      }
    }

    const emailData = {
      letter: letter.toJSON(),
      signature: signature.toJSON(),
      env: process.env,
    };
    emailData.signature.token = signature.token;
    const locale =
      acceptLanguageParser.pick(
        ["en", "fr", "nl"],
        request.headers()["accept-language"],
        { loose: true }
      ) || "en";

    const subject = {
      en: "ACTION REQUIRED: Please confirm your signature on this open letter",
      nl: "ACTIE VEREIST: Bevestig uw handtekening onder deze open brief",
      fr:
        "ACTION REQUISE: Veuillez confirmer votre signature sur cette lettre ouverte",
    };

    console.log(">>> send email confirmation for locale", locale);

    try {
      await Mail.send(
        `emails.${locale}.confirm_signature`,
        emailData,
        (message) => {
          message
            .to(request.body.email)
            .from("support@openletter.earth")
            .subject(subject[locale]);
        }
      );
    } catch (e) {
      console.error("error", e);
    }
    console.log(">>> email sent");
    return true;
  }
}

module.exports = LetterController;
