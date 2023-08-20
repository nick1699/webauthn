"use strict";
import {base64ToUint8Array} from './converters.js';

export async function startRegistration(username) {
    const response = await fetch('/rest/register/start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    });

    const data = await response.json();
    const options = data.publicKey;

    options.challenge = base64ToUint8Array(options.challenge);
    options.user.id = base64ToUint8Array(options.user.id);

    try {
        const credential = await navigator.credentials.create({publicKey: options});
        return await finishRegistration(username, credential);
    } catch (error) {
        console.error(error);
        return {success: false};
    }
}

async function finishRegistration(username, credential) {
    const publicKeyCredential = {
        id: credential.id,
        type: credential.type,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
        }
    };

    const response = await fetch('/rest/register/finish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, publicKeyCredential})
    });

    return await response.json();
}

export async function startAuthentication(username) {
    const response = await fetch('/rest/login/start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    });

    const data = await response.json();
    const options = data.options;

    options.challenge = base64ToUint8Array(options.challenge);

    try {
        const credential = await navigator.credentials.get({publicKey: options});
        return await finishAuthentication(username, credential);
    } catch (error) {
        console.error(error);
        return {success: false};
    }
}

async function finishAuthentication(username, credential) {
    const publicKeyCredential = {
        id: credential.id,
        type: credential.type,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
            signature: Array.from(new Uint8Array(credential.response.signature)),
            userHandle: Array.from(new Uint8Array(credential.response.userHandle))
        }
    };

    const response = await fetch('/rest/login/finish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, publicKeyCredential})
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.statusText}`);
    }

    return await response.json();
}