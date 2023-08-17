"use strict";
async function startRegistration(username) {
    const response = await fetch('/register-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });

    const data = await response.json();
    const options = data.publicKey;

    // Konvertieren Sie die Base64-kodierte Challenge in ein Uint8Array
    options.challenge = base64ToUint8Array(options.challenge);

    console.log(options.challenge)

    // Konvertieren Sie die Base64-kodierte User-ID in ein Uint8Array
    options.user.id = Uint8Array.from(options.user.id, c => c.charCodeAt(0));

    const credential = await navigator.credentials.create({ publicKey: options });
    console.log(credential)

    return await finishRegistration(credential);
}

async function finishRegistration(credential) {
    const publicKeyCredential = {
        id: credential.id,
        type: credential.type,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
        }
    };

    const response = await fetch('/register-finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKeyCredential
        })
    });

    return await response.json();
}

document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    await startRegistration(username);
    // console.log(result);
});

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}