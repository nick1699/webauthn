"use strict";
import { startRegistration } from './authService.js';

document.getElementById('register-button').addEventListener('click', () => {
    handleRegistration();
});

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