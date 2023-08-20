const {Fido2Lib} = require("fido2-lib");
const crypto = require('crypto');
const {arrayBufferToBase64, base64ToArrayBuffer, toArrayBuffer} = require('../utils/converters');

const inMemoryDB = new Map();
const users = new Map();

const f2l = new Fido2Lib({
    timeout: 60000,
    rpId: "desktop-iet34cq.local",
    rpName: "WebAuthn",
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7],
    authenticatorAttachment: "platform"
});

async function registerStart(req, res) {
    try {
        const registrationOptions = await f2l.attestationOptions();
        registrationOptions.user.id = crypto.randomBytes(16).toString('base64');
        registrationOptions.user.name = req.body.username;
        registrationOptions.user.displayName = req.body.username;

        users.set(registrationOptions.user.name, registrationOptions.user.id);

        registrationOptions.challenge = arrayBufferToBase64(registrationOptions.challenge);
        req.session.challenge = registrationOptions.challenge;

        res.json({publicKey: registrationOptions});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error starting registration: " + error.message);
    }
}

async function registerFinish(req, res) {
    try {
        const {username, publicKeyCredential} = req.body;

        const attestationExpectations = {
            challenge: base64ToArrayBuffer(req.session.challenge),
            origin: "https://desktop-iet34cq.local",
            factor: "either"
        };

        publicKeyCredential.rawId = toArrayBuffer(publicKeyCredential.rawId);
        publicKeyCredential.response.clientDataJSON = toArrayBuffer(publicKeyCredential.response.clientDataJSON);
        publicKeyCredential.response.attestationObject = toArrayBuffer(publicKeyCredential.response.attestationObject);

        const regResult = await f2l.attestationResult(publicKeyCredential, attestationExpectations);

        inMemoryDB.set(username, {
            publicKey: regResult.authnrData.get('credentialPublicKeyPem'),
            counter: regResult.authnrData.get("counter")
        });

        delete req.session.challenge;

        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error completing registration: " + error.message);
    }
}

async function loginStart(req, res) {
    try {
        const authnOptions = await f2l.assertionOptions();

        authnOptions.challenge = arrayBufferToBase64(authnOptions.challenge);
        req.session.challenge = authnOptions.challenge;

        res.json({options: authnOptions});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error starting authentication: " + error.message);
    }
}

async function loginFinish(req, res) {
    try {
        const {username, publicKeyCredential} = req.body;

        const userInfo = inMemoryDB.get(username);

        const assertionExpectations = {
            challenge: base64ToArrayBuffer(req.session.challenge),
            origin: "https://desktop-iet34cq.local",
            factor: "either",
            publicKey: userInfo.publicKey,
            prevCounter: userInfo.counter,
            userHandle: users.get(username)
        };

        publicKeyCredential.rawId = toArrayBuffer(publicKeyCredential.rawId);
        publicKeyCredential.response.clientDataJSON = toArrayBuffer(publicKeyCredential.response.clientDataJSON);
        publicKeyCredential.response.authenticatorData = toArrayBuffer(publicKeyCredential.response.authenticatorData);
        publicKeyCredential.response.signature = toArrayBuffer(publicKeyCredential.response.signature);
        publicKeyCredential.response.userHandle = toArrayBuffer(publicKeyCredential.response.userHandle);

        const authnResult = await f2l.assertionResult(publicKeyCredential, assertionExpectations);

        userInfo.counter = authnResult.authnrData.get('counter');
        req.session.isAuthenticated = true;
        req.session.username = username;

        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error completing authentication: " + error.message);
    }
}

module.exports = {
    registerStart,
    registerFinish,
    loginStart,
    loginFinish
};