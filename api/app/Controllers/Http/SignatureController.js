'use strict'
const Signature = use('App/Models/Signature');

class SignatureController {

  async confirm({request}) {
    console.log(">>> signature token", request.body.token);
    const signature = await Signature.findBy('token', request.body.token);    
    signature.is_verified = true;
    await signature.save();
    return signature.toJSON();
  }
}

module.exports = SignatureController
