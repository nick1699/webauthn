"use strict";
import { base64ToUint8Array } from './converters.js';

export async function startRegistration(username) {
    const response = await fetch('/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });

    const data = await response.json();
    const options = data.publicKey;

    options.challenge = base64ToUint8Array(options.challenge);
    options.user.id = Uint8Array.from(options.user.id, c => c.charCodeAt(0));

    try {
        const credential = await navigator.credentials.create({publicKey: options});
        return await finishRegistration(credential);
    } catch (error) {
        console.error(error);
        return { success: false };
    }
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

    const response = await fetch('/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKeyCredential })
    });

    return await response.json();
}
