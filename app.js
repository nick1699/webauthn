const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Fido2Lib } = require("fido2-lib");

const app = express();
app.use(bodyParser.json());
app.use(session({
    secret: 'khiu6dEHGIHIUz)U2h7zt7tv$a4dt5e5tzh',
    resave: false,
    saveUninitialized: true
}));

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

app.post('/register-start', async (req, res) => {
    const registrationOptions = await f2l.attestationOptions();
    registrationOptions.user.id = crypto.randomBytes(16).toString('utf-8');
    registrationOptions.user.name = req.body.username;
    registrationOptions.user.displayName = req.body.username;

    console.log(registrationOptions.challenge);

    registrationOptions.challenge = arrayBufferToBase64(registrationOptions.challenge)
    req.session.challenge = registrationOptions.challenge;

    res.json({
        publicKey: registrationOptions
    });
});

app.post('/register-finish', async (req, res) => {
    const {publicKeyCredential} = req.body;

    const attestationExpectations = {
        challenge: base64ToArrayBuffer(req.session.challenge),
        origin: "http://localhost:3000",
        factor: "either"
    };

    publicKeyCredential.rawId = toArrayBuffer(publicKeyCredential.rawId);
    publicKeyCredential.response.clientDataJSON = toArrayBuffer(publicKeyCredential.response.clientDataJSON);
    publicKeyCredential.response.attestationObject = toArrayBuffer(publicKeyCredential.response.attestationObject);

    const utf8Decoder = new TextDecoder('utf-8');
    const decodedClientData = utf8Decoder.decode(publicKeyCredential.response.clientDataJSON)
    const clientDataObj = JSON.parse(decodedClientData);
    console.log(base64ToArrayBuffer(clientDataObj.challenge));

    // TODO catch error
    const regResult = await f2l.attestationResult(publicKeyCredential, attestationExpectations); // will throw on error
    console.log(regResult);

    res.json({success: true});
});

function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64) {
    const binaryString = Buffer.from(base64, 'base64').toString('binary');
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function toArrayBuffer(byteArray) {
    let buffer = new ArrayBuffer(byteArray.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < byteArray.length; i++) {
        view[i] = byteArray[i];
    }
    return buffer;
}

// Statische Dateien aus dem "public"-Verzeichnis bedienen
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server running on port 3000: http://localhost:3000');
});