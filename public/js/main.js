"use strict";
import {startAuthentication, startRegistration} from './authService.js';

document.getElementById('register-button').addEventListener('click', handleRegistration);
document.getElementById('login-button').addEventListener('click', handleAuthentication);

async function handleRegistration() {
    const username = document.getElementById('username').value;

    const result = await startRegistration(username);

    if (result.success) {
        document.getElementById('statusMessage').textContent = "Registrierung erfolgreich!";
        document.getElementById('statusMessage').style.color = "green";
    } else {
        document.getElementById('statusMessage').textContent = "Registrierung fehlgeschlagen!";
        document.getElementById('statusMessage').style.color = "red";
    }
}

async function handleAuthentication() {
    const username = document.getElementById('username').value;

    const result = await startAuthentication(username);

    if (result.success) {
        document.getElementById('statusMessage').textContent = "Anmeldung erfolgreich!";
        document.getElementById('statusMessage').style.color = "green";
    } else {
        document.getElementById('statusMessage').textContent = "Anmeldung fehlgeschlagen!";
        document.getElementById('statusMessage').style.color = "red";
    }
}