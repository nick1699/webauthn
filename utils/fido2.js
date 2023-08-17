const { Fido2Lib } = require("fido2-lib");
const crypto = require('crypto');
const { arrayBufferToBase64, base64ToArrayBuffer, toArrayBuffer } = require('./converters');

const f2l = new Fido2Lib({
    timeout: 60000,
    rpId: "localhost",
    rpName: "WebAuthn",
    rpIcon: "https://example.com/logo.png",
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7],
    authenticatorAttachment: "platform"
});

async function registerStart(req, res) {
    try {
        const registrationOptions = await f2l.attestationOptions();
        registrationOptions.user.id = crypto.randomBytes(16).toString('utf-8');
        registrationOptions.user.name = req.body.username;
        registrationOptions.user.displayName = req.body.username;

        registrationOptions.challenge = arrayBufferToBase64(registrationOptions.challenge);
        req.session.challenge = registrationOptions.challenge;

        res.json({ publicKey: registrationOptions });
    } catch (error) {
        res.status(500).send("Error starting registration: " + error.message);
    }
}

async function registerFinish(req, res) {
    try {
        const {publicKeyCredential} = req.body;

        const attestationExpectations = {
            challenge: base64ToArrayBuffer(req.session.challenge),
            // TODO https
            origin: "http://localhost:3000",
            factor: "either"
        };

        publicKeyCredential.rawId = toArrayBuffer(publicKeyCredential.rawId);
        publicKeyCredential.response.clientDataJSON = toArrayBuffer(publicKeyCredential.response.clientDataJSON);
        publicKeyCredential.response.attestationObject = toArrayBuffer(publicKeyCredential.response.attestationObject);

        const regResult = await f2l.attestationResult(publicKeyCredential, attestationExpectations);

        // TODO Datenhaltung implementieren ggf. wird Benutzername benötigt
        // TODO clear challange
        // https://github.com/webauthn-open-source/fido2-lib

        res.json({ success: true });
    } catch (error) {
        res.status(500).send("Error completing registration: " + error.message);
    }
}

module.exports = {
    registerStart,
    registerFinish
};